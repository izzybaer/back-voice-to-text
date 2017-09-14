import User from '../../models/user.js'
import Document from '../../models/document.js'

// Wipe out User and Document from the test database
export default () =>
  Promise.all([
    User.remove({}),
    Document.remove({}),
  ])
