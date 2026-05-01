module.exports = {
  apps: [
    {
      name:        'iscev-api',
      script:      'server.js',
      cwd:         __dirname,
      instances:   'max',       // CPU sayısı kadar process
      exec_mode:   'cluster',
      watch:       false,
      max_memory_restart: '512M',

      env: {
        NODE_ENV: 'development',
        PORT:     5001,
        AUTO_SEED: 'true',
      },

      env_production: {
        NODE_ENV: 'production',
        PORT:     5001,
        AUTO_SEED: 'false',
      },

      error_file: './logs/pm2-error.log',
      out_file:   './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Graceful restart
      kill_timeout:   5000,
      listen_timeout: 8000,
      shutdown_with_message: true,
    },
  ],
};
