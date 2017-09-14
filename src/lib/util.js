// Convert callback style functions to promises
export const promisify = fn => (...args) =>
  new Promise((resolve, reject) => {
    fn(...args, (err, data) => {
      if(err)
        return reject(err)
      resolve(data)
    })
  })

// Handle any potential threats to the app
export const securityWarning = (type, message, input, source) => {
  // Potentially add logic to count # of security warnings in a given time period and alert via email or push notification/etc to me, so I know when an attack is being made against the website
  console.error(`__SECURITY_WARNING__ ${type}: ${message} (Source: ${source}, Timestamp: ${Date.now()})\nInput received: ${input}`)
}

// Encode regular text into Base64 (Binary to base64 ascii)
export const btoa = text =>
  new Buffer(text.toString(), 'binary').toString('base64')

// Decode base64 text into regular (Base64 ascii to binary)
export const atob = text =>
  new Buffer(text, 'base64').toString('binary')
