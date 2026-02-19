import jwt from 'jsonwebtoken';
export const runtime = 'nodejs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key-madreseh-elmohonar-2024';

// ایجاد JWT Token
export function verifyJWT(token) {
  try {
    if (!token) return null;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return null;
  }
}

export function signJWT(payload) {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
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