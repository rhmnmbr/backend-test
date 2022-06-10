from pydantic import BaseModel


class RegisterBody(BaseModel):
    nik: str
    role: str


class LoginBody(BaseModel):
    nik: str
    password: str
