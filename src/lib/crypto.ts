// src/lib/crypto.ts
import CryptoJS from "crypto-js";

// src/lib/crypto.ts
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
if (!SECRET_KEY) {
  throw new Error("Missing VITE_SECRET_KEY in environment");
}



export function encryptObject(obj: unknown): string {
  const text = JSON.stringify(obj);
  
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv });
  // iv + ciphertext em base64
  return iv.toString(CryptoJS.enc.Base64) + ":" + encrypted.toString();
}

export function decryptObject<T>(cipher: string): T {
  const [ivB64, cipherB64] = cipher.split(":");
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv = CryptoJS.enc.Base64.parse(ivB64);
  const decrypted = CryptoJS.AES.decrypt(cipherB64, key, { iv });
  const text = decrypted.toString(CryptoJS.enc.Utf8);
  return JSON.parse(text) as T;
}
