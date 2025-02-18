from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional, Dict, Any, Union, Literal
from datetime import datetime, timezone
from sqlalchemy import Column, ARRAY, Text, JSON, Integer, UniqueConstraint, String, Enum, DateTime
from pydantic import BaseModel, model_validator
import enum

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
    documents: List["Document"] = Relationship(back_populates="user")


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
    description: str
    type: str = Field(
        sa_column=Column(Enum(
            'int', 
            'str', 
            'List[str]', 
            'List[Dict[str, any]]', 
            name="scheme_type"
        )),
        description="Type of classification scheme"
    )
    scale_min: Optional[int] = Field(default=0)
    scale_max: Optional[int] = Field(default=10)
    is_set_of_labels: Optional[bool] = Field(default=False)
    max_labels: Optional[int] = Field(default=None)
    labels: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String)))
    dict_keys: Optional[List[Dict[str, str]]] = Field(default=None, sa_column=Column(JSON))
    model_instructions: Optional[str] = Field(None)
    validation_rules: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))


class ClassificationScheme(ClassificationSchemeBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspace.uid")
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    workspace: Optional["Workspace"] = Relationship(back_populates="classification_schemes")
    classification_results: List["ClassificationResult"] = Relationship(back_populates="scheme")
    type: str = Field(sa_column=Column(Enum(
        'int',
        'str',
        'List[str]',  
        'List[Dict[str, any]]',
        name="scheme_type"
    )))
    scale_min: Optional[int] = Field(default=0)
    scale_max: Optional[int] = Field(default=10)
    labels: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(String), nullable=True))
    dict_keys: Optional[List[Dict[str, str]]] = Field(default=None, sa_column=Column(JSON))


class ClassificationSchemeCreate(ClassificationSchemeBase):
    pass


class ClassificationSchemeUpdate(ClassificationSchemeBase):
    pass


class ClassificationSchemeRead(ClassificationSchemeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    classification_count: Optional[int] = None
    document_count: Optional[int] = None


class ClassificationSchemesOut(SQLModel):
    data: List[ClassificationSchemeRead]
    count: int


class FileBase(SQLModel):
    name: str
    filetype: Optional[str] = None
    size: Optional[int] = None
    url: Optional[str] = None
    caption: Optional[str] = None
    media_type: Optional[str] = Field(default=None, sa_column=Column(Text))  # 'image', 'document', etc
    top_image: Optional[str] = Field(default=None, sa_column=Column(Text))


class File(FileBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    document_id: Optional[int] = Field(default=None, foreign_key="document.id")
    document: Optional["Document"] = Relationship(back_populates="files")


class FileRead(FileBase):
    id: int
    document_id: int


class DocumentBase(SQLModel):
    title: str
    url: Optional[str] = None
    content_type: Optional[str] = 'article'
    source: Optional[str] = None
    top_image: Optional[str] = None
    text_content: Optional[str] = None
    summary: Optional[str] = None
    insertion_date: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True))
    )
    # Using List[FileRead] causes a ValueError: <class 'list'> has no matching SQLAlchemy type
    # https://github.com/tiangolo/sqlmodel/issues/179
    # so instead, we define the relationship on the File model
    # and access the files through the Document.files relationship


class Document(DocumentBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    insertion_date: datetime = Field(default_factory=datetime.utcnow)
    workspace_id: int = Field(foreign_key="workspace.uid")
    user_id: int = Field(foreign_key="user.id")

    workspace: Optional["Workspace"] = Relationship(back_populates="documents")
    user: Optional["User"] = Relationship(back_populates="documents")
    files: List["File"] = Relationship(back_populates="document")
    classification_results: List["ClassificationResult"] = Relationship(back_populates="document")


class DocumentCreate(DocumentBase):
    workspace_id: Optional[int] = None
    insertion_date: Optional[datetime] = None


class DocumentRead(DocumentBase):
    id: int
    insertion_date: datetime
    workspace_id: int
    user_id: int
    files: List["FileRead"] = []


class DocumentUpdate(DocumentBase):
    pass


class DocumentsOut(SQLModel):
    data: List[DocumentRead]
    count: int


class WorkspaceBase(SQLModel):
    name: str
    description: Optional[str] = None
    sources: Optional[List[str]] = Field(default=None, sa_column=Column(ARRAY(Text)))
    icon: Optional[str] = None


class Workspace(WorkspaceBase, table=True):
    uid: Optional[int] = Field(default=None, primary_key=True)
    user_id_ownership: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    owner: Optional[User] = Relationship(back_populates="workspaces")
    classification_schemes: List["ClassificationScheme"] = Relationship(back_populates="workspace")
    documents: List["Document"] = Relationship(back_populates="workspace")


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


class ClassificationResultBase(SQLModel):
    document_id: int = Field(foreign_key="document.id")
    scheme_id: int = Field(foreign_key="classificationscheme.id")
    value: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    timestamp: datetime
    run_name: Optional[str] = None
    run_description: Optional[str] = None


class ClassificationResult(ClassificationResultBase, table=True):
    id: int = Field(default=None, primary_key=True)
    document: Document = Relationship(back_populates="classification_results")
    scheme: ClassificationScheme = Relationship(back_populates="classification_results")


class ClassificationResultRead(ClassificationResultBase):
    id: int
    document: DocumentRead
    scheme: ClassificationSchemeRead


class ClassificationResultCreate(SQLModel):
    document_id: int
    scheme_id: int
    value: Dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    timestamp: Optional[datetime] = None
    run_name: Optional[str] = None
    run_description: Optional[str] = None


class SavedResultSetBase(SQLModel):
    name: str
    document_ids: List[int] = Field(default=[], sa_column=Column(ARRAY(Integer)))
    scheme_ids: List[int] = Field(default=[], sa_column=Column(ARRAY(Integer)))


class SavedResultSet(SavedResultSetBase, table=True):
    id: int = Field(default=None, primary_key=True)
    workspace_id: int = Field(foreign_key="workspace.uid")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SavedResultSetCreate(SavedResultSetBase):
    pass


class SavedResultSetRead(SavedResultSetBase):
    id: int
    workspace_id: int
    created_at: datetime
    updated_at: datetime
    results: List["ClassificationResultRead"] = Field(default_factory=list)


class ClassificationResultQuery(SQLModel):
    document_ids: List[int] = Field(default=[])


class EnhancedClassificationResultRead(ClassificationResultRead):
    display_value: Union[float, str, Dict[str, Any], None] = Field(default=None)
    
    @model_validator(mode='before')
    def convert_value(cls, data: Any):
        if not isinstance(data, dict):
            return data
            
        scheme = data.get('scheme')
        value = data.get('value')
        
        if not scheme or not value:
            return data
            
        if scheme.type == 'int':
            # Check for binary classification (0-1 scale)
            if scheme.scale_min == 0 and scheme.scale_max == 1:
                data['display_value'] = 'True' if value > 0.5 else 'False'
            else:
                data['display_value'] = value
                
        elif scheme.type == 'List[str]':
            data['display_value'] = value
            
        elif scheme.type == 'str':
            data['display_value'] = value
            
        return data
