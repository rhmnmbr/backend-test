from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.security import HTTPBearer
from model import RegisterBody, LoginBody
from user_service import create_user, get_user_by_nik
from utils import generate_random_password


import jwt


app = FastAPI()
auth_scheme = HTTPBearer()

JWT_KEY_SECRET = "81f5217ce5f9a33491e57c03e50488edad703dc6daf3e3a35dfe08520b536f58fad553ca5681d2ab7cccf50890846e738f4232dce7abaceedca1d22e1b33faea"
ALGORITHM = "HS256"


@app.post("/register", status_code=201)
async def register(body: RegisterBody):
    if not body.nik:
        raise HTTPException(400, "NIK required")
    if not body.role:
        raise HTTPException(400, "Role required")
    if len(body.nik) != 16:
        raise HTTPException(400, "NIK length must be 16 characters")

    password = generate_random_password(6)
    result = get_user_by_nik(body.nik)

    if result:
        raise HTTPException(400, "NIK not available")

    create_user(body.nik, body.role, password)

    return {"nik": body.nik, "role": body.role, "password": password}


@app.post("/login")
async def login(body: LoginBody):
    if not body.nik:
        raise HTTPException(400, "NIK required")
    if not body.password:
        raise HTTPException(400, "Password required")

    result = get_user_by_nik(body.nik)

    if not result:
        raise HTTPException(400, "NIK not found")

    if body.password != result[0][3]:
        raise HTTPException(400, "Wrong password")

    payload = {
        "id": result[0][0],
        "nik": result[0][1],
        "role": result[0][2],
    }

    token = jwt.encode(payload, JWT_KEY_SECRET, ALGORITHM)

    return {**payload, "token": token}


@app.get("/validate")
async def login(request: Request, token = Depends(auth_scheme)):
    try:
        return jwt.decode(token, JWT_KEY_SECRET, ALGORITHM)
    except:
        raise HTTPException(400, "Signature verification failed")
