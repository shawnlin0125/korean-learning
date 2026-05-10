// PM2 Ecosystem 設定檔 — 韓文學習平台
module.exports = {
  apps: [{
    name: 'korean-learning',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/home/ubuntu/projects/korean-learning',
    instances: 1,           // 單線程（可改為 'max' 用多核）
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    // 自動重啟設定
    max_restarts: 10,
    restart_delay: 2000,
    max_memory_restart: '500M',
    // 日誌
    error_file: '/home/ubuntu/.pm2/logs/korean-learning-error.log',
    out_file: '/home/ubuntu/.pm2/logs/korean-learning-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // 監控
    watch: false,
    merge_logs: true,
  }]
};
