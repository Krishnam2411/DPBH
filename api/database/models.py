import datetime as _dt
import sqlalchemy as _sql
import sqlalchemy.orm as _orm

import database.database as _database


class Cache(_database.Base):
    __tablename__ = "cache"
    url = _sql.Column(_sql.String, primary_key=True, index=True)
    content = _sql.Column(_sql.String, index=True)
    trust_score = _sql.Column(_sql.Integer, index=True)
    date_created = _sql.Column(_sql.DateTime, default=_dt.datetime.utcnow)
    date_last_updated = _sql.Column(_sql.DateTime, default=_dt.datetime.utcnow)
    