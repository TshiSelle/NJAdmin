const cheerio = require('cheerio');
const axios = require('axios');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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
