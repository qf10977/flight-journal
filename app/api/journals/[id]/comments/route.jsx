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

// 获取评论列表
export async function GET(request, { params }) {
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
    
    // 查询笔记
    const journal = await Journal.findById(id)
      .populate({
        path: 'comments.user',
        select: 'name avatar'
      })
      .select('comments')
      .lean();
      
    if (!journal) {
      return NextResponse.json({ 
        success: false, 
        message: '未找到该笔记' 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: journal.comments || []
    });
  } catch (error) {
    console.error('获取评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '获取评论失败: ' + error.message 
    }, { status: 500 });
  }
}

// 添加评论
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
    
    // 获取请求体
    const body = await request.json();
    
    if (!body.content) {
      return NextResponse.json({ 
        success: false, 
        message: '评论内容不能为空' 
      }, { status: 400 });
    }
    
    // 连接数据库
    await connectDB();
    
    // 查询笔记
    const journal = await Journal.findById(id);
    if (!journal) {
      return NextResponse.json({ 
        success: false, 
        message: '未找到该笔记' 
      }, { status: 404 });
    }
    
    // 创建新评论
    const newComment = {
      user: new mongoose.Types.ObjectId(user.id),
      content: body.content,
      createdAt: new Date()
    };
    
    // 添加评论到笔记
    journal.comments.push(newComment);
    
    // 保存更新
    await journal.save();
    
    // 获取带用户信息的最新评论
    const updatedJournal = await Journal.findById(id)
      .populate({
        path: 'comments.user',
        select: 'name avatar'
      })
      .select('comments')
      .lean();
      
    const addedComment = updatedJournal.comments[updatedJournal.comments.length - 1];
    
    return NextResponse.json({
      success: true,
      data: {
        comment: addedComment
      }
    }, { status: 201 });
  } catch (error) {
    console.error('添加评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '添加评论失败: ' + error.message 
    }, { status: 500 });
  }
} 