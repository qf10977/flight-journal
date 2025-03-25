import { NextResponse } from 'next/server';
import connectDB from '../../../../../utils/connectDB';
import Journal from '../../../../../models/Journal';
import mongoose from 'mongoose';

// 获取日志图片
export async function GET(request, { params }) {
  try {
    const { imageId } = params;
    
    // 检查ID有效性
    if (!mongoose.isValidObjectId(imageId)) {
      return Response.redirect('https://via.placeholder.com/400x300?text=Invalid+Image+ID');
    }
    
    // 连接数据库
    await connectDB();
    
    // 查找包含指定图片ID的笔记
    const journal = await Journal.findOne(
      { 'images._id': imageId },
      { 'images.$': 1 }
    );
    
    // 如果找不到笔记或图片
    if (!journal || !journal.images || journal.images.length === 0) {
      return Response.redirect('https://via.placeholder.com/400x300?text=Image+Not+Found');
    }
    
    // 提取图片数据
    const image = journal.images[0];
    const imageBuffer = image.data;
    const contentType = image.contentType || 'image/jpeg';
    
    // 返回图片数据
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400' // 缓存24小时
      }
    });
    
  } catch (error) {
    console.error('获取图片失败:', error);
    // 出错时返回占位图片
    return Response.redirect('https://via.placeholder.com/400x300?text=Error+Loading+Image');
  }
} 