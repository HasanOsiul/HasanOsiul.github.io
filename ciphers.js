// --- Simple Ciphers ---

// Caesar (shift = 3)
function caesarEncrypt(text, shift = 3) {
  return text.replace(/[A-Za-z]/g, c => {
    const base = c < 'a' ? 65 : 97;
    return String.fromCharCode((c.charCodeAt(0) - base + shift) % 26 + base);
  });
}
function caesarDecrypt(text, shift = 3) {
  return caesarEncrypt(text, 26 - shift);
}

// Reverse
function reverseCipher(text) {
  return text.split('').reverse().join('');
}

// --- Intermediate Ciphers ---

// Vigenère (default key = "KEY")
function vigenereEncrypt(text, key = 'KEY') {
  let result = '', ki = 0;
  for (const ch of text) {
    if (/[A-Za-z]/.test(ch)) {
      const base = ch < 'a' ? 65 : 97;
      const shift = key.charCodeAt(ki % key.length) - base;
      result += String.fromCharCode((ch.charCodeAt(0) - base + shift) % 26 + base);
      ki++;
    } else {
      result += ch;
    }
  }
  return result;
}
function vigenereDecrypt(text, key = 'KEY') {
  const invKey = key
    .split('')
    .map(c => String.fromCharCode((26 - (c.toLowerCase().charCodeAt(0) - 97)) % 26 + 97))
    .join('');
  return vigenereEncrypt(text, invKey);
}

// Playfair (stub – echoes input for now)
function playfairEncrypt(text, key = 'PLAYFAIREXAMPLE') {
  return text;
}
function playfairDecrypt(text, key = 'PLAYFAIREXAMPLE') {
  return text;
}

// --- Advanced Ciphers ---

// AES (via CryptoJS)
function aesEncrypt(text, pass = 'password') {
  return CryptoJS.AES.encrypt(text, pass).toString();
}
function aesDecrypt(cipher, pass = 'password') {
  const bytes = CryptoJS.AES.decrypt(cipher, pass);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// RSA (base64 stub)
function rsaEncrypt(text) {
  return btoa(text);
}
function rsaDecrypt(cipher) {
  return atob(cipher);
}
