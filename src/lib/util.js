export const promisify = fn => (...args) =>
  new Promise((resolve, reject) => {
    fn(...args, (err, data) => {
      if(err)
        return reject(err)
      resolve(data)
    })
  })

export const securityWarning = (type, message, input, source) => {
  // Potentially add logic to count # of security warnings in a given time period and alert via email or push notification/etc to me, so I know when an attack is being made against the website
  console.error(`__SECURITY_WARNING__ ${type}: ${message} (Source: ${source}, Timestamp: ${Date.now()})\nInput received: ${input}`)
}

export const btoa = text =>
  new Buffer(text.toString(), 'binary').toString('base64')
