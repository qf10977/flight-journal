import express from 'express'
import { auth } from '../middleware/auth.js'
import City from '../models/City.js'

const router = express.Router()

// 获取所有城市数据
router.get('/', auth, async (req, res) => {
    try {
        const cities = await City.find().select('name airports longitude latitude')
        res.json({
            success: true,
            data: cities
        })
    } catch (error) {
        console.error('获取城市数据失败:', error)
        res.status(500).json({ 
            success: false,
            message: '获取城市数据失败' 
        })
    }
})

// 搜索城市
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        const cities = await City.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { airports: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(cities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

export default router 