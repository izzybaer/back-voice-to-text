'use strict'

import faker from 'faker'

import User from '../../models/user.js'

const mockUser = {}

mockUser.createOne = () => {
  let testUser = {
    username: faker.random.words(1),
    displayName: faker.random.words(1),
    password: faker.random.words(2),
  }
  return User.createFromSignup(testUser)
    .then(user => {
      testUser._id = user._id
      return user.tokenCreate()
    })
    .then(token => {
      testUser.token = token
      return testUser
    })
}

mockUser.createMany = n =>
  Promise.all(new Array(n).fill(0).map(() => mockUser.createOne()))

export default mockUser
