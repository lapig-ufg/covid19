#Imports the required libraries
#Sources:https://www.programcreek.com/python/example/88814/pydrive.drive.GoogleDrive

from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive

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
  if(file['title'] == "Projections"):
      fileID = file['id']

#Delete existing file
for a_file in drive.ListFile({'q': "title = 'Jatai.txt' and trashed=false"}).GetList():
    # print the name of the file being deleted.
    print('Deleting File Exist: %s, ID: %s' % (a_file['title'], a_file['id']))
    # delete the file permanently.
    a_file.Delete()

#Create file in folder
file1 = drive.CreateFile({"mimeType": "text/plan", "parents": [{"kind": "drive#fileLink", "id": fileID}]})
file1.SetContentFile("Jatai.txt")
file1.Upload() # Upload the file.
print('Created file %s with mimeType %s' % (file1['title'], file1['mimeType']))  

#Delete existing file
for a_file in drive.ListFile({'q': "title = 'RioVerde.txt' and trashed=false"}).GetList():
    # print the name of the file being deleted.
    print('Deleting File Exist: %s, ID: %s' % (a_file['title'], a_file['id']))
    # delete the file permanently.
    a_file.Delete()

#Create file in folder
fileList = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()

file2 = drive.CreateFile({"mimeType": "text/plan", "parents": [{"kind": "drive#fileLink", "id": fileID}]})
file2.SetContentFile("RioVerde.txt")
file2.Upload() # Upload the file.
print('Created file %s with mimeType %s' % (file2['title'], file2['mimeType']))  

#Delete existing file
for a_file in drive.ListFile({'q': "title = 'Mineiros.txt' and trashed=false"}).GetList():
    # print the name of the file being deleted.
    print('Deleting File Exist: %s, ID: %s' % (a_file['title'], a_file['id']))
    # delete the file permanently.
    a_file.Delete()

#Create file in folder
fileList = drive.ListFile({'q': "'root' in parents and trashed=false"}).GetList()

file3 = drive.CreateFile({"mimeType": "text/plan", "parents": [{"kind": "drive#fileLink", "id": fileID}]})
file3.SetContentFile("Mineiros.txt")
file3.Upload() # Upload the file.
print('Created file %s with mimeType %s' % (file3['title'], file3['mimeType']))  
