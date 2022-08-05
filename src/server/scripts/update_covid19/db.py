import psycopg2
from sqlalchemy import create_engine

from update_covid19.config import config

#postgres:password@localhost/postgres'
engine = create_engine(
    f'postgresql+psycopg2://{config["PG_USER"]}:{config["PG_PASSWORD"]}@{config["PG_HOST"]}:{config["PG_PORT"]}/{config["PG_DATABASE"]}',
    encoding='ASCII'
)
