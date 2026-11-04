from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData

# Define standard shortcodes for database constraints
POSTGRES_NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",                # Indexes
    "uq": "uq_%(table_name)s_%(column_0_name)s",   # Unique Constraints
    "ck": "ck_%(table_name)s_%(constraint_name)s", # Check Constraints
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s", # Foreign Keys
    "pk": "pk_%(table_name)s"                      # Primary Keys
}

# Base class for our database models
class Base(DeclarativeBase):
    metadata: MetaData = MetaData(naming_convention=POSTGRES_NAMING_CONVENTION)

