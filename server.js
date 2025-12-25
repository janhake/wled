const express = require('express');
const { Bonjour } = require('bonjour-service');
const path = require('path');

const app = express();
const bonjour = new Bonjour();
const PORT = process.env.PORT || 3000;

let devices = [];

// Zoek WLED devices
bonjour.find({ type: 'wled' }, (service) => {
  console.log('Device gevonden:', service.name);
  
  const device = {
    name: service.name,
    ip: service.referer?.address || service.addresses?.[0],
    port: service.port,
    host: service.host,
    lastSeen: new Date()
  };
  
  const index = devices.findIndex(d => d.name === device.name);
  if (index >= 0) {
    devices[index] = device;
  } else {
    devices.push(device);
  }
});

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint
app.get('/api/devices', (req, res) => {
  res.json(devices);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WLED Discovery draait op http://0.0.0.0:${PORT}`);
  console.log(`📡 Scanning voor WLED devices...`);
});