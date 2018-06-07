var SlackBot = require('slackbots');
var utils = require('./lib');
var args = process.argv.slice(2);
var http = require('http');

http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Greetings, traveler. What brings you here ?');
}).listen(80);

console.log('Server running at http://10.211.56.1:8080/');

if (args[0] == 'local') {
    var credentials = require('./config.json');
}

if (args[0] == 'online') {
    var credentials = { 
        "accessKeyId": process.env.ACCESS_KEY_ID, 
        "secretAccessKey": process.env.SECRET_ACCESS_KEY,
        "spreadsheetId": process.env.SPREADSHEET_ID,
        "s3Region": process.env.S3_REGION,
        "s3BucketPath": process.env.S3_BUCKET_PATH,
        "s3FileName": process.env.S3_FILENAME,
        "slackToken": process.env.SLACK_TOKEN,
        "slackBotName": process.env.SLACK_BOT_NAME,
        "slackMaster": process.env.SLACK_MASTER,
        "slackSelf": process.env.SLACK_SELF
    }
}

var bot = new SlackBot({
    token: credentials.slackToken, 
    name: credentials.slackBotName 
});

var COMMANDERS = [credentials.slackMaster];

var params = { };

var handleCommand = (command, commander, channel) => {
    if (COMMANDERS.indexOf(commander) > -1) {
        bot.postMessage(channel, `Order received: ${command}`, params);
        // UPDATE SHEET 
        if (command == "update spreadsheet") {
            utils.update(credentials, 
                (sheet_data) => {
                    let msg = `${sheet_data.length} rows written`;
                    bot.postMessage(channel, msg, params);
                    console.log(msg);
                }, 
                (err) => {
                    let msg = err.message;
                    bot.postMessage(channel, msg, params);
                    console.log(msg);
            });
        // AUTHORIZE
        } else if (command.startsWith("authorize")) {
            let users = command.match(/<@\w+>/g);
            if (users) { 
                users.forEach((item)=>{
                    let name = item.match(/\w+/g)[0];
                    if (COMMANDERS.indexOf(name) == -1) {
                        COMMANDERS.push(name); 
                    }
                });
            } else {
                bot.postMessage(channel, "Doesn't look like anything to me.", params);
            }
        // UNAUTHORIZE
        } else if (command.startsWith("unauthorize")) {
            let users = command.match(/<@\w+>/g);
            if (users) { 
                users.forEach((item)=>{
                    let name = item.match(/\w+/g)[0];
                    if (COMMANDERS.indexOf(name) > -1 && name != credentials.slackMaster) {
                        COMMANDERS.splice(COMMANDERS.indexOf(name),1); 
                    } else {
                        bot.postMessage(channel, "Can't remove root.", params);
                    }
                });
            } else {
                bot.postMessage(channel, "Doesn't look like anything to me.", params);
            }

        } else {
            bot.postMessage(channel, "I can't understand.", params);
        }
    } else {
        bot.postMessage(channel, "You can't command me.", params);
    }
};

bot.on('start', () => {
    bot.postMessage('#cctbxe', "Yes, I'm back online !", params);
});

bot.on('message', (data) => {
    // all ingoing events https://api.slack.com/rtm
    console.log(data);
    if (data.type == 'message') {
        let channel = data.channel;
        let [receiver, command] = data.text.split(" do ");
        if (receiver == `<@${credentials.slackSelf}>`) { 
            handleCommand(command, data.user, channel); 
        }
    }
});


