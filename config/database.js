const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY)');
}

// Public client (for general operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client (for admin operations)
const supabaseAdmin = supabaseServiceKey 
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;

async function initializeDatabase() {
    try {
        // Simple connection test - just check if we can connect to Supabase
        const { data, error } = await supabase.auth.getSession();
        
        // The connection is working if we get here without an error
        logger.info('Supabase connection established successfully');
        
        // Optional: Log some basic info
        if (supabaseAdmin) {
            logger.info('Supabase service client available for admin operations');
        }
        
        return true;
    } catch (error) {
        logger.error('Supabase connection failed:', error.message);
        
        // Provide helpful error messages
        if (error.message.includes('Invalid API key')) {
            logger.error('Check your SUPABASE_ANON_KEY in the .env file');
        } else if (error.message.includes('Invalid URL')) {
            logger.error('Check your SUPABASE_URL in the .env file');
        }
        
        throw error;
    }
}

// Helper function to create basic tables (optional)
async function createBasicTables() {
    if (!supabaseAdmin) {
        logger.warn('Service key not provided - skipping table creation');
        return;
    }

    try {
        // Example: Create a guilds table
        const { error: guildsError } = await supabaseAdmin
            .from('guilds')
            .select('id')
            .limit(1);

        if (guildsError && guildsError.code === 'PGRST116') {
            logger.info('Creating basic tables...');
            logger.info('No tables found - you can create them in your Supabase dashboard');
        }
    } catch (error) {
        logger.debug('Table check skipped:', error.message);
    }
}

module.exports = {
    supabase,
    supabaseAdmin,
    initializeDatabase,
    createBasicTables
};