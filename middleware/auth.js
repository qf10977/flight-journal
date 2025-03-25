import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'

/**
 * 验证JWT令牌并获取用户信息
 * @param {string} token JWT令牌
 * @returns {object} 解码后的用户信息
 */
const verifyToken = (token) => {
    if (!token) {
        throw new Error('未提供认证令牌')
    }
    return jwt.verify(token, process.env.JWT_SECRET)
}

/**
 * 通用认证中间件
 * @param {boolean} requireAdmin 是否需要管理员权限
 */
const createAuthMiddleware = (requireAdmin = false) => {
    return async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '')
            
            const decoded = verifyToken(token)
            const user = await User.findOne({ _id: decoded.id })

            if (!user) {
                throw new Error('用户不存在')
            }

            if (requireAdmin && user.role !== 'admin') {
                return res.status(403).json({ 
                    success: false,
                    message: '需要管理员权限' 
                })
            }

            // 将用户信息添加到请求对象中
            req.token = token
            req.user = user
            next()
        } catch (err) {
            console.error('认证失败:', err.message)
            res.status(err.message.includes('管理员') ? 403 : 401).json({
                success: false,
                message: err.message || '认证失败'
            })
        }
    }
}

// 普通用户认证中间件
export const auth = createAuthMiddleware(false)

// 管理员认证中间件
export const adminAuth = createAuthMiddleware(true)

// 简化的令牌认证中间件（不查询数据库）
export const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1]
        req.user = verifyToken(token)
        next()
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: error.message || '认证失败' 
        })
    }
}

// 处理用户资料更新的中间件
export const handleProfileUpdate = async (req, res) => {
    try {
        const userId = req.user.id
        const updates = {}

        // 处理用户名更新
        if (req.body.name) {
            updates.name = req.body.name
        }

        // 处理密码更新
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10)
            updates.password = await bcrypt.hash(req.body.password, salt)
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
                avatar: updatedUser.avatar
            }
        })
    } catch (error) {
        console.error('更新用户资料失败:', error)
        res.status(500).json({
            success: false,
            message: '更新失败，请稍后重试'
        })
    }
}

export default {
    auth,
    adminAuth,
    handleProfileUpdate,
    authenticateToken
}
