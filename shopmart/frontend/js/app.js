// ==============================================
// 1. CONFIGURATION & GLOBAL VARIABLES
// ==============================================
const API_URL = 'http://localhost:5000/api'; // Localhost
let searchProducts = [];
let wishlistedIds = [];

// ==============================================
// 2. TRANSLATIONS
// ==============================================
const translations = {
    en: { shop_now: "Shop Now", latest_arrivals: "Latest Arrivals", cart: "Cart", login: "Login", signup: "Signup", logout: "Logout", admin: "Admin", hero_title: "Next-Gen Tech", hero_desc: "Upgrade your world with the latest gadgets.", search_placeholder: "Search items..." },
    hi: { shop_now: "अभी खरीदें", latest_arrivals: "नवीनतम आगमन", cart: "कार्ट", login: "लॉग इन", signup: "साइन अप", logout: "लॉग आउट", admin: "एडमिन", hero_title: "अगली पीढ़ी की तकनीक", hero_desc: "नवीनतम गैजेट्स के साथ अपनी दुनिया को अपग्रेड करें।", search_placeholder: "आइटम खोजें..." },
    kn: { shop_now: "ಈಗಲೇ ಖರೀದಿಸಿ", latest_arrivals: "ಹೊಸ ಆಗಮನಗಳು", cart: "ಕಾರ್ಟ್", login: "ಲಾಗಿನ್", signup: "ಸೈನ್ ಅಪ್", logout: "ಲಾಗ್ ಔಟ್", admin: "ಅಡ್ಮಿನ್", hero_title: "ಮುಂದಿನ ಪೀಳಿಗೆಯ ಟೆಕ್", hero_desc: "ಹೊಸ ಗ್ಯಾಜೆಟ್‌ಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಜಗತ್ತನ್ನು ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ.", search_placeholder: "ವಸ್ತುಗಳನ್ನು ಹುಡುಕಿ..." },
    ta: { shop_now: "இப்போதே வாங்கவும்", latest_arrivals: "புதிய வரவுகள்", cart: "கூடை", login: "உள்நுழைய", signup: "பதிவு", logout: "வெளியேறு", admin: "நிர்வாகி", hero_title: "அடுத்த தலைமுறை தொழில்நுட்பம்", hero_desc: "சமீபத்திய கேஜெட்களுடன் உங்கள் உலகத்தை மேம்படுத்தவும்.", search_placeholder: "பொருட்களைத் தேடுங்கள்..." },
    te: { shop_now: "ఇప్పుడే కొనండి", latest_arrivals: "కొత్త రాకలు", cart: "కార్ట్", login: "లాగిన్", signup: "సైన్ అప్", logout: "లాగ్ అవుట్", admin: "అడ్మిన్", hero_title: "తదుపరి తరం టెక్", hero_desc: "తాజా గాడ్జెట్‌లతో మీ ప్రపంచాన్ని అప్‌గ్రేడ్ చేయండి.", search_placeholder: "పాతకాలపు వస్తువులను వెతకండి..." },
    ur: { shop_now: "ابھی خریدیں", latest_arrivals: "نئی آمد", cart: "کارٹ", login: "لاگ ان", signup: "سائن اپ", logout: "لاگ آؤٹ", admin: "ایڈمن", hero_title: "اگلی نسل کی ٹیکنالوجی", hero_desc: "جدید ترین گیجٹس کے ساتھ اپنی دنیا کو اپ گریڈ کریں۔", search_placeholder: "اشیاء تلاش کریں..." },
    fr: { shop_now: "Acheter", latest_arrivals: "Nouveautés", cart: "Panier", login: "Connexion", signup: "S'inscrire", logout: "Déconnexion", admin: "Admin", hero_title: "Technologie Future", hero_desc: "Améliorez votre monde avec les derniers gadgets.", search_placeholder: "Rechercher..." },
    es: { shop_now: "Comprar", latest_arrivals: "Últimas Llegadas", cart: "Carrito", login: "Acceso", signup: "Registrarse", logout: "Salir", admin: "Admin", hero_title: "Tecnología Futura", hero_desc: "Actualiza tu mundo con los últimos gadgets.", search_placeholder: "Buscar..." }
};

// ==============================================
// 3. AUTH & API HELPERS
// ==============================================
function getToken() { return localStorage.getItem('token'); }
function getUser() { 
    try { return JSON.parse(localStorage.getItem('user')); } 
    catch(e) { return null; }
}
function logout() { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('user'); 
    window.location.href = 'index.html'; 
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = options.headers || {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
    try {
        return await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    } catch (err) {
        return { ok: false, json: async () => ({ message: "Network Error" }) };
    }
}

// ✅ FIXED: Cache-Buster Version (Forces new images)
function getImgPath(image) {
    if (!image || image === 'undefined' || image === 'null') {
        return 'https://placehold.co/300x300?text=ShopMart';
    }

    // If it is an online link, use it
    if (image.startsWith('http')) return image;

    // Clean the name
    let cleanImage = image.trim();

    // 🚀 THE TRICK: Add "?v=..." to force the browser to reload the image
    return `http://localhost:5000/uploads/${cleanImage}?v=${new Date().getTime()}`;
}

// ❌ DISABLED GLOBAL ERROR HANDLER (To prevent flickering)
/*
document.addEventListener('error', function(e) {
    if (e.target.tagName.toLowerCase() === 'img') {
        e.target.src = 'https://placehold.co/300x300?text=Product';
        e.target.alt = 'Image fallback';
    }
}, true);
*/

// ==============================================
// 4. INITIALIZATION
// ==============================================
document.addEventListener('DOMContentLoaded', () => {
    // Language
    const savedLang = localStorage.getItem('language') || 'en';
    
    // Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');

    // Navbar
    setupNavbar();
    
    // Init Features
    if(typeof loadWishlistState === 'function') loadWishlistState();
    if(typeof loadProducts === 'function') loadProducts(); // Explicitly call loadProducts
    initLiveSearch();
    updateCartCount();
    
    // Delay Language slightly to let Navbar render
    setTimeout(() => changeLanguage(savedLang), 50);
    
    // Load Cart Page if element exists
    if(document.getElementById('cart-items')) {
        loadCartPage();
    }
});

// ==============================================
// 5. NAVBAR & UI LOGIC
// ==============================================
function setupNavbar() {
    const user = getUser();
    const navContainer = document.getElementById('nav-actions');
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcon = isDark ? '☀️' : '🌙';
    
    const themeBtn = `<button id="theme-toggle-btn" class="theme-btn" onclick="toggleTheme()" title="Toggle Dark Mode" style="background:none; border:none; font-size:1.2rem; cursor:pointer; margin-right:10px; color:#fff;">${themeIcon}</button>`;
    
    // FULL LANGUAGE DROPDOWN
    const langHTML = `
        <select id="lang-selector" onchange="changeLanguage(this.value)" style="padding:5px; border-radius:5px; border:none; margin-right:10px; cursor:pointer; max-width:80px; background:#f4f4f4; color:#333; font-weight:bold;">
            <option value="en">🇺🇸 En</option>
            <option value="hi">🇮🇳 Hi</option>
            <option value="kn">🇮🇳 Kn</option>
            <option value="ta">🇮🇳 Ta</option>
            <option value="te">🇮🇳 Te</option>
            <option value="ur">🇵🇰 Ur</option>
            <option value="fr">🇫🇷 Fr</option>
            <option value="es">🇪🇸 Es</option>
        </select>`;

    if (navContainer) {
        const cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
        const count = cart.reduce((acc, item) => acc + item.qty, 0);

        if (user) {
            let adminLink = user.isAdmin ? `<a href="admin.html" style="color:#e67e22; font-weight:bold; margin-right:15px;" data-lang="admin">Admin</a>` : '';
            let dpSrc = user.dp ? getImgPath(user.dp) : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png';
            
            navContainer.innerHTML = `
                ${langHTML} ${themeBtn} ${adminLink}
                
                <a href="index.html" class="nav-link" style="text-decoration:none; color:#ffffff; font-weight:600; margin-right:15px; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-home" style="color:#ffffff;"></i> Home
                </a>
                
                <a href="contact.html" class="nav-link" style="text-decoration:none; color:#e67e22; font-weight:600; margin-right:15px; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-envelope" style="color:#e67e22;"></i> Contact
                </a>

                <a href="cart.html" id="cart-link" data-lang="cart" style="margin-right:15px; text-decoration:none; color:#ffffff; font-weight:600;">Cart (${count})</a>
                
                <a href="profile.html" style="display:flex; align-items:center; gap:10px; text-decoration:none; margin-right:15px;">
                    <img src="${dpSrc}" class="nav-profile-img" alt="Profile" onerror="this.src='https://cdn-icons-png.flaticon.com/512/1077/1077114.png'" style="width:30px; height:30px; border-radius:50%; object-fit:cover; border:1px solid #ccc;">
                    <span style="font-size:0.9rem; font-weight:bold; color:#ffffff;">${user.name.split(' ')[0]}</span>
                </a>
                
                <a href="#" onclick="logout()" style="font-size:0.85rem; opacity:0.9; text-decoration:none; color:#ffffff;" data-lang="logout">Logout</a>
            `;
        } else {
            navContainer.innerHTML = `
                ${langHTML} ${themeBtn} 
                
                <a href="index.html" class="nav-link" style="text-decoration:none; color:#ffffff; font-weight:600; margin-right:15px; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-home" style="color:#ffffff;"></i> Home
                </a>
                <a href="contact.html" class="nav-link" style="text-decoration:none; color:#e67e22; font-weight:600; margin-right:15px; display:flex; align-items:center; gap:5px;">
                    <i class="fas fa-envelope" style="color:#e67e22;"></i> Contact
                </a>

                <a href="cart.html" id="cart-link" data-lang="cart" style="margin-right:15px; text-decoration:none; color:#ffffff; font-weight:600;">Cart (${count})</a>
                <a href="login.html" data-lang="login" style="margin-right:10px; text-decoration:none; color:#ffffff; font-weight:600;">Login</a>
                <a href="login.html" class="btn" style="padding:8px 20px; font-size:0.9rem; color:white; text-decoration:none; background-color:#e67e22; border-radius:5px;" data-lang="signup">Signup</a>
            `;
        }
        const sel = document.getElementById('lang-selector');
        if(sel) sel.value = localStorage.getItem('language') || 'en';
    }
}

function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        if (translations[lang] && translations[lang][key]) el.innerText = translations[lang][key];
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
        const cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
        const count = cart.reduce((acc, item) => acc + item.qty, 0);
        cartLink.innerText = `${t.cart} (${count})`;
    }
    
    const loginLink = document.querySelector('a[data-lang="login"]');
    if(loginLink) loginLink.innerText = t.login;
    const signupBtn = document.querySelector('a[data-lang="signup"]');
    if(signupBtn) signupBtn.innerText = t.signup;
    const logoutLink = document.querySelector('a[data-lang="logout"]');
    if(logoutLink) logoutLink.innerText = t.logout;
    const adminLink = document.querySelector('a[data-lang="admin"]');
    if(adminLink) adminLink.innerText = t.admin;
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    location.reload();
}

// ==============================================
// 6. CART FUNCTIONS
// ==============================================
function addToCart(id, title, price, image) {
    let cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    const existing = cart.find(i => i.id === id);
    if (existing) existing.qty++; else cart.push({ id, title, price, image, qty: 1 });
    localStorage.setItem('shopmart_cart', JSON.stringify(cart));
    alert('Added to Cart!');
    updateCartCount();
    location.reload();
}

function removeFromCart(id) {
    let cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    cart = cart.filter(i => i.id !== id);
    localStorage.setItem('shopmart_cart', JSON.stringify(cart));
    loadCartPage();
    updateCartCount();
}

function loadCartPage() {
    const container = document.getElementById('cart-items');
    const totalElem = document.getElementById('cart-total');
    if (!container) return; 
    
    const cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    
    if (cart.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:2rem;">Your cart is empty.</td></tr>';
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
                <td style="padding:15px;"><button class="btn" style="background:#ff4d4d; padding:8px 15px; font-size:0.8rem;" onclick="removeFromCart(${item.id})">Remove</button></td>
            </tr>`;
    }).join('');
    if(totalElem) totalElem.innerText = total.toFixed(2);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('shopmart_cart')) || [];
    const count = cart.reduce((acc, i) => acc + i.qty, 0);
    const link = document.getElementById('cart-link');
    
    const currentLang = localStorage.getItem('language') || 'en';
    const label = translations[currentLang].cart;
    
    if(link) {
        link.innerText = `${label} (${count})`;
    }
}

function buyNow(id, title, price, image) {
    localStorage.setItem('checkout_items', JSON.stringify([{ id, title, price, image, qty: 1 }]));
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

// ==============================================
// 7. WISHLIST, OFFERS, SEARCH, CHATBOT
// ==============================================
async function toggleWishlist(btn, id) {
    if (!getToken()) return alert("Please login first.");
    btn.classList.toggle('active');
    btn.innerHTML = btn.classList.contains('active') ? '❤️' : '🤍';
    const res = await apiFetch('/wishlist', { method: 'POST', body: JSON.stringify({ product_id: id }) });
    if (!res.ok) { btn.classList.toggle('active'); alert("Error updating wishlist"); }
}

async function loadWishlistState() {
    if (!getToken()) return;
    try {
        const res = await apiFetch('/wishlist/ids');
        if (res.ok) {
            wishlistedIds = await res.json();
            document.querySelectorAll('.wishlist-btn').forEach(btn => {
                if (wishlistedIds.includes(parseInt(btn.dataset.id))) { 
                    btn.classList.add('active'); btn.innerHTML = '❤️'; 
                }
            });
        }
    } catch(e) {}
}

async function makeOffer(id, title) {
    if(!getToken()) return alert("Please login.");
    const price = prompt(`Enter offer for ${title} (₹):`);
    if(price) {
        const res = await apiFetch('/offers', { method: 'POST', body: JSON.stringify({ product_id: id, offer_price: price }) });
        if(res.ok) alert('Offer sent!'); else alert('Error sending offer.');
    }
}

// Live Search
async function initLiveSearch() {
    const searchInput = document.getElementById('search');
    if(!searchInput) return;

    let resultsBox = document.getElementById('search-results');
    if (!resultsBox) {
        resultsBox = document.createElement('div');
        resultsBox.id = 'search-results';
        resultsBox.className = 'search-dropdown';
        searchInput.parentNode.appendChild(resultsBox);
    }

    try { const res = await apiFetch('/products'); if (res.ok) searchProducts = await res.json(); } catch (e) {}

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        if(document.getElementById('product-grid')) {
            document.querySelectorAll('.card').forEach(c => {
                const title = c.querySelector('.card-title')?.innerText.toLowerCase() || "";
                c.style.display = title.includes(term) ? 'block' : 'none';
            });
        }
        resultsBox.innerHTML = '';
        if (term.length < 1) { resultsBox.style.display = 'none'; return; }
        
        const filtered = searchProducts.filter(p => p.title.toLowerCase().includes(term)).slice(0, 5);
        if (filtered.length > 0) {
            resultsBox.style.display = 'flex';
            resultsBox.innerHTML = filtered.map(p => 
                `<a href="product.html?id=${p.id}" class="search-item">
                    <img src="${getImgPath(p.image)}">
                    <div class="search-info"><h4>${p.title}</h4><span>₹${p.price}</span></div>
                </a>`
            ).join('');
        } else { resultsBox.style.display = 'none'; }
    });
    document.addEventListener('click', (e) => { if (!searchInput.contains(e.target)) resultsBox.style.display = 'none'; });
}

// Voice Search
function startVoiceSearch() {
    const searchInput = document.getElementById('search');
    if(!searchInput) return;
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) return alert("Browser does not support Voice Search.");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    searchInput.placeholder = "Listening...";
    recognition.onresult = (event) => {
        searchInput.value = event.results[0][0].transcript;
        searchInput.dispatchEvent(new Event('input'));
    };
}

// Chatbot
async function sendMessage() {
    const input = document.getElementById('chat-input');
    const msgBox = document.getElementById('chat-messages');
    const message = input.value.trim();

    if (!message) return;

    // 1. Add User Message to UI
    addMessageToUI("You", message, "user-msg");
    input.value = ""; 

    try {
        // 2. Send to Smart Backend
        const token = localStorage.getItem('token');
        if (!token) {
            addMessageToUI("Bot", "Please login to chat with me! 🔒", "bot-msg");
            return;
        }

        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ message })
        });

        // 3. SECURITY CHECK: HANDLE SESSION EXPIRED
        if (res.status === 401 || res.status === 403) {
            addMessageToUI("Bot", "Session expired. Please <a href='login.html' style='color:blue;'>Login again</a>.", "bot-msg");
            localStorage.removeItem('token'); // Clear bad token
            return;
        }

        const data = await res.json();
        addMessageToUI("Bot", data.reply, "bot-msg");

    } catch (err) {
        addMessageToUI("Bot", "Network Error. Is the server running?", "bot-msg");
    }
}

// Helper function to append HTML
function addMessageToUI(sender, text, className) {
    const msgBox = document.getElementById('chat-messages');
    if (!msgBox) return;
    const div = document.createElement('div');
    div.className = `message ${className}`; 
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    
    div.style.marginBottom = "10px";
    div.style.padding = "10px";
    div.style.borderRadius = "8px";
    div.style.maxWidth = "85%";
    
    if (className === 'bot-msg') {
        div.style.background = "#f1f1f1";
        div.style.alignSelf = "flex-start";
        div.style.color = "#333";
    } else {
        div.style.background = "#2d1b69";
        div.style.alignSelf = "flex-end";
        div.style.color = "white";
    }
    
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
}

// ==============================================
// 8. LOAD PRODUCTS (WITH FLIPKART STYLE OFFERS)
// ==============================================
async function loadProducts() {
    const grid = document.getElementById('product-grid');
    if (!grid) return; // Only run on pages with a product grid

    grid.innerHTML = '<p style="text-align:center; width:100%;">Loading products...</p>';

    try {
        // Fetch products from the backend
        const res = await apiFetch('/products');
        if (!res.ok) throw new Error("Failed to load");

        const products = await res.json();
        
        // Clear the loading message
        grid.innerHTML = '';

        // Loop through products and create cards
        products.forEach(product => {
            // ✅ USE THE SMART IMAGE PATH (Now with cache busting)
            const imgSrc = getImgPath(product.image);

            // --- 🧮 DISCOUNT MATH (Flipkart Style) ---
            // If MRP exists and is higher than price, calculate discount
            let discountBadge = '';
            let priceDisplay = `₹${product.price}`;
            
            if (product.mrp && product.mrp > product.price) {
                const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
                
                // Strike-through price + Green % off
                priceDisplay = `
                    <span style="font-size:1.1rem; font-weight:bold;">₹${product.price}</span>
                    <span style="text-decoration: line-through; color:#878787; font-size:0.9rem; margin-left:5px;">₹${Math.round(product.mrp)}</span>
                    <span style="color:#388e3c; font-weight:bold; font-size:0.9rem; margin-left:5px;">${off}% off</span>
                `;
                
                // Green Badge on top of image
                discountBadge = `<span style="position:absolute; top:10px; left:10px; background:#388e3c; color:white; padding:2px 8px; font-size:0.75rem; border-radius:4px; font-weight:bold;">${off}% OFF</span>`;
            }

            const card = document.createElement('div');
            card.className = 'card';
            card.style.position = 'relative'; // Important for the badge

            card.innerHTML = `
                <div style="position:relative; overflow:hidden;">
                    ${discountBadge}
                    <img src="${imgSrc}" class="card-img-top" alt="${product.title}" 
                        style="height:200px; object-fit:contain; padding:10px; transition:transform 0.3s;"
                        onerror="this.src='https://placehold.co/300x300?text=Product'">
                    <button class="wishlist-btn" data-id="${product.id}" onclick="toggleWishlist(this, ${product.id})">🤍</button>
                </div>
                <div class="card-body">
                    <h5 class="card-title" style="font-size:1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${product.title}</h5>
                    
                    <div class="card-price" style="margin-bottom:10px;">
                        ${priceDisplay}
                    </div>

                    <div style="display:flex; gap:5px;">
                        <button class="btn" style="flex:1; font-size:0.8rem;" onclick="addToCart(${product.id}, '${product.title}', ${product.price}, '${product.image}')">Add Cart</button>
                        <button class="btn" style="flex:1; font-size:0.8rem; background:#fb641b;" onclick="buyNow(${product.id}, '${product.title}', ${product.price}, '${product.image}')">Buy Now</button>
                    </div>
                    <div style="text-align:center; margin-top:5px;">
                         <button class="btn" style="background:none; color:blue; font-size:0.8rem; padding:0;" onclick="makeOffer(${product.id}, '${product.title}')">Make Offer</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        // Re-apply wishlist hearts
        loadWishlistState();

    } catch (err) {
        grid.innerHTML = '<p style="text-align:center; color:red;">Failed to load products. Is the server running?</p>';
        console.error(err);
    }
}