module.exports = {
  apps: [
    {
      name: "paws-api",
      script: "/root/.bun/bin/bun",
      args: "run src/index.ts",
      cwd: "/root/paws.academy/apps/api",
      env: {
        NODE_ENV: "production",
        PORT: "7000",
      },
      time: true,
      restart_delay: 2000,
      max_restarts: 10,
    },
  ],
};
