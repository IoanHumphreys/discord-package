const { Events } = require('discord.js');
const { prefix } = require('../config/bot');
const logger = require('../utils/logger');
const { createErrorEmbed } = require('../utils/helpers');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Ignore messages that don't start with prefix
        if (!message.content.startsWith(prefix)) return;

        // Parse command and arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Find the command
        const command = message.client.commands.get(commandName) ||
                       message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;

        // Check if command is slash-only
        if (command.slashOnly) {
            const embed = createErrorEmbed(`This command is only available as a slash command. Use \`/${commandName}\` instead.`);
            return message.reply({ embeds: [embed] });
        }

        // Cooldown handling
        const { cooldowns } = message.client;

        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Map());
        }

        const now = Date.now();
        const timestamps = cooldowns.get(command.data.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                const embed = createErrorEmbed(`Please wait ${timeLeft.toFixed(1)} more seconds before reusing the \`${command.data.name}\` command.`);
                return message.reply({ embeds: [embed] });
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        // Execute command
        try {
            // Check if command has a messageRun method (for prefix commands)
            if (command.messageRun) {
                await command.messageRun(message, args);
            } else if (command.execute) {
                // For compatibility with slash commands that can also run as prefix commands
                // Create a pseudo-interaction object
                const pseudoInteraction = createPseudoInteraction(message, args, command);
                await command.execute(pseudoInteraction);
            } else {
                const embed = createErrorEmbed('This command is not available as a prefix command.');
                return message.reply({ embeds: [embed] });
            }

            logger.info(`${message.author.tag} executed ${prefix}${commandName} in ${message.guild?.name || 'DM'}`);
        } catch (error) {
            logger.error(`Error executing prefix command ${commandName}:`, error);
            
            const embed = createErrorEmbed('There was an error executing this command!');
            
            try {
                await message.reply({ embeds: [embed] });
            } catch (replyError) {
                logger.error('Could not send error message:', replyError);
            }
        }
    },
};

// Helper function to create a pseudo-interaction for commands that work with both slash and prefix
function createPseudoInteraction(message, args, command) {
    return {
        user: message.author,
        member: message.member,
        guild: message.guild,
        channel: message.channel,
        channelId: message.channel.id,
        guildId: message.guild?.id,
        commandName: command.data.name,
        replied: false,
        deferred: false,
        
        // Mock methods for compatibility
        reply: async (options) => {
            if (typeof options === 'string') {
                return await message.reply(options);
            }
            return await message.reply(options);
        },
        
        followUp: async (options) => {
            if (typeof options === 'string') {
                return await message.channel.send(options);
            }
            return await message.channel.send(options);
        },
        
        editReply: async (options) => {
            // For prefix commands, we can't really edit, so we send a new message
            if (typeof options === 'string') {
                return await message.channel.send(options);
            }
            return await message.channel.send(options);
        },
        
        deferReply: async () => {
            // For prefix commands, we can show typing indicator
            await message.channel.sendTyping();
            return;
        },
        
        // Mock options getter for commands that check interaction.options
        options: {
            getString: (name) => args[getOptionIndex(command, name, 'string')] || null,
            getInteger: (name) => {
                const value = args[getOptionIndex(command, name, 'integer')];
                return value ? parseInt(value) : null;
            },
            getNumber: (name) => {
                const value = args[getOptionIndex(command, name, 'number')];
                return value ? parseFloat(value) : null;
            },
            getBoolean: (name) => {
                const value = args[getOptionIndex(command, name, 'boolean')];
                if (!value) return null;
                return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
            },
            getUser: (name) => {
                // Simple mention parsing - you might want to make this more robust
                const value = args[getOptionIndex(command, name, 'user')];
                if (!value) return null;
                const match = value.match(/^<@!?(\d+)>$/);
                return match ? message.client.users.cache.get(match[1]) : null;
            },
            getMember: (name) => {
                const user = this.getUser(name);
                return user ? message.guild?.members.cache.get(user.id) : null;
            },
            getChannel: (name) => {
                const value = args[getOptionIndex(command, name, 'channel')];
                if (!value) return null;
                const match = value.match(/^<#(\d+)>$/);
                return match ? message.client.channels.cache.get(match[1]) : null;
            },
            getRole: (name) => {
                const value = args[getOptionIndex(command, name, 'role')];
                if (!value) return null;
                const match = value.match(/^<@&(\d+)>$/);
                return match ? message.guild?.roles.cache.get(match[1]) : null;
            }
        }
    };
}

// Helper to get option index based on command structure
function getOptionIndex(command, optionName, optionType) {
    if (!command.data.options) return 0;
    
    const option = command.data.options.find(opt => 
        opt.name === optionName && opt.type.toString().toLowerCase().includes(optionType)
    );
    
    if (!option) return 0;
    
    return command.data.options.indexOf(option);
}