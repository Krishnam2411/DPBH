import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from utils.crawler import crawl
from core.base import returner
import warnings

# Ignores warning
warnings.filterwarnings('ignore')

## Constants
URL_FILE = 'data/urls.txt'

app = FastAPI()

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

if __name__ == '__main__':
    uvicorn.run(app, host='127.0.0.1', port=8000)
