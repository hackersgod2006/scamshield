const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');

dotenv.config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const text = req.body.text || 'No message provided';

    if (req.file) fs.unlinkSync(req.file.path);

    const result = await model.generateContent(`You are ScamShield. Analyze this for scams: ${text}

Reply ONLY in this JSON format:
{"verdict":"SCAM","score":95,"summary":"Short human explanation","red_flags":["flag1","flag2"],"what_to_do":"What to do now"}`);

    const raw = result.response.text();
    const clean = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json({ success: true, result: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log('ScamShield running on port process.env.PORT || 3000'));
