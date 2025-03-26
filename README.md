# 飞行日志网站 - React & Next.js 版本

这是一个功能全面的飞行日志管理系统，基于React和Next.js开发，专为航空爱好者和频繁旅行者设计。系统提供了直观的飞行路线可视化、旅行日记管理和出行备忘等功能，帮助用户全方位记录、管理和分享其飞行旅程体验。

## 技术栈

- **前端**：
  - React 18：用于构建用户界面的JavaScript库
  - Next.js 14：基于React的服务端渲染框架
  - TailwindCSS：实用优先的CSS框架
  - Framer Motion：React动画库
  - SWR：用于数据获取的React Hooks库
  
- **后端**：
  - Express：Node.js Web应用框架
  - MongoDB：文档型NoSQL数据库
  - Mongoose：MongoDB对象模型工具
  
- **地图**：
  - Leaflet：开源JavaScript地图库
  - React-Leaflet：React组件封装的Leaflet
  - GeoJSON：用于地理数据的开放标准格式
  
- **认证**：
  - JWT（JSON Web Token）：用于生成安全令牌
  - bcryptjs：用于密码哈希处理
  
- **HTTP客户端**：Axios
- **文件上传**：Multer
- **数据验证**：Joi/Yup

## MongoDB数据库设计

### 数据库架构

本项目使用MongoDB作为主数据库，选择MongoDB的主要原因：
1. **文档模型**：适合存储半结构化数据，如用户旅行记录、日记内容等
2. **灵活的架构**：便于根据需求快速调整数据模型
3. **地理空间支持**：内置地理空间索引，适合处理飞行路线和位置信息
4. **高性能查询**：支持复杂查询和聚合操作

### 数据库连接配置

数据库连接使用Mongoose实现，主要配置：

```javascript
// utils/connectDB.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`MongoDB连接成功: ${conn.connection.host}`);
    
    // 连接事件监听
    mongoose.connection.on('error', err => {
      console.error(`MongoDB连接错误: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB连接断开，尝试重新连接...');
      setTimeout(connectDB, 5000);
    });
    
  } catch (error) {
    console.error(`MongoDB连接失败: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### 数据模型设计

#### 1. 用户模型 (User)

```javascript
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名必填'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少3个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱必填'],
    unique: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请提供有效邮箱']
  },
  password: {
    type: String,
    required: [true, '密码必填'],
    minlength: [6, '密码至少6个字符'],
    select: false // 查询时默认不返回密码
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: [200, '简介最多200字']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 虚拟字段：用户的飞行记录数量
UserSchema.virtual('flightCount', {
  ref: 'Flight',
  localField: '_id',
  foreignField: 'user',
  count: true
});

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 校验密码方法
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 生成JWT令牌方法
UserSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};
```

#### 2. 飞行记录模型 (Flight)

```javascript
const FlightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flightNumber: {
    type: String,
    required: [true, '航班号必填'],
    trim: true
  },
  airline: {
    type: String,
    required: [true, '航空公司必填']
  },
  departureAirport: {
    code: {
      type: String,
      required: [true, '出发机场代码必填'],
      uppercase: true,
      minlength: 3,
      maxlength: 4
    },
    name: String,
    city: String,
    country: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [经度, 纬度]
        required: true
      }
    }
  },
  arrivalAirport: {
    code: {
      type: String,
      required: [true, '到达机场代码必填'],
      uppercase: true,
      minlength: 3,
      maxlength: 4
    },
    name: String,
    city: String,
    country: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [经度, 纬度]
        required: true
      }
    }
  },
  departureTime: {
    type: Date,
    required: [true, '出发时间必填']
  },
  arrivalTime: {
    type: Date,
    required: [true, '到达时间必填']
  },
  flightClass: {
    type: String,
    enum: ['经济舱', '超级经济舱', '商务舱', '头等舱'],
    default: '经济舱'
  },
  seatNumber: String,
  flightDuration: Number, // 单位：分钟
  distance: Number, // 单位：公里
  note: String,
  status: {
    type: String,
    enum: ['计划中', '已完成', '已取消', '已延误'],
    default: '计划中'
  },
  tags: [String],
  photos: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引设置
FlightSchema.index({ 'departureAirport.location': '2dsphere' });
FlightSchema.index({ 'arrivalAirport.location': '2dsphere' });
FlightSchema.index({ user: 1, departureTime: -1 }); // 用户+日期复合索引
FlightSchema.index({ flightNumber: 'text', airline: 'text' }); // 文本搜索索引

// 自动计算飞行时长
FlightSchema.pre('save', function(next) {
  if (this.departureTime && this.arrivalTime) {
    this.flightDuration = Math.round(
      (this.arrivalTime.getTime() - this.departureTime.getTime()) / 60000
    );
  }
  next();
});

// 高级查询方法
FlightSchema.statics.getFlightStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    { $group: {
        _id: { $year: "$departureTime" },
        totalFlights: { $sum: 1 },
        totalDistance: { $sum: "$distance" },
        totalDuration: { $sum: "$flightDuration" },
        airlines: { $addToSet: "$airline" }
      }
    },
    { $sort: { _id: -1 } }
  ]);
  return stats;
};
```

#### 3. 旅行日记模型 (Journal)

```javascript
const JournalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, '标题必填'],
    trim: true,
    maxlength: [100, '标题最多100个字符']
  },
  content: {
    type: String,
    required: [true, '内容必填']
  },
  coverImage: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    },
    name: String,
    address: String
  },
  relatedFlights: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flight'
  }],
  photos: [String],
  tags: [String],
  isPublic: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 索引设置
JournalSchema.index({ location: '2dsphere' });
JournalSchema.index({ title: 'text', content: 'text', tags: 'text' });
JournalSchema.index({ user: 1, createdAt: -1 });
JournalSchema.index({ isPublic: 1, createdAt: -1 });
```

### 数据库索引优化

为提高查询性能，系统根据常见的查询模式设置了多种索引：

1. **地理空间索引**：用于地理位置查询，如查找附近机场、特定区域的日记等
   ```javascript
   FlightSchema.index({ 'departureAirport.location': '2dsphere' });
   JournalSchema.index({ location: '2dsphere' });
   ```

2. **复合索引**：优化多字段查询，如按用户和日期查询
   ```javascript
   FlightSchema.index({ user: 1, departureTime: -1 });
   MemoSchema.index({ user: 1, createdAt: -1, isCompleted: 1 });
   ```

3. **文本索引**：支持全文搜索功能
   ```javascript
   JournalSchema.index({ title: 'text', content: 'text', tags: 'text' });
   AirportSchema.index({ name: 'text', city: 'text', country: 'text' });
   ```

4. **TTL索引**：自动过期数据，如临时验证码
   ```javascript
   VerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });
   ```

### MongoDB聚合管道应用

系统广泛使用MongoDB聚合管道进行复杂数据分析和处理：

1. **飞行统计分析**：按年份统计飞行数据
   ```javascript
   db.flights.aggregate([
     { $match: { user: ObjectId("用户ID") } },
     { $group: {
         _id: { $year: "$departureTime" },
         totalFlights: { $sum: 1 },
         totalDistance: { $sum: "$distance" },
         averageDuration: { $avg: "$flightDuration" },
         airlines: { $addToSet: "$airline" }
       }
     },
     { $sort: { _id: -1 } }
   ]);
   ```

2. **日记热门排行**：按阅读量和点赞数排序
   ```javascript
   db.journals.aggregate([
     { $match: { isPublic: true } },
     { $addFields: {
         popularityScore: { $add: [
           "$views", 
           { $multiply: [{ $size: "$likes" }, 5] },
           { $multiply: [{ $size: "$comments" }, 3] }
         ]}
       }
     },
     { $sort: { popularityScore: -1 } },
     { $limit: 10 },
     { $lookup: {
         from: "users",
         localField: "user",
         foreignField: "_id",
         as: "author"
       }
     },
     { $unwind: "$author" },
     { $project: {
         title: 1,
         coverImage: 1,
         createdAt: 1,
         views: 1,
         likesCount: { $size: "$likes" },
         commentsCount: { $size: "$comments" },
         author: { username: 1, avatar: 1 }
       }
     }
   ]);
   ```

3. **地理位置聚合**：查找特定半径内的机场
   ```javascript
   db.airports.aggregate([
     {
       $geoNear: {
         near: { type: "Point", coordinates: [longitude, latitude] },
         distanceField: "distance",
         maxDistance: 50000, // 50公里内
         spherical: true
       }
     },
     { $limit: 10 },
     { $project: {
         name: 1,
         code: 1,
         city: 1,
         country: 1,
         distance: 1
       }
     }
   ]);
   ```

### 数据库事务应用

在关键业务逻辑中，应用MongoDB事务确保数据一致性：

```javascript
// 示例：创建行程同时更新统计数据
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. 创建新飞行记录
  const flight = await Flight.create([{
    user: userId,
    flightNumber,
    // 其他飞行数据
  }], { session });
  
  // 2. 更新用户统计信息
  const stats = await UserStats.findOneAndUpdate(
    { user: userId },
    { $inc: { totalFlights: 1, totalDistance: distance } },
    { session, new: true, upsert: true }
  );
  
  // 3. 如果有关联日记，建立关联
  if (journalId) {
    await Journal.findByIdAndUpdate(
      journalId,
      { $push: { relatedFlights: flight[0]._id } },
      { session }
    );
  }
  
  await session.commitTransaction();
  session.endSession();
  
  return flight[0];
} catch (error) {
  await session.abortTransaction();
  session.endSession();
  throw error;
}
```

### 数据库监控与性能优化

1. **性能监控**：使用MongoDB Compass和Atlas监控工具
2. **慢查询分析**：定期检查并优化慢查询
3. **内存使用优化**：合理设置索引和限制查询结果大小
4. **数据库缓存**：对热点数据实施Redis缓存策略

## 项目结构

```
├── app/                  # Next.js App Router目录
│   ├── components/       # React组件
│   │   ├── ui/           # 通用UI组件库
│   │   │   ├── Button.jsx    # 按钮组件
│   │   │   ├── Card.jsx      # 卡片组件
│   │   │   ├── Input.jsx     # 输入框组件
│   │   │   ├── Modal.jsx     # 模态框组件
│   │   │   ├── Dropdown.jsx  # 下拉菜单组件
│   │   │   └── ... 
│   │   ├── MapComponent.jsx  # 地图可视化组件
│   │   ├── Navbar.jsx    # 主导航栏组件
│   │   ├── JNavbar.jsx   # 日记页面专用导航栏
│   │   ├── FlightForm.jsx # 航班添加表单
│   │   ├── FlightList.jsx # 航班列表组件
│   │   ├── JournalCard.jsx # 日记卡片组件
│   │   ├── JournalEditor.jsx # 日记编辑器组件
│   │   ├── CommentSection.jsx # 评论区组件
│   │   ├── FileUploader.jsx # 文件上传组件
│   │   └── ...
│   ├── api/              # Next.js API路由
│   │   ├── auth/         # 认证相关API
│   │   ├── flights/      # 飞行记录API
│   │   ├── journals/     # 旅行日记API
│   │   ├── memos/        # 出行备忘API
│   │   └── ...
│   ├── flight-map/       # 航班地图页面
│   │   └── page.jsx      # 地图页面组件
│   ├── travel-memo/      # 出行备忘页面
│   │   └── page.jsx      # 备忘页面组件
│   ├── travel-journal/   # 出行随记页面
│   │   └── page.jsx      # 日记列表页面组件
│   ├── journal-detail/   # 日记详情页面
│   │   └── [id]/         # 动态路由
│   │       └── page.jsx  # 日记详情组件
│   ├── publish-journal/  # 发布日记页面
│   │   └── page.jsx      # 日记发布组件
│   ├── airport-info/     # 机场信息页面
│   │   └── [code]/       # 动态路由
│   │       └── page.jsx  # 机场详情组件
│   ├── login/            # 登录页面
│   │   └── page.jsx      # 登录组件
│   ├── register/         # 注册页面
│   │   └── page.jsx      # 注册组件
│   ├── user-profile/     # 个人中心页面
│   │   └── [id]/         # 动态路由
│   │       └── page.jsx  # 用户资料组件
│   ├── layout.jsx        # 根布局组件
│   ├── page.jsx          # 首页组件
│   └── globals.css       # 全局样式
├── hooks/                # 自定义React钩子
│   ├── useAuth.js        # 认证钩子
│   ├── useFlight.js      # 飞行数据钩子
│   ├── useJournal.js     # 日记数据钩子
│   ├── useMemo.js        # 备忘数据钩子
│   └── ...
├── models/               # MongoDB数据模型
│   ├── User.js           # 用户模型
│   ├── Flight.js         # 飞行记录模型
│   ├── Journal.js        # 旅行日记模型
│   ├── Memo.js           # 出行备忘模型
│   ├── Airport.mjs       # 机场信息模型
│   ├── City.js           # 城市信息模型
│   ├── Comment.js        # 评论模型
│   └── UserStats.js      # 用户统计模型
├── public/               # 静态资源
│   ├── uploads/          # 上传文件存储目录
│   │   ├── avatars/      # 用户头像
│   │   ├── journals/     # 日记图片
│   │   └── flights/      # 航班相关图片
│   ├── images/           # 静态图片资源
│   │   ├── logo.svg      # 网站logo
│   │   ├── icons/        # 图标集合
│   │   └── backgrounds/  # 背景图片
│   └── ...
├── routes/               # Express API路由
│   ├── auth.js           # 认证相关路由
│   ├── flights.js        # 飞行记录路由
│   ├── journals.js       # 旅行日记路由
│   ├── memos.js          # 出行备忘路由
│   ├── airports.js       # 机场信息路由
│   ├── cities.js         # 城市信息路由
│   ├── upload.js         # 文件上传路由
│   └── stats.js          # 统计数据路由
├── controllers/          # MVC控制器
│   ├── authController.js # 认证控制器
│   ├── flightController.js # 飞行记录控制器
│   ├── journalController.js # 日记控制器
│   ├── memoController.js # 备忘控制器
│   ├── airportController.js # 机场信息控制器
│   └── ...
├── middleware/           # Express中间件
│   ├── auth.js           # 认证中间件
│   ├── error.js          # 错误处理中间件
│   ├── upload.js         # 文件上传中间件
│   ├── rateLimiter.js    # 请求限流中间件
│   ├── validator.js      # 数据验证中间件
│   └── logger.js         # 日志中间件
├── utils/                # 工具函数
│   ├── connectDB.js      # 数据库连接
│   ├── errorResponse.js  # 错误响应格式化
│   ├── geocoder.js       # 地理编码工具
│   ├── sendEmail.js      # 邮件发送工具
│   ├── tokenManager.js   # JWT令牌管理
│   └── dateUtils.js      # 日期处理工具
├── scripts/              # 脚本文件
│   ├── initAirports.mjs  # 机场数据初始化
│   ├── importCities.js   # 城市数据导入
│   ├── generateSitemap.js # 生成站点地图
│   ├── backupDB.js       # 数据库备份
│   └── seedDemo.js       # 演示数据填充
├── data/                 # 静态数据文件
│   ├── airports.json     # 机场数据
│   ├── airlines.json     # 航空公司数据
│   ├── countries.json    # 国家数据
│   └── cities.json       # 城市数据
├── api-server.js         # Express API服务器
├── next.config.mjs       # Next.js配置
├── tailwind.config.cjs   # TailwindCSS配置
├── postcss.config.cjs    # PostCSS配置
├── jsconfig.json         # JavaScript配置
├── .eslintrc.json        # ESLint配置
├── .prettierrc           # Prettier配置
├── package.json          # 项目依赖
├── docker-compose.yml    # Docker部署配置
├── Dockerfile            # Docker容器配置
├── .env                  # 环境变量
├── .env.local            # 本地环境变量
├── .env.production       # 生产环境变量
└── README.md             # 项目说明
```


    
    

### MongoDB安全配置

1. **认证与授权**

为保证数据库安全，项目使用了基于角色的访问控制（RBAC）：

```javascript
// 创建应用专用账户
db.createUser({
  user: "flightLogAppUser",
  pwd: "complex_password_here",
  roles: [
    { role: "readWrite", db: "flightLogDB" },
    { role: "dbAdmin", db: "flightLogDB" }
  ]
})

// 为监控工具创建只读账户
db.createUser({
  user: "monitorUser",
  pwd: "monitoring_password_here",
  roles: [
    { role: "read", db: "flightLogDB" },
    { role: "clusterMonitor", db: "admin" }
  ]
})
```

2. **网络安全**

```javascript
// mongodb.conf 配置
net:
  bindIp: 127.0.0.1  # 仅本地访问
  port: 27017
  ssl:
    mode: requireSSL
    PEMKeyFile: /path/to/ssl/cert.pem
```

3. **字段级加密**

对敏感数据实施字段级加密：

```javascript
// 创建数据库加密密钥
const clientEncryption = new ClientEncryption(mongoClient, {
  keyVaultNamespace: 'encryption.__keyVault',
  kmsProviders: {
    local: {
      key: localMasterKey // 由安全存储的主密钥
    }
  }
});

// 加密敏感用户数据
const encryptedPassportNumber = await clientEncryption.encrypt(
  passportNumber,
  {
    algorithm: 'AEAD_AES_256_CBC_HMAC_SHA_512-Deterministic',
    keyAltName: 'personalDataKey'
  }
);
```

### MongoDB集群部署

生产环境采用MongoDB副本集部署提高可用性：

1. **副本集配置**

```yaml
# docker-compose.yml 副本集配置
version: '3.8'

services:
  mongo1:
    image: mongo:5.0
    container_name: mongo1
    command: ["--replSet", "rs0", "--bind_ip_all"]
    ports:
      - "27017:27017"
    volumes:
      - mongo1_data:/data/db
    networks:
      - mongo_network
    restart: always

  mongo2:
    image: mongo:5.0
    container_name: mongo2
    command: ["--replSet", "rs0", "--bind_ip_all"]
    ports:
      - "27018:27017"
    volumes:
      - mongo2_data:/data/db
    networks:
      - mongo_network
    restart: always

  mongo3:
    image: mongo:5.0
    container_name: mongo3
    command: ["--replSet", "rs0", "--bind_ip_all"]
    ports:
      - "27019:27017"
    volumes:
      - mongo3_data:/data/db
    networks:
      - mongo_network
    restart: always

  mongo-express:
    image: mongo-express
    container_name: mongo-express
    environment:
      - ME_CONFIG_MONGODB_SERVER=mongo1
      - ME_CONFIG_MONGODB_PORT=27017
    ports:
      - "8081:8081"
    networks:
      - mongo_network
    depends_on:
      - mongo1
    restart: always

networks:
  mongo_network:
    driver: bridge

volumes:
  mongo1_data:
  mongo2_data:
  mongo3_data:
```

2. **初始化副本集**

```javascript
// 初始化副本集
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "mongo1:27017", priority: 2 },
    { _id: 1, host: "mongo2:27017", priority: 1 },
    { _id: 2, host: "mongo3:27017", priority: 1 }
  ]
});
```

3. **配置应用连接字符串**

```
MONGODB_URI=mongodb://username:password@mongo1:27017,mongo2:27017,mongo3:27017/flightLogDB?replicaSet=rs0&readPreference=primaryPreferred
```

### MongoDB性能监控与优化

1. **监控指标**

项目使用MongoDB Atlas监控和自定义Prometheus + Grafana监控以下关键指标：

- 查询执行时间
- 索引使用情况
- 连接池状态
- 内存使用率
- 慢查询分析
- 磁盘I/O负载

2. **性能优化**

```javascript
// 查询优化示例: 添加投影仅返回需要的字段
const flights = await Flight.find(
  { user: userId, year: selectedYear },
  { flightNumber: 1, airline: 1, departureTime: 1, arrivalTime: 1, _id: 1 }
).lean();

// 批量写入优化
const bulkOps = airportsData.map(airport => ({
  updateOne: {
    filter: { code: airport.code },
    update: { $set: airport },
    upsert: true
  }
}));

await Airport.bulkWrite(bulkOps, { ordered: false });
```

3. **索引优化示例**

```javascript
// 复合索引与部分索引结合
await Flight.collection.createIndex(
  { user: 1, departureTime: -1 },
  { 
    partialFilterExpression: { status: { $eq: "已完成" } },
    background: true,
    name: "user_completed_flights"
  }
);

// 当只查询已完成航班且按时间排序时能高效使用此索引
const completedFlights = await Flight.find(
  { user: userId, status: "已完成" }
).sort({ departureTime: -1 });
```

## 开发环境设置

### 环境要求

- Node.js >= 16.x
- MongoDB >= 5.0
- npm >= 8.x
- Git

### 安装步骤

1. **克隆项目**
```bash
git clone https://github.com/yourusername/flight-log-nextjs.git
cd flight-log-nextjs
```

2. **安装依赖**
```bash
npm install
```

3. **创建环境变量文件**
创建 `.env.local` 文件：
```
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/flightLogDB
MONGODB_TEST_URI=mongodb://localhost:27017/flightLogDB_test

# JWT配置
JWT_SECRET=your_secure_jwt_secret_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# 应用配置
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:5001
PORT=5001
NODE_ENV=development

# 文件上传
UPLOAD_PATH=./public/uploads
MAX_FILE_SIZE=5242880

# 邮件服务
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
FROM_EMAIL=noreply@flightlog.com
FROM_NAME=Flight Log

# 第三方API
MAPBOX_TOKEN=your_mapbox_token_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. **启动开发服务器**
```bash
# 终端1: 启动Next.js开发服务器
npm run dev

# 终端2: 启动API服务器
npm run api
```

5. **导入测试数据(可选)**
```bash
# 导入机场数据
npm run seed:airports

# 导入测试用户和演示数据
npm run seed:demo
```

6. **访问应用**
```
前端: http://localhost:3000
API: http://localhost:5001
API文档: http://localhost:5001/api-docs
```

## API接口文档

系统采用RESTful API设计，完整Swagger文档可通过`/api-docs`访问。以下是主要接口概览：

### 认证接口

| 方法 | 端点 | 描述 | 请求体示例 | 响应示例 |
|------|------|------|------------|----------|
| POST | `/api/auth/register` | 用户注册 | `{ "username": "test123", "email": "test@example.com", "password": "password123" }` | `{ "success": true, "token": "eyJhbG...", "user": {...} }` |
| POST | `/api/auth/login` | 用户登录 | `{ "email": "test@example.com", "password": "password123" }` | `{ "success": true, "token": "eyJhbG...", "user": {...} }` |
| GET | `/api/auth/verify` | 验证令牌 | - | `{ "success": true, "user": {...} }` |
| GET | `/api/auth/profile` | 获取用户资料 | - | `{ "success": true, "data": {...} }` |
| PUT | `/api/auth/profile` | 更新用户资料 | `{ "bio": "航空爱好者", "avatar": "file..." }` | `{ "success": true, "data": {...} }` |
| POST | `/api/auth/logout` | 用户登出 | - | `{ "success": true, "message": "已成功登出" }` |
| POST | `/api/auth/password/forgot` | 忘记密码 | `{ "email": "test@example.com" }` | `{ "success": true, "message": "重置邮件已发送" }` |
| PUT | `/api/auth/password/reset/:resetToken` | 重置密码 | `{ "password": "newpassword123" }` | `{ "success": true, "token": "eyJhbG..." }` |

### 飞行记录接口

| 方法 | 端点 | 描述 | 请求体/参数示例 | 响应示例 |
|------|------|------|-----------------|----------|
| GET | `/api/flights` | 获取用户所有航班 | 查询参数: `year=2023&airline=国航` | `{ "success": true, "count": 10, "data": [...] }` |
| GET | `/api/flights/stats` | 获取航班统计数据 | - | `{ "success": true, "data": { "totalFlights": 52, ... } }` |
| POST | `/api/flights` | 创建新航班记录 | `{ "flightNumber": "CA1234", ... }` | `{ "success": true, "data": {...} }` |
| GET | `/api/flights/:id` | 获取特定航班 | 路径参数: `id=60d21b4667d0d8992e610c85` | `{ "success": true, "data": {...} }` |
| PUT | `/api/flights/:id` | 更新航班信息 | `{ "status": "已完成", ... }` | `{ "success": true, "data": {...} }` |
| DELETE | `/api/flights/:id` | 删除航班记录 | - | `{ "success": true, "data": {} }` |
| GET | `/api/flights/airports/:code` | 获取关联航班 | 路径参数: `code=PEK` | `{ "success": true, "data": [...] }` |

### 日记接口

| 方法 | 端点 | 描述 | 请求体/参数示例 | 响应示例 |
|------|------|------|-----------------|----------|
| GET | `/api/journals` | 获取日记列表 | 查询参数: `page=1&limit=10&sort=-createdAt` | `{ "success": true, "count": 25, "pagination": {...}, "data": [...] }` |
| POST | `/api/journals` | 创建新日记 | `{ "title": "东京之行", "content": "...", ... }` | `{ "success": true, "data": {...} }` |
| GET | `/api/journals/:id` | 获取日记详情 | 路径参数: `id=60d21b4667d0d8992e610c85` | `{ "success": true, "data": {...} }` |
| PUT | `/api/journals/:id` | 更新日记 | `{ "title": "修改后的标题", ... }` | `{ "success": true, "data": {...} }` |
| DELETE | `/api/journals/:id` | 删除日记 | - | `{ "success": true, "data": {} }` |
| POST | `/api/journals/:id/like` | 点赞/取消点赞 | - | `{ "success": true, "liked": true, "likesCount": 15 }` |
| POST | `/api/journals/:id/comments` | 添加评论 | `{ "text": "精彩的游记!" }` | `{ "success": true, "data": {...} }` |
| DELETE | `/api/journals/:id/comments/:commentId` | 删除评论 | - | `{ "success": true, "data": {} }` |
| GET | `/api/journals/discover` | 发现推荐日记 | 查询参数: `tags=美食,风景&limit=10` | `{ "success": true, "data": [...] }` |

### 出行备忘接口

| 方法 | 端点 | 描述 | 请求体/参数示例 | 响应示例 |
|------|------|------|-----------------|----------|
| GET | `/api/memos` | 获取所有备忘 | 查询参数: `isCompleted=false` | `{ "success": true, "count": 8, "data": [...] }` |
| POST | `/api/memos` | 创建新备忘 | `{ "title": "办理签证", "dueDate": "2023-06-01" }` | `{ "success": true, "data": {...} }` |
| GET | `/api/memos/:id` | 获取单个备忘 | 路径参数: `id=60d21b4667d0d8992e610c85` | `{ "success": true, "data": {...} }` |
| PUT | `/api/memos/:id` | 更新备忘 | `{ "title": "更新后标题", ... }` | `{ "success": true, "data": {...} }` |
| PATCH | `/api/memos/:id` | 更新备忘状态 | `{ "isCompleted": true }` | `{ "success": true, "data": {...} }` |
| DELETE | `/api/memos/:id` | 删除备忘 | - | `{ "success": true, "data": {} }` |
| POST | `/api/memos/template/:templateId` | 从模板创建 | - | `{ "success": true, "data": [...] }` |

### 机场信息接口

| 方法 | 端点 | 描述 | 请求体/参数示例 | 响应示例 |
|------|------|------|-----------------|----------|
| GET | `/api/airports/search` | 搜索机场 | 查询参数: `q=北京&limit=5` | `{ "success": true, "count": 3, "data": [...] }` |
| GET | `/api/airports/:code` | 获取机场详情 | 路径参数: `code=PEK` | `{ "success": true, "data": {...} }` |
| GET | `/api/airports/nearby` | 查询附近机场 | 查询参数: `lat=39.9&lng=116.4&radius=100` | `{ "success": true, "count": 5, "data": [...] }` |

## 部署

### Docker部署

项目提供了完整的Docker部署配置，支持前后端分离或整体部署：

1. **使用docker-compose进行部署**

```bash
# 构建并启动容器
docker-compose up -d --build

# 查看日志
docker-compose logs -f
```

2. **独立构建与部署**

```bash
# 构建API服务器镜像
docker build -t flight-log-api -f Dockerfile.api .

# 构建Next.js前端镜像
docker build -t flight-log-frontend -f Dockerfile.frontend .

# 运行API服务器
docker run -d --name flight-log-api \
  -p 5001:5001 \
  -e MONGODB_URI=mongodb://mongo:27017/flightLogDB \
  -e JWT_SECRET=your_jwt_secret \
  -e NODE_ENV=production \
  --network flight-log-network \
  flight-log-api

# 运行Next.js前端
docker run -d --name flight-log-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api:5001 \
  --network flight-log-network \
  flight-log-frontend
```

### 云平台部署

1. **Vercel部署前端**

```bash
# 安装Vercel CLI
npm install -g vercel

# 部署到Vercel
vercel
```

2. **使用PM2部署API服务器**

```bash
# 安装PM2
npm install -g pm2

# 启动API服务器
pm2 start api-server.js --name "flight-log-api"

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup
```

3. **使用Nginx配置反向代理**

```nginx
# /etc/nginx/sites-available/flight-log.conf

# API服务器
server {
    listen 80;
    server_name api.flightlog.example.com;

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 前端服务器(如果不使用Vercel)
server {
    listen 80;
    server_name flightlog.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 系统扩展计划

### 近期计划功能

1. **多语言支持**：添加英语、日语、韩语等多语言界面
2. **离线支持**：实现PWA功能，支持离线访问和编辑
3. **行程规划**：整合航班、酒店、景点的综合行程规划功能
4. **AI行程助手**：基于用户偏好自动生成行程建议
5. **飞行积分管理**：各航空公司里程积分跟踪与优化建议

### 系统架构扩展

1. **微服务化**：将现有单体应用拆分为多个微服务
2. **GraphQL API**：添加GraphQL支持，优化数据获取
3. **实时通知**：集成WebSocket实现实时消息通知
4. **CDN集成**：静态资源CDN分发，提高访问速度
5. **数据分析平台**：构建用户行为分析和运营数据分析系统

## 贡献指南

我们欢迎社区开发者参与项目贡献，请遵循以下流程：

1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add: 实现某某功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

### 代码规范

- 遵循ESLint配置的代码风格
- 所有组件使用函数式组件和React Hooks
- 新增功能必须包含适当的单元测试
- 提交信息遵循[约定式提交](https://www.conventionalcommits.org/zh-hans/)规范

## 许可证

MIT 

## 联系与支持

- 项目维护者: example@flightlog.com
- 问题反馈: https://github.com/yourusername/flight-log-nextjs/issues
- 技术交流群: 123456789 
