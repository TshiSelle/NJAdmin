client.on('guildMemberAdd', (member) => {
  const welcomeChannel = client.channels.cache.get('1203292795327086622');
  if (!welcomeChannel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('Welcome')
    .setDescription(`Welcome to the server, ${member}!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: 'Date retreived',
    });

  welcomeChannel.send({ embeds: [welcomeEmbed] });
});

client.on('guildMemberRemove', (member) => {
  const welcomeChannel = client.channels.cache.get('1203292795327086622');
  if (!welcomeChannel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Goodbye')
    .setDescription(`Goodbye, ${member}!`)
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp()
    .setFooter({
      text: 'Date retreived',
    });

  welcomeChannel.send({ embeds: [welcomeEmbed] });
});
