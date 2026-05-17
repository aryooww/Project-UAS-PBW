    const TIPE_CONFIG = {
      chat     : { icon:'💬', cls:'icon-chat',    label:'Pesan' },
      pesanan  : { icon:'📦', cls:'icon-pesanan', label:'Pesanan' },
      promo    : { icon:'🏷️', cls:'icon-promo',   label:'Promo' },
      pembayaran:{ icon:'💳', cls:'icon-bayar',   label:'Pembayaran' },
      produk   : { icon:'🛒', cls:'icon-produk',  label:'Produk' },
      akun     : { icon:'👤', cls:'icon-akun',    label:'Akun' },
    };

    // ── SEED DATA DEMO ──
    function seedNotif() {
      if (localStorage.getItem('groceer_notif')) return;
      const now = Date.now();
      const notifs = [
        { id:1, tipe:'chat',      judul:'Pesan dari Toko Groceer Pusat',         isi:'Halo! Terima kasih sudah menghubungi kami. Stok beras 5kg masih tersedia.',          waktu: now - 300000,   dibaca:false, link:'chat.html' },
        { id:2, tipe:'pesanan',   judul:'Pesanan Sedang Dikirim',                 isi:'Pesanan GRC-00000001 kamu sedang dalam perjalanan. Estimasi tiba 1-2 hari kerja.',  waktu: now - 3600000,  dibaca:false, link:'pesanan.html' },
        { id:3, tipe:'promo',     judul:'Flash Sale Hari Ini! Diskon 20%',        isi:'Jangan lewatkan promo spesial untuk produk kebutuhan pokok. Berlaku sampai jam 23:59.', waktu: now - 7200000, dibaca:false, link:'dashboard.html' },
        { id:4, tipe:'pembayaran',judul:'Pembayaran Berhasil',                    isi:'Pesanan GRC-00000003 sudah dibayar. Terima kasih telah berbelanja di Groceer!',     waktu: now - 86400000, dibaca:true,  link:'pesanan.html' },
        { id:5, tipe:'chat',      judul:'Pesan dari Supplier Makmur',             isi:'Promo hari ini: diskon 15% untuk pembelian minyak goreng minimal 12 pcs!',          waktu: now - 86400000, dibaca:true,  link:'chat.html' },
        { id:6, tipe:'pesanan',   judul:'Pesanan Selesai',                        isi:'Pesanan GRC-00000003 telah selesai. Beri ulasan untuk membantu pembeli lain.',      waktu: now - 172800000,dibaca:true,  link:'pesanan.html' },
        { id:7, tipe:'promo',     judul:'Voucher Baru: GROSIR20',                 isi:'Kamu dapat voucher diskon 20% untuk pembelian min. Rp100.000. Berlaku 7 hari.',    waktu: now - 172800000,dibaca:true,  link:'dashboard.html' },
        { id:8, tipe:'akun',      judul:'Selamat Datang di Groceer! 🎉',          isi:'Akun kamu berhasil dibuat. Mulai belanja grosir dengan harga terbaik sekarang!',   waktu: now - 259200000,dibaca:true,  link:'dashboard.html' },
        { id:9, tipe:'produk',    judul:'Stok Minyak Goreng Kembali Tersedia',    isi:'Produk yang kamu lihat sebelumnya kini kembali tersedia. Segera pesan sebelum habis!', waktu: now - 345600000, dibaca:true, link:'dashboard.html' },
        { id:10,tipe:'pembayaran',judul:'Menunggu Pembayaran',                    isi:'Pesanan GRC-00000002 belum dibayar. Selesaikan pembayaran sebelum 24 jam.',         waktu: now - 3600000,  dibaca:false, link:'pesanan.html' },
      ];
      localStorage.setItem('groceer_notif', JSON.stringify(notifs));
    }

    function getNotif() {
      try { return JSON.parse(localStorage.getItem('groceer_notif') || '[]'); } catch { return []; }
    }
    function simpanNotif(data) { localStorage.setItem('groceer_notif', JSON.stringify(data)); }

    // ── FORMAT WAKTU ──
    function formatWaktu(ts) {
      const diff = Date.now() - ts;
      const m = Math.floor(diff / 60000);
      const h = Math.floor(diff / 3600000);
      const d = Math.floor(diff / 86400000);
      if (m < 1)  return 'Baru saja';
      if (m < 60) return `${m} menit lalu`;
      if (h < 24) return `${h} jam lalu`;
      if (d < 7)  return `${d} hari lalu`;
      return new Date(ts).toLocaleDateString('id-ID', { day:'numeric', month:'short' });
    }

    function formatTanggal(ts) {
      const d   = new Date(ts);
      const now = new Date();
      const diff = Math.floor((now - d) / 86400000);
      if (diff === 0) return 'Hari Ini';
      if (diff === 1) return 'Kemarin';
      return d.toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
    }

    // ── RENDER ──
    let filterAktif = 'semua';

    function render() {
      let data = getNotif();
      if (filterAktif !== 'semua') data = data.filter(n => n.tipe === filterAktif);
      data.sort((a,b) => b.waktu - a.waktu);

      const main = document.getElementById('mainContent');
      if (data.length === 0) {
        main.innerHTML = `
          <div class="kosong">
            <i class="fas fa-bell-slash"></i>
            <p>Belum ada notifikasi</p>
          </div>`;
        return;
      }

      // Kelompokkan per tanggal
      const groups = {};
      data.forEach(n => {
        const tgl = formatTanggal(n.waktu);
        if (!groups[tgl]) groups[tgl] = [];
        groups[tgl].push(n);
      });

      let html = '';
      Object.entries(groups).forEach(([tgl, items]) => {
        html += `<div class="date-group"><div class="date-label">${tgl}</div></div>`;
        items.forEach(n => {
          const cfg = TIPE_CONFIG[n.tipe] || TIPE_CONFIG.akun;
          html += `
            <div class="notif-item ${n.dibaca ? '' : 'unread'}"
                 onclick="klikNotif(${n.id})">
              <div class="notif-icon ${cfg.cls}">${cfg.icon}</div>
              <div class="notif-body">
                <div class="notif-judul">${n.judul}</div>
                <div class="notif-isi">${n.isi}</div>
                <div class="notif-waktu">${formatWaktu(n.waktu)}</div>
              </div>
              <div class="notif-meta">
                <span style="font-size:10px;color:#bbb">${cfg.label}</span>
                ${!n.dibaca ? '<div class="unread-dot"></div>' : ''}
              </div>
            </div>`;
        });
      });

      main.innerHTML = html;
      updateBadge();
    }

    // ── KLIK NOTIF ──
    function klikNotif(id) {
      let data = getNotif();
      const n  = data.find(x => x.id === id);
      if (!n) return;
      n.dibaca = true;
      simpanNotif(data);

      if (n.link) {
        window.location.href = n.link;
      } else {
        render();
      }
    }

    // ── BACA SEMUA ──
    function bacaSemua() {
      let data = getNotif();
      data.forEach(n => { n.dibaca = true; });
      simpanNotif(data);
      render();
      tampilToast('Semua notifikasi sudah dibaca');
    }

    // ── FILTER ──
    function gantiFilter(filter, el) {
      filterAktif = filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      render();
    }

    // ── UPDATE BADGE ──
    function updateBadge() {
      const unread = getNotif().filter(n => !n.dibaca).length;
      // Tidak ada badge di halaman ini tapi bisa dipakai
    }

    // ── TOAST ──
    function tampilToast(pesan) {
      const t = document.getElementById('toast');
      t.textContent = pesan;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2200);
    }

    // ── INIT ──
    seedNotif();
    render();