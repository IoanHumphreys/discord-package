const { Events } = require('discord.js');
const logger = require('../utils/logger');
const { createErrorEmbed } = require('../utils/helpers');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            logger.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
            logger.info(`${interaction.user.tag} executed /${interaction.commandName}`);
        } catch (error) {
            logger.error(`Error executing command ${interaction.commandName}:`, error);
            
            const errorEmbed = createErrorEmbed('There was an error executing this command!');
            
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    },
};