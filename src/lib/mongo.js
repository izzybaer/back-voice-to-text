import mongoose from 'mongoose'
mongoose.Promise = Promise

const state = {
  isOn: false,
  config: {
    useMongoClient: true,
    promiseLibrary: Promise,
  },
}

export const start = () => {
  if(state.isOn)
    return Promise.reject(new Error('ERROR: Database is already running'))
  return mongoose.connect(process.env.MONGODB_URI, state.config)
    .then(() => {
      console.log('__MONGO_CONNECTED__', process.env.MONGODB_URI)
      state.isOn = true
    })
}

export const stop = () => {
  if(!state.isOn)
    return Promise.reject(new Error('ERROR: Database is already off'))
  return mongoose.disconnect()
    .then(() => {
      state.isOn = false
      console.log('__MONGO_DISCONNECTED__')
    })
}
