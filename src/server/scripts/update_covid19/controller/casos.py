import tempfile
from unicodedata import normalize
from datetime import datetime

import pandas as pd
from requests import get, post
from sqlalchemy.orm import sessionmaker

from update_covid19.db import engine
from update_covid19.models.covid19 import Casos, Obitos, constructor


def get_suspeitos():
    url = 'https://indicadores.saude.go.gov.br/pentaho/plugin/cda/api/doQuery'
    try:
        response = post(
            url,
            data={
                'path': '/coronavirus/paineis/painel.cda',
                'dataAccessId': 'DSBigNumberSuspeitos',
            },
        )
        return response.json()['resultset'][0][0]
    except:
        ...


def get_dados_DF():
    url = 'https://xx9p7hp1p7.execute-api.us-east-1.amazonaws.com/prod/PortalEstado'
    try:
        response = get(url).json()
        ob = [data for data in response if data['_id'] == 'DF'][0]
        return {
            'confirmados': ob['casosAcumulado'],
            'obitos': ob['obitosAcumulado'],
        }
    except:
        ...


def CSV_to_df(url):
    response = get(url)
    try:
        with tempfile.NamedTemporaryFile() as tmp:
            print(tmp.name)
            tmp.write(response.content)
            df = pd.read_csv(tmp.name, sep=';')
        return df
    except:
        return None


def get_confirmados(df, coll):
    return (
        df[['municipio', 'cd_geocmu', coll]]
        .groupby(['cd_geocmu', 'municipio'])
        .count()
    )


def get_by_coll(df, coll, where):
    return (
        df[df[coll] == where][
            [
                'municipio',
                'cd_geocmu',
                'qtde',
            ]
        ]
        .groupby(['cd_geocmu', 'municipio'])
        .count()
    )


def normalasi(df):
    df = df.reset_index(level=['cd_geocmu', 'municipio'])
    df['cd_geocmu'] = df['cd_geocmu'].astype(int)
    return df

def utf82ascii(string):
    return normalize('NFKD', string).encode('ASCII','ignore').decode('ASCII')

def update():
    url_casos_confirmados = (
        'http://datasets.saude.go.gov.br/coronavirus/casos_confirmados.csv'
    )
    url_obitos_confirmados = (
        'http://datasets.saude.go.gov.br/coronavirus/obitos_confirmados.csv'
    )

    replace = {
        'codigo_ibge': 'cd_geocmu',
        'municipio_residencia': 'municipio',
    }

    dfs = constructor

    DF = get_dados_DF()

    date = datetime.now().strftime('%Y-%m-%d %H:%M')

    DF_data = {'cd_geocmu': 5300108, 'municipio': utf82ascii('BRASÍLIA'), 'data': date}

    df_and_suspeitos = [
        Casos(
            **{
                'cd_geocmu': 111,
                'confirmados': get_suspeitos(),
                'obitos': 0,
                'data': date,
                'municipio': utf82ascii('SUSPEITOS'),
            }
        ),
        Casos(**DF, **DF_data),
        Obitos(obitos=DF['obitos'], **DF_data),
    ]

    casos_confirmados = CSV_to_df(url_casos_confirmados)
    obitos_confirmados = CSV_to_df(url_obitos_confirmados)

    df_casos_confirmados = casos_confirmados.rename(columns=replace).drop(
        [
            'data_inicio_sintomas',
            'ano_epi',
            'semana_epi',
            'raca_cor',
            'diabetes',
            'doenca_cardiovascular',
            'doenca_respiratoria',
            'imunossupressao',
            'gestante',
            'puerpera',
            'regiao_saude',
            'recuperado',
            'profissional_saude',
        ],
        axis=1,
    )

    df_casos_confirmados['confirmados'] = 1
    df_casos_confirmados['qtde'] = 1

    df_obitos_confirmados = obitos_confirmados.rename(columns=replace).drop(
        [
            'data_inicio_sintomas',
            'ano_epi',
            'semana_epi',
            'raca_cor',
            'diabetes',
            'doenca_cardiovascular',
            'doenca_respiratoria',
            'imunossupressao',
            'gestante',
            'puerpera',
            'regiao_saude',
        ],
        axis=1,
    )
    df_obitos_confirmados['obitos'] = 1
    df_obitos_confirmados['qtde'] = 1

    obitos = pd.DataFrame()
    confirmados = pd.DataFrame()
    for query in dfs:
        if query == 'queryConfimdos':
            obito = get_confirmados(df_obitos_confirmados, 'obitos')
            confirmado = get_confirmados(df_casos_confirmados, 'confirmados')
            dfs[query]['obitos'] = obito
            dfs[query]['confirmados'] = confirmado
            obitos = pd.concat([obitos, obito], axis=1)
            confirmados = pd.concat([confirmados, confirmado, obito], axis=1)
        else:
            where = dfs[query]['where']
            coll = dfs[query]['coll']

            obito = get_by_coll(df_obitos_confirmados, coll, where).rename(
                columns={'qtde': query}
            )

            confirmado = get_by_coll(df_casos_confirmados, coll, where).rename(
                columns={'qtde': query}
            )

            dfs[query]['obitos'] = obito
            dfs[query]['confirmados'] = confirmado

            obitos = pd.concat([obitos, obito], axis=1)
            confirmados = pd.concat([confirmados, confirmado], axis=1)

    obitos['data'] = date
    confirmados['data'] = date

    obitos = normalasi(obitos).fillna(0)

    #obitos['cd_geocmu'] = obitos['cd_geocmu'].apply(utf82ascii)
    obitos['municipio'] = obitos['municipio'].apply(utf82ascii)

    confirmados = normalasi(confirmados).fillna(0)

    #confirmados['cd_geocmu'] = confirmados['cd_geocmu'].apply(utf82ascii)
    confirmados['municipio'] = confirmados['municipio'].apply(utf82ascii)


    all_data = [
        *df_and_suspeitos,
        *[Obitos(**row) for row in obitos.to_dict('records')],
        *[Casos(**row) for row in confirmados.to_dict('records')],
    ]

    Session = sessionmaker(bind=engine)
    session = Session()
    session.add_all(all_data)
    session.commit()
