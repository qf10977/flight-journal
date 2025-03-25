import User from "@/models/User.js";
import connectDB from "@/utils/connectDB.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    // 连接数据库
    await connectDB();
    
    // 获取请求体数据
    const { email, password } = await request.json();
    console.log("登录请求 - 邮箱:", email);
    
    // 验证输入
    if (!email || !password) {
      return Response.json(
        { message: "请提供邮箱和密码" },
        { status: 400 }
      );
    }
    
    // 查找用户
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("用户不存在:", email);
      return Response.json(
        { message: "邮箱或密码错误" },
        { status: 401 }
      );
    }
    
    console.log("找到用户:", user.email);
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    console.log("密码验证结果:", isValid);
    
    if (!isValid) {
      console.log("密码不匹配:", email);
      return Response.json(
        { message: "邮箱或密码错误" },
        { status: 401 }
      );
    }
    
    // 生成 JWT token
    const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';
    
    console.log('登录使用的JWT_SECRET前缀:', JWT_SECRET.substring(0, 10) + '...');
    
    const token = jwt.sign(
      { 
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    console.log('生成的令牌前缀:', token.substring(0, 20) + '...');
    
    // 返回成功响应
    return Response.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
    
  } catch (error) {
    console.error("登录错误:", error);
    return Response.json(
      { message: "登录失败: " + error.message },
      { status: 500 }
    );
  }
} 