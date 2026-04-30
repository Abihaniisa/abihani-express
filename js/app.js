// ============================================
// ABIHANI EXPRESS v17 — Part 1: Core, Navigation, Auth, Messages
// ============================================
var supabase = window.supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
var allProducts = [], allCategories = [], allSubcategories = [], currentFilterCategory = null;
var isAdminLoggedIn = false, currentUserEmail = '', currentUserRole = '', loginTimestamp = 0;
var viewingAdminEmail = null, announcementText = CONFIG.UI_ANNOUNCEMENT_DEFAULT;
var pageHistoryStack = [], mockDataActive = CONFIG.MOCK_DATA_ENABLED !== false;
var mockProducts = [], mockCategories = [], mockSubcategories = [];
var currentDetailImages = [], currentDetailIndex = 0, detailSource = 'shop';
var sideImageCounter = 0, maintenanceModeActive = CONFIG.MAINTENANCE_MODE_ENABLED || false;
var currentDetailProduct = null, deferredPWA = null, haniTourActive = false, haniTourStep = 0;
var haniIdleTimer, haniClickCount = 0;

// ============ INIT ============
(function init() {
    var path = window.location.pathname.replace(/\//g, '') || 'home';
    if (path === 'index.html') path = 'home';
    pageHistoryStack = [path];
    history.replaceState({ page: path, isAppPage: true }, '', '/' + (path === 'home' ? '' : path));
    checkSessionExpiry();
})();

(function instantStatic() {
    document.getElementById('announcement-text').textContent = CONFIG.UI_ANNOUNCEMENT_DEFAULT;
    document.getElementById('nigeria-badge-display').textContent = CONFIG.NIGERIA_BADGE_TEXT;
    document.getElementById('eco-heading-display').textContent = CONFIG.ECO_HEADING;
    document.getElementById('eco-text-display').textContent = CONFIG.ECO_TEXT;
    document.getElementById('ceo-bio-display').textContent = CONFIG.CEO_BIO;
    document.getElementById('mission-display').textContent = CONFIG.OUR_MISSION;
    document.getElementById('shop-ceo-bio-display').textContent = CONFIG.CEO_BIO;
    document.getElementById('shop-mission-display').textContent = CONFIG.OUR_MISSION;
    document.getElementById('about-who-display').textContent = CONFIG.WHO_WE_ARE;
    document.getElementById('about-mission-display').textContent = CONFIG.OUR_MISSION;
    document.getElementById('about-ceo-display').textContent = CONFIG.CEO_BIO;
    var th = document.querySelector('#testimonials-section h3');
    if (th) th.textContent = CONFIG.TESTIMONIALS_HEADING;
    document.getElementById('about-logo-title').textContent = CONFIG.UI_ABOUT_LOGO_TITLE;
    document.getElementById('about-logo-text').textContent = CONFIG.UI_ABOUT_LOGO_TEXT;
    document.getElementById('about-logo-img').src = CONFIG.LOGO_URL;
    document.getElementById('ceo-image-display').src = CONFIG.CEO_IMAGE;
    document.getElementById('shop-ceo-img').src = CONFIG.CEO_IMAGE;
    document.getElementById('about-ceo-img').src = CONFIG.CEO_IMAGE;
    document.getElementById('ceo-wa-btn').href = 'https://wa.me/' + CONFIG.CEO_WHATSAPP.replace(/[^0-9]/g, '');
    document.getElementById('ceo-email-btn').href = 'mailto:' + CONFIG.CEO_EMAIL;
    document.getElementById('search-input').placeholder = CONFIG.UI_SEARCH_PLACEHOLDER;
    document.getElementById('trust-badges-container').innerHTML = CONFIG.TRUST_BADGES.map(function(b) { return '<div class="trust-item"><i class="fas ' + b.icon + '"></i><span>' + b.text + '</span></div>'; }).join('');
    document.getElementById('sustain-badges-container').innerHTML = CONFIG.SUSTAIN_BADGES.map(function(b) { return '<span><i class="fas ' + b.icon + '"></i> ' + b.text + '</span>'; }).join('');
    document.getElementById('artisan-section-container').innerHTML = '<div class="artisan-section"><div class="artisan-image"><img src="' + CONFIG.ARTISAN_IMAGE + '" alt="Artisan" loading="lazy"></div><div class="artisan-content"><span class="artisan-badge">' + CONFIG.ARTISAN_BADGE_TEXT + '</span><h3>' + CONFIG.ARTISAN_NAME + '</h3><p>' + CONFIG.ARTISAN_SHORT_STORY + '</p><button class="btn-secondary" onclick="openArtisanPopup()">' + CONFIG.ARTISAN_LEARN_MORE_BUTTON + '</button></div></div>';
    document.getElementById('profile-heading').textContent = CONFIG.UI_PROFILE_HEADING;
    document.getElementById('profile-subheading').textContent = CONFIG.UI_PROFILE_SUBHEADING;
    document.getElementById('profile-login-btn').textContent = CONFIG.UI_PROFILE_LOGIN_BTN;
    document.getElementById('profile-no-account').textContent = CONFIG.UI_PROFILE_NO_ACCOUNT;
    document.getElementById('profile-apply-btn').textContent = CONFIG.UI_PROFILE_APPLY_BTN;
    document.getElementById('profile-price-note').textContent = CONFIG.UI_PROFILE_PRICE_NOTE;
    var abtH3 = document.querySelector('#about-page .section-title h3');
    if (abtH3) abtH3.textContent = CONFIG.BOOKS_SECTION_TITLE;
    document.getElementById('social-links').innerHTML = '<a href="https://wa.me/' + CONFIG.WHATSAPP_NUMBER.replace(/[^0-9]/g, '') + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i></a><a href="' + CONFIG.FACEBOOK_URL + '" target="_blank" rel="noopener"><i class="fab fa-facebook"></i></a><a href="' + CONFIG.INSTAGRAM_URL + '" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a><a href="' + CONFIG.TWITTER_URL + '" target="_blank" rel="noopener"><i class="fab fa-twitter"></i></a>';
    document.getElementById('books-container').innerHTML = CONFIG.BOOKS.map(function(b, i) { return '<div class="book-card" onclick="openBookPopup(' + i + ')"><div class="book-image"><img src="' + b.cover + '" alt="' + b.title + '" loading="lazy"></div><div class="book-info"><h4>' + b.title + '</h4><p class="book-author">by ' + b.author + '</p><p class="book-price">' + b.price + '</p>' + (b.isFree ? '<span class="btn-book-download" onclick="event.stopPropagation();window.open(\'' + b.pdfUrl + '\',\'_blank\')"><i class="fas fa-download"></i> Download PDF</span>' : '<span class="btn-book-buy" onclick="event.stopPropagation();openBookPopup(' + i + ')"><i class="fab fa-whatsapp"></i> Preview & Buy</span>') + '</div></div>'; }).join('');
    document.getElementById('terms-content').innerHTML = '<h4>' + CONFIG.TERMS_TITLE + '</h4>' + CONFIG.TERMS_TEXT;
    document.getElementById('privacy-content').innerHTML = '<h4>' + CONFIG.PRIVACY_TITLE + '</h4>' + CONFIG.PRIVACY_TEXT;
    document.getElementById('hani-popup-avatar').src = CONFIG.HANI_IMAGE;
    document.getElementById('hani-tour-avatar').src = CONFIG.HANI_IMAGE;
    document.getElementById('hani-char-img').src = CONFIG.HANI_IMAGE;
    var haniEl = document.getElementById('hani-character');
var isDragging = false, startX, startY, startLeft, startTop, returnTimer;
function resetReturnTimer() {
    clearTimeout(returnTimer);
    returnTimer = setTimeout(function() {
        haniEl.style.transition = 'all 0.5s ease';
        haniEl.style.right = '20px'; haniEl.style.bottom = '100px';
        haniEl.style.left = 'auto'; haniEl.style.top = 'auto';
    }, 5000);
}
haniEl.addEventListener('mousedown', function(e) {
    isDragging = true; startX = e.clientX; startY = e.clientY;
    var rect = haniEl.getBoundingClientRect();
    startLeft = rect.left; startTop = rect.top;
    haniEl.style.transition = 'none';
    haniEl.style.right = 'auto'; haniEl.style.bottom = 'auto';
    haniEl.style.left = startLeft + 'px'; haniEl.style.top = startTop + 'px';
    e.preventDefault();
});
haniEl.addEventListener('touchstart', function(e) {
    isDragging = true; startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    var rect = haniEl.getBoundingClientRect();
    startLeft = rect.left; startTop = rect.top;
    haniEl.style.transition = 'none';
    haniEl.style.right = 'auto'; haniEl.style.bottom = 'auto';
    haniEl.style.left = startLeft + 'px'; haniEl.style.top = startTop + 'px';
});
document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    haniEl.style.left = (startLeft + e.clientX - startX) + 'px';
    haniEl.style.top = (startTop + e.clientY - startY) + 'px';
});
document.addEventListener('touchmove', function(e) {
    if (!isDragging) return;
    haniEl.style.left = (startLeft + e.touches[0].clientX - startX) + 'px';
    haniEl.style.top = (startTop + e.touches[0].clientY - startY) + 'px';
});
document.addEventListener('mouseup', function() {
    if (!isDragging) return; isDragging = false;
    var rect = haniEl.getBoundingClientRect();
    haniEl.style.transition = 'all 0.3s ease';
    if (rect.left + rect.width/2 < window.innerWidth/2) { haniEl.style.left = '12px'; haniEl.style.right = 'auto'; }
    else { haniEl.style.right = '12px'; haniEl.style.left = 'auto'; }
    resetReturnTimer();
});
document.addEventListener('touchend', function() {
    if (!isDragging) return; isDragging = false;
    var rect = haniEl.getBoundingClientRect();
    haniEl.style.transition = 'all 0.3s ease';
    if (rect.left + rect.width/2 < window.innerWidth/2) { haniEl.style.left = '12px'; haniEl.style.right = 'auto'; }
    else { haniEl.style.right = '12px'; haniEl.style.left = 'auto'; }
    resetReturnTimer();
});
resetReturnTimer();
    document.getElementById('pwa-install-avatar').src = CONFIG.HANI_IMAGE;
    renderHeroSlider();
    renderTestimonials();
    showAllSkeletons();
    updateNav();
    checkMaintenanceMode();
    loadDynamicData();
    initPWA();
    initHaniCharacter();
    checkFirstVisit();
})();

// ============ SESSION ============
function checkSessionExpiry() {
    var stored = localStorage.getItem('abihani_session');
    if (stored) {
        var session = JSON.parse(stored);
        var now = Date.now();
        if (now - session.timestamp > CONFIG.SESSION_DURATION_HOURS * 3600000) {
            localStorage.removeItem('abihani_session');
            isAdminLoggedIn = false; currentUserEmail = ''; currentUserRole = '';
        } else {
            isAdminLoggedIn = session.loggedIn;
            currentUserEmail = session.email;
            currentUserRole = session.role;
            loginTimestamp = session.timestamp;
        }
    }
}
function saveSession() {
    localStorage.setItem('abihani_session', JSON.stringify({
        loggedIn: isAdminLoggedIn, email: currentUserEmail, role: currentUserRole, timestamp: Date.now()
    }));
}

// ============ HANI POPUP SYSTEM ============
function showHaniPopup(title, message, actions, type) {
    document.getElementById('hani-popup-title').textContent = title;
    document.getElementById('hani-popup-message').textContent = message;
    var actDiv = document.getElementById('hani-popup-actions');
    actDiv.innerHTML = '';
    if (actions) {
        actions.forEach(function(a) {
            var btn = document.createElement('button');
            btn.className = a.primary ? 'btn-primary btn-sm' : 'btn-secondary btn-sm';
            btn.textContent = a.text;
            btn.onclick = a.action;
            btn.style.margin = '4px';
            actDiv.appendChild(btn);
        });
    }
    document.getElementById('hani-popup-overlay').style.display = 'flex';
    document.getElementById('hani-popup-card').className = 'hani-popup-card hani-popup-' + (type || 'info');
}
function closeHaniPopup() {
    document.getElementById('hani-popup-overlay').style.display = 'none';
}

// ============ HANI WELCOME TOUR ============
function checkFirstVisit() {
    if (localStorage.getItem('abihani_tour_done')) return;
    if (isAdminLoggedIn) return;
    setTimeout(function() { showHaniTourIntro(); }, 1500);
}
function showHaniTourIntro() {
    showHaniPopup(
        CONFIG.HANI_INTRO_TITLE,
        CONFIG.HANI_INTRO_TEXT,
        [
            { text: CONFIG.HANI_TOUR_YES, primary: true, action: function() { closeHaniPopup(); startHaniTour(); } },
            { text: CONFIG.HANI_TOUR_NO, primary: false, action: function() { closeHaniPopup(); showPWABanner(); } }
        ],
        'welcome'
    );
}
function startHaniTour() {
    haniTourActive = true; haniTourStep = 0;
    document.getElementById('hani-tour-overlay').style.display = 'flex';
    showTourStep(0);
}
function showTourStep(i) {
    var steps = CONFIG.HANI_TOUR_STEPS;
    if (i >= steps.length) { endHaniTour(); return; }
    haniTourStep = i;
    document.getElementById('hani-tour-title').textContent = steps[i].title;
    document.getElementById('hani-tour-text').textContent = steps[i].text;
    var actDiv = document.getElementById('hani-tour-actions');
    actDiv.innerHTML = '';
    if (i < steps.length - 1) {
        var nextBtn = document.createElement('button');
        nextBtn.className = 'btn-primary btn-sm'; nextBtn.textContent = 'Next →'; nextBtn.onclick = function() { showTourStep(i + 1); };
        actDiv.appendChild(nextBtn);
    } else {
        var doneBtn = document.createElement('button');
        doneBtn.className = 'btn-primary btn-sm'; doneBtn.textContent = 'Finish Tour 🎉'; doneBtn.onclick = endHaniTour;
        actDiv.appendChild(doneBtn);
    }
    var skipBtn = document.createElement('button');
    skipBtn.className = 'btn-secondary btn-sm'; skipBtn.textContent = 'Skip Tour'; skipBtn.onclick = endHaniTour;
    actDiv.appendChild(skipBtn);
    var dotsDiv = document.getElementById('hani-tour-dots');
    dotsDiv.innerHTML = '';
    for (var j = 0; j < steps.length; j++) {
        var dot = document.createElement('span');
        dot.className = 'hani-tour-dot' + (j === i ? ' active' : '');
        dotsDiv.appendChild(dot);
    }
    var el = document.querySelector(steps[i].selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function endHaniTour() {
    haniTourActive = false;
    document.getElementById('hani-tour-overlay').style.display = 'none';
    localStorage.setItem('abihani_tour_done', '1');
    showHaniPopup('Tour Complete! 🎉', CONFIG.HANI_TOUR_END_TEXT, [
        { text: 'Chat with Hani 💬', primary: true, action: function() { closeHaniPopup(); toggleHaniChat(); } },
        { text: 'Install App 📲', primary: false, action: function() { closeHaniPopup(); showPWABanner(); } },
        { text: 'Close 🌸', primary: false, action: closeHaniPopup }
    ], 'success');
}

// ============ HANI LIVING CHARACTER ============
function initHaniCharacter() {
    var char = document.getElementById('hani-character');
    char.style.display = 'flex';
    document.getElementById('hani-char-img').src = CONFIG.HANI_IMAGE;
    resetHaniIdle();
}
function resetHaniIdle() {
    clearTimeout(haniIdleTimer);
    var char = document.getElementById('hani-character');
    char.classList.remove('sleeping', 'dancing', 'waving', 'eyes-covered');
    document.getElementById('hani-char-status').textContent = '';
    haniIdleTimer = setTimeout(function() {
        char.classList.add('sleeping');
        document.getElementById('hani-char-status').textContent = 'Zzz...';
    }, 15000);
}
function toggleHaniChat() {
    var char = document.getElementById('hani-character');
    char.classList.add('waving');
    document.getElementById('hani-char-status').textContent = 'Hi! 👋';
    setTimeout(function() { char.classList.remove('waving'); document.getElementById('hani-char-status').textContent = ''; }, 1500);
    resetHaniIdle();
    if (window.botpressWebChat) { window.botpressWebChat.sendEvent({ type: 'show' }); }
}

// ============ PWA ============
function initPWA() {
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault();
        deferredPWA = e;
        if (!localStorage.getItem('abihani_tour_done')) return;
        setTimeout(function() { showPWABanner(); }, 3000);
    });
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').then(function(r) { console.log('PWA ready'); }).catch(function(e) { console.log('SW failed', e); });
        });
    }
}
function showPWABanner() {
    if (!deferredPWA) return;
    document.getElementById('pwa-install-banner').style.display = 'flex';
}
function closePWAInstall() { document.getElementById('pwa-install-banner').style.display = 'none'; }
function installPWA() {
    if (deferredPWA) {
        deferredPWA.prompt();
        deferredPWA.userChoice.then(function(r) {
            if (r.outcome === 'accepted') { document.getElementById('pwa-install-banner').style.display = 'none'; deferredPWA = null; }
        });
    }
}

// ============ SKELETON ============
function showAllSkeletons() {
    var fp = document.getElementById('featured-products');
    if (fp) fp.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
    var ag = document.getElementById('all-products-grid');
    if (ag) ag.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
    var ch = document.getElementById('categories-home');
    if (ch) ch.innerHTML = '<div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div>';
    var scf = document.getElementById('shop-categories-filter');
    if (scf) scf.innerHTML = '<div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div>';
}

// ============ DYNAMIC DATA ============
async function loadDynamicData() {
    var c = await supabase.from('categories').select('*').order('sort_order');
    allCategories = c.data || [];
    var s = await supabase.from('subcategories').select('*');
    allSubcategories = s.data || [];
    var p = await supabase.from('products').select('*').order('id');
    allProducts = p.data || [];
    var a = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (a.data) {
        if (a.data.announcement_text) { announcementText = a.data.announcement_text; var atEl = document.getElementById('announcement-text'); if (atEl) atEl.textContent = announcementText; }
        if (a.data.mock_data_enabled !== undefined) mockDataActive = a.data.mock_data_enabled;
        if (a.data.maintenance_mode !== undefined) maintenanceModeActive = a.data.maintenance_mode;
    }
    if (mockDataActive) mergeMockData();
    updateCategoriesHome();
    updateShopCategories();
    updateFeaturedProducts();
    var ag = document.getElementById('all-products-grid');
    if (ag) renderAllProducts();
}

// ============ MOCK DATA ============
function generateMockData(count) {
    mockCategories = []; mockSubcategories = []; mockProducts = [];
    for (var i = 0; i < CONFIG.MOCK_DATA_CATEGORIES.length; i++) {
        var cat = CONFIG.MOCK_DATA_CATEGORIES[i];
        mockCategories.push({ id: 'mock-cat-' + i, name: cat.name, emoji: cat.emoji, sort_order: i + 1, owner_email: 'mock', is_mock: true });
    }
    for (var j = 0; j < CONFIG.MOCK_DATA_SUBCATEGORIES.length; j++) {
        var sub = CONFIG.MOCK_DATA_SUBCATEGORIES[j];
        mockSubcategories.push({ id: 'mock-sub-' + j, name: sub.name, category_id: 'mock-cat-' + sub.categoryIndex, owner_email: 'mock', is_mock: true });
    }
    for (var k = 0; k < count; k++) {
        var rsi = Math.floor(Math.random() * mockSubcategories.length);
        var rs = mockSubcategories[rsi];
        var rni = Math.floor(Math.random() * CONFIG.MOCK_PRODUCT_NAMES.length);
        var rii = Math.floor(Math.random() * CONFIG.MOCK_DATA_ICONS.length);
        var price = Math.floor(Math.random() * 95000) + 5000;
        var discount = Math.random() < 0.3 ? Math.floor(Math.random() * 40) + 5 : 0;
        var stock = Math.floor(Math.random() * 50) + 1;
        var rating = (Math.random() * 2) + 3;
        var featured = Math.random() < (CONFIG.MOCK_DATA_FEATURE_PERCENT / 100);
        mockProducts.push({
            id: 'mock-prod-' + k, name: CONFIG.MOCK_PRODUCT_NAMES[rni], price: price,
            category_id: rs.category_id, subcategory_id: rs.id,
            description: 'Mock product for display.', image_url: '', image_urls: '[]',
            image_icon: CONFIG.MOCK_DATA_ICONS[rii], rating: parseFloat(rating.toFixed(1)),
            review_count: Math.floor(Math.random() * 235) + 12, stock_quantity: stock,
            discount_percent: discount, vendor: CONFIG.PRODUCT_DEFAULT_VENDOR,
            location: CONFIG.PRODUCT_DEFAULT_LOCATION, featured: featured,
            owner_email: 'mock', owner_whatsapp: CONFIG.WHATSAPP_NUMBER, is_mock: true
        });
    }
}
function mergeMockData() {
    if (mockProducts.length === 0) generateMockData(CONFIG.MOCK_DATA_PRODUCT_COUNT || 20);
    for (var i = 0; i < mockCategories.length; i++) { if (!allCategories.find(function(c) { return c.id === mockCategories[i].id; })) allCategories.push(mockCategories[i]); }
    for (var j = 0; j < mockSubcategories.length; j++) { if (!allSubcategories.find(function(s) { return s.id === mockSubcategories[j].id; })) allSubcategories.push(mockSubcategories[j]); }
    for (var k = 0; k < mockProducts.length; k++) { if (!allProducts.find(function(p) { return p.id === mockProducts[k].id; })) allProducts.push(mockProducts[k]); }
}
async function toggleMockData(enabled) {
    mockDataActive = enabled;
    await supabase.from('site_settings').update({ mock_data_enabled: enabled }).eq('id', 1);
    if (enabled) { generateMockData(CONFIG.MOCK_DATA_PRODUCT_COUNT || 20); mergeMockData(); }
    else { allCategories = allCategories.filter(function(c) { return !c.is_mock; }); allSubcategories = allSubcategories.filter(function(s) { return !s.is_mock; }); allProducts = allProducts.filter(function(p) { return !p.is_mock; }); mockCategories = []; mockSubcategories = []; mockProducts = []; }
    updateCategoriesHome(); updateShopCategories(); updateFeaturedProducts();
    var ag = document.getElementById('all-products-grid'); if (ag) renderAllProducts();
    if (isAdminLoggedIn) renderAdminPanels();
}
function generateMockCount() {
    if (!mockDataActive) { showHaniPopup('Mock Data Off', 'Turn on mock data first.', null, 'info'); return; }
    var countEl = document.getElementById('mock-data-count');
    var count = parseInt(countEl ? countEl.value : 20) || 20;
    allProducts = allProducts.filter(function(p) { return !p.is_mock; });
    allCategories = allCategories.filter(function(c) { return !c.is_mock; });
    allSubcategories = allSubcategories.filter(function(s) { return !s.is_mock; });
    mockCategories = []; mockSubcategories = []; mockProducts = [];
    generateMockData(count); mergeMockData();
    updateCategoriesHome(); updateShopCategories(); updateFeaturedProducts();
    var ag = document.getElementById('all-products-grid'); if (ag) renderAllProducts();
    renderAdminPanels();
    showHaniPopup('Generated! 🎲', count + ' mock products created!', null, 'success');
    setTimeout(closeHaniPopup, 5000);
}
function setMockFeaturePercent() {
    if (!mockDataActive) { showHaniPopup('Mock Data Off', 'Turn on mock data first.', null, 'info'); return; }
    var percentEl = document.getElementById('mock-feature-percent');
    var percent = parseInt(percentEl ? percentEl.value : 25) || 25;
    percent = Math.max(0, Math.min(100, percent));
    for (var i = 0; i < mockProducts.length; i++) { mockProducts[i].featured = Math.random() * 100 < percent; }
    for (var j = 0; j < allProducts.length; j++) { if (allProducts[j].is_mock) { var nm = mockProducts.find(function(mp) { return mp.id === allProducts[j].id; }); if (nm) allProducts[j].featured = nm.featured; } }
    updateFeaturedProducts(); renderAdminPanels();
    showHaniPopup('Featured! ⭐', percent + '% of mock products now featured!', null, 'success');
    setTimeout(closeHaniPopup, 5000);
}
async function randomizeMockData() {
    if (!mockDataActive) { showHaniPopup('Mock Data Off', 'Turn on mock data first.', null, 'info'); return; }
    for (var i = 0; i < mockProducts.length; i++) { mockProducts[i].price = Math.floor(Math.random() * 95000) + 5000; mockProducts[i].discount_percent = Math.random() < 0.3 ? Math.floor(Math.random() * 40) + 5 : 0; mockProducts[i].stock_quantity = Math.floor(Math.random() * 50) + 1; mockProducts[i].rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); }
    for (var j = 0; j < allProducts.length; j++) { if (allProducts[j].is_mock) { var nm = mockProducts.find(function(mp) { return mp.id === allProducts[j].id; }); if (nm) { allProducts[j].price = nm.price; allProducts[j].discount_percent = nm.discount_percent; allProducts[j].stock_quantity = nm.stock_quantity; allProducts[j].rating = nm.rating; } } }
    updateFeaturedProducts(); var ag = document.getElementById('all-products-grid'); if (ag) renderAllProducts();
    showHaniPopup('Randomized! 🎲', 'Mock data refreshed!', null, 'success');
    setTimeout(closeHaniPopup, 5000);
}

// ============ MAINTENANCE ============
async function checkMaintenanceMode() {
    if (!maintenanceModeActive) return;
    var bp = CONFIG.MAINTENANCE_MODE_BYPASS_PATH || '/admin';
    if (window.location.pathname === bp) return;
    var ms = await supabase.from('site_settings').select('maintenance_mode').eq('id', 1).single();
    if (ms.data && ms.data.maintenance_mode === true) showMaintenanceScreen();
}
function showMaintenanceScreen() {
    document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#3d2a18 0%,#2c1f10 30%,#1a1008 70%,#0d0804 100%);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:Inter,sans-serif;"><div style="text-align:center;max-width:500px;">' + (CONFIG.MAINTENANCE_MODE_SHOW_ANIMATION ? '<div style="margin-bottom:24px;animation:mf 3s ease-in-out infinite;"><div style="width:80px;height:80px;border-radius:50%;border:3px solid rgba(184,124,79,0.3);border-top-color:#b87c4f;animation:ms 2s linear infinite;margin:0 auto;"></div></div>' : '') + '<img src="' + CONFIG.LOGO_URL + '" style="width:100px;height:100px;border-radius:50%;margin-bottom:20px;border:2px solid rgba(184,124,79,0.4);"><h1 style="font-family:Playfair Display,serif;color:#d49b6a;font-size:28px;margin-bottom:12px;">' + CONFIG.MAINTENANCE_MODE_TITLE + '</h1><p style="color:#cbbcaa;font-size:14px;line-height:1.7;margin-bottom:24px;">' + CONFIG.MAINTENANCE_MODE_MESSAGE + '</p><a href="' + CONFIG.MAINTENANCE_MODE_BYPASS_PATH + '" style="color:rgba(184,124,79,0.4);font-size:10px;text-decoration:none;">' + CONFIG.MAINTENANCE_MODE_ADMIN_LINK_TEXT + '</a></div></div><style>@keyframes mf{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}@keyframes ms{to{transform:rotate(360deg)}}</style>';
    document.body.style.overflow = 'hidden';
}
async function toggleMaintenanceMode(enabled) {
    maintenanceModeActive = enabled;
    await supabase.from('site_settings').update({ maintenance_mode: enabled }).eq('id', 1);
    showHaniPopup(enabled ? 'Maintenance ON 🔧' : 'Maintenance OFF ✅', enabled ? 'Site is sleeping. Only admins can peek inside.' : 'Site is live! Everyone can visit now.', null, 'info');
    if (isAdminLoggedIn) renderAdminPanels();
    setTimeout(closeHaniPopup, 5000);
}

// ============ HERO SLIDER ============
function renderHeroSlider() {
    var track = document.getElementById('slider-track'), dots = document.getElementById('slider-dots');
    if (!track || !dots) return;
    track.innerHTML = CONFIG.SLIDES.map(function(s, i) { return '<div class="slide' + (i === 0 ? ' active' : '') + '"><h2>' + s.title + '</h2><p>' + s.subtitle + '</p></div>'; }).join('');
    dots.innerHTML = CONFIG.SLIDES.map(function(_, i) { return '<span class="dot' + (i === 0 ? ' active' : '') + '" onclick="goToSlide(' + i + ')"></span>'; }).join('');
}
var slideIdx = 0;
setInterval(function() {
    var slides = document.querySelectorAll('#hero-slider .slide'), dots = document.querySelectorAll('#hero-slider .dot');
    if (!slides.length) return;
    slideIdx = (slideIdx + 1) % slides.length;
    for (var i = 0; i < slides.length; i++) { slides[i].classList.remove('active'); dots[i].classList.remove('active'); }
    slides[slideIdx].classList.add('active'); dots[slideIdx].classList.add('active');
}, 5000);
function goToSlide(idx) {
    slideIdx = idx;
    var slides = document.querySelectorAll('#hero-slider .slide'), dots = document.querySelectorAll('#hero-slider .dot');
    for (var i = 0; i < slides.length; i++) { slides[i].classList.remove('active'); dots[i].classList.remove('active'); }
    if (slides[idx]) slides[idx].classList.add('active');
    if (dots[idx]) dots[idx].classList.add('active');
}

// ============ TESTIMONIALS ============
var testimonialInterval;
function renderTestimonials() {
    var c = document.getElementById('testimonials-carousel'); if (!c) return;
    var t = CONFIG.TESTIMONIALS[Math.floor(Math.random() * CONFIG.TESTIMONIALS.length)];
    c.innerHTML = '<p class="testimonial-quote">"' + t.quote + '"</p><p class="testimonial-name">— ' + t.name + '</p><p class="testimonial-location">' + t.location + '</p><div class="testimonial-dots"><span class="testimonial-dot active"></span><span class="testimonial-dot"></span><span class="testimonial-dot"></span></div>';
}
function rotateTestimonial() {
    var c = document.getElementById('testimonials-carousel'); if (!c) return;
    c.classList.add('crossfade-out');
    setTimeout(function() {
        var t = CONFIG.TESTIMONIALS[Math.floor(Math.random() * CONFIG.TESTIMONIALS.length)];
        c.innerHTML = '<p class="testimonial-quote">"' + t.quote + '"</p><p class="testimonial-name">— ' + t.name + '</p><p class="testimonial-location">' + t.location + '</p><div class="testimonial-dots"><span class="testimonial-dot active"></span><span class="testimonial-dot"></span><span class="testimonial-dot"></span></div>';
        c.classList.remove('crossfade-out');
    }, 400);
}
testimonialInterval = setInterval(rotateTestimonial, 5000);

// ============ NAVIGATION (Clean URLs) ============
var validAppPages = ['home','shop','search','about','contact','profile','admin-login','admin-dashboard','product-detail','terms','privacy','admin-requests','admin-partners','viewing-partner'];

function navigateTo(pageName, addToHistory) {
    if (addToHistory === undefined) addToHistory = true;
    if (pageName === 'profile' && isAdminLoggedIn) { pageName = 'admin-dashboard'; }
    if (pageName === 'admin-dashboard' && !isAdminLoggedIn) { pageName = 'profile'; }
    if (pageName === 'admin-requests') { showPage('admin-dashboard'); showAdminRequests(); pushToHistory('admin-requests'); return; }
    if (pageName === 'admin-partners') { showPage('admin-dashboard'); showAdminPartners(); pushToHistory('admin-partners'); return; }
    if (pageName === 'admin-dashboard') { showPage('admin-dashboard'); renderAdminPanels(); pushToHistory('admin-dashboard'); return; }
    if (pageName === 'product-detail') return;
    showPage(pageName);
    if (addToHistory && pageName !== pageHistoryStack[pageHistoryStack.length - 1]) pushToHistory(pageName);
}
function pushToHistory(page) {
    pageHistoryStack.push(page);
    var url = '/' + (page === 'home' ? '' : page);
    history.pushState({ page: page, isAppPage: true }, '', url);
}
function goBackSmart() {
    if (pageHistoryStack.length <= 1) { navigateTo('home', false); return; }
    pageHistoryStack.pop();
    var prev = pageHistoryStack[pageHistoryStack.length - 1];
    if (validAppPages.indexOf(prev) === -1) prev = 'home';
    var url = '/' + (prev === 'home' ? '' : prev);
    history.pushState({ page: prev, isAppPage: true }, '', url);
    if (prev === 'viewing-partner') { viewingAdminEmail = null; showPage('admin-dashboard'); showAdminPartners(); }
    else if (prev === 'admin-requests') { showPage('admin-dashboard'); showAdminRequests(); }
    else if (prev === 'admin-partners') { showPage('admin-dashboard'); showAdminPartners(); }
    else if (prev === 'product-detail') { showPage(detailSource || 'shop'); }
    else showPage(prev);
}
function showPage(pageName) {
    window.scrollTo(0, 0);
    if (pageName === 'profile' && isAdminLoggedIn) { navigateTo('admin-dashboard', false); return; }
    if (pageName === 'admin-dashboard' && !isAdminLoggedIn) { navigateTo('profile', false); return; }
    document.querySelectorAll('.page-section').forEach(function(p) { p.classList.remove('active-page'); });
    var map = { 'home': 'home-page', 'shop': 'shop-page', 'product-detail': 'product-detail-page', 'search': 'search-page', 'about': 'about-page', 'contact': 'contact-page', 'terms': 'terms-page', 'privacy': 'privacy-page', 'profile': 'profile-page', 'admin-login': 'admin-login-page', 'admin-dashboard': 'admin-dashboard-page' };
    if (pageName === 'admin-dashboard') {
        var ctn = document.getElementById('admin-dashboard-content');
        if (ctn) ctn.innerHTML = '<div style="text-align:center;padding:60px 20px;"><div class="spinner" style="width:40px;height:40px;border-width:3px;border-color:rgba(184,124,79,0.2);border-top-color:#b87c4f;margin:0 auto 16px;"></div><p style="color:var(--text-muted);font-size:14px;">Loading admin panel...</p></div>';
    }
    var target = document.getElementById(map[pageName]); if (target) target.classList.add('active-page');
    if (pageName === 'shop') renderAllProducts();
    if (pageName === 'search') { var sr = document.getElementById('search-results'); if (sr) sr.innerHTML = ''; var si = document.getElementById('search-input'); if (si) si.value = ''; }
    updateNav();
    updatePageHistory(pageName);
}
function updatePageHistory(page) { if (pageHistoryStack[pageHistoryStack.length - 1] !== page) pageHistoryStack.push(page); }
function updateNav() {
    var path = window.location.pathname.replace(/\//g, '') || 'home';
    var nm = { home: 'nav-home', shop: 'nav-shop', search: 'nav-search', profile: 'nav-profile', about: 'nav-home', contact: 'nav-home', terms: 'nav-home', privacy: 'nav-home', 'admin-login': 'nav-profile', 'admin-dashboard': 'nav-profile', 'admin-requests': 'nav-profile', 'admin-partners': 'nav-profile', 'viewing-partner': 'nav-profile', 'product-detail': 'nav-shop' };
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var tid = nm[path] || 'nav-home';
    var an = document.getElementById(tid);
    if (an) an.classList.add('active');
    document.querySelectorAll('.desktop-nav a').forEach(function(a) { a.classList.remove('active'); });
    var da = document.querySelector('.desktop-nav a[data-page="' + path + '"]');
    if (da) da.classList.add('active');
}
window.addEventListener('popstate', function(e) {
    var state = e.state;
    if (!state || !state.isAppPage) { navigateTo('home', false); return; }
    var path = state.page || 'home';
    pageHistoryStack = pageHistoryStack.filter(function(p) { return p !== path; });
    pageHistoryStack.push(path);
    if (validAppPages.indexOf(path) === -1) { navigateTo('home', false); return; }
    if (path === 'admin-requests') { showPage('admin-dashboard'); showAdminRequests(); }
    else if (path === 'admin-partners') { showPage('admin-dashboard'); showAdminPartners(); }
    else if (path === 'viewing-partner') { viewingAdminEmail = null; showPage('admin-dashboard'); showAdminPartners(); }
    else if (path === 'product-detail') { navigateTo('shop', false); }
    else showPage(path);
});
var initPath = window.location.pathname.replace(/\//g, '') || 'home';
(function() { pageHistoryStack = [initPath]; showPage(initPath); })();

// ============ DOM ============
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(e) {
        var menu = document.getElementById('mobile-menu'), toggle = document.getElementById('menu-toggle');
        if (menu && menu.classList.contains('show') && !menu.contains(e.target) && e.target !== toggle && !toggle.contains(e.target)) menu.classList.remove('show');
    });
    var mt = document.getElementById('menu-toggle'); if (mt) mt.addEventListener('click', function(e) { e.stopPropagation(); var m = document.getElementById('mobile-menu'); if (m) m.classList.toggle('show'); });
    window.addEventListener('scroll', function() {
        var m = document.getElementById('mobile-menu'); if (m && m.classList.contains('show')) m.classList.remove('show');
        var b = document.getElementById('scroll-to-top'); if (b) b.classList.toggle('visible', window.scrollY > 300);
    });
    var ti = document.getElementById('toggle-password'), pi = document.getElementById('admin-password');
    if (ti && pi) ti.addEventListener('click', function() { if (pi.type === 'password') { pi.type = 'text'; this.className = 'fas fa-eye'; } else { pi.type = 'password'; this.className = 'fas fa-eye-slash'; } });
    document.getElementById('login-btn').addEventListener('click', function(e) { e.preventDefault(); adminLogin(); });
    var si = document.getElementById('search-input'); if (si) si.addEventListener('input', function() { searchProducts(); });
    document.addEventListener('click', function(e) {
        var tgt = e.target.closest('button, .category-pill, .nav-item'); if (!tgt || tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA') return;
        var ripple = document.createElement('span'); ripple.className = 'ripple';
        var rect = tgt.getBoundingClientRect(), size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px'; ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        tgt.style.position = tgt.style.position || 'relative'; tgt.style.overflow = 'hidden';
        tgt.appendChild(ripple); setTimeout(function() { ripple.remove(); }, 500);
    });
    checkExistingApplication();
});

// ============ PRODUCT CARDS ============
function productCardHTML(p) {
    var stars = '';
    var full = Math.floor(p.rating || CONFIG.PRODUCT_DEFAULT_RATING);
    var half = (p.rating % 1) >= 0.5;
    var empty = 5 - full - (half ? 1 : 0);
    for (var i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    for (var i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
    var rc = (p.review_count && p.review_count > 0) ? p.review_count : Math.floor(Math.random() * 235) + 12;
    var imgHtml = p.image_url ? '<img src="' + p.image_url + '" alt="' + p.name + '" loading="lazy">' : '<div style="font-size:40px;display:flex;align-items:center;justify-content:center;height:100%;">' + (p.image_icon || CONFIG.PRODUCT_DEFAULT_ICON) + '</div>';
    var priceHtml = '<div class="product-price">₦' + (p.price ? p.price.toLocaleString() : '0') + '</div>';
    if (p.discount_percent > 0) {
        var sp = Math.round(p.price * (1 - p.discount_percent / 100));
        priceHtml = '<div class="product-price"><span style="text-decoration:line-through;color:var(--text-muted);font-size:14px;">₦' + p.price.toLocaleString() + '</span> ₦' + sp.toLocaleString() + ' <span style="background:#e74c3c;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px;">-' + p.discount_percent + '%</span></div>';
    }
    return '<div class="product-card" onclick="showProductDetail(\'' + p.id + '\', \'shop\')"><div class="product-image">' + imgHtml + '</div><div class="product-info"><h4>' + (p.name || '') + '</h4>' + priceHtml + '<div class="product-rating">' + stars + ' (' + rc + ')</div><div class="product-vendor"><i class="fas fa-store"></i> ' + (p.vendor || CONFIG.PRODUCT_DEFAULT_VENDOR) + '</div><button class="btn-wa-small" onclick="event.stopPropagation();buyNow(\'' + p.id + '\')"><i class="fab fa-whatsapp"></i> ' + CONFIG.UI_BUY_NOW + '</button></div></div>';
}
function updateFeaturedProducts() {
    var c = document.getElementById('featured-products'); if (!c) return;
    var feat = allProducts.filter(function(p) { return p.featured; });
    feat = feat.sort(function() { return 0.5 - Math.random(); }).slice(0, CONFIG.FEATURED_PRODUCTS_DISPLAY_COUNT || 8);
    c.innerHTML = feat.length ? feat.map(productCardHTML).join('') : '<div class="empty-state"><i class="fas fa-box-open"></i><p>' + CONFIG.UI_NO_FEATURED_PRODUCTS + '</p></div>';
}
function renderAllProducts() {
    var c = document.getElementById('all-products-grid'); if (!c) return;
    var items = currentFilterCategory ? allProducts.filter(function(p) { return p.category_id == currentFilterCategory; }) : allProducts;
    c.innerHTML = items.length ? items.map(productCardHTML).join('') : '<div class="empty-state"><i class="fas fa-box-open"></i><p>' + CONFIG.EMPTY_PRODUCTS + '</p></div>';
}

// ============ PRODUCT DETAIL ============
function showProductDetail(id, source) {
    if (source) detailSource = source;
    var p = allProducts.find(function(x) { return x.id == id; });
    if (!p) return;
    currentDetailProduct = p;
    var imgs = [];
    try { imgs = JSON.parse(p.image_urls || '[]'); } catch (e) {}
    if (p.image_url) imgs.unshift(p.image_url);
    currentDetailImages = imgs; currentDetailIndex = 0;
    var mainImg = imgs.length ? imgs[0] : '';
    var arrowNav = '';
    if (imgs.length > 1) {
        arrowNav = '<div class="detail-arrow-nav"><button class="detail-arrow detail-prev" onclick="navigateDetailImage(-1)"><i class="fas fa-chevron-left"></i></button><button class="detail-arrow detail-next" onclick="navigateDetailImage(1)"><i class="fas fa-chevron-right"></i></button></div><div class="detail-dots">' + imgs.map(function(_, idx) { return '<span class="detail-dot' + (idx === 0 ? ' active' : '') + '" onclick="jumpToDetailImage(' + idx + ')"></span>'; }).join('') + '</div>';
    }
    var priceHtml = '₦' + p.price.toLocaleString();
    if (p.discount_percent > 0) {
        var sp = Math.round(p.price * (1 - p.discount_percent / 100));
        priceHtml = '<span style="text-decoration:line-through;color:var(--text-muted);">₦' + p.price.toLocaleString() + '</span> <span style="color:var(--accent);">₦' + sp.toLocaleString() + '</span> <span style="background:#e74c3c;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px;">-' + p.discount_percent + '%</span>';
    }
    document.getElementById('detail-back-label').textContent = detailSource === 'search' ? 'Back to Search' : 'Back to Shop';
    document.getElementById('product-share-container').innerHTML = '<button class="btn-secondary btn-sm" onclick="shareProduct(\'' + p.id + '\')"><i class="fas fa-share-alt"></i> Share</button>';
    document.getElementById('product-detail-container').innerHTML = '<div class="product-detail-container"><div class="product-detail-image"><div class="detail-image-wrapper"><img id="detail-main-img" src="' + (mainImg || 'https://placehold.co/400x400/e6d5c0/8b5a2b?text=' + encodeURIComponent(p.name || '')) + '" alt="' + p.name + '">' + arrowNav + '</div></div><div class="product-detail-info"><h1>' + p.name + '</h1><div class="product-detail-price">' + priceHtml + '</div><p>⭐ ' + (p.rating || CONFIG.PRODUCT_DEFAULT_RATING) + ' (' + (p.review_count || 0) + ' reviews)</p><p><i class="fas fa-map-marker-alt"></i> ' + (p.location || CONFIG.PRODUCT_DEFAULT_LOCATION) + '</p><p><i class="fas fa-store"></i> ' + (p.vendor || CONFIG.PRODUCT_DEFAULT_VENDOR) + '</p><p>' + (p.description || '') + '</p><button class="btn-primary" onclick="buyNow(\'' + p.id + '\')"><i class="fab fa-whatsapp"></i> Buy Now via WhatsApp</button><button class="btn-secondary" style="margin-top:12px;" onclick="navigateTo(\'' + detailSource + '\')">← Back</button></div></div>';
    var related = allProducts.filter(function(r) { return r.id != p.id && r.category_id == p.category_id; });
    related = related.sort(function() { return 0.5 - Math.random(); }).slice(0, CONFIG.UI_RELATED_PRODUCTS_COUNT);
    document.getElementById('related-products-scroll').innerHTML = related.map(productCardHTML).join('');
    document.getElementById('related-products-section').style.display = 'block';
    pushToHistory('product-detail');
    showPage('product-detail');
}
function navigateDetailImage(d) {
    if (!currentDetailImages.length) return;
    currentDetailIndex = (currentDetailIndex + d + currentDetailImages.length) % currentDetailImages.length;
    document.getElementById('detail-main-img').src = currentDetailImages[currentDetailIndex];
    document.querySelectorAll('.detail-dot').forEach(function(dot, i) { dot.classList.toggle('active', i === currentDetailIndex); });
}
function jumpToDetailImage(i) {
    currentDetailIndex = i;
    document.getElementById('detail-main-img').src = currentDetailImages[i];
    document.querySelectorAll('.detail-dot').forEach(function(dot, j) { dot.classList.toggle('active', j === i); });
}

// ============ SEARCH ============
var searchTimer;
function searchProducts() {
    var q = (document.getElementById('search-input').value || '').toLowerCase().trim();
    var r = document.getElementById('search-results'); if (!r) return;
    clearTimeout(searchTimer);
    if (!q) { r.innerHTML = ''; return; }
    r.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
    searchTimer = setTimeout(function() {
        var results = allProducts.filter(function(p) {
            if (p.name && p.name.toLowerCase().indexOf(q) !== -1) return true;
            if (p.description && p.description.toLowerCase().indexOf(q) !== -1) return true;
            var cat = allCategories.find(function(c) { return c.id == p.category_id; });
            if (cat && cat.name.toLowerCase().indexOf(q) !== -1) return true;
            return false;
        });
        r.innerHTML = results.length ? results.map(productCardHTML).join('') : '<div class="empty-state"><i class="fas fa-search"></i><p>' + CONFIG.EMPTY_SEARCH + '</p></div>';
    }, 300);
}

// ============ ADMIN LOGIN ============
async function adminLogin() {
    var email = document.getElementById('admin-email').value.trim();
    var password = document.getElementById('admin-password').value;
    var btn = document.getElementById('login-btn'); var toast = document.getElementById('login-toast');
    if (!email || !password) { showLoginToast(CONFIG.LOGIN_FIELDS_EMPTY, 'error'); return; }
    setBtnLoading(btn, 'Logging in...');
    if (CONFIG.ADMIN_CEO_EMAILS.indexOf(email) !== -1) {
        var auth = await supabase.auth.signInWithPassword({ email: email, password: password });
        if (auth.error) { resetBtn(btn, CONFIG.UI_LOGIN_BTN); showLoginToast(CONFIG.LOGIN_WRONG_PASSWORD, 'error'); return; }
        var ceoCheck = await supabase.from('admins').select('*').eq('email', email).single();
        if (!ceoCheck.data) { await supabase.auth.signOut(); resetBtn(btn, CONFIG.UI_LOGIN_BTN); showLoginToast('CEO record not found.', 'error'); return; }
        isAdminLoggedIn = true; currentUserEmail = email; currentUserRole = 'Owner'; loginTimestamp = Date.now();
        saveSession(); resetBtn(btn, CONFIG.UI_LOGIN_BTN); clearLoginFields();
        showLoginToast('Welcome back, Daddy! 👑', 'success');
        setTimeout(function() { navigateTo('admin-dashboard'); renderAdminPanels(); }, 400);
        return;
    }
    var admins = await supabase.from('admins').select('*').eq('email', email);
    if (!admins.data || admins.data.length === 0) { resetBtn(btn, CONFIG.UI_LOGIN_BTN); showLoginToast(CONFIG.LOGIN_NO_ACCOUNT, 'error'); return; }
    var admin = admins.data[0];
    if (admin.status === 'pending_password') { resetBtn(btn, CONFIG.UI_LOGIN_BTN); showLoginToast(CONFIG.LOGIN_PENDING_PASSWORD, 'info'); return; }
    if (admin.status === 'frozen') { resetBtn(btn, CONFIG.UI_LOGIN_BTN); showLoginToast(CONFIG.LOGIN_ACCOUNT_FROZEN, 'error'); return; }
    if (admin.expiry_date && new Date(admin.expiry_date) < new Date()) { resetBtn(btn, CONFIG.UI_LOGIN_BTN); showLoginToast(CONFIG.LOGIN_ACCOUNT_EXPIRED, 'error'); return; }
    if (admin.password_hash !== password) { resetBtn(btn, CONFIG.UI_LOGIN_BTN); showLoginToast(CONFIG.LOGIN_WRONG_PASSWORD, 'error'); return; }
    isAdminLoggedIn = true; currentUserEmail = email; currentUserRole = 'admin'; loginTimestamp = Date.now();
    saveSession(); resetBtn(btn, CONFIG.UI_LOGIN_BTN); clearLoginFields();
    checkUnreadMessages(email);
    if (admin.expiry_date) { var ed = new Date(admin.expiry_date); var wd = new Date(ed); wd.setMonth(wd.getMonth() - CONFIG.ADMIN_EXPIRY_WARNING_MONTHS); if (new Date() >= wd && new Date() < ed) showExpiryWarning(ed); }
    showLoginToast('Welcome! Your store is ready. 🏪', 'success');
    setTimeout(function() { navigateTo('admin-dashboard'); renderAdminPanels(); }, 400);
}
function clearLoginFields() { document.getElementById('admin-email').value = ''; document.getElementById('admin-password').value = ''; }
function logoutAdmin() {
    if (CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1) supabase.auth.signOut();
    isAdminLoggedIn = false; currentUserEmail = ''; currentUserRole = ''; viewingAdminEmail = null;
    localStorage.removeItem('abihani_session');
    clearLoginFields(); showHaniPopup('Logged Out 👋', 'See you soon!', null, 'info'); setTimeout(closeHaniPopup, 3000);
    navigateTo('home');
}
function showLoginToast(msg, type) {
    var el = document.getElementById('login-toast');
    el.innerHTML = '<div class="toast-local ' + type + '">' + msg + '</div>';
    setTimeout(function() { el.innerHTML = ''; }, 4000);
}

// ============ CREATE ACCOUNT ============
function showCreateAccountModal() {
    var html = '<h3>' + CONFIG.CREATE_ACCOUNT_TITLE + '</h3><p>' + CONFIG.CREATE_ACCOUNT_SUBTITLE + '</p><input id="create-email" class="admin-input" type="email" placeholder="' + CONFIG.CREATE_ACCOUNT_EMAIL_LABEL + '" autocomplete="email"><input id="create-password" class="admin-input" type="password" placeholder="' + CONFIG.CREATE_ACCOUNT_PASSWORD_LABEL + '" autocomplete="new-password"><input id="create-password-confirm" class="admin-input" type="password" placeholder="' + CONFIG.CREATE_ACCOUNT_CONFIRM_LABEL + '" autocomplete="new-password"><p id="create-message" style="font-size:12px;margin-top:8px;"></p><button class="btn-primary" style="width:100%;margin-top:12px;" onclick="createAdminAccount()">' + CONFIG.CREATE_ACCOUNT_BTN + '</button><button class="btn-secondary btn-sm" style="margin-top:8px;" onclick="closeAdminModal()">Close</button>';
    openAdminModal(html);
}
async function createAdminAccount() {
    var email = document.getElementById('create-email').value.trim();
    var password = document.getElementById('create-password').value;
    var confirm = document.getElementById('create-password-confirm').value;
    var msgEl = document.getElementById('create-message');
    if (!email || !password || !confirm) { msgEl.style.color = '#e74c3c'; msgEl.textContent = 'All fields are required.'; return; }
    if (password !== confirm) { msgEl.style.color = '#e74c3c'; msgEl.textContent = CONFIG.CREATE_ACCOUNT_PASSWORD_MISMATCH; return; }
    var admin = await supabase.from('admins').select('*').eq('email', email).single();
    if (!admin.data) { msgEl.style.color = '#e74c3c'; msgEl.textContent = CONFIG.CREATE_ACCOUNT_EMAIL_NOT_APPROVED; return; }
    if (admin.data.password_hash) { msgEl.style.color = '#e74c3c'; msgEl.textContent = CONFIG.CREATE_ACCOUNT_ALREADY_EXISTS; return; }
    await supabase.from('admins').update({ password_hash: password, status: 'active' }).eq('email', email);
    msgEl.style.color = '#27ae60'; msgEl.textContent = CONFIG.CREATE_ACCOUNT_SUCCESS;
    setTimeout(function() { closeAdminModal(); document.getElementById('admin-email').value = email; }, 2000);
}

// ============ FORGOT PASSWORD ============
function forgotPassword() {
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(document.getElementById('admin-email').value.trim()) !== -1;
    if (isCEO) {
        var html = '<h3>' + CONFIG.FORGOT_PASSWORD_TITLE + '</h3><p>' + CONFIG.FORGOT_PASSWORD_SUBTITLE_CEO + '</p><input id="forgot-email" class="admin-input" type="email" placeholder="' + CONFIG.FORGOT_PASSWORD_PLACEHOLDER + '" autocomplete="email"><p id="forgot-message" style="font-size:12px;margin-top:8px;"></p><button class="btn-primary" style="width:100%;margin-top:12px;" onclick="submitForgotPassword()">' + CONFIG.FORGOT_PASSWORD_SEND_BTN + '</button><button class="btn-secondary btn-sm" style="margin-top:8px;" onclick="closeAdminModal()">' + CONFIG.FORGOT_PASSWORD_CLOSE + '</button>';
        openAdminModal(html);
    } else {
        var waMsg = encodeURIComponent(CONFIG.FORGOT_PASSWORD_WHATSAPP_MSG + document.getElementById('admin-email').value.trim());
        var html = '<h3>' + CONFIG.FORGOT_PASSWORD_TITLE + '</h3><p>' + CONFIG.FORGOT_PASSWORD_SUBTITLE_ADMIN + '</p><a href="https://wa.me/' + CONFIG.CEO_WHATSAPP.replace(/[^0-9]/g, '') + '?text=' + waMsg + '" target="_blank" class="btn-primary" style="width:100%;margin-top:12px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;"><i class="fab fa-whatsapp"></i> Contact CEO</a><button class="btn-secondary btn-sm" style="margin-top:8px;width:100%;" onclick="closeAdminModal()">' + CONFIG.FORGOT_PASSWORD_CLOSE + '</button>';
        openAdminModal(html);
    }
}
async function submitForgotPassword() {
    var email = document.getElementById('forgot-email').value.trim();
    var msgEl = document.getElementById('forgot-message');
    if (!email) { msgEl.style.color = '#e74c3c'; msgEl.textContent = 'Enter your email.'; return; }
    var result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://www.abihaniexpress.com.ng/admin-login' });
    if (result.error) { msgEl.style.color = '#e74c3c'; msgEl.textContent = CONFIG.FORGOT_PASSWORD_ERROR; }
    else { msgEl.style.color = '#27ae60'; msgEl.textContent = CONFIG.FORGOT_PASSWORD_SUCCESS_CEO; }
}

// ============ SETTINGS ============
function showAdminSettings() {
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1;
    if (isCEO) { showCEOSettings(); return; }
    supabase.from('admins').select('*').eq('email', currentUserEmail).single().then(function(res) {
        var admin = res.data; if (!admin) return;
        var html = '<h3>' + CONFIG.SETTINGS_TITLE + '</h3><input id="settings-business" class="admin-input" value="' + (admin.business_name || '') + '" placeholder="' + CONFIG.SETTINGS_BUSINESS_LABEL + '"><input id="settings-whatsapp" class="admin-input" value="' + (admin.whatsapp || '') + '" placeholder="' + CONFIG.SETTINGS_WHATSAPP_LABEL + '"><input id="settings-email" class="admin-input" value="' + (admin.email || '') + '" placeholder="' + CONFIG.SETTINGS_EMAIL_LABEL + '"><input id="settings-new-password" class="admin-input" type="password" placeholder="' + CONFIG.SETTINGS_NEW_PASSWORD_LABEL + '" autocomplete="new-password"><input id="settings-confirm-password" class="admin-input" type="password" placeholder="' + CONFIG.SETTINGS_CONFIRM_PASSWORD_LABEL + '" autocomplete="new-password"><input id="settings-current-password" class="admin-input" type="password" placeholder="' + CONFIG.SETTINGS_CURRENT_PASSWORD_LABEL + '" autocomplete="current-password"><p id="settings-message" style="font-size:12px;margin-top:8px;"></p><button class="btn-primary" style="width:100%;margin-top:12px;" onclick="saveAdminSettings()">' + CONFIG.SETTINGS_SAVE_BTN + '</button>';
        openAdminModal(html);
    });
}
function showCEOSettings() {
    var html = '<h3>' + CONFIG.SETTINGS_TITLE + ' (CEO)</h3><input id="settings-new-password" class="admin-input" type="password" placeholder="' + CONFIG.SETTINGS_CEO_PASSWORD_LABEL + '" autocomplete="new-password"><input id="settings-confirm-password" class="admin-input" type="password" placeholder="' + CONFIG.SETTINGS_CONFIRM_CEO_PASSWORD_LABEL + '" autocomplete="new-password"><p id="settings-message" style="font-size:12px;margin-top:8px;"></p><button class="btn-primary" style="width:100%;margin-top:12px;" onclick="saveCEOSettings()">' + CONFIG.SETTINGS_SAVE_BTN + '</button>';
    openAdminModal(html);
}
async function saveAdminSettings() {
    var nP = document.getElementById('settings-new-password').value;
    var cP = document.getElementById('settings-confirm-password').value;
    var curP = document.getElementById('settings-current-password').value;
    var msgEl = document.getElementById('settings-message');
    if (!curP) { msgEl.style.color = '#e74c3c'; msgEl.textContent = CONFIG.SETTINGS_WRONG_PASSWORD; return; }
    if (nP && nP !== cP) { msgEl.style.color = '#e74c3c'; msgEl.textContent = CONFIG.CREATE_ACCOUNT_PASSWORD_MISMATCH; return; }
    var admin = await supabase.from('admins').select('*').eq('email', currentUserEmail).single();
    if (!admin.data || admin.data.password_hash !== curP) { msgEl.style.color = '#e74c3c'; msgEl.textContent = CONFIG.SETTINGS_WRONG_PASSWORD; return; }
    var updates = { business_name: document.getElementById('settings-business').value.trim(), whatsapp: document.getElementById('settings-whatsapp').value.trim(), email: document.getElementById('settings-email').value.trim() };
    if (nP) updates.password_hash = nP;
    await supabase.from('admins').update(updates).eq('email', currentUserEmail);
    closeAdminModal(); showHaniPopup('Saved! ✅', CONFIG.SETTINGS_SAVED, null, 'success'); setTimeout(closeHaniPopup, 5000);
}
async function saveCEOSettings() {
    var nP = document.getElementById('settings-new-password').value;
    var cP = document.getElementById('settings-confirm-password').value;
    var msgEl = document.getElementById('settings-message');
    if (!nP) { msgEl.style.color = '#e74c3c'; msgEl.textContent = 'Enter a new password.'; return; }
    if (nP !== cP) { msgEl.style.color = '#e74c3c'; msgEl.textContent = CONFIG.CREATE_ACCOUNT_PASSWORD_MISMATCH; return; }
    var result = await supabase.auth.updateUser({ password: nP });
    if (result.error) { msgEl.style.color = '#e74c3c'; msgEl.textContent = 'Error: ' + result.error.message; return; }
    closeAdminModal(); showHaniPopup('Saved! ✅', CONFIG.SETTINGS_SAVED, null, 'success'); setTimeout(closeHaniPopup, 5000);
}

// ============ UTILS ============
function filterByCategory(id) { currentFilterCategory = id; navigateTo('shop'); var pills = document.querySelectorAll('#shop-categories-filter .category-pill'); pills.forEach(function(p) { p.classList.remove('active'); }); var tp = document.querySelector('#shop-categories-filter .category-pill[onclick*="' + id + '"]'); if (tp) tp.classList.add('active'); renderAllProducts(); }
function filterAllProducts() { currentFilterCategory = null; navigateTo('shop'); var pills = document.querySelectorAll('#shop-categories-filter .category-pill'); pills.forEach(function(p) { p.classList.remove('active'); }); if (pills[0]) pills[0].classList.add('active'); renderAllProducts(); }
function scrollToBooks() { navigateTo('about'); setTimeout(function() { var b = document.querySelector('#books-container'); if (b) b.scrollIntoView({ behavior: 'smooth' }); }, 200); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); }
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
function closeAnnouncement() { document.getElementById('announcement-bar').classList.add('closed'); }
function setBtnLoading(btn, text) { btn.innerHTML = '<span class="spinner"></span> ' + text; btn.disabled = true; btn.classList.add('btn-loading'); }
function resetBtn(btn, text) { btn.innerHTML = text; btn.disabled = false; btn.classList.remove('btn-loading'); }
function openAdminModal(html) { var content = document.getElementById('admin-form-modal-content'); content.innerHTML = '<span class="custom-order-close" onclick="closeAdminModal()">&times;</span>' + html; document.getElementById('admin-form-modal').style.display = 'flex'; }
function closeAdminModal() { document.getElementById('admin-form-modal').style.display = 'none'; }
function shareProduct(id) {
    var url = window.location.origin + '/product-detail?id=' + id;
    var html = '<h4>Share Product</h4><button class="btn-primary btn-sm" onclick="copyToClipboard(\'' + url + '\')"><i class="fas fa-copy"></i> Copy Link</button><a href="https://wa.me/?text=' + encodeURIComponent('Check this out: ' + url) + '" target="_blank" class="btn-secondary btn-sm" style="text-decoration:none;"><i class="fab fa-whatsapp"></i> WhatsApp</a>';
    openAdminModal(html);
}
function copyToClipboard(text) {
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(function() { showHaniPopup('Copied! 📋', '', null, 'success'); setTimeout(closeHaniPopup, 5000); }); }
    else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showHaniPopup('Copied! 📋', '', null, 'success'); setTimeout(closeHaniPopup, 5000); }
}

function updateCategoriesHome() {
    var c = document.getElementById('categories-home'); if (!c) return;
    var cats = allCategories.length ? allCategories : [];
    c.innerHTML = cats.length ? cats.map(function(cat) { return '<div class="category-pill" onclick="filterByCategory(\'' + cat.id + '\')">' + (cat.emoji || '') + ' ' + cat.name + '</div>'; }).join('') : '<div class="empty-state"><i class="fas fa-folder-open"></i><p>' + CONFIG.EMPTY_CATEGORIES + '</p></div>';
}
function updateShopCategories() {
    var c = document.getElementById('shop-categories-filter'); if (!c) return;
    c.innerHTML = '<div class="category-pill active" onclick="filterAllProducts()">All</div>' + allCategories.map(function(cat) { return '<div class="category-pill" onclick="filterByCategory(\'' + cat.id + '\')">' + (cat.emoji || '') + ' ' + cat.name + '</div>'; }).join('');
}

// ============ EXPOSE PART 1 ============
window.navigateTo = navigateTo; window.goBackSmart = goBackSmart; window.showPage = showPage;
window.toggleTheme = toggleTheme; window.showProductDetail = showProductDetail;
window.buyNow = buyNow; window.searchProducts = searchProducts;
window.filterByCategory = filterByCategory; window.filterAllProducts = filterAllProducts;
window.adminLogin = adminLogin; window.logoutAdmin = logoutAdmin;
window.showCreateAccountModal = showCreateAccountModal; window.createAdminAccount = createAdminAccount;
window.forgotPassword = forgotPassword; window.submitForgotPassword = submitForgotPassword;
window.showAdminSettings = showAdminSettings; window.saveAdminSettings = saveAdminSettings; window.saveCEOSettings = saveCEOSettings;
window.toggleMockData = toggleMockData; window.generateMockCount = generateMockCount;
window.setMockFeaturePercent = setMockFeaturePercent; window.randomizeMockData = randomizeMockData;
window.toggleMaintenanceMode = toggleMaintenanceMode;
window.navigateDetailImage = navigateDetailImage; window.jumpToDetailImage = jumpToDetailImage;
window.shareProduct = shareProduct; window.copyToClipboard = copyToClipboard;
window.scrollToBooks = scrollToBooks; window.closeAnnouncement = closeAnnouncement;
window.openAdminModal = openAdminModal; window.closeAdminModal = closeAdminModal;
window.goToSlide = goToSlide;
window.showHaniPopup = showHaniPopup; window.closeHaniPopup = closeHaniPopup;
window.toggleHaniChat = toggleHaniChat; window.showPWABanner = showPWABanner;
window.closePWAInstall = closePWAInstall; window.installPWA = installPWA;
// ============================================
// ABIHANI EXPRESS v17 — Part 2: CRUD, Dashboard, Email, CEO Actions
// ============================================

// ============ CATEGORY CRUD ============
function showAddCategoryForm() {
    openAdminModal('<h3>' + CONFIG.UI_ADD_CATEGORY + '</h3><input id="af-cat-name" class="admin-input" placeholder="Category Name *"><input id="af-cat-emoji" class="admin-input" placeholder="Emoji (optional)"><button class="btn-primary" style="width:100%;margin-top:12px;" id="af-cat-save-btn" onclick="saveNewCategory()">' + CONFIG.UI_SAVE_CATEGORY + '</button>');
}
async function saveNewCategory() {
    var n = document.getElementById('af-cat-name').value.trim();
    if (!n) { showHaniPopup('Name Required 📝', 'My dad says every category needs a name.', null, 'error'); return; }
    var e = document.getElementById('af-cat-emoji').value.trim() || CONFIG.CATEGORY_DEFAULT_ICON;
    var btn = document.getElementById('af-cat-save-btn'); setBtnLoading(btn, 'Saving...');
    await supabase.from('categories').insert({ name: n, emoji: e, sort_order: allCategories.length + 1, owner_email: viewingAdminEmail || currentUserEmail });
    closeAdminModal(); loadDynamicData(); renderAdminPanels();
    showHaniPopup('Category Added! 📁', 'Your workshop just got more organized.', null, 'success'); setTimeout(closeHaniPopup, 5000);
}
function showEditCategoryForm(i) {
    var c = allCategories[i]; if (!c) return;
    openAdminModal('<h3>Edit Category</h3><input id="af-cat-name" class="admin-input" value="' + c.name + '"><input id="af-cat-emoji" class="admin-input" value="' + (c.emoji || '') + '" placeholder="Emoji"><button class="btn-primary" style="width:100%;margin-top:12px;" id="af-cat-update-btn" onclick="updateCategory(' + i + ')">' + CONFIG.UI_UPDATE_CATEGORY + '</button>');
}
async function updateCategory(i) {
    var c = allCategories[i]; if (!c) return;
    var n = document.getElementById('af-cat-name').value.trim();
    if (!n) { showHaniPopup('Name Required 📝', '', null, 'error'); return; }
    var e = document.getElementById('af-cat-emoji').value.trim() || c.emoji || CONFIG.CATEGORY_DEFAULT_ICON;
    var btn = document.getElementById('af-cat-update-btn'); setBtnLoading(btn, 'Updating...');
    await supabase.from('categories').update({ name: n, emoji: e }).eq('id', c.id);
    closeAdminModal(); loadDynamicData(); renderAdminPanels();
    showHaniPopup('Updated! ✨', '', null, 'success'); setTimeout(closeHaniPopup, 5000);
}
function deleteCategory(i) {
    var c = allCategories[i]; if (!c) return;
    confirmDelete('Delete "' + c.name + '" and all its subcategories? My dad says once it\'s gone, it\'s like finished leather — you can\'t un-stitch it.', async function() {
        await supabase.from('categories').delete().eq('id', c.id);
        loadDynamicData(); renderAdminPanels();
        showHaniPopup('Deleted! 🗑️', 'Category removed. My dad keeps a clean workshop.', null, 'success'); setTimeout(closeHaniPopup, 5000);
    });
}
async function moveCategoryUp(i) {
    if (i === 0) return;
    var a = allCategories[i], b = allCategories[i - 1];
    await supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id);
    loadDynamicData(); renderAdminPanels();
}
async function moveCategoryDown(i) {
    if (i >= allCategories.length - 1) return;
    var a = allCategories[i], b = allCategories[i + 1];
    await supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id);
    await supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id);
    loadDynamicData(); renderAdminPanels();
}

// ============ SUBCATEGORY CRUD ============
function showAddSubcategoryForm() {
    var opts = allCategories.filter(function(c) { return !c.is_mock; }).map(function(c) { return '<option value="' + c.id + '">' + (c.emoji || '') + ' ' + c.name + '</option>'; }).join('');
    openAdminModal('<h3>Add Subcategory</h3><input id="af-sub-name" class="admin-input" placeholder="Subcategory Name *"><select id="af-sub-parent" class="admin-input">' + opts + '</select><button class="btn-primary" style="width:100%;margin-top:12px;" id="af-sub-save-btn" onclick="saveNewSubcategory()">Save</button>');
}
async function saveNewSubcategory() {
    var n = document.getElementById('af-sub-name').value.trim(); if (!n) { showHaniPopup('Name Required 📝', '', null, 'error'); return; }
    var pid = document.getElementById('af-sub-parent').value;
    var btn = document.getElementById('af-sub-save-btn'); setBtnLoading(btn, 'Saving...');
    await supabase.from('subcategories').insert({ name: n, category_id: parseInt(pid), owner_email: viewingAdminEmail || currentUserEmail });
    closeAdminModal(); loadDynamicData(); renderAdminPanels();
    showHaniPopup('Added! ✅', '', null, 'success'); setTimeout(closeHaniPopup, 5000);
}
function showEditSubcategoryForm(i) {
    var s = allSubcategories[i]; if (!s) return;
    var opts = allCategories.filter(function(c) { return !c.is_mock; }).map(function(c) { return '<option value="' + c.id + '"' + (c.id === s.category_id ? ' selected' : '') + '>' + (c.emoji || '') + ' ' + c.name + '</option>'; }).join('');
    openAdminModal('<h3>Edit Subcategory</h3><input id="af-sub-name" class="admin-input" value="' + s.name + '"><select id="af-sub-parent" class="admin-input">' + opts + '</select><button class="btn-primary" style="width:100%;margin-top:12px;" id="af-sub-update-btn" onclick="updateSubcategory(' + i + ')">Update</button>');
}
async function updateSubcategory(i) {
    var s = allSubcategories[i]; if (!s) return;
    var n = document.getElementById('af-sub-name').value.trim(); if (!n) { showHaniPopup('Name Required 📝', '', null, 'error'); return; }
    var pid = document.getElementById('af-sub-parent').value;
    var btn = document.getElementById('af-sub-update-btn'); setBtnLoading(btn, 'Updating...');
    await supabase.from('subcategories').update({ name: n, category_id: parseInt(pid) }).eq('id', s.id);
    closeAdminModal(); loadDynamicData(); renderAdminPanels();
    showHaniPopup('Updated! ✨', '', null, 'success'); setTimeout(closeHaniPopup, 5000);
}
function deleteSubcategory(i) {
    var s = allSubcategories[i]; if (!s) return;
    confirmDelete('Delete "' + s.name + '" and all products under it?', async function() {
        await supabase.from('subcategories').delete().eq('id', s.id);
        loadDynamicData(); renderAdminPanels();
        showHaniPopup('Deleted! 🗑️', '', null, 'success'); setTimeout(closeHaniPopup, 5000);
    });
}

// ============ SIDE IMAGES MULTI-PICKER ============
function buildSideImagesHTML(existingUrls) {
    existingUrls = existingUrls || [];
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1;
    var maxFiles = isCEO ? (CONFIG.SIDE_IMAGES_MAX_CEO || 99) : (CONFIG.SIDE_IMAGES_MAX_REGULAR || 2);
    var limitNote = isCEO ? CONFIG.UI_SIDE_IMAGES_LIMIT_CEO : CONFIG.UI_SIDE_IMAGES_LIMIT_REGULAR;
    var html = '<label style="font-size:12px;font-weight:600;">' + CONFIG.UI_SIDE_IMAGES_LABEL + ' <small style="color:var(--text-muted);">(' + limitNote + ')</small></label><div id="side-images-container">';
    for (var i = 0; i < existingUrls.length; i++) {
        html += '<div class="side-image-row" data-index="' + i + '" style="display:flex;align-items:center;gap:8px;margin:6px 0;"><img src="' + existingUrls[i] + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;border:1px solid var(--border);"><span style="font-size:11px;color:var(--text-muted);">' + CONFIG.UI_SIDE_IMAGES_SELECTED + '</span><button type="button" class="btn-sm" style="color:#e74c3c;border-color:#e74c3c;padding:4px 10px;font-size:11px;" onclick="removeSideImageRow(this)"><i class="fas fa-times"></i></button></div>';
    }
    var cur = existingUrls.length;
    html += '<div class="side-image-row" id="side-image-picker-row" style="display:flex;align-items:center;gap:8px;margin:6px 0;"><input type="file" class="side-image-picker" accept="image/*" onchange="sideImageSelected(this)" style="flex:1;padding:6px;font-size:12px;">' + (cur < maxFiles ? '<button type="button" class="btn-sm" style="color:var(--accent);border-color:var(--accent);padding:4px 10px;font-size:11px;white-space:nowrap;" onclick="addSideImagePicker()" id="add-side-btn"><i class="fas fa-plus"></i> ' + CONFIG.UI_SIDE_IMAGES_ADD_MORE + '</button>' : '') + '</div></div><input type="hidden" id="side-image-removed-urls" value="[]">';
    sideImageCounter = cur + 1;
    return html;
}
function sideImageSelected(input) {
    if (input.files && input.files[0]) {
        var s = input.parentElement.querySelector('.side-file-name');
        if (!s) { s = document.createElement('span'); s.className = 'side-file-name'; s.style.cssText = 'font-size:10px;color:#27ae60;'; input.parentElement.appendChild(s); }
        s.textContent = '✓ ' + input.files[0].name;
    }
}
function addSideImagePicker() {
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1;
    var max = isCEO ? (CONFIG.SIDE_IMAGES_MAX_CEO || 99) : (CONFIG.SIDE_IMAGES_MAX_REGULAR || 2);
    var existingCount = document.querySelectorAll('.side-image-row[data-index]').length;
    var pickerCount = document.querySelectorAll('.side-image-picker').length;
    var total = existingCount + pickerCount;
    if (total >= max) { showHaniPopup('Limit Reached 📸', isCEO ? 'Maximum reached.' : 'Regular admins can upload up to ' + max + ' side images.', null, 'info'); return; }
    var container = document.getElementById('side-images-container');
    var d = document.createElement('div'); d.className = 'side-image-row'; d.style.cssText = 'display:flex;align-items:center;gap:8px;margin:6px 0;';
    d.innerHTML = '<input type="file" class="side-image-picker" accept="image/*" onchange="sideImageSelected(this)" style="flex:1;padding:6px;font-size:12px;"><button type="button" class="btn-sm" style="color:#e74c3c;border-color:#e74c3c;padding:4px 10px;font-size:11px;" onclick="removeSideImageRow(this)"><i class="fas fa-times"></i></button>';
    container.appendChild(d); sideImageCounter++;
    if (total + 1 >= max) { var b = document.getElementById('add-side-btn'); if (b) b.style.display = 'none'; }
}
function removeSideImageRow(btn) {
    var row = btn.parentElement;
    if (row.getAttribute('data-index') !== null) {
        var ri = document.getElementById('side-image-removed-urls');
        if (ri) { var a = JSON.parse(ri.value || '[]'); a.push(parseInt(row.getAttribute('data-index'))); ri.value = JSON.stringify(a); }
    }
    row.remove(); sideImageCounter--;
    var addBtn = document.getElementById('add-side-btn'); if (addBtn) addBtn.style.display = '';
}

// ============ ADD PRODUCT ============
function showAddProductForm() {
    var catOpts = allCategories.filter(function(c){return !c.is_mock;}).map(function(c){return '<option value="'+c.id+'">'+(c.emoji||'')+' '+c.name+'</option>';}).join('');
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1;
    var sideSec = buildSideImagesHTML([]);
    openAdminModal('<h3>' + CONFIG.UI_ADD_PRODUCT + '</h3><div style="max-height:70vh;overflow-y:auto;"><fieldset style="border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:12px;"><legend style="font-weight:700;color:var(--accent);">Necessary *</legend><input id="af-prod-name" class="admin-input" placeholder="Product Name *"><input id="af-prod-price" class="admin-input" type="number" placeholder="Price (₦) *"><select id="af-prod-category" class="admin-input" onchange="updateAFSubcats()">' + catOpts + '</select><label style="font-size:12px;">Main Image' + (isCEO?'':' *') + ' <small>' + (isCEO?'(CEO: optional)':'(Required)') + '</small></label><input type="file" id="af-prod-image" accept="image/*" class="admin-input"></fieldset><fieldset style="border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:12px;"><legend style="font-weight:600;color:var(--text-secondary);">Optional</legend><select id="af-prod-subcategory" class="admin-input"><option value="">Subcategory (optional)</option></select><textarea id="af-prod-desc" class="admin-input" placeholder="Description" rows="2"></textarea>' + sideSec + '<input id="af-prod-rating" class="admin-input" type="number" step="0.1" placeholder="Rating (default ' + CONFIG.PRODUCT_DEFAULT_RATING + ')"><input id="af-prod-review-count" class="admin-input" type="number" placeholder="Review Count (auto if empty)"><input id="af-prod-stock" class="admin-input" type="number" placeholder="Stock Quantity (default ' + CONFIG.PRODUCT_DEFAULT_STOCK + ')"><input id="af-prod-discount" class="admin-input" type="number" placeholder="Discount % (default 0)"><input id="af-prod-vendor" class="admin-input" placeholder="Vendor (default: ' + CONFIG.PRODUCT_DEFAULT_VENDOR + ')"><input id="af-prod-location" class="admin-input" placeholder="Location (default: ' + CONFIG.PRODUCT_DEFAULT_LOCATION + ')"><label style="font-size:12px;"><input type="checkbox" id="af-prod-featured"> Featured on homepage</label></fieldset></div><button class="btn-primary" style="width:100%;margin-top:12px;" id="af-prod-save-btn" onclick="saveNewProduct()">' + CONFIG.UI_SAVE_PRODUCT + '</button>');
    sideImageCounter = 1;
    window.updateAFSubcats = function() {
        var catId = document.getElementById('af-prod-category').value;
        var sel = document.getElementById('af-prod-subcategory'); if (!sel) return;
        sel.innerHTML = '<option value="">Subcategory (optional)</option>';
        for (var i = 0; i < allSubcategories.length; i++) {
            if (allSubcategories[i].category_id == catId && !allSubcategories[i].is_mock) {
                sel.innerHTML += '<option value="' + allSubcategories[i].id + '">' + allSubcategories[i].name + '</option>';
            }
        }
    };
}
async function saveNewProduct() {
    var name = document.getElementById('af-prod-name').value.trim();
    var price = parseInt(document.getElementById('af-prod-price').value);
    var catId = document.getElementById('af-prod-category').value;
    var subId = document.getElementById('af-prod-subcategory').value || null;
    var desc = document.getElementById('af-prod-desc').value.trim();
    var imgFile = document.getElementById('af-prod-image').files[0];
    var rating = parseFloat(document.getElementById('af-prod-rating').value) || CONFIG.PRODUCT_DEFAULT_RATING;
    var reviewCount = parseInt(document.getElementById('af-prod-review-count').value) || 0;
    var stock = parseInt(document.getElementById('af-prod-stock').value) || CONFIG.PRODUCT_DEFAULT_STOCK;
    var discount = parseInt(document.getElementById('af-prod-discount').value) || 0;
    var vendor = document.getElementById('af-prod-vendor').value.trim() || CONFIG.PRODUCT_DEFAULT_VENDOR;
    var location = document.getElementById('af-prod-location').value.trim() || CONFIG.PRODUCT_DEFAULT_LOCATION;
    var featured = document.getElementById('af-prod-featured').checked;
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1;
    if (!name || !price) { showHaniPopup('Missing Fields 🏷️', 'My dad never sells anything without a name and price.', null, 'error'); return; }
    if (!isCEO && !imgFile) { showHaniPopup('Image Required 📸', 'Main image is required for regular administrators.', null, 'error'); return; }
    var btn = document.getElementById('af-prod-save-btn'); setBtnLoading(btn, 'Saving...');
    var mainUrl = '';
    if (imgFile) {
        try {
            var ext = imgFile.name.split('.').pop();
            var mainFileName = 'products/' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_main.' + ext;
            var up = await supabase.storage.from('images').upload(mainFileName, imgFile);
            if (up.error) throw up.error;
            mainUrl = supabase.storage.from('images').getPublicUrl(mainFileName).data.publicUrl;
        } catch (e) { showHaniPopup('Upload Failed 📸', e.message, null, 'error'); resetBtn(btn, CONFIG.UI_SAVE_PRODUCT); return; }
    }
    var extraUrls = [];
    var pickers = document.querySelectorAll('.side-image-picker');
    for (var i = 0; i < pickers.length; i++) {
        if (pickers[i].files && pickers[i].files.length > 0) {
            try {
                var file = pickers[i].files[0];
                var eext = file.name.split('.').pop();
                var uniqueId = Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 6);
                var extraFileName = 'products/' + uniqueId + '_extra.' + eext;
                var eup = await supabase.storage.from('images').upload(extraFileName, file);
                if (!eup.error) extraUrls.push(supabase.storage.from('images').getPublicUrl(extraFileName).data.publicUrl);
            } catch (e) {}
        }
    }
    var ownerEmail = viewingAdminEmail || currentUserEmail;
    var ownerWhatsapp = '';
    if (!isCEO || viewingAdminEmail) {
        var adminInfo = await supabase.from('admins').select('whatsapp').eq('email', ownerEmail).single();
        if (adminInfo.data && adminInfo.data.whatsapp) ownerWhatsapp = adminInfo.data.whatsapp;
    } else { ownerWhatsapp = CONFIG.WHATSAPP_NUMBER; }
    var insertResult = await supabase.from('products').insert({
        name: name, price: price, category_id: catId || null, subcategory_id: subId,
        description: desc, image_url: mainUrl, image_urls: JSON.stringify(extraUrls),
        image_icon: CONFIG.PRODUCT_DEFAULT_ICON, rating: rating,
        review_count: reviewCount || Math.floor(Math.random() * 235) + 12,
        vendor: vendor, location: location, featured: featured,
        stock_quantity: stock, discount_percent: discount,
        owner_email: ownerEmail, owner_whatsapp: ownerWhatsapp
    });
    if (insertResult.error) { showHaniPopup('Database Error 🔧', insertResult.error.message, null, 'error'); resetBtn(btn, CONFIG.UI_SAVE_PRODUCT); return; }
    closeAdminModal(); loadDynamicData(); renderAdminPanels();
    showHaniPopup('Product Added! 🎉', 'Your crafting skills are showing. My mom would be impressed!', null, 'success'); setTimeout(closeHaniPopup, 5000);
}

// ============ EDIT PRODUCT ============
function showEditProductForm(i) {
    var p = allProducts[i]; if (!p) return;
    var existingSideUrls = []; try { existingSideUrls = JSON.parse(p.image_urls || '[]'); } catch (e) {}
    var catOpts = allCategories.filter(function(c){return !c.is_mock;}).map(function(c){return '<option value="'+c.id+'"'+(c.id===p.category_id?' selected':'')+'>'+(c.emoji||'')+' '+c.name+'</option>';}).join('');
    var existingImageHtml = p.image_url ? '<div class="image-preview-wrapper" style="margin:8px 0;"><img src="' + p.image_url + '" alt="Current image"><span class="image-remove-btn" onclick="window._removeProductImage()" title="Remove Image">' + CONFIG.UI_REMOVE_IMAGE + '</span></div>' : '<div style="margin:8px 0;font-size:32px;">' + (p.image_icon || CONFIG.PRODUCT_DEFAULT_ICON) + '</div>';
    var sideSec = buildSideImagesHTML(existingSideUrls);
    openAdminModal('<h3>Edit Product</h3><div style="max-height:70vh;overflow-y:auto;"><fieldset style="border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:12px;"><legend style="font-weight:700;color:var(--accent);">Necessary *</legend><input id="af-prod-name" class="admin-input" value="' + p.name + '"><input id="af-prod-price" class="admin-input" type="number" value="' + p.price + '"><select id="af-prod-category" class="admin-input" onchange="updateAFSubcats()">' + catOpts + '</select><label style="font-size:12px;">Main Image (leave empty to keep, click ✕ to remove)</label>' + existingImageHtml + '<input type="file" id="af-prod-image" accept="image/*" class="admin-input"><input type="hidden" id="af-prod-image-removed" value="false"></fieldset><fieldset style="border:1px solid var(--border);border-radius:12px;padding:12px;margin-bottom:12px;"><legend style="font-weight:600;color:var(--text-secondary);">Optional</legend><select id="af-prod-subcategory" class="admin-input"><option value="">Subcategory (optional)</option></select><textarea id="af-prod-desc" class="admin-input" rows="2">' + (p.description || '') + '</textarea>' + sideSec + '<input id="af-prod-rating" class="admin-input" type="number" step="0.1" value="' + (p.rating || CONFIG.PRODUCT_DEFAULT_RATING) + '"><input id="af-prod-review-count" class="admin-input" type="number" value="' + (p.review_count || 0) + '"><input id="af-prod-stock" class="admin-input" type="number" value="' + (p.stock_quantity || CONFIG.PRODUCT_DEFAULT_STOCK) + '"><input id="af-prod-discount" class="admin-input" type="number" value="' + (p.discount_percent || 0) + '"><input id="af-prod-vendor" class="admin-input" value="' + (p.vendor || '') + '"><input id="af-prod-location" class="admin-input" value="' + (p.location || '') + '"><label style="font-size:12px;"><input type="checkbox" id="af-prod-featured" ' + (p.featured ? 'checked' : '') + '> Featured</label></fieldset></div><button class="btn-primary" style="width:100%;margin-top:12px;" id="af-prod-update-btn" onclick="updateProduct(' + i + ')">' + CONFIG.UI_UPDATE_PRODUCT + '</button>');
    sideImageCounter = existingSideUrls.length + 1;
    window._removeProductImage = function() { document.getElementById('af-prod-image-removed').value = 'true'; var wrapper = document.querySelector('.image-preview-wrapper'); if (wrapper) wrapper.style.display = 'none'; };
    window.updateAFSubcats = function() {
        var catId = document.getElementById('af-prod-category').value;
        var sel = document.getElementById('af-prod-subcategory'); if (!sel) return;
        sel.innerHTML = '<option value="">Subcategory (optional)</option>';
        for (var j = 0; j < allSubcategories.length; j++) {
            if (allSubcategories[j].category_id == catId && !allSubcategories[j].is_mock) {
                sel.innerHTML += '<option value="' + allSubcategories[j].id + '"' + (allSubcategories[j].id == (p.subcategory_id || '') ? ' selected' : '') + '>' + allSubcategories[j].name + '</option>';
            }
        }
    };
    setTimeout(function() { window.updateAFSubcats(); }, 100);
}
async function updateProduct(i) {
    var p = allProducts[i]; if (!p) return;
    var name = document.getElementById('af-prod-name').value.trim();
    var price = parseInt(document.getElementById('af-prod-price').value);
    var catId = document.getElementById('af-prod-category').value;
    var subId = document.getElementById('af-prod-subcategory').value || null;
    var desc = document.getElementById('af-prod-desc').value.trim();
    var imgFile = document.getElementById('af-prod-image').files[0];
    var imageRemoved = document.getElementById('af-prod-image-removed').value === 'true';
    var rating = parseFloat(document.getElementById('af-prod-rating').value) || p.rating || CONFIG.PRODUCT_DEFAULT_RATING;
    var reviewCount = parseInt(document.getElementById('af-prod-review-count').value) || p.review_count || 0;
    var stock = parseInt(document.getElementById('af-prod-stock').value) || p.stock_quantity || CONFIG.PRODUCT_DEFAULT_STOCK;
    var discount = parseInt(document.getElementById('af-prod-discount').value) || p.discount_percent || 0;
    var vendor = document.getElementById('af-prod-vendor').value.trim() || p.vendor || CONFIG.PRODUCT_DEFAULT_VENDOR;
    var location = document.getElementById('af-prod-location').value.trim() || p.location || CONFIG.PRODUCT_DEFAULT_LOCATION;
    var featured = document.getElementById('af-prod-featured').checked;
    if (!name || !price) { showHaniPopup('Missing Fields 🏷️', '', null, 'error'); return; }
    var btn = document.getElementById('af-prod-update-btn'); setBtnLoading(btn, 'Updating...');
    var updates = { name: name, price: price, category_id: catId || null, subcategory_id: subId, description: desc, rating: rating, review_count: reviewCount || Math.floor(Math.random() * 235) + 12, vendor: vendor, location: location, featured: featured, stock_quantity: stock, discount_percent: discount };
    if (imageRemoved) { updates.image_url = ''; updates.image_icon = CONFIG.PRODUCT_DEFAULT_ICON; }
    if (imgFile) {
        try {
            var ext = imgFile.name.split('.').pop();
            var mainFileName = 'products/' + Date.now() + '_' + Math.random().toString(36).substr(2, 6) + '_main.' + ext;
            var up = await supabase.storage.from('images').upload(mainFileName, imgFile);
            if (!up.error) updates.image_url = supabase.storage.from('images').getPublicUrl(mainFileName).data.publicUrl;
        } catch (e) {}
    }
    var existingUrls = []; try { existingUrls = JSON.parse(p.image_urls || '[]'); } catch (e) {}
    var removedIndices = JSON.parse(document.getElementById('side-image-removed-urls').value || '[]');
    var keptUrls = [];
    for (var ri = 0; ri < existingUrls.length; ri++) { if (removedIndices.indexOf(ri) === -1) keptUrls.push(existingUrls[ri]); }
    var pickers = document.querySelectorAll('.side-image-picker');
    for (var si = 0; si < pickers.length; si++) {
        if (pickers[si].files && pickers[si].files.length > 0) {
            try {
                var file = pickers[si].files[0];
                var eext = file.name.split('.').pop();
                var uniqueId = Date.now() + '_' + si + '_' + Math.random().toString(36).substr(2, 6);
                var extraFileName = 'products/' + uniqueId + '_extra.' + eext;
                var eup = await supabase.storage.from('images').upload(extraFileName, file);
                if (!eup.error) keptUrls.push(supabase.storage.from('images').getPublicUrl(extraFileName).data.publicUrl);
            } catch (e) {}
        }
    }
    updates.image_urls = JSON.stringify(keptUrls);
    await supabase.from('products').update(updates).eq('id', p.id);
    closeAdminModal(); loadDynamicData(); renderAdminPanels();
    showHaniPopup('Updated! ✨', 'Your product looks even better now.', null, 'success'); setTimeout(closeHaniPopup, 5000);
}
function deleteProduct(i) {
    var p = allProducts[i]; if (!p) return;
    confirmDelete('Delete "' + p.name + '" permanently? My dad says quality over quantity — wise choice.', async function() {
        await supabase.from('products').delete().eq('id', p.id);
        loadDynamicData(); renderAdminPanels();
        showHaniPopup('Deleted! 🗑️', '', null, 'success'); setTimeout(closeHaniPopup, 5000);
    });
}

// ============ ADMIN DASHBOARD ============
async function renderAdminPanels() {
    await loadDynamicData();
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1;
    var ownerFilter = viewingAdminEmail || currentUserEmail;
    var container = document.getElementById('admin-dashboard-content');
    if (!container) return;

    var filteredCategories = allCategories.filter(function(c) { return c.owner_email === ownerFilter && !c.is_mock; });
    var filteredSubcategories = allSubcategories.filter(function(s) { return s.owner_email === ownerFilter && !s.is_mock; });
    var filteredProducts = allProducts.filter(function(p) { return p.owner_email === ownerFilter && !p.is_mock; });
    if (isCEO && !viewingAdminEmail) { filteredCategories = allCategories.filter(function(c){return !c.is_mock;}); filteredSubcategories = allSubcategories.filter(function(s){return !s.is_mock;}); filteredProducts = allProducts.filter(function(p){return !p.is_mock;}); }

    var html = '';

    // Viewing partner banner (CEO only)
    if (isCEO && viewingAdminEmail) {
        var viewedAdmin = await supabase.from('admins').select('*').eq('email', viewingAdminEmail).single();
        var ad = viewedAdmin.data || {};
        var isExpired = ad.expiry_date && new Date(ad.expiry_date) < new Date();
        var isFrozen = ad.status === 'frozen';
        var statusLabel = isFrozen ? CONFIG.VIEWING_ADMIN_FROZEN_LABEL : (isExpired ? CONFIG.VIEWING_ADMIN_EXPIRED_LABEL : '');
        var statusColor = isFrozen ? '#2980b9' : '#e74c3c';
        html += '<div class="viewing-banner"><span>' + CONFIG.VIEWING_ADMIN_BANNER_PREFIX + ' <strong>' + (ad.business_name || viewingAdminEmail) + '</strong> ' + CONFIG.VIEWING_ADMIN_BANNER_SUFFIX + (statusLabel ? ' <span style="color:' + statusColor + ';font-weight:700;">[' + statusLabel + ']</span>' : '') + '</span><button class="btn-return" onclick="viewingAdminEmail=null;renderAdminPanels();">' + CONFIG.VIEWING_ADMIN_RETURN_BUTTON + '</button></div>';
        html += '<div class="business-info-card"><h3>' + CONFIG.VIEWING_ADMIN_INFO_TITLE + '</h3><div class="info-grid"><span>Business:</span><strong>' + (ad.business_name || 'N/A') + '</strong><span>Owner:</span><strong>' + (ad.name || 'N/A') + '</strong><span>Email:</span><strong>' + (ad.email || 'N/A') + '</strong><span>WhatsApp:</span><strong>' + (ad.whatsapp || 'N/A') + '</strong><span>Expires:</span><strong>' + (ad.expiry_date ? new Date(ad.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A') + '</strong></div>';
        html += '<div class="admin-actions-row">';
        if (isExpired && !isFrozen) html += '<button class="btn-let-him" onclick="letAdminContinue(\'' + viewingAdminEmail + '\')">' + CONFIG.VIEWING_ADMIN_LET_HIM_BUTTON + '</button>';
        if (!isFrozen) html += '<button class="btn-freeze" onclick="freezeAdmin(\'' + viewingAdminEmail + '\')">' + CONFIG.VIEWING_ADMIN_FREEZE_BUTTON + '</button>';
        else html += '<button class="btn-unfreeze" onclick="unfreezeAdmin(\'' + viewingAdminEmail + '\')">' + CONFIG.VIEWING_ADMIN_UNFREEZE_BUTTON + '</button>';
        html += '<button class="btn-outline btn-sm" style="color:#e74c3c;border-color:#e74c3c;" onclick="deleteAdminCompletely(\'' + viewingAdminEmail + '\', \'' + (ad.business_name || viewingAdminEmail).replace(/'/g, "\\'") + '\')"><i class="fas fa-trash"></i> Delete Store</button></div></div>';
        html += '<div class="message-section"><h4>' + CONFIG.VIEWING_ADMIN_SEND_MESSAGE_LABEL + '</h4><textarea id="admin-message-input" placeholder="' + CONFIG.VIEWING_ADMIN_SEND_MESSAGE_PLACEHOLDER + '"></textarea><button class="btn-send-msg" id="send-msg-btn" onclick="sendMessageToAdmin(\'' + viewingAdminEmail + '\')">' + CONFIG.VIEWING_ADMIN_SEND_MESSAGE_BUTTON + '</button></div>';
    }

    // Welcome card
    if (!viewingAdminEmail) {
        var expiryDate = '';
        if (!isCEO) { var sa = await supabase.from('admins').select('expiry_date').eq('email', currentUserEmail).single(); if (sa.data && sa.data.expiry_date) expiryDate = 'Expires: ' + new Date(sa.data.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
        var roleLabel = isCEO ? CONFIG.DASHBOARD_WELCOME_CEO_ROLE : CONFIG.DASHBOARD_WELCOME_ADMIN_ROLE;
        var roleClass = isCEO ? 'ceo' : 'admin';
        var welcomeSub = isCEO ? CONFIG.DASHBOARD_WELCOME_CEO_SUBTITLE : CONFIG.DASHBOARD_WELCOME_ADMIN_SUBTITLE;
        html += '<div class="welcome-card"><h3>Welcome, ' + (currentUserEmail.split('@')[0] || 'Admin') + '</h3><span class="role-badge ' + roleClass + '">' + roleLabel + '</span><p class="welcome-subtitle">' + welcomeSub + '</p>' + (expiryDate ? '<p class="welcome-expiry">' + expiryDate + '</p>' : '') + '</div>';
    }

    // CEO: Requests & Partners cards
    if (isCEO && !viewingAdminEmail) {
        var applications = await supabase.from('admin_applications').select('*').order('created_at', { ascending: false });
        var appsData = applications.data || [];
        var pendingCount = appsData.filter(function(a) { return a.status === 'pending'; }).length;
        var badgeHtml = pendingCount > 0 ? '<span class="badge">' + pendingCount + '</span>' : '';
        html += '<div class="admin-section-card"><h4 onclick="navigateTo(\'admin-requests\')" style="cursor:pointer;">' + CONFIG.ADMIN_REQUESTS_SECTION_NAME + badgeHtml + ' <i class="fas fa-arrow-right" style="font-size:14px;color:var(--text-muted);"></i></h4></div>';
        html += '<div class="admin-section-card"><h4 onclick="navigateTo(\'admin-partners\')" style="cursor:pointer;">' + CONFIG.ADMIN_PARTNERS_SECTION_NAME + ' <i class="fas fa-arrow-right" style="font-size:14px;color:var(--text-muted);"></i></h4></div>';
    }

    // Admin Guide + Settings + Hani Toggle (CEO)
    if (!viewingAdminEmail) {
        html += '<div class="admin-guide-card"><h4 onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\'">' + CONFIG.ADMIN_GUIDE_TITLE + ' <i class="fas fa-chevron-down" style="font-size:12px;"></i></h4><div style="display:none;"><table><tr><td>📦 Products</td><td>Create & manage your leather goods</td></tr><tr><td>📁 Categories</td><td>Organize products into sections</td></tr><tr><td>🔖 Subcategories</td><td>Further refine your catalog</td></tr><tr><td>⭐ Featured</td><td>Highlight products on homepage (CEO-only)</td></tr><tr><td>📷 Images</td><td>Upload main + side images with multi-picker</td></tr><tr><td>💰 Discounts</td><td>Set percentage-based sales</td></tr></table><p style="font-size:10px;color:var(--text-muted);text-align:right;margin-top:4px;">' + CONFIG.ADMIN_GUIDE_FOOTER + '</p></div></div>';
        html += '<div class="admin-card" style="cursor:pointer;" onclick="showAdminSettings()"><h4 style="margin:0;color:var(--accent);"><i class="fas fa-cog"></i> ' + CONFIG.SETTINGS_TITLE + '</h4><p style="font-size:11px;color:var(--text-muted);margin:4px 0 0;">Manage your password, business name, and contact details.</p></div>';
        if (isCEO) {
            html += '<div class="admin-card" style="margin-top:12px;"><h4 style="margin:0;color:var(--accent);display:flex;align-items:center;justify-content:space-between;">🌸 Hani <label class="mock-toggle"><input type="checkbox" id="hani-toggle-checkbox" checked onchange="toggleHaniVisibility(this.checked)"><span class="mock-toggle-slider"></span></label></h4><p style="font-size:11px;color:var(--text-muted);margin:4px 0 0;">Show or hide Hani on the website.</p></div>';
        }
    }

    // Add Product / Add Category buttons
    html += '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;"><button class="btn-primary" onclick="showAddProductForm()"><i class="fas fa-plus"></i> ' + CONFIG.UI_ADD_PRODUCT + '</button><button class="btn-secondary" onclick="showAddCategoryForm()"><i class="fas fa-plus"></i> ' + CONFIG.UI_ADD_CATEGORY + '</button></div>';

    // Categories hierarchy
    html += '<div class="admin-card"><h4 style="margin-bottom:12px;">📁 Categories (' + filteredCategories.length + ')</h4>';
    if (filteredCategories.length === 0) {
        html += '<div class="empty-state"><i class="fas fa-folder-open"></i><p>' + CONFIG.EMPTY_CATEGORIES + '</p></div>';
    } else {
        for (var c = 0; c < filteredCategories.length; c++) {
            var cat = filteredCategories[c];
            var subs = filteredSubcategories.filter(function(s) { return s.category_id == cat.id; });
            html += '<div style="margin:8px 0;"><div class="admin-item" style="background:var(--bg-secondary);padding:8px 12px;border-radius:8px;cursor:pointer;" onclick="toggleCatProducts(' + c + ')"><span><strong>' + (cat.emoji || '') + ' ' + cat.name + '</strong> <small>(' + subs.length + ' subcategories)</small></span><span><i class="fas fa-arrow-up" style="cursor:pointer;margin:0 4px;" onclick="event.stopPropagation();moveCategoryUp(' + allCategories.indexOf(cat) + ')"></i><i class="fas fa-arrow-down" style="cursor:pointer;margin:0 4px;" onclick="event.stopPropagation();moveCategoryDown(' + allCategories.indexOf(cat) + ')"></i><i class="fas fa-pencil-alt" style="cursor:pointer;margin:0 4px;color:var(--accent);" onclick="event.stopPropagation();showEditCategoryForm(' + allCategories.indexOf(cat) + ')"></i><i class="fas fa-trash" style="cursor:pointer;margin:0 4px;color:#e74c3c;" onclick="event.stopPropagation();deleteCategory(' + allCategories.indexOf(cat) + ')"></i></span></div><div id="cat-subproducts-' + c + '" style="display:none;padding-left:16px;">';
            for (var s = 0; s < subs.length; s++) {
                var sub = subs[s];
                var prods = filteredProducts.filter(function(p) { return p.subcategory_id == sub.id; });
                html += '<div style="margin:4px 0;"><div class="admin-item" style="cursor:pointer;padding:6px 10px;border-radius:6px;" onclick="toggleSubProducts(\'subprods-' + c + '-' + s + '\')"><span>📂 ' + sub.name + ' <small>(' + prods.length + ' products)</small></span><span><i class="fas fa-pencil-alt" style="cursor:pointer;margin:0 4px;color:var(--accent);" onclick="event.stopPropagation();showEditSubcategoryForm(' + allSubcategories.indexOf(sub) + ')"></i><i class="fas fa-trash" style="cursor:pointer;margin:0 4px;color:#e74c3c;" onclick="event.stopPropagation();deleteSubcategory(' + allSubcategories.indexOf(sub) + ')"></i></span></div><div id="subprods-' + c + '-' + s + '" style="display:none;padding-left:12px;">';
                for (var pidx = 0; pidx < prods.length; pidx++) {
                    var prod = prods[pidx];
                    html += '<div class="admin-item"><span>' + (prod.image_url ? '<img src="' + prod.image_url + '" style="width:24px;height:24px;border-radius:4px;object-fit:cover;margin-right:8px;">' : '<span style="font-size:18px;margin-right:8px;">' + (prod.image_icon || '📦') + '</span>') + prod.name + ' — ₦' + prod.price.toLocaleString() + (prod.featured ? ' ⭐' : '') + (prod.is_mock ? ' <span style="background:#f39c12;color:#fff;padding:1px 5px;border-radius:3px;font-size:9px;">MOCK</span>' : '') + '</span><span>' + (prod.is_mock ? '' : '<i class="fas fa-pencil-alt" style="cursor:pointer;color:var(--accent);" onclick="showEditProductForm(' + allProducts.indexOf(prod) + ')"></i><i class="fas fa-trash" style="cursor:pointer;color:#e74c3c;margin-left:8px;" onclick="deleteProduct(' + allProducts.indexOf(prod) + ')"></i>') + '</span></div>';
                }
                html += '</div></div>';
            }
            html += '<div style="padding-left:12px;margin-top:6px;"><button class="btn-secondary btn-sm" onclick="event.stopPropagation();showAddSubcategoryForm()"><i class="fas fa-plus"></i> Add Subcategory</button></div></div></div>';
        }
    }
    html += '</div>';

    // Announcement & Maintenance (CEO only)
    if (isCEO && !viewingAdminEmail) {
        html += '<div class="admin-card" style="margin-top:16px;"><h4 style="margin-bottom:12px;">' + CONFIG.ADMIN_ANNOUNCEMENT_SECTION + '</h4>';
        html += '<label style="font-size:13px;font-weight:600;">📢 Announcement Text</label><input id="admin-announcement" class="admin-input" value="' + (announcementText || '') + '" placeholder="Announcement text"><button class="btn-primary btn-sm" style="margin-top:8px;" id="announce-save-btn" onclick="saveAnnouncement()">Save Announcement</button>';
        html += '<hr style="margin:16px 0;border-color:var(--border);">';
        html += '<label style="font-size:13px;font-weight:600;">🔧 Maintenance Mode</label><div style="display:flex;align-items:center;gap:12px;margin:8px 0;"><span style="font-weight:600;font-size:14px;">OFF</span><label class="mock-toggle"><input type="checkbox" id="maintenance-toggle-checkbox" ' + (maintenanceModeActive ? 'checked' : '') + ' onchange="toggleMaintenanceMode(this.checked)"><span class="mock-toggle-slider"></span></label><span style="font-weight:600;font-size:14px;">ON</span></div><p style="font-size:11px;color:var(--text-muted);margin-top:6px;line-height:1.5;">' + CONFIG.MAINTENANCE_MODE_TOGGLE_NOTE + '</p></div>';
    }

    // Mock Data Generator (CEO only)
    if (isCEO && !viewingAdminEmail) {
        html += '<div class="admin-card" style="margin-top:20px;"><h4 style="margin-bottom:12px;">' + CONFIG.UI_MOCK_DATA_TITLE + '</h4>';
        html += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px;"><span style="font-weight:600;font-size:14px;">' + CONFIG.UI_MOCK_DATA_OFF + '</span><label class="mock-toggle"><input type="checkbox" id="mock-toggle-checkbox" ' + (mockDataActive ? 'checked' : '') + ' onchange="toggleMockData(this.checked)"><span class="mock-toggle-slider"></span></label><span style="font-weight:600;font-size:14px;">' + CONFIG.UI_MOCK_DATA_ON + '</span></div>';
        if (mockDataActive) {
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;"><label style="font-size:13px;">' + CONFIG.UI_MOCK_DATA_COUNT_LABEL + ' <input type="number" id="mock-data-count" value="' + (CONFIG.MOCK_DATA_PRODUCT_COUNT || 20) + '" min="1" max="500" class="admin-input" style="width:70px;display:inline-block;"></label><button class="btn-primary btn-sm" onclick="generateMockCount()"><i class="fas fa-bolt"></i> Generate</button></div>';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;"><label style="font-size:13px;">Feature %: <input type="number" id="mock-feature-percent" value="' + CONFIG.MOCK_DATA_FEATURE_PERCENT + '" min="0" max="100" class="admin-input" style="width:60px;display:inline-block;">%</label><button class="btn-secondary btn-sm" onclick="setMockFeaturePercent()"><i class="fas fa-star"></i> Set Featured</button><button class="btn-secondary btn-sm" onclick="randomizeMockData()"><i class="fas fa-dice"></i> Randomize</button></div>';
            html += '<p style="font-size:11px;color:var(--text-muted);margin-top:8px;">' + CONFIG.UI_MOCK_DATA_ACTIVE + ' <strong>' + mockProducts.length + '</strong> ' + CONFIG.UI_MOCK_DATA_PRODUCTS + '</p>';
        }
        html += '<p style="font-size:10px;color:var(--text-muted);margin-top:8px;">' + CONFIG.UI_MOCK_DATA_CEO_ONLY + '</p></div>';
    }

    // Email Center Card
    if (!viewingAdminEmail) {
        html += '<div class="admin-card" style="margin-top:20px;cursor:pointer;" onclick="showEmailCenter()"><h4 style="margin:0;color:var(--accent);"><i class="fas fa-envelope"></i> ' + CONFIG.UI_EMAIL_CENTER_TITLE + '</h4><p style="font-size:11px;color:var(--text-muted);margin:4px 0 0;">' + (isCEO ? 'Send professional emails from your custom domain.' : 'Send a direct message to the CEO.') + '</p></div>';
    }

    container.innerHTML = html;
}

function toggleCatProducts(i) { var el = document.getElementById('cat-subproducts-' + i); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
function toggleSubProducts(id) { var el = document.getElementById(id); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; }
function toggleHaniVisibility(show) { var el = document.getElementById('hani-character'); if (el) el.style.display = show ? 'flex' : 'none'; localStorage.setItem('hani_visible', show ? '1' : '0'); }

async function saveAnnouncement() {
    if (CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) === -1) return;
    var txt = document.getElementById('admin-announcement').value;
    var btn = document.getElementById('announce-save-btn'); setBtnLoading(btn, 'Saving...');
    await supabase.from('site_settings').update({ announcement_text: txt }).eq('id', 1);
    announcementText = txt;
    var atEl = document.getElementById('announcement-text'); if (atEl) atEl.textContent = txt;
    resetBtn(btn, 'Save Announcement');
    showHaniPopup('Announcement Saved! 📢', '', null, 'success'); setTimeout(closeHaniPopup, 5000);
}

// ============ CEO ACTIONS ============
async function letAdminContinue(email) {
    var expiryDate = new Date(); expiryDate.setMonth(expiryDate.getMonth() + CONFIG.ADMIN_DURATION_MONTHS);
    await supabase.from('admins').update({ expiry_date: expiryDate.toISOString(), status: 'active' }).eq('email', email);
    sendEmail(email, CONFIG.UNFREEZE_EMAIL_SUBJECT, CONFIG.UNFREEZE_EMAIL_BODY.replace(/{name}/g, email));
    showHaniPopup('Extended! 💫', 'Administratorship extended by ' + CONFIG.ADMIN_DURATION_MONTHS + ' months!', null, 'success');
    setTimeout(closeHaniPopup, 5000); renderAdminPanels();
}
async function freezeAdmin(email) {
    var reason = prompt(CONFIG.VIEWING_ADMIN_FREEZE_PROMPT, '');
    await supabase.from('admins').update({ status: 'frozen', frozen_reason: reason || 'Account frozen by CEO' }).eq('email', email);
    sendEmail(email, CONFIG.FREEZE_EMAIL_SUBJECT, CONFIG.FREEZE_EMAIL_BODY.replace(/{name}/g, email).replace(/{reason}/g, reason || 'Policy violation'));
    showHaniPopup('Account Frozen ❄️', 'My dad protects this marketplace like his own family.', null, 'info');
    setTimeout(closeHaniPopup, 5000); renderAdminPanels();
}
async function unfreezeAdmin(email) {
    await supabase.from('admins').update({ status: 'active', frozen_reason: null }).eq('email', email);
    sendEmail(email, CONFIG.UNFREEZE_EMAIL_SUBJECT, CONFIG.UNFREEZE_EMAIL_BODY.replace(/{name}/g, email));
    showHaniPopup('Account Restored 🌤️', 'My dad believes in second chances.', null, 'success');
    setTimeout(closeHaniPopup, 5000); renderAdminPanels();
}
async function deleteAdminCompletely(email, businessName) {
    confirmDelete('Delete "' + businessName + '" and ALL their products, categories, and subcategories? This is PERMANENT.', async function() {
        await supabase.from('products').delete().eq('owner_email', email);
        await supabase.from('subcategories').delete().eq('owner_email', email);
        await supabase.from('categories').delete().eq('owner_email', email);
        await supabase.from('messages').delete().eq('to_admin_email', email);
        await supabase.from('admin_applications').delete().eq('email', email);
        await supabase.from('admins').delete().eq('email', email);
        viewingAdminEmail = null; loadDynamicData(); renderAdminPanels();
        showHaniPopup('Store Deleted 🗑️', 'My dad keeps the marketplace clean.', null, 'success'); setTimeout(closeHaniPopup, 5000);
    });
}
async function sendMessageToAdmin(email) {
    var msgInput = document.getElementById('admin-message-input');
    var message = msgInput.value.trim();
    var btn = document.getElementById('send-msg-btn');
    if (!message) { showHaniPopup('Empty Message 💬', '', null, 'error'); return; }
    setBtnLoading(btn, 'Sending...');
    await supabase.from('messages').insert({ from_ceo: currentUserEmail, to_admin_email: email, message: message, seen: false });
    var adminInfo = await supabase.from('admins').select('name').eq('email', email).single();
    var adminName = (adminInfo.data && adminInfo.data.name) ? adminInfo.data.name : email;
    sendEmail(email, CONFIG.MESSAGE_EMAIL_SUBJECT, CONFIG.MESSAGE_EMAIL_BODY.replace(/{name}/g, adminName).replace(/{message}/g, message.replace(/\n/g, '<br>')));
    msgInput.value = ''; resetBtn(btn, CONFIG.VIEWING_ADMIN_SEND_MESSAGE_BUTTON);
    showHaniPopup('Message Sent! 📬', '', null, 'success'); setTimeout(closeHaniPopup, 5000);
}

// ============ EMAIL CENTER ============
function showEmailCenter() {
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1;
    var html = '<h3>' + CONFIG.UI_EMAIL_CENTER_TITLE + '</h3>';
    html += '<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">' + (isCEO ? CONFIG.UI_EMAIL_CENTER_CEO_SUBTITLE : CONFIG.UI_EMAIL_CENTER_REGULAR_SUBTITLE) + '</p>';
    if (isCEO) {
        html += '<div style="display:flex;gap:8px;margin-bottom:12px;"><label style="cursor:pointer;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;background:var(--accent);color:#fff;" id="email-type-partner-label" onclick="switchEmailType(\'partner\')">' + CONFIG.UI_EMAIL_RECIPIENT_TYPE_PARTNER + '</label><label style="cursor:pointer;padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;background:var(--bg-secondary);color:var(--text-muted);" id="email-type-custom-label" onclick="switchEmailType(\'custom\')">' + CONFIG.UI_EMAIL_RECIPIENT_TYPE_CUSTOM + '</label></div>';
        html += '<div id="email-partner-section"><input id="email-partner-search" class="admin-input" placeholder="' + CONFIG.UI_EMAIL_SEARCH_PARTNER + '" oninput="filterPartnerDropdown()" autocomplete="off"><div id="email-partner-dropdown" style="max-height:150px;overflow-y:auto;display:none;border:1px solid var(--border);border-radius:8px;margin-top:4px;"></div></div>';
        html += '<div id="email-custom-section" style="display:none;"><input id="email-custom-recipient" class="admin-input" type="email" placeholder="' + CONFIG.UI_EMAIL_CUSTOM_RECIPIENT + '"></div>';
    } else {
        html += '<p style="font-size:11px;color:var(--text-muted);margin-bottom:8px;"><i class="fas fa-lock"></i> Your message will be sent to the CEO.</p><input type="hidden" id="email-custom-recipient" value="' + CONFIG.CEO_EMAIL + '">';
    }
    html += '<input id="email-subject" class="admin-input" placeholder="' + CONFIG.UI_EMAIL_SUBJECT + '"><textarea id="email-message" class="admin-input" placeholder="' + CONFIG.UI_EMAIL_MESSAGE + '" style="min-height:120px;resize:vertical;"></textarea><button class="btn-primary" style="width:100%;margin-top:12px;" id="email-send-btn" onclick="sendCustomEmail()">' + CONFIG.UI_EMAIL_SEND_BTN + '</button><p id="email-message-status" style="font-size:12px;margin-top:8px;"></p>';
    openAdminModal(html);
    if (isCEO) {
        window._allPartners = [];
        supabase.from('admins').select('email,name,business_name').then(function(res) { window._allPartners = res.data || []; });
    }
    window._emailType = 'partner';
}
function switchEmailType(type) {
    window._emailType = type;
    var pL = document.getElementById('email-type-partner-label'), cL = document.getElementById('email-type-custom-label');
    var pS = document.getElementById('email-partner-section'), cS = document.getElementById('email-custom-section');
    if (type === 'partner') { pL.style.background = 'var(--accent)'; pL.style.color = '#fff'; cL.style.background = 'var(--bg-secondary)'; cL.style.color = 'var(--text-muted)'; pS.style.display = 'block'; cS.style.display = 'none'; }
    else { cL.style.background = 'var(--accent)'; cL.style.color = '#fff'; pL.style.background = 'var(--bg-secondary)'; pL.style.color = 'var(--text-muted)'; pS.style.display = 'none'; cS.style.display = 'block'; }
}
function filterPartnerDropdown() {
    var search = document.getElementById('email-partner-search').value.toLowerCase();
    var dropdown = document.getElementById('email-partner-dropdown');
    if (!window._allPartners || window._allPartners.length === 0) { dropdown.style.display = 'none'; return; }
    var filtered = window._allPartners.filter(function(p) { return (p.business_name && p.business_name.toLowerCase().indexOf(search) !== -1) || (p.name && p.name.toLowerCase().indexOf(search) !== -1); });
    if (filtered.length === 0 || !search) { dropdown.style.display = 'none'; return; }
    dropdown.innerHTML = filtered.map(function(p) { return '<div style="padding:8px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border);" onclick="selectPartnerEmail(\'' + p.email + '\', \'' + (p.business_name || p.name).replace(/'/g, "\\'") + '\')">' + (p.business_name || p.name) + ' <small style="color:var(--text-muted);">(' + p.email + ')</small></div>'; }).join('');
    dropdown.style.display = 'block';
}
function selectPartnerEmail(email, name) {
    document.getElementById('email-partner-search').value = name + ' (' + email + ')';
    document.getElementById('email-partner-dropdown').style.display = 'none';
    window._selectedPartnerEmail = email; window._selectedPartnerName = name;
}
async function sendCustomEmail() {
    var isCEO = CONFIG.ADMIN_CEO_EMAILS.indexOf(currentUserEmail) !== -1;
    var recipient;
    if (isCEO) { recipient = window._emailType === 'partner' ? window._selectedPartnerEmail : document.getElementById('email-custom-recipient').value.trim(); }
    else { recipient = CONFIG.CEO_EMAIL; }
    var subject = document.getElementById('email-subject').value.trim();
    var message = document.getElementById('email-message').value.trim();
    var statusEl = document.getElementById('email-message-status');
    if (!recipient) { if (statusEl) { statusEl.style.color = '#e74c3c'; statusEl.textContent = CONFIG.UI_EMAIL_NO_RECIPIENT; } return; }
    if (!subject) { if (statusEl) { statusEl.style.color = '#e74c3c'; statusEl.textContent = CONFIG.UI_EMAIL_NO_SUBJECT; } return; }
    if (!message) { if (statusEl) { statusEl.style.color = '#e74c3c'; statusEl.textContent = CONFIG.UI_EMAIL_NO_MESSAGE; } return; }
    var footer = isCEO ? '<br><br><hr style="border-color:#e8dfd6;margin:16px 0 8px;"><p style="font-size:11px;color:#a6947e;">' + CONFIG.UI_EMAIL_CEO_FOOTER.replace(/\n/g, '<br>') + '</p>' : '';
    var btn = document.getElementById('email-send-btn'); setBtnLoading(btn, 'Sending...');
    var result = await sendEmail(recipient, subject, '<p>' + message.replace(/\n/g, '<br>') + '</p>' + footer);
    resetBtn(btn, CONFIG.UI_EMAIL_SEND_BTN);
    if (result) { if (statusEl) { statusEl.style.color = '#27ae60'; statusEl.textContent = CONFIG.UI_EMAIL_SENT; } document.getElementById('email-subject').value = ''; document.getElementById('email-message').value = ''; }
    else { if (statusEl) { statusEl.style.color = '#e74c3c'; statusEl.textContent = 'Failed to send.'; } }
}
// ============ EMAIL SENDER ============
async function sendEmail(to, subject, html) {
    try {
        var response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: to, subject: subject, html: html })
        });
        if (response.ok) return true;
        var errData = await response.json().catch(function() { return {}; });
        console.error('Email API error:', errData);
        return false;
    } catch (err) {
        console.error('Email send error:', err);
        return false;
    }
}

// ============ EXPOSE PART 2 ============
window.showAddProductForm = showAddProductForm; window.saveNewProduct = saveNewProduct;
window.showEditProductForm = showEditProductForm; window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.showAddCategoryForm = showAddCategoryForm; window.saveNewCategory = saveNewCategory;
window.showEditCategoryForm = showEditCategoryForm; window.updateCategory = updateCategory;
window.deleteCategory = deleteCategory;
window.moveCategoryUp = moveCategoryUp; window.moveCategoryDown = moveCategoryDown;
window.showAddSubcategoryForm = showAddSubcategoryForm; window.saveNewSubcategory = saveNewSubcategory;
window.showEditSubcategoryForm = showEditSubcategoryForm; window.updateSubcategory = updateSubcategory;
window.deleteSubcategory = deleteSubcategory;
window.saveAnnouncement = saveAnnouncement;
window.viewAdminDashboard = viewAdminDashboard;
window.letAdminContinue = letAdminContinue; window.freezeAdmin = freezeAdmin; window.unfreezeAdmin = unfreezeAdmin;
window.deleteAdminCompletely = deleteAdminCompletely; window.sendMessageToAdmin = sendMessageToAdmin;
window.toggleCatProducts = toggleCatProducts; window.toggleSubProducts = toggleSubProducts;
window.addSideImagePicker = addSideImagePicker; window.removeSideImageRow = removeSideImageRow;
window.sideImageSelected = sideImageSelected;
window.renderAdminPanels = renderAdminPanels;
window.showEmailCenter = showEmailCenter; window.sendCustomEmail = sendCustomEmail;
window.switchEmailType = switchEmailType; window.filterPartnerDropdown = filterPartnerDropdown;
window.selectPartnerEmail = selectPartnerEmail;
window.toggleHaniVisibility = toggleHaniVisibility;
// ============================================
// ABIHANI EXPRESS v17 — Part 3: Requests, Partners, Popups, Feedback, Session
// ============================================

// ============ ADMIN REQUESTS INTERFACE ============
function showAdminRequests() {
    var html = '<div class="subpage-header"><button class="btn-back" onclick="navigateTo(\'admin-dashboard\');renderAdminPanels();"><i class="fas fa-arrow-left"></i></button><h3>' + CONFIG.ADMIN_REQUESTS_SECTION_NAME + '</h3></div>';
    html += '<div class="admin-tabs"><button class="admin-tab active" onclick="switchRequestTab(\'pending\', this)">' + CONFIG.DASHBOARD_TAB_PENDING + '</button><button class="admin-tab" onclick="switchRequestTab(\'approved\', this)">' + CONFIG.DASHBOARD_TAB_APPROVED + '</button><button class="admin-tab" onclick="switchRequestTab(\'rejected\', this)">' + CONFIG.DASHBOARD_TAB_REJECTED + '</button></div>';
    html += '<div id="request-tab-content"></div>';
    document.getElementById('admin-dashboard-content').innerHTML = html;
    loadRequestTab('pending');
    pushToHistory('admin-requests');
}
async function switchRequestTab(tab, btn) {
    document.querySelectorAll('.admin-tab').forEach(function(t) { t.classList.remove('active'); });
    btn.classList.add('active'); loadRequestTab(tab);
}
async function loadRequestTab(tab) {
    var container = document.getElementById('request-tab-content'); if (!container) return;
    container.innerHTML = '<div class="skeleton skeleton-bar"></div><div class="skeleton skeleton-bar"></div>';
    var applications = await supabase.from('admin_applications').select('*').order('created_at', { ascending: false });
    var appsData = applications.data || [];
    var filtered = appsData.filter(function(a) { return a.status === tab; });
    if (filtered.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>' + CONFIG.EMPTY_APPLICATIONS + '</p></div>'; return; }
    var html = '';
    for (var i = 0; i < filtered.length; i++) {
        var app = filtered[i];
        html += '<div class="request-item"><div class="request-info"><strong>' + (app.name || 'Unknown') + '</strong><small>' + (app.email || '') + '</small><small>' + (app.business_name || 'N/A') + ' | WhatsApp: ' + (app.whatsapp || 'N/A') + '</small><small style="color:var(--text-muted);">Applied: ' + new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</small>';
        if (tab === 'approved' && app.approved_at) html += '<small style="color:#27ae60;">Approved: ' + new Date(app.approved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</small>';
        if (tab === 'rejected') { var rejectReason = app.reject_reason || CONFIG.ADMIN_REJECT_REASON; html += '<small style="color:#e74c3c;">Reason: ' + rejectReason + '</small>'; if (app.rejected_at) html += '<small style="color:var(--text-muted);">Rejected: ' + new Date(app.rejected_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + '</small>'; }
        html += '</div>';
        if (tab === 'pending') html += '<div class="request-actions"><button class="btn-approve" onclick="approveApplication(\'' + app.id + '\', this)"><i class="fas fa-check"></i> Approve</button><button class="btn-reject" onclick="rejectApplication(\'' + app.id + '\', this)"><i class="fas fa-times"></i> Reject</button></div>';
        if (tab === 'rejected') html += '<div class="request-actions"><button class="btn-outline btn-sm" style="color:#e74c3c;border-color:#e74c3c;" onclick="deleteApplication(\'' + app.id + '\')"><i class="fas fa-trash"></i></button></div>';
        html += '</div>';
    }
    container.innerHTML = html;
}
async function approveApplication(appId, btn) {
    if (btn) setBtnLoading(btn, '...');
    var app = await supabase.from('admin_applications').select('*').eq('id', appId).single();
    if (!app.data) { showHaniPopup('Not Found 🔍', 'Application not found.', null, 'error'); return; }
    var appData = app.data; var expiryDate = new Date(); expiryDate.setMonth(expiryDate.getMonth() + CONFIG.ADMIN_DURATION_MONTHS);
    await supabase.from('admin_applications').update({ status: 'approved', approved_at: new Date().toISOString(), expiry_date: expiryDate.toISOString() }).eq('id', appId);
    await supabase.from('admins').insert({ email: appData.email, password_hash: '', name: appData.name, business_name: appData.business_name, whatsapp: appData.whatsapp, role: 'admin', status: 'pending_password', expiry_date: expiryDate.toISOString() });
    sendEmail(appData.email, CONFIG.APPROVAL_EMAIL_SUBJECT, CONFIG.APPROVAL_EMAIL_BODY.replace(/{name}/g, appData.name).replace(/{business}/g, appData.business_name).replace(/{expiry}/g, expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })));
    loadRequestTab('pending');
    showHaniPopup('Approved! 🎉', 'Welcome to the family, ' + appData.name + '!', null, 'success'); setTimeout(closeHaniPopup, 5000);
}
async function rejectApplication(appId, btn) {
    var reason = prompt('Reason for rejection:', CONFIG.ADMIN_REJECT_REASON); if (reason === null) return;
    if (btn) setBtnLoading(btn, '...'); reason = reason || CONFIG.ADMIN_REJECT_REASON;
    var app = await supabase.from('admin_applications').select('*').eq('id', appId).single();
    if (!app.data) { showHaniPopup('Not Found 🔍', '', null, 'error'); return; }
    await supabase.from('admin_applications').update({ status: 'rejected', reject_reason: reason, rejected_at: new Date().toISOString() }).eq('id', appId);
    sendEmail(app.data.email, CONFIG.REJECTION_EMAIL_SUBJECT, CONFIG.REJECTION_EMAIL_BODY.replace(/{name}/g, app.data.name).replace(/{business}/g, app.data.business_name).replace(/{reason}/g, reason));
    loadRequestTab('pending');
    showHaniPopup('Rejected 📝', 'Email sent to ' + app.data.name, null, 'info'); setTimeout(closeHaniPopup, 5000);
}
async function deleteApplication(appId) {
    confirmDelete('Delete this application permanently?', async function() { await supabase.from('admin_applications').delete().eq('id', appId); loadRequestTab('rejected'); showHaniPopup('Deleted! 🗑️', '', null, 'success'); setTimeout(closeHaniPopup, 5000); });
}

// ============ ADMIN PARTNERS INTERFACE ============
function showAdminPartners() {
    var html = '<div class="subpage-header"><button class="btn-back" onclick="navigateTo(\'admin-dashboard\');renderAdminPanels();"><i class="fas fa-arrow-left"></i></button><h3>' + CONFIG.ADMIN_PARTNERS_SECTION_NAME + '</h3></div>';
    html += '<div id="partners-list-content"><div class="skeleton skeleton-bar"></div><div class="skeleton skeleton-bar"></div></div>';
    document.getElementById('admin-dashboard-content').innerHTML = html;
    loadPartnersList(); pushToHistory('admin-partners');
}
async function loadPartnersList() {
    var container = document.getElementById('partners-list-content'); if (!container) return;
    var admins = await supabase.from('admins').select('*').neq('role', 'Owner').order('created_at', { ascending: false });
    var partners = admins.data || [];
    if (partners.length === 0) { container.innerHTML = '<div class="empty-state"><i class="fas fa-store-alt"></i><p>' + CONFIG.EMPTY_PARTNERS + '</p></div>'; return; }
    var html = '<div class="admin-card">';
    for (var i = 0; i < partners.length; i++) {
        var p = partners[i];
        var isExpired = p.expiry_date && new Date(p.expiry_date) < new Date();
        var isFrozen = p.status === 'frozen';
        var statusClass = isFrozen ? 'frozen' : (isExpired ? 'expired' : 'active-status');
        var statusText = isFrozen ? CONFIG.VIEWING_ADMIN_FROZEN_LABEL : (isExpired ? CONFIG.VIEWING_ADMIN_EXPIRED_LABEL : 'Active');
        html += '<div class="partner-item" onclick="viewAdminDashboard(\'' + p.email + '\')"><span class="partner-name">' + (p.business_name || p.email) + ' <span class="partner-status ' + statusClass + '">' + statusText + '</span></span><span class="partner-arrow"><i class="fas fa-chevron-right"></i></span></div>';
    }
    html += '</div>'; container.innerHTML = html;
}
async function viewAdminDashboard(email) {
    viewingAdminEmail = email; pushToHistory('viewing-partner'); showPage('admin-dashboard'); await loadDynamicData(); renderAdminPanels();
}

// ============ ADMIN APPLICATION FORM ============
function showAdminApplicationForm() {
    var featuresHtml = CONFIG.ADMIN_APP_FEATURES.map(function(f) { return '<li><i class="fas fa-check-circle" style="color:#27ae60;"></i> ' + f + '</li>'; }).join('');
    var expiryDate = new Date(); expiryDate.setMonth(expiryDate.getMonth() + CONFIG.ADMIN_DURATION_MONTHS);
    var expiryStr = expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ', 9:00 am WAT';
    openAdminModal(
        '<h3 style="text-align:center;color:var(--accent);">' + CONFIG.ADMIN_APP_HEADING + '</h3>' +
        '<p style="text-align:center;color:var(--text-secondary);margin-bottom:16px;">' + CONFIG.ADMIN_APP_SUBHEADING + '</p>' +
        '<div style="background:var(--bg-secondary);border-radius:12px;padding:12px;margin-bottom:12px;"><h4 style="margin-bottom:8px;">✨ Administrator Benefits</h4><ul style="list-style:none;padding:0;">' + featuresHtml + '</ul></div>' +
        '<div style="background:#fef9f0;border:1px solid var(--accent);border-radius:12px;padding:12px;margin-bottom:12px;"><p style="font-weight:700;color:var(--accent);">💰 ' + CONFIG.APP_FORM_PRICE_LABEL + ': ' + CONFIG.ADMIN_PRICE + '/' + CONFIG.APP_FORM_DURATION_LABEL + '</p><p style="font-size:12px;color:var(--text-secondary);">⏰ ' + CONFIG.APP_FORM_EXPIRY_LABEL + ': <strong>' + expiryStr + '</strong></p><p style="font-size:12px;color:var(--text-secondary);margin-top:8px;"><strong>📞 ' + CONFIG.APP_FORM_PAYMENT_DETAILS_LABEL + ':</strong><br>' + CONFIG.ADMIN_PAYMENT_INFO + '</p></div>' +
        '<hr style="margin:12px 0;">' +
        '<input id="app-name" class="admin-input" placeholder="' + CONFIG.APP_FORM_NAME_LABEL + '" autocomplete="name">' +
        '<input id="app-business" class="admin-input" placeholder="' + CONFIG.APP_FORM_BUSINESS_LABEL + '" autocomplete="organization">' +
        '<input id="app-email" class="admin-input" type="email" placeholder="' + CONFIG.APP_FORM_EMAIL_LABEL + '" autocomplete="email">' +
        '<input id="app-whatsapp" class="admin-input" type="tel" placeholder="' + CONFIG.APP_FORM_WHATSAPP_LABEL + '" autocomplete="tel">' +
        '<label style="font-size:12px;">📎 ' + CONFIG.APP_FORM_RECEIPT_LABEL + '</label><input type="file" id="app-receipt" accept="image/*" class="admin-input">' +
        '<button class="btn-primary" style="width:100%;margin-top:12px;" onclick="submitAdminApplication()">📤 ' + CONFIG.APP_FORM_SUBMIT_BUTTON + '</button>'
    );
}
async function submitAdminApplication() {
    var name = document.getElementById('app-name').value.trim(); var business = document.getElementById('app-business').value.trim();
    var email = document.getElementById('app-email').value.trim(); var whatsapp = document.getElementById('app-whatsapp').value.trim();
    if (!name || !business || !email || !whatsapp) { showHaniPopup('All Fields Required 📝', '', null, 'error'); return; }
    var existingApp = await supabase.from('admin_applications').select('id').eq('email', email);
    if (existingApp.data && existingApp.data.length > 0) { showHaniPopup('Already Applied 📋', 'You have already applied. Please wait for review.', null, 'info'); return; }
    var expiryDate = new Date(); expiryDate.setMonth(expiryDate.getMonth() + CONFIG.ADMIN_DURATION_MONTHS);
    await supabase.from('admin_applications').insert({ name: name, business_name: business, email: email, whatsapp: whatsapp, password_hash: '', status: 'pending', expiry_date: expiryDate.toISOString() });
    localStorage.setItem('abihani_applicant_email', email);
    sendEmail(email, CONFIG.CONFIRMATION_EMAIL_SUBJECT, CONFIG.CONFIRMATION_EMAIL_BODY.replace(/{name}/g, name).replace(/{business}/g, business));
    closeAdminModal();
    showHaniPopup(CONFIG.ADMIN_APP_SUCCESS_TITLE, CONFIG.ADMIN_APP_SUCCESS_MESSAGE, [
        { text: 'Send Receipt via WhatsApp', primary: true, action: function() { window.open('https://wa.me/' + CONFIG.CEO_WHATSAPP.replace(/[^0-9]/g, ''), '_blank'); closeHaniPopup(); } },
        { text: 'Close', primary: false, action: closeHaniPopup }
    ], 'success');
    checkExistingApplication();
}

// ============ CHECK EXISTING APPLICATION ============
async function checkExistingApplication() {
    var storedEmail = localStorage.getItem('abihani_applicant_email');
    var card = document.getElementById('already-applied-card');
    if (!storedEmail) { if (card) card.style.display = 'none'; return; }
    var appResult = await supabase.from('admin_applications').select('*').eq('email', storedEmail).order('created_at', { ascending: false }).limit(1).single();
    if (!appResult.data) { if (card) card.style.display = 'none'; return; }
    var app = appResult.data; if (!card) return;
    var statusText = '', statusColor = '';
    if (app.status === 'pending') { statusText = CONFIG.PROFILE_APP_STATUS_PENDING; statusColor = '#f39c12'; }
    else if (app.status === 'approved') { statusText = CONFIG.PROFILE_APP_STATUS_APPROVED; statusColor = '#27ae60'; }
    else { statusText = CONFIG.PROFILE_APP_STATUS_REJECTED; statusColor = '#e74c3c'; }
    card.style.display = 'block';
    card.innerHTML = '<div class="admin-card" style="text-align:center;"><h4>' + CONFIG.PROFILE_APP_STATUS_CARD_TITLE + '</h4><p style="color:var(--text-secondary);margin:8px 0;">Status: <strong style="color:' + statusColor + ';">' + statusText + '</strong></p><p style="font-size:12px;color:var(--text-muted);">Business: ' + (app.business_name || 'N/A') + '</p><p style="font-size:12px;color:var(--text-muted);">Email: ' + (app.email || 'N/A') + '</p><button class="btn-secondary btn-sm" style="margin-top:8px;" onclick="document.getElementById(\'already-applied-card\').style.display=\'none\'">' + CONFIG.PROFILE_APP_CLOSE_BTN + '</button></div>';
}

// ============ CUSTOM ORDER POPUP ============
function openCustomOrderPopup() {
    document.getElementById('custom-order-popup-title').textContent = CONFIG.CUSTOM_ORDER_TITLE;
    document.getElementById('custom-order-popup-subtitle').textContent = CONFIG.CUSTOM_ORDER_SUBTITLE;
    var form = document.getElementById('custom-order-form'); if (!form) return;
    var h = '';
    for (var f = 0; f < CONFIG.CUSTOM_ORDER_FIELDS.length; f++) {
        var fd = CONFIG.CUSTOM_ORDER_FIELDS[f];
        h += '<label style="font-size:13px;font-weight:500;margin-top:8px;display:block;">' + fd.label + (fd.required ? ' *' : ' <span style="color:var(--text-muted);">(Optional)</span>') + '</label>';
        if (fd.type === 'textarea') h += '<textarea name="co_' + f + '" placeholder="' + fd.placeholder + '" ' + (fd.required ? 'required' : '') + ' rows="3" style="width:100%;padding:12px;border-radius:25px;border:1px solid var(--border);margin:4px 0;font-family:inherit;background:var(--bg-primary);color:var(--text-primary);"></textarea>';
        else h += '<input type="' + fd.type + '" name="co_' + f + '" placeholder="' + fd.placeholder + '" ' + (fd.required ? 'required' : '') + ' style="width:100%;padding:12px;border-radius:25px;border:1px solid var(--border);margin:4px 0;background:var(--bg-primary);color:var(--text-primary);">';
    }
    h += '<button type="submit" class="btn-submit-order"><i class="fab fa-whatsapp"></i> Send via WhatsApp</button>';
    form.innerHTML = h;
    document.getElementById('custom-order-popup').style.display = 'flex'; document.body.style.overflow = 'hidden';
}
function closeCustomOrderPopup() { document.getElementById('custom-order-popup').style.display = 'none'; document.body.style.overflow = ''; }
function submitCustomOrder(e) {
    e.preventDefault();
    var msg = '🛠️ *CUSTOM ORDER REQUEST*\n\n';
    for (var f = 0; f < CONFIG.CUSTOM_ORDER_FIELDS.length; f++) {
        var val = (document.querySelector('[name="co_' + f + '"]') ? document.querySelector('[name="co_' + f + '"]').value : '').trim();
        if (val) msg += '*' + CONFIG.CUSTOM_ORDER_FIELDS[f].label + ':* ' + val + '\n';
    }
    msg += '\n📅 _Sent from Abihani Express Website_';
    window.open('https://wa.me/' + CONFIG.WHATSAPP_NUMBER.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg), '_blank');
    closeCustomOrderPopup(); showHaniPopup('Sent! 📤', 'Order request sent via WhatsApp!', null, 'success'); setTimeout(closeHaniPopup, 5000);
}

// ============ BOOK & ARTISAN POPUPS ============
function openBookPopup(i) {
    var b = CONFIG.BOOKS[i]; if (!b) return;
    document.getElementById('book-popup-img').src = b.cover;
    document.getElementById('book-popup-title').textContent = b.title;
    document.getElementById('book-popup-author').textContent = 'by ' + b.author;
    document.getElementById('book-popup-price').textContent = b.price;
    document.getElementById('book-popup-synopsis').textContent = b.synopsis || '';
    var actionBtn = document.getElementById('book-popup-action-btn');
    if (b.isFree) { actionBtn.innerHTML = '<i class="fas fa-download"></i> Download Free PDF'; actionBtn.className = 'btn-popup-download'; actionBtn.href = b.pdfUrl; actionBtn.target = '_blank'; }
    else { actionBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Buy via WhatsApp'; actionBtn.className = 'btn-popup-wa'; actionBtn.href = 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(b.waMessage); actionBtn.target = '_blank'; }
    document.getElementById('book-popup').style.display = 'flex'; document.body.style.overflow = 'hidden';
}
function closeBookPopup() { document.getElementById('book-popup').style.display = 'none'; document.body.style.overflow = ''; }
function openArtisanPopup() {
    var container = document.getElementById('artisan-popup-container'); if (!container) return;
    container.innerHTML = '<div class="book-popup-overlay" style="display:flex;" id="artisan-popup-inner"><div class="book-popup-content" style="max-width:500px;"><span class="book-popup-close" onclick="closeArtisanPopup()">&times;</span><div style="text-align:center;"><img src="' + CONFIG.ARTISAN_IMAGE + '" style="width:100%;max-width:300px;border-radius:16px;margin-bottom:16px;" alt="' + CONFIG.ARTISAN_NAME + '"><span class="artisan-badge" style="display:inline-block;margin-bottom:8px;">' + CONFIG.ARTISAN_BADGE_TEXT + '</span><h3 style="color:var(--accent);margin-bottom:8px;">' + CONFIG.ARTISAN_NAME + '</h3><p style="color:var(--text-secondary);font-size:13px;line-height:1.6;margin-bottom:16px;">' + CONFIG.ARTISAN_FULL_STORY + '</p><a href="https://wa.me/234' + CONFIG.ARTISAN_WHATSAPP.replace(/^0/, '') + '" class="btn-popup-wa" target="_blank"><i class="fab fa-whatsapp"></i> ' + CONFIG.ARTISAN_POPUP_CONTACT_TEXT + '</a></div></div></div>';
    document.body.style.overflow = 'hidden';
}
function closeArtisanPopup() { document.getElementById('artisan-popup-container').innerHTML = ''; document.body.style.overflow = ''; }

// ============ FEEDBACK ============
async function submitFeedback() {
    var n = document.getElementById('contact-name') ? document.getElementById('contact-name').value.trim() : 'Anonymous';
    var m = document.getElementById('contact-message') ? document.getElementById('contact-message').value.trim() : '';
    if (!m) { showHaniPopup('Empty Message 💬', 'My dad can\'t read blank pages.', null, 'error'); return; }
    var btn = document.getElementById('feedback-send-btn'); setBtnLoading(btn, 'Sending...');
    var r = await supabase.from('feedback').insert({ name: n || 'Anonymous', message: m });
    if (r.error) { showHaniPopup('Error 🔧', r.error.message, null, 'error'); resetBtn(btn, CONFIG.UI_CONTACT_SEND); return; }
    sendEmail('bayeroisa2003@gmail.com', '📬 New Feedback from ' + (n || 'Anonymous'), '<p><strong>Name:</strong> ' + (n || 'Anonymous') + '</p><p><strong>Message:</strong></p><p>' + m.replace(/\n/g, '<br>') + '</p>');
    resetBtn(btn, CONFIG.UI_CONTACT_SEND);
    document.getElementById('contact-name').value = ''; document.getElementById('contact-message').value = '';
    showHaniPopup('Thank You! 📬', 'Your words are flying to my dad\'s inbox!', null, 'success'); setTimeout(closeHaniPopup, 5000);
}

// ============ SESSION CHECK ============
(async function() {
    var session = await supabase.auth.getSession();
    if (session.data && session.data.session) {
        var email = session.data.session.user.email;
        if (CONFIG.ADMIN_CEO_EMAILS.indexOf(email) !== -1) {
            isAdminLoggedIn = true; currentUserEmail = email; currentUserRole = 'Owner'; loginTimestamp = Date.now(); saveSession();
        }
    }
    var stored = localStorage.getItem('hani_visible');
    if (stored === '0') { var el = document.getElementById('hani-character'); if (el) el.style.display = 'none'; }
})();

// ============ CONFIRM DELETE ============
function confirmDelete(msg, callback) {
    showHaniPopup(CONFIG.UI_DELETE_CONFIRM_TITLE, msg, [
        { text: CONFIG.UI_DELETE_CONFIRM_YES, primary: true, action: function() { closeHaniPopup(); if (callback) callback(); } },
        { text: CONFIG.UI_DELETE_CONFIRM_NO, primary: false, action: closeHaniPopup }
    ], 'error');
}

// ============ BUY NOW ============
function buyNow(id) {
    var p = allProducts.find(function(x) { return x.id == id; });
    if (!p) return;
    if (p.is_mock) { showHaniPopup(CONFIG.MOCK_DATA_TOAST_TITLE, CONFIG.MOCK_DATA_TOAST_MESSAGE, [{ text: CONFIG.MOCK_DATA_TOAST_CLOSE, primary: false, action: closeHaniPopup }], 'info'); return; }
    var whatsapp = p.owner_whatsapp || CONFIG.WHATSAPP_NUMBER;
    window.open('https://wa.me/' + whatsapp.replace(/[^0-9]/g, '') + '?text=Hello! I want: ' + encodeURIComponent(p.name) + ' (₦' + p.price + ')', '_blank');
}

// ============ SHOW EXPIRY WARNING ============
function showExpiryWarning(expiryDate) {
    showHaniPopup('Administratorship Expiring ⏰', 'Your partnership expires on ' + expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '. Contact my dad to renew!', [
        { text: 'Contact CEO', primary: true, action: function() { window.open('https://wa.me/' + CONFIG.CEO_WHATSAPP.replace(/[^0-9]/g, ''), '_blank'); closeHaniPopup(); } },
        { text: 'Close', primary: false, action: closeHaniPopup }
    ], 'info');
}

// ============ CHECK UNREAD MESSAGES ============
async function checkUnreadMessages(email) {
    var msgs = await supabase.from('messages').select('*').eq('to_admin_email', email).eq('seen', false).order('created_at', { ascending: false });
    if (msgs.data && msgs.data.length > 0) {
        var latestMsg = msgs.data[0];
        showHaniPopup('📬 Message from Management', latestMsg.message.replace(/\n/g, '<br>'), [
            { text: 'Close', primary: false, action: function() { closeHaniPopup(); } }
        ], 'info');
        await supabase.from('messages').update({ seen: true }).eq('id', latestMsg.id);
    }
}

// ============ EXPOSE ALL FUNCTIONS ============
window.openCustomOrderPopup = openCustomOrderPopup;
window.closeCustomOrderPopup = closeCustomOrderPopup;
window.submitCustomOrder = submitCustomOrder;
window.openBookPopup = openBookPopup;
window.closeBookPopup = closeBookPopup;
window.openArtisanPopup = openArtisanPopup;
window.closeArtisanPopup = closeArtisanPopup;
window.submitFeedback = submitFeedback;
window.showAdminApplicationForm = showAdminApplicationForm;
window.submitAdminApplication = submitAdminApplication;
window.checkExistingApplication = checkExistingApplication;
window.showAdminRequests = showAdminRequests;
window.showAdminPartners = showAdminPartners;
window.switchRequestTab = switchRequestTab;
window.approveApplication = approveApplication;
window.rejectApplication = rejectApplication;
window.deleteApplication = deleteApplication;
window.loadPartnersList = loadPartnersList;
window.buyNow = buyNow;

// ============================================
// END OF PART 3 — COMPLETE BUILD
// ABIHANI EXPRESS v17 🌸
// ============================================