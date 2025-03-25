import { NextResponse } from 'next/server';
import { verifyJwtToken } from '../../../middlewares/auth-middleware';
import db from '../../../utils/db';
import mongoose from 'mongoose';

// 获取用户统计数据
export async function GET(request) {
  try {
    // 验证用户token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: '未授权访问' }, { status: 401 });
    }

    const decoded = await verifyJwtToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: '无效的token' }, { status: 401 });
    }

    // 确保userId是有效的ObjectId
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(decoded.userId);
    } catch (error) {
      console.error('无效的用户ID格式:', error);
      return NextResponse.json({ success: false, message: '无效的用户ID' }, { status: 400 });
    }

    // 确保数据库连接
    await db.connectToDB();

    // 从数据库获取各类数据的数量
    const flightsCount = await db.flight.count({ userId });

    const journalsCount = await db.journal.count({ userId });

    const plansCount = await db.travelPlan.count({ userId });

    return NextResponse.json({
      success: true,
      stats: {
        flights: flightsCount,
        journals: journalsCount,
        plans: plansCount
      }
    });
  } catch (error) {
    console.error('获取用户统计数据出错:', error);
    return NextResponse.json(
      { success: false, message: '获取统计数据失败: ' + error.message },
      { status: 500 }
    );
  }
} 