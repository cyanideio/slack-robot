var gsjson = require('google-spreadsheet-to-json');
var S3FS = require('s3fs');

/*
 * config.json example
{ 
    "accessKeyId": <ACCESS_KEY_ID>, 
    "secretAccessKey": <SECRET_ACCESS_KEY>,
    "spreadsheetId": <SPREADSHEET_ID>,
    "s3Region": <S3_REGION>,
    "s3BucketPath": <S3_BUCKET_PATH>,
    "s3FileName": <S3_FILENAME>
    "slackToken": <SLACK_TOKEN>,
    "slackBotName": <SLACK_BOT_NAME>  
}
*/

exports.update = function(credentials, success, fail) {

    let s3Options = {
        region: credentials.s3Region,
        accessKeyId: credentials.accessKeyId, 
        secretAccessKey: credentials.secretAccessKey 
    };

    let fsImpl = new S3FS(credentials.s3BucketPath, s3Options);
    let writeOptions = { ACL:"public-read" }

    gsjson({
        spreadsheetId: credentials.spreadsheetId,
    })
    .then((sheet_data) => {
        fsImpl.writeFile(credentials.s3FileName, 
            JSON.stringify(sheet_data), 
            writeOptions,
            (err) => {
                if (err) { fail(err); }
                success(sheet_data);
        });
    })
    .catch((err) => {
        fail(err);
        console.log(err.message);
        console.log(err.stack);
    });

}
