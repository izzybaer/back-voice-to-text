import createError from 'http-errors'

export default (req, res, next) =>
  next(createError(404, `ERROR: ${req.url.path} is an invalid route`))
