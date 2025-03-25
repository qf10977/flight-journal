import mongoose from 'mongoose';

// 全局变量存储连接状态
let isConnected = false;

/**
 * 连接到MongoDB数据库
 */
export const connectToDB = async () => {
  // 如果已连接，直接返回
  if (isConnected) {
    console.log('数据库已连接，复用现有连接');
    return;
  }

  // 确保URI已设置
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('未配置MongoDB连接字符串，请在.env文件中设置MONGODB_URI');
  }

  try {
    const options = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log('正在连接到MongoDB...');
    await mongoose.connect(MONGODB_URI, options);

    isConnected = true;
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    throw error;
  }
};

// 定义用户模型Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 定义航班记录模型Schema
const flightSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  flightNumber: { type: String, required: true },
  airline: { type: String, required: true },
  departureAirport: { type: String, required: true },
  arrivalAirport: { type: String, required: true },
  departureDate: { type: Date, required: true },
  arrivalDate: { type: Date, required: true },
  status: { type: String, enum: ['计划中', '已完成', '已取消'], default: '计划中' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// 定义旅行随记模型Schema
const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  content: { type: String, required: true },
  location: { type: String },
  images: [{ type: String }],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 定义出行计划模型Schema
const travelPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  destination: { type: String, required: true },
  items: [{
    name: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['计划中', '进行中', '已完成'], default: '计划中' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 根据环境确定模型注册方式，防止模型重复注册
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Flight = mongoose.models.Flight || mongoose.model('Flight', flightSchema);
const Journal = mongoose.models.Journal || mongoose.model('Journal', journalSchema);
const TravelPlan = mongoose.models.TravelPlan || mongoose.model('TravelPlan', travelPlanSchema);

// 导出数据库连接和模型
const db = {
  connectToDB,
  User,
  Flight,
  Journal,
  TravelPlan,
  // 添加mongoose计数方法的包装
  flight: {
    count: async (query = {}) => {
      await connectToDB();
      return Flight.countDocuments(query);
    }
  },
  journal: {
    count: async (query = {}) => {
      await connectToDB();
      return Journal.countDocuments(query);
    }
  },
  travelPlan: {
    count: async (query = {}) => {
      await connectToDB();
      return TravelPlan.countDocuments(query);
    }
  }
};

export default db; 