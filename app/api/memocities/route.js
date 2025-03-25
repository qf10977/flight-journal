import mongoose from 'mongoose';
import 'dotenv/config';

// 连接MongoDB数据库
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB已连接');
  } catch (error) {
    console.error('MongoDB连接失败:', error);
    throw new Error('数据库连接失败');
  }
};

// 城市模型Schema，确保与导入脚本一致
const citySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  id: {
    type: String,
    required: true, 
    unique: true
  },
  airports: [String]
});

// 获取或创建城市模型，指定集合名为memocities
const MemoCity = mongoose.models.MemoCity || mongoose.model('MemoCity', citySchema, 'memocities');

// GET接口获取所有城市
export async function GET() {
  try {
    await connectDB();
    const cities = await MemoCity.find({}).sort({ name: 1 }).lean();
    
    // 使用原生Response构造函数
    return new Response(JSON.stringify(cities), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('获取城市数据失败:', error);
    
    return new Response(JSON.stringify({
      error: '获取城市数据失败', 
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

// POST接口添加新城市
export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    
    // 验证数据
    if (!data.name || !data.id || !Array.isArray(data.airports)) {
      return new Response(JSON.stringify({
        error: '数据格式不正确'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 检查是否存在
    const existingCity = await MemoCity.findOne({ $or: [{ id: data.id }, { name: data.name }] });
    if (existingCity) {
      return new Response(JSON.stringify({
        error: existingCity.id === data.id ? '城市ID已存在' : '城市名称已存在'
      }), {
        status: 409,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    // 创建新城市
    const newCity = await MemoCity.create(data);
    
    return new Response(JSON.stringify(newCity), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('添加城市失败:', error);
    
    return new Response(JSON.stringify({
      error: '添加城市失败', 
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 