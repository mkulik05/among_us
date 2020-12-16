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
let tasks = {}
let players = []
is_imposter = {}
bot.start((ctx) => {

  if (!players.includes(ctx.chat.id)) {
    players.push(ctx.chat.id)
    tasks[ctx.chat.id] = []
    console.log(players)
  }
 
  return ctx.reply('Привет! Выбери свою роль', Markup
    .keyboard([
      ['Импостер', 'Мирный'],
    ]).oneTime().resize().extra()
    )
  })

bot.help((ctx) => ctx.reply('Help message'))


bot.hears('Импостер', (ctx) => {
  is_imposter[ctx.chat.id] = 1
  return ctx.reply('Хорошо', Markup
  .keyboard([
    ['Заявить о сделанном задании'],
    ['📢 репорт'],
    ['Сделать саботаж']
  ]).oneTime().resize().extra()

)
})

bot.hears('Мирный', (ctx) => {
  is_imposter[ctx.chat.id] = 0
  return ctx.reply('Хорошо', Markup
  .keyboard([
    ['Заявить о сделанном задании'],
    ['📢 репорт'],
    ['Сделать саботаж']
  ]).oneTime().resize().extra()

)
})

bot.hears('Сделать саботаж', (ctx) => {
if (is_imposter[ctx.chat.id]) {
  for (let i = 0; i< players.length; i++){
    bot.telegram.sendMessage(players[i], "Саботаж!!!!!!", Markup
    .keyboard([
      ['Заявить о сделанном задании'],
      ['📢 репорт'],
      ['Сделать саботаж']
    ]).oneTime().resize().extra())
  }
//   return ctx.reply('Принято, импостер', Markup
//   .keyboard([
//     ['Заявить о сделанном задании'],
//     ['📢 репорт'],
//     ['Сделать саботаж']
//   ]).oneTime().resize().extra()

// )
} else {
  return ctx.reply('Ты не импостер!!!', Markup
  .keyboard([
    ['Заявить о сделанном задании'],
    ['📢 репорт'],
    ['Сделать саботаж']
  ]).oneTime().resize().extra()

)
}
})


bot.hears('📢 репорт', (ctx) => {
  console.log(ctx.message.from.first_name)
  for (let i = 0; i< players.length; i++){
    bot.telegram.sendMessage(players[i], ctx.message.from.first_name + " " + ctx.message.from.last_name+" отправил(а) репорт!!!", Markup
    .keyboard([
      ['Заявить о сделанном задании'],
      ['📢 репорт'],
      ['Сделать саботаж']
    ]).oneTime().resize().extra())
  }
  return ctx.reply('Принято'), Markup
  .keyboard([
    ['Заявить о сделанном задании'],
    ['📢 репорт'],
    ['Сделать саботаж']
  ]).oneTime().resize().extra()
})

let points = 0

let actions = ['1','2','3','4']
bot.action('1', (ctx) => {
  id = ctx.chat.id.toString()
  if (Object.keys(tasks).includes(id)) {
    if (!tasks[id].includes(actions[0])) {
      tasks[id].push(actions[0])
      points+=1
      console.log(tasks, points)
    }else {
      return ctx.reply('Вы уже выполнили это задание!!!', Markup
      .keyboard([
        ['Заявить о сделанном задании'],
        ['📢 репорт'],
        ['Сделать саботаж']
      ]).oneTime().resize().extra())
    }
  } else {
    tasks[id] = [actions[0]]
    players.push(id)
  }
  return ctx.reply('Записано', Markup
  .keyboard([
    ['Заявить о сделанном задании'],
    ['📢 репорт'],
    ['Сделать саботаж']
  ]).oneTime().resize().extra())
})

bot.action('2', (ctx) => {
  id = ctx.chat.id.toString()
  if (Object.keys(tasks).includes(id)) {
    if (!tasks[id].includes(actions[1])) {
      tasks[id].push(actions[1])
      points+=1
      console.log(tasks, points)
    }else {
      return ctx.reply('Вы уже выполнили это задание!!!', Markup
      .keyboard([
        ['Заявить о сделанном задании'],
        ['📢 репорт'],
        ['Сделать саботаж']
      ]).oneTime().resize().extra())
    }
  } else {
    tasks[id] = [actions[1]]
    players.push(id)
  }
  return ctx.reply('Записано'), Markup
  .keyboard([
    ['Заявить о сделанном задании'],
    ['📢 репорт'],
    ['Сделать саботаж']
  ]).oneTime().resize().extra()
})
bot.action('3', (ctx) => {
  id = ctx.chat.id.toString()
  if (Object.keys(tasks).includes(id)) {
    if (!tasks[id].includes(actions[2])) {
      tasks[id].push(actions[2])
      points+=1
      console.log(tasks, points)
    }else {
      return ctx.reply('Вы уже выполнили это задание!!!', Markup
      .keyboard([
        ['Заявить о сделанном задании'],
        ['📢 репорт'],
        ['Сделать саботаж']
      ]).oneTime().resize().extra())
    }
  } else {
    tasks[id] = [actions[2]]
    players.push(id)
  }
  return ctx.reply('Записано', Markup
  .keyboard([
    ['Заявить о сделанном задании'],
    ['📢 репорт'],
    ['Сделать саботаж']
  ]).oneTime().resize().extra())

})
bot.action('4', (ctx) => {
  id = ctx.chat.id.toString()
  if (Object.keys(tasks).includes(id)) {
    if (!tasks[id].includes(actions[3])) {
      tasks[id].push(actions[3])
      points+=1
      console.log(tasks, points)
    } else {
      return ctx.reply('Вы уже выполнили это задание!!!', Markup
      .keyboard([
        ['Заявить о сделанном задании'],
        ['📢 репорт'],
        ['Сделать саботаж']
      ]).oneTime().resize().extra())
    }
  } else {
    tasks[id] = [actions[3]]
    players.push(id)
  }
return ctx.reply('Записано', Markup
.keyboard([
  ['Заявить о сделанном задании'],
  ['📢 репорт'],
  ['Сделать саботаж']
]).oneTime().resize().extra())  

})

bot.hears('Заявить о сделанном задании', (ctx) => {
  ctx.reply("Какое задание вы выполнили?",Extra.markup(keyboard))

})


bot.launch() 