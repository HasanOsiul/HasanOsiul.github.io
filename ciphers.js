// Simple: Caesar Cipher
function caesarEncrypt(text, shift = 3) {
  return text.replace(/[A-Za-z]/g, c => {
    const base = c < 'a' ? 65 : 97;
    return String.fromCharCode((c.charCodeAt(0) - base + shift) % 26 + base);
  });
}
function caesarDecrypt(text, shift = 3) {
  return caesarEncrypt(text, 26 - shift);
}

// Simple: Reverse Cipher
function reverseCipher(text) {
  return text.split('').reverse().join('');
}

// Intermediate: Vigenère Cipher
function vigenereEncrypt(text, key = 'KEY') {
  let out = '', ki = 0;
  for (let c of text) {
    if (/[A-Za-z]/.test(c)) {
      const base = c < 'a' ? 65 : 97;
      const shift = key.charCodeAt(ki % key.length) - base;
      out += String.fromCharCode((c.charCodeAt(0) - base + shift) % 26 + base);
      ki++;
    } else out += c;
  }
  return out;
}
function vigenereDecrypt(text, key = 'KEY') {
  const inv = key.split('').map(c => String.fromCharCode((26 - (c.toLowerCase().charCodeAt(0) - 97)) % 26 + 97)).join('');
  return vigenereEncrypt(text, inv);
}

// Intermediate: Playfair Cipher (simplified, uppercase, no J)
function playfairEncrypt(text, key = 'PLAYFAIREXAMPLE') {
  // Implementation placeholder: real implementation would go here
  return text; 
}
function playfairDecrypt(text, key = 'PLAYFAIREXAMPLE') {
  return text;
}

// Advanced: AES (using CryptoJS)
function aesEncrypt(text, pass = 'password') {
  return CryptoJS.AES.encrypt(text, pass).toString();
}
function aesDecrypt(cipher, pass = 'password') {
  const bytes = CryptoJS.AES.decrypt(cipher, pass);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Advanced: RSA (demo stub)
function rsaEncrypt(text) {
  return btoa(text); // base64 as placeholder
}
function rsaDecrypt(cipher) {
  return atob(cipher);
}