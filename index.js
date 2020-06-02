const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();
const https = require('https');
var output = "";

https.get('https://riseofberk.fandom.com/api/v1/Articles/List?expand=1&limit=1000&category=Dragons', (resp) => {
  let data = '';

  // A chunk of data has been recieved.
  resp.on('data', (chunk) => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    //console.log("Response:", JSON.parse(data));
    global.output = JSON.parse(data);
    /*
    for (i=0;i<1000;i++) {
      if (global.output.items.title[i]) {
        console.log(global.output.items.title[i]);
        
        //global.output.items.title[i] = global.output.items.title[i].toLowerCase();
      } else {
        break;
      }
    }
    */
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), listDragon);
  });
  
/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials, callback) {
const {client_secret, client_id, redirect_uris} = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

// Check if we have previously stored a token.
fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
});
}
  
/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
});
console.log('Authorize this app by visiting this url:', authUrl);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error while trying to retrieve access token', err);
    oAuth2Client.setCredentials(token);
    // Store the token to disk for later program executions
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
    });
    callback(oAuth2Client);
    });
});
}

const data = {
names : [],
breed : [],
rarity : [],
rTrain : [],
rFish : [],
rWood : [],
rBattle : [],
rIron : [],
rGlobal : []
}

module.exports = data;
  
function listDragon(auth) {
const sheets = google.sheets({version: 'v4', auth});
sheets.spreadsheets.values.get({
    spreadsheetId: '1vkWCIdY0w2nJ6IzNXlY5RL2EHdnVA1g-_BIsYTo6ubE',
    range: 'Statistics!C6:AG',
}, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
    rows.map((row) => {
    data.names.push(`${row[0]}`);
    data.breed.push(`${row[1]}`);
    data.rarity.push(`${row[2]}`);
    data.rTrain.push(`${row[4]}`);
    data.rFish.push(`${row[5]}`);
    data.rWood.push(`${row[8]}`);
    data.rBattle.push(`${row[11]}`);
    data.rIron.push(`${row[13]}`);
    data.rGlobal.push(`${row[30]}`);

    
    });
    } else {
    console.log('No data found.');
    }
});
}

/**
 * @see https://docs.google.com/spreadsheets/d/1vkWCIdY0w2nJ6IzNXlY5RL2EHdnVA1g-_BIsYTo6ubE/edit
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
  
//Purely for testing and console logging purposes.
function listStats(row){
    console.log(data.names[row]);
    console.log(data.breed[row]);
    console.log(data.rarity[row]);
    console.log(data.rTrain[row]);
};

fs.readdir("./commands/", (err, files) => {
    if(err) console.log(err);
    let jsfile = files.filter(f => f.split(".").pop() === "js")
    if(jsfile.length <= 0){
      console.log("Couldn't find commands.");
      return;
    }
    jsfile.forEach((f, i) =>{
      let props = require(`./commands/${f}`);
      console.log(`${f} loaded!`);
      bot.commands.set(props.help.name, props);
    });
  });

bot.on("ready", async () => {
    console.log(`${bot.user.username} is online on ${bot.guilds.size} servers!`);
    /*var random = Math.floor(Math.random() * 5 + 1);
    switch (random) {
      case 1: bot.user.setActivity("Polishing Dragon Scales");
      case 2: bot.user.setActivity("Waiting for Clear Skies");
      case 3: bot.user.setActivity("Counting Dragons");
      case 4: bot.user.setActivity("Cleaning Dragon Roosts");
      case 5: bot.user.setActivity("Gossiping with Vikings");
    }
    */
    bot.user.setActivity("Rise of Berk | d!help");
});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);

  if (message.isMentioned(bot.user.id)) {
    message.reply("Yes, I am working!");
  }
});

bot.login(botconfig.token);


