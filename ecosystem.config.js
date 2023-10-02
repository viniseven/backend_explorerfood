module.exports = {
  apps: [
    {
      name: 'foodexplorer',
      script: './src/server.js',
      instances: 'max',
      env_production: {
        NODE_ENV: 'production'
      },
      env_development: {
        NODE_ENV: 'development'
      }
    }
  ]
};
