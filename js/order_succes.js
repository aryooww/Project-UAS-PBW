// Ambil data pesanan terakhir
    const lastOrder = JSON.parse(sessionStorage.getItem('groceer_last_order') || '{}');
    
    document.getElementById('orderId').textContent = lastOrder.id || '-';
    document.getElementById('pembeli').textContent = lastOrder.pembeli || '-';
    document.getElementById('alamat').textContent = lastOrder.alamat || '-';
    document.getElementById('metodeBayar').textContent = lastOrder.metodePembayaran || '-';
    document.getElementById('totalBayar').textContent = 
      'Rp ' + (lastOrder.total || 0).toLocaleString('id-ID');
    
    // Hapus data temporary
    sessionStorage.removeItem('groceer_last_order');