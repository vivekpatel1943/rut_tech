from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


# ==========================================
# Revision Item Schemas
# ==========================================

class RevisionItemBase(BaseModel):
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    problem_url: str = Field(..., min_length=1)
    platform: Optional[str] = Field(default=None, max_length=50)
    solved_at: Optional[datetime] = None
    next_revision_at: Optional[datetime] = Field(
        default=None,
        description="Optional custom next revision timestamp; defaults to +7 days if omitted.",
    )


class RevisionItemCreate(RevisionItemBase):
    group_id: UUID


class RevisionItemUpdate(BaseModel):
    group_id: Optional[UUID] = None
    title: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    problem_url: Optional[str] = Field(default=None, min_length=1)
    platform: Optional[str] = Field(default=None, max_length=50)
    solved_at: Optional[datetime] = None
    last_revised_at: Optional[datetime] = None
    next_revision_at: Optional[datetime] = None


class RevisionItemReviseRequest(BaseModel):
    next_revision_at: Optional[datetime] = Field(
        default=None,
        description="If provided by the UI, sets the next revision date; otherwise defaults to 1 week from now.",
    )
    description: Optional[str] = Field(
        default=None,
        description="Optionally update personal notes during revision.",
    )


class RevisionItemResponse(BaseModel):
    id: UUID
    group_id: UUID
    title: Optional[str]
    description: Optional[str]
    problem_url: str
    platform: Optional[str]
    solved_at: Optional[datetime]
    last_revised_at: Optional[datetime]
    next_revision_at: Optional[datetime]
    revision_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Revision Group Schemas
# ==========================================

class RevisionGroupCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class RevisionGroupUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class RevisionGroupResponse(BaseModel):
    id: UUID
    name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RevisionGroupWithItemsResponse(RevisionGroupResponse):
    items: list[RevisionItemResponse] = []

