const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({
    authStrategy: new LocalAuth({dataPath: 'auth'})
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.initialize();


client.on('message', message => {
	console.log(message.body);

    if(message.body === '!ping') {
		message.reply('pong');
	}
});
