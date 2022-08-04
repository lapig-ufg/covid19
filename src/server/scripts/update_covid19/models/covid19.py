from sqlalchemy import Column, DateTime, Integer, Text
from sqlalchemy.ext.declarative import declarative_base

from update_covid19.db import engine

Base = declarative_base()


class Casos(Base):
    __tablename__ = 'casos'
    id = Column(Integer, primary_key=True)
    cd_geocmu = Column(Text(7))
    data = Column(DateTime)
    confirmados = Column(Integer, default=0)
    suspeitos = Column(Integer, default=0)
    descartados = Column(Integer, default=0)
    obitos = Column(Integer, default=0)
    masculino = Column(Integer, default=0)
    feminino = Column(Integer, default=0)
    menor10 = Column(Integer, default=0)
    de15a19 = Column(Integer, default=0)
    de10a14 = Column(Integer, default=0)
    de20a29 = Column(Integer, default=0)
    de30a39 = Column(Integer, default=0)
    de40a49 = Column(Integer, default=0)
    de50a59 = Column(Integer, default=0)
    de60a69 = Column(Integer, default=0)
    de70a79 = Column(Integer, default=0)
    maior80 = Column(Integer, default=0)
    municipio = Column(Text(60))
    recuperados = Column(Integer, default=0)

    def __str__(self) -> str:
        return f"""Casos(
    id={self.id},
    cd_geocmu={self.cd_geocmu}, 
    confirmados={self.confirmados}
    suspeitos={self.suspeitos},
    recuperado={self.recuperado},
    municipio={self.municipio} )"""



class Obitos(Base):
    __tablename__ = 'obitos_stats'
    gid = Column(Integer, primary_key=True)
    cd_geocmu = Column(Text(7))
    data = Column(DateTime)
    obitos = Column(Integer, default=0)
    masculino = Column(Integer, default=0)
    feminino = Column(Integer, default=0)
    menor10 = Column(Integer, default=0)
    de15a19 = Column(Integer, default=0)
    de10a14 = Column(Integer, default=0)
    de20a29 = Column(Integer, default=0)
    de30a39 = Column(Integer, default=0)
    de40a49 = Column(Integer, default=0)
    de50a59 = Column(Integer, default=0)
    de60a69 = Column(Integer, default=0)
    de70a79 = Column(Integer, default=0)
    maior80 = Column(Integer, default=0)
    data_notificacao = Column(DateTime, default=None)
    municipio = Column(Text(60))


Base.metadata.create_all(engine)

constructor = {
    'queryConfimdos': {
        'obitos': None,
        'confirmados': None,
    },
    'feminino': {
        'coll': 'sexo',
        'where': 'FEMININO',
        'obitos': None,
        'confirmados': None,
    },
    'masculino': {
        'coll': 'sexo',
        'where': 'MASCULINO',
        'obitos': None,
        'confirmados': None,
    },
    'menor10': {
        'coll': 'faixa_etaria',
        'where': '< 10 anos',
        'obitos': None,
        'confirmados': None,
    },
    'de10a14': {
        'coll': 'faixa_etaria',
        'where': '10 a 14 anos',
        'obitos': None,
        'confirmados': None,
    },
    'de15a19': {
        'coll': 'faixa_etaria',
        'where': '15 a 19 anos',
        'obitos': None,
        'confirmados': None,
    },
    'de20a29': {
        'coll': 'faixa_etaria',
        'where': '20 a 29 anos',
        'obitos': None,
        'confirmados': None,
    },
    'de30a39': {
        'coll': 'faixa_etaria',
        'where': '30 a 39 anos',
        'obitos': None,
        'confirmados': None,
    },
    'de40a49': {
        'coll': 'faixa_etaria',
        'where': '40 a 49 anos',
        'obitos': None,
        'confirmados': None,
    },
    'de50a59': {
        'coll': 'faixa_etaria',
        'where': '50 a 59 anos',
        'obitos': None,
        'confirmados': None,
    },
    'de60a69': {
        'coll': 'faixa_etaria',
        'where': '60 a 69 anos',
        'obitos': None,
        'confirmados': None,
    },
    'de70a79': {
        'coll': 'faixa_etaria',
        'where': '70 a 79  anos',
        'obitos': None,
        'confirmados': None,
    },
    'maior80': {
        'coll': 'faixa_etaria',
        'where': '>= 80 anos',
        'obitos': None,
        'confirmados': None,
    },
}


