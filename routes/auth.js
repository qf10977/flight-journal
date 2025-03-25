import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from '../models/User.js'
import { register, login, verify } from '../controllers/auth.js'
import { auth, adminAuth, handleProfileUpdate } from '../middleware/auth.js'
import { configureMulter } from '../utils/upload.js'

const router = express.Router()

// 创建邮件传输器
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

// 存储验证码（实际应用中应该使用 Redis）
const verificationCodes = new Map()

// 配置 multer
const upload = configureMulter('public/uploads/avatars')

// 发送验证码
router.post('/send-verification', async (req, res) => {
    try {
        const { email } = req.body
        
        // 生成6位数验证码
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        
        // 存储验证码，5分钟有效
        verificationCodes.set(email, {
            code,
            expires: Date.now() + 5 * 60 * 1000
        })

        // 发送邮件
        const mailOptions = {
            from: `"飞行日志" <${process.env.SMTP_USER}>`,
            to: email,
            subject: '飞行日志 - 注册验证码',
            html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                    <h1 style="color: #4F46E5; text-align: center;">欢迎注册飞行日志</h1>
                    <p style="font-size: 16px; line-height: 1.5;">您好，</p>
                    <p style="font-size: 16px; line-height: 1.5;">您的验证码是：</p>
                    <div style="background-color: #F3F4F6; padding: 15px; text-align: center; border-radius: 5px;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${code}</span>
                    </div>
                    <p style="font-size: 14px; color: #6B7280; margin-top: 20px;">验证码有效期为5分钟，请尽快完成注册。</p>
                    <p style="font-size: 14px; color: #6B7280;">如果这不是您的操作，请忽略此邮件。</p>
                </div>
            `
        }

        await transporter.sendMail(mailOptions)

        res.json({ message: '验证码已发送' })
    } catch (error) {
        console.error('发送验证码失败:', error.message)
        res.status(500).json({ message: '发送验证码失败' })
    }
})

// 注册
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, verificationCode } = req.body

        // 验证验证码
        const storedCode = verificationCodes.get(email)
        if (!storedCode || 
            storedCode.code !== verificationCode || 
            Date.now() > storedCode.expires) {
            return res.status(400).json({ message: '验证码无效或已过期' })
        }

        // 删除已使用的验证码
        verificationCodes.delete(email)

        // 检查用户是否已存在
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: '该邮箱已被注册' })
        }

        // 创建新用户
        const user = new User({
            name,
            email,
            password  // 密码会在 save 时自动加密
        })
        await user.save()

        // 生成 token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        })
    } catch (error) {
        console.error('注册失败:', error)
        res.status(500).json({ message: '注册失败' })
    }
})

// 登录
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        // 查找用户
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(401).json({ message: '邮箱或密码错误' })
        }

        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ message: '邮箱或密码错误' })
        }

        // 生成 token
        const token = jwt.sign(
            { 
                id: user._id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        // 返回用户信息和 token
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    } catch (error) {
        console.error('登录失败:', error)
        res.status(500).json({ message: '登录失败', error: error.message })
    }
})

// 验证 token
router.get('/verify', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password')
        if (!user) {
            return res.status(404).json({ message: '用户不存在' })
        }
        res.json(user)
    } catch (error) {
        console.error('验证失败:', error)
        res.status(500).json({ message: '验证失败' })
    }
})

// 退出登录
router.post('/logout', auth, (req, res) => {
    try {
        // 不依赖会话，仅返回成功响应
        res.json({ 
            success: true, 
            message: '退出成功',
            data: null
        });
    } catch (error) {
        console.error('退出处理失败:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || '退出失败'
        });
    }
});

// 在现有路由的基础上添加一个别名路由，用于处理 /api/posts/logout 请求
router.post('/posts/logout', auth, (req, res) => {
    // 返回成功响应
    res.status(200).json({ message: '成功退出' });
});

// 更新用户资料
router.put('/profile', auth, upload.single('avatar'), async (req, res) => {
    try {
        const userId = req.user.id
        const updates = {}

        // 从 FormData 中获取数据
        const name = req.body.name
        const password = req.body.password

        if (!name) {
            return res.status(400).json({
                success: false,
                message: '用户名不能为空'
            })
        }

        updates.name = name

        if (password) {
            const salt = await bcrypt.genSalt(10)
            updates.password = await bcrypt.hash(password, salt)
        }

        // 处理头像更新
        if (req.file) {
            updates.avatar = `/uploads/avatars/${req.file.filename}`
        }

        // 更新用户信息
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, select: '-password' }
        )

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: '用户不存在'
            })
        }

        res.json({
            success: true,
            message: '更新成功',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                avatar: updatedUser.avatar  // 确保返回更新后的头像 URL
            }
        })
    } catch (error) {
        console.error('更新用户资料失败:', error)
        res.status(500).json({
            success: false,
            message: '更新失败，请稍后重试'
        })
    }
})

export default router
