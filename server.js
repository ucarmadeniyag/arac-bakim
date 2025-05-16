const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_PATH = './bakimlar.json';

function toJson() {
  try {
    const data = fs.readFileSync(DATA_PATH);
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function toSave(json) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(json, null, 2));
}

app.get('/bakim/:plaka', (req, res) => {
  const plaka = req.params.plaka.toUpperCase();
  const data = toJson();
  res.json(data[plaka] || []);
});

app.post('/bakim', (req, res) => {
  const { plaka, tarih, islem } = req.body;
  if (!plaka || !tarih || !islem) {
    return res.status(400).json({ error: 'Eksik bilgi' });
  }

  const data = toJson();
  const plakaKey = plaka.toUpperCase();
  if (!data[plakaKey]) data[plakaKey] = [];

  data[plakaKey].push({ tarih, islem });
  toSave(data);

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Sunucu çalışıyor http://localhost:${PORT}`);
});
