const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { createEmbed } = require('../../utils/helpers');

module.exports = {
    category: 'General',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help information for commands')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Get help for a specific command')
                .setRequired(false)),
    
    async execute(interaction) {
        const commandName = interaction.options.getString('command');
        
        if (commandName) {
            // Show help for specific command
            const command = interaction.client.commands.get(commandName);
            
            if (!command) {
                const embed = createEmbed({
                    title: '❌ Command Not Found',
                    description: `No command with name \`${commandName}\` was found.`,
                    color: 0xff0000
                });
                return interaction.reply({ embeds: [embed], ephemeral: true });
            }
            
            const embed = createEmbed({
                title: `Help: /${command.data.name}`,
                description: command.data.description,
                fields: [
                    {
                        name: 'Usage',
                        value: `\`/${command.data.name}\``,
                        inline: true
                    },
                    {
                        name: 'Category',
                        value: command.category || 'General',
                        inline: true
                    }
                ]
            });
            
            return interaction.reply({ embeds: [embed] });
        }
        
        // Show general help
        const commands = interaction.client.commands;
        const categories = {};
        
        // Group commands by category
        commands.forEach(cmd => {
            const category = cmd.category || 'General';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(cmd);
        });
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 Bot Commands')
            .setDescription('Here are all available commands:')
            .setColor(0x3b82f6)
            .setTimestamp();
        
        // Add fields for each category
        Object.keys(categories).forEach(category => {
            const commandList = categories[category]
                .map(cmd => `\`/${cmd.data.name}\` - ${cmd.data.description}`)
                .join('\n');
            
            embed.addFields({
                name: `${category} (${categories[category].length})`,
                value: commandList.length > 1024 ? commandList.substring(0, 1021) + '...' : commandList,
                inline: false
            });
        });
        
        embed.addFields({
            name: 'Need more help?',
            value: 'Use `/help <command>` for detailed information about a specific command.',
            inline: false
        });
        
        await interaction.reply({ embeds: [embed] });
    },
};