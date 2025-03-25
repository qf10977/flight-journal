import express from 'express'
import { auth } from '../middleware/auth.js'
import Memo from '../models/Memo.js'

const router = express.Router()

// 获取用户的所有备忘录
router.use(auth)

router.get('/', async (req, res) => {
    try {
        const memos = await Memo.find({ user: req.user.id })
            .sort({ createdAt: -1 })
        res.json(memos)
    } catch (error) {
        console.error('获取备忘录失败:', error)
        res.status(500).json({ message: '获取备忘录失败' })
    }
})

// 添加新备忘录
router.post('/', auth, async (req, res) => {
    try {
        const { title, content } = req.body
        const memo = new Memo({
            user: req.user.id,
            title,
            content
        })
        await memo.save()
        res.status(201).json(memo)
    } catch (error) {
        console.error('添加备忘录失败:', error)
        res.status(500).json({ message: '添加备忘录失败' })
    }
})

// 更新备忘录
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, content, completed } = req.body
        const memo = await Memo.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { title, content, completed },
            { new: true }
        )
        if (!memo) {
            return res.status(404).json({ message: '备忘录不存在' })
        }
        res.json(memo)
    } catch (error) {
        console.error('更新备忘录失败:', error)
        res.status(500).json({ message: '更新备忘录失败' })
    }
})

// 删除备忘录
router.delete('/:id', auth, async (req, res) => {
    try {
        const memo = await Memo.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        })
        if (!memo) {
            return res.status(404).json({ message: '备忘录不存在' })
        }
        res.json({ message: '备忘录已删除' })
    } catch (error) {
        console.error('删除备忘录失败:', error)
        res.status(500).json({ message: '删除备忘录失败' })
    }
})

export default router
