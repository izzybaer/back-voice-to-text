import User from '../../models/user.js'
import Document from '../../models/document.js'

export default () =>
  Promise.all([
    User.remove({}),
    Document.remove({}),
  ])
