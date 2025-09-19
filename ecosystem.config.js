module.exports = {
  apps: [{
    name: 'hypd-url-shortener',
    script: 'src/server.js',
    instances: 1, // You can increase this for clustering
    exec_mode: 'fork', // Use 'cluster' for multiple instances
    watch: false, // Set to true for development
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
