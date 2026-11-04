from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE_PATH = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "Revision Tracker API"
    debug: bool = False
    db_url: str

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE_PATH),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("db_url", mode="before")
    @classmethod
    def normalize_asyncpg_url(cls, v: str) -> str:
        if not isinstance(v, str):
            return v

        # 1. Ensure asyncpg driver scheme
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql+asyncpg://", 1)
        elif v.startswith("postgresql://"):
            v = v.replace("postgresql://", "postgresql+asyncpg://", 1)

        # 2. Sanitize Neon query params for asyncpg compatibility
        parsed = urlparse(v)
        query_params = dict(parse_qsl(parsed.query))

        if "sslmode" in query_params:
            ssl_mode = query_params.pop("sslmode")
            if ssl_mode == "require" and "ssl" not in query_params:
                query_params["ssl"] = "require"

        # asyncpg does not accept channel_binding as a URL query param
        query_params.pop("channel_binding", None)

        new_query = urlencode(query_params)
        return urlunparse(parsed._replace(query=new_query))


settings = Settings()

