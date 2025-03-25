import jwt from 'jsonwebtoken';

// 使用统一的JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'your-secret-key';

/**
 * 验证JWT令牌并返回解码后的数据
 * @param {string} token JWT令牌
 * @returns {Promise<object|null>} 解码后的数据，验证失败则返回null
 */
export async function verifyJwtToken(token) {
  if (!token) {
    console.log('未提供令牌');
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return {
      userId: decoded.id,
      email: decoded.email,
      name: decoded.name
    };
  } catch (error) {
    console.error('JWT验证失败:', error.message);
    return null;
  }
}

/**
 * 从请求头中获取并验证JWT令牌
 * @param {Request} request Next.js请求对象
 * @returns {Promise<object|null>} 解码后的用户数据，验证失败则返回null
 */
export async function getAuthUser(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  return await verifyJwtToken(token);
}

// 导出其他可能需要的认证相关函数
export function generateJwtToken(user) {
  return jwt.sign(
    {
      id: user.id || user._id,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
} 