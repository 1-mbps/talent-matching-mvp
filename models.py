from pydantic import BaseModel
from typing import Literal

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

class UserInDB(User):
    hashed_password: str
    
    def to_public_user(self) -> User:
        return User(**self.model_dump())