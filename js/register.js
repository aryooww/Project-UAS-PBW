const loginCard = document.getElementById('loginCard');
    const registerCard = document.getElementById('registerCard');
    const loginAlert = document.getElementById('loginAlert');
    const regAlert = document.getElementById('regAlert');

    document.getElementById('helpBtnLogin').addEventListener('click', e => {
        e.preventDefault(); alert('Butuh bantuan? Hubungi CS Groceer di 0800-1234-GROSIR');
    });
    document.getElementById('helpBtnRegister').addEventListener('click', e => {
        e.preventDefault(); alert('Butuh bantuan pendaftaran? Hubungi 0800-1234-GROSIR');
    });
    document.getElementById('fbBtn').addEventListener('click', () => {
    sessionStorage.setItem('groceer_logged_in', JSON.stringify({
        nama: 'Pengguna Facebook', email: 'facebook@demo.com', phone: ''
    }));
    window.location.href = 'dashboard.html';
});

document.getElementById('googleBtn').addEventListener('click', () => {
    sessionStorage.setItem('groceer_logged_in', JSON.stringify({
        nama: 'Pengguna Google', email: 'google@demo.com', phone: ''
    }));
    window.location.href = 'dashboard.html';
});
    document.getElementById('showRegisterLink').onclick = e => {
        e.preventDefault();
        loginCard.classList.add('d-none');
        registerCard.classList.remove('d-none');
        clearAlerts();
    };
    document.getElementById('showLoginLink').onclick = e => {
        e.preventDefault();
        registerCard.classList.add('d-none');
        loginCard.classList.remove('d-none');
        clearAlerts();
    };

    function clearAlerts() {
        loginAlert.classList.add('d-none');
        regAlert.classList.add('d-none');
    }
    function showAlert(el, msg, type) {
        el.textContent = msg;
        el.className = `alert py-2 small alert-${type === 'success' ? 'success' : 'danger'}`;
        setTimeout(() => el.classList.add('d-none'), 3000);
    }
    function getUsers() {
        let u = localStorage.getItem('groceer_users');
        return u ? JSON.parse(u) : [];
    }
    function saveUsers(users) { localStorage.setItem('groceer_users', JSON.stringify(users)); }

    function seedDefault() {
        let users = getUsers();
        if (!users.find(u => u.email === 'reseller@groceer.com')) {
            users.push({ nama: 'Reseller Demo', phone: '08123456789', email: 'reseller@groceer.com', password: '123456' });
            saveUsers(users);
        }
    }
    seedDefault();

    document.getElementById('loginBtn').onclick = () => {
        let input = document.getElementById('loginUsername').value.trim();
        let pass = document.getElementById('loginPassword').value.trim();
        if (!input || !pass) { showAlert(loginAlert, 'Harap isi semua field!', 'error'); return; }
        let user = getUsers().find(u => u.email === input || u.phone === input || u.nama === input);
        if (user && user.password === pass) {
            sessionStorage.setItem('groceer_logged_in', JSON.stringify({ nama: user.nama, email: user.email, phone: user.phone }));
            showAlert(loginAlert, 'Login berhasil! Mengarahkan ke dashboard...', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
        } else if (user) {
            showAlert(loginAlert, 'Password salah!', 'error');
        } else {
            showAlert(loginAlert, 'Akun tidak ditemukan. Silakan daftar dulu.', 'error');
        }
    };

    document.getElementById('forgotBtn').onclick = e => {
        e.preventDefault();
        let input = document.getElementById('loginUsername').value.trim();
        if (!input) { showAlert(loginAlert, 'Masukkan email/username terlebih dahulu!', 'error'); return; }
        let user = getUsers().find(u => u.email === input || u.phone === input || u.nama === input);
        showAlert(loginAlert, user ? `Link reset dikirim ke ${user.email} (demo)` : 'Akun tidak ditemukan!', user ? 'success' : 'error');
    };

    document.getElementById('registerBtn').onclick = () => {
        let name = document.getElementById('regName').value.trim();
        let phone = document.getElementById('regPhone').value.trim();
        let email = document.getElementById('regEmail').value.trim();
        let pass = document.getElementById('regPassword').value.trim();
        let confirm = document.getElementById('regConfirm').value.trim();

        if (!name || !phone || !email || !pass || !confirm) { showAlert(regAlert, 'Semua field harus diisi!', 'error'); return; }
        if (pass !== confirm) { showAlert(regAlert, 'Password tidak cocok!', 'error'); return; }
        if (pass.length < 6) { showAlert(regAlert, 'Password minimal 6 karakter!', 'error'); return; }
        if (!email.includes('@')) { showAlert(regAlert, 'Email tidak valid!', 'error'); return; }

        let users = getUsers();
        if (users.find(u => u.email === email)) { showAlert(regAlert, 'Email sudah terdaftar!', 'error'); return; }
        if (users.find(u => u.phone === phone)) { showAlert(regAlert, 'Nomor HP sudah terdaftar!', 'error'); return; }

        users.push({ nama: name, phone, email, password: pass });
        saveUsers(users);
        showAlert(regAlert, 'Pendaftaran berhasil! Silakan login.', 'success');
        ['regName','regPhone','regEmail','regPassword','regConfirm'].forEach(id => document.getElementById(id).value = '');

        setTimeout(() => {
            registerCard.classList.add('d-none');
            loginCard.classList.remove('d-none');
            showAlert(loginAlert, 'Akun berhasil dibuat! Silakan login.', 'success');
        }, 1500);
    };

    document.getElementById('loginPassword').addEventListener('keypress', e => { if (e.key === 'Enter') document.getElementById('loginBtn').click(); });
    document.getElementById('regConfirm').addEventListener('keypress', e => { if (e.key === 'Enter') document.getElementById('registerBtn').click(); });