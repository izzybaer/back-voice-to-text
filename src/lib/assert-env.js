
let required = [
  'PORT',
  'SECRET',
  'API_URL',
  'NODE_ENV',
  'CLIENT_URL',
  'MONGODB_URI',
  'CORS_ORIGINS',
]

try {
  required.forEach(key => {
    if(!process.env[key])
      throw new Error(`ENVIRONMENT ERROR: voice-to-text backend requires process.env.${key} to be set`)
  })
} catch (e) {
  console.error(e.message)
  process.exit(1)
}
