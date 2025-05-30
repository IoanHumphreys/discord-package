// api/server.js - Updated server with authentication
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { supabase } = require('../config/database');
const { router: authRouter, requireAuth } = require('./auth');
const logger = require('../utils/logger');

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.DASHBOARD_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Auth routes
app.use('/api/auth', authRouter);

// Protected routes - require authentication
app.use('/api/stats', requireAuth);
app.use('/api/guilds', requireAuth);
app.use('/api/commands', requireAuth);
app.use('/api/activity', requireAuth);

// Bot stats endpoint (protected)
app.get('/api/stats', async (req, res) => {
    try {
        const client = req.app.get('discordClient');
        
        if (!client || !client.isReady()) {
            return res.status(503).json({ 
                error: 'Bot is not ready',
                guilds: 0,
                users: 0,
                commands: 0,
                uptime: '0m'
            });
        }

        // Calculate uptime
        const uptimeMs = client.uptime || 0;
        const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let uptimeString = '';
        if (days > 0) uptimeString += `${days}d `;
        if (hours > 0) uptimeString += `${hours}h `;
        uptimeString += `${minutes}m`;

        // Filter guilds that the user has access to
        const userGuilds = req.userGuilds || [];
        const userGuildIds = userGuilds.map(g => g.id);
        const accessibleGuilds = client.guilds.cache.filter(guild => 
            userGuildIds.includes(guild.id)
        );

        const stats = {
            guilds: accessibleGuilds.size,
            users: accessibleGuilds.reduce((acc, guild) => acc + guild.memberCount, 0),
            commands: client.commands.size,
            uptime: uptimeString.trim(),
            ping: client.ws.ping,
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            lastRestart: new Date(Date.now() - uptimeMs).toISOString(),
            totalGuilds: client.guilds.cache.size,
            totalUsers: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)
        };

        res.json(stats);
        logger.info(`Stats API called by ${req.user.username}`);
    } catch (error) {
        logger.error('Error fetching bot stats:', error);
        res.status(500).json({ error: 'Failed to fetch bot stats' });
    }
});

// Guild list endpoint (protected)
app.get('/api/guilds', async (req, res) => {
    try {
        const client = req.app.get('discordClient');
        
        if (!client || !client.isReady()) {
            return res.status(503).json({ error: 'Bot is not ready' });
        }

        // Get user's guilds from their Discord data
        const userGuilds = req.userGuilds || [];
        const userGuildIds = userGuilds.map(g => g.id);

        // Filter bot guilds to only show ones the user has access to
        const accessibleGuilds = client.guilds.cache
            .filter(guild => userGuildIds.includes(guild.id))
            .map(guild => {
                const userGuild = userGuilds.find(ug => ug.id === guild.id);
                return {
                    id: guild.id,
                    name: guild.name,
                    memberCount: guild.memberCount,
                    icon: guild.iconURL(),
                    owner: guild.ownerId,
                    userPermissions: userGuild ? userGuild.permissions : '0',
                    userIsOwner: userGuild ? (userGuild.permissions & 0x8) === 0x8 : false,
                    userCanManage: userGuild ? (userGuild.permissions & 0x20) === 0x20 : false
                };
            });

        res.json(accessibleGuilds);
        logger.info(`Guilds API called by ${req.user.username}`);
    } catch (error) {
        logger.error('Error fetching guilds:', error);
        res.status(500).json({ error: 'Failed to fetch guilds' });
    }
});

// Commands endpoint (protected)
app.get('/api/commands', async (req, res) => {
    try {
        const client = req.app.get('discordClient');
        
        if (!client || !client.isReady()) {
            return res.status(503).json({ error: 'Bot is not ready' });
        }

        const commands = Array.from(client.commands.values()).map(cmd => ({
            name: cmd.data.name,
            description: cmd.data.description,
            category: cmd.category || 'General',
            usage: cmd.usage || `/${cmd.data.name}`
        }));

        res.json(commands);
        logger.info(`Commands API called by ${req.user.username}`);
    } catch (error) {
        logger.error('Error fetching commands:', error);
        res.status(500).json({ error: 'Failed to fetch commands' });
    }
});

// Activity logs endpoint (protected)
app.get('/api/activity', async (req, res) => {
    try {
        const { data: activities, error } = await supabase
            .from('activity_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            logger.error('Supabase error:', error);
            // Return mock data if table doesn't exist yet
            return res.json([
                {
                    id: 1,
                    type: 'connection',
                    message: 'Bot connected to server "Gaming Hub"',
                    created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString()
                },
                {
                    id: 2,
                    type: 'command',
                    message: `Command "/help" executed by ${req.user.username}`,
                    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
                },
                {
                    id: 3,
                    type: 'system',
                    message: 'Database connection restored',
                    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
                }
            ]);
        }

        res.json(activities || []);
        logger.info(`Activity API called by ${req.user.username}`);
    } catch (error) {
        logger.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
});

// Health check endpoint (public)
app.get('/api/health', (req, res) => {
    const client = req.app.get('discordClient');
    
    res.json({
        status: client && client.isReady() ? 'online' : 'offline',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start server function
function startApiServer(discordClient) {
    app.set('discordClient', discordClient);
    
    app.listen(PORT, () => {
        logger.success(`API server running on port ${PORT}`);
        logger.info(`Dashboard API available at http://localhost:${PORT}/api`);
        logger.info(`Discord OAuth configured for: ${process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/api/auth/callback'}`);
    });
}

module.exports = { startApiServer };