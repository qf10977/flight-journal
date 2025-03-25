import User from "@/models/User.js";
import connectDB from "@/utils/connectDB.js";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    // 验证输入
    if (!name || !email || !password) {
      return Response.json(
        { error: "请提供所有必填字段" },
        { status: 400 }
      );
    }
    
    // 连接数据库
    await connectDB();
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json(
        { error: "该邮箱已被注册" },
        { status: 409 }
      );
    }
    
    // 创建新用户
    const newUser = new User({
      name,
      email,
      password, // 密码会在保存前通过pre-save钩子自动加密
      isVerified: false
    });
    
    await newUser.save();
    
    // 返回成功响应（不包含密码）
    return Response.json(
      { 
        success: true, 
        message: "注册成功，请登录",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email
        }
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error("注册错误:", error);
    return Response.json(
      { error: "注册失败: " + error.message },
      { status: 500 }
    );
  }
} 