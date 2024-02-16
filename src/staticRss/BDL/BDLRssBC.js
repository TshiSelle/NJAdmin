const { EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const url = 'https://www.bdl.gov.lb/announcements.php';
let previousDecision = '';

module.exports = (client) => {
  client.handleBDLRss = setInterval(async () => {
    try {
      const response = await axios.get(url, { timeout: 10000 });
      const $ = cheerio.load(response.data);

      const announcementData = [];
      $('tr').each((index, row) => {
        const date = $(row).find('td:nth-child(1)').text().trim();
        const decisionNb = $(row).find('td:nth-child(2)').text().trim();
        const circularNb = $(row).find('td:nth-child(3)').text().trim();
        const decisionTitle = $(row).find('td:nth-child(5)').text().trim();

        if (index === 1) {
          announcementData.push({
            date,
            decisionNb,
            circularNb,
            decisionTitle,
          });
        }
      });

      if (
        !previousDecision ||
        announcementData[0].decisionNb !== previousDecision.decisionNb
      ) {
        const guild = client.guilds.cache.get('1163193549471359197');
        const BDLChannel = guild.channels.cache.find((channel) =>
          channel.name.startsWith('bdl')
        );
        const BanqueDuLibanEmbed = new EmbedBuilder()
          .setColor('#28aa41')
          .setTitle('Basic Circulars - BDL')
          .setURL(url)
          .setAuthor({
            name: 'Banque Du Liban',
            iconURL:
              'https://cms.suse.net/sites/default/files/logo_images/Banque_du_Liban_logo-resized.png',
            url: url,
          })
          .setDescription('latest Decision')
          .addFields(
            { name: 'Date', value: announcementData[0].date },
            {
              name: 'Decision Nb',
              value: announcementData[0].decisionNb,
              inline: true,
            },
            {
              name: 'Circular Nb',
              value: announcementData[0].circularNb,
            },
            {
              name: 'Decision Title',
              value: announcementData[0].decisionTitle,
              inline: true,
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
      }

      previousAnnouncement = announcementData[0];
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }, 10000); //12 hours 43200000
};