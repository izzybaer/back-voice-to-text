import faker from 'faker'

import Document from '../../models/document.js'

const mockDocument = {}

// Adds a random document to the test DB
mockDocument.createOne = ownerId =>
  new Document({
    ownerId,
    title: faker.random.words(3),
    description: faker.random.words(8),
    body: faker.random.words(20),
  })
    .save()

mockDocument.createMany = (n, ownerId) =>
  Promise.all(new Array(n).fill(0).map(() => mockDocument.createOne(ownerId)))

export default mockDocument
