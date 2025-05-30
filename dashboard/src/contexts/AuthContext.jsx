// dashboard/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userGuilds, setUserGuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    // Check if user is authenticated
    const checkAuth = async () => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/api/auth/me`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setUserGuilds(data.guilds || []);
            } else {
                setUser(null);
                setUserGuilds([]);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            setError('Failed to check authentication status');
            setUser(null);
            setUserGuilds([]);
        } finally {
            setLoading(false);
        }
    };

    // Login with Discord
    const login = async () => {
        try {
            setError(null);
            const response = await fetch(`${API_URL}/api/auth/login`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.authUrl;
            } else {
                throw new Error('Failed to get auth URL');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError('Failed to initiate login');
        }
    };

    // Logout
    const logout = async () => {
        try {
            setError(null);
            await fetch(`${API_URL}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });

            setUser(null);
            setUserGuilds([]);
            
            // Redirect to login page
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
            setError('Failed to logout');
        }
    };

    // Get user avatar URL
    const getAvatarUrl = (user, size = 128) => {
        if (!user || !user.avatar) {
            // Default Discord avatar based on discriminator
            const defaultAvatar = user?.discriminator 
                ? parseInt(user.discriminator) % 5 
                : Math.floor(Math.random() * 5);
            return `https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png`;
        }
        
        const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=${size}`;
    };

    // Get user display name
    const getDisplayName = (user) => {
        if (!user) return 'Unknown User';
        return user.global_name || user.username || 'Unknown User';
    };

    // Check if user has permission in a guild
    const hasGuildPermission = (guildId, permission) => {
        const guild = userGuilds.find(g => g.id === guildId);
        if (!guild) return false;
        
        const permissions = parseInt(guild.permissions);
        
        // Check for specific permissions
        switch (permission) {
            case 'ADMINISTRATOR':
                return (permissions & 0x8) === 0x8;
            case 'MANAGE_GUILD':
                return (permissions & 0x20) === 0x20;
            case 'MANAGE_ROLES':
                return (permissions & 0x10000000) === 0x10000000;
            case 'MANAGE_CHANNELS':
                return (permissions & 0x10) === 0x10;
            case 'KICK_MEMBERS':
                return (permissions & 0x2) === 0x2;
            case 'BAN_MEMBERS':
                return (permissions & 0x4) === 0x4;
            default:
                return false;
        }
    };

    // Check if user can manage the bot (has admin or manage server permissions)
    const canManageBot = (guildId) => {
        return hasGuildPermission(guildId, 'ADMINISTRATOR') || 
               hasGuildPermission(guildId, 'MANAGE_GUILD');
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        user,
        userGuilds,
        loading,
        error,
        login,
        logout,
        checkAuth,
        getAvatarUrl,
        getDisplayName,
        hasGuildPermission,
        canManageBot,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};