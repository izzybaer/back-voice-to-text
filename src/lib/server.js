'use strict'

import cors from 'cors'
// import io from './io.js'
import morgan from 'morgan'
import {Server} from 'http'
import express from 'express'
import * as mongo from './mongo.js'

import documentRouter from '../routers/document.js'
import four04 from '../middleware/4-0-4.js'
import errorHandler from '../middleware/error-middleware.js'

// import documentSubscriber from '../subscribers/document.js'
