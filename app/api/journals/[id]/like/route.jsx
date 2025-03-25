import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../utils/connectDB';
import Journal from '../../../../../models/Journal';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 验证用户身份
async function verifyAuthToken(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
      avatar: decoded.avatar
    };
  } catch (error) {
    console.error('令牌验证失败:', error);
    return null;
  }
}

// 点赞/取消点赞
export async function POST(request, { params }) {
  try {
    const { id } = params;
    
    // 检查ID有效性
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ 
        success: false, 
        message: '无效的ID格式' 
      }, { status: 400 });
    }
    
    // 验证用户身份
    const user = await verifyAuthToken(request);
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: '未授权访问' 
      }, { status: 401 });
    }

    // 连接数据库
    await connectDB();
    
    // 查找笔记
    const journal = await Journal.findById(id);
    if (!journal) {
      return NextResponse.json({ 
        success: false, 
        message: '未找到该笔记' 
      }, { status: 404 });
    }
    
    const userId = user.id;
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // 检查用户是否已点赞
    const likeIndex = journal.likes.findIndex(like => 
      like.equals ? like.equals(userIdObj) : String(like) === userId
    );
    
    let isLiked = false;
    
    if (likeIndex > -1) {
      // 如果已点赞，则取消点赞
      journal.likes.splice(likeIndex, 1);
    } else {
      // 如果未点赞，则添加点赞
      journal.likes.push(userIdObj);
      isLiked = true;
    }
    
    // 保存更新
    await journal.save();
    
    return NextResponse.json({
      success: true,
      data: {
        isLiked,
        likes: journal.likes.length
      }
    });
  } catch (error) {
    console.error('点赞操作失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '点赞操作失败: ' + error.message
    }, { status: 500 });
  }
} 