from datetime import datetime, timedelta, timezone
from typing import Optional, Sequence
from uuid import UUID
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.logging import logger
from app.features.revisions.models import RevisionGroup, RevisionItem
from app.features.revisions.schemas import (
    RevisionGroupCreate,
    RevisionGroupUpdate,
    RevisionItemCreate,
    RevisionItemReviseRequest,
    RevisionItemUpdate,
)

DEFAULT_REVISION_INTERVAL = timedelta(days=7)


# ==========================================
# Revision Group Service Functions
# ==========================================

async def create_group(
    db: AsyncSession, payload: RevisionGroupCreate
) -> RevisionGroup:
    try:
        group = RevisionGroup(name=payload.name)
        db.add(group)
        await db.commit()
        await db.refresh(group)
        return group
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error(f"Error creating revision group: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create revision group.",
        ) from exc


async def get_groups(db: AsyncSession) -> Sequence[RevisionGroup]:
    try:
        stmt = select(RevisionGroup).order_by(RevisionGroup.created_at.desc())
        result = await db.execute(stmt)
        return result.scalars().all()
    except SQLAlchemyError as exc:
        logger.error(f"Error fetching revision groups: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch revision groups.",
        ) from exc


async def get_group_by_id(
    db: AsyncSession, group_id: UUID, include_items: bool = False
) -> RevisionGroup:
    try:
        stmt = select(RevisionGroup).where(RevisionGroup.id == group_id)
        if include_items:
            stmt = stmt.options(selectinload(RevisionGroup.items))
        result = await db.execute(stmt)
        group = result.scalar_one_or_none()
        if not group:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Revision group with id {group_id} not found.",
            )
        return group
    except SQLAlchemyError as exc:
        logger.error(f"Error fetching revision group {group_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching revision group.",
        ) from exc


async def update_group(
    db: AsyncSession, group_id: UUID, payload: RevisionGroupUpdate
) -> RevisionGroup:
    group = await get_group_by_id(db, group_id)
    try:
        group.name = payload.name
        await db.commit()
        await db.refresh(group)
        return group
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error(f"Error updating revision group {group_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update revision group.",
        ) from exc


async def delete_group(db: AsyncSession, group_id: UUID) -> None:
    group = await get_group_by_id(db, group_id)
    try:
        await db.delete(group)
        await db.commit()
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error(f"Error deleting revision group {group_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete revision group.",
        ) from exc


# ==========================================
# Revision Item Service Functions
# ==========================================

async def create_item(
    db: AsyncSession, payload: RevisionItemCreate
) -> RevisionItem:
    # Ensure parent group exists first
    await get_group_by_id(db, payload.group_id)

    now = datetime.now(timezone.utc)
    next_revision = payload.next_revision_at or (now + DEFAULT_REVISION_INTERVAL)
    solved_at = payload.solved_at or now

    try:
        item = RevisionItem(
            group_id=payload.group_id,
            title=payload.title,
            description=payload.description,
            problem_url=payload.problem_url,
            platform=payload.platform,
            solved_at=solved_at,
            next_revision_at=next_revision,
            revision_count=0,
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)
        return item
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error(f"Error creating revision item: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create revision item.",
        ) from exc


async def get_items(
    db: AsyncSession,
    group_id: Optional[UUID] = None,
    due_only: bool = False,
) -> Sequence[RevisionItem]:
    try:
        stmt = select(RevisionItem)
        if group_id is not None:
            stmt = stmt.where(RevisionItem.group_id == group_id)
        if due_only:
            now = datetime.now(timezone.utc)
            stmt = stmt.where(RevisionItem.next_revision_at <= now)

        stmt = stmt.order_by(RevisionItem.next_revision_at.asc().nulls_last())
        result = await db.execute(stmt)
        return result.scalars().all()
    except SQLAlchemyError as exc:
        logger.error(f"Error fetching revision items: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch revision items.",
        ) from exc


async def get_item_by_id(db: AsyncSession, item_id: UUID) -> RevisionItem:
    try:
        stmt = select(RevisionItem).where(RevisionItem.id == item_id)
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Revision item with id {item_id} not found.",
            )
        return item
    except SQLAlchemyError as exc:
        logger.error(f"Error fetching revision item {item_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching revision item.",
        ) from exc


async def update_item(
    db: AsyncSession, item_id: UUID, payload: RevisionItemUpdate
) -> RevisionItem:
    item = await get_item_by_id(db, item_id)
    update_data = payload.model_dump(exclude_unset=True)

    if "group_id" in update_data and update_data["group_id"] is not None:
        await get_group_by_id(db, update_data["group_id"])

    try:
        for field, value in update_data.items():
            setattr(item, field, value)

        await db.commit()
        await db.refresh(item)
        return item
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error(f"Error updating revision item {item_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update revision item.",
        ) from exc


async def mark_item_revised(
    db: AsyncSession, item_id: UUID, payload: RevisionItemReviseRequest
) -> RevisionItem:
    """
    Marks an item as revised:
    - Updates `last_revised_at` to current UTC timestamp
    - Increments `revision_count` by 1
    - Sets `next_revision_at` to user's chosen date (if provided) or +7 days from now
    """
    item = await get_item_by_id(db, item_id)
    now = datetime.now(timezone.utc)

    try:
        item.last_revised_at = now
        item.revision_count += 1
        item.next_revision_at = payload.next_revision_at or (
            now + DEFAULT_REVISION_INTERVAL
        )
        if payload.description is not None:
            item.description = payload.description

        await db.commit()
        await db.refresh(item)
        return item
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error(f"Error marking revision item {item_id} as revised: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to mark revision item as revised.",
        ) from exc


async def delete_item(db: AsyncSession, item_id: UUID) -> None:
    item = await get_item_by_id(db, item_id)
    try:
        await db.delete(item)
        await db.commit()
    except SQLAlchemyError as exc:
        await db.rollback()
        logger.error(f"Error deleting revision item {item_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete revision item.",
        ) from exc

