require('dotenv').config();
const { BOT_TOKEN } = process.env;
const fs = require('fs');
const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
  AuditLogEvent,
  Events,
} = require('discord.js');

var log = console.log;
console.log = function (a) {
  log('[' + new Date().toLocaleString() + ']: ' + a);
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});
client.commands = new Collection();
client.commandArray = [];
//--------------------------------------------FUNCTION FOLDER-------------------------------------------//
const functionFolder = fs.readdirSync('./src/functions');
for (const folder of functionFolder) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith('.js'));

  for (const file of functionFiles)
    require(`./src/functions/${folder}/${file}`)(client);
}
//--------------------------------------------FUNCTION FOLDER-------------------------------------------//

//--------------------------------------------STATIC RSS-------------------------------------------//
const rssStaticFolder = fs
  .readdirSync(`./src/staticRss`)
  .filter((file) => file.endsWith('.js'));
for (const file of rssStaticFolder) require(`./src/staticRss/${file}`)(client);

//--------------------------------------------STATIC RSS-------------------------------------------//

//--------------------------------------------AUDIT LOG-------------------------------------------//
const auditer = new EmbedBuilder();
client.on(Events.GuildAuditLogEntryCreate, async (auditLog) => {
  const auditChannel = client.channels.cache.get('1203005418314670080');

  const { action, executorId, targetId } = auditLog;

  if (action === AuditLogEvent.MessageDelete) {
    const executor = await client.users.fetch(executorId);
    const target = await client.users.fetch(targetId);

    console.log(
      `A message by ${target.tag} was deleted by ${executor.tag} in ${channel}.`
    );

    auditer
      .setColor('#Random')
      .setTitle('Message Deletion')
      .setAuthor({ name: `${executor.tag}` })
      .setDescription(`A message by ${target.tag} was deleted in ${channel}.`)
      .setTimestamp()
      .setFooter({ text: 'Date retreived' });

    auditChannel.send({ embeds: [auditer] });
  }
  console.log(AuditLogEvent[action], executorId, targetId);
});

//--------------------------------------------AUDIT LOG-------------------------------------------//

client.handleEvents();
client.handleCommands();
client.login(BOT_TOKEN);
