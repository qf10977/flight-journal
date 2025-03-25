import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

export const register = async (req, res) => {
  try {
    const { name, email, password, verificationCode } = req.body

    // 检查验证码
    if (!verificationCode || verificationCode !== req.session.verificationCode) {
      return res.status(400).json({ message: '验证码无效' })
    }

    // 创建用户
    const user = await User.create({
      name,
      email,
      password,
      isVerified: true
    })

    // 生成 token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '100d' }
    )

    res.status(201).json({ token, user })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    
    console.log('登录尝试:', { email, password: '***' });
    
    // 查找用户
    const user = await User.findOne({ email }).select('+password')
    console.log('查找用户结果:', user ? '用户存在' : '用户不存在');
    
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    // 验证密码
    console.log('开始验证密码');
    const isMatch = await user.comparePassword(password)
    console.log('密码验证结果:', isMatch ? '密码正确' : '密码错误');
    
    if (!isMatch) {
      return res.status(401).json({ message: '邮箱或密码错误' })
    }

    // 生成 token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '100d' }
    )

    // 返回用户信息（不包含密码）
    const userResponse = { ...user._doc, password: undefined };
    console.log('登录成功，返回用户信息:', { 
      id: userResponse._id, 
      name: userResponse.name, 
      email: userResponse.email 
    });

    res.json({ token, user: userResponse })
  } catch (error) {
    console.error('登录过程发生错误:', error);
    res.status(400).json({ message: error.message })
  }
}

export const verify = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: '未授权' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    res.json({ user })
  } catch (error) {
    res.status(401).json({ message: '无效的 token' })
  }
} 