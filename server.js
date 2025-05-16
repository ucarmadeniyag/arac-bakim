const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Ana sayfa endpoint'i
app.get('/', (req, res) => {
  res.send('Uçar Madeni Yağ - Araç Bakım API');
});

// Örnek: araçların listesi endpoint'i
app.get('/araclar', (req, res) => {
  const araclar = [
    { id: 1, model: 'Ford Transit', sonBakim: '2025-04-10' },
    { id: 2, model: 'Renault Clio', sonBakim: '2025-03-22' },
  ];
  res.json(araclar);
});

// Sunucuyu başlat
app.listen(port, () => {
  console.log(`Sunucu çalışıyor, port: ${port}`);
});
