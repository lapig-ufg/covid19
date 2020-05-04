#!/usr/bin/env python2
import csv, codecs, cStringIO
import gspread
import sys
from oauth2client.service_account import ServiceAccountCredentials

reload(sys)

sys.setdefaultencoding('utf8')

scope = ['https://spreadsheets.google.com/feeds']

#Authentication file generated in google APIs:
credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)

#Spreadsheet credential ID:

#PLANILHA COVID19
docid = "1mlyQIUbGKB2J3UIQrCPxAORaY5HYAPlMgY61IMCu4JY"

#tabela_casos_estados
docid1 = "163Agr2r4r4evn74SUkVojcdg-hq6urb0qcCMk5Pdknw"

#tabela_prev_casos_conf_municipios
docid2 = "1sMzwMlPThQ0-AVYeYAxjkPQ_0G82hOEyDDh-xTlaaf4"

#tabela_estatistica_municipios
docid3 = "1LeLPLxMqJMiCq5VQLtjO_e7hPtXWmSZxs5t9-1lYAgU"

#casos_por_bairro_em_municipios
docid4 = "1l_3ZlgEBdd53BZFhGktgzvnuze7s3r0QGwVQomfo1eU"

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

#Spreadsheet download function1
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())

#Spreadsheet download function2
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid1)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid1 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())

#Spreadsheet download function3
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid2)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid2 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())


#Spreadsheet download function4
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid3)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid3 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())

#Spreadsheet download function5
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid4)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid4 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
