  // Data produk
  const produk = [
    {id:1, nama:'Beras 5kg', harga:70000, min_order:10},
    {id:2, nama:'Kaos Polos Cotton', harga:35000, min_order:12},
    {id:3, nama:'Minyak Goreng 2L', harga:26000, min_order:12},
    {id:4, nama:'Chitato Sapi Panggang', harga:13000, min_order:10},
    {id:5, nama:'Indomie Goreng 1 Dus', harga:95000, min_order:10},
    {id:6, nama:'Celana Kargo Pria', harga:85000, min_order:6},
    {id:7, nama:'Gula Pasir 1kg', harga:14000, min_order:12},
    {id:8, nama:'Oreo Original 1 Pak', harga:11000, min_order:12},
    {id:9, nama:'Biskuit Roma Kelapa', harga:8500, min_order:12},
    {id:10, nama:'Saus Sambal Botol', harga:12000, min_order:12},
  ];

  // Ambil data dari URL parameter atau sessionStorage
  let checkoutItems = [];

  function getCheckoutData() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemsParam = urlParams.get('items');
    
    if (itemsParam) {
      try {
        checkoutItems = JSON.parse(decodeURIComponent(itemsParam));
      } catch(e) {
        console.error('Error parsing items', e);
      }
    }
    
    // Ambil dari sessionStorage sebagai fallback
    if (checkoutItems.length === 0) {
      const saved = sessionStorage.getItem('groceer_checkout_items');
      if (saved) {
        checkoutItems = JSON.parse(saved);
        sessionStorage.removeItem('groceer_checkout_items');
      }
    }
    
    // Jika masih kosong, ambil dari keranjang yang dipilih
    if (checkoutItems.length === 0) {
      const cart = JSON.parse(localStorage.getItem('groceer_cart') || '{}');
      const dipilih = JSON.parse(sessionStorage.getItem('groceer_selected_items') || '{}');
      
      for (const [id, qty] of Object.entries(cart)) {
        if (dipilih[id] !== false) {
          const p = produk.find(x => x.id === parseInt(id));
          if (p) {
            checkoutItems.push({
              id: p.id,
              nama: p.nama,
              harga: p.harga,
              qty: qty,
              subtotal: p.harga * qty
            });
          }
        }
      }
      sessionStorage.removeItem('groceer_selected_items');
    }
    
    renderRingkasan();
  }

  function renderRingkasan() {
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    const container = document.getElementById('daftarProduk');
    
    if (container) {
      container.innerHTML = checkoutItems.map(item => `
        <div class="product-item">
          <span>${item.nama} <strong>x${item.qty}</strong></span>
          <span>Rp ${(item.harga * item.qty).toLocaleString('id-ID')}</span>
        </div>
      `).join('');
    }
    
    document.getElementById('subtotalText').innerHTML = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('totalText').innerHTML = `Rp ${subtotal.toLocaleString('id-ID')}`;
  }

  // Load alamat yang tersimpan
  function loadAlamatTersimpan() {
    const addresses = JSON.parse(localStorage.getItem('groceer_shipping_addresses') || '[]');
    const profile = JSON.parse(localStorage.getItem('groceer_profile') || '{}');
    const container = document.getElementById('alamatTersimpan');
    
    let html = '';
    
    // Alamat utama dari profil
    if (profile.address) {
      html += `
        <div class="saved-address" onclick="pilihAlamat(this, '${escapeHtml(profile.address)}')">
          <div class="label">📌 Alamat Utama</div>
          <div class="address">${escapeHtml(profile.address)}</div>
        </div>
      `;
    }
    
    // Alamat tambahan
    addresses.forEach(addr => {
      html += `
        <div class="saved-address" onclick="pilihAlamat(this, '${escapeHtml(addr.address)}')">
          <div class="label">📌 ${escapeHtml(addr.label)}</div>
          <div class="address">${escapeHtml(addr.address)}</div>
        </div>
      `;
    });
    
    if (html === '') {
      html = '<p style="color:#999;font-size:13px;">Belum ada alamat tersimpan. Silakan isi alamat baru di bawah.</p>';
    }
    
    container.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
      if (m === '&') return '&amp;';
      if (m === '<') return '&lt;';
      if (m === '>') return '&gt;';
      return m;
    });
  }

  function pilihAlamat(element, alamat) {
    // Hapus class selected dari semua
    document.querySelectorAll('.saved-address').forEach(el => {
      el.classList.remove('selected');
    });
    element.classList.add('selected');
    
    // Kosongkan textarea alamat baru
    document.getElementById('alamatBaru').value = '';
    
    // Simpan alamat yang dipilih
    window.alamatTerpilih = alamat;
  }

  // Load data pemesan dari profil
  function loadDataPemesan() {
    const profile = JSON.parse(localStorage.getItem('groceer_profile') || '{}');
    const sesiRaw = sessionStorage.getItem('groceer_logged_in');
    const user = sesiRaw ? JSON.parse(sesiRaw) : null;
    
    if (profile.name) {
      document.getElementById('namaPemesan').value = profile.name;
    } else if (user && user.nama) {
      document.getElementById('namaPemesan').value = user.nama;
    }
    
    if (profile.phone) {
      document.getElementById('noTelepon').value = profile.phone;
    }
    
    if (profile.email) {
      document.getElementById('emailPemesan').value = profile.email;
    } else if (user && user.email) {
      document.getElementById('emailPemesan').value = user.email;
    }
  }

  // Setup metode pembayaran
  function setupPaymentMethods() {
    const methods = document.querySelectorAll('.payment-method');
    methods.forEach(method => {
      method.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
        
        methods.forEach(m => m.classList.remove('selected'));
        this.classList.add('selected');
      });
    });
    
    // Default pilih transfer
    const defaultMethod = document.querySelector('.payment-method');
    if (defaultMethod) {
      defaultMethod.classList.add('selected');
      const radio = defaultMethod.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    }
  }

  function goBack() {
    window.history.back();
  }

  function showToast(pesan) {
    const toast = document.getElementById('toast');
    toast.textContent = pesan;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function prosesPesanan() {
    // Validasi nama
    const nama = document.getElementById('namaPemesan').value.trim();
    if (!nama) {
      showToast('⚠️ Nama pemesan harus diisi!');
      document.getElementById('namaPemesan').focus();
      return;
    }
    
    // Validasi telepon
    const telepon = document.getElementById('noTelepon').value.trim();
    if (!telepon) {
      showToast('⚠️ Nomor telepon harus diisi!');
      document.getElementById('noTelepon').focus();
      return;
    }
    
    // Validasi alamat
    let alamat = window.alamatTerpilih || '';
    const alamatBaru = document.getElementById('alamatBaru').value.trim();
    if (alamatBaru) {
      alamat = alamatBaru;
    }
    
    if (!alamat) {
      showToast('⚠️ Alamat pengiriman harus diisi!');
      return;
    }
    
    // Validasi metode pembayaran
    const selectedPayment = document.querySelector('input[name="payment"]:checked');
    if (!selectedPayment) {
      showToast('⚠️ Pilih metode pembayaran!');
      return;
    }
    
    const metodeBayar = selectedPayment.value;
    let metodeText = '';
    switch(metodeBayar) {
      case 'transfer': metodeText = 'Transfer Bank'; break;
      case 'qris': metodeText = 'QRIS'; break;
      case 'cod': metodeText = 'COD (Bayar di Tempat)'; break;
    }
    
    // Hitung total
    const subtotal = checkoutItems.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    const total = subtotal;
    
    // Buat pesanan
    const pesanan = {
      id: 'ORD-' + Date.now().toString().slice(-8),
      items: checkoutItems,
      total: total,
      diskon: 0,
      status: 'Menunggu Pembayaran',
      tanggal: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      pembeli: nama,
      telepon: telepon,
      email: document.getElementById('emailPemesan').value.trim(),
      alamat: alamat,
      metodePembayaran: metodeText,
      noResi: null,
      createdAt: Date.now()
    };
    
    // Simpan ke riwayat pesanan
    let semuaPesanan = JSON.parse(localStorage.getItem('groceer_pesanan') || '[]');
    semuaPesanan.unshift(pesanan);
    localStorage.setItem('groceer_pesanan', JSON.stringify(semuaPesanan));
    
    // Hapus item dari keranjang jika checkout dari keranjang
    const cart = JSON.parse(localStorage.getItem('groceer_cart') || '{}');
    checkoutItems.forEach(item => {
      delete cart[item.id];
    });
    localStorage.setItem('groceer_cart', JSON.stringify(cart));
    
    // Trigger event update
    window.dispatchEvent(new CustomEvent('cart-updated'));
    
    // Simpan pesanan terakhir untuk halaman sukses
    sessionStorage.setItem('groceer_last_order', JSON.stringify(pesanan));
    
    // Redirect ke halaman sukses
    window.location.href = 'order_succes.html';;
  }

  // Inisialisasi
  getCheckoutData();
  loadAlamatTersimpan();
  loadDataPemesan();
  setupPaymentMethods();