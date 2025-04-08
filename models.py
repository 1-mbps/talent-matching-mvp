from pydantic import BaseModel
from typing import Literal, Optional
import json

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class BaseUser(BaseModel):
    email: str
    disabled: bool | None = None

class User(BaseUser):
    email: str
    name: str
    user_type: Literal["business", "user"]
    city: str
    country: str
    uuid: str

class UserInDB(User):
    hashed_password: str
    
    def to_public_user(self) -> User:
        return User(**self.model_dump())
    
class Job(BaseModel):
    user_id: str
    job_desc: str
    rating_schema: dict
    rating_schema_weights: Optional[dict[str, float]] = None
    job_id: str
    job_title: str

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if not kwargs.get("rating_schema_weights"):
            self.rating_schema_weights = {key: 1.0 for key in self.rating_schema["properties"].keys()}

    @classmethod
    def init_job(cls, rating_schema: str | dict, rating_schema_weights: str | dict, **kwargs) -> 'Job':
        return Job(
            rating_schema=json.loads(rating_schema) if isinstance(rating_schema, str) else rating_schema,
            rating_schema_weights=json.loads(rating_schema_weights) if isinstance(rating_schema_weights, str) else rating_schema_weights,
            **kwargs
        )
    
class CandidateMatch(BaseModel):
    job_id: str
    resume: str
    score: float
    name: str
    ratings: dict[str, float]

    def __lt__(self, other: 'CandidateMatch') -> bool:
        return self.score < other.score
    
    def __gt__(self, other: 'CandidateMatch') -> bool:
        return self.score > other.score
    
    def __eq__(self, other: 'CandidateMatch') -> bool:
        return self.score == other.score
    
    def __le__(self, other: 'CandidateMatch') -> bool:
        return self.score <= other.score
    
    