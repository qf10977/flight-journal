import jwt from 'jsonwebtoken';
import User from '@/models/User.js';
import connectDB from '@/utils/connectDB.js';

export async function GET(request) {
  try {
    // 从请求头中获取 token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { success: false, message: '未提供授权令牌' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    // 验证 token
    const secretKey = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;
    
    if (!secretKey) {
      console.error('环境变量中缺少JWT_SECRET');
      return Response.json(
        { success: false, message: '服务器配置错误' },
        { status: 500 }
      );
    }
    
    try {
      // 验证并解码 token
      const decoded = jwt.verify(token, secretKey);
      
      // 连接数据库
      await connectDB();
      
      // 查找用户确认其存在
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return Response.json(
          { success: false, message: '用户不存在' },
          { status: 404 }
        );
      }
      
      // 返回成功响应和用户信息
      return Response.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified
        }
      });
      
    } catch (error) {
      console.error('Token验证错误:', error);
      
      if (error.name === 'TokenExpiredError') {
        return Response.json(
          { success: false, message: '授权令牌已过期' },
          { status: 401 }
        );
      }
      
      if (error.name === 'JsonWebTokenError') {
        return Response.json(
          { success: false, message: '无效的授权令牌' },
          { status: 401 }
        );
      }
      
      throw error;
    }
    
  } catch (error) {
    console.error('验证授权失败:', error);
    return Response.json(
      { success: false, message: '验证授权失败: ' + error.message },
      { status: 500 }
    );
  }
} 