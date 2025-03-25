import mongoose from "mongoose"

/**
 * 连接数据库
 * @returns {Promise} 数据库连接Promise
 */
const connectDB = async () => {
  // 如果已经连接，则直接返回
  if (mongoose.connections[0].readyState) {
    console.log('数据库已连接，复用现有连接');
    return;
  }

  // 获取MongoDB连接URI
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('未提供MONGODB_URI环境变量');
    throw new Error('未配置MongoDB连接字符串，请在.env文件中设置MONGODB_URI');
  }

  console.log('尝试连接到MongoDB:', MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')); // 隐藏敏感信息

  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      family: 4,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    };

    await mongoose.connect(MONGODB_URI, options);
    console.log("数据库连接成功");
  } catch (error) {
    if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
      console.error("MongoDB网络连接错误:", {
        message: error.message,
        code: error.code
      });
      if (process.env.NODE_ENV === 'development') {
        console.warn('开发环境下继续运行，但某些功能可能不可用');
        return;
      }
    } else {
      console.error("数据库连接错误:", {
        name: error.name,
        message: error.message,
        code: error.code
      });
    }
    throw error;
  }
}

export default connectDB

