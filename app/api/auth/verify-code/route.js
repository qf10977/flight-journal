import User from "@/models/User.js";
import connectDB from "@/utils/connectDB.js";

export async function POST(request) {
  try {
    // 获取请求体数据
    const { email, code } = await request.json();
    
    if (!email || !code) {
      return Response.json(
        { error: "请提供邮箱和验证码" },
        { status: 400 }
      );
    }
    
    // 连接数据库
    await connectDB();
    
    // 查找用户
    const user = await User.findOne({ email });
    
    if (!user) {
      return Response.json(
        { error: "用户不存在" },
        { status: 404 }
      );
    }
    
    // 验证验证码
    const isValid = user.verifyCode(code);
    
    if (!isValid) {
      return Response.json(
        { error: "验证码无效或已过期" },
        { status: 400 }
      );
    }
    
    // 更新用户验证状态
    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();
    
    return Response.json(
      { 
        success: true, 
        message: "验证成功",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isVerified: true
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("验证码验证错误:", error);
    return Response.json(
      { error: "验证失败: " + error.message },
      { status: 500 }
    );
  }
} 