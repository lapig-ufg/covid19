import pandas as pd
import numpy as np
from update_covid19.db import engine 
from update_covid19.models.covid19 import Casos
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta


from update_covid19.config import logger


def start():
    logger.info('Iniciodo clear dos dados')
    date_filter = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
    sql = f"""--sql
    select data, sum(confirmados) as confirmados, sum(suspeitos) as suspeitos,
    sum(obitos) as obitos , sum(descartados) as descartados,
    sum(recuperados) as recuperados from casos where data < '{date_filter}' group by data order by data;"""

    dataframe = pd.read_sql(sql, engine).set_index('data')
    col = 'confirmados'
    del_error_by_columns(dataframe, col)

def del_error_by_columns(df, col):
    old = None
    old_datetime = None
    row = []
    Session = sessionmaker(bind=engine)
    session = Session()
    logger.info(f'Limpando dados para col:{col}')



    for dados in df[col].iteritems():
        valor = dados[1]
        dt_tmp = dados[0]
        try:
            if old is None:
                old = valor
                old_datetime = dt_tmp
            if int(str(old_datetime - dt_tmp).split(' ')[0]) > -60:
                if valor+110_000  < old:
                    result = session.query(Casos.id).filter(Casos.data == dt_tmp)
                    for r in result:
                        try:
                            sql_del = f"""--sql
                                DELETE FROM public.casos WHERE id={r[0]};"""
                            session.execute(sql_del)
                            logger.info(sql_del)
                        except:
                            logger.exception('erro na query de deletar')
                else:
                    #row.append(dados)
                    old = valor
                    old_datetime = dt_tmp
            else:
                #row.append(dados)
                old = valor
                old_datetime = dt_tmp
        except:
            logger.exception('Erro ao deletar dados')
    session.commit()
    session.close()

        