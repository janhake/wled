async function refresh() {
    try {
      const response = await fetch('/api/devices');
      const devices = await response.json();
      
      // Update device count
      const countElement = document.getElementById('device-count');
      if (devices.length === 0) {
        countElement.textContent = 'Geen devices gevonden';
      } else if (devices.length === 1) {
        countElement.textContent = '1 device gevonden';
      } else {
        countElement.textContent = `${devices.length} devices gevonden`;
      }
      
      // Generate HTML for devices
      const devicesContainer = document.getElementById('devices');
      
      if (devices.length === 0) {
        devicesContainer.innerHTML = `
          <div class="empty">
            <div class="empty-icon">📡</div>
            <p>Geen WLED devices gevonden op je netwerk.</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">
              Zorg dat je WLED devices aan staan en op hetzelfde netwerk zitten.
            </p>
          </div>
        `;
        return;
      }
      
      const html = devices.map(device => `
        <div class="device">
          <h3>${escapeHtml(device.name)}</h3>
          <div class="device-info">
            <div class="device-info-row">
              <strong>IP Adres:</strong>
              <a href="http://${escapeHtml(device.ip)}" target="_blank">
                ${escapeHtml(device.ip)}
              </a>
            </div>
            <div class="device-info-row">
              <strong>Port:</strong>
              <span>${device.port || 80}</span>
            </div>
            <div class="device-info-row">
              <strong>Host:</strong>
              <span>${escapeHtml(device.host) || 'N/A'}</span>
            </div>
            <div class="device-info-row">
              <strong>Laatst gezien:</strong>
              <span>${new Date(device.lastSeen).toLocaleString('nl-NL')}</span>
            </div>
          </div>
        </div>
      `).join('');
      
      devicesContainer.innerHTML = html;
      
    } catch (error) {
      console.error('Fout bij ophalen devices:', error);
      document.getElementById('devices').innerHTML = `
        <div class="empty">
          <div class="empty-icon">⚠️</div>
          <p>Fout bij laden van devices.</p>
        </div>
      `;
    }
  }
  
  // Helper functie om XSS te voorkomen
  function escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
  }
  
  // Start met laden
  refresh();
  
  // Auto-refresh elke 5 seconden
  setInterval(refresh, 5000);