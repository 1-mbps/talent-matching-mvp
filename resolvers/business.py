from fastapi import APIRouter, HTTPException
from typing import Annotated, List, Optional
from fastapi import Depends
from autogen import UserProxyAgent
from utils.auth import get_current_user, supabase
from utils.agents import SchemaMakerAgent, ResumeRater
from models import User, Job, CandidateMatch
from uuid import uuid4
import json

from utils.matching import get_matches

router = APIRouter()

schema_maker = SchemaMakerAgent()

@router.post("/create_job", response_model=Job)
async def create_job(current_user: Annotated[User, Depends(get_current_user)], job_desc: str, job_title: str):
    schema = schema_maker.respond(job_desc)
    job = Job(user_id=current_user.uuid, job_desc=job_desc, job_title=job_title, job_id=str(uuid4()), rating_schema=schema)
    supabase.table("jobs").insert(job.model_dump()).execute()
    return job

@router.get("/get_jobs", response_model=List[Job])
async def get_jobs(current_user: Annotated[User, Depends(get_current_user)]):
    try:
        jobs = supabase.table("jobs").select("*").eq("user_id", current_user.uuid).execute().data
    except Exception as e:
        print(f"Error getting jobs: {e}")
        raise HTTPException(status_code=500, detail=f"Error getting jobs")
    return [Job.init_job(job["rating_schema"], **job) for job in jobs]

@router.post("/edit_job", response_model=Job)
async def edit_job(current_user: Annotated[User, Depends(get_current_user)], job_id: str, job_title: Optional[str] = None, job_desc: Optional[str] = None, rating_schema: Optional[str] = None, rating_schema_weights: Optional[str] = None):
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
        job = supabase.table("jobs").update(update_dict).eq("job_id", job_id).execute().data[0]
    except Exception as e:
        print(f"Error editing job: {e}")
        raise HTTPException(status_code=500, detail=f"Error editing job")
    
    if json_schema:
        job["rating_schema"] = json_schema
    if json_weights:
        job["rating_schema_weights"] = json_weights
        
    return Job.init_job(**job)

@router.get("/get_resume_matches", response_model=List[CandidateMatch])
async def get_resume_matches(current_user: Annotated[User, Depends(get_current_user)], job_id: str):
    job = supabase.table("jobs").select("*").eq("job_id", job_id).execute().data[0]
    schema = job["rating_schema"]
    schema_weights = job["rating_schema_weights"]
    schema_dict = json.loads(schema)
    schema_weights_dict = json.loads(schema_weights)
    if schema_dict["properties"].keys() != schema_weights_dict.keys():
        raise HTTPException(status_code=400, detail=f"Schema categories and weight categories do not match. Schema: {schema_dict.keys()}, Schema Weights: {schema_weights_dict.keys()}")
    matches = get_matches(schema_dict, schema_weights_dict)
    return sorted([CandidateMatch(**match) for match in matches], reverse=True)
