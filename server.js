var SlackBot = require('slackbots');
var utils = require('./lib');
var credentials = require('./config.json');

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


