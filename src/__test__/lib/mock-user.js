'use strict'

import faker from 'faker'

import User from '../../models/user.js'

const mockUser = {}

mockUser.createOne = () =>
  User.createFromSignup({
    username: faker.random.words(1),
    displayName: faker.random.words(1),
    password: faker.random.password(),
  })

mockUser.createMany = n =>
  Promise.all(new Array(n).fill(0).map(() => mockUser.createOne()))

export default mockUser
