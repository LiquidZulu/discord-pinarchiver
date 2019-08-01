function logMsg(message){
	console.log('\n//////////////////////////////////////\n');
	console.log('-----------RECEIVED MESSAGE-----------');
	console.log('CHANNEL ID: ' + message.channel.id);
  console.log('CHANNEL NAME: ' + message.channel.name);
	console.log('MESSAGE ID: ' + message.id);
	console.log('SENDER: ' + message.author);
	console.log('CONTENT: ' + message.content);
	console.log('CREATED AT: ' + message.createdAt);
	console.log('EMBEDS: ' + message.embeds);
	console.log('TYPE: ' + message.type);
	console.log('WEBHOOK ID (IF APPLICABLE): ' + message.webhookID);
	console.log('\n//////////////////////////////////////\n\n');
  
  /*if (message.channel.id !== '373438023511048192'){
    client.channels.get(config.messageLogs).send('\n//////////////////////////////////////\n\n-----------RECEIVED MESSAGE-----------\nCHANNEL ID: ' + message.channel.id + '\nCHANNEL NAME: ' + message.channel.name + '\nMESSAGE ID: ' + message.id + '\nSENDER: ' + message.author.substring(1) + '\nCONTENT: ' + message.content + '\nCREATED AT: ' + message.createdAt + '\nEMBEDS: ' + message.embeds + '\nTYPE: ' + message.type + '\nWEBHOOK ID (IF APPLICABLE): ' + message.webhookID + '\n\n//////////////////////////////////////\n\n');
  }*/
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////

// Import the discord.js module
const Discord = require('discord.js');
const got = require('got');
const fs = require('fs');
const { getColorFromURL } = require('color-thief-node');

// Create an instance of a Discord client
const client = new Discord.Client();

// The token of your bot - https://discordapp.com/developers/applications/me
const token = process.env.TOKEN;

const FLAGS = {
  PERMS_ALLOW_PERMISSIONS: 0b00000001
}

var guilds = {}
var activities;
var currentIndex = 0;
var me = null;

client.on('ready', () => { 
  console.log('I am ready!');
  me = client.users.find('id', '293462954240638977')
  activities = {time: 15000};
  setInterval(() => {
    activities.arr = [`Running on ${client.guilds.array().length} servers.`, `Serving ${client.users.array().length} users.`, '@PinArchiver help', 'By LiquidZulu | http://liquidzulu.xyz', `Online since ${client.readyAt}.`]
    client.user.setActivity(activities.arr[currentIndex]);
    if (currentIndex < activities.arr.length - 1) currentIndex ++; else currentIndex = 0;
  }, activities.time)
})

// Create an event listener for messages
client.on('message', async message => {
  
  // If the message was sent by the bot itself, end this function early
  if (message.author.id == client.user.id) return;
  
  // Split a message into an array to process commands
  var cmsg = message.content.split(' ');
  
  // Do things for valid commands
  switch(cmsg[0]) {
    case 'initpinarchive':
      try {
        if(!testPerms(message, FLAGS.PERMS_ALLOW_PERMISSIONS, 0x00002000)) throw `<@${message.author.id}> has insufficient permissions to use this command`
        else{message.channel.send(`Initiating pinarchive for <#${cmsg[1]}>`)}
        
        cmsg.shift(); // remove the first element of the array and discard it
        var pins = [];
        for (let cid of cmsg) { // for every channel ID separated by space
          let myChannel = client.channels.get(cid); // get the channel by the provided ID
          pins = pins.concat((await myChannel.fetchPinnedMessages()).array()); // if no pins yet, make it this channel's pins
        }
        // sort the pins from oldest to newest
        pins = pins.sort((one, another) => one.createdTimestamp > another.createdTimestamp ? 1 : -1);
        for (let msg of pins) { // for every pinned message we found
          addpin(msg);
        }
      } catch (e) {
        console.error(e);
        message.channel.send('Error: '+e);
      }
      
      break; // Break before the next case or it will fall through
      
      //Purging old pins
    case 'purgepins':
      try {
        if(!testPerms(message, FLAGS.PERMS_ALLOW_PERMISSIONS, 0x00002000)) throw `<@${message.author.id}> has insufficient permissions to use this command`
        else{
          switch(cmsg[1][0]){
            case "<":{
              {
                message.channel.send(`Purging pins in ${cmsg[1]}`)
              }
              break;
            }
            
            default:{
              {
                message.channel.send(`Purging pins in <#${cmsg[1]}>`)
              }
            }
          }
        }
        
        cmsg.shift();
        var pins = [];
        for (let cid of cmsg) { // for every channel ID separated by space
          console.log(cid);
          if(cid[0] == '<'){
            cid = cid.substring(2, 20)
          }
          console.log(cid);
          let myChannel = client.channels.get(cid); // get the channel by the provided ID
          pins = pins.concat((await myChannel.fetchPinnedMessages()).array()); // if no pins yet, make it this channel's pins
        }
        for (let msg of pins) {
          await msg.unpin();
        }
      } catch (e){
        console.error(e);
        message.channel.send('Error: '+e);
      }
      break;
      
    case `<@${client.user.id}>`:{
      {
        switch(cmsg[1]){
            
            case 'init':{
              {
                try{
                  if(!testPerms(message, FLAGS.PERMS_ALLOW_PERMISSIONS, 0x00002000)) throw `<@${message.author.id}> has insufficient permissions to use this command`
                  
                  let channels = require('./channels.json');
                  channels[message.guild.id] = message.channel.id;
                  console.log(channels);

                  let isError = false;

                  fs.writeFile("./channels.json", JSON.stringify(channels), (e) => {
                    if(e) {
                      isError = true;
                      message.channel.send(`An error has occurred in trying to save your preferences, please report the following error here: https://garfield-comics.glitch.me/feedback
        \`\`\`
        ${e}\`\`\``);
                      return console.log(e);
                    }
                  });

                  if(!isError) message.channel.send(`<#${message.channel.id}> has been saved as the pin archive`);
                  
                } catch (e) {
                  console.error(e);
                  message.channel.send('Error: '+e);
                }
                
              }
              break;
            }
            
          case 'help':{
            {
              try {
                message.channel.send(require('./helptext.js'));
              }
              
              catch (e) {
                console.error(e);
                message.channel.send('Error: '+e);
              }
            }
            break;
          }
        }
      }
      break;
    }
  }
  
  //Making bot log new pins
  if (message.type === 'PINS_ADD') {
    
    console.log('\n\n\nPIN\n\n\n');
    let msg = (await message.channel.fetchPinnedMessages()).first();
    addpin(msg);
  }
  
 
  
});

async function addpin(msg){
                                  
  var msUrl = `https://discordapp.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id}`;
  if (!msg.content) msg.content = 'Original message, if no image appears it is likely a video'
  
  let links = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-].((a)?png|jpg|gif(v)?|bmp|svg|ico)){1}/gmi.exec(msg.content);
  if(links == null) links = [];
                                  
  let embed = new Discord.RichEmbed()
    .setAuthor(msg.author.username + '#' + msg.author.discriminator, msg.author.displayAvatarURL)
    .setTimestamp(msg.createdAt)
    .setDescription(`[${msg.content}](${msUrl} "Link to original meassage")`)
    .setFooter("Pinned in #"+msg.channel.name)
    .setURL();
  if (msg.attachments.size > 0){ 
    embed.setImage(msg.attachments.first().url); 
    embed.setColor(await getColorFromURL(msg.attachments.first().url))
  }
  else if(links.length > 0) {
    embed.setImage(links[0]);
    embed.setColor(await getColorFromURL(links[0]))
  }
  else if(msg.embeds.length > 0){
    let em = msg.embeds[0];
    embed
     .setColor(em.color)
     .setDescription(`[${em.title}](${msUrl} "Link to original meassage")`)
     .addField("Description", em.description)
     //.setImage(em.image)
     .setAuthor(em.author.name)
    try{
      embed.setImage(em.thumbnail.url)
    }catch(e){
      try{
        embed.setImage(em.image.url)
      }catch(e){
        console.log(em);
      }
    }
  }
  let pinArchive = client.channels.get(require('./channels.json')[msg.guild.id]);
  await pinArchive.send(embed);
  return;
}

function testPerms(message, flags=0xFF, perms=0x00002000){
  if(flags & FLAGS.PERMS_ALLOW_PERMISSIONS){
    return (message.author.id == message.guild.ownerID || message.author == me || message.member.hasPermission(perms, false, true, true))
  }
  return (message.author.id == message.guild.ownerID || message.author == me)
}

// Log our bot in
client.login(token);



/* --- WEB SERVER THAT REQUESTS ITSELF --- */ // https://discordapp.com/oauth2/authorize?client_id=395191925822455808&scope=bot&permissions=125952

const express = require('express');
const app = express();

app.get('/', (req, res) => res.redirect('https://discordapp.com/oauth2/authorize?client_id=395191925822455808&scope=bot&permissions=125952'));
app.get('/run', (req, res) => res.send('ok glitch let me run my project lol'));

app.listen(process.env.PORT, () => console.log('Example app listening on port whatever!'));

setInterval(async function() {
  try {
    var ween = await got(`http://${process.env.PROJECT_DOMAIN}.glitch.me/run`);
    console.log(ween.body);
  } catch (e) {
    console.log("couldn't get myself");
  }
}, 3 * 60 * 1000)