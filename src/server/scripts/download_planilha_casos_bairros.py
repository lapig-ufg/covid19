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

#casos_por_bairro_em_municipios
docid4 = "1l_3ZlgEBdd53BZFhGktgzvnuze7s3r0QGwVQomfo1eU"

#obitos_por_bairros_em_municipios
docid9 = "1H7k1RwWqUCcqkMlr7puEx2bgftsrLk7MwEpXNkuN_F4"

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

#Spreadsheet download function5
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid4)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid4 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
    time.sleep(10)

#Spreadsheet download function9
client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid9)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid9 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)
        writer.writerows(worksheet.get_all_values())
    time.sleep(10)
