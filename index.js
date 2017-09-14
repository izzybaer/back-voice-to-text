require('dotenv').config() // Config correct environment variables
require('./src/lib/assert-env.js') // Make sure all required env variables have been defined
require('babel-register') // ES6
require('./src/main.js') // App
