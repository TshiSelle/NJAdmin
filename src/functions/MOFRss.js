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
