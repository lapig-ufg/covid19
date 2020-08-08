#!/usr/bin/env python2
import csv, codecs, cStringIO
import gspread
import sys
import time
from oauth2client.service_account import ServiceAccountCredentials

reload(sys)

sys.setdefaultencoding('utf8')

scope = ['https://spreadsheets.google.com/feeds']

#Authentication file generated in google APIs:
credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)

#Spreadsheet credential ID:

#tabela_prev_casos_conf_municipios
docid2 = "1uCWUVbEaI8kQvQCuwsAGXuHc-Y8Ab_ottunsz3ib6M0"

#tabela_estatistica_municipios
docid3 = "1LeLPLxMqJMiCq5VQLtjO_e7hPtXWmSZxs5t9-1lYAgU"

#recuperados
docid5 = "1fO70w9OI1sbRiyHmD9HQZiG_Wa7vqrwpgSigeHRMAD4"

#tabela_prev_mod_logistico_luisa_adaptado
docid6 = "1x9zk22gE8p8suaqfdtm3rPLGHvxEIN8mMCU2Mn7XTkI"

#tabela_estatisticas_mod_logistico_luisa_adaptado
docid7 = "1ELlIaPqgSZubGQOJy1pXVQa60Az9YfjAfPZ1UeiKseY"

#dados_MM7_novos_casos
docid8 = "1wa6WKm2amGY47Klz5oedttvWpTPew2LbbbHwYKF2tds"


class UnicodeWriter:
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8") for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)


#Spreadsheet download function3
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid2)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid2 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
    time.sleep(10)

#Spreadsheet download function4
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid3)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid3 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
    time.sleep(10)

#Spreadsheet download function6
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid5)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid5 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
    time.sleep(10)

#Spreadsheet download function7
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid6)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid6 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
    time.sleep(10)

#Spreadsheet download function7
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid7)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid7 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
    time.sleep(10)

#Spreadsheet download function8
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid8)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid8 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
    time.sleep(10)
