import User from "@/models/User.js";
import connectDB from "@/utils/connectDB.js";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

export async function POST(req) {
  console.log("开始处理发送验证码请求");
  try {
    // 连接数据库
    await connectDB();
    console.log("数据库连接成功");
    console.log("数据库连接状态:", mongoose.connection.readyState);

    // 获取请求体中的邮箱
    const { email, name, password, isRegister = false } = await req.json();
    console.log("接收到的邮箱:", email);
    console.log("是否注册流程:", isRegister);

    if (!email) {
      return Response.json(
        { error: "请提供邮箱地址" },
        { status: 400 }
      );
    }

    // 查找用户
    console.log("开始查找用户");
    let user = await User.findOne({ email });
    console.log("查找结果:", user ? "找到用户" : "未找到用户");

    // 如果是注册流程，且用户不存在，则创建新用户
    if (isRegister && !user) {
      if (!name || !password) {
        return Response.json(
          { error: "注册需要提供姓名和密码" },
          { status: 400 }
        );
      }

      console.log("创建新用户:", name, email);
      user = new User({
        name,
        email,
        password,
        isVerified: false
      });
      
      await user.save();
      console.log("新用户创建成功");
    } else if (!user) {
      console.log("用户不存在");
      return Response.json(
        { error: "用户不存在，请先注册" },
        { status: 404 }
      );
    }

    // 生成6位数验证码
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("生成的验证码:", verificationCode);

    // 设置验证码有效期（30分钟）
    const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000);

    // 更新用户验证码信息
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();
    console.log("验证码已保存到用户记录");

    // 创建邮件传输器
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    console.log("邮件配置:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER
    });

    // 发送邮件
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "您的验证码",
      text: `您的验证码是 ${verificationCode}，30分钟内有效。`,
      html: `<p>您的验证码是 <strong>${verificationCode}</strong>，30分钟内有效。</p>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("验证码邮件已发送:", info.response);

    return Response.json(
      { 
        success: true, 
        message: isRegister ? "注册成功，验证码已发送到您的邮箱" : "验证码已发送到您的邮箱",
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          isVerified: user.isVerified
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("发送验证码错误:", error);
    return Response.json(
      { error: "发送验证码失败: " + error.message },
      { status: 500 }
    );
  }
}

