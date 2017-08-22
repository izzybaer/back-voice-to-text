'use strict'

import Mongoose, {Schema} from 'mongoose'

const documentSchema = new Schema({
  title: {type: String, required: true},
  description: {type: String, required: true},
  body: {type: String},
})

export default Mongoose.model('document', documentSchema)
