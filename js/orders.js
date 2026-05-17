  function goBack() {
    window.history.back();
  }

  function formatRupiah(n) {
    return 'Rp ' + (n || 0).toLocaleString('id-ID');
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  let currentStatus = 'semua';
  let semuaPesanan = [];

  function loadOrders() {
    // Ambil dari localStorage
    semuaPesanan = JSON.parse(localStorage.getItem('groceer_pesanan') || '[]');
    
    // Cek apakah ada filter dari sessionStorage (dari dashboard)
    const filterStatus = sessionStorage.getItem('groceer_filter_status');
    if (filterStatus) {
      currentStatus = filterStatus;
      sessionStorage.removeItem('groceer_filter_status');
      sessionStorage.removeItem('groceer_filter_pesanan');
    }
    
    renderTabs();
    renderOrders();
  }

  function renderTabs() {
    const counts = {
      'semua': semuaPesanan.length,
      'Menunggu Pembayaran': semuaPesanan.filter(p => p.status === 'Menunggu Pembayaran').length,
      'Diproses': semuaPesanan.filter(p => p.status === 'Diproses').length,
      'Dikirim': semuaPesanan.filter(p => p.status === 'Dikirim').length,
      'Selesai': semuaPesanan.filter(p => p.status === 'Selesai').length,
      'Dibatalkan': semuaPesanan.filter(p => p.status === 'Dibatalkan').length
    };

    const tabs = [
      { id: 'semua', label: 'Semua', icon: '📋' },
      { id: 'Menunggu Pembayaran', label: 'Menunggu', icon: '⏳' },
      { id: 'Diproses', label: 'Diproses', icon: '⚙️' },
      { id: 'Dikirim', label: 'Dikirim', icon: '🚚' },
      { id: 'Selesai', label: 'Selesai', icon: '✅' },
      { id: 'Dibatalkan', label: 'Dibatalkan', icon: '❌' }
    ];

    const container = document.getElementById('statusTabs');
    container.innerHTML = tabs.map(tab => `
      <div class="tab-item ${currentStatus === tab.id ? 'active' : ''}" 
           onclick="setStatus('${tab.id}')">
        ${tab.icon} ${tab.label}
        <span class="count">${counts[tab.id] || 0}</span>
      </div>
    `).join('');
  }

  function setStatus(status) {
    currentStatus = status;
    renderTabs();
    renderOrders();
  }

  function getStatusClass(status) {
    switch(status) {
      case 'Menunggu Pembayaran': return 'status-menunggu';
      case 'Diproses': return 'status-diproses';
      case 'Dikirim': return 'status-dikirim';
      case 'Selesai': return 'status-selesai';
      case 'Dibatalkan': return 'status-dibatalkan';
      default: return '';
    }
  }

  function renderOrders() {
    const container = document.getElementById('ordersContainer');
    let filtered = semuaPesanan;
    
    if (currentStatus !== 'semua') {
      filtered = semuaPesanan.filter(p => p.status === currentStatus);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>Tidak ada pesanan dengan status ini</p>
        </div>`;
      return;
    }

    container.innerHTML = filtered.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div>
            <div class="order-id">${order.id}</div>
            <div class="order-date">${order.tanggal || '-'}</div>
          </div>
          <div class="order-status ${getStatusClass(order.status)}">${order.status}</div>
        </div>
        
        <div class="order-items">
          ${(order.items || []).map(item => `
            <div class="order-item">
              <div class="item-img">
                <i class="fas fa-box"></i>
              </div>
              <div class="item-details">
                <div class="item-name">${item.nama || 'Produk'}</div>
                <div class="item-qty">Jumlah: ${item.qty || 0} pcs</div>
                <div class="item-price">${formatRupiah((item.harga || 0) * (item.qty || 0))}</div>
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            Total: <span>${formatRupiah(order.total || 0)}</span>
          </div>
          <button class="btn-detail" onclick="detailOrder('${order.id}')">
            <i class="fas fa-info-circle"></i> Detail
          </button>
        </div>
      </div>
    `).join('');
  }

  function detailOrder(orderId) {
    const order = semuaPesanan.find(p => p.id === orderId);
    if (order) {
      let pesan = `🛒 DETAIL PESANAN\n━━━━━━━━━━━━━━━━━━\n`;
      pesan += `No. Pesanan: ${order.id}\n`;
      pesan += `Tanggal: ${order.tanggal}\n`;
      pesan += `Status: ${order.status}\n`;
      pesan += `━━━━━━━━━━━━━━━━━━\n`;
      pesan += `📦 PRODUK:\n`;
      (order.items || []).forEach(item => {
        pesan += `• ${item.nama} x${item.qty} = ${formatRupiah((item.harga || 0) * (item.qty || 0))}\n`;
      });
      pesan += `━━━━━━━━━━━━━━━━━━\n`;
      pesan += `💰 TOTAL: ${formatRupiah(order.total)}\n`;
      if (order.alamat) pesan += `📍 Alamat: ${order.alamat}\n`;
      if (order.metodePembayaran) pesan += `💳 Metode: ${order.metodePembayaran}`;
      
      alert(pesan);
    }
  }

  // Data demo jika kosong
  function seedDemoOrders() {
    const existing = localStorage.getItem('groceer_pesanan');
    if (!existing || JSON.parse(existing).length === 0) {
      const demoOrders = [
        {
          id: 'ORD-12345678',
          items: [{ id: 1, nama: 'Beras 5kg', harga: 70000, qty: 10 }],
          total: 700000,
          diskon: 0,
          status: 'Menunggu Pembayaran',
          tanggal: new Date().toLocaleDateString('id-ID'),
          pembeli: 'Alfia Rahma',
          alamat: 'Jl. Mawar No. 123, Jakarta',
          metodePembayaran: 'Transfer Bank',
          noResi: null
        },
        {
          id: 'ORD-87654321',
          items: [{ id: 2, nama: 'Kaos Polos Cotton', harga: 35000, qty: 12 }],
          total: 420000,
          diskon: 0,
          status: 'Diproses',
          tanggal: new Date().toLocaleDateString('id-ID'),
          pembeli: 'Alfia Rahma',
          alamat: 'Jl. Mawar No. 123, Jakarta',
          metodePembayaran: 'QRIS',
          noResi: null
        }
      ];
      localStorage.setItem('groceer_pesanan', JSON.stringify(demoOrders));
    }
  }

  seedDemoOrders();
  loadOrders();