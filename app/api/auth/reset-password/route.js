import User from "@/models/User.js";
import connectDB from "@/utils/connectDB.js";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    // 连接数据库
    await connectDB();
    
    // 获取请求体数据
    const { email, newPassword } = await request.json();
    console.log("重置密码 - 邮箱:", email);
    
    if (!email || !newPassword) {
      return Response.json(
        { error: "请提供邮箱和新密码" },
        { status: 400 }
      );
    }
    
    // 查找用户
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log("用户不存在:", email);
      return Response.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    console.log("找到用户:", user.email);
    console.log("当前密码哈希:", user.password);
    
    // 直接生成盐和哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    console.log("新密码哈希:", hashedPassword);
    
    // 直接更新密码（绕过模型中间件）
    await User.updateOne(
      { _id: user._id },
      { password: hashedPassword }
    );
    
    // 确认密码已更新
    const updatedUser = await User.findOne({ email });
    console.log("更新后的密码哈希:", updatedUser.password);
    
    return Response.json(
      { 
        success: true, 
        message: "密码已重置",
        debug: {
          oldHash: user.password,
          newHash: updatedUser.password
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("重置密码错误:", error);
    return Response.json(
      { error: "重置密码失败: " + error.message },
      { status: 500 }
    );
  }
} 