import Flight from '../models/Flight.js'

// 获取用户的所有航班记录
export const getFlights = async (req, res) => {
  try {
    const flights = await Flight.find({ user: req.user.id })
      .sort({ departureTime: -1 })
      .populate('user', 'name email')
    
    res.json({
      success: true,
      count: flights.length,
      data: flights
    })
  } catch (error) {
    console.error('获取航班记录失败:', error)
    res.status(500).json({
      success: false,
      message: '获取航班记录失败'
    })
  }
}

// 获取单个航班记录
export const getFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
      .populate('user', 'name email')
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: '未找到航班记录'
      })
    }
    
    // 检查是否是当前用户的航班记录
    if (flight.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权访问此航班记录'
      })
    }
    
    res.json({
      success: true,
      data: flight
    })
  } catch (error) {
    console.error('获取航班记录失败:', error)
    res.status(500).json({
      success: false,
      message: '获取航班记录失败'
    })
  }
}

// 创建航班记录
export const createFlight = async (req, res) => {
  try {
    const newFlight = new Flight({
      ...req.body,
      user: req.user.id
    })
    
    await newFlight.save()
    
    res.status(201).json({
      success: true,
      data: newFlight
    })
  } catch (error) {
    console.error('创建航班记录失败:', error)
    res.status(500).json({
      success: false,
      message: '创建航班记录失败'
    })
  }
}

// 更新航班记录
export const updateFlight = async (req, res) => {
  try {
    let flight = await Flight.findById(req.params.id)
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: '未找到航班记录'
      })
    }
    
    // 检查是否是当前用户的航班记录
    if (flight.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权更新此航班记录'
      })
    }
    
    flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    res.json({
      success: true,
      data: flight
    })
  } catch (error) {
    console.error('更新航班记录失败:', error)
    res.status(500).json({
      success: false,
      message: '更新航班记录失败'
    })
  }
}

// 删除航班记录
export const deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id)
    
    if (!flight) {
      return res.status(404).json({
        success: false,
        message: '未找到航班记录'
      })
    }
    
    // 检查是否是当前用户的航班记录
    if (flight.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '无权删除此航班记录'
      })
    }
    
    await flight.deleteOne()
    
    res.json({
      success: true,
      data: {}
    })
  } catch (error) {
    console.error('删除航班记录失败:', error)
    res.status(500).json({
      success: false,
      message: '删除航班记录失败'
    })
  }
} 