const TelegramBot = require('node-telegram-bot-api');
//const token = process.env.TOKEN;
const token = "361841751:AAF4tLD32j2ModhUow67wU-Qc6W6sEat3ik";
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
    
});

bot.onText(/^\/start$/, (msg) => {

    const chatId = msg.chat.id;
    const first_name = msg.chat.first_name;
    const resp = "Привіт " + first_name + ",\nЯ допоможу тобі з розкладом та нагадаю про важливі події.\nЩоб дізнатись що я можу напиши /help";
    bot.sendMessage(chatId, resp);
    
    
});

bot.onText(/^\/help$/, (msg) => {

    const chatId = msg.chat.id;
    const resp = "Список моїх команд:\n/class - вибери з якого ти класу\n/today(/td) - розклад уроків на сьогодні\n/tomorrow(/tm) - розклад уроків на завтра\n/timetable(/tt) - розклад на весь тиждень\n/time - розклад дзвінків\n/reminder(/rm) [on/off] - нагадування про події\nВсі команди що в дужках це скорочення";
    bot.sendMessage(chatId, resp);
    
});


var states = {};

bot.onText(/^\/class$/, (msg) => {

    const chatId = msg.chat.id;
    const resp = "Напиши з якого ти класу(наприклад: '10в')";
    
    bot.sendMessage(chatId, resp).then(() => {
	states[chatId] = 1;
    });
    
});

bot.onText(/(.+)/, (msg, match) => {

    const chatId = msg.chat.id;

    if(states[chatId] == 1){
	const uClass = match[1];
	if (uClass.match(/\d{1,2}[абвгдАБВГД]/)){
	    const resp = "Твій клас тепер: " + match[1];
	    bot.sendMessage(chatId, resp).then(() => {
		states[chatId] = 0;
		// set class to user !!!
	    });
	}else{
	    const resp = "Неправильний формат класу\nСпробуй знову\n(Має бути наприклад: '10в', буква українською)";
	    bot.sendMessage(chatId, resp);
	}
    }
    
});
