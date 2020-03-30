#!/usr/bin/env python2
import csv
import gspread
from oauth2client.service_account import ServiceAccountCredentials

scope = ['https://spreadsheets.google.com/feeds']

#Authentication file generated in google APIs:
credentials = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)

#Spreadsheet credential ID:
docid = "1I4BM9x3CKNFAwLlm_EN3RrLOBhLZK_M-SWFPmLEbohY"

docid1 = "1onQ_CDx2359c-ZTsmcyOm9f77JJM2zDgNXuK2VV-Kkw"

client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = csv.writer(f)
        writer.writerows(worksheet.get_all_values())

client = gspread.authorize(credentials)
spreadsheet = client.open_by_key(docid1)
for i, worksheet in enumerate(spreadsheet.worksheets()):
    filename = docid1 + '-worksheet' + str(i) + '.csv'
    with open(filename, 'wb') as f:
        writer = csv.writer(f)
        writer.writerows(worksheet.get_all_values())