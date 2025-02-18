from opol import OPOL
from fastapi import APIRouter, Query, Depends, HTTPException
from typing import Optional, List, Dict, Any, Type, Literal
from pydantic import BaseModel, Field, create_model, conint, model_validator
import os
from datetime import datetime, timezone
# from sqlalchemy.orm import Session #Unnecessary import
from app.models import ClassificationScheme, Document, ClassificationResult, ClassificationResultRead
from app.api.deps import SessionDep, CurrentUser
from app.core.db import engine  # Import the engine
from sqlmodel import Session  # Import Session from sqlmodel


router = APIRouter()


opol = OPOL(mode=os.getenv("OPOL_MODE"), api_key=os.getenv("OPOL_API_KEY"))
api_key = os.environ["GOOGLE_API_KEY"]
fastclass = opol.classification(provider="Google", model_name="models/gemini-1.5-flash-latest", llm_api_key=api_key)


class RequestClassification(BaseModel):
    """
    Query to get the classification of the query
    """
    query: str

@router.get("/location_from_query")
async def get_location_from_query(query: str):
    
    class QueryLocation(BaseModel):
        """
        Location most relevant to the query
        """
        location: str

    location = fastclass.classify(QueryLocation, "Location most relevant to the query", query)

    coordinates, location_type, bbox, area = opol.geo.code(location)

    return {
        "location": location,
        "coordinates": coordinates,
        "location_type": location_type,
        "bbox": bbox,
        "area": area
    }

### How to use opol fastclass
## Create a pydantic model for the classification
## Prompt and annotations will be fed to the LLM generating the response
## The response will be a pydantic model

# E.g. Populist Rehetoric
class PopulistRehetoric(BaseModel):
    """
    Definition: Populist rhetoric s a special type of political talk that divides the population 
    into two categories: pure, moral, and victimized people and a corrupt, malfunctioning elite. 

    Populism constructs fear and is related to the various real or imagined dangers posed 
    by "scapegoats" (LGBT people, minorities, feminists, marginalized groups) that are blamed 
    for threatening or damaging societies.
    """
    populist_rhetoric_used: int = Field(description="On a scale from 1-10, how much populist rhetoric is used in the text?")


## Which would be applied like this:
# classification = fastclass.classify(PopulistRehetoric, "", text)
# pop_score = classification.populist_rhetoric_used
# The "" empty string needs to be passed as second argument. It's useful to inject or override instructions

def generate_pydantic_model(scheme: ClassificationScheme) -> Type[BaseModel]:
    if scheme.type == "int":
        return create_model(
            scheme.name,
            **{
                scheme.name: (
                    conint(ge=scheme.scale_min, le=scheme.scale_max),
                    Field(description=f"Scale from {scheme.scale_min} to {scheme.scale_max}")
                )
            }
        )
    elif scheme.type == "List[str]":
        if scheme.is_set_of_labels and scheme.labels:
            # For selection from predefined labels
            model = create_model(
                scheme.name,
                **{
                    scheme.name: (
                        List[str],
                        Field(
                            description=f"Select from: {', '.join(scheme.labels)}",
                            examples=[scheme.labels],
                            max_items=scheme.max_labels if scheme.max_labels else None
                        )
                    )
                }
            )
            
            @model_validator(mode='before')
            def validate_labels(cls, values):
                value = values.get(scheme.name)
                if value:
                    invalid_labels = [v for v in value if v not in scheme.labels]
                    if invalid_labels:
                        raise ValueError(f"Invalid labels: {', '.join(invalid_labels)}. Must be from: {', '.join(scheme.labels)}")
                return values
                
            setattr(model, 'validate_labels', validate_labels)
            return model
        else:
            # For free-form lists
            return create_model(
                scheme.name,
                **{
                    scheme.name: (
                        List[str],
                        Field(
                            description=scheme.description,
                            max_items=scheme.max_labels if scheme.max_labels else None
                        )
                    )
                }
            )
    elif scheme.type == "str":
        # For free-form text input
        return create_model(
            scheme.name,
            **{
                scheme.name: (str, Field(description=scheme.description))
            }
        )
    elif scheme.type == "List[Dict[str, any]]":
        return create_model(
            scheme.name,
            **{
                scheme.name: (List[Dict[str, Any]], Field(description=scheme.description))
            }
        )
    
    # Default case
    return create_model(
        scheme.name,
        __doc__=scheme.model_instructions or scheme.description
    )

@router.post("/{scheme_id}/classify/{document_id}")
async def classify_document(
    scheme_id: int,
    document_id: int,
    session: SessionDep,
    current_user: CurrentUser
) -> ClassificationResultRead:
    scheme = session.get(ClassificationScheme, scheme_id)
    document = session.get(Document, document_id)
    
    # Generate dynamic Pydantic model
    ModelClass = generate_pydantic_model(scheme)
    
    # Classify using OPOL
    result = opol.classify(ModelClass, "", document.text_content)
    
    # Store result
    classification_result = ClassificationResult(
        document_id=document_id,
        scheme_id=scheme_id,
        score=getattr(result, scheme.name),  # Get the field value dynamically
        timestamp=datetime.now(timezone.utc)
    )
    
    session.add(classification_result)
    session.commit()
    session.refresh(classification_result) # To get the id
    
    return classification_result

def classify_text(text: str, scheme_id: int) -> Dict:
    """
    This function takes text and scheme_id, applies a classification model, and returns the result.
    """
    if not text or not scheme_id:
        raise HTTPException(status_code=400, detail="Text and scheme_id are required")
    
    # Load the classification scheme from the database
    with Session(engine) as session:  # Use the engine to create a session
        scheme = session.get(ClassificationScheme, scheme_id)
        if not scheme:
            raise HTTPException(status_code=404, detail=f"Classification scheme with id {scheme_id} not found")
    
    # Generate dynamic Pydantic model
    ModelClass = generate_pydantic_model(scheme)
    
    # Classify using OPOL
    result = fastclass.classify(ModelClass, "", text)
    
    # Return the raw model dump to preserve structure
    return result.model_dump()

@router.post("/classify")
async def classify(text: str, scheme_id: int):
    return classify_text(text, scheme_id)
