import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import User from "@/models/User.js"
import connectDB from "@/utils/connectDB.js"

export async function POST(req) {
  try {
    await connectDB()
    const { name, email, password } = await req.json()
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    })

    return NextResponse.json({
      message: "用户创建成功",
      user: { id: user._id.toString(), name: user.name, email: user.email },
    })
  } catch (error) {
    return NextResponse.json({ message: "用户创建失败" }, { status: 500 })
  }
} 