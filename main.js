// Load file or textarea
function loadInput(callback) {
  const fileInput = document.getElementById('fileInput');
  if (fileInput.files.length) {
    const reader = new FileReader();
    reader.onload = e => callback(e.target.result);
    reader.readAsText(fileInput.files[0]);
  } else {
    callback(document.getElementById('textInput').value);
  }
}

// Display result block
function createResult(title, content) {
  const div = document.createElement('div');
  div.className = 'result-block';
  div.innerHTML = `<h3>${title}</h3><textarea readonly>${content}</textarea>
                   <br><button onclick="downloadResult('${title}', \`${content}\`)">Download</button>`;
  document.getElementById('results').appendChild(div);
}

// Download text as .txt
function downloadResult(name, text) {
  const a = document.createElement('a');
  const blob = new Blob([text], { type: 'text/plain' });
  a.href = URL.createObjectURL(blob);
  a.download = name + '.txt';
  a.click();
}

// Encrypt all
document.getElementById('encryptBtn').addEventListener('click', () => {
  document.getElementById('results').innerHTML = '';
  loadInput(text => {
    createResult('Caesar', caesarEncrypt(text));
    createResult('Reverse', reverseCipher(text));
    createResult('Vigenère', vigenereEncrypt(text));
    createResult('Playfair', playfairEncrypt(text));
    createResult('AES', aesEncrypt(text));
    createResult('RSA', rsaEncrypt(text));
  });
});

// Decrypt all
document.getElementById('decryptBtn').addEventListener('click', () => {
  document.getElementById('results').innerHTML = '';
  loadInput(text => {
    createResult('Caesar', caesarDecrypt(text));
    createResult('Reverse', reverseCipher(text));
    createResult('Vigenère', vigenereDecrypt(text));
    createResult('Playfair', playfairDecrypt(text));
    createResult('AES', aesDecrypt(text));
    createResult('RSA', rsaDecrypt(text));
  });
});