    const dataProduk = [
      { id:1,  nama:'Beras 5kg',            harga:70000,  stok:500, min_order:10, img:'srcimg/beras.JPEG'       },
      { id:2,  nama:'Kaos Polos Cotton',     harga:35000,  stok:300, min_order:12, img:'srcimg/kaos.jpeg' },
      { id:3,  nama:'Minyak Goreng 2L',      harga:26000,  stok:400, min_order:12, img:'srcimg/minyak.jpeg'      },
      { id:4,  nama:'Chitato Sapi Panggang', harga:13000,  stok:2000, min_order:10, img:'srcimg/chitato.jpeg'     },
      { id:5,  nama:'Indomie Goreng 1 Dus',  harga:95000,  stok:150, min_order:10, img:'srcimg/indomie.jpg'     },
      { id:6,  nama:'Celana Kargo Pria',     harga:85000,  stok:100, min_order:6,  img:'srcimg/celana.jpeg' },
      { id:7,  nama:'Gula Pasir 1kg',        harga:14000,  stok:800, min_order:12, img:'srcimg/gula.jpeg'        },
      { id:8,  nama:'Oreo Original 1 Pak',   harga:11000,  stok:1500, min_order:12, img:'srcimg/oreo.jpeg'        },
      { id:9,  nama:'Biskuit Roma Kelapa',   harga:8500,   stok:2000, min_order:12, img:'srcimg/roma.jpeg' },
      { id:10, nama:'Saus Sambal Botol',     harga:12000,  stok:600, min_order:12, img:'srcimg/saos.jpeg'        },
    ];

    const VOUCHER = {
      'GROCEER10' : { tipe:'persen',  nilai:10,    min:50000,  label:'Diskon 10%' },
      'GROSIR20'  : { tipe:'persen',  nilai:20,    min:100000, label:'Diskon 20%' },
      'HEMAT50'   : { tipe:'nominal', nilai:50000, min:200000, label:'Potongan Rp50.000' },
      'NEWUSER'   : { tipe:'persen',  nilai:15,    min:0,      label:'Diskon 15% New User' },
    };

    let keranjang   = JSON.parse(localStorage.getItem('groceer_cart') || '{}');
    let dipilih     = {};
    let diskonAktif = null;

    function rp(n) { return 'Rp ' + n.toLocaleString('id-ID'); }

    function goBack() {
      if (document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = 'dashboard.html';
      }
    }

    function cekValidasiMinOrder(id, qty) {
      const produk = dataProduk.find(p => p.id === id);
      if (!produk) return true;
      if (qty < produk.min_order) {
        tampilToast(`⚠️ Minimal pembelian ${produk.nama} adalah ${produk.min_order} pcs`);
        return false;
      }
      if (qty > produk.stok) {
        tampilToast(`⚠️ Stok ${produk.nama} hanya tersisa ${produk.stok} pcs`);
        return false;
      }
      return true;
    }

    function render() {
      const main = document.getElementById('mainContent');
      const ids  = Object.keys(keranjang).map(Number);

      if (ids.length === 0) {
        document.getElementById('checkoutBar').style.display = 'none';
        main.innerHTML = `
          <div class="keranjang-kosong">
            <i class="fas fa-shopping-cart"></i>
            <h3>Keranjang Masih Kosong</h3>
            <p>Yuk, tambahkan produk ke keranjangmu!</p>
            <button class="btn-belanja" onclick="window.location.href='dashboard.html'">
              <i class="fas fa-store"></i> Mulai Belanja
            </button>
          </div>`;
        return;
      }

      document.getElementById('checkoutBar').style.display = 'block';

      ids.forEach(id => { 
        if (dipilih[id] === undefined) dipilih[id] = true; 
      });

      // Cek item yang tidak memenuhi min order
      const belowMinOrder = ids.filter(id => {
        const p = dataProduk.find(prod => prod.id === id);
        return p && keranjang[id] < p.min_order;
      });

      const semuaDipilih = ids.every(id => dipilih[id]);
      let html = '';
      
      if (belowMinOrder.length > 0) {
        html += `<div class="warning-min-order">
          <i class="fas fa-exclamation-triangle"></i> 
          ${belowMinOrder.length} produk belum mencapai minimal pembelian. 
          Harap sesuaikan quantity!
        </div>`;
      }

      html += `
        <div class="pilih-semua-wrap">
          <input type="checkbox" id="chkSemua"
            ${semuaDipilih ? 'checked' : ''}
            onchange="pilihSemua(this.checked)">
          <label for="chkSemua">Pilih Semua</label>
          <span class="jml-dipilih">${ids.filter(id=>dipilih[id]).length} dari ${ids.length} dipilih</span>
        </div>`;

      ids.forEach(id => {
        const produk = dataProduk.find(p => p.id === id);
        if (!produk) return;
        const qty      = keranjang[id];
        const subtotal = produk.harga * qty;
        const isMinOrderValid = qty >= produk.min_order;

        html += `
          <div class="cart-item" id="item-${id}">
            <div class="item-check ${dipilih[id] ? 'checked' : ''}"
                 onclick="togglePilih(${id})"></div>
            <div class="item-img">
              <img src="${produk.img}" alt="${produk.nama}"
                   onerror="this.parentElement.innerHTML='🛒'">
            </div>
            <div class="item-info">
              <div class="item-nama">${produk.nama}</div>
              <div class="item-harga">${rp(produk.harga)}<span style="font-size:11px;font-weight:400;color:#999"> /pcs</span></div>
              <div class="item-min-order" style="color:${isMinOrderValid ? '#4caf50' : '#f9a825'}">
                <i class="fas fa-box"></i> Min. ${produk.min_order} pcs
                ${!isMinOrderValid ? '⚠️ Belum mencapai minimal' : '✅ OK'}
              </div>
              <div class="item-subtotal">Subtotal: <b style="color:var(--hijau)">${rp(subtotal)}</b></div>
              <div class="qty-wrap">
                <button class="qty-btn" onclick="ubahQty(${id},-1)" ${qty<=1?'disabled':''}>−</button>
                <div class="qty-num">${qty}</div>
                <button class="qty-btn" onclick="ubahQty(${id},1)" ${qty>=produk.stok?'disabled':''}>+</button>
              </div>
            </div>
            <button class="btn-hapus" onclick="hapusItem(${id})" title="Hapus">
              <i class="fas fa-times"></i>
            </button>
          </div>`;
      });

      html += `
        <div class="voucher-wrap">
          <div class="voucher-title">
            <i class="fas fa-tag"></i> Kode Voucher / Diskon
          </div>
          <div class="voucher-row">
            <input type="text" class="voucher-input" id="inputVoucher"
                   placeholder="Contoh: GROCEER10"
                   value="${diskonAktif ? diskonAktif.kode : ''}">
            <button class="btn-pakai-voucher" onclick="pakaiVoucher()">
              ${diskonAktif ? 'Ganti' : 'Pakai'}
            </button>
          </div>
          <div class="voucher-status ${diskonAktif ? 'ok' : ''}" id="voucherStatus">
            ${diskonAktif ? `✅ ${diskonAktif.label} berhasil diterapkan!` : ''}
          </div>
          <div style="font-size:11px;color:#aaa;margin-top:6px;">
            Voucher tersedia: GROCEER10 · GROSIR20 · HEMAT50 · NEWUSER
          </div>
        </div>`;

      const subtotalTotal = hitungSubtotal();
      const diskon        = hitungDiskon(subtotalTotal);
      const total         = subtotalTotal - diskon;

      html += `
        <div class="ringkasan">
          <div class="ringkasan-title">📋 Ringkasan Belanja</div>
          <div class="ringkasan-row">
            <span>Subtotal (${ids.filter(id=>dipilih[id]).length} produk)</span>
            <span>${rp(subtotalTotal)}</span>
          </div>
          <div class="ringkasan-row">
            <span>Ongkos Kirim</span>
            <span style="color:var(--hijau);font-weight:600">GRATIS</span>
          </div>
          ${diskon > 0 ? `
          <div class="ringkasan-row diskon">
            <span>Diskon Voucher (${diskonAktif.label})</span>
            <span>-${rp(diskon)}</span>
          </div>` : ''}
          <div class="ringkasan-row total">
            <span>Total</span>
            <span>${rp(total)}</span>
          </div>
        </div>`;

      main.innerHTML = html;

      document.getElementById('checkoutTotal').textContent = rp(total);
      
      const adaDipilih = ids.some(id => dipilih[id]);
      const semuaValid = ids.filter(id => dipilih[id]).every(id => {
        const p = dataProduk.find(prod => prod.id === id);
        return p && keranjang[id] >= p.min_order;
      });
      
      document.getElementById('btnCheckout').disabled = !adaDipilih || !semuaValid;
    }

    function hitungSubtotal() {
      return Object.keys(keranjang).map(Number).reduce((sum, id) => {
        if (!dipilih[id]) return sum;
        const p = dataProduk.find(x => x.id === id);
        return sum + (p ? p.harga * keranjang[id] : 0);
      }, 0);
    }

    function hitungDiskon(subtotal) {
      if (!diskonAktif) return 0;
      if (subtotal < diskonAktif.min) return 0;
      if (diskonAktif.tipe === 'persen') {
        return Math.round(subtotal * diskonAktif.nilai / 100);
      }
      return diskonAktif.nilai;
    }

    function ubahQty(id, delta) {
      const p = dataProduk.find(x => x.id === id);
      if (!p) return;
      
      const baru = (keranjang[id] || 1) + delta;
      if (baru < 1) { 
        hapusItem(id); 
        return; 
      }
      if (baru > p.stok) {
        tampilToast(`⚠️ Stok ${p.nama} hanya tersisa ${p.stok} pcs!`);
        return;
      }
      
      keranjang[id] = baru;
      simpanKeranjang();
      
      // Trigger event untuk update
      window.dispatchEvent(new CustomEvent('cart-updated'));
      
      render();
    }

    function hapusItem(id) {
      delete keranjang[id];
      delete dipilih[id];
      simpanKeranjang();
      window.dispatchEvent(new CustomEvent('cart-updated'));
      tampilToast('Produk dihapus dari keranjang');
      render();
    }

    function kosongkanKeranjang() {
      if (Object.keys(keranjang).length === 0) {
        tampilToast('Keranjang sudah kosong!'); 
        return;
      }
      if (confirm('Kosongkan semua item dari keranjang?')) {
        keranjang = {}; 
        dipilih = {};
        simpanKeranjang();
        window.dispatchEvent(new CustomEvent('cart-updated'));
        render();
        tampilToast('Keranjang berhasil dikosongkan');
      }
    }

    function togglePilih(id) {
      dipilih[id] = !dipilih[id];
      render();
    }
    
    function pilihSemua(val) {
      Object.keys(keranjang).forEach(id => { dipilih[id] = val; });
      render();
    }

    function pakaiVoucher() {
      const kode   = document.getElementById('inputVoucher').value.trim().toUpperCase();
      const status = document.getElementById('voucherStatus');

      if (!kode) {
        status.className = 'voucher-status err';
        status.textContent = '⚠️ Masukkan kode voucher terlebih dahulu!';
        return;
      }

      const v = VOUCHER[kode];
      if (!v) {
        status.className = 'voucher-status err';
        status.textContent = '❌ Kode voucher tidak valid atau sudah expired!';
        diskonAktif = null;
        render();
        return;
      }

      const subtotal = hitungSubtotal();
      if (subtotal < v.min) {
        status.className = 'voucher-status err';
        status.textContent = `⚠️ Min. belanja ${rp(v.min)} untuk pakai voucher ini!`;
        return;
      }

      diskonAktif = { ...v, kode };
      tampilToast(`🎉 Voucher ${kode} berhasil dipakai!`);
      render();
    }

    function checkout() {
      const dipilihIds = Object.keys(keranjang).map(Number).filter(id => dipilih[id]);
      if (dipilihIds.length === 0) {
        tampilToast('Pilih minimal 1 produk dulu!'); 
        return;
      }
      
      // Validasi min order untuk semua item yang dipilih
      const invalidItems = dipilihIds.filter(id => {
        const p = dataProduk.find(prod => prod.id === id);
        return p && keranjang[id] < p.min_order;
      });
      
      if (invalidItems.length > 0) {
        tampilToast(`⚠️ ${invalidItems.length} produk belum mencapai minimal pembelian!`);
        return;
      }
      
      // Validasi stok
      const outOfStock = dipilihIds.filter(id => {
        const p = dataProduk.find(prod => prod.id === id);
        return p && keranjang[id] > p.stok;
      });
      
      if (outOfStock.length > 0) {
        tampilToast(`⚠️ Stok tidak mencukupi untuk beberapa produk!`);
        return;
      }

      const sesiRaw = sessionStorage.getItem('groceer_logged_in');
      const user    = sesiRaw ? JSON.parse(sesiRaw) : { nama: 'Guest' };

      const subtotal  = hitungSubtotal();
      const diskon    = hitungDiskon(subtotal);
      const total     = subtotal - diskon;
      const noOrder   = 'GRC-' + Date.now().toString().slice(-8);
      const tgl       = new Date().toLocaleDateString('id-ID', {
                          day:'numeric', month:'long', year:'numeric'
                        });

      const items = dipilihIds.map(id => ({
        id, 
        nama: dataProduk.find(p=>p.id===id)?.nama, 
        qty: keranjang[id],
        harga: dataProduk.find(p=>p.id===id)?.harga
      }));

      let pesanan = JSON.parse(localStorage.getItem('groceer_pesanan') || '[]');
      pesanan.unshift({
        id     : noOrder,
        items  : items,
        total, 
        diskon, 
        status: 'Menunggu Pembayaran', 
        tanggal: tgl,
        pembeli: user.nama,
        noResi: null
      });
      localStorage.setItem('groceer_pesanan', JSON.stringify(pesanan));

      dipilihIds.forEach(id => { 
        // Kurangi stok (simulasi)
        const pIndex = dataProduk.findIndex(p => p.id === id);
        if (pIndex !== -1) {
          dataProduk[pIndex].stok -= keranjang[id];
        }
        delete keranjang[id]; 
        delete dipilih[id]; 
      });
      simpanKeranjang();
      window.dispatchEvent(new CustomEvent('cart-updated'));

      document.getElementById('noOrder').textContent    = noOrder;
      document.getElementById('totalOrder').textContent = rp(total);
      document.getElementById('tglOrder').textContent   = tgl;
      document.getElementById('modalSukses').classList.add('show');
    }

    function selesaiCheckout() {
      document.getElementById('modalSukses').classList.remove('show');
      render();
    }

    function simpanKeranjang() {
      localStorage.setItem('groceer_cart', JSON.stringify(keranjang));
    }

    function tampilToast(pesan) {
      const t = document.getElementById('toast');
      t.textContent = pesan;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2200);
    }

    render();