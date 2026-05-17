    const semuaProduk = [
      {id:1, nama:'Beras 5kg',            kat:'pokok',    harga:70000,  asli:85000,  stok:500,  terjual:240,  min_order:10, img:'srcimg/beras.JPEG',   flash:true},
      {id:2, nama:'Kaos Polos Cotton',     kat:'pakaian',  harga:35000,  asli:45000,  stok:300,  terjual:320,  min_order:12, img:'srcimg/kaos.jpeg',    flash:false},
      {id:3, nama:'Minyak Goreng 2L',      kat:'pokok',    harga:26000,  asli:30000,  stok:400,  terjual:890,  min_order:12, img:'srcimg/minyak.jpeg',  flash:true},
      {id:4, nama:'Chitato Sapi Panggang', kat:'snack',    harga:13000,  asli:15000,  stok:2000, terjual:1200, min_order:10, img:'srcimg/chitato.JPEG', flash:true},
      {id:5, nama:'Indomie Goreng 1 Dus',  kat:'makanan',  harga:95000,  asli:110000, stok:150,  terjual:650,  min_order:10, img:'srcimg/indomie.jpg',  flash:false},
      {id:6, nama:'Celana Kargo Pria',     kat:'pakaian',  harga:85000,  asli:110000, stok:100,  terjual:180,  min_order:6,  img:'srcimg/celana.jpeg',  flash:true},
      {id:7, nama:'Gula Pasir 1kg',        kat:'pokok',    harga:14000,  asli:16000,  stok:800,  terjual:530,  min_order:12, img:'srcimg/gula.jpeg',    flash:false},
      {id:8, nama:'Oreo Original 1 Pak',   kat:'snack',    harga:11000,  asli:13000,  stok:1500, terjual:990,  min_order:12, img:'srcimg/oreo.jpeg',    flash:true},
      {id:9, nama:'Biskuit Roma Kelapa',   kat:'snack',    harga:8500,   asli:10000,  stok:2000, terjual:780,  min_order:12, img:'srcimg/roma.jpeg',    flash:false},
      {id:10,nama:'Saus Sambal Botol',     kat:'makanan',  harga:12000,  asli:14000,  stok:600,  terjual:430,  min_order:12, img:'srcimg/saos.jpeg',    flash:true},
    ];

    // Deskripsi produk
    const DESKRIPSI = {
      1: 'Beras premium kualitas terbaik pilihan para reseller. Beras putih pulen dengan kadar air optimal. Cocok untuk dijual kembali ke warung, rumah makan, atau konsumen akhir. Dikemas dalam karung 5kg yang kuat dan higienis.',
      2: 'Kaos polos cotton combed 30s berkualitas tinggi. Bahan lembut, menyerap keringat, dan tahan lama. Tersedia dalam berbagai warna. Cocok untuk dijadikan kaos polos, sablon, atau merchandise. MOQ 12 pcs per warna.',
      3: 'Minyak goreng premium dari bahan kelapa sawit pilihan. Jernih, tidak berbau, dan tahan lama. Kemasan 2 liter praktis untuk penggunaan sehari-hari. Cocok untuk reseller warung, rumah makan, dan toko sembako.',
      4: 'Chitato rasa Sapi Panggang favorit semua kalangan. Keripik kentang dengan bumbu sapi panggang yang khas dan gurih. Kemasan 68g per bungkus. Sangat laris di warung dan toko snack.',
      5: 'Indomie Goreng kemasan dus isi 40 bungkus. Produk mie instan paling laris di Indonesia. Rasanya otentik dan disukai semua kalangan. Margin keuntungan tinggi untuk reseller.',
      6: 'Celana kargo pria model terkini dengan banyak kantong. Bahan drill berkualitas tebal dan kuat. Nyaman dipakai untuk aktivitas outdoor maupun sehari-hari. Tersedia ukuran S-XXL.',
      7: 'Gula pasir putih premium kualitas terjamin. Butiran halus dan merata, tidak menggumpal. Cocok untuk kebutuhan rumah tangga, industri makanan, dan minuman. Dikemas 1kg per bungkus.',
      8: 'Oreo original biskuit cokelat dengan krim vanilla yang ikonik. Snack favorit anak-anak hingga dewasa. Kemasan segar dan higienis. Sangat laris di warung, minimarket, dan toko snack.',
      9: 'Biskuit Roma Kelapa dengan cita rasa kelapa asli yang gurih dan renyah. Cocok untuk cemilan keluarga dan oleh-oleh. Kemasan praktis dan tahan lama.',
      10:'Saus sambal botol dengan rasa pedas yang pas dan segar. Terbuat dari cabai pilihan berkualitas. Cocok untuk pelengkap berbagai hidangan. Kemasan botol 135ml mudah dipakai.',
    };

    // Tier harga per produk
    const TIERS = {
      1:  [{min:10,  max:49,  harga:70000}, {min:50,  max:99,  harga:65000}, {min:100, max:null, harga:60000}],
      2:  [{min:12,  max:35,  harga:35000}, {min:36,  max:71,  harga:32000}, {min:72,  max:null, harga:29000}],
      3:  [{min:12,  max:23,  harga:26000}, {min:24,  max:47,  harga:24000}, {min:48,  max:null, harga:22000}],
      4:  [{min:10,  max:29,  harga:13000}, {min:30,  max:59,  harga:12000}, {min:60,  max:null, harga:11000}],
      5:  [{min:10,  max:19,  harga:95000}, {min:20,  max:39,  harga:88000}, {min:40,  max:null, harga:82000}],
      6:  [{min:6,   max:11,  harga:85000}, {min:12,  max:23,  harga:78000}, {min:24,  max:null, harga:72000}],
      7:  [{min:12,  max:23,  harga:14000}, {min:24,  max:47,  harga:13000}, {min:48,  max:null, harga:12000}],
      8:  [{min:12,  max:23,  harga:11000}, {min:24,  max:47,  harga:10000}, {min:48,  max:null, harga:9000} ],
      9:  [{min:12,  max:23,  harga:8500},  {min:24,  max:47,  harga:7800},  {min:48,  max:null, harga:7200} ],
      10: [{min:12,  max:23,  harga:12000}, {min:24,  max:47,  harga:11000}, {min:48,  max:null, harga:10000}],
    };

    // ── STATE ──
    let produkAktif = null;
    let qty = 1;
    let cart = JSON.parse(localStorage.getItem('groceer_cart') || '{}');

    // ── FORMAT RUPIAH ──
    function rp(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

    // ── HARGA SESUAI QTY (tier) ──
    function hargaUntukQty(idProduk, jumlah) {
      const tiers = TIERS[idProduk];
      if (!tiers) return semuaProduk.find(p=>p.id===idProduk)?.harga || 0;
      for (const t of tiers) {
        if (jumlah >= t.min && (t.max === null || jumlah <= t.max)) return t.harga;
      }
      return tiers[0].harga;
    }

    // ── LOAD PRODUK ──
    function loadProduk() {
      const idStr = localStorage.getItem('groceer_detail_id');
      const id    = idStr ? parseInt(idStr) : null;
      if (!id) { window.location.href = 'dashboard.html'; return; }

      produkAktif = semuaProduk.find(p => p.id === id);
      if (!produkAktif) { window.location.href = 'dashboard.html'; return; }

      const p = produkAktif;
      qty = p.min_order;

      // Isi elemen
      document.getElementById('headerTitle').textContent   = p.nama;
      document.getElementById('produkImg').src             = p.img;
      document.getElementById('produkImg').alt             = p.nama;
      document.getElementById('produkImg').onerror         = function(){ this.src='https://placehold.co/400x400?text=🛒'; };
      document.getElementById('produkNama').textContent    = p.nama;
      document.getElementById('produkHarga').textContent   = rp(hargaUntukQty(p.id, qty));
      document.getElementById('produkTerjual').textContent = p.terjual.toLocaleString('id-ID');
      document.getElementById('produkStok').textContent    = p.stok.toLocaleString('id-ID');
      document.getElementById('minOrderVal').textContent   = p.min_order + ' pcs';
      document.getElementById('qtySubLabel').textContent   = `Min. order ${p.min_order} pcs`;
      document.getElementById('qtyNum').textContent        = qty;
      document.getElementById('produkDeskripsi').textContent = DESKRIPSI[p.id] || 'Produk berkualitas dengan harga grosir terbaik.';

      // Badge diskon
      if (p.asli > p.harga) {
        const pct = Math.round((1 - p.harga / p.asli) * 100);
        document.getElementById('produkHargaAsli').textContent = rp(p.asli);
        const badge = document.getElementById('badgeDiskon');
        badge.textContent = `-${pct}%`;
        badge.style.display = 'block';
      }

      // Render tier harga
      renderTier(p.id);

      // Update total
      updateTotal();
      updateCartBadge();

      // Cek stok
      if (p.stok < p.min_order) {
        document.getElementById('stokInfo').textContent = '⚠️ Stok tidak mencukupi minimal order';
        document.getElementById('btnTambahCart').disabled = true;
        document.getElementById('btnBeliSekarang').disabled = true;
      }
    }

    function renderTier(idProduk) {
      const tiers = TIERS[idProduk];
      const p     = semuaProduk.find(x => x.id === idProduk);
      if (!tiers || !p) { document.getElementById('tierWrap').style.display = 'none'; return; }

      document.getElementById('tierBody').innerHTML = tiers.map(t => {
        const range   = t.max ? `${t.min} – ${t.max} pcs` : `≥ ${t.min} pcs`;
        const hemat   = p.asli > t.harga ? rp(p.asli - t.harga) + '/pcs' : '-';
        return `<tr>
          <td>${range}</td>
          <td class="tier-harga">${rp(t.harga)}</td>
          <td style="color:var(--merah);font-size:12px">${hemat}</td>
        </tr>`;
      }).join('');
    }

    // ── UBAH QTY ──
    function ubahQty(delta) {
      const p      = produkAktif;
      const newQty = qty + delta;
      if (newQty < p.min_order) {
        tampilToast(`Minimal pembelian ${p.min_order} pcs`);
        return;
      }
      if (newQty > p.stok) {
        tampilToast(`Stok hanya tersisa ${p.stok} pcs`);
        return;
      }
      qty = newQty;
      document.getElementById('qtyNum').textContent = qty;
      document.getElementById('produkHarga').textContent = rp(hargaUntukQty(p.id, qty));
      document.getElementById('btnMinus').disabled = qty <= p.min_order;
      updateTotal();
    }

    function updateTotal() {
      if (!produkAktif) return;
      const total = hargaUntukQty(produkAktif.id, qty) * qty;
      document.getElementById('totalHarga').textContent = rp(total);
    }

    // ── TAMBAH KE CART ──
    function tambahKeCart() {
      if (!produkAktif) return;
      cart[produkAktif.id] = (cart[produkAktif.id] || 0) + qty;
      localStorage.setItem('groceer_cart', JSON.stringify(cart));
      updateCartBadge();
      tampilToast(`✅ ${qty} pcs ${produkAktif.nama} ditambahkan ke keranjang!`);
    }

    // ── BELI SEKARANG ──
    function beliSekarang() {
      if (!produkAktif) return;
      const p     = produkAktif;
      const total = hargaUntukQty(p.id, qty) * qty;
      const noOrder = 'GRC-' + Date.now().toString().slice(-8);
      const tgl = new Date().toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'});

      let pesanan = JSON.parse(localStorage.getItem('groceer_pesanan') || '[]');
      pesanan.unshift({
        id: noOrder,
        items: [{ id:p.id, nama:p.nama, qty, harga:hargaUntukQty(p.id,qty), img:p.img }],
        total, diskon:0,
        status:'Menunggu Pembayaran',
        tanggal: tgl
      });
      localStorage.setItem('groceer_pesanan', JSON.stringify(pesanan));

      document.getElementById('modalProduk').textContent = p.nama;
      document.getElementById('modalQty').textContent    = qty + ' pcs';
      document.getElementById('modalTotal').textContent  = rp(total);
      document.getElementById('modalSukses').classList.add('show');
    }

    function tutupModal() {
      document.getElementById('modalSukses').classList.remove('show');
    }

    // ── CART BADGE ──
    function updateCartBadge() {
      const total = Object.values(cart).reduce((s,v)=>s+v,0);
      const badge = document.getElementById('cartBadge');
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }

    // ── TOAST ──
    function tampilToast(pesan) {
      const t = document.getElementById('toast');
      t.textContent = pesan;
      t.classList.add('show');
      setTimeout(()=>t.classList.remove('show'), 2200);
    }

    // ── BACK BUTTON ──
    document.getElementById('backBtn').onclick = () => {
      if (document.referrer) history.back();
      else window.location.href = 'dashboard.html';
    };

    // ── INIT ──
    loadProduk();