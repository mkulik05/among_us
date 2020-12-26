const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf("1448775683:AAHYrTikXlvfJfMyvAkc34MCd9007-wuC8Q")
let create_keyboard_list = (btn_num, label) => {
	let res = []
	let line1 = []
	let line2 = []
	for (let i = 1; i<=btn_num;i++) {
		if (btn_num > 5) {
			if (i>Math.trunc(btn_num/2)) {
				line2.push(Markup.callbackButton(i.toString(), label+i.toString()))
			} else {
				line1.push(Markup.callbackButton(i.toString(), label+i.toString()))
			}
		} else {
			res.push(Markup.callbackButton(i.toString(), label+i.toString()))
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
  Markup.callbackButton('Кол-во импостеров', 'change_num_of_impostors')
  // Markup.callbackButton('', '3'),
  // Markup.callbackButton('', '4'),
])

const settings_tasks = create_keyboard_list(10, 'task_')


const settings_impostors = create_keyboard_list(4, 'impostor_')
let tasks = {}
let players = []
let is_imposter = {}
let num_of_tasks  = 5;
let num_of_impostors = 5
let players_tasks = {}

let game_menu = () => {
  return Markup
  .keyboard([
    ['Заявить о сделанном задании'],
    ['📢 репорт'],
    ['Сделать саботаж']
    
    
  ]).oneTime().resize().extra()
}

bot.start((ctx) => {
  let id  = ctx.chat.id.toString()
  for (let i = 0; i < players.length; i++) {
    bot.telegram.sendMessage(players[i], "Игрок " + ctx.message.from.first_name+ " присоединился")
  }
  
  if (!players.includes(id)){
    players.push(id)
    tasks[id] = []
    console.log(id)
  }
  if (players.length > 0 && id === players[0]) {
    bot.telegram.sendMessage(players[0], "Вы администратор!!", Markup
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
  for (let i = 0; i< players.length; i++){
    players2.push(players[i].toString())
  }
  console.log(players2, players)
  while (b <= num_of_impostors) {
      if (players.length > 2) {
        index = Math.floor(Math.random()*players2.length)
        imp = players2[index]
        players2.splice(index,1)
        is_imposter[imp] = 1;
        console.log(is_imposter)
        b += 1
      } else {
        break
      }
  }

  console.log(players2, players, "!!!!")
  console.log(is_imposter)
  for (let i = 0; i< players.length; i++){
    console.log(players[i], "--", players)
    let role = 0
    if (Object.keys(is_imposter).includes(players[i].toString())){
      role = is_imposter[players[i].toString()]
    }
    console.log(role)
    if (role) {
      role = "Импостер"
    } else {
      role = "Мирный"
    }
    bot.telegram.sendMessage(players[i], "Игра начата!!! Ваша роль: "+ role, game_menu())
  }
})

bot.action('change_num_of_impostors', (ctx) => {
  return ctx.reply('Выберите кол-во импостеров', Extra.markup(create_keyboard(settings_impostors)))
})


bot.action('change_num_of_tasks', (ctx) => {
  return ctx.reply('Выберите кол-во заданий', Extra.markup(create_keyboard(settings_tasks)))
})

for (let i = 1; i<5; i++) {
  bot.action('impostor_'+i, (ctx) => {
    num_of_impostors = i
    return ctx.reply('Принято', Markup
    .keyboard([
      ['Настройки', 'Начать игру'],
    ]).oneTime().resize().extra())
  })
  
}

for (let i = 1; i<11; i++) { 
  bot.action('task_'+i, (ctx) => {
    num_of_tasks = i
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


// bot.hears('Импостер', (ctx) => {
//   is_imposter[ctx.chat.id.toString()] = 1
//   return ctx.reply('Хорошо', game_menu())
// })

// bot.hears('Мирный', (ctx) => {
//   is_imposter[ctx.chat.id.toString()] = 0
//   return ctx.reply('Хорошо',game_menu())
// })

bot.hears('Сделать саботаж', (ctx) => {
if (is_imposter[ctx.chat.id.toString()]) {
  for (let i = 0; i< players.length; i++){
    bot.telegram.sendMessage(players[i], "Саботаж!!!!!!", game_menu())
  }
} else {
  return ctx.reply('Ты не импостер!!!', game_menu())
}
})
bot.hears('Да, удалить все', (ctx) => {
  if (ctx.chat.id.toString() === players[0]) {
  tasks = {}
  players = []
  is_imposter = {}
  num_of_tasks  = 5;
  num_of_impostors = 5
  players_tasks = {}
  return ctx.reply('Данные очищены', game_menu())
  } else {
    return ctx.reply('Действие запрещено', game_menu())
  }
})

bot.hears('Нет, отмена', (ctx) => {
  return ctx.reply('Действие отменено', game_menu())
})
bot.hears('clear_all', (ctx) => {
  if (ctx.chat.id.toString() === players[0]) {

    return ctx.reply('Вы уверены? Это необратимое действие!!!', Markup
    .keyboard([
      ['Да, удалить все', 'Нет, отмена'],
    ]).oneTime().resize().extra())
    
  } else {
    return ctx.reply('Действие запрещено', game_menu())
  }
})

bot.hears('📢 репорт', (ctx) => {
  console.log(ctx.message.from.first_name)
  for (let i = 0; i< players.length; i++){
    let username = ctx.message.from.first_name
    let last_name = ctx.message.from.last_name
    console.log(last_name)
    if (typeof last_name == 'undefined') {
      last_name = ''
    }
    bot.telegram.sendMessage(players[i], username + " " + last_name+" отправил(а) репорт!!!", game_menu())
  }
  // return ctx.reply('Принято'), Markup
  // .keyboard([
  //   ['Заявить о сделанном задании'],
  //   ['📢 репорт'],
  //   ['Сделать саботаж']
  // ]).oneTime().resize().extra()
})

let points = 0

for (let i = 1; i<11; i++) {
  bot.action('t'+i, (ctx) => {
    let id = ctx.chat.id.toString()
    if (!is_imposter[id]) {
      console.log(players)
    
    if (Object.keys(tasks).includes(id)) {
      if (!tasks[id].includes(''+i)) {
        tasks[id].push(''+i)
        points+=1
        if (points >= num_of_tasks * (players.length - Object.keys(is_imposter).length)) {
          for (let i = 0; i< players.length; i++){
            bot.telegram.sendMessage(players[i], "Все задания выполнены!!! Мирные победили", Markup
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
      tasks[id] = [''+i]
      points+=1
      players.push(id)
    }
    return ctx.reply('Записано', game_menu())
    }
    
  
  }
  
  )
}

let  shuffle = (array) => {
  var currentIndex = array.length, temporaryValue, randomIndex;

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
  let keyboard2= []
  for (let i = 0; i< keyboard.length; i++){
    keyboard2.push(keyboard[i])
  }
  keyboard2 = keyboard2[0].concat(keyboard2[1])

  

  if (Object.keys(players_tasks).includes(id)) {

    keys = Object.keys(players_tasks).includes(id)
    // let keyboard_copy = {}
    // for (let key_i = 0; key_i<keys.length;key_i++) {
    //   keyboard_copy[keys[i]] = players_tasks[keys[i]]
    // }
	keyboard2 = players_tasks[id]
	console.log(keyboard2)
	keyboard2 = keyboard2.filter(word => {
		console.log(word["text"], tasks[id])
		return !tasks[id].includes(word["text"])
  });
  
	if (keyboard2.length == 0) {
	  ctx.reply("Вы выполнили все задания")
	  return;
	}
    // console.log(keyboard_copy)
  } else {
    keyboard2 = shuffle(keyboard2)
	keyboard2 = keyboard2.slice(0, num_of_tasks)
    players_tasks[id] = keyboard2

  }
  
  let keyboard3 = []
  if (keyboard2.length>5) {
     keyboard3.push(keyboard2.slice(0,Math.trunc(keyboard2.length/2+1)))
     keyboard3.push(keyboard2.slice(Math.trunc(keyboard2.length/2+1)))

  } else {
    keyboard3 = keyboard2
  }
   ctx.reply("Какое задание вы выполнили?",Extra.markup(create_keyboard(keyboard3)))
  
})

bot.launch() 