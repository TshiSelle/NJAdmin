const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription('Delete n amount of messages')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('Amount of messages to Delete')
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const channel = interaction.channel;

    if (
      !channel
        .permissionsFor(interaction.member)
        .has(PermissionsBitField.Flags.Administrator)
    ) {
      return interaction.reply({
        content: 'You do not have permission to use this command',
        ephemeral: true,
      });
    }
    try {
      if (channel.permissionsFor(interaction.member).has('administator')) {
        const messages = await channel.messages.fetch({ limit: amount });
        await channel.bulkDelete(messages);
        interaction.reply({
          content: `Deleted ${amount} messages`,
          ephemeral: true,
        });
      } else {
        interaction.reply({
          content: `You do not have the required permissions to use this command.`,
          ephemeral: true,
        });
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
      interaction.reply({
        content:
          'An error occurred while deleting messages. Please try again later.',
        ephemeral: true,
      });
    }
  },
};
