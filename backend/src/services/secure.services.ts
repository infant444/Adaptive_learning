import crypto from "crypto";

interface PasswordOptions {
  length?: number;
  lowercase?: boolean;
  numbers?: boolean;
}

export function generateOTP({
  length = 6,
  lowercase = true,
  numbers = true,
}: PasswordOptions = {}): string {
  let charset = "";

  if (lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
  if (numbers) charset += "0123456789";

  if (!charset) {
    throw new Error("At least one character type must be enabled");
  }

  const randomBytes = crypto.randomBytes(length);
  let otp= "";

  for (let i = 0; i < length; i++) {
    otp+= charset[randomBytes[i] % charset.length];
  }

  return otp;
}
