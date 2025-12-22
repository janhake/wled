const express = require('express');
const { Bonjour } = require('bonjour-service');

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

// API endpoint
app.get('/api/devices', (req, res) => {
  res.json(devices);
});

// Web interface
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>WLED Discovery</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #fff;
      min-height: 100vh;
      padding: 20px;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      margin-bottom: 40px;
      padding: 20px;
    }
    h1 {
      font-size: 2.5rem;
      color: #4CAF50;
      margin-bottom: 10px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .subtitle {
      color: #aaa;
      font-size: 1rem;
    }
    .controls {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 30px;
    }
    button {
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.4);
    }
    button:active {
      transform: translateY(0);
    }
    .devices-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    .device {
      background: rgba(42, 42, 42, 0.6);
      backdrop-filter: blur(10px);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #4CAF50;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    }
    .device:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.4);
      border-left-color: #66BB6A;
    }
    .device h3 {
      color: #4CAF50;
      margin-bottom: 15px;
      font-size: 1.3rem;
    }
    .device-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .device-info-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .device-info-row strong {
      color: #aaa;
      min-width: 100px;
    }
    .device-info-row a {
      color: #4CAF50;
      text-decoration: none;
      transition: color 0.2s;
    }
    .device-info-row a:hover {
      color: #66BB6A;
      text-decoration: underline;
    }
    .empty {
      text-align: center;
      color: #888;
      font-style: italic;
      padding: 60px 20px;
      background: rgba(42, 42, 42, 0.3);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 20px;
    }
    .status {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #4CAF50;
      box-shadow: 0 0 10px #4CAF50;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .stats {
      text-align: center;
      margin-bottom: 20px;
      color: #aaa;
    }
    @media (max-width: 768px) {
      h1 { font-size: 2rem; }
      .devices-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔍 WLED Discovery</h1>
      <p class="subtitle">Automatische detectie van WLED devices op je netwerk</p>
    </header>

    <div class="controls">
      <button onclick="refresh()">🔄 Ververs</button>
    </div>

    <div class="stats">
      <span class="status"></span>
      <span id="device-count">Laden...</span>
    </div>

    <div class="devices-grid" id="devices"></div>
  </div>

  <script>
    async function refresh() {
      try {
        const response = await fetch('/api/devices');
        const devices = await response.json();
        
        document.getElementById('device-count').textContent = 
          devices.length === 0 ? 'Geen devices gevonden' :
          devices.length === 1 ? '1 device gevonden' :
          devices.length + ' devices gevonden';
        
        const html = devices.map(d => \`
          <div class="device">
            <h3>\${d.name}</h3>
            <div class="device-info">
              <div class="device-info-row">
                <strong>IP Adres:</strong>
                <a href="http://\${d.ip}" target="_blank">\${d.ip}</a>
              </div>
              <div class="device-info-row">
                <strong>Port:</strong>
                <span>\${d.port || 80}</span>
              </div>
              <div class="device-info-row">
                <strong>Host:</strong>
                <span>\${d.host || 'N/A'}</span>
              </div>
              <div class="device-info-row">
                <strong>Laatst gezien:</strong>
                <span>\${new Date(d.lastSeen).toLocaleString('nl-NL')}</span>
              </div>
            </div>
          </div>
        \`).join('');
        
        document.getElementById('devices').innerHTML = html || 
          '<div class="empty"><div class="empty-icon">📡</div><p>Geen WLED devices gevonden op je netwerk.</p><p style="margin-top: 10px; font-size: 0.9rem;">Zorg dat je WLED devices aan staan en op hetzelfde netwerk zitten.</p></div>';
      } catch (error) {
        console.error('Fout bij ophalen devices:', error);
        document.getElementById('devices').innerHTML = 
          '<div class="empty"><div class="empty-icon">⚠️</div><p>Fout bij laden van devices.</p></div>';
      }
    }
    
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>`);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WLED Discovery draait op http://0.0.0.0:${PORT}`);
  console.log(`📡 Scanning voor WLED devices...`);
});