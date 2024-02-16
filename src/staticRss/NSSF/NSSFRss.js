const { EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const urlNSSF = 'https://www.cnss.gov.lb';
let previousAnnouncementNSSF = '';
module.exports = (client) => {
  client.handleNSSFRss = setInterval(async () => {
    try {
      const response = await axios.get(urlNSSF, { timeout: 50000 });
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
        const guild = client.guilds.cache.get('1163193549471359197');
        const NSSFChannel = guild.channels.cache.find((channel) =>
          channel.name.startsWith('nssf')
        );
        const NSSFEmbed = new EmbedBuilder()
          .setColor('#2b048c')
          .setTitle('NSSF Announcements')
          .setURL(urlNSSF)
          .setAuthor({
            name: 'National Social Security Fund',
            iconURL:
              'https://www.cnss.gov.lb/wp-content/themes/nssf/assets/images/logo.png',
            url: urlNSSF,
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

        NSSFChannel.send({ embeds: [NSSFEmbed] });
      }

      previousAnnouncementNSSF = announcementDataNSSF[0];
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  }, 10000); //12 hours 43200000
};
