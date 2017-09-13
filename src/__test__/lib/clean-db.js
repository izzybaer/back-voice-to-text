import Document from '../../models/document.js'
import User from '../../models/user.js'

export default () =>
  Promise.all([
    User.remove({}),
    Document.remove({}),
  ])
