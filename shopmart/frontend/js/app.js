const API_URL = 'http://localhost:5000/api';

// --- 1. TRANSLATION DICTIONARY (All 7 Languages) ---
const translations = {
    en: {
        shop_now: "Shop Now",
        latest_arrivals: "Latest Arrivals",
        cart: "Cart",
        login: "Login",
        signup: "Signup",
        logout: "Logout",
        admin: "Admin",
        hero_title: "Next-Gen Tech",
        hero_desc: "Upgrade your world with the latest gadgets.",
        search_placeholder: "Search for vintage items..."
    },
    hi: {
        shop_now: "अभी खरीदें",
        latest_arrivals: "नवीनतम आगमन",
        cart: "कार्ट",
        login: "लॉग इन",
        signup: "साइन अप",
        logout: "लॉग आउट",
        admin: "एडमिन",
        hero_title: "अगली पीढ़ी की तकनीक",
        hero_desc: "नवीनतम गैजेट्स के साथ अपनी दुनिया को अपग्रेड करें।",
        search_placeholder: "विंटेज आइटम खोजें..."
    },
    kn: {
        shop_now: "ಈಗಲೇ ಖರೀದಿಸಿ",
        latest_arrivals: "ಹೊಸ ಆಗಮನಗಳು",
        cart: "ಕಾರ್ಟ್",
        login: "ಲಾಗಿನ್",
        signup: "ಸೈನ್ ಅಪ್",
        logout: "ಲಾಗ್ ಔಟ್",
        admin: "ಅಡ್ಮಿನ್",
        hero_title: "ಮುಂದಿನ ಪೀಳಿಗೆಯ ಟೆಕ್",
        hero_desc: "ಹೊಸ ಗ್ಯಾಜೆಟ್‌ಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಜಗತ್ತನ್ನು ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ.",
        search_placeholder: "ವಿಂಟೇಜ್ ವಸ್ತುಗಳನ್ನು ಹುಡುಕಿ..."
    },
    te: {
        shop_now: "ఇప్పుడే కొనండి",
        latest_arrivals: "కొత్త రాకలు",
        cart: "కార్ట్",
        login: "లాగిన్",
        signup: "సైన్ అప్",
        logout: "లాగ్ అవుట్",
        admin: "అడ్మిన్",
        hero_title: "తదుపరి తరం టెక్",
        hero_desc: "తాజా గాడ్జెట్‌లతో మీ ప్రపంచాన్ని అప్‌గ్రేడ్ చేయండి.",
        search_placeholder: "పాతకాలపు వస్తువులను వెతకండి..."
    },
    ur: {
        shop_now: "ابھی خریدیں",
        latest_arrivals: "نئی آمد",
        cart: "کارٹ",
        login: "لاگ ان",
        signup: "سائن اپ",
        logout: "لاگ آؤٹ",
        admin: "ایڈمن",
        hero_title: "اگلی نسل کی ٹیکنالوجی",
        hero_desc: "جدید ترین گیجٹس کے ساتھ اپنی دنیا کو اپ گریڈ کریں۔",
        search_placeholder: "پرانی اشیاء تلاش کریں..."
    },
    fr: {
        shop_now: "Acheter Maintenant",
        latest_arrivals: "Nouveaux Arrivages",
        cart: "Panier",
        login: "Connexion",
        signup: "S'inscrire",
        logout: "Déconnexion",
        admin: "Admin",
        hero_title: "Technologie Nouvelle Génération",
        hero_desc: "Améliorez votre monde avec les derniers gadgets.",
        search_placeholder: "Rechercher des articles vintage..."
    },
    es: {
        shop_now: "Compra Ahora",
        latest_arrivals: "Últimas Llegadas",
        cart: "Carrito",
        login: "Acceso",
        signup: "Registrarse",
        logout: "Cerrar Sesión",
        admin: "Administrador",
        hero_title: "Tecnología de Próxima Generación",
        hero_desc: "Actualiza tu mundo con los últimos gadgets.",
        search_placeholder: "Buscar artículos vintage..."
    }
};

// --- 2. LANGUAGE LOGIC ---
function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    const elements = document.querySelectorAll('[data-lang]');
    elements.forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) {
            el.innerText = translations[lang][key];
        }
    });
    const searchInput = document.getElementById('search');
    if(searchInput && translations[lang]) searchInput.placeholder = translations[lang].search_placeholder;
    updateNavbarText(lang);
}

function updateNavbarText(lang) {
    const t = translations[lang];
    if (!t) return;
    
    const cartLink = document.getElementById('cart-link');
    if(cartLink) {
        const count = cartLink.innerText.match(/\d+/)[0]; 
        cartLink.innerText = `${t.cart} (${count})`;
    }
    
    // Update Login/Signup/Logout links dynamically
    const loginLink = document.querySelector('a[href="login.html"]:not(.btn)');
    if(loginLink) loginLink.innerText = t.login;
    
    const signupBtn = document.querySelector('a[href="login.html"].btn'); // Points to login.html now
    if(signupBtn) signupBtn.innerText = t.signup;

    const logoutLink = document.querySelector('a[onclick="logout()"]');
    if(logoutLink) logoutLink.innerText = t.logout;
}

// --- 3. THEME LOGIC ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
}
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const btn = document.getElementById('theme-toggle-btn');
    if(btn) btn.innerText = isDark ? '☀️' : '🌙';
}
initTheme();

// --- 4. AUTH HELPERS ---
function getToken() { return localStorage.getItem('token'); }
function getUser() { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null; }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'index.html'; }

// --- 5. UI LOGIC (NAVBAR) ---
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('language') || 'en';
    
    // Restore Language Selection
    setTimeout(() => changeLanguage(savedLang), 100);

    const user = getUser();
    const navContainer = document.getElementById('nav-actions');
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcon = isDark ? '☀️' : '🌙';
    
    // Theme & Lang Buttons
    const themeBtnHtml = `<button id="theme-toggle-btn" class="theme-btn" onclick="toggleTheme()" title="Toggle Dark Mode">${themeIcon}</button>`;
    const langSelectorHtml = `
        <select id="lang-selector" onchange="changeLanguage(this.value)" 
            style="padding:5px; border-radius:5px; border:none; margin-right:10px; cursor:pointer; font-weight:bold; background:#f4f4f4; height:30px;">
            <option value="en">🇺🇸 En</option>
            <option value="hi">🇮🇳 Hi</option>
            <option value="kn">🇮🇳 Kn</option>
            <option value="te">🇮🇳 Te</option>
            <option value="ur">🇵🇰 Ur</option>
            <option value="fr">🇫🇷 Fr</option>
            <option value="es">🇪🇸 Es</option>
        </select>
    `;

    if (navContainer) {
        const cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
        const count = cart.reduce((acc, item) => acc + item.qty, 0);

        if (user) {
            let adminLink = user.isAdmin ? `<a href="admin.html" style="color:var(--accent-orange);" data-lang="admin">Admin</a>` : '';
            let dpSrc = user.dp ? `/uploads/${user.dp}` : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png';

            navContainer.innerHTML = `
                ${langSelectorHtml}
                ${themeBtnHtml} 
                ${adminLink}
                <a href="cart.html" id="cart-link" data-lang="cart">Cart (${count})</a>
                <a href="profile.html" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
                    <img src="${dpSrc}" class="nav-profile-img" alt="Profile">
                    <span style="color:white; font-size:0.9rem;">${user.name.split(' ')[0]}</span>
                </a>
                <a href="#" onclick="logout()" style="font-size:0.85rem; opacity:0.8;" data-lang="logout">Logout</a>
            `;
        } else {
            // Login/Signup both point to login.html (Sliding Form)
            navContainer.innerHTML = `
                ${langSelectorHtml}
                ${themeBtnHtml} 
                <a href="cart.html" id="cart-link" data-lang="cart">Cart (${count})</a>
                <a href="login.html" data-lang="login">Login</a>
                <a href="login.html" class="btn" style="padding:8px 20px; font-size:0.9rem; color:white;" data-lang="signup">Signup</a>
            `;
        }
        
        // Set dropdown value
        const newSelector = document.getElementById('lang-selector');
        if(newSelector) newSelector.value = savedLang;
    }
    
    loadWishlistState();
    initLiveSearch(); 
});

// --- 6. FETCH WRAPPER ---
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = options.headers || {};
    if (token && !headers['Authorization']) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    const config = { ...options, headers };
    return await fetch(`${API_URL}${endpoint}`, config);
}

// --- 7. CART & PAYMENT LOGIC ---
function addToCart(id, title, price, image) {
    let cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) existingItem.qty += 1;
    else cart.push({ id, title, price: parseFloat(price), image, qty: 1 });
    localStorage.setItem('shopmart_cart', JSON.stringify(cart));
    alert('Item added to cart!');
    location.reload();
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem('shopmart_cart', JSON.stringify(cart));
    loadCartPage(); 
    location.reload();
}

function buyNow(id, title, price, image) {
    const item = [{ id: id, title: title, price: parseFloat(price), image: image, qty: 1 }];
    localStorage.setItem('checkout_items', JSON.stringify(item));
    localStorage.removeItem('is_cart_checkout');
    window.location.href = 'payment.html';
}

function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    if(cart.length === 0) return alert("Cart is empty");
    localStorage.setItem('checkout_items', JSON.stringify(cart));
    localStorage.setItem('is_cart_checkout', 'true');
    window.location.href = 'payment.html';
}

function loadCartPage() {
    const container = document.getElementById('cart-items');
    const totalElem = document.getElementById('cart-total');
    if (!container) return; 
    const cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    if (cart.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem; color:#777;">Your cart is empty.</td></tr>';
        if(totalElem) totalElem.innerText = '0.00';
        return;
    }
    let total = 0;
    container.innerHTML = cart.map(item => {
        const imgSrc = getImgPath(item.image);
        total += item.price * item.qty;
        return `
            <tr>
                <td style="padding:15px;"><img src="${imgSrc}" width="60" style="border-radius:5px; object-fit:contain;"></td>
                <td style="padding:15px; font-weight:bold; color:var(--text-main);">${item.title}</td>
                <td style="padding:15px;">₹${item.price}</td>
                <td style="padding:15px;">${item.qty}</td>
                <td style="padding:15px;"><button class="btn" style="background:#ff4d4d; padding:8px 15px; font-size:0.8rem; border-radius:50px;" onclick="removeFromCart(${item.id})">Remove</button></td>
            </tr>
        `;
    }).join('');
    if(totalElem) totalElem.innerText = total.toFixed(2);
}

// --- 8. HAGGLE LOGIC ---
async function makeOffer(id, title) {
    if(!getToken()) {
        alert("Please login to make an offer.");
        window.location.href = 'login.html';
        return;
    }
    const price = prompt(`Enter offer for ${title} (₹):`);
    if(price) {
        const res = await apiFetch('/offers', { method: 'POST', body: JSON.stringify({ product_id: id, offer_price: price }) });
        if(res.ok) alert('Offer sent!'); else alert('Error sending offer.');
    }
}

// --- 9. WISHLIST LOGIC ---
let wishlistedIds = [];
async function loadWishlistState() {
    if (!getToken()) return;
    const res = await apiFetch('/wishlist/ids');
    if (res.ok) {
        wishlistedIds = await res.json();
        updateHeartIcons();
    }
}

function updateHeartIcons() {
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const pid = parseInt(btn.dataset.id);
        if (wishlistedIds.includes(pid)) {
            btn.classList.add('active');
            btn.innerHTML = '❤️'; 
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '🤍'; 
        }
    });
}

async function toggleWishlist(btn, productId) {
    if (!getToken()) return alert("Please login to save items.");
    const isNowActive = !btn.classList.contains('active');
    btn.classList.toggle('active');
    btn.innerHTML = isNowActive ? '❤️' : '🤍';
    const res = await apiFetch('/wishlist', { method: 'POST', body: JSON.stringify({ product_id: productId }) });
    if (!res.ok) {
        btn.classList.toggle('active');
        btn.innerHTML = !isNowActive ? '❤️' : '🤍';
        alert("Error updating wishlist");
    }
}

// --- 10. LIVE SEARCH & VOICE SEARCH ---
let searchProducts = [];

async function initLiveSearch() {
    const searchInput = document.getElementById('search');
    let resultsBox = document.getElementById('search-results');
    if (!resultsBox && searchInput) {
        resultsBox = document.createElement('div');
        resultsBox.id = 'search-results';
        resultsBox.className = 'search-dropdown';
        searchInput.parentNode.appendChild(resultsBox);
    }
    if (!searchInput) return;

    try {
        const res = await apiFetch('/products');
        if (res.ok) searchProducts = await res.json();
    } catch (e) { console.log("Search init failed"); }

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        resultsBox.innerHTML = '';
        if (term.length < 1) { resultsBox.style.display = 'none'; return; }

        const filtered = searchProducts.filter(p => p.title.toLowerCase().includes(term)).slice(0, 5);

        if (filtered.length > 0) {
            resultsBox.style.display = 'flex';
            resultsBox.innerHTML = filtered.map(p => {
                const imgSrc = getImgPath(p.image);
                return `
                    <a href="product.html?id=${p.id}" class="search-item">
                        <img src="${imgSrc}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/50'">
                        <div class="search-info">
                            <h4>${p.title}</h4>
                            <span>₹${p.price}</span>
                        </div>
                    </a>
                `;
            }).join('');
        } else { resultsBox.style.display = 'none'; }
    });

    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !resultsBox.contains(e.target)) {
            resultsBox.style.display = 'none';
        }
    });
}

function startVoiceSearch() {
    const searchInput = document.getElementById('search');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return alert("Browser does not support Voice Search. Try Chrome.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();

    searchInput.placeholder = "Listening...";

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        searchInput.value = transcript;
        searchInput.dispatchEvent(new Event('input')); 
        searchInput.placeholder = "Search for vintage items...";
    };
    recognition.onerror = () => { 
        alert("Could not hear you."); 
        searchInput.placeholder = "Search for vintage items..."; 
    };
}

function getImgPath(image) {
    if (!image) return 'https://via.placeholder.com/300';
    if (image.startsWith('http')) return image; 
    return `/uploads/${image}`; 
}

loadCartPage();