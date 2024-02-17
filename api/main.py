import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from utils.crawler import crawl
from core.base import returner
import warnings
import fastapi as _fastapi
import database.services as _services
import database.schemas as _schemas
import sqlalchemy.orm as _orm
import uuid
import os
from random import randint

# Ignores warning
warnings.filterwarnings('ignore')

## Constants
URL_FILE = 'data/urls.txt'

app = FastAPI()

# Function called to create database
_services.create_database()

# Handling CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# routes
@app.get('/')
async def root():
    return {'response': 'ok'} 

@app.post('/predict')
async def predict(data: List[str]):
    return {'response': returner(data)}

@app.get('/crawl')
async def crawling():
    crawl(URL_FILE)
    return {'response': "success"}

#database endpoints
@app.post("/createcache/",response_model=_schemas.Cache)
def create_cache(cache:_schemas.CreateCache,db: _orm.Session = _fastapi.Depends(_services.get_db)):
    db_cache = _services.get_cache(db=db, url=cache.url)
    if db_cache:
        raise _fastapi.HTTPException(
            status_code=400, detail="Already cached"
        )
    return _services.create_cache(db=db, cache=cache)



@app.get("/caches/", response_model=List[_schemas.Cache])
def read_caches(
    skip: int = 0,
    limit: int = 10,
    db: _orm.Session = _fastapi.Depends(_services.get_db),
):
    caches = _services.get_caches(db=db, skip=skip, limit=limit)
    return caches


@app.get("/cache/{url}", response_model=_schemas.Cache)
def read_cache(url: str, db: _orm.Session = _fastapi.Depends(_services.get_db)):
    db_cache = _services.get_cache(db=db, url=url)
    if db_cache is None:
        raise _fastapi.HTTPException(
            status_code=404, detail="Cache doesnot exist"
        )
    return db_cache

@app.delete("/cache/{url}")
def delete_cache(url:str, db: _orm.Session = _fastapi.Depends(_services.get_db)):
    _services.delete_cache(db=db, url=url)
    return {"message": f"Cache deleted successfully for URL: {url}"}


@app.put("/cache/{url}", response_model=_schemas.Cache)
def update_post(
    url:str,
    cache: _schemas.CreateCache,
    db: _orm.Session = _fastapi.Depends(_services.get_db),
):
    return _services.update_cache(db=db, cache=cache, url=url)

# Screenshot endpoints

IMAGEDIR = "screenshots/"

@app.post("/upload/")
async def upload_ss(file: UploadFile = File(...)):
    file.filename = f"{uuid.uuid4()}.jpg"
    contents = await file.read()
    #save the file
    with open(f"{IMAGEDIR}{file.filename}", "wb") as f:
        f.write(contents)
    return {"filename": file.filename}
 
 
@app.get("/show/")
async def read_all_files():
    # get random file from the image directory
    files = os.listdir(IMAGEDIR)
    responses = [(f"{IMAGEDIR}{file}") for file in files]
    return responses

if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
