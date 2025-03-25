import express from 'express'
import Airport from '../models/Airport.mjs'

const router = express.Router()

// 获取机场列表（公开接口）
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 12, search = '' } = req.query
        const skip = (page - 1) * limit

        const query = search
            ? {
                $or: [
                    { iata: { $regex: search, $options: 'i' } },
                    { name: { $regex: search, $options: 'i' } },
                    { city: { $regex: search, $options: 'i' } }
                ]
            }
            : {}

        const airports = await Airport.find(query)
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ iata: 1 })
            .select('-createdAt -updatedAt -__v')

        const total = await Airport.countDocuments(query)
        const hasMore = skip + airports.length < total

        res.json({
            airports,
            hasMore,
            total
        })
    } catch (error) {
        console.error('获取机场列表失败:', error)
        res.status(500).json({ message: '获取机场列表失败' })
    }
})

// 获取单个机场信息
router.get('/:iata', async (req, res) => {
    try {
        const airport = await Airport.findOne({ iata: req.params.iata.toUpperCase() }).select('-createdAt -updatedAt -__v')
        if (!airport) {
            return res.status(404).json({ message: '机场不存在' })
        }
        res.json(airport)
    } catch (error) {
        console.error('获取机场信息失败:', error)
        res.status(500).json({ message: '获取机场信息失败' })
    }
})

export default router
