from fastapi import APIRouter, HTTPException
from pathlib import Path
import shutil
import os
import json
from fastapi.responses import JSONResponse, FileResponse

import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

BASE_PATH = Path(os.getenv("BASE_PATH", "/app/app/docs"))
METADATA_FILE = BASE_PATH / "metadata.json"

router = APIRouter()

# Load metadata
def load_metadata():
    if not METADATA_FILE.exists():
        return {}
    with open(METADATA_FILE, "r") as f:
        return json.load(f)

# Save metadata
def save_metadata(metadata):
    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)

# Serve MDX files
@router.get("/mdx/{folder}/{filename}")
async def get_mdx_file(folder: str, filename: str):
    file_path = BASE_PATH / folder / f"{filename}.mdx"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

# Get the metadata
@router.get("/metadata/")
async def get_metadata():
    logger.info(f"Attempting to load metadata from {METADATA_FILE}")
    
    if METADATA_FILE.exists():
        logger.info(f"Metadata file found at {METADATA_FILE}")
        try:
            with open(METADATA_FILE, "r") as f:
                metadata = json.load(f)
            logger.info("Metadata loaded successfully")
            return JSONResponse(content=metadata)
        except Exception as e:
            logger.error(f"Error reading metadata file: {e}")
            raise HTTPException(status_code=500, detail="Error reading metadata file")
    else:
        logger.warning(f"Metadata file not found at {METADATA_FILE}, creating new file")
        try:
            # Create the file with an empty dictionary
            save_metadata({})
            return JSONResponse(content={"message": "Metadata file created", "metadata": {}})
        except Exception as e:
            logger.error(f"Error creating metadata file: {e}")
            raise HTTPException(status_code=500, detail="Error creating metadata file")

# API to update metadata (rename, move files, update metadata)
@router.post("/metadata/update")
async def update_metadata(file_name: str, new_metadata: dict):
    try:
        metadata = load_metadata()
        if file_name not in metadata:
            raise HTTPException(status_code=404, detail="File not found in metadata")

        # Update the metadata for the specific file
        metadata[file_name] = new_metadata
        save_metadata(metadata)
        return {"message": "Metadata updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper function to get the structure of the docs directory
def get_docs_structure(directory: Path):
    structure = []
    for path in directory.glob("**/*.mdx"):
        relative_path = path.relative_to(BASE_PATH)
        structure.append(str(relative_path))
    return structure

# API to get the folder structure and files
@router.get("/structure")
async def get_docs_structure_api():
    try:
        structure = get_docs_structure(BASE_PATH)
        return {"structure": structure}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API to rename a file
@router.post("/rename")
async def rename_file(old_name: str, new_name: str):
    old_file = BASE_PATH / old_name
    new_file = BASE_PATH / new_name

    if not old_file.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        shutil.move(str(old_file), str(new_file))
        return {"message": "File renamed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API to create a new MDX file
@router.post("/create")
async def create_mdx_file(file_name: str, content: str = "# New MDX file content"):
    file_path = BASE_PATH / f"{file_name}.mdx"

    if file_path.exists():
        raise HTTPException(status_code=400, detail="File already exists")
    
    try:
        with open(file_path, "w") as f:
            f.write(content)
        return {"message": "File created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API to delete an MDX file
@router.delete("/delete")
async def delete_mdx_file(file_name: str):
    file_path = BASE_PATH / file_name

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))