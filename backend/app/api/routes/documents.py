import logging
import io
import os
from typing import Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from sqlalchemy.orm import joinedload
from sqlmodel import Session, select
from pydantic import BaseModel
import fitz  

from app.models import Document, DocumentRead, DocumentUpdate, Workspace, User, File as FileModel, FileRead
from app.api.deps import SessionDep, CurrentUser
from app.core.config import settings
from minio import Minio
from minio.error import S3Error

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

router = APIRouter(prefix="/workspaces/{workspace_id}/documents")

# MinIO Client
class MinioClient:
    def __init__(self):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ROOT_USER,
            secret_key=settings.MINIO_ROOT_PASSWORD,
            secure=settings.MINIO_SECURE,
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logging.info(f"Bucket '{self.bucket_name}' created.")
        except S3Error as e:
            logging.error(f"Error creating bucket: {e}")
            raise HTTPException(
                status_code=500, detail="Failed to create bucket."
            )

    async def upload_file(self, file: UploadFile, object_name: str):
        try:
            file_content = await file.read()
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=io.BytesIO(file_content),
                length=len(file_content),
                content_type=file.content_type,
            )
            logging.info(f"File '{file.filename}' uploaded successfully to '{object_name}'.")
        except S3Error as e:
            logging.error(f"Error uploading file: {e}")
            raise HTTPException(
                status_code=500, detail="Failed to upload file."
            )
        except Exception as e:
            logging.error(f"Unexpected error during file upload: {e}")
            raise HTTPException(
                status_code=500, detail="Unexpected error during file upload."
            )

minio_client = MinioClient()

class DocumentCreateForm(BaseModel):
    title: str = Form(...)
    url: Optional[str] = Form(None)
    content_type: str = Form("article")
    source: Optional[str] = Form(None)
    text_content: Optional[str] = Form(None)
    summary: Optional[str] = Form(None)
    top_image: Optional[str] = Form(None)

@router.post("", response_model=DocumentRead)
@router.post("/", response_model=DocumentRead)
async def create_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    title: str = Form(...),
    url: Optional[str] = Form(None),
    content_type: str = Form("article"),
    source: Optional[str] = Form(None),
    text_content: Optional[str] = Form(None),
    summary: Optional[str] = Form(None),
    top_image: Optional[str] = Form(None),
    insertion_date: Optional[datetime] = Form(None),
    files: Optional[List[UploadFile]] = File(None)
) -> Any:
    logging.info(f"Creating document with title: {title}, url: {url}, content_type: {content_type}, insertion_date: {insertion_date}, files: {files}")

    # Log content lengths with None checks
    logging.info(f"title length: {len(title) if title else 0}")
    logging.info(f"url length: {len(url) if url else 0}")
    logging.info(f"content_type length: {len(content_type) if content_type else 0}")
    logging.info(f"source length: {len(source) if source else 0}")
    logging.info(f"text_content length: {len(text_content) if text_content else 0}")
    logging.info(f"summary length: {len(summary) if summary else 0}")
    if top_image:
        logging.info(f"top_image length: {len(top_image)}")

    try:
        # Handle date input
        insertion_date = insertion_date or datetime.now(timezone.utc)

        workspace = session.get(Workspace, workspace_id)
        if not workspace or workspace.user_id_ownership != current_user.id:
            raise HTTPException(status_code=404, detail="Workspace not found")

        logging.info(f"Creating document for workspace {workspace_id} by user {current_user.id}")
        logging.info(f"Document data: title={title}, top_image={top_image}, url={url}, content_type={content_type}, source={source}, files={files}")

        document_data_dict = {
            "title": title,
            "url": url,
            "content_type": content_type,
            "source": source,
            "text_content": text_content,
            "summary": summary,
            "top_image": top_image,
            "insertion_date": insertion_date,
            "workspace_id": workspace_id,
            "user_id": current_user.id
        }

        document = Document(**document_data_dict)
        session.add(document)
        session.flush()  # Remove await

        # Handle file uploads
        if files:
            for file in files:
                try:
                    logging.info(f"File name: {file.filename}, size: {file.size}")
                    object_name = f"{document.id}/{file.filename}"
                    await minio_client.upload_file(file, object_name)  # Keep await here as it's an async operation
                    file_model = FileModel(name=file.filename, filetype=file.content_type, size=file.size, document_id=document.id)
                    session.add(file_model)
                    print(f"Uploaded file: {file.filename} to {object_name}")
                except Exception as e:
                    print(f"Error uploading file {file.filename}: {e}")

        session.add(document)
        session.commit()  # Remove await
        session.refresh(document)  # Remove await

        logging.info(f"Document {document.id} created successfully.")
        return document
    except Exception as e:
        logging.error(f"Error creating document: {e}")
        session.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=List[DocumentRead])
@router.get("/", response_model=List[DocumentRead])
def read_documents(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    skip: int = 0,
    limit: int = 100
) -> Any:
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")

    statement = (
        select(Document)
        .where(Document.workspace_id == workspace_id)
        .offset(skip)
        .limit(limit)
    )
    documents = session.exec(statement).all()
    
    document_reads = []
    for document in documents:
        document_read = DocumentRead.model_validate(document)
        document_reads.append(document_read)

    return document_reads

@router.get("/{document_id}", response_model=DocumentRead)
def read_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    document_id: int
) -> Any:
    document = session.get(Document, document_id)
    if (
        not document
        or document.workspace_id != workspace_id
        or document.user_id != current_user.id
    ):
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Eagerly load the files relationship
    statement = select(Document).options(joinedload(Document.files)).where(Document.id == document_id)
    document = session.exec(statement).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Convert File objects to FileRead objects
    files = [FileRead.model_validate(file) for file in document.files]

    # Create a DocumentRead object with the files
    document_read = DocumentRead.model_validate(document)
    # Manually set the files attribute
    document_read.files = files

    return document_read

@router.patch("/{document_id}", response_model=DocumentRead)
def update_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    document_id: int,
    document_in: DocumentUpdate
) -> Any:
    document = session.get(Document, document_id)
    if (
        not document
        or document.workspace_id != workspace_id
        or document.user_id != current_user.id
    ):
        raise HTTPException(status_code=404, detail="Document not found")

    update_data = document_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)

    session.add(document)
    session.commit()
    session.refresh(document)
    return document

@router.delete("/{document_id}")
def delete_document(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    document_id: int
) -> Any:
    document = session.get(Document, document_id)
    if (
        not document
        or document.workspace_id != workspace_id
        or document.user_id != current_user.id
    ):
        raise HTTPException(status_code=404, detail="Document not found")

    session.delete(document)
    session.commit()
    return {"message": "Document deleted successfully"}

@router.get("/{document_id}/files", response_model=List[FileRead])
def get_document_files(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    document_id: int
) -> Any:
    document = session.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    return document.files

@router.delete("/{document_id}/files/{file_id}")
def delete_document_file(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    document_id: int,
    file_id: int) -> Any:   
    document = session.get(Document, document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    file = next((file for file in document.files if file.id == file_id), None)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    document.files = [file for file in document.files if file.id != file_id]
    session.add(document)
    session.commit()
    return {"message": "File deleted successfully"}

@router.get("/files/{file_id}/download")
async def download_file(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    file_id: int
):
    file = session.get(FileModel, file_id)
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Fetch the file from MinIO
    try:
        object = minio_client.client.get_object(
            bucket_name=minio_client.bucket_name,
            object_name=f"{file.document_id}/{file.name}",
        )
        file_data = object.read()
    except S3Error as e:
        logging.error(f"Error fetching file from MinIO: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch file from storage.")

    # Return the file as a response
    return Response(
        file_data,
        media_type=file.filetype,
        headers={"Content-Disposition": f"attachment;filename={file.name}"},
    )

@router.delete("")
@router.delete("/")
def delete_all_documents(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int
) -> Any:
    workspace = session.get(Workspace, workspace_id)
    if not workspace or workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Workspace not found")

    statement = select(Document).where(Document.workspace_id == workspace_id)
    documents = session.exec(statement).all()

    for document in documents:
        session.delete(document)

    session.commit()
    return {"message": "All documents deleted successfully"}

@router.post("/transfer")
def transfer_documents(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    target_workspace_id: int,
    document_ids: List[int],
    copy: bool = False
) -> Any:
    """Transfer or copy documents to another workspace"""
    # Check source workspace access
    source_workspace = session.get(Workspace, workspace_id)
    if not source_workspace or source_workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Source workspace not found")

    # Check target workspace access
    target_workspace = session.get(Workspace, target_workspace_id)
    if not target_workspace or target_workspace.user_id_ownership != current_user.id:
        raise HTTPException(status_code=404, detail="Target workspace not found")

    try:
        for doc_id in document_ids:
            document = session.get(Document, doc_id)
            if not document or document.workspace_id != workspace_id:
                continue

            if copy:
                # Create a new document with the same data
                new_doc = Document(
                    title=document.title,
                    url=document.url,
                    content_type=document.content_type,
                    source=document.source,
                    text_content=document.text_content,
                    summary=document.summary,
                    top_image=document.top_image,
                    workspace_id=target_workspace_id,
                    user_id=current_user.id,
                    insertion_date=datetime.now(timezone.utc)
                )
                session.add(new_doc)
                session.flush()  # Flush to get the new document ID

                # Copy associated files
                for file in document.files:
                    # Copy file in MinIO
                    try:
                        source_object = f"{document.id}/{file.name}"
                        target_object = f"{new_doc.id}/{file.name}"
                        
                        # Copy the object in MinIO
                        minio_client.client.copy_object(
                            minio_client.bucket_name,
                            target_object,
                            f"{minio_client.bucket_name}/{source_object}"
                        )
                        
                        # Create new file record
                        new_file = FileModel(
                            name=file.name,
                            filetype=file.filetype,
                            size=file.size,
                            document_id=new_doc.id
                        )
                        session.add(new_file)
                    except Exception as e:
                        logging.error(f"Error copying file {file.name}: {e}")
            else:
                # Move the document
                document.workspace_id = target_workspace_id
                session.add(document)

        session.commit()
        return {"message": f"Documents {'copied' if copy else 'moved'} successfully"}
    except Exception as e:
        session.rollback()
        logging.error(f"Error transferring documents: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to {'copy' if copy else 'move'} documents"
        )

@router.post("/{document_id}/extract_pdf_content")
async def extract_pdf_content(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    workspace_id: int,
    document_id: int,
    file_id: int
) -> Any:
    """Extract text content from a PDF file and update the document using PyMuPDF"""
    # Verify permissions
    document = session.get(Document, document_id)
    if (
        not document
        or document.workspace_id != workspace_id
        or document.user_id != current_user.id
    ):
        raise HTTPException(status_code=404, detail="Document not found")

    # Get the file
    file = session.get(FileModel, file_id)
    if not file or file.document_id != document_id:
        raise HTTPException(status_code=404, detail="File not found")

    if not file.filetype.lower().endswith('pdf'):
        raise HTTPException(status_code=400, detail="File is not a PDF")

    try:
        # Get the PDF from MinIO
        object = minio_client.client.get_object(
            bucket_name=minio_client.bucket_name,
            object_name=f"{document.id}/{file.name}",
        )
        pdf_data = object.read()
        
        # Extract text using PyMuPDF
        with fitz.open(stream=pdf_data, filetype="pdf") as doc:
            text_content = ""
            for page in doc:
                # Clean the text by removing NULL bytes and other problematic characters
                page_text = page.get_text()
                cleaned_text = page_text.replace('\x00', '').encode('utf-8', errors='ignore').decode('utf-8')
                text_content += cleaned_text + "\n"

        # Update document
        document.text_content = text_content
        session.add(document)
        session.commit()
        session.refresh(document)

        return {"message": "PDF content extracted successfully", "text_content": text_content}

    except Exception as e:
        logging.error(f"Error extracting PDF content with PyMuPDF: {e}")
        raise HTTPException(status_code=500, detail="Failed to extract PDF content")
    
