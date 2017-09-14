import createError from 'http-errors'

export default (req, res, next) =>
  next(createError(404, `__ROUTING_ERROR__ ${req.url.path} is an invalid route`))
