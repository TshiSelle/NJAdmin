const { EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const urlMOF = 'http://www.finance.gov.lb/en-us/';

let previousAnnouncementMOF = '';

module.exports = (client) => {
  client.handleMOFRss = setInterval(async () => {
    try {
      const response = await axios.get(urlMOF, { timeout: 50000 });
      const $ = cheerio.load(response.data);
      const announcementDataMOF = [];
      const guild = client.guilds.cache.get('1163193549471359197');
      const MOFChannnel = guild.channels.cache.find((channel) =>
        channel.name.includes('mof')
      );

      const firstLi = $('ul');

      const day = firstLi.find('.datesinside .number').first().text().trim();
      const month = firstLi.find('.datesinside .month').first().text().trim();
      const date = `${day} ${month}`;
      const announcementTitleMOF = firstLi.find('.text').first().text().trim();

      announcementDataMOF.push({
        date,
        announcementTitleMOF,
      });

      if (
        !previousAnnouncementMOF ||
        announcementTitleMOF[0].announcementTitleNSSF !==
          previousAnnouncementMOF.announcementTitleNSSF
      ) {
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

        MOFChannnel.send({ embeds: [MOFEmbed] });
      }

      previousAnnouncementMOF = announcementDataMOF[0];
    } catch (error) {
      const guild = client.guilds.cache.get('1163193549471359197');
      const MOFChannnel = guild.channels.cache.find((channel) =>
        channel.name.includes('mof')
      );

      const MOFError = new EmbedBuilder()
        .setColor('#00FFFF')
        .setTitle('Ministry of Finance')
        .setURL(urlMOF)
        .setAuthor({
          name: 'MOF Down',
          iconURL:
            'http://www.finance.gov.lb/_catalogs/masterpage/MOF/Content/images/logo.png',
          url: urlMOF,
        })
        .setDescription('MOF latest Announcement')
        .addFields(
          { name: 'Date', value: 'N/A', inline: false },

          {
            name: 'MOF Website seem to be out of service for the time being',
            value: 'N/A',
            inline: false,
          }
        )

        .setImage(
          'http://www.finance.gov.lb/_catalogs/masterpage/MOF/Content/images/logo.png'
        )
        .setTimestamp()
        .setFooter({
          text: 'Date retreived',
        });

      MOFChannnel.send({ embeds: [MOFError] });
      //console.error('Error fetching announcements:', error);
    }
  }, 43200000); //12 hours 43200000*/
};
