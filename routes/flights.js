import express from 'express'
import { auth } from '../middleware/auth.js'
import { 
  createFlight,
  getFlights,
  getFlight,
  updateFlight,
  deleteFlight
} from '../controllers/flights.js'
import User from '../models/User.js'

const router = express.Router()

// 应用认证中间件到所有路由
router.use(auth)

// 获取用户的航班记录
// 获取当前用户航班记录
router.get('/', getFlights)

// 创建航班记录
router.post('/', createFlight)

// 航班记录操作
router.get('/:id', getFlight)
router.put('/:id', updateFlight)
router.delete('/:id', deleteFlight)

export default router
