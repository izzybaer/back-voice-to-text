// Confirm that all necessary environment variables have been set
let required = [
  'DEBUG',
  'PORT',
  'API_URL',
  'NODE_ENV',
  'CLIENT_URL',
  'MONGODB_URI',
  'CORS_ORIGINS',
]

try {
  required.forEach(key => {
    if(!process.env[key])
      throw new Error(`__ENVIRONMENT_ERROR__ voice-to-text backend requires process.env.${key} to be set`)
  })
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
