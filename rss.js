require('dotenv').config();
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const feedparser = require('feedparser');

const { MONGO_URI } = process.env;
const RssFeed = require('./src/DB/rssSchema');
const { default: mongoose } = require('mongoose');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('RSS')
    .setDescription('Subscribe to RSS feeds')
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('The URL of the RSS feed')
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const url = interaction.options.getString('url');
    try {
      await mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      if (!isValidUrl(url)) {
        return interaction.reply('Invalid RSS feed URL. Please try again.');
      }

      const existingFeed = await RssFeed.findOne({ url });
      if (existingFeed) {
        return interaction.reply('This RSS feed is already subscribed.');
      }

      const newFeed = new RssFeed({ url });
      await newFeed.save();

      const feedData = await fetchAndParseFeed(url);

      const embed = new EmbedBuilder()
        .setColor('#007bff')
        .setTitle(feedData.title)
        .setDescription(feedData.description)
        .addFields([
          { name: 'Link', value: feedData.link, inline: true },
          { name: 'Updated At', value: feedData.updatedDate, inline: true },
        ]);
      interaction.reply({ embeds: [embed] });

      setInterval(async () => {
        try {
          const updatedFeedData = await fetchAndParseFeed(url);

          if (updatedFeedData.updatedDate > existingFeed.lastUpdatedAt) {
            const updateEmbed = new EmbedBuilder().addFields([
              { name: 'New Items', value: '...', inline: false },
            ]);
            interaction.channel.send({ embeds: [updateEmbed] });
          }

          await RssFeed.updateOne(
            { url },
            { $set: { lastUpdatedAt: updatedFeedData.updatedDate } }
          );
        } catch (error) {
          console.error(`Error updating feed ${url}:`, error);
        }
      }, 20000);
    } catch (error) {
      console.error('Error:', error);
      interaction.reply('An error occurred. Please try again later.');
    } finally {
      await mongoose.connection.close();
    }
  },
};
function isValidUrl(url) {
  const rssUrlRegex = /^https?:\/\/.*\.rss$/i;
  return rssUrlRegex.test(url);
}

async function fetchAndParseFeed(url) {
  const feed = await feedparser.parseUrl(url);
  const items = feed.items.map((item) => ({
    title: item.title,
    description: item.description,
    link: item.link,
    updatedDate: new Date(item.pubdate),
  }));
  return {
    title: feed.title,
    description: feed.description,
    link: feed.feedUrl,
    updatedDate: new Date(feed.updated),
    items,
  };
}
