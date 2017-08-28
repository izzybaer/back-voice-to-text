import Document from '../models/document.js'

const EDIT = socket => payload => {
  Document.findByIdAndUpdate(payload._id, payload, { new: true, runValidators: true })
    .then(doc => {
      socket.broadcast.emit('EDIT', doc._doc)
    })
}

export default {EDIT}
