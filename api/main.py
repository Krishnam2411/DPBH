import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from utils.crawler import crawl
from core.base import returner
import warnings
import fastapi as _fastapi
import database.services as _services
import database.schemas as _schemas
import sqlalchemy.orm as _orm

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
async def create_cache(cache:_schemas.CreateCache,db: _orm.Session = _fastapi.Depends(_services.get_db)):
    db_cache = _services.get_cache(db=db, url=cache.url)
    if db_cache:
        raise _fastapi.HTTPException(
            status_code=400, detail="Already cached"
        )
    return _services.create_cache(db=db, cache=cache)



@app.get("/caches/", response_model=List[_schemas.Cache])
async def read_caches(
    skip: int = 0,
    limit: int = 10,
    db: _orm.Session = _fastapi.Depends(_services.get_db),
):
    caches = _services.get_caches(db=db, skip=skip, limit=limit)
    return caches


@app.get("/cache/{url}", response_model=_schemas.Cache)
async def read_cache(url: str, db: _orm.Session = _fastapi.Depends(_services.get_db)):
    db_cache = _services.get_cache(db=db, url=url)
    if db_cache is None:
        raise _fastapi.HTTPException(
            status_code=404, detail="Cache doesnot exist"
        )
    return db_cache

@app.delete("/cache/{url}")
async def delete_cache(url:str, db: _orm.Session = _fastapi.Depends(_services.get_db)):
    _services.delete_cache(db=db, url=url)
    return {"message": f"Cache deleted successfully for URL: {url}"}

@app.delete("/caches/")
async def delete_caches(db: _orm.Session = _fastapi.Depends(_services.get_db)):
    _services.delete_caches(db=db)
    return {"message": f"Deleted all cached data"}

@app.put("/cache/{url}", response_model=_schemas.Cache)
async def update_post(
    url:str,
    cache: _schemas.CreateCache,
    db: _orm.Session = _fastapi.Depends(_services.get_db),
):
    return _services.update_cache(db=db, cache=cache, url=url)

if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
