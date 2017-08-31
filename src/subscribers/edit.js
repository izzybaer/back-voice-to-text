import Document from '../models/document.js'

const EDIT = socket => payload => {
  let referrer = socket.handshake.headers.referer.split('/')[4]
  console.log('REFERERRRR', referrer)
  console.log('payload id', payload._id)
  if(referrer.length > 0 && payload._id.toString() === referrer.toString())
    Document.findByIdAndUpdate(payload._id, payload, { new: true, runValidators: true })
      .then(doc => {
        socket.broadcast.emit('EDIT', doc._doc)
      })
}

export default {EDIT}
