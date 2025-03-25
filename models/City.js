import mongoose from 'mongoose'

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
    airports: [{
        type: String,
        required: true
    }],
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    }
})

// 添加索引以提高查询性能
citySchema.index({ airports: 1 })

const City = mongoose.models.City || mongoose.model('City', citySchema)

export default City 