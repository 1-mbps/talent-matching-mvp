from pydantic import BaseModel
from fastapi import APIRouter, HTTPException
from typing import Annotated, List, Optional
from fastapi import Depends
from utils.auth import get_current_user, supabase
from utils.agents import SchemaMakerAgent
from models import User, Job, CandidateMatch
from uuid import uuid4
import json

from utils.matching import calculate_resume_matches

router = APIRouter()

schema_maker = SchemaMakerAgent()

class JobRequest(BaseModel):
    job_desc: str
    job_title: str

class EditJobRequest(BaseModel):
    job_id: str
    job_title: Optional[str] = None
    job_desc: Optional[str] = None
    rating_schema: Optional[str] = None
    rating_schema_weights: Optional[str] = None

@router.post("/create_job", response_model=Job)
async def create_job(current_user: Annotated[User, Depends(get_current_user)], job: JobRequest):
    schema = schema_maker.respond(job.job_desc)
    json_schema = json.loads(schema)
    job = Job(user_id=current_user.uuid, job_desc=job.job_desc, job_title=job.job_title, job_id=str(uuid4()), rating_schema=json_schema)
    supabase.table("jobs").insert(job.model_dump()).execute()
    return job

@router.get("/get_jobs", response_model=List[Job])
async def get_jobs(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        jobs = supabase.table("jobs").select("*").eq("user_id", current_user.uuid).execute().data
    except Exception as e:
        print(f"Error getting jobs: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting jobs")
    return [Job.init_job(**job) for job in jobs]

@router.post("/edit_job", response_model=Job)
async def edit_job(current_user: Annotated[User, Depends(get_current_user)], edit_job_request: EditJobRequest):
    job_title = edit_job_request.job_title
    job_desc = edit_job_request.job_desc
    rating_schema = edit_job_request.rating_schema
    rating_schema_weights = edit_job_request.rating_schema_weights
    if all([not job_title, not job_desc, not rating_schema, not rating_schema_weights]):
        raise HTTPException(status_code=400, detail="No fields to update")
    update_dict = {}
    json_weights = None
    json_schema = None
    if job_title:
        update_dict["job_title"] = job_title
    if job_desc:
        update_dict["job_desc"] = job_desc
    if rating_schema:
        try:
            json_schema = json.loads(rating_schema)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid rating schema. Please ensure it is a valid JSON object.")
        update_dict["rating_schema"] = rating_schema
    if rating_schema_weights:
        try:
            json_weights = json.loads(rating_schema_weights)
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid rating schema weights. Please ensure it is a valid JSON object.")
        update_dict["rating_schema_weights"] = rating_schema_weights
    try:
        job = supabase.table("jobs").update(update_dict).eq("job_id", edit_job_request.job_id).execute().data[0]
    except Exception as e:
        print(f"Error editing job: {e}")
        raise HTTPException(status_code=500, detail=f"Error editing job")
    
    if json_schema:
        job["rating_schema"] = json_schema
    if json_weights:
        job["rating_schema_weights"] = json_weights
        
    return Job.init_job(**job)

@router.get("/calculate_matches", response_model=List[CandidateMatch])
async def calculate_matches(current_user: Annotated[User, Depends(get_current_user)], job_id: str):
    
    # Get job data
    job = supabase.table("jobs").select("*").eq("job_id", job_id).execute().data[0]
    print(f"JOB: {job}")
    schema = job["rating_schema"]
    schema_weights = job["rating_schema_weights"]

    if isinstance(schema, str):
        schema_dict = json.loads(schema)
    else:
        schema_dict = schema

    if isinstance(schema_weights, str):
        schema_weights_dict = json.loads(schema_weights)
    else:
        schema_weights_dict = schema_weights

    # Check if schema and schema weights match
    if schema_dict["properties"].keys() != schema_weights_dict.keys():
        raise HTTPException(status_code=400, detail=f"Schema categories and weight categories do not match. Schema: {schema_dict.keys()}, Schema Weights: {schema_weights_dict.keys()}")
    
    # Calculate matches
    matches = calculate_resume_matches(schema_dict, schema_weights_dict)
    
    # Sort matches
    sorted_matches = sorted([CandidateMatch(**match, job_id=job_id) for match in matches], reverse=True)
    
    # Remove all matches for this job from the database
    supabase.table("matches").delete().eq("job_id", job_id).execute()
    
    # Insert matches into database
    supabase.table("matches").insert([match.model_dump() for match in sorted_matches]).execute()

    return sorted_matches

@router.get("/get_matches", response_model=List[CandidateMatch])
async def get_matches(current_user: Annotated[User, Depends(get_current_user)], job_id: str):
    matches = supabase.table("matches").select("*").eq("job_id", job_id).execute().data
    return [CandidateMatch(**match) for match in matches]
