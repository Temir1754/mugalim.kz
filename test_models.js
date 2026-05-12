const fs = require('fs');
let env = fs.readFileSync('.env', 'utf8');
let match = env.match(/GEMINI_API_KEY="?([^\s"\n]+)"?/);
let apiKey = match[1];
fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey)
  .then(res => res.json())
  .then(data => {
    data.models.forEach(m => console.log(m.name));
  });
