const request = require('request');
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const KEY = process.env.KEY;
const sticker = process.env.STICKER;
const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/echo (.+)/, (msg, match) => {

    const chatId = msg.chat.id;
    const resp = match[1];

    bot.sendMessage(chatId, resp);

});

bot.on('sticker', (msg) => {

    const chatId = msg.chat.id;

    if (msg.sticker.file_id == sticker) {

        const url = "http://lpml.kl.com.ua/getusersall.php";
        request.post(url, {
            json: {
                key: KEY
            }
        }, function (erro, response, body) {

            var resp = "Users: " + body.length + "\n";
            for (key in body) {
                var u = body[key];
                resp += u["username"] + "\n<code> " + u["first_name"] + " " + u["last_name"] + " " + u["class_name"] + "</code>\n";
            }

            bot.sendMessage(chatId, resp, {
                parse_mode: "HTML"
            });

        });

    }

});


bot.onText(/^\/start$/i, (msg) => {

    const chatId = msg.chat.id;
    const first_name = msg.chat.first_name;
    const resp = "Привіт " + first_name + ",\nЯ допоможу тобі з розкладом.\nЩоб дізнатись що я можу напиши /help";
    bot.sendMessage(chatId, resp);


});

bot.onText(/^\/help$/i, (msg) => {

    const chatId = msg.chat.id;
    const resp = "Список моїх команд:\n/class - вибери з якого ти класу\n/today(/td) - розклад уроків на сьогодні\n/tomorrow(/tm) - розклад уроків на завтра\n/timetable(/tt) - розклад на весь тиждень\n/bell - розклад дзвінків";
    bot.sendMessage(chatId, resp);

});


bot.onText(/^\/class$/i, (msg) => {

    const chatId = msg.chat.id;

    const url = "http://lpml.kl.com.ua/getusers.php";
    request.post(url, {
        json: {
            key: KEY
        }
    }, function (error, response, body) {

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
            resp = "Напиши з якого ти класу\n(наприклад: '10а', буква українською)";
        }

        bot.sendMessage(chatId, resp).then(() => {
            states[chatId] = 1;
        });

    });

});


bot.onText(/^\/bell$/i, msg => {

    const chatId = msg.chat.id;
    const resp = "```    Пн.-Пт.\n1 08:45-09:30\n2 09:40-10:25\n3 10:35-11:20\n4 11:40-12:25\n5 12:50-13:35\n6 14:00-14:45\n7 14:55-15:40\n```\n```   Субота\n1 08:45-09:30\n2 09:40-10:25\n3 10:35-11:20\n4 11:30-12:15\n5 12:25-13:10\n6 13:20-14:05\n7 14:15-15:00```";
    // const resp = "```    Пн.-Пт.	     Субота\n1 08:45-09:30  08:45-09:30\n2 09:40-10:25  09:40-10:25\n3 10:35-11:20  10:35-11:20\n4 11:40-12:25  11:30-12:15\n5 12:50-13:35  12:25-13:10\n6 14:00-14:45  13:20-14:05\n7 14:55-15:40  14:15-15:00```";
    bot.sendMessage(chatId, resp, {
        parse_mode: "Markdown"
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
            }, function (error, response, body) {

                if (body["ok"]) {
                    const resp = "Твій клас тепер: " + c;
                    bot.sendMessage(chatId, resp).then(() => {
                        states[chatId] = 0;
                        const url2 = "http://lpml.kl.com.ua/setuser.php";
                        request.post(url2, {
                            json: {
                                chatid: chatId,
                                uclass: c,
                                first_name: msg.from.first_name,
                                last_name: msg.from.last_name,
                                username: msg.from.username,
                                key: KEY
                            }
                        }, function (error2, response2, body2) { });

                    });
                } else {
                    const resp = "Вибач, але поки мені нічого не відомо про твій клас.\nПовідом про це старості свого класу та дай йому мої контакти: @swich28";
                    bot.sendMessage(chatId, resp).then(() => {
                        states[chatId] = 0;
                    });
                }

            });

        } else {
            const resp = "Неправильний формат класу, cпробуй знову.\n(Має бути наприклад: '10а', буква українською)";
            bot.sendMessage(chatId, resp);
        }
    }

});


const days = {
    'mon': "Понеділок",
    'tue': "Вівторок",
    'wed': "Середа",
    'thu': "Четвер",
    'fri': "П'ятниця",
    'sat': "Субота"
};
const daysn = {
    0: "mon",
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
    7: "mon"
};
bot.onText(/^\/(?:today)|(?:td)$/i, msg => {

    const chatId = msg.chat.id;
    const url = "http://lpml.kl.com.ua/getusers.php";
    request.post(url, {
        json: {
            key: KEY
        }
    }, function (error, response, body) {

        var cln;
        var found = false;
        for (key in body) {
            if (key.toString() == chatId.toString()) {
                found = true;
                cln = body[key];
                break;
            }
        }

        if (found) {

            const url2 = "http://lpml.kl.com.ua/getlessons.php";
            request.post(url2, {
                json: {
                    key: KEY,
                    cln: cln
                }
            }, function (error2, response2, body2) {

                var resp = "```\n";
                var d = new Date();
                var key = daysn[d.getDay()];
                resp += days[key] + "\n";
                for (key2 in body2[key]) {
                    resp += key2 + " " + body2[key][key2] + "\n";
                }
                resp += "\n```";
                bot.sendMessage(chatId, resp, {
                    parse_mode: "Markdown"
                });

            });

        } else {

            const resp = "Вибери з якого ти класу /class";
            bot.sendMessage(chatId, resp);

        }

    });

});



bot.onText(/^\/(?:tomorrow)|(?:tm)$/i, msg => {

    const chatId = msg.chat.id;
    const url = "http://lpml.kl.com.ua/getusers.php";
    request.post(url, {
        json: {
            key: KEY
        }
    }, function (error, response, body) {

        var cln;
        var found = false;
        for (key in body) {
            if (key.toString() == chatId.toString()) {
                found = true;
                cln = body[key];
                break;
            }
        }

        if (found) {

            const url2 = "http://lpml.kl.com.ua/getlessons.php";
            request.post(url2, {
                json: {
                    key: KEY,
                    cln: cln
                }
            }, function (error2, response2, body2) {

                var resp = "```\n";
                var d = new Date();
                var key = daysn[d.getDay() + 1];
                resp += days[key] + "\n";
                for (key2 in body2[key]) {
                    resp += key2 + " " + body2[key][key2] + "\n";
                }
                resp += "\n```";
                bot.sendMessage(chatId, resp, {
                    parse_mode: "Markdown"
                });

            });

        } else {

            const resp = "Вибери з якого ти класу /class";
            bot.sendMessage(chatId, resp);

        }

    });

});


bot.onText(/^\/(?:timetable)|(?:tt)$/i, msg => {

    const chatId = msg.chat.id;
    const url = "http://lpml.kl.com.ua/getusers.php";
    request.post(url, {
        json: {
            key: KEY
        }
    }, function (error, response, body) {

        var cln;
        var found = false;
        for (key in body) {
            if (key.toString() == chatId.toString()) {
                found = true;
                cln = body[key];
                break;
            }
        }

        if (found) {

            const url2 = "http://lpml.kl.com.ua/getlessons.php";
            request.post(url2, {
                json: {
                    key: KEY,
                    cln: cln
                }
            }, function (error2, response2, body2) {

                var resp = "```\n";
                for (key in body2) {
                    resp += days[key] + "\n";
                    for (key2 in body2[key]) {
                        resp += key2 + " " + body2[key][key2] + "\n";
                    }
                    resp += "\n"
                }
                resp += "```";
                bot.sendMessage(chatId, resp, {
                    parse_mode: "Markdown"
                });

            });

        } else {

            const resp = "Вибери з якого ти класу /class";
            bot.sendMessage(chatId, resp);

        }

    });

});
