const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const bot = new Telegraf("1448775683:AAHYrTikXlvfJfMyvAkc34MCd9007-wuC8Q")

const keyboard = Markup.inlineKeyboard([
  Markup.callbackButton('1', '1'),
  Markup.callbackButton('2', '2'),
  Markup.callbackButton('3', '3'),
  Markup.callbackButton('4', '4'),
])

const keyboard_for_impostor = Markup.inlineKeyboard([
  Markup.callbackButton('1', '11'),
  Markup.callbackButton('2', '22'),
  Markup.callbackButton('3', '33'),
  Markup.callbackButton('4', '44'),
])

const settings = Markup.inlineKeyboard([
  Markup.callbackButton('Кол-во заданий(до 5)', 'change_num_of_tasks'),
  Markup.callbackButton('Кол-во импостеров', 'change_num_of_impostors')
  // Markup.callbackButton('', '3'),
  // Markup.callbackButton('', '4'),
])

const settings_tasks = Markup.inlineKeyboard([
  Markup.callbackButton('1', 'task_1'),
  Markup.callbackButton('2', 'task_2'),
  Markup.callbackButton('3', 'task_3'),
  Markup.callbackButton('4', 'task_4'),
  Markup.callbackButton('5', 'task_5')
])

const settings_impostors = Markup.inlineKeyboard([
  Markup.callbackButton('1', 'impostor_1'),
  Markup.callbackButton('2', 'impostor_2'),
  Markup.callbackButton('3', 'impostor_3'),
  Markup.callbackButton('4', 'impostor_4'),
])

let tasks = {}
let players = []
let is_imposter = {}
let num_of_tasks  = 4;
let num_of_impostors = 5

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
  return ctx.reply('Выберите кол-во импостеров', Extra.markup(settings_impostors))
})


bot.action('change_num_of_tasks', (ctx) => {
  return ctx.reply('Выберите кол-во заданий', Extra.markup(settings_tasks))
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

for (let i = 1; i<6; i++) { 
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


bot.hears('📢 репорт', (ctx) => {
  console.log(ctx.message.from.first_name)
  for (let i = 0; i< players.length; i++){
    let username = ctx.message.from.first_name
    let last_name = ctx.message.from.last_name
    console.log(last_name)
    if (last_name == 'undefined') {
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

for (let i = 1; i<5; i++) { 
  bot.action(''+i, (ctx) => {
    console.log(players)
    let id = ctx.chat.id.toString()
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
  })
}
bot.hears('Заявить о сделанном задании', (ctx) => {
  if (is_imposter[ctx.chat.id.toString()]) {
    ctx.reply("Какое задание вы выполнили?",Extra.markup(keyboard_for_impostor))
  } else {
    ctx.reply("Какое задание вы выполнили?",Extra.markup(keyboard))
  }
  
})

bot.launch() 