import faker from 'faker'

import User from '../../models/user.js'

const mockUser = {}

mockUser.createOne = () => {
  let testUser = {
    username: faker.random.alphaNumeric(15),
    displayName: faker.random.alphaNumeric(8),
    password: faker.internet.password(),
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
