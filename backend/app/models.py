from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy import Column, ARRAY, Text, JSON
from datetime import timezone


# Shared properties
# TODO replace email str with EmailStr when sqlmodel supports it
class UserBase(SQLModel):
    email: str = Field(unique=True, index=True)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = None


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str


# TODO replace email str with EmailStr when sqlmodel supports it
class UserCreateOpen(SQLModel):
    email: str
    password: str
    full_name: str | None = None


# Properties to receive via API on update, all are optional
# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdate(UserBase):
    email: str | None = None  # type: ignore
    password: str | None = None


# TODO replace email str with EmailStr when sqlmodel supports it
class UserUpdateMe(SQLModel):
    full_name: str | None = None
    email: str | None = None


class UpdatePassword(SQLModel):
    current_password: str
    new_password: str


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    hashed_password: str
    items: List["Item"] = Relationship(back_populates="owner")
    search_histories: List["SearchHistory"] = Relationship(back_populates="user")
    workspaces: List["Workspace"] = Relationship(back_populates="owner")


# Properties to return via API, id is always required
class UserOut(UserBase):
    id: int


class UsersOut(SQLModel):
    data: list[UserOut]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str
    description: str | None = None


# Properties to receive on item creation
class ItemCreate(ItemBase):
    title: str


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = None  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    owner_id: int | None = Field(default=None, foreign_key="user.id", nullable=False)
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemOut(ItemBase):
    id: int
    owner_id: int


class ItemsOut(SQLModel):
    data: list[ItemOut]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: int | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str


# New SearchHistory model
class SearchHistoryBase(SQLModel):
    query: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class SearchHistory(SearchHistoryBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="search_histories")


class SearchHistoryCreate(SearchHistoryBase):
    pass


class SearchHistoryRead(SearchHistoryBase):
    id: int
    user_id: int


class SearchHistoriesOut(SQLModel):
    data: List[SearchHistoryRead]
    count: int


class ClassificationSchemeBase(SQLModel):
    name: str
    description: Optional[str] = None
    type: str  # "minimal" or "comprehensive"
    expected_datatype: str
    prompt: Optional[str] = None
    input_text: Optional[str] = None
    field_annotations: Optional[List[str]] = Field(
        default=None, sa_column=Column(JSON)
    )
    model_annotations: Optional[str] = None


class ClassificationScheme(ClassificationSchemeBase, table=True):
    id: int = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspace.uid")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    workspace: Optional["Workspace"] = Relationship(
        back_populates="classification_schemes"
    )


class ClassificationSchemeCreate(ClassificationSchemeBase):
    pass


class ClassificationSchemeUpdate(ClassificationSchemeBase):
    pass


class ClassificationSchemeRead(ClassificationSchemeBase):
    id: int
    created_at: datetime
    updated_at: datetime


class ClassificationSchemesOut(SQLModel):
    data: List[ClassificationSchemeRead]
    count: int


class WorkspaceBase(SQLModel):
    name: str
    description: Optional[str] = None
    sources: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(Text)))


class Workspace(WorkspaceBase, table=True):
    uid: Optional[int] = Field(default=None, primary_key=True)
    user_id_ownership: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    owner: Optional[User] = Relationship(back_populates="workspaces")
    classification_schemes: List[ClassificationScheme] = Relationship(back_populates="workspace")


class WorkspaceCreate(WorkspaceBase):
    pass


class WorkspaceUpdate(WorkspaceBase):
    pass

class WorkspaceRead(WorkspaceBase):
    uid: int
    created_at: datetime
    updated_at: datetime

class WorkspacesOut(SQLModel):
    data: List[WorkspaceRead]
    count: int
