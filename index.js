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
setInterval(async () => {
  const guild = client.guilds.cache.get('1163193549471359197');
  const data = await guild.members.fetch();
  const onlineUsers = data.filter(
    (member) =>
      member.presence !== null && member.presence?.status !== 'offline'
  ).size;
  const offlineUsers = data.filter(
    (member) =>
      member.presence === null || member.presence?.status === 'offline'
  ).size;

  const onlineChannel = guild.channels.cache.find((channel) =>
    channel.name.startsWith('Online Users:')
  );
  const offlineChannel = guild.channels.cache.find((channel) =>
    channel.name.startsWith('Offline Users:')
  );

  if (onlineChannel) {
    await onlineChannel.setName(`Online Users: ${onlineUsers}`);
  }

  if (offlineChannel) {
    await offlineChannel.setName(`Offline Users: ${offlineUsers}`);
  }
}, 30000);
//--------------------------------------------------------------------------------------------//
client.on('guildMemberAdd', (member) => {
  const welcomeChannel = client.channels.cache.get('1203292795327086622');
  if (!welcomeChannel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('Welcome')
    .setDescription(`Welcome to the server, ${member}!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: 'Date retreived',
    });

  welcomeChannel.send({ embeds: [welcomeEmbed] });
});

client.on('guildMemberRemove', (member) => {
  const welcomeChannel = client.channels.cache.get('1203292795327086622');
  if (!welcomeChannel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Goodbye')
    .setDescription(`Goodbye, ${member}!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: 'Date retreived',
    });

  welcomeChannel.send({ embeds: [welcomeEmbed] });
});

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
