import Document from '../../models/document.js'

export default () =>
  Promise.all([
    Document.remove({}),
  ])
