require('dotenv').config();
const { CHATGPT_API_KEY } = process.env;
const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios'); // Assuming you're using axios for API calls

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gpt')
    .setDescription('send a query to Chat GPT')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('What do you want to ask ChatGPT?')
        .setRequired(true)
        .setMaxLength(250)
    ),
  async execute(interaction, client) {
    const query = interaction.options.getString('query');

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'text-davinci-003',
          messages: [
            {
              role: 'user',
              content: query,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${CHATGPT_API_KEY}`,
          },
        }
      );

      const gptResponse = response.data.choices[0].message.content;
      await interaction.reply({ content: gptResponse });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Error interacting with ChatGPT. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
