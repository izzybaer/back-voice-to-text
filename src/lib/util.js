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
export const securityWarning = (type, message, input, source, requestInfo) => {
  // Potentially add logic to count # of security warnings in a given time period and alert via email or push notification/etc to me, so I know when an attack is being made against the website

  input = JSON.stringify(input, null, 2)
  requestInfo = JSON.stringify(requestInfo, null, 2)
  console.error(`__SECURITY_WARNING__ ${type}: ${message} (Source: ${source}, Timestamp: ${Date.now()})\nInput received: ${input}\nUser Info: ${requestInfo}`)
}

// Encode regular text into Base64 (Binary to base64 ascii)
export const btoa = text =>
  new Buffer(text.toString(), 'binary').toString('base64')

// Decode base64 text into regular (Base64 ascii to binary)
export const atob = text =>
  new Buffer(text, 'base64').toString('binary')

// For logs that only should be logged in a dev/stage environment and not in prod
export const devLog = (...args) =>
  process.env.DEBUG === 'true' ? console.log(...args) : undefined

  // For errors that only should be logged in a dev/stage environment and not in prod
export const devLogError = (...args) =>
  process.env.DEBUG === 'true' ? console.error(...args) : undefined
