const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {
    polling: true
});

const KEY = process.env.KEY;

bot.onText(/\/echo (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);

});


function sendData(path, data) {

    var url = "http://lpml.kl.com.ua/" + path;
    request.post(url, data, function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            //console.log(data);
        }
    });

}


bot.onText(/^\/start$/i, (msg) => {

    const chatId = msg.chat.id;
    const first_name = msg.chat.first_name;
    const resp = "Привіт " + first_name + ",\nЯ допоможу тобі з розкладом.\nЩоб дізнатись що я можу напиши /help";
    bot.sendMessage(chatId, resp);


});

bot.onText(/^\/help$/i, (msg) => {

    const chatId = msg.chat.id;
    const resp = "Список моїх команд:\n/class - вибери з якого ти класу\n/today(/td) - розклад уроків на сьогодні\n/tomorrow(/tm) - розклад уроків на завтра\n/timetable(/tt) - розклад на весь тиждень\n/time - розклад дзвінків\nВсі команди що в дужках це скорочення";
    bot.sendMessage(chatId, resp);

});


bot.onText(/^\/class$/i, (msg) => {

    const chatId = msg.chat.id;

    const url = "http://lpml.kl.com.ua/getusers.php";
    request.post(url, {
        json: {
            key: KEY
        }
    }, function(error, response, body) {

        var found = false;
        var resp;
        for (key in body) {
            if (key.toString() == chatId.toString()) {

                resp = "Твій клас зараз: " + body[key] + "\nДля зміни просто напиши новий клас.\nЩоб скасувати /cancel";

                found = true;
                break;
            }
        }

        if (!found) {
            resp = "Напиши з якого ти класу\n(наприклад: '10в', буква українською)";
        }

        bot.sendMessage(chatId, resp).then(() => {
            states[chatId] = 1;
        });

    });

});


var states = {};

bot.onText(/^\/cancel$/i, msg => {

    const chatId = msg.chat.id;
    states[chatId] = 0;
    const resp = "Скасовано";
    bot.sendMessage(chatId, resp);

});

bot.onText(/(.+)/, (msg, match) => {

    const chatId = msg.chat.id;

    if (states[chatId] == 1) {
        const uClass = match[1];
        var m = uClass.match(/^(8|9|10|11)([абвгдАБВГД])$/);
        if (m) {
            const c = m[1] + "-" + m[2].toUpperCase();

            const url = "http://lpml.kl.com.ua/isclass.php";
            request.post(url, {
                json: {
                    cln: c,
                    key: KEY
                }
            }, function(error, response, body) {

                if (body["ok"]) {
                    const resp = "Твій клас тепер: " + c;
                    bot.sendMessage(chatId, resp).then(() => {
                        states[chatId] = 0;
                        sendData("setuser.php", {
                            json: {
                                chatid: chatId,
                                uclass: c,
                                key: KEY
                            }
                        })
                    });
                } else {
                    const resp = "Вибач, але поки мені нічого не відомо про твій клас.\nПовідом про це старості свого класу та дай йому мої контакти: @swich28";
                    bot.sendMessage(chatId, resp).then(() => {
                        states[chatId] = 0;
                    });
                }

            });

        } else {
            const resp = "Неправильний формат класу\nСпробуй знову\n(Має бути наприклад: '10в', буква українською)";
            bot.sendMessage(chatId, resp);
        }
    }

});
