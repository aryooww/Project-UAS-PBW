    const PENJUAL = [
      { id:'s1', nama:'Toko Groceer Pusat',   inisial:'G', warna:'#2e7d32', toko:'Pusat Grosir Jakarta',   online:true  },
      { id:'s2', nama:'Supplier Makmur',       inisial:'M', warna:'#1565c0', toko:'Grosir Sembako Murah',   online:true  },
      { id:'s3', nama:'CV Berkah Bersama',     inisial:'B', warna:'#6a1b9a', toko:'Distributor Makanan',    online:false },
      { id:'s4', nama:'Toko Sumber Rejeki',    inisial:'S', warna:'#e65100', toko:'Grosir Pakaian Murah',   online:true  },
    ];

    const BALASAN_AUTO = [
      'Halo! Terima kasih sudah menghubungi kami 😊',
      'Baik, kami akan segera proses pesanan Anda.',
      'Untuk pembelian grosir, ada harga spesial nih! Mau info lebih lanjut?',
      'Stok masih tersedia. Mau pesan berapa unit?',
      'Oke, kami konfirmasi ya. Mohon tunggu sebentar 🙏',
      'Pengiriman bisa same-day jika order sebelum jam 12 siang.',
      'Ada promo menarik hari ini! Diskon 15% untuk pembelian di atas 100 pcs.',
      'Terima kasih sudah berbelanja di toko kami! 🛒',
    ];

    let penjualAktif  = null;
    let semuaChat     = JSON.parse(localStorage.getItem('groceer_chats') || '{}');

    const sesiRaw = sessionStorage.getItem('groceer_logged_in');
    const USER    = sesiRaw ? JSON.parse(sesiRaw) : { nama:'Kamu', email:'' };
    const USER_INISIAL = USER.nama ? USER.nama[0].toUpperCase() : 'K';

    function simpanChat() {
      localStorage.setItem('groceer_chats', JSON.stringify(semuaChat));
    }

    function formatWaktu(ts) {
      const d = new Date(ts);
      return d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' });
    }
    function formatTanggal(ts) {
      const d   = new Date(ts);
      const now = new Date();
      const diff = Math.floor((now - d) / 86400000);
      if (diff === 0) return 'Hari ini';
      if (diff === 1) return 'Kemarin';
      return d.toLocaleDateString('id-ID', { day:'numeric', month:'long' });
    }
    function formatPreview(ts) {
      const d   = new Date(ts);
      const now = new Date();
      const diff = Math.floor((now - d) / 86400000);
      if (diff === 0) return formatWaktu(ts);
      if (diff === 1) return 'Kemarin';
      return d.toLocaleDateString('id-ID', { day:'numeric', month:'short' });
    }

    function renderInbox(filter='') {
      const list = document.getElementById('inboxList');
      const sub  = document.getElementById('inboxSub');

      let tampil = PENJUAL.filter(p =>
        p.nama.toLowerCase().includes(filter.toLowerCase())
      );

      tampil.sort((a,b) => {
        const ca = semuaChat[a.id]; const cb = semuaChat[b.id];
        if (ca && !cb) return -1;
        if (!ca && cb) return 1;
        if (ca && cb) return cb[cb.length-1].waktu - ca[ca.length-1].waktu;
        return 0;
      });

      sub.textContent = `${tampil.length} percakapan`;

      if (tampil.length === 0) {
        list.innerHTML = `
          <div style="text-align:center;padding:60px 20px;color:#aaa;">
            <i class="fas fa-comment-slash" style="font-size:48px;margin-bottom:12px;display:block"></i>
            <p>Tidak ada percakapan ditemukan</p>
          </div>`;
        return;
      }

      list.innerHTML = tampil.map(p => {
        const msgs    = semuaChat[p.id] || [];
        const last    = msgs[msgs.length-1];
        const unread  = msgs.filter(m => m.dari === 'seller' && !m.dibaca).length;
        const preview = last
          ? (last.dari === 'user' ? `Kamu: ${last.teks}` : last.teks)
          : 'Mulai percakapan baru...';
        const waktu   = last ? formatPreview(last.waktu) : '';

        return `
          <div class="chat-item ${unread>0?'unread':''}"
               onclick="bukaChat('${p.id}')">
            <div class="seller-avatar" style="background:${p.warna}">
              ${p.inisial}
              ${p.online ? '<div class="online-dot"></div>' : ''}
            </div>
            <div class="chat-info">
              <div class="chat-nama">${p.nama}</div>
              <div class="chat-preview">${preview}</div>
            </div>
            <div class="chat-meta">
              <div class="chat-waktu">${waktu}</div>
              ${unread > 0
                ? `<span class="badge-unread">${unread}</span>`
                : ''}
            </div>
          </div>`;
      }).join('');
    }

    function filterInbox() {
      renderInbox(document.getElementById('searchInbox').value);
    }

    function bukaChat(sellerId) {
      penjualAktif = PENJUAL.find(p => p.id === sellerId);
      if (!penjualAktif) return;

      if (semuaChat[sellerId]) {
        semuaChat[sellerId].forEach(m => { if (m.dari==='seller') m.dibaca = true; });
        simpanChat();
      }

      const av = document.getElementById('chatAvatarSm');
      av.textContent    = penjualAktif.inisial;
      av.style.background = penjualAktif.warna;
      document.getElementById('chatNamaSm').textContent = penjualAktif.nama;
      document.getElementById('chatStatus').textContent =
        penjualAktif.online ? '● Online' : '○ Offline';

      document.getElementById('halamanInbox').style.display = 'none';
      document.getElementById('halamanChat').style.display  = 'flex';

      renderPesan();
      scrollBawah();
    }

    function renderPesan() {
      const msgs    = semuaChat[penjualAktif.id] || [];
      const area    = document.getElementById('chatMessages');
      let   html    = '';
      let   tglPrev = '';

      if (msgs.length === 0) {
        html = `
          <div style="text-align:center;padding:40px 20px;color:#aaa;">
            <div style="font-size:48px;margin-bottom:12px;">💬</div>
            <p style="font-size:13px;">Mulai percakapan dengan ${penjualAktif.nama}</p>
            <p style="font-size:12px;margin-top:4px;color:#bbb">Tanyakan produk, harga grosir, atau ketersediaan stok</p>
          </div>`;
      } else {
        msgs.forEach(m => {
          const tgl = formatTanggal(m.waktu);
          if (tgl !== tglPrev) {
            html += `<div class="date-divider"><span>${tgl}</span></div>`;
            tglPrev = tgl;
          }

          if (m.dari === 'user') {
            html += `
              <div class="msg-wrap sent">
                <div class="bubble sent">
                  <div class="bubble-text">${m.teks}</div>
                  <div class="bubble-time">
                    ${formatWaktu(m.waktu)}
                    <span class="read-tick ${m.dibaca?'read':'unread'}">
                      ${m.dibaca ? '✓✓' : '✓'}
                    </span>
                  </div>
                </div>
                <div class="msg-avatar" style="background:#43a047">${USER_INISIAL}</div>
              </div>`;
          } else {
            html += `
              <div class="msg-wrap received">
                <div class="msg-avatar" style="background:${penjualAktif.warna}">
                  ${penjualAktif.inisial}
                </div>
                <div class="bubble received">
                  <div class="bubble-text">${m.teks}</div>
                  <div class="bubble-time">${formatWaktu(m.waktu)}</div>
                </div>
              </div>`;
          }
        });
      }

      html += `
        <div class="typing-indicator" id="typingIndicator">
          <div class="msg-avatar" style="background:${penjualAktif.warna}">
            ${penjualAktif.inisial}
          </div>
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>`;

      area.innerHTML = html;
    }

    function kirimPesan() {
      const input = document.getElementById('inputPesan');
      const teks  = input.value.trim();
      if (!teks) return;

      if (!semuaChat[penjualAktif.id]) semuaChat[penjualAktif.id] = [];

      semuaChat[penjualAktif.id].push({
        dari:'user', teks, waktu:Date.now(), dibaca:false
      });
      simpanChat();

      input.value = '';
      input.style.height = 'auto';
      renderPesan();
      scrollBawah();

      const indicator = document.getElementById('typingIndicator');
      if (indicator) indicator.classList.add('show');
      scrollBawah();

      setTimeout(() => {
        const balasan = BALASAN_AUTO[Math.floor(Math.random() * BALASAN_AUTO.length)];
        semuaChat[penjualAktif.id].push({
          dari:'seller', teks:balasan, waktu:Date.now(), dibaca:true
        });
        simpanChat();
        renderPesan();
        scrollBawah();
      }, 2000 + Math.random() * 1500);
    }

    function handleEnter(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        kirimPesan();
      }
    }
    function autoResize(el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 100) + 'px';
    }
    function scrollBawah() {
      const area = document.getElementById('chatMessages');
      if (area) setTimeout(() => { area.scrollTop = area.scrollHeight; }, 50);
    }

    function kembaliInbox() {
      penjualAktif = null;
      document.getElementById('halamanChat').style.display  = 'none';
      document.getElementById('halamanInbox').style.display = 'flex';
      renderInbox();
    }

    function bukaModalPenjual() {
      const list = document.getElementById('listPenjual');
      list.innerHTML = PENJUAL.map(p => `
        <div class="seller-option" onclick="mulaiChatBaru('${p.id}')">
          <div class="seller-option-avatar" style="background:${p.warna}">${p.inisial}</div>
          <div class="seller-option-info">
            <div class="nama">${p.nama}</div>
            <div class="toko">${p.toko} ${p.online?'<span style="color:#4caf50">● Online</span>':''}</div>
          </div>
        </div>`).join('');
      document.getElementById('modalPenjual').classList.add('show');
    }
    function tutupModal() {
      document.getElementById('modalPenjual').classList.remove('show');
    }
    function mulaiChatBaru(sellerId) {
      tutupModal();
      bukaChat(sellerId);
    }

    function tampilToast(pesan) {
      const t = document.getElementById('toast');
      t.textContent = pesan;
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2200);
    }

    function seedDemo() {
      if (semuaChat['s1']) return; 
      const now = Date.now();
      semuaChat['s1'] = [
        { dari:'seller', teks:'Selamat datang di Groceer! Ada yang bisa kami bantu? 😊', waktu:now-3600000, dibaca:true },
        { dari:'user',   teks:'Halo, saya mau tanya soal harga grosir beras 5kg', waktu:now-3500000, dibaca:true },
        { dari:'seller', teks:'Untuk pembelian min 50 sak, harga spesial Rp 65.000/sak. Tertarik?', waktu:now-3400000, dibaca:false },
      ];
      semuaChat['s2'] = [
        { dari:'seller', teks:'Promo hari ini: diskon 15% untuk pembelian minyak goreng!', waktu:now-7200000, dibaca:false },
      ];
      simpanChat();
    }

    seedDemo();
    renderInbox();