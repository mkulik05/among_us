	const Telegraf = require('telegraf')
	const Extra = require('telegraf/extra')
	const Markup = require('telegraf/markup')
	const bot = new Telegraf("1448775683:AAHYrTikXlvfJfMyvAkc34MCd9007-wuC8Q")
	let Gpio = require('onoff').Gpio;
	let to_arduino = new Gpio(4, 'out');
	let meetingButton = new Gpio(15, 'in', 'both');
	let from_arduino_200 = new Gpio(17, 'in', 'both');
	let from_arduino_404 = new Gpio(27, 'in', 'both');
	to_arduino.writeSync(0);

	from_arduino_200.watch((err, value) => {
		console.log('200', value) //Watch for hardware interrupts on meetingButton GPIO, specify callback function
		if (value) {
			for (let i = 0; i < Object.keys(data["players"]).length; i++) {
				bot.telegram.sendMessage(Object.keys(data["players"])[i], "Саботаж устранён!!")
			}
		}
	});
	from_arduino_404.watch((err, value) => {
		console.log('400', value) //Watch for hardware interrupts on meetingButton GPIO, specify callback function
		if (value) {
			for (let i = 0; i < Object.keys(data["players"]).length; i++) {
				bot.telegram.sendMessage(Object.keys(data["players"])[i], "Саботаж не был устранён, импостеры победили")
			}
		}
	});
	meetingButton.watch((err, value) => { //Watch for hardware interrupts on meetingButton GPIO, specify callback function
		if (value) {
			for (let i = 0; i < Object.keys(data["players"]).length; i++) {
				bot.telegram.sendMessage(Object.keys(data["players"])[i], "Созвано экстренное собрание!!!")
			}
		}
	});

	let create_keyboard_list = (btn_num, label, step = 1, start_val= 1) => {
		let res = []
		let line1 = []
		let line2 = []
		for (let i = start_val; i <= btn_num; i+=step) {
			if (btn_num > 5) {
				if (i > Math.trunc(btn_num / 2)) {
					line2.push(Markup.callbackButton(i.toString(), label + i.toString()))
				} else {
					line1.push(Markup.callbackButton(i.toString(), label + i.toString()))
				}
			} else {
				res.push(Markup.callbackButton(i.toString(), label + i.toString()))
			}
		}
		if (btn_num > 5) {
			res.push(line1)
			res.push(line2)
		}

		return res
	}

	const keyboard = create_keyboard_list(10, 't')

	let create_keyboard = (arr) => {
		return Markup.inlineKeyboard(arr)
	}

	const settings = Markup.inlineKeyboard([
		Markup.callbackButton('Кол-во заданий(до 10)', 'change_num_of_tasks'),
		Markup.callbackButton('Кол-во импостеров', 'change_num_of_impostors'),
		Markup.callbackButton('Изменить время между саботажами', 'change_delay_between_sabotages'),
		// Markup.callbackButton('', '3'),
		// Markup.callbackButton('', '4'),
	])

	const settings_tasks = create_keyboard_list(10, 'task_')

	const settings_delay = create_keyboard_list(12, 'delay_', step = 7, start_val = 15)

	const settings_impostors = create_keyboard_list(4, 'impostor_')
	let data = {
		players: {},
		game_settings: {
			num_of_tasks: 5,
			num_of_impostors: 2,
			admin_id: "",
			sabotage_delay: 20
		},
		points: 0,
		last_sabotage: {}
	}
	// let tasks = {}
	// let players = []
	// let is_imposter = {}
	// let num_of_tasks  = 5;
	// let num_of_impostors = 5
	// let players_tasks = {}

	let game_menu = () => {
		return Markup
			.keyboard([
				['Заявить о сделанном задании'],
				['📢 репорт'],
				['Сделать саботаж']


			]).oneTime().resize().extra()
	}

	bot.start((ctx) => {
		let id = ctx.chat.id.toString()

		for (let i = 0; i < Object.keys(data["players"]).length; i++) {
			bot.telegram.sendMessage(Object.keys(data["players"])[i], "Игрок " + ctx.message.from.first_name + " присоединился")
		}
		if (data["game_settings"]["admin_id"] === "") {
			data["game_settings"]["admin_id"] = id
		}
		if (!Object.keys(data["players"]).includes(id)) {
			data["players"][id] = {}
			data["players"][id]["tasks"] = []
			//console.log(id)
		}
		//console.log(Object.keys(data["players"]))
		if (Object.keys(data["players"]).length > 0 && id === data["game_settings"]["admin_id"]) {
			bot.telegram.sendMessage(id, "Вы администратор!!", Markup
				.keyboard([
					['Настройки', 'Начать игру'],
				]).oneTime().resize().extra()
			)
		} else {
			return ctx.reply('Привет! Ожидай начала игры')
		}
	})

	bot.hears('Начать игру', (ctx) => {
		let b = 1
		let players2 = []
		for (let i = 0; i < Object.keys(data["players"]).length; i++) {
			players2.push(Object.keys(data["players"])[i].toString())
		}
		//console.log(players2, Object.keys(data["players"]))
		while (b <= data["game_settings"]["num_of_impostors"]) {
			if (Object.keys(data["players"]).length > 2) {
				index = Math.floor(Math.random() * players2.length)
				imp_id = players2[index]
				//console.log(imp_id)
				//console.log(data)
				players2.splice(index, 1)
				data["players"][imp_id]["is_impostor"] = 1;

				b += 1
			} else {
				break
			}
		}

		for (let i = 0; i < Object.keys(data["players"]).length; i++) {
			let role = 0
			if (data["players"][Object.keys(data["players"])[i]]["is_impostor"]) {
				role = 1
			} else {
				data["players"][Object.keys(data["players"])[i]]["is_impostor"] = 0
				role = 0
			}
			//console.log(role)
			if (role) {
				role = "Импостер"
			} else {
				role = "Мирный"
			}
			bot.telegram.sendMessage(Object.keys(data["players"])[i], "Игра начата!!! Ваша роль: " + role, game_menu())
		}
	})

	bot.action('change_num_of_impostors', (ctx) => {
		return ctx.reply('Выберите кол-во импостеров', Extra.markup(create_keyboard(settings_impostors)))
	})

	bot.action('change_delay_between_sabotages', (ctx) => {
		return ctx.reply('Какое время установить(в секундах)', Extra.markup(create_keyboard(settings_delay)))
	})

	bot.action('change_num_of_tasks', (ctx) => {
		return ctx.reply('Выберите кол-во заданий', Extra.markup(create_keyboard(settings_tasks)))
	})

	for (let i = 1; i < 5; i++) {
		bot.action('impostor_' + i, (ctx) => {
			data["game_settings"]["num_of_impostors"] = i
			return ctx.reply('Принято', Markup
				.keyboard([
					['Настройки', 'Начать игру'],
				]).oneTime().resize().extra())
		})

	}

	for (let i = 1; i < 11; i++) {
		bot.action('task_' + i, (ctx) => {
			data["game_settings"]["num_of_tasks"] = i
			return ctx.reply('Принято', Markup
				.keyboard([
					['Настройки', 'Начать игру'],
				]).oneTime().resize().extra())
		})
	}

	for (let i = 15; i <= 99; i+=5) {
		bot.action('delay_' + i, (ctx) => {
			data["game_settings"]["sabotage_delay"] = i
			return ctx.reply('Принято', Markup
				.keyboard([
					['Настройки', 'Начать игру'],
				]).oneTime().resize().extra())
		})
	}

	bot.hears('Настройки', (ctx) => {
		return ctx.reply('Хорошо', Extra.markup(settings))
	})

	bot.help((ctx) => ctx.reply('Help message'))

	let delay = (time) => {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(2);
			}, time);
		});
	}

	bot.hears('Сделать саботаж', async (ctx) => {
		if (data["players"][ctx.chat.id.toString()]["is_impostor"]) {
			if (data["last_sabotage"] === {}) {
				data["last_sabotage"] === new Date()
			} else {
				if (!((new Date() - data["last_sabotage"])/1000 > data["game_settings"]["sabotage_delay"])) {
					return ctx.reply('С прошлого саботажа прошло недостаточно времени', game_menu())
				}
			}
			for (let i = 0; i < Object.keys(data["players"]).length; i++) {
				bot.telegram.sendMessage(Object.keys(data["players"])[i], "Саботаж!!!!!!", game_menu())
			}
			to_arduino.writeSync(1);
			await delay(1000)
			to_arduino.writeSync(0);
		} else {
			return ctx.reply('Ты не импостер!!!', game_menu())
		}
	})
	bot.hears('Да, удалить все', (ctx) => {
		if (ctx.chat.id.toString() === data["game_settings"]["admin_id"]) {
			let data = {
				players: {},
				game_settings: {
					num_of_tasks: 5,
					num_of_impostors: 2,
					admin_id: "",
					sabotage_delay: 20
				},
				points: 0,
				last_sabotage = {}
			}
			return ctx.reply('Данные очищены', game_menu())
		} else {
			return ctx.reply('Действие запрещено', game_menu())
		}
	})

	bot.hears('Нет, отмена', (ctx) => {
		return ctx.reply('Действие отменено', game_menu())
	})
	bot.hears('clear_all', (ctx) => {
		if (ctx.chat.id.toString() === data["game_settings"]["admin_id"]) {

			return ctx.reply('Вы уверены? Это необратимое действие!!!', Markup
				.keyboard([
					['Да, удалить все', 'Нет, отмена'],
				]).oneTime().resize().extra())

		} else {
			return ctx.reply('Действие запрещено', game_menu())
		}
	})

	bot.hears('📢 репорт', (ctx) => {
		//console.log(ctx.message.from.first_name)
		for (let i = 0; i < Object.keys(data["players"]).length; i++) {
			let username = ctx.message.from.first_name
			let last_name = ctx.message.from.last_name
			//console.log(last_name)
			if (typeof last_name == 'undefined') {
				last_name = ''
			}
			bot.telegram.sendMessage(Object.keys(data["players"])[i], username + " " + last_name + " отправил(а) репорт!!!", game_menu())
		}
		// return ctx.reply('Принято'), Markup
		// .keyboard([
		//   ['Заявить о сделанном задании'],
		//   ['📢 репорт'],
		//   ['Сделать саботаж']
		// ]).oneTime().resize().extra()
	})


	for (let i = 1; i < 11; i++) {
		bot.action('t' + i, (ctx) => {
				let id = ctx.chat.id.toString()
				if (!data["players"][id]["is_impostor"]) {

					if (typeof data["players"][id]["tasks"] != "undefined") {

						if (!data["players"][id]["tasks"].includes('' + i)) {
							data["players"][id]["tasks"].push('' + i)
							data["points"] += 1
							if (data["points"] >= data["game_settings"]["num_of_tasks"] * (Object.keys(data["players"]).length - data["game_settings"]["num_of_impostors"])) {
								for (let i = 0; i < Object.keys(data["players"]).length; i++) {
									bot.telegram.sendMessage(Object.keys(data["players"])[i], "Все задания выполнены!!! Мирные победили", Markup
										.keyboard([
											['Заявить о сделанном задании'],
											['📢 репорт'],
											['Сделать саботаж']
										]).oneTime().resize().extra())
								}
							}
						} else {
							return ctx.reply('Вы уже выполнили это задание!!!', game_menu())
						}
					} else {
						data["points"] += 1
						//console.log(points, data)
						data["players"][id]["tasks"] = ['' + i]
					}
					ctx.deleteMessage()
					return ctx.reply('Записано', game_menu())
				}


			}

		)
	}

	let shuffle = (array) => {
		var currentIndex = array.length,
			temporaryValue, randomIndex;

		while (0 !== currentIndex) {

			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	bot.hears('Заявить о сделанном задании', (ctx) => {
		id = ctx.chat.id.toString()
		let keyboard2 = []
		for (let i = 0; i < keyboard.length; i++) {
			keyboard2.push(keyboard[i])
		}
		keyboard2 = keyboard2[0].concat(keyboard2[1])

		if (typeof data["players"][id]["task_keyboard"] != 'undefined') {

			keyboard2 = data["players"][id]["task_keyboard"]
			//console.log(keyboard2)
			keyboard2 = keyboard2.filter(word => {
				//console.log(word["text"], data["players"][id]["tasks"])
				return !data["players"][id]["tasks"].includes(word["text"])
			});

			if (keyboard2.length == 0) {
				ctx.reply("Вы выполнили все задания")
				return;
			}
			// console.log(keyboard_copy)
		} else {
			keyboard2 = shuffle(keyboard2)
			keyboard2 = keyboard2.slice(0, data["game_settings"]["num_of_tasks"])
			data["players"][id]["task_keyboard"] = keyboard2

		}

		let keyboard3 = []
		if (keyboard2.length > 5) {
			keyboard3.push(keyboard2.slice(0, Math.trunc(keyboard2.length / 2 + 1)))
			keyboard3.push(keyboard2.slice(Math.trunc(keyboard2.length / 2 + 1)))

		} else {
			keyboard3 = keyboard2
		}
		ctx.reply("Какое задание вы выполнили?", Extra.markup(create_keyboard(keyboard3)))

	})

	bot.launch()
	let unexportOnClose = () => {
		to_arduino.writeSync(0);
		to_arduino.unexport();
		meetingButton.unexport();
	};
	process.on('SIGINT', unexportOnClose);
