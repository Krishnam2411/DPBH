import datetime as _dt
import pydantic as _pydantic

class _CacheBase(_pydantic.BaseModel):
    url: str
    content: str
    trust_score:int

class CreateCache(_CacheBase):
    pass

class Cache(_CacheBase):
    date_created: _dt.datetime
    date_last_updated: _dt.datetime