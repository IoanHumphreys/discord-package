const { SlashCommandBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/helpers');

module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong! and shows bot latency'),
    
    async execute(interaction) {
        const sent = await interaction.reply({ 
            content: 'Pinging...', 
            fetchReply: true 
        });
        
        const ping = sent.createdTimestamp - interaction.createdTimestamp;
        const wsping = interaction.client.ws.ping;
        
        const embed = createEmbed({
            title: '🏓 Pong!',
            description: `**Bot Latency:** ${ping}ms\n**API Latency:** ${wsping}ms`,
            color: ping < 100 ? 0x00ff00 : ping < 200 ? 0xffaa00 : 0xff0000
        });
        
        await interaction.editReply({ 
            content: null, 
            embeds: [embed] 
        });
    },
};