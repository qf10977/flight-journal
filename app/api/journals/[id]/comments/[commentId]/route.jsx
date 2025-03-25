import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../../../utils/connectDB';
import Journal from '../../../../../../models/Journal';
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

// 删除评论
export async function DELETE(request, { params }) {
  try {
    const { id, commentId } = params;
    
    // 检查ID有效性
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(commentId)) {
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
    
    // 查找评论
    const comment = journal.comments.id(commentId);
    if (!comment) {
      return NextResponse.json({ 
        success: false, 
        message: '未找到该评论' 
      }, { status: 404 });
    }
    
    // 验证是否为评论作者或笔记作者
    const userId = user.id;
    const isCommentOwner = comment.user.toString() === userId;
    const isJournalOwner = journal.user.toString() === userId;
    
    if (!isCommentOwner && !isJournalOwner) {
      return NextResponse.json({ 
        success: false, 
        message: '您没有权限删除此评论' 
      }, { status: 403 });
    }
    
    // 删除评论
    journal.comments.pull(commentId);
    
    // 保存更新
    await journal.save();
    
    return NextResponse.json({
      success: true,
      message: '评论删除成功'
    });
  } catch (error) {
    console.error('删除评论失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '删除评论失败: ' + error.message
    }, { status: 500 });
  }
} 