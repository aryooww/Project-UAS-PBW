// ========== DATA PRODUK TERPUSAT ==========
const produk = [
  {id:1, nama:'Beras 5kg', kat:'pokok', harga:70000, asli:85000, stok:500, terjual:240, min_order:10, img:'srcimg/beras.JPEG', flash:true},
  {id:2, nama:'Kaos Polos Cotton', kat:'pakaian', harga:35000, asli:45000, stok:300, terjual:320, min_order:12, img:'srcimg/kaos.jpeg', flash:false},
  {id:3, nama:'Minyak Goreng 2L', kat:'pokok', harga:26000, asli:30000, stok:400, terjual:890, min_order:12, img:'srcimg/minyak.jpeg', flash:true},
  {id:4, nama:'Chitato Sapi Panggang', kat:'snack', harga:13000, asli:15000, stok:2000, terjual:1200, min_order:10, img:'srcimg/chitato.JPEG', flash:true},
  {id:5, nama:'Indomie Goreng 1 Dus', kat:'makanan', harga:95000, asli:110000, stok:150, terjual:650, min_order:10, img:'srcimg/indomie.jpg', flash:false},
  {id:6, nama:'Celana Kargo Pria', kat:'pakaian', harga:85000, asli:110000, stok:100, terjual:180, min_order:6, img:'srcimg/celana.jpeg', flash:true},
  {id:7, nama:'Gula Pasir 1kg', kat:'pokok', harga:14000, asli:16000, stok:800, terjual:530, min_order:12, img:'srcimg/gula.jpeg', flash:false},
  {id:8, nama:'Oreo Original 1 Pak', kat:'snack', harga:11000, asli:13000, stok:1500, terjual:990, min_order:12, img:'srcimg/oreo.jpeg', flash:true},
  {id:9, nama:'Biskuit Roma Kelapa', kat:'snack', harga:8500, asli:10000, stok:2000, terjual:780, min_order:12, img:'srcimg/roma.jpeg', flash:false},
  {id:10, nama:'Saus Sambal Botol', kat:'makanan', harga:12000, asli:14000, stok:600, terjual:430, min_order:12, img:'srcimg/saos.jpeg', flash:true},
];

// Variabel global
let cart = JSON.parse(localStorage.getItem('groceer_cart') || '{}');
let activeKat = null;
let currentSort = 'default';

function saveCart() { localStorage.setItem('groceer_cart', JSON.stringify(cart)); }
function totalCart() { return Object.values(cart).reduce((s,v)=>s+v,0); }

function updateCartUI() {
  const t = totalCart();
  const hdrBadge = document.getElementById('hdrCartBadge');
  const bnBadge = document.getElementById('bnBadge');
  if (hdrBadge) {
    hdrBadge.textContent = t;
    if (t > 0) hdrBadge.classList.remove('d-none');
    else hdrBadge.classList.add('d-none');
  }
  if (bnBadge) {
    bnBadge.textContent = t;
    if (t > 0) bnBadge.style.display = 'flex';
    else bnBadge.style.display = 'none';
  }
}

function cekStok(id, qtyTambahan = 1) {
  const p = produk.find(x => x.id === id);
  if (!p) return false;
  const currentQty = cart[id] || 0;
  const newQty = currentQty + qtyTambahan;
  
  if (newQty > p.stok) {
    showToast(`⚠️ Stok ${p.nama} hanya tersisa ${p.stok} pcs!`);
    return false;
  }
  if (newQty < p.min_order && currentQty === 0) {
    showToast(`ℹ️ Minimal pembelian ${p.nama} adalah ${p.min_order} pcs`);
    return false;
  }
  return true;
}

function tambah(id, e) {
  if (e) e.stopPropagation();
  if (!cekStok(id, 1)) return;
  
  cart[id] = (cart[id]||0) + 1;
  saveCart(); 
  updateCartUI();
  showToast('Produk ditambahkan ke keranjang 🛒');
  render();
  renderFlash();
}

function ubahQty(id, delta) {
  const p = produk.find(x => x.id === id);
  if (!p) return;
  const currentQty = cart[id] || 0;
  const newQty = currentQty + delta;
  
  if (newQty < 1) {
    hapusDariKeranjang(id);
    return;
  }
  if (newQty > p.stok) {
    showToast(`⚠️ Stok ${p.nama} hanya tersisa ${p.stok} pcs!`);
    return;
  }
  
  cart[id] = newQty;
  saveCart();
  updateCartUI();
  window.dispatchEvent(new CustomEvent('cart-updated'));
  render();
  renderFlash();
}

function hapusDariKeranjang(id) {
  delete cart[id];
  saveCart();
  updateCartUI();
  window.dispatchEvent(new CustomEvent('cart-updated'));
  showToast('Produk dihapus dari keranjang');
  render();
  renderFlash();
}

// Fungsi BELI SEKARANG
function beliSekarang(id) {
  const p = produk.find(x => x.id === id);
  if (!p) return;

  if (p.stok < p.min_order) {
    showToast(`⚠️ Stok ${p.nama} tidak mencukupi minimal order!`);
    return;
  }

  const checkoutItem = [{
    id: p.id,
    nama: p.nama,
    harga: p.harga,
    qty: p.min_order,
    subtotal: p.harga * p.min_order,
    img: p.img
  }];
  
  sessionStorage.setItem('groceer_checkout_items', JSON.stringify(checkoutItem));
  window.location.href = 'checkout.html';
}

function rp(n) { return 'Rp ' + n.toLocaleString('id-ID'); }

function sortProduk(list, sortBy) {
  const sorted = [...list];
  switch(sortBy) {
    case 'harga_rendah':
      return sorted.sort((a,b) => a.harga - b.harga);
    case 'harga_tinggi':
      return sorted.sort((a,b) => b.harga - a.harga);
    case 'terlaris':
      return sorted.sort((a,b) => b.terjual - a.terjual);
    default:
      return sorted;
  }
}

function cardHTML(p) {
  const pct = Math.round((1 - p.harga/p.asli) * 100);
  const isLowStock = p.stok < p.min_order;
  
  return `
    <div class="p-card" onclick="lihatDetail(${p.id})" style="cursor:pointer">
      <div class="p-img">
        <img src="${p.img}" alt="${p.nama}" loading="lazy" onerror="this.src='https://placehold.co/200x200?text=🛒'">
        ${pct>0?`<span class="p-badge">-${pct}%</span>`:''}
        ${isLowStock ? `<span class="stok-badge">⚠️ Stok Habis</span>` : ''}
      </div>
      <div class="p-body">
        <div class="p-name">${p.nama}</div>
        <div class="p-price">${rp(p.harga)}</div>
        ${p.asli>p.harga?`<div class="p-orig">${rp(p.asli)}</div>`:''}
        <div class="p-min">Min. ${p.min_order} pcs</div>
        <div class="p-footer">
          <div class="p-sold">${p.terjual.toLocaleString('id-ID')} terjual</div>
          <button class="add-btn" onclick="tambah(${p.id},event)" ${isLowStock ? 'disabled' : ''}>+</button>
        </div>
        <button class="beli-btn" onclick="beliSekarang(${p.id})" ${isLowStock ? 'disabled' : ''}>
          <i class="fas fa-bolt"></i> Beli Sekarang
        </button>
      </div>
    </div>`;
}

function lihatDetail(id) {
  localStorage.setItem('groceer_detail_id', id);
  window.location.href = 'detail_produk.html';
}

function render() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const q = searchInput.value.toLowerCase();
  let list = produk.filter(p => !activeKat || p.kat === activeKat);
  if (q) list = list.filter(p => p.nama.toLowerCase().includes(q));
  
  list = sortProduk(list, currentSort);
  
  const grid = document.getElementById('produkGrid');
  const noRes = document.getElementById('noResult');
  if (!grid) return;
  
  if (list.length === 0) {
    grid.innerHTML = '';
    if (noRes) noRes.classList.remove('d-none');
  } else {
    if (noRes) noRes.classList.add('d-none');
    grid.innerHTML = list.map(cardHTML).join('');
  }
}

function renderFlash() {
  const flashGrid = document.getElementById('flashGrid');
  if (!flashGrid) return;
  const flash = produk.filter(p => p.flash && p.stok >= p.min_order);
  flashGrid.innerHTML = flash.map(cardHTML).join('');
}

function doSearch() {
  const q = document.getElementById('searchInput').value.toLowerCase().trim();

  const homePage    = document.getElementById('homePage');
  const katPage     = document.getElementById('katPage');
  const profilePage = document.getElementById('profilePage');

  if (katPage)     katPage.style.display     = 'none';
  if (profilePage) profilePage.style.display = 'none';
  if (homePage)    homePage.style.display     = 'block';

  // Elemen yang disembunyikan saat search aktif
  const heroSection  = document.querySelector('.hero-section');
  const katGridWrap  = document.querySelector('.kat-grid');
  const secHdrKat    = document.querySelector('.sec-hdr');
  const flashBar     = document.querySelector('.flash-bar');
  const flashRow     = document.querySelector('.produk-row');
  const secHdrList   = document.querySelectorAll('.sec-hdr');

  if (!q) {
    // Search kosong — tampilkan semua elemen normal
    if (heroSection) heroSection.style.display  = '';
    if (katGridWrap) katGridWrap.style.display  = '';
    if (flashBar)    flashBar.style.display     = '';
    if (flashRow)    flashRow.style.display     = '';
    secHdrList.forEach(el => el.style.display   = '');
    activeKat = null;
    render();
    renderFlash();
    // Kembalikan judul
    if (secHdrList[1]) secHdrList[1].querySelector('.sec-title').textContent = 'Produk Terlaris';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  // Search aktif — sembunyikan elemen yang tidak perlu
  if (heroSection) heroSection.style.display  = 'none';
  if (katGridWrap) katGridWrap.style.display  = 'none';
  if (flashBar)    flashBar.style.display     = 'none';
  if (flashRow)    flashRow.style.display     = 'none';
  secHdrList.forEach((el, i) => {
    if (i === 0) el.style.display = 'none'; // sembunyikan header "Kategori"
  });

  // Filter produk
  const hasil = produk.filter(p =>
    p.nama.toLowerCase().includes(q) ||
    p.kat.toLowerCase().includes(q)
  );

  const grid  = document.getElementById('produkGrid');
  const noRes = document.getElementById('noResult');
  if (!grid) return;

  // Update judul section hasil pencarian
  if (secHdrList[1]) {
    secHdrList[1].style.display = '';
    secHdrList[1].querySelector('.sec-title').textContent = `🔍 Hasil: "${q}" (${hasil.length} produk)`;
  }

  if (hasil.length === 0) {
    grid.innerHTML = '';
    if (noRes) {
      noRes.classList.remove('d-none');
      noRes.innerHTML = `
        <i class="fas fa-search" style="font-size:48px"></i>
        <p style="margin-top:12px;">Produk "<b>${q}</b>" tidak ditemukan</p>
        <p style="font-size:12px;margin-top:6px;color:#bbb">Coba kata kunci lain</p>`;
    }
  } else {
    if (noRes) noRes.classList.add('d-none');
    grid.innerHTML = hasil.map(cardHTML).join('');
  }

  // Scroll ke atas agar hasil langsung terlihat
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setSorting(sortBy, el) {
  currentSort = sortBy;
  render();
  document.querySelectorAll('.sort-btn').forEach(btn => btn.classList.remove('active'));
  if (el) el.classList.add('active');
}

function setKat(kat, el) {
  activeKat = kat;
  render();
  document.querySelectorAll('.sub-link').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  if (kat) showPage('kategori', kat);
}

function openSb() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.add('on');
  if (overlay) overlay.classList.add('on');
  updateProfileInSidebar();
}

function closeSb() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.remove('on');
  if (overlay) overlay.classList.remove('on');
}

function showToast(msg) {
  const t = document.getElementById('toastBox');
  if (t) {
    t.textContent = msg;
    t.classList.add('on');
    setTimeout(() => t.classList.remove('on'), 2200);
  } else {
    alert(msg);
  }
}

let cdSecs = 3*3600 + 45*60;
function tickCD() {
  cdSecs--;
  if (cdSecs < 0) cdSecs = 6*3600;
  const h = Math.floor(cdSecs/3600);
  const m = Math.floor((cdSecs%3600)/60);
  const s = cdSecs%60;
  const cdH = document.getElementById('cdH');
  const cdM = document.getElementById('cdM');
  const cdS = document.getElementById('cdS');
  if (cdH) cdH.textContent = String(h).padStart(2,'0');
  if (cdM) cdM.textContent = String(m).padStart(2,'0');
  if (cdS) cdS.textContent = String(s).padStart(2,'0');
}

if (document.getElementById('cdH')) {
  setInterval(tickCD, 1000);
}

function doLogout() {
  sessionStorage.removeItem('groceer_logged_in');
  showToast('Logout berhasil');
  setTimeout(() => window.location.href = 'login.html', 800);
}

function updateProfileInSidebar() {
  const profile = JSON.parse(localStorage.getItem('groceer_profile') || '{}');
  const sesiRaw = sessionStorage.getItem('groceer_logged_in');
  const user = sesiRaw ? JSON.parse(sesiRaw) : null;
  
  const sbEmail = document.getElementById('sbEmail');
  const hdrUser = document.getElementById('hdrUser');
  
  if (user) {
    if (sbEmail) sbEmail.textContent = user.email || user.nama || 'Reseller';
    if (hdrUser) hdrUser.textContent = user.nama || 'Akun';
  } else if (profile.name) {
    if (sbEmail) sbEmail.textContent = profile.email || profile.name;
    if (hdrUser) hdrUser.textContent = profile.name.split(' ')[0];
  }
  
  if (profile.avatar) {
    const sbAvatar = document.querySelector('.sb-logo');
    if (sbAvatar && profile.avatar !== sbAvatar.innerHTML) {
      sbAvatar.style.background = 'none';
      sbAvatar.style.padding = '0';
      sbAvatar.innerHTML = `<img src="${profile.avatar}" style="width:44px;height:44px;border-radius:50%;object-fit:cover">`;
    }
  }
}

// Inisialisasi
const li = sessionStorage.getItem('groceer_logged_in');
if (li) {
  const u = JSON.parse(li);
  const sbEmail = document.getElementById('sbEmail');
  const hdrUser = document.getElementById('hdrUser');
  if (sbEmail) sbEmail.textContent = u.email || u.nama;
  if (hdrUser) hdrUser.textContent = u.nama;
} else {
  const hdrUser = document.getElementById('hdrUser');
  if (hdrUser) hdrUser.textContent = 'Login';
}

// ACCORDION PESANAN SAYA
function toggleAccordion(id) {
  const content = document.getElementById(id);
  const icon = document.getElementById('pesananIcon');
  
  if (!content) return;
  
  if (content.classList.contains('open')) {
    content.classList.remove('open');
    if (icon) {
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    }
  } else {
    content.classList.add('open');
    if (icon) {
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    }
    updatePesananBadges();
  }
}

function updatePesananBadges() {
  const pesanan = JSON.parse(localStorage.getItem('groceer_pesanan') || '[]');
  const counts = {
    'Menunggu Pembayaran': pesanan.filter(p => p.status === 'Menunggu Pembayaran').length,
    'Diproses': pesanan.filter(p => p.status === 'Diproses').length,
    'Dikirim': pesanan.filter(p => p.status === 'Dikirim').length,
    'Selesai': pesanan.filter(p => p.status === 'Selesai').length,
    'Dibatalkan': pesanan.filter(p => p.status === 'Dibatalkan').length
  };
  
  const badgeIds = {
    'Menunggu Pembayaran': 'badgeMenunggu',
    'Diproses': 'badgeDiproses',
    'Dikirim': 'badgeDikirim',
    'Selesai': 'badgeSelesai',
    'Dibatalkan': 'badgeDibatalkan'
  };
  
  for (const [status, badgeId] of Object.entries(badgeIds)) {
    const el = document.getElementById(badgeId);
    if (el) {
      el.textContent = counts[status];
      el.style.display = counts[status] > 0 ? 'inline-block' : 'none';
    }
  }
}

function showPesananByStatus(status) {
  updatePesananBadges();
  const pesanan = JSON.parse(localStorage.getItem('groceer_pesanan') || '[]');
  const filtered = pesanan.filter(p => p.status === status);
  
  if (filtered.length === 0) {
    showToast(`Tidak ada pesanan dengan status "${status}"`);
    return;
  }
  
  sessionStorage.setItem('groceer_filter_pesanan', JSON.stringify(filtered));
  sessionStorage.setItem('groceer_filter_status', status);
  window.location.href = 'orders.html';
}

// SWITCH HALAMAN
function showPage(page, kat) {
  const homePage = document.getElementById('homePage');
  const profilePage = document.getElementById('profilePage');
  const katPage = document.getElementById('katPage');
  
  if (homePage) homePage.style.display = 'none';
  if (profilePage) profilePage.style.display = 'none';
  if (katPage) katPage.style.display = 'none';

  if (page === 'home') {
    if (homePage) homePage.style.display = 'block';
    activeKat = null;
    render();
    renderFlash();
  } else if (page === 'kategori') {
    if (katPage) katPage.style.display = 'block';
    renderKatPage(kat);
  } else if (page === 'profile') {
    if (profilePage) profilePage.style.display = 'block';
    loadProfileData();
    loadShippingAddresses();
    loadShippingHistory();
  }
}

function renderKatPage(kat) {
  const namaKat = {
    snack: '🍿 Snack',
    pakaian: '👕 Pakaian',
    pokok: '🛒 Kebutuhan Pokok',
    makanan: '🍱 Makanan',
    minuman: '🧃 Minuman',
    kebersihan: '🧴 Kebersihan'
  };

  const list = produk.filter(p => p.kat === kat && p.stok >= p.min_order);
  list.sort((a,b) => b.terjual - a.terjual);

  const katTitle = document.getElementById('katTitle');
  const katJumlah = document.getElementById('katJumlah');
  const katGrid2 = document.getElementById('katGrid2');
  
  if (katTitle) katTitle.textContent = namaKat[kat] || kat;
  if (katJumlah) katJumlah.textContent = list.length + ' produk tersedia';
  if (katGrid2) {
    if (list.length === 0) {
      katGrid2.innerHTML = '<p style="padding:20px;color:#aaa;text-align:center">Belum ada produk tersedia</p>';
    } else {
      katGrid2.innerHTML = list.map(cardHTML).join('');
    }
  }
}

// PROFIL
function loadProfileData() {
  const saved = localStorage.getItem('groceer_profile');
  if (saved) {
    const profile = JSON.parse(saved);
    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const phoneInput = document.getElementById('profilePhone');
    const addressInput = document.getElementById('profileAddress');
    const avatarImg = document.getElementById('avatarImg');
    
    if (nameInput) nameInput.value = profile.name || '';
    if (emailInput) emailInput.value = profile.email || '';
    if (phoneInput) phoneInput.value = profile.phone || '';
    if (addressInput) addressInput.value = profile.address || '';
    if (avatarImg && profile.avatar) avatarImg.src = profile.avatar;
  }
}

function saveProfile() {
  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const phoneInput = document.getElementById('profilePhone');
  const addressInput = document.getElementById('profileAddress');
  const avatarImg = document.getElementById('avatarImg');
  
  const profile = {
    name: nameInput ? nameInput.value : '',
    email: emailInput ? emailInput.value : '',
    phone: phoneInput ? phoneInput.value : '',
    address: addressInput ? addressInput.value : '',
    avatar: avatarImg ? avatarImg.src : ''
  };
  localStorage.setItem('groceer_profile', JSON.stringify(profile));
  updateProfileInSidebar();
  showToast('Profil berhasil disimpan! ✅');
}

function uploadAvatar(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const avatarImg = document.getElementById('avatarImg');
      if (avatarImg) avatarImg.src = e.target.result;
      updateProfileInSidebar();
      showToast('Foto profil berhasil diunggah!');
    };
    reader.readAsDataURL(file);
  }
}

// ALAMAT PENGIRIMAN
let shippingAddresses = [];

function loadShippingAddresses() {
  const saved = localStorage.getItem('groceer_shipping_addresses');
  if (saved) {
    shippingAddresses = JSON.parse(saved);
  } else {
    shippingAddresses = [
      { id: 1, label: 'Rumah (Utama)', address: 'Jl. Mawar No. 123, RT 01 RW 02, Kelurahan Sukamaju' },
      { id: 2, label: 'Kantor', address: 'Gedung Perkantoran Griya, Lantai 3, Jl. Kenanga No. 45' }
    ];
    saveShippingAddresses();
  }
  renderShippingAddresses();
}

function saveShippingAddresses() {
  localStorage.setItem('groceer_shipping_addresses', JSON.stringify(shippingAddresses));
}

function renderShippingAddresses() {
  const container = document.getElementById('shippingAddressesList');
  if (!container) return;
  
  if (shippingAddresses.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-map-marker-alt"></i><p>Belum ada alamat tambahan</p></div>';
    return;
  }
  
  container.innerHTML = shippingAddresses.map(addr => `
    <div class="shipping-address-item">
      <div class="address-info">
        <div class="address-label">📌 ${escapeHtml(addr.label)}</div>
        <div class="address-text">${escapeHtml(addr.address)}</div>
      </div>
      <div class="address-actions">
        <button onclick="editAddress(${addr.id})" title="Edit"><i class="fas fa-edit"></i></button>
        <button onclick="deleteAddress(${addr.id})" title="Hapus"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
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

function addShippingAddress() {
  const label = prompt('Masukkan label alamat (contoh: Rumah, Kantor, Kos, dll):');
  if (!label) return;
  const address = prompt('Masukkan alamat lengkap:');
  if (!address) return;
  
  const newId = Date.now();
  shippingAddresses.push({ id: newId, label: label, address: address });
  saveShippingAddresses();
  renderShippingAddresses();
  showToast('Alamat pengiriman berhasil ditambahkan!');
}

function editAddress(id) {
  const addr = shippingAddresses.find(a => a.id === id);
  if (!addr) return;
  
  const newLabel = prompt('Edit label alamat:', addr.label);
  if (newLabel !== null && newLabel.trim()) addr.label = newLabel.trim();
  const newAddress = prompt('Edit alamat:', addr.address);
  if (newAddress !== null && newAddress.trim()) addr.address = newAddress.trim();
  
  saveShippingAddresses();
  renderShippingAddresses();
  showToast('Alamat berhasil diperbarui!');
}

function deleteAddress(id) {
  if (confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
    shippingAddresses = shippingAddresses.filter(a => a.id !== id);
    saveShippingAddresses();
    renderShippingAddresses();
    showToast('Alamat berhasil dihapus!');
  }
}

// RIWAYAT PENGIRIMAN
function loadShippingHistory() {
  const saved = localStorage.getItem('groceer_shipping_history');
  let history = [];
  if (saved) {
    history = JSON.parse(saved);
  } else {
    history = [
      { id: 1, date: '15 April 2026', status: 'Selesai', address: 'Jl. Mawar No. 123, Sukamaju', noResi: 'GRC12345678' },
      { id: 2, date: '10 April 2026', status: 'Selesai', address: 'Jl. Kenanga No. 45, Perkantoran', noResi: 'GRC87654321' },
      { id: 3, date: '5 April 2026', status: 'Dikirim', address: 'Jl. Mawar No. 123, Sukamaju', noResi: 'GRC11223344' }
    ];
    localStorage.setItem('groceer_shipping_history', JSON.stringify(history));
  }
  renderShippingHistory(history);
}

function renderShippingHistory(history) {
  const container = document.getElementById('shippingHistory');
  if (!container) return;
  
  if (history.length === 0) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>Belum ada riwayat pengiriman</p></div>';
    return;
  }
  
  container.innerHTML = history.map(item => `
    <div class="history-item">
      <div class="history-date"><i class="far fa-calendar-alt"></i> ${item.date}</div>
      <div class="history-status">${item.status === 'Selesai' ? '✅' : '🚚'} ${item.status}</div>
      <div class="history-address"><i class="fas fa-map-pin"></i> ${escapeHtml(item.address)}</div>
      ${item.noResi ? `<div class="history-resi"><i class="fas fa-barcode"></i> Resi: ${item.noResi}</div>` : ''}
    </div>
  `).join('');
}

// EVENT LISTENER & INIT
document.addEventListener('DOMContentLoaded', function() {
  loadProfileData();
  loadShippingAddresses();
  loadShippingHistory();
  render();
  renderFlash();
  updateCartUI();
  updateProfileInSidebar();
  updatePesananBadges();
  
  window.addEventListener('cart-updated', function() {
    updateCartUI();
    render();
    renderFlash();
  });
});

// Export fungsi ke global
window.tambah = tambah;
window.ubahQty = ubahQty;
window.hapusDariKeranjang = hapusDariKeranjang;
window.beliSekarang = beliSekarang;
window.showPesananByStatus = showPesananByStatus;
window.setSorting = setSorting;
window.setKat = setKat;
window.showPage = showPage;
window.openSb = openSb;
window.closeSb = closeSb;
window.doLogout = doLogout;
window.saveProfile = saveProfile;
window.uploadAvatar = uploadAvatar;
window.addShippingAddress = addShippingAddress;
window.editAddress = editAddress;
window.deleteAddress = deleteAddress;
window.toggleAccordion = toggleAccordion;
window.rp = rp;
window.produk = produk;