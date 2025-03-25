import { NextResponse } from 'next/server';

// 获取所有备忘录
export async function GET(request) {
  try {
    // 在实际应用中，这里应该从数据库获取数据
    // 这里我们模拟一个响应
    return NextResponse.json({
      success: true,
      data: {
        memos: []
      }
    });
  } catch (error) {
    console.error('获取备忘录失败:', error);
    return NextResponse.json(
      { success: false, message: '获取备忘录失败' },
      { status: 500 }
    );
  }
}

// 创建新备忘录
export async function POST(request) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    if (!body.content || !body.planId) {
      return NextResponse.json(
        { success: false, message: '缺少必要参数' },
        { status: 400 }
      );
    }
    
    // 在实际应用中，这里应该将数据保存到数据库
    // 这里我们模拟一个成功响应
    const newMemo = {
      id: Date.now(),
      content: body.content,
      planId: body.planId,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      data: {
        memo: newMemo
      }
    });
  } catch (error) {
    console.error('创建备忘录失败:', error);
    return NextResponse.json(
      { success: false, message: '创建备忘录失败' },
      { status: 500 }
    );
  }
}

// 更新备忘录
export async function PUT(request) {
  try {
    const body = await request.json();
    
    // 验证请求数据
    if (!body.id) {
      return NextResponse.json(
        { success: false, message: '缺少备忘录ID' },
        { status: 400 }
      );
    }
    
    // 在实际应用中，这里应该更新数据库中的数据
    // 这里我们模拟一个成功响应
    return NextResponse.json({
      success: true,
      data: {
        memo: {
          ...body,
          updatedAt: new Date().toISOString()
        }
      }
    });
  } catch (error) {
    console.error('更新备忘录失败:', error);
    return NextResponse.json(
      { success: false, message: '更新备忘录失败' },
      { status: 500 }
    );
  }
}

// 删除备忘录
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: '缺少备忘录ID' },
        { status: 400 }
      );
    }
    
    // 在实际应用中，这里应该从数据库删除数据
    // 这里我们模拟一个成功响应
    return NextResponse.json({
      success: true,
      message: '备忘录删除成功'
    });
  } catch (error) {
    console.error('删除备忘录失败:', error);
    return NextResponse.json(
      { success: false, message: '删除备忘录失败' },
      { status: 500 }
    );
  }
}