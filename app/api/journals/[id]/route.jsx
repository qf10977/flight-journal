import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '../../../../utils/connectDB';
import Journal from '../../../../models/Journal';
import mongoose from 'mongoose';

// 从环境变量中获取JWT密钥，确保使用与前端相同的密钥
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';

console.log('API Route使用的JWT_SECRET前缀:', JWT_SECRET.substring(0, 10) + '...');

// 验证用户身份
async function verifyAuthToken(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    console.log('收到的Authorization头:', request.headers.get('Authorization'));
    console.log('提取的令牌:', token ? `${token.substring(0, 15)}...` : '无令牌');
    
    if (!token) {
      console.error('未提供令牌');
      return null;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('解码的令牌信息:', decoded ? {...decoded, id: decoded.id.substring(0, 5) + '...'} : '解码失败');
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.avatar
      };
    } catch (jwtError) {
      console.error('JWT验证失败:', jwtError.message);
      // 尝试使用另一个可能的密钥
      try {
        // 使用备选密钥尝试验证
        const alternativeSecret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'your-secret-key';
        if (alternativeSecret !== JWT_SECRET) {
          console.log('尝试使用备选密钥验证');
          const decoded = jwt.verify(token, alternativeSecret);
          console.log('使用备选密钥解码成功');
          return {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name,
            avatar: decoded.avatar
          };
        }
      } catch (altError) {
        console.error('备选密钥验证也失败:', altError.message);
      }
      return null;
    }
  } catch (error) {
    console.error('令牌验证失败:', error);
    return null;
  }
}

// 获取单个日志详情
export async function GET(request, { params }) {
  try {
    const id = params.id;
    console.log('请求笔记ID:', id);
    
    // 检查ID有效性
    if (!mongoose.isValidObjectId(id)) {
      console.error('无效的ID格式:', id);
      return NextResponse.json({ 
        success: false, 
        message: '无效的ID格式' 
      }, { status: 400 });
    }
    
    // 验证用户身份
    const user = await verifyAuthToken(request);
    if (!user) {
      console.error('未授权访问 - 用户验证失败');
      return NextResponse.json({ 
        success: false, 
        message: '未授权访问，请重新登录' 
      }, { status: 401 });
    }
    
    try {
      // 连接数据库
      await connectDB();
      
      // 查询数据库获取指定ID的笔记
      const journal = await Journal.findById(id)
        .populate('user', 'name avatar') // 关联用户信息
        .populate('likes')
        .populate({
          path: 'comments',
          populate: {
            path: 'user',
            select: 'name avatar'
          }
        })
        .lean();
        
      if (!journal) {
        console.error('未找到笔记:', id);
        return NextResponse.json({ 
          success: false, 
          message: '未找到该笔记' 
        }, { status: 404 });
      }

      console.log('成功获取笔记数据');
      return NextResponse.json({ 
        success: true, 
        data: journal 
      });
    } catch (dbError) {
      console.error('数据库操作失败:', dbError);
      
      // 如果是开发环境且数据库连接失败，提供模拟数据
      if (process.env.NODE_ENV === 'development') {
        console.log('开发环境下提供模拟数据');
        // 构建模拟数据
        const mockJournal = {
          _id: id,
          title: '示例笔记标题',
          content: '这是一个示例笔记内容，由于数据库连接失败而显示的模拟数据。',
          location: '模拟位置',
          createdAt: new Date().toISOString(),
          user: {
            _id: user.id,
            name: user.name || '当前用户',
            avatar: user.avatar
          },
          images: [],
          likes: [],
          comments: []
        };
        
        return NextResponse.json({ 
          success: true, 
          data: mockJournal,
          _mock: true
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('获取笔记详情失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '获取笔记详情失败: ' + error.message 
    }, { status: 500 });
  }
}

// 更新日志
export async function PUT(request, { params }) {
  try {
    const id = params.id;
    
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
    
    // 查找要更新的笔记
    const journal = await Journal.findById(id);
    if (!journal) {
      return NextResponse.json({ 
        success: false, 
        message: '未找到该笔记' 
      }, { status: 404 });
    }
    
    // 验证是否为笔记的创建者
    if (journal.user.toString() !== user.id) {
      return NextResponse.json({ 
        success: false, 
        message: '您没有权限编辑此笔记' 
      }, { status: 403 });
    }
    
    // 获取更新数据
    const data = await request.json();
    const { title, content, location } = data;
    
    // 更新笔记内容
    journal.title = title || journal.title;
    journal.content = content || journal.content;
    journal.location = location || journal.location;
    
    // 保存更新后的笔记
    await journal.save();
    
    // 获取更新后的完整笔记数据
    const updatedJournal = await Journal.findById(id)
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
      message: '笔记更新成功',
      data: updatedJournal
    });
  } catch (error) {
    console.error('更新笔记失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '更新笔记失败: ' + error.message 
    }, { status: 500 });
  }
}

// 删除日志
export async function DELETE(request, { params }) {
  try {
    const id = params.id;
    
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
    
    // 查找要删除的笔记
    const journal = await Journal.findById(id);
    if (!journal) {
      return NextResponse.json({ 
        success: false, 
        message: '未找到该笔记' 
      }, { status: 404 });
    }
    
    // 验证是否为笔记的创建者
    if (journal.user.toString() !== user.id) {
      return NextResponse.json({ 
        success: false, 
        message: '您没有权限删除此笔记' 
      }, { status: 403 });
    }
    
    // 删除笔记
    await Journal.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      success: true, 
      message: '笔记删除成功' 
    });
  } catch (error) {
    console.error('删除笔记失败:', error);
    return NextResponse.json({ 
      success: false, 
      message: '删除笔记失败: ' + error.message
    }, { status: 500 });
  }
} 