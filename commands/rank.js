const Discord = require("discord.js");
const fs = require("fs");
const readline = require('readline');
const {google} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';
const data = require('E:/Jeb_CC/Documents/Programming/Book of Dragons/index.js');

//To DO:
//Add top 10 list
//Get rid of case sensitive entries
//Fix dragon not found error being the error for everything (temporarily removed)

//Variable syntax:
//rFish = Referenced fish from sheet
//fFish = Final fish rank value
//dFish = Display calculations for fish rank
//iFish = Icon display for fish rank

module.exports.run = async (bot, message, args) => {
  try {
    args[0] = args[0].toLowerCase();
    args[1] = args[1].toLowerCase();
    args[2] = args[2].toLowerCase();
    args[3] = args[3].toLowerCase();
  } catch {
    //Convert all input to lowercase. If entry data missing, catch and continue.
  }
  
  //Converts all names from spreadsheet to lower case.
  for (i=0;i<1000;i++) {
    if (data.names[i]) {
    data.names[i] = data.names[i].toLowerCase();
    } else {
      break;
    }
  }
  var nameID = data.names.indexOf(args[0]);
  //Largest dragon name is 4 words (4 arguments). Check if arg is filled and combine into one string.
  if (args[1]) {nameID = data.names.indexOf(args[0] + " " + args[1])};
  if (args[2]) {nameID = data.names.indexOf(args[0] + " " + args[1] + " " + args[2])};
  if (args[3]) {nameID = data.names.indexOf(args[0] + " " + args[1] + " " + args[2] + " " + args[3])};
  var colorID;
  switch (data.rarity[nameID]) {
    case "Common": colorID = "#735835"; break;
    case "Uncommon": colorID = "B67126"; break;
    case "Rare": colorID = "163792"; break;
    case "Exclusive": colorID = "1F8E1D"; break;
    case "Unique": colorID = "#662789"; break;
    case "Premium": colorID = "#F2CB25"; break;
    //All collection dragons are Exclusive (I think) and can represent said colour if doesn't match the above.
    default: colorID = "1F8E1D"
  }

  //nameID=nameID.toLowerCase();
  //Array to find the max value for each row in the sheet. This is used for the ranking bar (purely aesthetics).
  //0 rTrain | 1 rFish | 2 rWood | 3 rBattle | 4 rIron 
  var max = [0,0,0,0,0];
  for (i=0; i<1000; i++) {
    if (!data.names[nameID]) {break;}
    try {if (max[0]<parseInt(data.rTrain[i])) {max[0]=parseInt(data.rTrain[i])}} catch {}
    try {if (max[1]<parseInt(data.rFish[i])) {max[1]=parseInt(data.rFish[i])}} catch {}
    try {if (max[2]<parseInt(data.rWood[i])) {max[2]=parseInt(data.rWood[i])}} catch {}
    try {if (max[3]<parseInt(data.rBattle[i])) {max[3]=parseInt(data.rBattle[i])}} catch {}
    try {if (max[4]<parseInt(data.rIron[i])) {max[4]=parseInt(data.rIron[i])}} catch {}
  }

  for (i=0;i<1000;i++) {
    if (global.output.items[i]) {
      global.output.items[i].title = global.output.items[i].title.toLowerCase();
    } else {
      break;
    }
  }
  //valName to Validate Name between sheet and API.
  var valName = global.output.items.findIndex(function(item, a){
  //Largest dragon name is 4 words (4 arguments). Check if arg is filled and combine into one string.
    if (args[3]) {return item.title === (args[0] + " " + args[1] + " " + args[2] + " " + args[3])} else {
      if (args[2]) {return item.title === (args[0] + " " + args[1] + " " + args[2])} else {
        if (args[1]) {return item.title === (args[0] + " " + args[1])} else {
          return item.title === args[0]
        }
      }
    }
  });

  //If dragon does not collect the below resource it converts from undefined to 0.
  iFish = "";
  iWood = "";
  iIron = "";
  iTrain = "";
  iBattle = "";
  let fIron = data.rIron[nameID];
  if (!fIron) fIron = "0", iIron = ":x:";
  let fFish = data.rFish[nameID];
  if (!fFish) (fFish = "0", iFish = ":x:");
  let fWood = data.rWood[nameID];
  if (!fWood) fWood = "0", iWood = ":x:";
  let fBattle = data.rBattle[nameID];
  if (!fBattle) fBattle = "0", iBattle = ":x:";
  let fTrain = data.rTrain[nameID];
  //No if statement required for Training rank as every dragon always has a training rank.

  //Get % of resource ranking compared to the max ranking.
  //For each multiple of 10, add an icon to the display.
  let dFish = (fFish / max[1] * 100);
  if (dFish) {
    for (i=100; i>dFish; i=i-10) {
      iFish = iFish + " :blue_square:";
    }
  }

  let dWood = (fWood / max[2] * 100);
  if (dWood) {
    for (i=100; i>dWood; i=i-10) {
      iWood = iWood + " :purple_square:";
    }
  }
  
  let dIron = (fIron / max[4] * 100);
  if (dIron) {
    for (i=100; i>dIron; i=i-10) {
      iIron = iIron + " :orange_square:";
    }
  }

  let dBattle = (fBattle / max[3] * 100);
  if (dBattle) {
    for (i=100; i>dBattle; i=i-10) {
      iBattle = iBattle + " :red_square:";
    }
  }

  let dTrain = (fTrain / max[0] * 100);
  for (i=100; i>dTrain; i=i-10) {
    iTrain = iTrain + " :green_square:";
  }

//0 rTrain | 1 rFish | 2 rWood | 3 rBattle | 4 rIron 
  try {
  let rankEmbed = new Discord.RichEmbed()
    .setTitle(data.names[nameID].toUpperCase())
    .setDescription("Global Rank #" + data.rGlobal[nameID])
    .setColor(colorID)
    .addField("Training :clock3:", "#" + fTrain + " / " + max[0] + "\n" + iTrain, false)
    .addField("Fish :fish:", "#" + fFish + " / " + max[1] + "\n" + iFish, false)
    .addField("Wood :evergreen_tree:", "#" + fWood + " / " + max[2] + "\n" + iWood, false)
    .addField("Battle :crossed_swords:", "#" + fBattle + " / " + max[3] + "\n" + iBattle, false)
    .addField("Iron :pick:", "#" + fIron + " / " + max[4] + "\n" + iIron, false)
    .setThumbnail(global.output.items[valName].thumbnail);
    //.setImage(global.output.items[valName].thumbnail);
    message.channel.send(rankEmbed);
  } 
      catch(err) {
        message.channel.send("Something went wrong. :slight_frown: \nPlease report this to Jeb!");
      };
  }


module.exports.help = {
  name: "rank"
}
