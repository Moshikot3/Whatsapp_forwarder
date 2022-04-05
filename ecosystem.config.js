module.exports = {
  apps : [{
    name   : "Whatsapp_forwarder",
    script : "./app.js",
    watch: ["app.js"],
    // Delay between restart
    watch_delay: 1000,
    ignore_watch : ["node_modules"]
  }]
}
