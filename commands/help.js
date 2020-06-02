const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let botembed = new Discord.RichEmbed()
    .setColor("#5ad644")
    .addField(bot.user.username, "d!botinfo = Displays information about The Book of Dragons. \nd!rank [dragon] = Displays info and ranking of a dragon.");

    message.channel.send(botembed);
}

module.exports.help = {
  name:"help"
}