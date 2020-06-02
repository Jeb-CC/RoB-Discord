const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    let bicon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
    .setDescription("Bot Information")
    .setColor("#5ad644")
    .setThumbnail(bicon)
    .addField(bot.user.username, "Unofficial bot companion for Rise of Berk. Send bug reports to @Jeb_CC#0001. \nFuture ideas include: quiz, top 10 list.");

    message.channel.send(botembed);
}

module.exports.help = {
  name:"botinfo"
}