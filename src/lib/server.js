import cors from 'cors'
import {Server} from 'http'
import morgan from 'morgan'
import express from 'express'
import {randomBytes} from 'crypto'

import * as mongo from './mongo.js'
import User from '../models/user.js'
import authRouter from '../routers/auth.js'
import documentRouter from '../routers/document.js'
import four04 from '../middleware/four-0-4.js'
import errorHandler from '../middleware/error-middleware.js'
// import io from './io.js'
// import editSubscriber from '../subscribers/edit.js'

const app = express()
app.enable('trust proxy') // So I can retrieve information from the client on requests so I can log them for authorization related actions (req.hostname, req.ip, req.ips)

app.use(morgan('dev'))
app.use(cors({
  origin: process.env.CORS_ORIGINS,
  credentials: true,
}))

app.use(authRouter)
app.use(documentRouter)

app.use(four04)
app.use(errorHandler)

const state = {
  isOn: false,
  http: null,
}

export const start = () =>
  new Promise((resolve, reject) => {
    if(state.isOn)
      return reject(new Error('__SERVER_ERROR__ Server is already running'))
    state.isOn = true
    mongo.start()
      .then(() => {
        process.env.SECRET = randomBytes(256).toString('base64') // Dynamically generate the SECRET for session tokens every time the server starts
        User.updateMany({}, {tokenSeed: undefined, tokenExpire: 0}, {runValidators: true}) // Because crypto dynamically updates the SECRET everytime the server starts, I need to wipe out all current session tokens because they won't match the new secret
          .then(() => {
            state.http = Server(app) // Express can't handle socket-io directly, sending app through http module fixes this
            // io(state.http, editSubscriber) // Instantiate socket-io and the subscribers to handle

            state.http.listen(process.env.PORT, () => {
              console.log('__SERVER_UP__', process.env.API_URL)
              resolve()
            })
          })
      })
      .catch(reject)
  })

export const stop = () =>
  new Promise((resolve, reject) => {
    if(!state.isOn)
      return reject(new Error('__SERVER_ERROR__ Server is already offline'))
    return mongo.stop()
      .then(() => {
        state.http.close(() => {
          console.log('__SERVER_DOWN__')
          state.isOn = false
          state.http = null
          resolve()
        })
      })
      .catch(reject)
  })
