// api/auth.js - Discord OAuth routes
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Use the environment variable names that match your .env file
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
const FRONTEND_URL = process.env.DASHBOARD_URL || 'http://localhost:5173';

// Debug logging - Remove this after fixing
console.log('🔍 Environment Check:');
console.log('CLIENT_ID:', CLIENT_ID ? `${CLIENT_ID.substring(0, 8)}...` : 'UNDEFINED');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'SET' : 'UNDEFINED');
console.log('REDIRECT_URI:', REDIRECT_URI);

// Validation
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing Discord OAuth credentials!');
    console.error('Please check your .env file contains:');
    console.error('CLIENT_ID=your_application_id');
    console.error('CLIENT_SECRET=your_client_secret');
    process.exit(1);
}

// Session storage (in production, use Redis or database)
const sessions = new Map();

// Test endpoint to verify the callback route works
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Auth routes are working!', 
        timestamp: new Date().toISOString(),
        env: {
            CLIENT_ID: CLIENT_ID ? 'SET' : 'MISSING',
            CLIENT_SECRET: CLIENT_SECRET ? 'SET' : 'MISSING',
            REDIRECT_URI: REDIRECT_URI
        }
    });
});

// Generate OAuth URL
router.get('/login', (req, res) => {
    const state = Math.random().toString(36).substring(2, 15);
    const scope = 'identify guilds';
    
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
    
    // Store state for verification
    sessions.set(state, { timestamp: Date.now() });
    
    console.log('🚀 Generated auth URL for state:', state);
    res.json({ authUrl });
});

// Handle OAuth callback
router.get('/callback', async (req, res) => {
    console.log('🔄 OAuth callback received');
    console.log('Query params:', req.query);
    console.log('Headers:', req.headers);
    
    const { code, state, error: oauthError } = req.query;
    
    // Check for OAuth errors from Discord
    if (oauthError) {
        console.error('❌ OAuth error from Discord:', oauthError);
        return res.redirect(`${FRONTEND_URL}?error=oauth_${oauthError}`);
    }
    
    if (!code) {
        console.error('❌ No authorization code received');
        return res.redirect(`${FRONTEND_URL}?error=no_code`);
    }
    
    if (!state) {
        console.error('❌ No state parameter received');
        return res.redirect(`${FRONTEND_URL}?error=no_state`);
    }
    
    // Verify state
    if (!sessions.has(state)) {
        console.error('❌ Invalid or expired state:', state);
        console.log('Available states:', Array.from(sessions.keys()));
        return res.redirect(`${FRONTEND_URL}?error=invalid_state`);
    }
    
    console.log('✅ State verified, exchanging code for token...');
    sessions.delete(state);
    
    try {
        // Exchange code for access token
        console.log('📡 Requesting token from Discord...');
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
                scope: 'identify guilds'
            }),
        });
        
        const tokenData = await tokenResponse.json();
        console.log('📡 Token response status:', tokenResponse.status);
        
        if (!tokenResponse.ok) {
            console.error('❌ Discord token exchange failed:', tokenData);
            return res.redirect(`${FRONTEND_URL}?error=token_exchange_failed&details=${encodeURIComponent(JSON.stringify(tokenData))}`);
        }
        
        console.log('✅ Token received, fetching user data...');
        
        // Get user information
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        });
        
        const userData = await userResponse.json();
        console.log('📡 User response status:', userResponse.status);
        
        if (!userResponse.ok) {
            console.error('❌ Discord user fetch failed:', userData);
            return res.redirect(`${FRONTEND_URL}?error=user_fetch_failed&details=${encodeURIComponent(JSON.stringify(userData))}`);
        }
        
        console.log('✅ User data received:', userData.username);
        
        // Get user guilds
        console.log('📡 Fetching user guilds...');
        const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: {
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
        });
        
        const guildsData = await guildsResponse.json();
        console.log('📡 Guilds response status:', guildsResponse.status);
        console.log('📡 User has access to', guildsData?.length || 0, 'guilds');
        
        // Create session
        const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const sessionData = {
            user: {
                id: userData.id,
                username: userData.username,
                discriminator: userData.discriminator,
                avatar: userData.avatar,
                email: userData.email,
                global_name: userData.global_name
            },
            guilds: guildsData || [],
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            expiresAt: Date.now() + (tokenData.expires_in * 1000),
            createdAt: Date.now()
        };
        
        sessions.set(sessionId, sessionData);
        console.log('✅ Session created:', sessionId);
        
        // Set session cookie and redirect
        res.cookie('discord_session', sessionId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        
        console.log('✅ Cookie set, redirecting to dashboard...');
        logger.info(`User ${userData.username} logged in successfully`);
        res.redirect(`${FRONTEND_URL}`);
        
    } catch (error) {
        console.error('❌ OAuth callback error:', error);
        logger.error('OAuth callback error:', error);
        res.redirect(`${FRONTEND_URL}?error=server_error&details=${encodeURIComponent(error.message)}`);
    }
});

// Get current user
router.get('/me', (req, res) => {
    const sessionId = req.cookies.discord_session;
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const sessionData = sessions.get(sessionId);
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
        sessions.delete(sessionId);
        res.clearCookie('discord_session');
        return res.status(401).json({ error: 'Session expired' });
    }
    
    res.json({
        user: sessionData.user,
        guilds: sessionData.guilds
    });
});

// Logout
router.post('/logout', (req, res) => {
    const sessionId = req.cookies.discord_session;
    
    if (sessionId && sessions.has(sessionId)) {
        sessions.delete(sessionId);
        logger.info('User logged out successfully');
    }
    
    res.clearCookie('discord_session');
    res.json({ success: true });
});

// Middleware to check if user is authenticated
function requireAuth(req, res, next) {
    const sessionId = req.cookies.discord_session;
    
    if (!sessionId || !sessions.has(sessionId)) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const sessionData = sessions.get(sessionId);
    
    if (Date.now() > sessionData.expiresAt) {
        sessions.delete(sessionId);
        res.clearCookie('discord_session');
        return res.status(401).json({ error: 'Session expired' });
    }
    
    req.user = sessionData.user;
    req.userGuilds = sessionData.guilds;
    next();
}

// Clean up expired sessions periodically
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, sessionData] of sessions.entries()) {
        if (now > sessionData.expiresAt || now - sessionData.createdAt > 7 * 24 * 60 * 60 * 1000) {
            sessions.delete(sessionId);
        }
    }
}, 60 * 60 * 1000); // Clean up every hour

module.exports = { router, requireAuth };