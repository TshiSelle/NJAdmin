const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke') // Remove spaces or use underscores
    .setDescription('Deletes a specified number of messages in a channel.')
    .addIntegerOption((option) =>
      option
        .setName('amount')
        .setDescription('The number of messages to delete.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const channel =
      interaction.options.getChannel('channel') || interaction.channel;

    if (
      !channel
        .permissionsFor(interaction.member)
        .has(PermissionFlagsBits.ManageMessages)
    ) {
      return interaction.reply({
        content:
          "You don't have permission to delete messages in this channel.",
        ephemeral: true,
      });
    }

    try {
      // Fetch the specified number of messages
      const messages = await channel.messages.fetch({ limit: amount + 1 });

      // Check if enough messages are available
      if (messages.size < amount + 1) {
        return interaction.reply({
          content: `There aren't enough messages in this channel to delete ${amount}.`,
          ephemeral: true,
        });
      }

      // Bulk delete the messages, excluding the command message
      await messages.delete({
        limit: amount,
        reason: `Deleted by ${interaction.user.tag} using /delete-messages`,
      });

      interaction.reply({
        content: `Successfully deleted ${amount} messages in ${channel.name}.`,
        ephemeral: true,
      });
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
