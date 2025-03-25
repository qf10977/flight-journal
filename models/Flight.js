import mongoose from 'mongoose'

const flightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  flightNumber: {
    type: String,
    required: true,
    default: function() {
      return 'FL' + Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    }
  },
  departureCity: {
    type: String,
    required: [true, '请输入出发城市']
  },
  arrivalCity: {
    type: String,
    required: [true, '请输入到达城市']
  },
  departureAirport: {
    type: String,
    required: [true, '请输入出发机场']
  },
  arrivalAirport: {
    type: String,
    required: [true, '请输入到达机场']
  },
  departureLongitude: {
    type: Number,
    required: [true, '请提供出发地经度']
  },
  departureLatitude: {
    type: Number,
    required: [true, '请提供出发地纬度']
  },
  arrivalLongitude: {
    type: Number,
    required: [true, '请提供到达地经度']
  },
  arrivalLatitude: {
    type: Number,
    required: [true, '请提供到达地纬度']
  },
  date: {
    type: Date,
    required: [true, '请输入航班日期']
  },
  airline: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'departed', 'arrived', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
})

// 添加索引
flightSchema.index({ user: 1, date: -1 })
flightSchema.index({ flightNumber: 1 })

// 虚拟属性：坐标对象
flightSchema.virtual('departureCoords').get(function() {
  return {
    longitude: this.departureLongitude,
    latitude: this.departureLatitude
  }
})

flightSchema.virtual('arrivalCoords').get(function() {
  return {
    longitude: this.arrivalLongitude,
    latitude: this.arrivalLatitude
  }
})

// 添加虚拟字段
flightSchema.virtual('duration').get(function() {
  if (this.departureTime && this.arrivalTime) {
    return (this.arrivalTime - this.departureTime) / (1000 * 60) // 返回分钟数
  }
  return null
})

// 确保虚拟字段在 JSON 中可见
flightSchema.set('toJSON', { virtuals: true })
flightSchema.set('toObject', { virtuals: true })

// 添加预处理中间件
flightSchema.pre('save', function(next) {
  // 确保出发时间早于到达时间
  if (this.departureTime && this.arrivalTime && this.departureTime > this.arrivalTime) {
    next(new Error('出发时间不能晚于到达时间'))
  }
  next()
})

// 添加实例方法
flightSchema.methods.isDelayed = function() {
  return this.status === 'delayed'
}

// 添加静态方法
flightSchema.statics.findByAirline = function(airline) {
  return this.find({ airline: airline })
}

const Flight = mongoose.models.Flight || mongoose.model('Flight', flightSchema)

export default Flight 