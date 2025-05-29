const { supabase } = require('../config/database');
const logger = require('./logger');

async function logActivity(type, message, guildId = null, userId = null) {
    try {
        const { error } = await supabase
            .from('activity_logs')
            .insert([{
                type: type,
                message: message,
                guild_id: guildId,
                user_id: userId,
                created_at: new Date().toISOString()
            }]);

        if (error) {
            logger.debug('Activity log failed (table may not exist):', error.message);
        }
    } catch (error) {
        logger.debug('Activity logging skipped:', error.message);
    }
}

module.exports = { logActivity };