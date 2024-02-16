const { EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = 'https://www.bdl.gov.lb/announcements.php';
let previousAnnouncement = '';

module.exports = (client) => {
  client.handleBDLRss = setInterval(async () => {
    try {
      const guild = client.guilds.cache.get('1163193549471359197');
      const BDLChannel = guild.channels.cache.find((channel) =>
        channel.name.startsWith('bdl')
      );
      const response = await axios.get(url, { timeout: 50000 });
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
        announcementData[0].announcementNb !==
          previousAnnouncement.announcementNb
      ) {
        console.log(typeof announcementData[0].addressedTo);
        if (announcementData[0].addressedTo.startsWith('Banks')) {
          const BanqueDuLibanEmbed = new EmbedBuilder()
            .setColor('#28aa41')
            .setTitle('Public Announcement - BDL')
            .setURL(url)
            .setAuthor({
              name: 'Banque Du Liban',
              iconURL:
                'https://cms.suse.net/sites/default/files/logo_images/Banque_du_Liban_logo-resized.png',
              url: url,
            })
            .setDescription('BDL latest Announcement')
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

          BDLChannel.send({ embeds: [BanqueDuLibanEmbed] });
          console.log('BDL Announcement sent to Banks');
        }
      } else {
        const BanqueDuLibanEmbed = new EmbedBuilder()
          .setColor('#28aa41')
          .setTitle('Financial Announcement - BDL')
          .setURL(url)
          .setAuthor({
            name: 'Banque Du Liban',
            iconURL:
              'https://cms.suse.net/sites/default/files/logo_images/Banque_du_Liban_logo-resized.png',
            url: url,
          })
          .setDescription('BDL latest Announcement')
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

        BDLChannel.send({ embeds: [BanqueDuLibanEmbed] });
        console.log('BDL Announcement sent to Public');
      }

      previousAnnouncement = announcementData[0];
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }, 10000); //12 hours 43200000
};
