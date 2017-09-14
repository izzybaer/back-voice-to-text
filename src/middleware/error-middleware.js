export default (err, req, res, next) => {
  console.error(err)
  if(err.status)
    return res.sendStatus(err.status)

  err.message = err.message.toLowerCase()

  // These are possible errors thrown from around the app
  if(err.message.includes('validation failed') || err.message.includes('cast to objectid'))
    return res.sendStatus(400)

  if(err.message.includes('duplicated key'))
    return res.sendStatus(409)

  if(err.message.includes('objectid failed') || err.message.includes('is an invalid route'))
    return res.sendStatus(404)

  if(err.message.includes('unauthorized') || err.message.includes('no authorization header'))
    return res.sendStatus(401)

  return res.sendStatus(500) // If it isn't an error that I planned for, something is wrong with the server/my code
}
