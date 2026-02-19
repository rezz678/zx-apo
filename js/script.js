// ===== ZETXITERS APOCALYPSE - FIXED VERSION =====
console.log('🔥 ZETXITERS INITIALIZING...');

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://vdcsnfjxjfhcgoeivxrc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkY3NuZmp4amZoY2dvZWl2eHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzNTQ3MzMsImV4cCI6MjA4NjkzMDczM30.XWGIHJMIoyy73xWmmPYqDcfj3FFDg3_UezAcbAbevZU';

// Initialize Supabase
let supabase = null;
try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialized');
} catch (e) {
    console.error('❌ Supabase init failed:', e);
}

// ===== GLOBAL VARIABLES =====
let currentUser = null;
let particles = [];
let ctx, canvas;
let audioContext = null;
const ADMIN_PHONE = '087833947151'; // No WA Admin

// ===== SOUND SYSTEM =====
function initAudio() {
    if (audioContext) return;
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        console.log('Audio not supported');
    }
}

function playSound(type) {
    try {
        if (!audioContext) initAudio();
        if (!audioContext) return;
        
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        const now = audioContext.currentTime;
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(audioContext.destination);
        
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        switch(type) {
            case 'click':
                osc.frequency.setValueAtTime(800, now);
                osc.start(now);
                osc.stop(now + 0.05);
                break;
            case 'success':
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'error':
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.15);
                break;
            case 'toggle':
                osc.frequency.setValueAtTime(1000, now);
                osc.start(now);
                osc.stop(now + 0.03);
                break;
        }
    } catch (e) {}
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    playSound(type);
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-exclamation-triangle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ===== SPLASH SCREEN =====
function startLoading() {
    console.log('▶️ Splash screen started');
    
    let progress = 0;
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');
    
    if (!loadingProgress || !loadingText) return;
    
    const interval = setInterval(() => {
        progress += Math.random() * 8 + 4;
        if (progress > 100) progress = 100;
        
        loadingProgress.style.width = progress + '%';
        loadingText.textContent = Math.floor(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);
        }
    }, 70);
}

// ===== CHECK SESSION =====
async function checkSession() {
    if (!supabase) return null;
    
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Session check error:', error);
        return null;
    }
}

// ===== LOGIN PAGE =====
function initLoginPage() {
    console.log('✅ Login page initialized');
    
    // Cek session
    checkSession().then(session => {
        if (session) {
            window.location.href = 'dashboard.html';
        }
    });
    
    // Toggle password
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const password = document.getElementById('password');
            const type = password.type === 'password' ? 'text' : 'password';
            password.type = type;
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
            playSound('click');
        });
    }
    
    // Login button
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            if (!email || !password) {
                showToast('Email dan password harus diisi!', 'error');
                return;
            }
            
            // Loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<span>PROSES</span><i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;
            
            try {
                console.log('🟡 Attempting login...');
                
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) throw error;
                
                console.log('✅ Login success:', data);
                showToast('Login berhasil!', 'success');
                
                // Simpan session
                currentUser = data.user;
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } catch (error) {
                console.error('❌ Login failed:', error);
                showToast(error.message, 'error');
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    }
    
    // Floating label effect
    document.querySelectorAll('.input-field input').forEach(input => {
        if (input.value) {
            const label = input.nextElementSibling;
            label.style.top = '0';
            label.style.fontSize = '0.8rem';
            label.style.background = 'var(--bg-card-solid)';
            label.style.padding = '0 10px';
        }
        
        input.addEventListener('input', function() {
            const label = this.nextElementSibling;
            if (this.value) {
                label.style.top = '0';
                label.style.fontSize = '0.8rem';
                label.style.background = 'var(--bg-card-solid)';
                label.style.padding = '0 10px';
            } else {
                label.style.top = '50%';
                label.style.fontSize = '0.95rem';
                label.style.background = 'transparent';
                label.style.padding = '0';
            }
        });
    });
}

// ===== REGISTER PAGE =====
function initRegisterPage() {
    console.log('✅ Register page initialized');
    
    // Toggle password
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const password = document.getElementById('password');
            const type = password.type === 'password' ? 'text' : 'password';
            password.type = type;
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
            playSound('click');
        });
    }
    
    // Register button
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirm = document.getElementById('confirmPassword').value.trim();
            const keyCode = document.getElementById('keyCode').value.trim();
            
            // Validasi
            if (!email || !username || !password || !confirm) {
                showToast('Semua field harus diisi!', 'error');
                return;
            }
            
            if (password !== confirm) {
                showToast('Password tidak cocok!', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password minimal 6 karakter!', 'error');
                return;
            }
            
            if (!keyCode) {
                showToast('Key Code wajib diisi! Hubungi admin untuk beli key', 'error');
                return;
            }
            
            // Loading state
            const originalText = this.innerHTML;
            this.innerHTML = '<span>CEK KEY...</span><i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;
            
            try {
                // CEK KEY DI DATABASE
                const { data: keyData, error: keyError } = await supabase
                    .from('key_store')
                    .select('*')
                    .eq('key_code', keyCode)
                    .eq('is_sold', false)
                    .single();
                
                if (keyError || !keyData) {
                    showToast('Key tidak valid atau sudah digunakan!', 'error');
                    this.innerHTML = originalText;
                    this.disabled = false;
                    return;
                }
                
                // Key valid, lanjut register
                this.innerHTML = '<span>REGISTER...</span><i class="fas fa-spinner fa-spin"></i>';
                
                const { data, error } = await supabase.auth.signUp({
                    email, password,
                    options: {
                        data: {
                            username: username,
                            key_code: keyCode
                        }
                    }
                });
                
                if (error) throw error;
                
                console.log('✅ Register success:', data);
                
                // Aktivasi key
                if (data.user) {
                    await activateKey(keyData, data.user.id);
                }
                
                showToast('Registrasi berhasil! Silakan login', 'success');
                
                // Reset form
                document.getElementById('email').value = '';
                document.getElementById('username').value = '';
                document.getElementById('password').value = '';
                document.getElementById('confirmPassword').value = '';
                document.getElementById('keyCode').value = '';
                
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                
            } catch (error) {
                console.error('❌ Register failed:', error);
                showToast(error.message, 'error');
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    }
    
    // Floating label effect
    document.querySelectorAll('.input-field input').forEach(input => {
        input.addEventListener('input', function() {
            const label = this.nextElementSibling;
            if (this.value) {
                label.style.top = '0';
                label.style.fontSize = '0.8rem';
                label.style.background = 'var(--bg-card-solid)';
                label.style.padding = '0 10px';
            } else {
                label.style.top = '50%';
                label.style.fontSize = '0.95rem';
                label.style.background = 'transparent';
                label.style.padding = '0';
            }
        });
    });
}

// ===== ACTIVATE KEY =====
async function activateKey(key, userId) {
    try {
        // Hitung expired date
        const expiredAt = key.duration_days ? 
            new Date(Date.now() + key.duration_days * 24 * 60 * 60 * 1000) : 
            null;
        
        // Buat subscription
        await supabase
            .from('subscriptions')
            .insert({
                user_id: userId,
                key_code: key.key_code,
                key_type: key.key_type,
                duration_days: key.duration_days,
                device_limit: key.key_type === 'trial' ? 1 : 3,
                expired_at: expiredAt,
                is_active: true
            });
        
        // Tandai key sebagai sold
        await supabase
            .from('key_store')
            .update({ 
                is_sold: true, 
                sold_to: userId, 
                sold_at: new Date() 
            })
            .eq('id', key.id);
        
        console.log('✅ Key activated successfully');
        
    } catch (error) {
        console.error('Error activating key:', error);
    }
}

// ===== KIRIM PESAN KE WA ADMIN =====
function sendToWhatsApp(data) {
    const { email, username, keyCode } = data;
    const message = `🔔 *PENDAFTARAN BARU* 🔔\n\n📧 Email: ${email}\n👤 Username: ${username}\n🔑 Key: ${keyCode}\n\n⏰ Waktu: ${new Date().toLocaleString('id-ID')}\n\n💬 Segera proses pendaftaran ini!`;
    
    const waUrl = `https://wa.me/${87833947151}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
}

// ===== DASHBOARD PAGE =====
async function initDashboardPage() {
    console.log('✅ Dashboard page initialized');
    
    // Cek session
    const session = await checkSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = session.user;
    document.getElementById('headerEmail').textContent = currentUser.email;
    
    // Load semua data
    await loadUserProfile();
    await loadSubscription();
    await loadDevices();
    await loadSettings();
    
    // Setup listeners
    setupFeatureListeners();
    setupDashboardListeners();
}

// ===== LOAD USER PROFILE =====
async function loadUserProfile() {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (profile) {
            if (profile.is_admin) {
                document.getElementById('adminSection').style.display = 'block';
                document.getElementById('userStatus').textContent = 'ADMIN';
                document.getElementById('userStatus').style.color = 'gold';
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// ===== LOAD SUBSCRIPTION =====
async function loadSubscription() {
    try {
        const { data: sub, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (sub) {
            const keyType = sub.key_type || 'PREMIUM';
            document.getElementById('keyType').textContent = keyType.toUpperCase();
            
            if (sub.expired_at) {
                const daysLeft = Math.ceil((new Date(sub.expired_at) - new Date()) / (1000 * 60 * 60 * 24));
                document.getElementById('durationStatus').textContent = daysLeft > 0 ? `${daysLeft} Hari` : 'Expired';
                
                if (daysLeft <= 0) {
                    document.getElementById('durationStatus').style.color = 'var(--danger)';
                }
            } else {
                document.getElementById('durationStatus').textContent = 'Lifetime';
            }
        }
    } catch (error) {
        console.error('Error loading subscription:', error);
    }
}

// ===== LOAD DEVICES =====
async function loadDevices() {
    try {
        const { data: devices, error } = await supabase
            .from('devices')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        document.getElementById('deviceCount').textContent = devices?.length || 0;
        
        const devicesList = document.getElementById('devicesList');
        if (!devices || devices.length === 0) {
            devicesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-mobile-alt"></i>
                    <p>Belum ada device terdaftar</p>
                    <button class="btn-primary btn-small" onclick="window.openDeviceModal()">
                        <i class="fas fa-plus"></i> DAFTAR SEKARANG
                    </button>
                </div>
            `;
            return;
        }
        
        let html = '';
        devices.forEach(device => {
            const isActive = device.is_active && !device.is_blocked;
            const lastActive = device.last_active 
                ? new Date(device.last_active).toLocaleString('id-ID', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                : 'Tidak pernah';
            
            html += `
                <div class="device-item">
                    <div class="device-info">
                        <div class="device-icon">
                            <i class="fas fa-mobile-alt"></i>
                        </div>
                        <div class="device-details">
                            <h4>${device.device_name || 'Unknown Device'}</h4>
                            <p class="device-id">${device.device_id}</p>
                            <p class="device-last">Terakhir: ${lastActive}</p>
                        </div>
                    </div>
                    <span class="device-badge ${isActive ? 'active' : 'inactive'}">
                        ${isActive ? 'AKTIF' : 'NONAKTIF'}
                    </span>
                </div>
            `;
        });
        
        devicesList.innerHTML = html;
    } catch (error) {
        console.error('Error loading devices:', error);
        showToast('Gagal memuat device', 'error');
    }
}

// ===== LOAD SETTINGS =====
async function loadSettings() {
    try {
        const { data: settings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', currentUser.id)
            .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        if (settings) {
            // Set toggle states
            document.getElementById('toggleHead').checked = settings.feature_headtracking || false;
            document.getElementById('toggleSensi').checked = settings.feature_sensi || false;
            document.getElementById('toggleDrag').checked = settings.feature_dragshot || false;
            document.getElementById('toggleSmooth').checked = settings.feature_smoothaim || false;
            
            // Set status text
            document.getElementById('statusHead').textContent = settings.feature_headtracking ? 'Aktif' : 'Nonaktif';
            document.getElementById('statusSensi').textContent = settings.feature_sensi ? 'Aktif' : 'Nonaktif';
            document.getElementById('statusDrag').textContent = settings.feature_dragshot ? 'Aktif' : 'Nonaktif';
            document.getElementById('statusSmooth').textContent = settings.feature_smoothaim ? 'Aktif' : 'Nonaktif';
            
            // Set active class
            if (settings.feature_headtracking) document.getElementById('featureHead').classList.add('active');
            if (settings.feature_sensi) document.getElementById('featureSensi').classList.add('active');
            if (settings.feature_dragshot) document.getElementById('featureDrag').classList.add('active');
            if (settings.feature_smoothaim) document.getElementById('featureSmooth').classList.add('active');
            
            // Set slider values
            document.getElementById('sensiX').value = settings.sensi_x || 50;
            document.getElementById('sensiXValue').textContent = (settings.sensi_x || 50).toFixed(2);
            document.getElementById('sensiY').value = settings.sensi_y || 50;
            document.getElementById('sensiYValue').textContent = (settings.sensi_y || 50).toFixed(2);
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// ===== SAVE FEATURE SETTING =====
async function saveFeatureSetting(feature, value) {
    try {
        const field = feature === 'headtracking' ? 'feature_headtracking' :
                     feature === 'sensi' ? 'feature_sensi' :
                     feature === 'drag' ? 'feature_dragshot' : 'feature_smoothaim';
        
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: currentUser.id,
                [field]: value
            });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error saving setting:', error);
        showToast('Gagal menyimpan pengaturan', 'error');
    }
}

// ===== SAVE SENSI SETTING =====
async function saveSensiSetting(axis, value) {
    try {
        const field = axis === 'x' ? 'sensi_x' : 'sensi_y';
        
        const { error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: currentUser.id,
                [field]: value
            });
        
        if (error) throw error;
    } catch (error) {
        console.error('Error saving sensi:', error);
    }
}

// ===== SETUP FEATURE LISTENERS =====
function setupFeatureListeners() {
    const features = [
        { id: 'Head', name: 'headtracking' },
        { id: 'Sensi', name: 'sensi' },
        { id: 'Drag', name: 'drag' },
        { id: 'Smooth', name: 'smooth' }
    ];
    
    features.forEach(feature => {
        const toggle = document.getElementById(`toggle${feature.id}`);
        const loading = document.getElementById(`loading${feature.id}`);
        const status = document.getElementById(`status${feature.id}`);
        const card = document.getElementById(`feature${feature.id}`);
        
        if (toggle) {
            toggle.addEventListener('change', function() {
                playSound('toggle');
                
                if (loading) loading.classList.add('show');
                
                setTimeout(async () => {
                    if (loading) loading.classList.remove('show');
                    
                    if (this.checked) {
                        if (card) card.classList.add('active');
                        if (status) status.textContent = 'Aktif';
                        showToast(`${feature.id} diaktifkan`, 'success');
                    } else {
                        if (card) card.classList.remove('active');
                        if (status) status.textContent = 'Nonaktif';
                        showToast(`${feature.id} dinonaktifkan`, 'success');
                    }
                    
                    await saveFeatureSetting(feature.name, this.checked);
                }, 600);
            });
        }
    });
    
    // Slider listeners
    const sensiX = document.getElementById('sensiX');
    const sensiY = document.getElementById('sensiY');
    
    if (sensiX) {
        sensiX.addEventListener('input', function() {
            document.getElementById('sensiXValue').textContent = parseFloat(this.value).toFixed(2);
        });
        
        sensiX.addEventListener('change', function() {
            saveSensiSetting('x', this.value);
            playSound('click');
        });
    }
    
    if (sensiY) {
        sensiY.addEventListener('input', function() {
            document.getElementById('sensiYValue').textContent = parseFloat(this.value).toFixed(2);
        });
        
        sensiY.addEventListener('change', function() {
            saveSensiSetting('y', this.value);
            playSound('click');
        });
    }
}

// ===== SETUP DASHBOARD LISTENERS =====
function setupDashboardListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            playSound('click');
            await supabase.auth.signOut();
            showToast('Logout berhasil!', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        });
    }
    
    // Register device button
    const registerBtn = document.getElementById('registerDeviceBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            playSound('click');
            openDeviceModal();
        });
    }
    
    // Modal close button
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeDeviceModal);
    }
    
    // Save device button
    const saveBtn = document.getElementById('saveDeviceBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', registerDevice);
    }
    
    // Game launcher buttons
    const launchFFTH = document.getElementById('launchFFTH');
    const launchFFMAX = document.getElementById('launchFFMAX');
    
    if (launchFFTH) {
        launchFFTH.addEventListener('click', () => launchGame('com.dts.freefireth'));
    }
    
    if (launchFFMAX) {
        launchFFMAX.addEventListener('click', () => launchGame('com.dts.freefiremax'));
    }
}

// ===== OPEN DEVICE MODAL =====
function openDeviceModal() {
    const modal = document.getElementById('deviceModal');
    if (!modal) return;
    
    const newDeviceId = generateDeviceId();
    document.getElementById('newDeviceId').value = newDeviceId;
    
    // Generate QR code
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer && typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: newDeviceId,
            width: 180,
            height: 180
        });
    }
    
    modal.classList.add('show');
}

// ===== CLOSE DEVICE MODAL =====
function closeDeviceModal() {
    document.getElementById('deviceModal').classList.remove('show');
}

// ===== REGISTER DEVICE =====
async function registerDevice() {
    const deviceId = document.getElementById('newDeviceId').value;
    const deviceName = document.getElementById('deviceName').value.trim() || 'My Device';
    
    if (!deviceId) return;
    
    const btn = document.getElementById('saveDeviceBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> MENDAFTARKAN...';
    btn.disabled = true;
    
    try {
        const deviceInfo = getDeviceInfo();
        const ipAddress = await getIP();
        
        const { error } = await supabase
            .from('devices')
            .insert({
                device_id: deviceId,
                user_id: currentUser.id,
                device_name: deviceName,
                device_model: deviceInfo.model,
                device_platform: deviceInfo.platform,
                ip_address: ipAddress,
                is_active: true
            });
        
        if (error) throw error;
        
        showToast('Device berhasil didaftarkan!', 'success');
        closeDeviceModal();
        loadDevices();
        
    } catch (error) {
        console.error('Error registering device:', error);
        showToast(error.message, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// ===== GENERATE DEVICE ID =====
function generateDeviceId() {
    return 'ZET-' + Math.random().toString(36).substring(2, 10).toUpperCase() +
           '-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ===== GET DEVICE INFO =====
function getDeviceInfo() {
    const ua = navigator.userAgent;
    let platform = 'Unknown';
    let model = 'Unknown';
    
    if (/Android/i.test(ua)) platform = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS';
    else platform = 'Web';
    
    const match = ua.match(/\(([^)]+)\)/);
    if (match) model = match[1];
    
    return { platform, model };
}

// ===== GET IP ADDRESS =====
async function getIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (e) {
        return null;
    }
}

// ===== LAUNCH GAME =====
function launchGame(packageName) {
    playSound('click');
    showToast('Membuka game...', 'success');
    
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
        try {
            window.location.href = `intent://${packageName}#Intent;scheme=package;end`;
            
            setTimeout(() => {
                window.location.href = `market://details?id=${packageName}`;
            }, 500);
            
        } catch (e) {
            window.location.href = `https://play.google.com/store/apps/details?id=${packageName}`;
        }
    } else {
        showToast('Fitur ini hanya tersedia di Android', 'warning');
    }
}

// ===== PARTICLES BACKGROUND =====
function initParticles() {
    canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    resizeCanvas();
    
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            size: Math.random() * 2 + 1,
            opacity: Math.random() * 0.3 + 0.1
        });
    }
    
    window.addEventListener('resize', resizeCanvas);
    animateParticles();
}

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

function animateParticles() {
    if (!ctx || !canvas) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 102, 255, ${p.opacity})`;
        ctx.fill();
        
        if (i % 3 === 0) {
            for (let j = i + 1; j < particles.length; j += 2) {
                const p2 = particles[j];
                if (!p2) continue;
                
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 102, 255, ${0.1 * (1 - distance / 100)})`;
                    ctx.stroke();
                }
            }
        }
    }
    
    requestAnimationFrame(animateParticles);
}

// ===== ADMIN PANEL =====
async function initAdminPage() {
    console.log('✅ Admin page initialized');
    
    const session = await checkSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = session.user;
    
    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', currentUser.id)
        .single();
    
    if (!profile?.is_admin) {
        showToast('Akses ditolak!', 'error');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 'users';
    
    loadAdminContent(page);
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabase.auth.signOut();
            window.location.href = 'login.html';
        });
    }
}

async function loadAdminContent(page) {
    const content = document.getElementById('adminContent');
    
    switch(page) {
        case 'users':
            await loadAdminUsers(content);
            break;
        case 'devices':
            await loadAdminDevices(content);
            break;
        case 'keys':
            await loadAdminKeys(content);
            break;
        default:
            await loadAdminDashboard(content);
    }
}

async function loadAdminUsers(container) {
    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select(`
                *,
                devices:devices(count)
            `)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        let html = `
            <div class="admin-header">
                <h3>MANAGE USERS</h3>
                <button class="btn-primary" onclick="showAddUserModal()">
                    <i class="fas fa-plus"></i> TAMBAH USER
                </button>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Devices</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        users.forEach(user => {
            html += `
                <tr>
                    <td>${user.username || '-'}</td>
                    <td>${user.email || '-'}</td>
                    <td>${user.devices?.[0]?.count || 0}</td>
                    <td>
                        <span class="badge ${user.is_active ? 'badge-success' : 'badge-danger'}">
                            ${user.is_active ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>
                        <span class="badge ${user.is_admin ? 'badge-primary' : 'badge-secondary'}">
                            ${user.is_admin ? 'Admin' : 'User'}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn" onclick="toggleAdmin('${user.id}', ${!user.is_admin})">
                            <i class="fas fa-crown"></i>
                        </button>
                        <button class="action-btn" onclick="toggleUserStatus('${user.id}', ${user.is_active})">
                            <i class="fas ${user.is_active ? 'fa-ban' : 'fa-check'}"></i>
                        </button>
                        <button class="action-btn" onclick="viewUserDevices('${user.id}')">
                            <i class="fas fa-mobile-alt"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        container.innerHTML = html;
        
    } catch (error) {
        container.innerHTML = `<div class="error-state">Error: ${error.message}</div>`;
    }
}

async function loadAdminDevices(container) {
    container.innerHTML = '<div class="loading-state">Loading devices...</div>';
    // Implementasi load devices
}

async function loadAdminKeys(container) {
    container.innerHTML = '<div class="loading-state">Loading keys...</div>';
    // Implementasi load keys
}

async function loadAdminDashboard(container) {
    container.innerHTML = '<div class="loading-state">Loading dashboard...</div>';
    // Implementasi dashboard admin
}

// ===== GLOBAL FUNCTIONS =====
window.openDeviceModal = openDeviceModal;
window.closeDeviceModal = closeDeviceModal;
window.generateDeviceId = generateDeviceId;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 DOM ready');
    
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    if (filename === 'index.html' || path === '/') {
        startLoading();
        setTimeout(initParticles, 100);
    } else if (filename === 'login.html') {
        initLoginPage();
        setTimeout(initParticles, 100);
    } else if (filename === 'register.html') {
        initRegisterPage();
        setTimeout(initParticles, 100);
    } else if (filename === 'dashboard.html') {
        initDashboardPage();
        setTimeout(initParticles, 100);
    } else if (filename === 'admin.html') {
        initAdminPage();
        setTimeout(initParticles, 100);
    } else {
        setTimeout(initParticles, 100);
    }
    
    initAudio();
});
