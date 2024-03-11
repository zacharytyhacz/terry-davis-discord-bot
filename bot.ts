import { CronJob } from 'cron'
import dotenv from 'dotenv-safe'
import { Client, IntentsBitField, ChannelType } from 'discord.js';

dotenv.config({
    example: './.env.example'
})

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

const token = process.env.TOKEN;

const replies = [
    "God's temple is perfect, and it's free.",
    "I'm not driven by money, I'm driven by God.",
    "TempleOS is God's official temple. Like Solomon's temple, this is a community focal point where offerings are made and God’s oracle is consulted.",
    "I actually think I'm the smartest programmer that's ever lived.",
    "I don't have any artificial limitations on the size of code.",
    "I don’t want to be normal. I want to be supernormal.",
    "Real men program in C.",
    "Coding is a form of art.",
    "My operating system, TempleOS, has no networking and no hardware drivers except for sound.",
    "I like celebrating creativity and the unique thought process of individuals.",
    "It's not a spiral of complexity. It's a spiral of simplicity.",
    "When you make your own programming language, you can do fun stuff.",
    "An operating system is a collection of things that don't fit into a language. There shouldn't be one.",
    "You know what's cooler than a million lines of code? Zero lines of code.",
    "A programmer does not primarily write code; rather, he primarily writes to another programmer about his problem solution. The understanding of this fact is the final step in a programmer's maturation.",
    "Low level programming is good for the programmer's soul.",
    "One of the best programming skills you can have is knowing when to walk away for awhile.",
    "Compilers are one of the most beautiful programs because they bootstrap themselves.",
    "I've got my whole life in this code.",
    "The more you use a language, the better you get at it.",
    "Code never lies, comments sometimes do.",
    "Simplicity is the soul of efficiency.",
    "If you don't make mistakes, you're not working on hard enough problems.",
    "Sometimes it's better to leave something alone, to pause, and that's very true of programming.",
    "In programming, the hard part isn't solving problems, but deciding what problems to solve.",
    "Perfection in design is achieved not when there is nothing more to add, but rather when there is nothing more to take away.",
    "A primary goal of programming is to solve the problem at hand, not to produce elegant code.",
    "Programming is breaking of one big impossible task into several small possible tasks.",
    "Programming languages, like pizzas, come in only two sizes: too big and too small.",
    "A good programmer is someone who looks both ways before crossing a one-way street.",
    "are you a glowy?",
    "hol up",
    "https://templeos.org/",
    `Soon afterward, out of fear of the suited figures he believed to be following him, Davis left town and drove hundreds of miles south with no destination. After becoming convinced that his car radio was communicating with him, he dismantled his vehicle (apparently in a search for tracking devices he believed were hidden on it) and threw his keys into the desert. He walked aimlessly along the side of the highway, where he was then picked up by a police officer. Davis escaped from the patrol vehicle, broke his collarbone, and was then taken to a hospital. Distressed about a conversation over artifacts found on his X-ray scans, interpreted by him as "alien artifacts", he ran from the hospital and attempted to carjack a nearby truck before being arrested. In jail, he stripped himself, broke his glasses and jammed the frames into a nearby electrical outlet, trying to open his cell door by switching the breaker. This failed, as he had been wearing non-conductive frames. He was then admitted to a mental hospital for two weeks.`,
    `TempleOS (known as "J Operating System" from 2004 to 2005, "LoseThos" from 2006 to early 2012, and "SparrowOS" in late 2012) is an operating system similar to the Commodore 64, DESQview and other early DOS-based interfaces. It was written in a programming language developed by Davis called Holy C, which was a middle ground between C and C++. It was conceived by Davis in the early 2000s and developed alone over the course of a decade. This included the design of its original programming language, editor, compiler and kernel. It was ultimately composed of under 100,000 lines of code.`,
    "According to Davis, many of the system's features, such as its 640×480 resolution and 16-color display, were also explicit instructions from God.",
    `"Davis was clearly a gifted programmer - writing an entire operating system is no small feat - and it was sad to see him affected by his mental illness"`,
    `One fan described him as a "programming legend", while another, a computer engineer, compared the development of TempleOS to a one-man-built skyscraper.`,
    `among consigned penally result perverseness checked stated held sensation reasonings skies adversity Dakota lip Suffer approached enact displacing feast Canst pearl doing alms comprehendeth nought`,
    `In 2005, Davis stated that his ambition for the J Operating System was "to recreate the dynamic environment that used to exist when the Commodore 64 was around and everyone was creating odd-ball software". He envisioned the system as a Commodore 64 with a "thousand times" more powerful processing speed. Three years later, he wrote that the primary purpose of LoseThos was "for making video games. It has no networking or Internet support. As far as I'm concerned, that would be reinventing the wheel".`,
    `As a child, Davis used an Apple II at his elementary school, and as a teenager, learned assembly language on a Commodore 64. He earned a master's degree in electrical engineering from Arizona State University in 1994 and worked for several years at Ticketmaster as a programmer for VAX machines. On the subject of his certifications, he wrote in 2011: "Everybody knows electrical is higher in the engineering pecking order than CS because it requires real math ;-) I'm a rocket scientist, though, not a very good one".`
];

function getRandomReply(): string {
    const randomIndex = Math.floor(Math.random() * replies.length);
    return replies[randomIndex];
}

function containsCIA(str: string): boolean {
   return /cia/i.test(str);
}

client.once('ready', () => {
    console.log('Bot is online!');
    const channel = client.channels.cache.get(process.env.HOME_CHANNEL_ID ?? '')
    if (channel && channel.type === ChannelType.GuildText) {
        channel.send('I just restarted.')
    }
});

client.on('error', console.error)
client.on('shardError', console.error)

const meetupReply = `
Next meetup event will be **April 3rd, WEDNESDAY at 1608 Queen St ( CoWorx )**

We're going to have our usual agenda of conversation, drinks, pizza, and ice breakers ------- but we're going to share our side projects!

Are you working on anything new? A new game? A new design? Some drawing art? A raspberry-pi setup? A new desktop setup? Hosted your own game server? Let's talk about

Your 'presentation' does not have to be fancy or high quality; you can be casual and informal with it - but do try to keep it interesting for your audience!

https://www.meetup.com/js-developers-of-wilmington/events/299126162/
`

let lastChannelId = ''
client.on('messageCreate', message => {
   if (message.content === '!terry') {
       message.channel.send(getRandomReply());
       lastChannelId = message.channelId
   }

   if (message.content === '!meetup') {
       message.channel.send(meetupReply)
   }

   if (containsCIA(message.content)) {
       message.react('👀')
   }
});

client.login(token);

const startWeeklyMeetupLink = (): CronJob => new CronJob(
    '0 0 12 * * 0',
    () => {
        // Fetch the channel using the saved channel ID
        const channel = client.channels.cache.get(lastChannelId);
        
        if (channel) {
            (channel as any).send(meetupReply)
        } else {
            console.log('Channel not found or the bot does not have access to it.');
        }
    },
    null,
    true
)

startWeeklyMeetupLink()
