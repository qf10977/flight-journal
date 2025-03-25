import jwt from 'jsonwebtoken';

// 使用统一的JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';

// 打印使用的密钥前缀(仅开发环境)
if (process.env.NODE_ENV === 'development') {
  console.log('auth.js使用的JWT_SECRET前缀:', JWT_SECRET.substring(0, 10) + '...');
}

// 验证令牌
export async function verifyToken(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        avatar: decoded.avatar
      };
    } catch (jwtError) {
      console.error('JWT验证失败:', jwtError.message);
      return null;
    }
  } catch (error) {
    console.error('令牌验证失败:', error);
    return null;
  }
}

// 生成令牌
export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar
    },
    JWT_SECRET,
    { expiresIn: '100d' }
  );
}