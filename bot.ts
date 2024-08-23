import { CronJob } from 'cron'
import dotenv from 'dotenv-safe'
import { Client, IntentsBitField, ChannelType } from 'discord.js';
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

client.once('ready', () => {
    console.log('Bot is online!');
    const channel = client.channels.cache.get(MAIN_CHANNEL_ID)
    if (channel && channel.isTextBased()) {
        channel.send('I just restarted.')
    }
});

client.on('error', console.error)
client.on('shardError', console.error)

client.on('messageCreate', message => {
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

client.login(token);

const startWeeklyMeetupLink = (): CronJob => new CronJob(
    '0 0 12 * * 2,5', // tuesday and friday at 12:00 PM
    () => {
        // Fetch the channel using the saved channel ID
        const channel = client.channels.cache.get(MAIN_CHANNEL_ID)
        
        if (channel && channel.isTextBased()) {
            channel.send(`
Hey guys

${engagementQuestions[Math.floor(Math.random() * engagementQuestions.length)]}
                `.trim()
            )
        } else {
            console.log('Channel not found or the bot does not have access to it.');
        }
    },
    null,
    true
)

startWeeklyMeetupLink()
