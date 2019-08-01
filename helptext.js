const Discord = require('discord.js');

const embed = new Discord.RichEmbed()
 .setTitle("Invite me to your server here")
 .setAuthor("Pin Archiver Bot | By LiquidZulu")
 .setColor(0xC20000)
 .setDescription("**You need manage message permissions to use commands**\n\nTo set up the bot use the `@pinarchiver init` command in your desired pin archive channel.\n\nThen use `initpinarchive` to archive the pins in given channels.\n\nThen the pins will be saved to this channel, when a channel runs out of pin space use `purgepins` to reset it.")
 .setFooter("Made by LiquidZulu")
 .setThumbnail("https://cdn.discordapp.com/avatars/395191925822455808/1f639ba1c65d947339a782fea404fffd.png")
 .setTimestamp()
 .setURL('https://discord-pinarchiver.glitch.me/')
 .addField("@pinarchiver init",
   "Used to denote the current channel as the pin archive\n\n"
   )
 .addField("initpinarchive CHANNEL_1 CHANNEL_2 ... CHANNEL_N",
   "Used to archive pins of given channels through either channel id's or #channelname\n\n"
   )
 .addField("purgepins CHANNEL_1 CHANNEL_2 ... CHANNEL_N",
   "Used to delete pins in given channels"
   )

module.exports = {embed}