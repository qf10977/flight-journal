import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import flightRoutes from './routes/flights.js';
import memoRoutes from './routes/memos.js';
import journalRoutes from './routes/journals.js';
import airportRoutes from './routes/airports.js';
import cityRoutes from './routes/cities.js';
import { authenticateToken } from './middleware/auth.js';
import { configureMulter } from './utils/upload.js';
import connectDB from './utils/connectDB.js';
import mongoose from 'mongoose';

// 初始化环境变量
dotenv.config();

// 获取 __dirname 等价物（在 ESM 中不可用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 调试中间件
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// 配置 multer
const upload = configureMulter('public/uploads/avatars');

// 连接数据库
connectDB().catch(err => {
  console.error('数据库连接失败:', err);
  process.exit(1);
});

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/memos', memoRoutes);
app.use('/api/journals', journalRoutes);
app.use('/api/airports', airportRoutes);
app.use('/api/cities', cityRoutes);

// 添加头像上传路由
app.post('/api/users/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '没有上传文件' });
        }

        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        
        // 更新用户头像
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(req.user.id, {
            avatar: avatarUrl
        });

        res.json({
            success: true,
            message: '头像更新成功',
            avatarUrl: avatarUrl,
            userId: req.user.id
        });
    } catch (error) {
        console.error('头像上传失败:', error);
        res.status(500).json({
            success: false,
            message: '头像上传失败'
        });
    }
});

// 404 处理
app.use((req, res) => {
    console.log('404 Not Found:', {
        path: req.path,
        method: req.method
    });
    res.status(404).json({ message: '路由未找到' });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err.message);
    res.status(500).json({ 
        message: '服务器错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 未捕获的 Promise 异常处理
process.on('unhandledRejection', (reason, promise) => {
    console.error('未捕获的 Promise 异常:', reason);
});

// 未捕获的异常处理
process.on('uncaughtException', (error) => {
    console.error('未捕获的异常:', error);
    // 在生产环境中可能需要优雅地关闭服务器
    if (process.env.NODE_ENV === 'production') {
        process.exit(1);
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`API服务器运行在 http://localhost:${PORT}`);
}); 