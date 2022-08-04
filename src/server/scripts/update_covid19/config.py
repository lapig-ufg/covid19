import sys
from loguru import logger


from dotenv import dotenv_values

config = dotenv_values("../.env")




confi_format='[ {time} | process: {process.id} | {level: <8}] {module}.{function}:{line} {message}'
rotation='500 MB'

try:
    if config["NODE_ENV"] == 'prod':
        logger.remove()
        logger.add(sys.stderr,level='INFO', format=confi_format)
except:
    ...   

logger.add('../../logs/update_py.log', rotation=rotation, level="INFO")
logger.add('../../logs/update_pyr_WARNING.log', level="WARNING", rotation=rotation)