import express from 'express'
import multer from 'multer'
import { auth } from '../middleware/auth.js'
import Journal from '../models/Journal.js'

const router = express.Router()

// 配置 multer
const storage = multer.memoryStorage()
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
})

// 获取图片 - 要放在最前面
router.get('/images/:id', async (req, res) => {
    try {
        const journal = await Journal.findOne({ 'images._id': req.params.id });
        if (!journal) {
            return res.status(404).send();
        }
        
        const image = journal.images.id(req.params.id);
        if (!image || !image.data) {
            return res.status(404).send();
        }

        res.set('Content-Type', image.contentType);
        res.send(image.data);
    } catch (error) {
        res.status(500).send();
    }
});

// 获取所有笔记
router.get('/', async (req, res) => {
    try {
        const journals = await Journal.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            data: journals
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: err.message 
        });
    }
});

// 获取单个笔记详情
router.get('/:id', auth, async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id)
            .populate('user', 'name avatar')
            .populate('comments.user', '_id name avatar')
            .populate('likes', 'name')
            .lean();

        if (!journal) {
            return res.status(404).json({
                success: false,
                message: '笔记不存在'
            });
        }

        // 确保在格式化数据时包含头像信息
        const formattedJournal = {
            _id: journal._id,
            title: journal.title || '',
            content: journal.content || '',
            location: journal.location || '',
            images: journal.images || [],
            user: {
                _id: journal.user?._id || '',
                name: journal.user?.name || '匿名用户',
                avatar: journal.user?.avatar || null
            },
            likes: journal.likes || [],
            comments: (journal.comments || []).map(comment => ({
                _id: comment._id,
                content: comment.content || '',
                user: {
                    _id: comment.user?._id || '',
                    name: comment.user?.name || '匿名用户',
                    avatar: comment.user?.avatar || null
                },
                createdAt: comment.createdAt || new Date()
            })),
            createdAt: journal.createdAt || new Date()
        };

        res.json({
            success: true,
            data: formattedJournal
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || '获取笔记详情失败'
        });
    }
});

// 添加评论
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({
                success: false,
                message: '评论内容不能为空'
            });
        }

        const journal = await Journal.findById(req.params.id);
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: '笔记不存在'
            });
        }

        // 添加新评论
        journal.comments.push({
            user: req.user._id,
            content,
            createdAt: new Date()
        });

        await journal.save();

        // 重新获取带有用户信息的评论
        const updatedJournal = await Journal.findById(req.params.id)
            .populate({
                path: 'comments.user',
                select: 'name avatar'
            })
            .lean();

        // 格式化评论数据
        const formattedComments = updatedJournal.comments.map(comment => ({
            _id: comment._id,
            content: comment.content,
            user: {
                _id: comment.user?._id || '',
                name: comment.user?.name || '匿名用户',
                avatar: comment.user?.avatar
            },
            createdAt: comment.createdAt
        }));

        res.json({
            success: true,
            data: formattedComments
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || '添加评论失败'
        });
    }
});

// 点赞/取消点赞
router.post('/:id/like', auth, async (req, res) => {
    try {
        const journal = await Journal.findById(req.params.id);
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: '笔记不存在'
            });
        }

        const userId = req.user._id;
        const likeIndex = journal.likes.indexOf(userId);

        if (likeIndex === -1) {
            journal.likes.push(userId);
        } else {
            journal.likes.splice(likeIndex, 1);
        }

        await journal.save();

        res.json({
            success: true,
            data: {
                isLiked: likeIndex === -1,
                likes: journal.likes.length
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || '点赞失败'
        });
    }
});

// 获取用户的所有笔记
router.get('/user', auth, async (req, res) => {
    try {
        // 从认证中间件获取用户ID
        const userId = req.user._id;

        // 查找该用户的所有笔记
        const journals = await Journal.find({ user: userId })
            .sort({ createdAt: -1 }) // 按创建时间降序排序
            .select('title content location images createdAt'); // 只选择需要的字段

        // 添加调试日志
        console.log('找到的笔记:', journals);

        res.json({
            success: true,
            data: journals,
            message: '获取笔记成功'
        });
    } catch (error) {
        console.error('获取用户笔记失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取笔记失败'
        });
    }
});

// 创建新笔记
router.post('/', auth, upload.array('images', 5), async (req, res) => {
    try {
        const { title, content, location } = req.body;

        // 验证必填字段
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: '标题和内容不能为空'
            });
        }

        // 处理上传的图片
        const images = req.files?.map(file => ({
            data: file.buffer,
            contentType: file.mimetype
        })) || [];

        // 创建新笔记
        const journal = new Journal({
            title,
            content,
            location,
            user: req.user.id,
            images
        });

        await journal.save();

        res.status(201).json({
            success: true,
            message: '笔记发布成功',
            data: {
                _id: journal._id,
                title: journal.title,
                content: journal.content,
                location: journal.location,
                createdAt: journal.createdAt
            }
        });

    } catch (error) {
        console.error('发布笔记失败:', error);
        res.status(500).json({
            success: false,
            message: '发布失败，请重试'
        });
    }
});

// 删除评论
router.delete('/:journalId/comments/:commentId', auth, async (req, res) => {
    try {
        const { journalId, commentId } = req.params;
        const journal = await Journal.findById(journalId);
        
        if (!journal) {
            return res.status(404).json({
                success: false,
                message: '笔记不存在'
            });
        }

        // 找到要删除的评论
        const comment = journal.comments.id(commentId);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: '评论不存在'
            });
        }

        // 检查是否是评论作者
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: '只能删除自己的评论'
            });
        }

        // 删除评论
        journal.comments = journal.comments.filter(c => c._id.toString() !== commentId);
        await journal.save();

        res.json({
            success: true,
            message: '评论已删除'
        });
    } catch (err) {
        console.error('删除评论时出错:', err);
        res.status(500).json({
            success: false,
            message: err.message || '删除评论失败'
        });
    }
});

export default router