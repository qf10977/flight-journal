import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import User from "@/models/User.js"
import bcrypt from "bcryptjs"
import connectDB from "@/utils/connectDB.js"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // 确保数据库连接
          await connectDB();
          console.log("登录尝试 - 邮箱:", credentials.email);
          
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            console.log("用户不存在:", credentials.email);
            throw new Error("邮箱或密码错误");
          }
          
          console.log("找到用户:", user.email);
          
          // 使用模型的方法比较密码
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("密码验证结果:", isValid);
          
          if (!isValid) {
            console.log("密码不匹配");
            throw new Error("邮箱或密码错误");
          }
          
          console.log("登录成功:", user.email);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          };
        } catch (error) {
          console.error("认证错误:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 