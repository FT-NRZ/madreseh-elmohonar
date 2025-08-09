import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-madreseh-elmohonar-2024';

// ایجاد JWT Token
export function signJWT(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// بررسی JWT Token
export function verifyJWT(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('JWT verification failed:', error);
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