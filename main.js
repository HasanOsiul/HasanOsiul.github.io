// Helper: load input from textarea or file
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

// Helper: create a result block for an algorithm
function createResult(title, content) {
  const div = document.createElement('div');
  div.className = 'result-block';
  div.innerHTML = `
    <h3>${title}</h3>
    <textarea readonly>${content}</textarea><br>
    <button onclick="downloadResult('${title}', \`${content}\`)">Download</button>
  `;
  document.getElementById('results').appendChild(div);
}

// Helper: download a result as .txt
function downloadResult(name, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.txt`;
  a.click();
}

// ENCRYPT ALL: run all six algorithms
document.getElementById('encryptBtn').addEventListener('click', () => {
  const results = document.getElementById('results');
  results.innerHTML = ''; // clear previous results

  loadInput(text => {
    createResult('Caesar',   caesarEncrypt(text));
    createResult('Reverse',  reverseCipher(text));
    createResult('Vigenère', vigenereEncrypt(text));
    createResult('Playfair', playfairEncrypt(text));
    createResult('AES',      aesEncrypt(text));
    createResult('RSA',      rsaEncrypt(text));
  });
});

// DECRYPT ALL: run all six decryption routines
document.getElementById('decryptBtn').addEventListener('click', () => {
  const results = document.getElementById('results');
  results.innerHTML = ''; // clear previous results

  loadInput(text => {
    createResult('Caesar',   caesarDecrypt(text));
    createResult('Reverse',  reverseCipher(text));      // same function for reverse
    createResult('Vigenère', vigenereDecrypt(text));
    createResult('Playfair', playfairDecrypt(text));
    createResult('AES',      aesDecrypt(text));
    createResult('RSA',      rsaDecrypt(text));
  });
});
