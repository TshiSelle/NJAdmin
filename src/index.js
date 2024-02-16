require('dotenv').config();
const { BOT_TOKEN } = process.env;

const {
  Client,
  Collection,
  GatewayIntentBits,
  EmbedBuilder,
  AuditLogEvent,
  Events,
} = require('discord.js');

const fs = require('fs');
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const cheerio = require('cheerio');
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

const functionFolder = fs.readdirSync('./src/functions');
for (const folder of functionFolder) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith('.js'));

  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

//--------------------------------User Counts for Only One Server---------------------------------//
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

//--------------------------------User Counts for Only One Server---------------------------------//

//--------------------------------Welcome and Bye Joiner -----------------------------------------//
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
//--------------------------------Welcome and Bye Joiner -----------------------------------------//

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

//--------------------------------RSS FOR BANQUE DU LIBAN-----------------------------------------//

const url = 'https://www.bdl.gov.lb/announcements.php';
let previousAnnouncement = '';
setInterval(async () => {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);

    const announcementData = [];
    $('tr').each((index, row) => {
      const date = $(row).find('td:nth-child(1)').text().trim();
      const announcementNb = $(row).find('td:nth-child(2)').text().trim();
      const announcementTitle = $(row).find('td:nth-child(4)').text().trim();
      const addressedTo = $(row).find('td:nth-child(7)').text().trim();

      if (index === 1) {
        announcementData.push({
          date,
          announcementNb,
          announcementTitle,
          addressedTo,
        });
      }
    });

    if (
      !previousAnnouncement ||
      announcementData[0].announcementNb !== previousAnnouncement.announcementNb
    ) {
      const RSSchannel = client.channels.cache.get('1198316829723082752');
      const BanqueDuLibanEmbed = new EmbedBuilder()
        .setColor('#28aa41')
        .setTitle('Banque du Liban Announcements')
        .setURL(url)
        .setAuthor({
          name: 'Banque Du Liban',
          iconURL:
            'https://cms.suse.net/sites/default/files/logo_images/Banque_du_Liban_logo-resized.png',
          url: url,
        })
        .setDescription('BDL latest Announcement')
        //.setThumbnail('https://www.bdl.gov.lb/images/logo2.png')
        .addFields(
          { name: 'Date', value: announcementData[0].date },
          {
            name: 'Announcement Nb',
            value: announcementData[0].announcementNb,
            inline: true,
          },
          {
            name: 'Announcement Title',
            value: announcementData[0].announcementTitle,
            inline: true,
          },
          {
            name: 'Addressed to',
            value: announcementData[0].addressedTo,
          }
        )

        .setImage(
          'https://cms.suse.net/sites/default/files/logo_images/Banque_du_Liban_logo-resized.png'
        )
        .setTimestamp()
        .setFooter({
          text: 'Date retreived',
        });

      RSSchannel.send({ embeds: [BanqueDuLibanEmbed] });
    }

    previousAnnouncement = announcementData[0];
  } catch (error) {
    console.error('Error fetching announcements:', error);
  }
}, 10000); //12 hours 43200000

//--------------------------------RSS FOR BANQUE DU LIBAN-----------------------------------------//
//--------------------------------RSS FOR NSSF ---------------------------------------------------//

const urlNSSF = 'https://www.cnss.gov.lb';
let previousAnnouncementNSSF = '';

setInterval(async () => {
  try {
    const response = await axios.get(urlNSSF, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const announcementDataNSSF = [];
    const firstLi = $('ul.latest-article li:first-child');
    const date = firstLi.find('a p.latest-article-date').text().trim();

    const announcementTitleNSSF = firstLi
      .find('a p.latest-article-title')
      .text()
      .trim();

    announcementDataNSSF.push({
      date,
      announcementTitleNSSF,
    });

    if (
      !previousAnnouncementNSSF ||
      announcementDataNSSF[0].announcementTitleNSSF !==
        previousAnnouncementNSSF.announcementTitleNSSF
    ) {
      const RSSchannelNSSF = client.channels.cache.get('1198316829723082752');
      const NSSFEmbed = new EmbedBuilder()
        .setColor('#2b048c')
        .setTitle('NSSF Announcements')
        .setURL(urlNSSF)
        .setAuthor({
          name: 'National Social Security Fund',
          iconURL:
            'https://www.cnss.gov.lb/wp-content/themes/nssf/assets/images/logo.png',
          url: url,
        })
        .setDescription('NSSF latest Announcement')
        .addFields(
          { name: 'Date', value: announcementDataNSSF[0].date },

          {
            name: 'Announcement Title',
            value: announcementDataNSSF[0].announcementTitleNSSF,
            inline: true,
          }
        )

        .setImage(
          'https://www.cnss.gov.lb/wp-content/themes/nssf/assets/images/logo.png'
        )
        .setTimestamp()
        .setFooter({
          text: 'Date retreived',
        });

      RSSchannelNSSF.send({ embeds: [NSSFEmbed] });
    }

    previousAnnouncementNSSF = announcementDataNSSF[0];
  } catch (error) {
    console.error('Error fetching announcements:', error);
  }
}, 10000); //12 hours 43200000

//--------------------------------RSS FOR NSSF ---------------------------------------------------//
//--------------------------------RSS FOR IFRS ---------------------------------------------------//
const urlIFRS = 'https://www.ifrs.org/';
let previousAnnouncementIFRS = '';
setInterval(async () => {
  try {
    const response = await axios.get(urlIFRS, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const announcementDataIFRS = [];
    fetch(
      'https://www.ifrs.org/content/ifrs/home/jcr:content/root/responsivegrid/mynewstile.model.json?filterYear=All&filterType=All&filterByFollowTag=false&style=homePage'
    )
      .then((RES) => RES.json())
      .then((data) => {
        const announcementTitleIFRS = data.resultList[0].description;
        const IFRSdate = data.resultList[0].date;
        const announcementCategoryIFRS = data.resultList[0].title;

        announcementDataIFRS.push({
          IFRSdate,
          announcementTitleIFRS,
          announcementCategoryIFRS,
        });

        if (
          !previousAnnouncementIFRS ||
          (announcementDataIFRS[0].announcementTitleIFRS !==
            previousAnnouncementIFRS.announcementTitleIFRS &&
            announcementDataIFRS[0].announcementCategoryIFRS !==
              previousAnnouncementIFRS.announcementCategoryIFRS)
        ) {
          const RSSchannelIFRS = client.channels.cache.get(
            '1198316829723082752'
          );
          const IFRSEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('International Financial Reporting Standards')
            .setURL(urlIFRS)
            .setAuthor({
              name: 'IFRS Foundation',
              iconURL:
                'https://miro.medium.com/v2/resize:fit:739/1*3zMqo1rzwwAjuz3lH_vKDQ.jpeg',
              url: urlIFRS,
            })
            .setDescription('IFRS latest Announcement')
            .addFields(
              { name: 'Date', value: announcementDataIFRS[0].IFRSdate },
              {
                name: 'Announcement Title',
                value: announcementDataIFRS[0].announcementTitleIFRS,
                inline: false,
              },
              {
                name: 'Category',
                value: announcementDataIFRS[0].announcementCategoryIFRS,
                inline: false,
              }
            )

            .setImage(
              'https://miro.medium.com/v2/resize:fit:739/1*3zMqo1rzwwAjuz3lH_vKDQ.jpeg'
            )
            .setTimestamp()
            .setFooter({
              text: 'Date retreived',
            });

          RSSchannelIFRS.send({ embeds: [IFRSEmbed] });
        }

        previousAnnouncementIFRS = announcementDataIFRS[0];
      });
  } catch (error) {
    console.error('Error fetching announcements:', error);
  }
}, 10000); //12 hours 43200000

//--------------------------------RSS FOR IFRS ---------------------------------------------------//
//--------------------------------RSS FOR MOF ----------------------------------------------------//
const urlMOF = 'http://www.finance.gov.lb/en-us/';
let previousAnnouncementMOF = '';

setInterval(async () => {
  try {
    const response = await axios.get(urlMOF, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const announcementDataMOF = [];

    const firstLi = $('ul');

    const day = firstLi.find('.datesinside .number').first().text().trim();
    const month = firstLi.find('.datesinside .month').first().text().trim();
    const date = `${day} ${month}`;
    const announcementTitleMOF = firstLi.find('.text').first().text().trim();

    console.log(date);
    console.log(announcementTitleMOF);
    //console.log(month);
    //console.log(announcementDataMOF);
    //console.log(firstLi);

    announcementDataMOF.push({
      date,
      announcementTitleMOF,
    });

    if (
      !previousAnnouncementMOF ||
      announcementTitleMOF[0].announcementTitleNSSF !==
        previousAnnouncementMOF.announcementTitleNSSF
    ) {
      const RSSchannelMOF = client.channels.cache.get('1198316829723082752');
      const MOFEmbed = new EmbedBuilder()
        .setColor('#00FFFF')
        .setTitle('Ministry of Finance')
        .setURL(urlMOF)
        .setAuthor({
          name: 'MOF',
          iconURL:
            'http://www.finance.gov.lb/_catalogs/masterpage/MOF/Content/images/logo.png',
          url: urlMOF,
        })
        .setDescription('MOF latest Announcement')
        .addFields(
          { name: 'Date', value: announcementDataMOF[0].date },

          {
            name: 'Announcement Title',
            value: announcementDataMOF[0].announcementTitleMOF,
            inline: true,
          }
        )

        .setImage(
          'http://www.finance.gov.lb/_catalogs/masterpage/MOF/Content/images/logo.png'
        )
        .setTimestamp()
        .setFooter({
          text: 'Date retreived',
        });

      RSSchannelMOF.send({ embeds: [MOFEmbed] });
    }

    previousAnnouncementMOF = announcementDataMOF[0];
  } catch (error) {
    console.error('Error fetching announcements:', error);
  }
}, 10000); //12 hours 43200000*/
//--------------------------------RSS FOR MOF ----------------------------------------------------//

client.handleEvents();
client.handleCommands();
client.login(BOT_TOKEN);
