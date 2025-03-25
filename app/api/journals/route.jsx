import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../utils/connectDB';
import Journal from '../../../models/Journal';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 适配Next.js App Router的验证函数
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

// 处理GET请求 - 获取所有笔记
export async function GET(request) {
  try {
    // 连接数据库
    await connectDB();
    
    // 从数据库获取所有笔记，按创建时间倒序排列，并关联用户信息
    const journals = await Journal.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'name avatar')
      .populate('likes')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      })
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: journals 
    });
  } catch (error) {
    console.error('获取笔记失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '获取笔记失败: ' + error.message 
    }, { status: 500 });
  }
}

// 处理POST请求 - 创建新笔记
export async function POST(request) {
  try {
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

    // 使用FormData处理表单数据和文件上传
    const formData = await request.formData();
    
    const title = formData.get('title');
    const content = formData.get('content');
    const location = formData.get('location');
    
    // 验证必要字段
    if (!title || !content || !location) {
      return NextResponse.json({ 
        success: false, 
        message: '缺少必要字段' 
      }, { status: 400 });
    }

    // 处理图片文件
    const images = [];
    const imageFiles = formData.getAll('images');
    
    for (const file of imageFiles) {
      if (file instanceof File) {
        // 读取文件内容
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // 保存图片信息
        images.push({
          data: buffer,
          contentType: file.type
        });
      }
    }

    // 创建新笔记对象
    const newJournal = new Journal({
      title,
      content,
      location,
      user: user.id, // 使用验证的用户ID
      images,
      likes: [],
      comments: []
    });

    // 保存到数据库
    await newJournal.save();

    // 返回创建的笔记数据
    const savedJournal = await Journal.findById(newJournal._id)
      .populate('user', 'name avatar')
      .lean();

    return NextResponse.json({ 
      success: true, 
      data: savedJournal 
    }, { status: 201 });
  } catch (error) {
    console.error('创建笔记失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '创建笔记失败: ' + error.message
    }, { status: 500 });
  }
} 