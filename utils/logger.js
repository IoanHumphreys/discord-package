const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function formatTime() {
    return new Date().toLocaleString();
}

const logger = {
    info: (message, ...args) => {
        console.log(`${colors.blue}[INFO]${colors.reset} ${formatTime()} - ${message}`, ...args);
    },
    
    error: (message, ...args) => {
        console.error(`${colors.red}[ERROR]${colors.reset} ${formatTime()} - ${message}`, ...args);
    },
    
    warn: (message, ...args) => {
        console.warn(`${colors.yellow}[WARN]${colors.reset} ${formatTime()} - ${message}`, ...args);
    },
    
    success: (message, ...args) => {
        console.log(`${colors.green}[SUCCESS]${colors.reset} ${formatTime()} - ${message}`, ...args);
    },
    
    debug: (message, ...args) => {
        if (process.env.ENVIRONMENT === 'development') {
            console.log(`${colors.cyan}[DEBUG]${colors.reset} ${formatTime()} - ${message}`, ...args);
        }
    }
};

module.exports = logger;