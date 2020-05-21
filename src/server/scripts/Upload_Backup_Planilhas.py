#!/usr/bin/env python3
#Imports the required libraries
#Sources:https://www.programcreek.com/python/example/88814/pydrive.drive.GoogleDrive

from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
from datetime import datetime

gauth = GoogleAuth()
# Try to load saved client credentials
gauth.LoadCredentialsFile("mycreds.txt")
if gauth.credentials is None:
    # Authenticate if they're not there
    gauth.LocalWebserverAuth()
elif gauth.access_token_expired:
    # Refresh them if expired
    gauth.Refresh()
else:
    # Initialize the saved creds
    gauth.Authorize()
# Save the current credentials to a file
gauth.SaveCredentialsFile("mycreds.txt")

drive = GoogleDrive(gauth)

# View all folders and file in your Google Drive
fileList = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()
for file in fileList:
  print('File: %s, ID: %s' % (file['title'], file['id']))
  # Get the folder ID that you want
  if(file['title'] == "Backup Planilhas"):
      fileID = file['id']

#Create file in folder
fileList = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()

file4 = drive.CreateFile({"mimeType": "text/csv", "parents": [{"kind": "drive#fileLink", "id": fileID}]})
stringDate = datetime.today().strftime('%d-%m-%Y')
file4.SetContentFile('confirmados-' + stringDate + '.csv')
file4.Upload() # Upload the file.
print('Created file %s with mimeType %s' % (file4['title'], file4['mimeType']))  


#Create file in folder
fileList = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()

file5 = drive.CreateFile({"mimeType": "text/csv", "parents": [{"kind": "drive#fileLink", "id": fileID}]})
stringDate = datetime.today().strftime('%d-%m-%Y')
file5.SetContentFile('obitos-' + stringDate + '.csv')
file5.Upload() # Upload the file.
print('Created file %s with mimeType %s' % (file5['title'], file5['mimeType']))  
