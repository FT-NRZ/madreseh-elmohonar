import jwt from 'jsonwebtoken';
export const runtime = 'nodejs';

// یکسان‌سازی secret با لاگین
const JWT_SECRET = (process.env.JWT_SECRET?.trim?.() || 'dev-secret');

// ایجاد JWT Token
export function verifyJWT(token, options = {}) {
  try {
    if (!token) return null;
    // استفاده از secret واحد + الگوریتم مشخص
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'], ...options });
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

export function signJWT(payload, options = {}) {
  try {
    return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d', ...options });
  } catch (error) {
    console.error('JWT signing error:', error.message);
    return null;
  }
}

// استخراج اطلاعات از token
export function decodeJWT(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
}