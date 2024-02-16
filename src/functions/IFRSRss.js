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
