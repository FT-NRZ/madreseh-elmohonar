import bcrypt from 'bcryptjs';

// هش کردن رمز عبور
export async function hashPassword(password) {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Password hashing error:', error.message);
    throw new Error('خطا در رمزنگاری رمز عبور');
  }
}

export async function hashToken(token) {
  return await bcrypt.hash(token, 10);
}

// بررسی رمز عبور
export async function verifyPassword(password, hashedPassword) {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Password verification error:', error.message);
    return false;
  }
}

// تولید رمز عبور تصادفی
export function generateRandomPassword(length = 8) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// اعتبارسنجی کد ملی ایرانی
export function isValidNationalCode(nationalCode) {
  // بررسی طول و عددی بودن
  if (!/^\d{10}$/.test(nationalCode)) {
    return false;
  }

  // بررسی الگوریتم کد ملی ایرانی
  const check = parseInt(nationalCode[9]);
  const sum = nationalCode
    .slice(0, 9)
    .split('')
    .reduce((acc, digit, index) => acc + parseInt(digit) * (10 - index), 0);

  const remainder = sum % 11;
  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

// تولید کد دانش‌آموز
export function generateStudentNumber() {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${random}`;
}

// تولید کد معلم
export function generateTeacherCode() {
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `T${random}`;
}

export const DUMMY_PASSWORD_HASH = '$2a$12$w2w2w2w2w2w2w2w2w2w2wO2w2w2w2w2w2w2w2w2w2w2w2w2w2w2w2w2w2';