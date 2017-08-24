'use strict'

import faker from 'faker'

import Document from '../../models/document.js'

const mockDocument = {}

mockDocument.createOne = () =>
  new Document({
    title: faker.random.words(3),
    description: faker.random.words(8),
    body: faker.random.words(20),
  })
    .save()

mockDocument.createMany = n =>
  Promise.all(new Array(n).fill(0).map(() => mockDocument.createOne()))
