module.exports = {
  apps: [
    {
      name: 'cutlet-api',
      script: 'npm',
      args: 'start',
      cwd: './',
      instances: 'max', // CPU 코어 수만큼 인스턴스 생성
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/pm2/err.log',
      out_file: './logs/pm2/out.log',
      log_file: './logs/pm2/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      autorestart: true,
      cron_restart: '0 2 * * *', // 매일 새벽 2시 재시작
      ignore_watch: [
        'node_modules',
        'logs',
        '.git',
        '.next',
        'public'
      ],
      // 헬스체크 설정
      health_check_grace_period: 3000,
      health_check_fatal_exceptions: true,
      // 클러스터 설정
      kill_timeout: 5000,
      listen_timeout: 3000,
      // 모니터링 설정
      pmx: true,
      // 환경 변수
      env_file: '.env.local'
    }
  ],

  // 배포 설정
  deploy: {
    staging: {
      user: 'deploy',
      host: 'staging.cutlet.com',
      ref: 'origin/staging',
      repo: 'git@github.com:your-username/cutlet.git',
      path: '/var/www/cutlet/staging',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env staging',
      'pre-setup': ''
    },
    production: {
      user: 'deploy',
      host: 'cutlet.com',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/cutlet.git',
      path: '/var/www/cutlet/production',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  },

  // 모니터링 설정
  pm2: {
    // PM2 모니터링 활성화
    monitoring: true,
    // 로그 설정
    log: {
      timestamp: true,
      format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  }
}
