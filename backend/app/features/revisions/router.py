from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.features.revisions import service
from app.features.revisions.schemas import (
    RevisionGroupCreate,
    RevisionGroupResponse,
    RevisionGroupUpdate,
    RevisionGroupWithItemsResponse,
    RevisionItemCreate,
    RevisionItemResponse,
    RevisionItemReviseRequest,
    RevisionItemUpdate,
)

router = APIRouter(prefix="/revisions", tags=["Revisions"])


# ==========================================
# Revision Group Endpoints
# ==========================================

@router.post(
    "/groups",
    response_model=RevisionGroupResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_revision_group(
    payload: RevisionGroupCreate,
    db: AsyncSession = Depends(get_db),
):
    return await service.create_group(db, payload)


@router.get("/groups", response_model=list[RevisionGroupResponse])
async def list_revision_groups(
    db: AsyncSession = Depends(get_db),
):
    return await service.get_groups(db)


@router.get(
    "/groups/{group_id}",
    response_model=RevisionGroupWithItemsResponse,
)
async def get_revision_group(
    group_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await service.get_group_by_id(db, group_id, include_items=True)


@router.patch("/groups/{group_id}", response_model=RevisionGroupResponse)
async def update_revision_group(
    group_id: UUID,
    payload: RevisionGroupUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await service.update_group(db, group_id, payload)


@router.delete(
    "/groups/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_revision_group(
    group_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    await service.delete_group(db, group_id)


# ==========================================
# Revision Item Endpoints
# ==========================================

@router.post(
    "/items",
    response_model=RevisionItemResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_revision_item(
    payload: RevisionItemCreate,
    db: AsyncSession = Depends(get_db),
):
    return await service.create_item(db, payload)


@router.get("/items", response_model=list[RevisionItemResponse])
async def list_revision_items(
    group_id: Optional[UUID] = Query(default=None),
    due_only: bool = Query(default=False),
    db: AsyncSession = Depends(get_db),
):
    return await service.get_items(db, group_id=group_id, due_only=due_only)


@router.get("/items/{item_id}", response_model=RevisionItemResponse)
async def get_revision_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    return await service.get_item_by_id(db, item_id)


@router.patch("/items/{item_id}", response_model=RevisionItemResponse)
async def update_revision_item(
    item_id: UUID,
    payload: RevisionItemUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await service.update_item(db, item_id, payload)


@router.patch("/items/{item_id}/revise", response_model=RevisionItemResponse)
async def revise_item(
    item_id: UUID,
    payload: Optional[RevisionItemReviseRequest] = None,
    db: AsyncSession = Depends(get_db),
):
    req = payload or RevisionItemReviseRequest()
    return await service.mark_item_revised(db, item_id, req)


@router.delete(
    "/items/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_revision_item(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    await service.delete_item(db, item_id)

