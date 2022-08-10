const qrcode = require('qrcode-terminal');
const configfile = require('./config.json');
const fs = require('fs');
const { Client, LocalAuth } = require('whatsapp-web.js');

const worker = `auth/session/Default/Service Worker`;
if (fs.existsSync(worker)) {
  fs.rmSync(worker, { recursive: true });
}



const client = new Client({
  authStrategy: new LocalAuth({
      dataPath: 'auth'
  }),
  puppeteer: {
      headless: false,
      executablePath: configfile.PathToChrome,
      args: ['--no-sandbox']
  }
});



function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async (msg) => {


  console.log('Message from: ', msg.from, " - ", msg.body);


    if(msg.from == configfile.SourceGroup && msg.body != '!del'){

        console.log(msg.type);
        for (var Group in configfile.ForwarToGroups){
          
            if (msg.type == 'chat') {
                console.log("Send message")
                await client.sendMessage(configfile.ForwarToGroups[Group], msg.body);
            } else if (msg.type == 'ptt') {
                console.log("Send audio")
                let audio = await msg.downloadMedia();
                await client.sendMessage(configfile.ForwarToGroups[Group], audio, {sendAudioAsVoice: true});
            } else if (msg.type == 'image' || msg.type == 'video') {
                console.log("Send image/video")
                let attachmentData = await msg.downloadMedia();
                // Error mostly comes from sending video
                await client.sendMessage(configfile.ForwarToGroups[Group], attachmentData, {caption: msg.body});
            }
            await sleep(1000)
            
           /* msg.forward(configfile.ForwarToGroups[Group])*/
            console.log(`forward message to ${configfile.ForwarToGroups[Group]}`)


        }
    }else if(msg.from == configfile.SourceGroup && msg.body == '!del'){

        for(var Group in configfile.ForwarToGroups){

          let chat = await client.getChatById(configfile.ForwarToGroups[Group]);
          let [lastMessage] = await chat.fetchMessages({limit: 1});
          await lastMessage.delete(true);
          
       }

    }

    if(configfile.Owner.includes(msg.from.split('@c.us')[0])){
      if (msg.body == '!ping') {
        msg.reply('pong')
        } else if (msg.body == '!groups') {
        client.getChats().then(chats => {
          const groups = chats.filter(chat => !chat.isReadOnly && chat.isGroup);
          if (groups.length == 0) {
            msg.reply('You have no group yet.');
          } else {
            let groupsMsg = '*All active groups listed below:*\n\n';
            groups.forEach((group, i) => {
              groupsMsg += `ID: ${group.id._serialized}\nName: ${group.name}\n\n`;
            });
            msg.reply(groupsMsg)
          }
        });
      }
    }
  });


client.initialize();
