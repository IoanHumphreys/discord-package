require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { initializeDatabase } = require('./config/database');
const { startApiServer } = require('./api/server'); // Add this line
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');
const logger = require('./utils/logger');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();

// Initialize handlers
async function initializeBot() {
    try {
        // Initialize database connection
        await initializeDatabase();
        logger.info('Database initialized successfully');

        // Load commands and events
        await commandHandler(client);
        await eventHandler(client);

        // Login to Discord
        await client.login(process.env.TOKEN);
        
        // Start API server after bot is ready
        client.once('ready', () => {
            startApiServer(client); // Add this line
        });
    } catch (error) {
        logger.error('Failed to initialize bot:', error);
        process.exit(1);
    }
}

initializeBot();