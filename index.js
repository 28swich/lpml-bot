const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

const KEY = process.env.KEY;

bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
    
});

bot.onText(/\/list/, (msg) => {

    const chatId = msg.chat.id;
    var resp = "";
    var data = getData("getusers.php");
    for(key in data){
	resp += key + " : " + data.key + "\n";
    }
    bot.sendMessage(chatId, resp);
    
    
});

function getData(path){

    var url = "lpml.kl.com.ua" + path;
    request.post(url, {json: {key:KEY}}, function (error, response, body){
	if(error){
	    console.log(error);
	}else{
	    return JSON.parse(body);
	}
	    
    });
    
}

function sendData(path, data){

    var url = "http://lpml.kl.com.ua/" + path;
    request.post(url, data, function (error, response, body){
        if (error){
	    console.log(error);
	}else{
	    //console.log(data);
	}
    });
    
}


bot.onText(/^\/start$/i, (msg) => {

    const chatId = msg.chat.id;
    const first_name = msg.chat.first_name;
    const resp = "Привіт " + first_name + ",\nЯ допоможу тобі з розкладом та нагадаю про важливі події.\nЩоб дізнатись що я можу напиши /help";
    bot.sendMessage(chatId, resp);
    
    
});

bot.onText(/^\/help$/i, (msg) => {

    const chatId = msg.chat.id;
    const resp = "Список моїх команд:\n/class - вибери з якого ти класу\n/today(/td) - розклад уроків на сьогодні\n/tomorrow(/tm) - розклад уроків на завтра\n/timetable(/tt) - розклад на весь тиждень\n/time - розклад дзвінків\nВсі команди що в дужках це скорочення";
    bot.sendMessage(chatId, resp);
    
});


bot.onText(/^\/class$/i, (msg) => {

    const chatId = msg.chat.id;
    const resp = "Напиши з якого ти класу\n(наприклад: '10в')";
    
    bot.sendMessage(chatId, resp).then(() => {
	states[chatId] = 1;
    });
    
});


var states = {};
bot.onText(/(.+)/, (msg, match) => {

    const chatId = msg.chat.id;

    if(states[chatId] == 1){
	const uClass = match[1];
	var m = uClass.match(/^(\d{1,2})([абвгдАБВГД])$/); 
	if (m){
	    const c = m[1] + "-" + m[2].toUpperCase();
	    const resp = "Твій клас тепер: " + c;
	    bot.sendMessage(chatId, resp).then(() => {
		states[chatId] = 0;
		sendData("setuser.php", {json: {chatid:chatId, uclass:c, key:KEY}})	
	    });
	}else{
	    const resp = "Неправильний формат класу\nСпробуй знову\n(Має бути наприклад: '10в', буква українською)";
	    bot.sendMessage(chatId, resp);
	}
    }
    
});
