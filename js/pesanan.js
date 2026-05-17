    function rp(n) { return 'Rp ' + Number(n).toLocaleString('id-ID'); }

    function getPesanan() {
      const raw = localStorage.getItem('groceer_pesanan');
      if (!raw) return [];
      try { return JSON.parse(raw); } catch { return []; }
    }

    // ── SEED DATA DEMO ──
    function seedDemo() {
      if (localStorage.getItem('groceer_pesanan')) return;
      const demo = [
        {
          id: 'GRC-00000001',
          items: [
            { id:3, nama:'Minyak Goreng 2L',      qty:12, harga:26000, img:'srcimg/minyak.jpeg' },
            { id:7, nama:'Gula Pasir 1kg',         qty:6,  harga:14000, img:'srcimg/gula.jpeg'  },
          ],
          total: 396000, diskon:0,
          status: 'Dikirim', tanggal: '15 Mei 2026', pembeli:'Demo User'
        },
        {
          id: 'GRC-00000002',
          items: [{ id:5, nama:'Indomie Goreng 1 Dus', qty:2, harga:95000, img:'srcimg/indomie.jpg' }],
          total: 190000, diskon:0,
          status: 'Menunggu Pembayaran', tanggal: '16 Mei 2026', pembeli:'Demo User'
        },
        {
          id: 'GRC-00000003',
          items: [{ id:4, nama:'Chitato Sapi Panggang', qty:24, harga:13000, img:'srcimg/chitato.jpeg' }],
          total: 312000, diskon:0,
          status: 'Selesai', tanggal: '10 Mei 2026', pembeli:'Demo User'
        },
        {
          id: 'GRC-00000004',
          items: [{ id:8, nama:'Oreo Original 1 Pak', qty:12, harga:11000, img:'srcimg/oreo.jpeg' }],
          total: 132000, diskon:0,
          status: 'Diproses', tanggal: '17 Mei 2026', pembeli:'Demo User'
        },
      ];
      localStorage.setItem('groceer_pesanan', JSON.stringify(demo));
    }

    // ── TRACKER STEP ──
    const STEPS = ['Menunggu Pembayaran','Diproses','Dikirim','Selesai'];
    function stepIndex(status) { return STEPS.indexOf(status); }

    function trackerHTML(status) {
      if (status === 'Dibatalkan') return '';
      const cur = stepIndex(status);
      const labels = ['Menunggu','Diproses','Dikirim','Selesai'];
      const icons  = ['clock','spinner','truck','check-circle'];
      let html = '<div class="tracker"><div class="tracker-title">📦 Status Pengiriman</div><div class="tracker-steps">';
      labels.forEach((lbl, i) => {
        const cls = i < cur ? 'done' : i === cur ? 'aktif' : '';
        html += `<div class="step">
          <div class="step-dot ${cls}"><i class="fas fa-${icons[i]}" style="font-size:10px"></i></div>
          <div class="step-label">${lbl}</div>
        </div>`;
        if (i < labels.length - 1) {
          html += `<div class="step-line ${i < cur ? 'done' : ''}"></div>`;
        }
      });
      html += '</div></div>';
      return html;
    }

    // ── TOMBOL AKSI SESUAI STATUS ──
    function aksiHTML(pesanan) {
      const s = pesanan.status;
      const id = pesanan.id;
      if (s === 'Menunggu Pembayaran') return `
        <div class="order-actions">
          <button class="btn-aksi danger" onclick="batalPesanan('${id}')">Batalkan</button>
          <button class="btn-aksi fill" onclick="bayarPesanan('${id}')">
            <i class="fas fa-credit-card"></i> Bayar Sekarang
          </button>
        </div>`;
      if (s === 'Dikirim') return `
        <div class="order-actions">
          <button class="btn-aksi outline" onclick="lacakPesanan('${id}')">
            <i class="fas fa-map-marker-alt"></i> Lacak
          </button>
          <button class="btn-aksi fill" onclick="terimaPesanan('${id}')">
            Pesanan Diterima ✓
          </button>
        </div>`;
      if (s === 'Selesai') return `
        <div class="order-actions">
          <button class="btn-aksi outline" onclick="beliLagi('${id}')">
            <i class="fas fa-redo"></i> Beli Lagi
          </button>
          <button class="btn-aksi fill" onclick="tampilToast('Fitur ulasan segera hadir!')">
            <i class="fas fa-star"></i> Beri Ulasan
          </button>
        </div>`;
      if (s === 'Diproses') return `
        <div class="order-actions">
          <button class="btn-aksi outline" onclick="tampilToast('Pesanan sedang diproses penjual')">
            <i class="fas fa-info-circle"></i> Detail
          </button>
        </div>`;
      return '';
    }

    // ── RENDER ──
    let tabAktif = 'semua';

    function render() {
      const semua = getPesanan();
      const list  = tabAktif === 'semua'
        ? semua
        : semua.filter(p => p.status === tabAktif);

      const main = document.getElementById('mainContent');

      if (list.length === 0) {
        main.innerHTML = `
          <div class="kosong">
            <i class="fas fa-box-open"></i>
            <h3>Belum Ada Pesanan</h3>
            <p>${tabAktif === 'semua' ? 'Kamu belum pernah melakukan pembelian.' : `Tidak ada pesanan dengan status "${tabAktif}".`}</p>
            <button class="btn-belanja" onclick="window.location.href='dashboard.html'">
              <i class="fas fa-store"></i> Mulai Belanja
            </button>
          </div>`;
        return;
      }

      main.innerHTML = list.map(p => {
        const statusClass = {
          'Menunggu Pembayaran':'s-menunggu',
          'Diproses':'s-diproses',
          'Dikirim':'s-dikirim',
          'Selesai':'s-selesai',
          'Dibatalkan':'s-dibatalkan'
        }[p.status] || '';

        // Render items
        const itemsHTML = (p.items || []).map(item => `
          <div class="order-item">
            <div class="item-img">
              <img src="${item.img || ''}" alt="${item.nama}"
                   onerror="this.parentElement.innerHTML='🛒'">
            </div>
            <div>
              <div class="item-nama">${item.nama}</div>
              <div class="item-qty">${item.qty} pcs × ${rp(item.harga)}</div>
            </div>
            <div class="item-harga">${rp(item.harga * item.qty)}</div>
          </div>`).join('');

        // Kalau format lama (dari beliSekarang dashboard)
        const itemsHTMLLama = (!p.items && p.produk) ? `
          <div class="order-item">
            <div class="item-img">
              <img src="${p.img || ''}" alt="${p.produk}"
                   onerror="this.parentElement.innerHTML='🛒'">
            </div>
            <div>
              <div class="item-nama">${p.produk}</div>
              <div class="item-qty">1 pcs × ${rp(p.harga)}</div>
            </div>
            <div class="item-harga">${rp(p.harga)}</div>
          </div>` : '';

        return `
          <div class="order-card">
            <div class="order-head">
              <div>
                <div class="order-no">${p.id}</div>
                <div class="order-tgl">${p.tanggal}</div>
              </div>
              <span class="status-badge ${statusClass}">${p.status}</span>
            </div>
            <div class="order-items">
              ${itemsHTML || itemsHTMLLama}
            </div>
            ${trackerHTML(p.status)}
            <div class="order-foot">
              <div>
                <div class="total-label">Total Pembayaran</div>
                <div class="total-val">${rp(p.total || p.harga)}</div>
              </div>
            </div>
            ${aksiHTML(p)}
          </div>`;
      }).join('');
    }

    // ── TAB ──
    function gantiTab(tab, el) {
      tabAktif = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      render();
    }

    // ── AKSI PESANAN ──
    function batalPesanan(id) {
      if (!confirm('Yakin ingin membatalkan pesanan ini?')) return;
      let pesanan = getPesanan();
      const p = pesanan.find(x => x.id === id);
      if (p) {
        p.status = 'Dibatalkan';
        localStorage.setItem('groceer_pesanan', JSON.stringify(pesanan));
        tampilToast('Pesanan berhasil dibatalkan');
        render();
      }
    }

    function bayarPesanan(id) {
      let pesanan = getPesanan();
      const p = pesanan.find(x => x.id === id);
      if (p) {
        p.status = 'Diproses';
        localStorage.setItem('groceer_pesanan', JSON.stringify(pesanan));
        tampilToast('✅ Pembayaran berhasil! Pesanan sedang diproses.');
        render();
      }
    }

    function terimaPesanan(id) {
      if (!confirm('Konfirmasi pesanan sudah diterima?')) return;
      let pesanan = getPesanan();
      const p = pesanan.find(x => x.id === id);
      if (p) {
        p.status = 'Selesai';
        localStorage.setItem('groceer_pesanan', JSON.stringify(pesanan));
        tampilToast('🎉 Pesanan selesai! Terima kasih sudah berbelanja.');
        render();
      }
    }

    function lacakPesanan(id) {
      tampilToast('🚚 Pesanan dalam perjalanan ke lokasimu!');
    }

    function beliLagi(id) {
      window.location.href = 'dashboard.html';
    }

    // ── TOAST ──
    function tampilToast(pesan) {
      const t = document.getElementById('toast');
      t.textContent = pesan;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }

    // ── INIT ──
    seedDemo();
    render();