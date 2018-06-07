### Getting Started
```bash
npm install
```
```bash
touch config.json
```
fill out the following form in your config.json

```
{ 
    "accessKeyId": <ACCESS_KEY_ID>, 
    "secretAccessKey": <SECRET_ACCESS_KEY>,
    "spreadsheetId": <SPREADSHEET_ID>,
    "s3Region": <S3_REGION>,
    "s3BucketPath": <S3_BUCKET_PATH>,
    "s3FileName": <S3_FILENAME>
}
```
and run !
```
node update
```
