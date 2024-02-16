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
