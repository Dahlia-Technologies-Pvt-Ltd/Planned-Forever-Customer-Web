module.exports = {
    apps: [
      {
        name: "Wedding Planner Customer",          // Name of your application
        script: "npm",                             // Command to run
        args: "start",                             // Arguments to the script
        instances: 1,                              // Run a single instance
        exec_mode: "fork",                         // Run in fork mode (simpler than cluster)
        env: {
          NODE_ENV: "production"                   // Set to production environment
        }
      }
    ]
  };