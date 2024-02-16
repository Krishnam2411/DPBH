import sqlalchemy.orm as _orm
import datetime as _dt
import database.models as _models, database.schemas as _schemas, database.database as _database


def create_database():
    return _database.Base.metadata.create_all(bind=_database.engine)

def get_db():
    db = _database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_cache(db: _orm.Session, url: str):
    return db.query(_models.Cache).filter(_models.Cache.url == url).first()

def get_caches(db: _orm.Session, skip: int = 0, limit: int = 100):
    return db.query(_models.Cache).offset(skip).limit(limit).all()

def create_cache(db: _orm.Session, cache: _schemas.CreateCache):
    db_cache = _models.Cache(url=cache.url,content=cache.content,trust_score=cache.trust_score)
    db_cache.date_created=_dt.datetime.now()
    db_cache.date_last_updated=_dt.datetime.now()
    db.add(db_cache)
    db.commit()
    db.refresh(db_cache)
    return db_cache

def delete_cache(db: _orm.Session, url:str):
    db.query(_models.Cache).filter(_models.Cache.url==url).delete()
    db.commit()

def delete_caches(db: _orm.Session):
    db.query(_models.Cache).delete()
    db.commit()

def update_cache(db: _orm.Session, url: str, cache: _schemas.CreateCache):
    db_cache = get_cache(db=db, url=url)
    db_cache.content=cache.content
    db_cache.trust_score=cache.trust_score
    db_cache.date_last_updated=_dt.datetime.now()
    db.commit()
    db.refresh(db_cache)
    return db_cache