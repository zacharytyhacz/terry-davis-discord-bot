import { CronJob } from 'cron'
import dotenv from 'dotenv-safe'
import { Client, Events, IntentsBitField } from 'discord.js';
import { replies } from './messages/replies'
import { engagementQuestions } from './messages/engagement'

dotenv.config({
    example: './.env.example'
})

const MAIN_CHANNEL_ID = "862860519900053533"

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

const token = process.env.TOKEN;

function getRandomReply(): string {
    const randomIndex = Math.floor(Math.random() * replies.length);
    return replies[randomIndex];
}

function containsCIA(str: string): boolean {
   return /\bCIA\b/i.test(str);
}

const reactionEmojis = ['🇦', '🇧', '🇨', '🇩']
client.once(Events.ClientReady, async () => {
    console.log('Bot is online!');
    const channel = client.channels.cache.get(MAIN_CHANNEL_ID)

    if (channel && channel.isTextBased()) {
      await channel.send(getRandomReply());
    }

    console.log('time now is:', new Date().toLocaleTimeString())

    new CronJob(
        '0 29 18 * * 2,4,6', // Every Tuesday, Thursday, and Saturday at 6:29 PM CST
        async () => {
            console.log('Running cronjob....')
            // Fetch the channel using the saved channel ID
            const channel = client.channels.cache.get(MAIN_CHANNEL_ID)
            
            if (channel && channel.isTextBased()) {
                console.log('Channel found. Sending message...')
                const { question, answers } = engagementQuestions[Math.floor(Math.random() * engagementQuestions.length)]
                const message = await channel.send(`
Hey guys!

${question}

${answers.map((answer, index) => `${reactionEmojis[index]} ${answer}`).join('\n')}

Dont see your answer? Share with us!
                    `.trim()
                )
                for (const reaction of reactionEmojis) {
                    await message.react(reaction)
                }
            } else {
                console.log('Channel not found or the bot does not have access to it.');
            }
        },
        null,
        true
    )
});

client.on(Events.Error, (err) => {
    const now = new Date()
    console.error(now.toLocaleDateString(), 'Got error', err)
})

client.on(Events.ShardError, (err) => {
    const now = new Date()
    console.error(now.toLocaleDateString(), 'Got shared error', err)
})

client.on(Events.MessageCreate, message => {
   if (message.content === '!terry') {
       message.channel.send(getRandomReply());
   }

   if (message.content === '!meetup') {
       message.channel.send('https://wilmingtonio.org/')
   }

   if (containsCIA(message.content)) {
       message.react('👀')
   }
});

client.login(token)
