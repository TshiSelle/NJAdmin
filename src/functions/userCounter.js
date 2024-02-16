setInterval(async () => {
  const guild = client.guilds.cache.get('1163193549471359197');
  const data = await guild.members.fetch();
  const onlineUsers = data.filter(
    (member) =>
      member.presence !== null && member.presence?.status !== 'offline'
  ).size;
  const offlineUsers = data.filter(
    (member) =>
      member.presence === null || member.presence?.status === 'offline'
  ).size;

  const onlineChannel = guild.channels.cache.find((channel) =>
    channel.name.startsWith('Online Users:')
  );
  const offlineChannel = guild.channels.cache.find((channel) =>
    channel.name.startsWith('Offline Users:')
  );

  if (onlineChannel) {
    await onlineChannel.setName(`Online Users: ${onlineUsers}`);
  }

  if (offlineChannel) {
    await offlineChannel.setName(`Offline Users: ${offlineUsers}`);
  }
}, 30000);
