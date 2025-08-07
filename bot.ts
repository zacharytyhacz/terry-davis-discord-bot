import { CronJob } from 'cron'
import dotenv from 'dotenv-safe'
import { Client, Events, IntentsBitField, MessageReaction, User } from 'discord.js';
import { replies } from './messages/replies'
import { engagementQuestions } from './messages/engagement'
import crypto from "crypto";

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

var lastEngagementIndices: number[] = [];

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
                const { question, answers } = engagementQuestions[getRandomEngagementIndex()]
                const message = await channel.send(`
Hey nerds

${question}

${answers.map((answer, index) => `${reactionEmojis[index]} ${answer}`).join('\n')}

Dont see your answer? Share with us!
                    `.trim()
                )
                for (const reaction of reactionEmojis) {
                    await message.react(reaction)
                }

                const filter = (reaction: MessageReaction, user: User) => {
                  return !user.bot && reactionEmojis.includes(reaction.emoji.name || '');
                }

                const collector = message.createReactionCollector({ filter, time: 48 * 60 * 60 * 1000 }); // 48 hours
                const reactingUsers: Set<string> = new Set();

                collector.on('collect', async (reaction, user) => {
                  if (!reactingUsers.has(user.id)) {
                    reactingUsers.add(user.id);

                    if (reactingUsers.size === 2) {
                      const answerChosen = answers[reactionEmojis.indexOf(reaction.emoji.name as string)] ?? 'your answer'
                      await channel.send(`Nice <@${user.id}>! Can you share why you chose ${answerChosen}?`);
                      collector.stop()
                    }
                  }
                });
            } else {
                console.log('Channel not found or the bot does not have access to it.');
            }
        },
        null,
        true
    )

    new CronJob(

        // every sunday
        '0 0 12 * * 0', // Every Sunday at 12:00 PM CST
        async () => {
          const channel = client.channels.cache.get(MAIN_CHANNEL_ID)
          if (channel && channel.isTextBased() && 'send' in channel) {
            await channel.send(`
Hey friends, **the BEST way to support the meetup is to ATTEND our events** 😎

If you WANT to support is other ways, please see our website: https://wilmingtonio.org/
`)
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

   if (message.author.id === '1032407444523077712') {
     message.react('🇫🇷')
   }

   if (['193846431004622848', '314929056422297602'].includes(message.author.id)) {
     message.react('🇦🇱')
   }
});

function getRandomEngagementIndex(): number {
    if (lastEngagementIndices.length >= engagementQuestions.length) {
        lastEngagementIndices = []
    }

    let engagementIndex = crypto.randomInt(0, engagementQuestions.length);
    while (lastEngagementIndices.includes(engagementIndex)) {
        engagementIndex = crypto.randomInt(0, engagementQuestions.length);
    }

    lastEngagementIndices.push(engagementIndex)

    return engagementIndex;
}

client.login(token)
