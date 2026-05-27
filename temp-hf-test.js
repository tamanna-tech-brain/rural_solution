const fs = require('fs');
const path = require('path');
const envFile = path.join('frontend', '.env');
const env = fs.readFileSync(envFile, 'utf8');
const keyLine = env.split(/\r?\n/).find((l) => l.startsWith('VITE_HF_API_KEY='));
const key = keyLine ? keyLine.split('=')[1].trim() : '';
if (!key) {
  console.error('No key found');
  process.exit(1);
}
(async () => {
  try {
    const res = await fetch('https://api-inference.huggingface.co/models/ai4bharat/indictrans2', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: ['Hello world'],
        parameters: {
          task: 'translation',
          source_language: 'eng',
          target_language: 'hin',
        },
      }),
    });
    console.log('ok', res.ok, 'status', res.status);
    const text = await res.text();
    console.log('body', text);
  } catch (e) {
    console.error('name', e.name);
    console.error('message', e.message);
    console.error(e.stack);
  }
})();
