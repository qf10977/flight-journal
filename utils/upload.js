import multer from 'multer'
import path from 'path'

/**
 * 配置multer上传
 * @param {string} destination 上传目标目录
 * @returns {object} multer配置对象
 */
export const configureMulter = (destination) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destination)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname))
        }
    })

    return multer({ 
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024 // 限制5MB
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('只允许上传图片文件'), false)
            }
            cb(null, true)
        }
    })
} 