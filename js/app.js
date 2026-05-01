// ============================================
// ABIHANI EXPRESS v18 — Complete Rebuild
// ============================================
var supabase = window.supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);
var allProducts = [], allCategories = [], allSubcategories = [], currentFilterCategory = null;
var isAdminLoggedIn = false, currentUserEmail = '', currentUserRole = '', currentUserIsCEO = false;
var viewingAdminEmail = null, announcementText = CONFIG.UI_ANNOUNCEMENT_DEFAULT;
var pageHistoryStack = [], mockDataActive = CONFIG.MOCK_DATA_ENABLED !== false;
var mockProducts = [], mockCategories = [], mockSubcategories = [];
var currentDetailImages = [], currentDetailIndex = 0, detailSource = 'shop';
var maintenanceModeActive = CONFIG.MAINTENANCE_MODE_ENABLED || false;
var currentDetailProduct = null, deferredPWA = null, haniTourActive = false, haniTourStep = 0;
var haniIdleTimer, inactivityTimer;

// ============ EMAIL SENDER (VIA API ROUTE) ============
async function sendEmail(to, subject, html) {
    try {
        var response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: to, subject: subject, html: html })
        });
        return response.ok;
    } catch(err) { console.error('Email error:', err); return false; }
}

// ============ TOAST SYSTEM ============
function showToast(msg, type) {
    var existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'custom-toast toast-' + (type || 'info');
    t.innerHTML = msg + '<span style="margin-left:12px;cursor:pointer;opacity:0.7" onclick="this.parentElement.remove()">✕</span>';
    t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:14px 24px;border-radius:14px;color:#fff;font-weight:600;z-index:20000;font-size:14px;max-width:90%;text-align:center;box-shadow:0 8px 24px rgba(0,0,0,0.2);cursor:pointer;animation:fadeInToast 0.3s ease';
    if (type === 'success') t.style.background = '#27ae60';
    else if (type === 'error') t.style.background = '#e74c3c';
    else t.style.background = '#b87c4f';
    document.body.appendChild(t);
    t.addEventListener('click', function() { t.remove(); });
    setTimeout(function() { if (t.parentElement) t.remove(); }, 6000);
}

// ============ INIT ============
(function init() {
    var path = window.location.pathname.replace(/\//g, '') || 'home';
    if (path === 'index.html') path = 'home';
    pageHistoryStack = [path];
    history.replaceState({ page: path, isAppPage: true }, '', '/' + (path === 'home' ? '' : path));
    checkSession();
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
    document.getElementById('pwa-install-avatar').src = CONFIG.HANI_IMAGE;
    renderHeroSlider();
    renderTestimonials();
    showAllSkeletons();
    updateNav();
    loadDynamicData();
    initPWA();
    initHaniCharacter();
    checkFirstVisit();
})();

// ============ SESSION ============
function checkSession() {
    var stored = localStorage.getItem('abihani_session');
    if (stored) {
        var session = JSON.parse(stored);
        var now = Date.now();
        if (now - session.timestamp > CONFIG.SESSION_DURATION_HOURS * 3600000) {
            localStorage.removeItem('abihani_session');
            isAdminLoggedIn = false; currentUserEmail = ''; currentUserRole = ''; currentUserIsCEO = false;
        } else {
            isAdminLoggedIn = session.loggedIn;
            currentUserEmail = session.email;
            currentUserRole = session.role;
            currentUserIsCEO = session.isCEO;
        }
    }
}
function saveSession() {
    localStorage.setItem('abihani_session', JSON.stringify({
        loggedIn: isAdminLoggedIn, email: currentUserEmail, role: currentUserRole, isCEO: currentUserIsCEO, timestamp: Date.now()
    }));
}
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (!isAdminLoggedIn) return;
    inactivityTimer = setTimeout(function() {
        isAdminLoggedIn = false; currentUserEmail = ''; currentUserRole = ''; currentUserIsCEO = false; viewingAdminEmail = null;
        localStorage.removeItem('abihani_session');
        showToast('Logged out due to inactivity', 'info');
        navigateTo('home');
    }, 300000);
}
document.addEventListener('click', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);

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
function closeHaniPopup() { document.getElementById('hani-popup-overlay').style.display = 'none'; }

// ============ HANI TOUR ============
function checkFirstVisit() {
    if (localStorage.getItem('abihani_tour_done')) return;
    if (isAdminLoggedIn) return;
    setTimeout(function() { showHaniTourIntro(); }, 1500);
}
function showHaniTourIntro() {
    showHaniPopup(CONFIG.HANI_INTRO_TITLE, CONFIG.HANI_INTRO_TEXT, [
        { text: CONFIG.HANI_TOUR_YES, primary: true, action: function() { closeHaniPopup(); startHaniTour(); } },
        { text: CONFIG.HANI_TOUR_NO, primary: false, action: function() { closeHaniPopup(); showPWABanner(); } }
    ], 'welcome');
}
function startHaniTour() { haniTourActive = true; haniTourStep = 0; document.getElementById('hani-tour-overlay').style.display = 'flex'; showTourStep(0); }
function showTourStep(i) {
    var steps = CONFIG.HANI_TOUR_STEPS;
    if (i >= steps.length) { endHaniTour(); return; }
    haniTourStep = i;
    document.getElementById('hani-tour-title').textContent = steps[i].title;
    document.getElementById('hani-tour-text').textContent = steps[i].text;
    var actDiv = document.getElementById('hani-tour-actions');
    actDiv.innerHTML = '';
    var btnText = i < steps.length - 1 ? 'Next →' : 'Finish Tour 🎉';
    var btnAction = i < steps.length - 1 ? function() { showTourStep(i + 1); } : endHaniTour;
    actDiv.innerHTML += '<button class="btn-primary btn-sm" onclick="arguments[0]">' + btnText + '</button>';
    actDiv.querySelector('button').onclick = btnAction;
    actDiv.innerHTML += '<button class="btn-secondary btn-sm" onclick="endHaniTour()">Skip Tour</button>';
    var dotsDiv = document.getElementById('hani-tour-dots'); dotsDiv.innerHTML = '';
    for (var j = 0; j < steps.length; j++) { dotsDiv.innerHTML += '<span class="hani-tour-dot' + (j === i ? ' active' : '') + '"></span>'; }
    var el = document.querySelector(steps[i].selector);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function endHaniTour() {
    haniTourActive = false;
    document.getElementById('hani-tour-overlay').style.display = 'none';
    localStorage.setItem('abihani_tour_done', '1');
    showHaniPopup('Tour Complete! 🎉', CONFIG.HANI_TOUR_END_TEXT, [
        { text: 'Close 🌸', primary: false, action: closeHaniPopup }
    ], 'success');
}

// ============ HANI CHARACTER (NO SLEEPING) ============
function initHaniCharacter() {
    var char = document.getElementById('hani-character');
    char.style.display = 'flex';
    document.getElementById('hani-char-img').src = CONFIG.HANI_IMAGE;
    var stored = localStorage.getItem('hani_visible');
    if (stored === '0') char.style.display = 'none';
    // Removed sleeping animation — keeps it lightweight
}
function toggleHaniChat() {
    var char = document.getElementById('hani-character');
    char.classList.add('waving');
    document.getElementById('hani-char-status').textContent = 'Hi! 👋';
    setTimeout(function() { char.classList.remove('waving'); document.getElementById('hani-char-status').textContent = ''; }, 1500);
}
function toggleHaniVisibility(show) {
    var el = document.getElementById('hani-character');
    if (el) el.style.display = show ? 'flex' : 'none';
    localStorage.setItem('hani_visible', show ? '1' : '0');
}

// ============ PWA ============
function initPWA() {
    window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); deferredPWA = e; if (!localStorage.getItem('abihani_tour_done')) return; setTimeout(function() { showPWABanner(); }, 3000); });
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').then(function() {}).catch(function() {}); });
    }
}
function showPWABanner() { if (!deferredPWA) return; document.getElementById('pwa-install-banner').style.display = 'flex'; }
function closePWAInstall() { document.getElementById('pwa-install-banner').style.display = 'none'; }
function installPWA() {
    if (deferredPWA) { deferredPWA.prompt(); deferredPWA.userChoice.then(function(r) { if (r.outcome === 'accepted') { document.getElementById('pwa-install-banner').style.display = 'none'; deferredPWA = null; } }); }
}

// ============ SKELETON ============
function showAllSkeletons() {
    var fp = document.getElementById('featured-products'); if (fp) fp.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
    var ag = document.getElementById('all-products-grid'); if (ag) ag.innerHTML = '<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>';
    var ch = document.getElementById('categories-home'); if (ch) ch.innerHTML = '<div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div>';
    var scf = document.getElementById('shop-categories-filter'); if (scf) scf.innerHTML = '<div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div><div class="skeleton skeleton-pill"></div>';
}

// ============ LOAD DATA ============
async function loadDynamicData() {
    var c = await supabase.from('categories').select('*').order('sort_order'); allCategories = c.data || [];
    var s = await supabase.from('subcategories').select('*'); allSubcategories = s.data || [];
    var p = await supabase.from('products').select('*').order('id'); allProducts = p.data || [];
    var a = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (a.data) {
        if (a.data.announcement_text) { announcementText = a.data.announcement_text; var atEl = document.getElementById('announcement-text'); if (atEl) atEl.textContent = announcementText; }
        if (a.data.mock_data_enabled !== undefined) mockDataActive = a.data.mock_data_enabled;
        if (a.data.maintenance_mode !== undefined) maintenanceModeActive = a.data.maintenance_mode;
    }
    if (mockDataActive) mergeMockData();
    updateCategoriesHome(); updateShopCategories(); updateFeaturedProducts();
    var ag = document.getElementById('all-products-grid'); if (ag) renderAllProducts();
}

// ============ MOCK DATA (KEPT FOR PUBLIC DISPLAY) ============
function generateMockData(count) {
    mockCategories = []; mockSubcategories = []; mockProducts = [];
    for (var i = 0; i < CONFIG.MOCK_DATA_CATEGORIES.length; i++) { var cat = CONFIG.MOCK_DATA_CATEGORIES[i]; mockCategories.push({ id: 'mock-cat-' + i, name: cat.name, emoji: cat.emoji, sort_order: i + 1, owner_email: 'mock', is_mock: true }); }
    for (var j = 0; j < CONFIG.MOCK_DATA_SUBCATEGORIES.length; j++) { var sub = CONFIG.MOCK_DATA_SUBCATEGORIES[j]; mockSubcategories.push({ id: 'mock-sub-' + j, name: sub.name, category_id: 'mock-cat-' + sub.categoryIndex, owner_email: 'mock', is_mock: true }); }
    for (var k = 0; k < count; k++) {
        var rsi = Math.floor(Math.random() * mockSubcategories.length), rs = mockSubcategories[rsi], rni = Math.floor(Math.random() * CONFIG.MOCK_PRODUCT_NAMES.length), rii = Math.floor(Math.random() * CONFIG.MOCK_DATA_ICONS.length);
        mockProducts.push({ id: 'mock-prod-' + k, name: CONFIG.MOCK_PRODUCT_NAMES[rni], price: Math.floor(Math.random() * 95000) + 5000, category_id: rs.category_id, subcategory_id: rs.id, description: 'Mock product for display.', image_url: '', image_urls: '[]', image_icon: CONFIG.MOCK_DATA_ICONS[rii], rating: parseFloat((Math.random() * 2 + 3).toFixed(1)), review_count: Math.floor(Math.random() * 235) + 12, stock_quantity: Math.floor(Math.random() * 50) + 1, discount_percent: Math.random() < 0.3 ? Math.floor(Math.random() * 40) + 5 : 0, vendor: CONFIG.PRODUCT_DEFAULT_VENDOR, location: CONFIG.PRODUCT_DEFAULT_LOCATION, featured: Math.random() < (CONFIG.MOCK_DATA_FEATURE_PERCENT / 100), owner_email: 'mock', owner_whatsapp: CONFIG.WHATSAPP_NUMBER, is_mock: true });
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
    if (!mockDataActive) { showToast('Mock data is off', 'info'); return; }
    var countEl = document.getElementById('mock-data-count'); var count = parseInt(countEl ? countEl.value : 20) || 20;
    allProducts = allProducts.filter(function(p) { return !p.is_mock; }); allCategories = allCategories.filter(function(c) { return !c.is_mock; }); allSubcategories = allSubcategories.filter(function(s) { return !s.is_mock; });
    mockCategories = []; mockSubcategories = []; mockProducts = []; generateMockData(count); mergeMockData();
    updateCategoriesHome(); updateShopCategories(); updateFeaturedProducts();
    var ag = document.getElementById('all-products-grid'); if (ag) renderAllProducts();
    renderAdminPanels(); showToast(count + ' mock products generated!', 'success');
}
function setMockFeaturePercent() {
    if (!mockDataActive) { showToast('Mock data is off', 'info'); return; }
    var percentEl = document.getElementById('mock-feature-percent'); var percent = parseInt(percentEl ? percentEl.value : 25) || 25; percent = Math.max(0, Math.min(100, percent));
    for (var i = 0; i < mockProducts.length; i++) { mockProducts[i].featured = Math.random() * 100 < percent; }
    for (var j = 0; j < allProducts.length; j++) { if (allProducts[j].is_mock) { var nm = mockProducts.find(function(mp) { return mp.id === allProducts[j].id; }); if (nm) allProducts[j].featured = nm.featured; } }
    updateFeaturedProducts(); renderAdminPanels(); showToast(percent + '% featured!', 'success');
}
async function randomizeMockData() {
    if (!mockDataActive) { showToast('Mock data is off', 'info'); return; }
    for (var i = 0; i < mockProducts.length; i++) { mockProducts[i].price = Math.floor(Math.random() * 95000) + 5000; mockProducts[i].discount_percent = Math.random() < 0.3 ? Math.floor(Math.random() * 40) + 5 : 0; mockProducts[i].stock_quantity = Math.floor(Math.random() * 50) + 1; mockProducts[i].rating = parseFloat((Math.random() * 2 + 3).toFixed(1)); }
    for (var j = 0; j < allProducts.length; j++) { if (allProducts[j].is_mock) { var nm = mockProducts.find(function(mp) { return mp.id === allProducts[j].id; }); if (nm) { allProducts[j].price = nm.price; allProducts[j].discount_percent = nm.discount_percent; allProducts[j].stock_quantity = nm.stock_quantity; allProducts[j].rating = nm.rating; } } }
    updateFeaturedProducts(); var ag = document.getElementById('all-products-grid'); if (ag) renderAllProducts(); showToast('Mock data randomized!', 'success');
}

// ============ HERO SLIDER ============
function renderHeroSlider() {
    var track = document.getElementById('slider-track'), dots = document.getElementById('slider-dots'); if (!track || !dots) return;
    track.innerHTML = CONFIG.SLIDES.map(function(s, i) { return '<div class="slide' + (i === 0 ? ' active' : '') + '"><h2>' + s.title + '</h2><p>' + s.subtitle + '</p></div>'; }).join('');
    dots.innerHTML = CONFIG.SLIDES.map(function(_, i) { return '<span class="dot' + (i === 0 ? ' active' : '') + '" onclick="goToSlide(' + i + ')"></span>'; }).join('');
}
var slideIdx = 0;
setInterval(function() {
    var slides = document.querySelectorAll('#hero-slider .slide'), dots = document.querySelectorAll('#hero-slider .dot'); if (!slides.length) return;
    slideIdx = (slideIdx + 1) % slides.length;
    for (var i = 0; i < slides.length; i++) { slides[i].classList.remove('active'); dots[i].classList.remove('active'); }
    slides[slideIdx].classList.add('active'); dots[slideIdx].classList.add('active');
}, 5000);
function goToSlide(idx) {
    slideIdx = idx; var slides = document.querySelectorAll('#hero-slider .slide'), dots = document.querySelectorAll('#hero-slider .dot');
    for (var i = 0; i < slides.length; i++) { slides[i].classList.remove('active'); dots[i].classList.remove('active'); }
    if (slides[idx]) slides[idx].classList.add('active'); if (dots[idx]) dots[idx].classList.add('active');
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

// ============ NAVIGATION (Clean URLs - No Hash) ============
var validAppPages = ['home','shop','search','about','contact','profile','admin-login','admin-dashboard','product-detail','terms','privacy'];

function navigateTo(pageName, addToHistory) {
    if (addToHistory === undefined) addToHistory = true;
    if (pageName === 'profile' && isAdminLoggedIn) { pageName = 'admin-dashboard'; }
    if (pageName === 'admin-dashboard' && !isAdminLoggedIn) { pageName = 'profile'; }
    if (pageName === 'admin-dashboard') { showPage('admin-dashboard'); renderAdminPanels(); pushToHistory('admin-dashboard'); resetInactivityTimer(); return; }
    if (pageName === 'product-detail') return;
    showPage(pageName);
    if (addToHistory && pageName !== pageHistoryStack[pageHistoryStack.length - 1]) pushToHistory(pageName);
    if (isAdminLoggedIn) resetInactivityTimer();
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
    if (prev === 'product-detail') { showPage(detailSource || 'shop'); } else showPage(prev);
}
function showPage(pageName) {
    window.scrollTo(0, 0);
    if (pageName === 'profile' && isAdminLoggedIn) { navigateTo('admin-dashboard', false); return; }
    if (pageName === 'admin-dashboard' && !isAdminLoggedIn) { navigateTo('profile', false); return; }
    document.querySelectorAll('.page-section').forEach(function(p) { p.classList.remove('active-page'); });
    var map = { 'home': 'home-page', 'shop': 'shop-page', 'product-detail': 'product-detail-page', 'search': 'search-page', 'about': 'about-page', 'contact': 'contact-page', 'terms': 'terms-page', 'privacy': 'privacy-page', 'profile': 'profile-page', 'admin-login': 'admin-login-page', 'admin-dashboard': 'admin-dashboard-page' };
    if (pageName === 'admin-dashboard') {
        var ctn = document.getElementById('admin-dashboard-content');
        if (ctn) ctn.innerHTML = '<div style="text-align:center;padding:60px 20px"><div class="spinner" style="width:40px;height:40px;border-width:3px;border-color:rgba(184,124,79,0.2);border-top-color:#b87c4f;margin:0 auto 16px"></div><p style="color:var(--text-muted);font-size:14px">Loading dashboard...</p></div>';
    }
    var target = document.getElementById(map[pageName]); if (target) target.classList.add('active-page');
    if (pageName === 'shop') renderAllProducts();
    if (pageName === 'search') { var sr = document.getElementById('search-results'); if (sr) sr.innerHTML = ''; var si = document.getElementById('search-input'); if (si) si.value = ''; }
    updateNav(); updatePageHistory(pageName);
}
function updatePageHistory(page) { if (pageHistoryStack[pageHistoryStack.length - 1] !== page) pageHistoryStack.push(page); }
function updateNav() {
    var path = window.location.pathname.replace(/\//g, '') || 'home';
    var nm = { home: 'nav-home', shop: 'nav-shop', search: 'nav-search', profile: 'nav-profile', about: 'nav-home', contact: 'nav-home', terms: 'nav-home', privacy: 'nav-home', 'admin-login': 'nav-profile', 'admin-dashboard': 'nav-profile', 'product-detail': 'nav-shop' };
    document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
    var tid = nm[path] || 'nav-home'; var an = document.getElementById(tid); if (an) an.classList.add('active');
    document.querySelectorAll('.desktop-nav a').forEach(function(a) { a.classList.remove('active'); });
    var da = document.querySelector('.desktop-nav a[data-page="' + path + '"]'); if (da) da.classList.add('active');
}
window.addEventListener('popstate', function(e) {
    var state = e.state;
    if (!state || !state.isAppPage) { navigateTo('home', false); return; }
    var path = state.page || 'home';
    pageHistoryStack = pageHistoryStack.filter(function(p) { return p !== path; });
    pageHistoryStack.push(path);
    if (validAppPages.indexOf(path) === -1) { navigateTo('home', false); return; }
    if (path === 'product-detail') { navigateTo('shop', false); } else showPage(path);
});
var initPath = window.location.pathname.replace(/\//g, '') || 'home';
(function() { pageHistoryStack = [initPath]; showPage(initPath); })();

// ============ DOM EVENTS ============
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
    var lb = document.getElementById('login-btn'); if (lb) lb.addEventListener('click', function(e) { e.preventDefault(); adminLogin(); });
    var si = document.getElementById('search-input'); if (si) si.addEventListener('input', function() { searchProducts(); });
    document.addEventListener('click', function(e) {
        var tgt = e.target.closest('button, .category-pill, .nav-item'); if (!tgt || tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA') return;
        var ripple = document.createElement('span'); ripple.className = 'ripple'; var rect = tgt.getBoundingClientRect(), size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px'; ripple.style.left = (e.clientX - rect.left - size / 2) + 'px'; ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        tgt.style.position = tgt.style.position || 'relative'; tgt.style.overflow = 'hidden';
        tgt.appendChild(ripple); setTimeout(function() { ripple.remove(); }, 500);
    });
});

// ============ PRODUCT CARDS ============
function productCardHTML(p) {
    var stars = ''; var full = Math.floor(p.rating || CONFIG.PRODUCT_DEFAULT_RATING); var half = (p.rating % 1) >= 0.5; var empty = 5 - full - (half ? 1 : 0);
    for (var i = 0; i < full; i++) stars += '<i class="fas fa-star"></i>';
    if (half) stars += '<i class="fas fa-star-half-alt"></i>';
    for (var i = 0; i < empty; i++) stars += '<i class="far fa-star"></i>';
    var rc = (p.review_count && p.review_count > 0) ? p.review_count : Math.floor(Math.random() * 235) + 12;
    var imgHtml = p.image_url ? '<img src="' + p.image_url + '" alt="' + p.name + '" loading="lazy">' : '<div style="font-size:40px;display:flex;align-items:center;justify-content:center;height:100%">' + (p.image_icon || CONFIG.PRODUCT_DEFAULT_ICON) + '</div>';
    var priceHtml = '<div class="product-price">₦' + (p.price ? p.price.toLocaleString() : '0') + '</div>';
    if (p.discount_percent > 0) { var sp = Math.round(p.price * (1 - p.discount_percent / 100)); priceHtml = '<div class="product-price"><span style="text-decoration:line-through;color:var(--text-muted);font-size:14px">₦' + p.price.toLocaleString() + '</span> ₦' + sp.toLocaleString() + ' <span style="background:#e74c3c;color:#fff;padding:2px 6px;border-radius:4px;font-size:10px">-' + p.discount_percent + '%</span></div>'; }
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
    var p = allProducts.find(function(x) { return x.id == id; }); if (!p) return;
    currentDetailProduct = p;
    var imgs = []; try { imgs = JSON.parse(p.image_urls || '[]'); } catch(e) {} if (p.image_url) imgs.unshift(p.image_url);
    currentDetailImages = imgs; currentDetailIndex = 0;
    var mainImg = imgs.length ? imgs[0] : '';
    var arrowNav = '';
    if (imgs.length > 1) { arrowNav = '<div class="detail-arrow-nav"><button class="detail-arrow detail-prev" onclick="navigateDetailImage(-1)"><i class="fas fa-chevron-left"></i></button><button class="detail-arrow detail-next" onclick="navigateDetailImage(1)"><i class="fas fa-chevron-right"></i></button></div><div class="detail-dots">' + imgs.map(function(_, idx) { return '<span class="detail-dot' + (idx === 0 ? ' active' : '') + '" onclick="jumpToDetailImage(' + idx + ')"></span>'; }).join('') + '</div>'; }
    var priceHtml = '₦' + p.price.toLocaleString();
    if (p.discount_percent > 0) { var sp = Math.round(p.price * (1 - p.discount_percent / 100)); priceHtml = '<span style="text-decoration:line-through;color:var(--text-muted)">₦' + p.price.toLocaleString() + '</span> <span style="color:var(--accent)">₦' + sp.toLocaleString() + '</span> <span style="background:#e74c3c;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px">-' + p.discount_percent + '%</span>'; }
    document.getElementById('detail-back-label').textContent = detailSource === 'search' ? 'Back to Search' : 'Back to Shop';
    document.getElementById('product-share-container').innerHTML = '<button class="btn-secondary btn-sm" onclick="shareProduct(\'' + p.id + '\')"><i class="fas fa-share-alt"></i> Share</button>';
    document.getElementById('product-detail-container').innerHTML = '<div class="product-detail-container"><div class="product-detail-image"><div class="detail-image-wrapper"><img id="detail-main-img" src="' + (mainImg || 'https://placehold.co/400x400/e6d5c0/8b5a2b?text=' + encodeURIComponent(p.name || '')) + '" alt="' + p.name + '">' + arrowNav + '</div></div><div class="product-detail-info"><h1>' + p.name + '</h1><div class="product-detail-price">' + priceHtml + '</div><p>⭐ ' + (p.rating || CONFIG.PRODUCT_DEFAULT_RATING) + ' (' + (p.review_count || 0) + ' reviews)</p><p><i class="fas fa-map-marker-alt"></i> ' + (p.location || CONFIG.PRODUCT_DEFAULT_LOCATION) + '</p><p><i class="fas fa-store"></i> ' + (p.vendor || CONFIG.PRODUCT_DEFAULT_VENDOR) + '</p><p>' + (p.description || '') + '</p><button class="btn-primary" onclick="buyNow(\'' + p.id + '\')"><i class="fab fa-whatsapp"></i> Buy Now via WhatsApp</button><button class="btn-secondary" style="margin-top:12px" onclick="navigateTo(\'' + detailSource + '\')">← Back</button></div></div>';
    var related = allProducts.filter(function(r) { return r.id != p.id && r.category_id == p.category_id; });
    related = related.sort(function() { return 0.5 - Math.random(); }).slice(0, CONFIG.UI_RELATED_PRODUCTS_COUNT);
    document.getElementById('related-products-scroll').innerHTML = related.map(productCardHTML).join('');
    document.getElementById('related-products-section').style.display = 'block';
    pushToHistory('product-detail'); showPage('product-detail');
}
function navigateDetailImage(d) {
    if (!currentDetailImages.length) return;
    currentDetailIndex = (currentDetailIndex + d + currentDetailImages.length) % currentDetailImages.length;
    document.getElementById('detail-main-img').src = currentDetailImages[currentDetailIndex];
    document.querySelectorAll('.detail-dot').forEach(function(dot, i) { dot.classList.toggle('active', i === currentDetailIndex); });
}
function jumpToDetailImage(i) {
    currentDetailIndex = i; document.getElementById('detail-main-img').src = currentDetailImages[i];
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
    if (!email || !password) { toast.innerHTML = '<div class="toast-local error">Enter email and password</div>'; return; }
    setBtnLoading(btn, 'Logging in...');
    if (CONFIG.ADMIN_CEO_EMAILS.indexOf(email) !== -1) {
        var auth = await supabase.auth.signInWithPassword({ email: email, password: password });
        if (auth.error) { resetBtn(btn, 'Log In'); toast.innerHTML = '<div class="toast-local error">Wrong password</div>'; return; }
        isAdminLoggedIn = true; currentUserEmail = email; currentUserRole = 'Owner'; currentUserIsCEO = true;
        saveSession(); resetInactivityTimer(); resetBtn(btn, 'Log In'); clearLoginFields();
        toast.innerHTML = '<div class="toast-local success">Welcome back! 👑</div>';
        setTimeout(function() { navigateTo('admin-dashboard'); renderAdminPanels(); }, 400); return;
    }
    var admins = await supabase.from('admins').select('*').eq('email', email);
    if (!admins.data || admins.data.length === 0) { resetBtn(btn, 'Log In'); toast.innerHTML = '<div class="toast-local error">No account found. Apply for administratorship.</div>'; return; }
    var admin = admins.data[0];
    if (admin.status === 'frozen') { resetBtn(btn, 'Log In'); toast.innerHTML = '<div class="toast-local error">Your account has been paused. Contact Abihani Express.</div>'; return; }
    if (admin.status === 'pending_password') { resetBtn(btn, 'Log In'); toast.innerHTML = '<div class="toast-local info">Approved! Create your account below.</div>'; return; }
    if (admin.expiry_date && new Date(admin.expiry_date) < new Date()) { resetBtn(btn, 'Log In'); toast.innerHTML = '<div class="toast-local error">Administratorship expired. Contact CEO to renew.</div>'; return; }
    if (admin.password_hash !== password) { resetBtn(btn, 'Log In'); toast.innerHTML = '<div class="toast-local error">Wrong password</div>'; return; }
    isAdminLoggedIn = true; currentUserEmail = email; currentUserRole = 'admin'; currentUserIsCEO = false;
    saveSession(); resetInactivityTimer(); resetBtn(btn, 'Log In'); clearLoginFields();
    checkUnreadMessages(email);
    if (admin.expiry_date) { var ed = new Date(admin.expiry_date); var wd = new Date(ed); wd.setMonth(wd.getMonth() - CONFIG.ADMIN_EXPIRY_WARNING_MONTHS); if (new Date() >= wd && new Date() < ed) showExpiryWarning(ed); }
    toast.innerHTML = '<div class="toast-local success">Welcome! Your store is ready. 🏪</div>';
    setTimeout(function() { navigateTo('admin-dashboard'); renderAdminPanels(); }, 400);
}
function clearLoginFields() { document.getElementById('admin-email').value = ''; document.getElementById('admin-password').value = ''; }
function logoutAdmin() {
    if (currentUserIsCEO) supabase.auth.signOut();
    isAdminLoggedIn = false; currentUserEmail = ''; currentUserRole = ''; currentUserIsCEO = false; viewingAdminEmail = null;
    localStorage.removeItem('abihani_session');
    clearLoginFields(); showToast('Logged out 👋', 'info'); navigateTo('home');
}
function setBtnLoading(btn, text) { btn.innerHTML = '<span class="spinner"></span> ' + text; btn.disabled = true; btn.classList.add('btn-loading'); }
function resetBtn(btn, text) { btn.innerHTML = text; btn.disabled = false; btn.classList.remove('btn-loading'); }

// ============ CREATE ACCOUNT ============
function showCreateAccountModal() {
    var html = '<h3>' + CONFIG.CREATE_ACCOUNT_TITLE + '</h3><p>' + CONFIG.CREATE_ACCOUNT_SUBTITLE + '</p><input id="create-email" class="admin-input" type="email" placeholder="' + CONFIG.CREATE_ACCOUNT_EMAIL_LABEL + '" autocomplete="email"><input id="create-password" class="admin-input" type="password" placeholder="' + CONFIG.CREATE_ACCOUNT_PASSWORD_LABEL + '" autocomplete="new-password"><input id="create-password-confirm" class="admin-input" type="password" placeholder="' + CONFIG.CREATE_ACCOUNT_CONFIRM_LABEL + '" autocomplete="new-password"><p id="create-message" style="font-size:12px;margin-top:8px"></p><button class="btn-primary" style="width:100%;margin-top:12px" onclick="createAdminAccount()">' + CONFIG.CREATE_ACCOUNT_BTN + '</button><button class="btn-secondary btn-sm" style="margin-top:8px" onclick="closeAdminModal()">Close</button>';
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
        var html = '<h3>' + CONFIG.FORGOT_PASSWORD_TITLE + '</h3><p>' + CONFIG.FORGOT_PASSWORD_SUBTITLE_CEO + '</p><input id="forgot-email" class="admin-input" type="email" placeholder="' + CONFIG.FORGOT_PASSWORD_PLACEHOLDER + '" autocomplete="email"><p id="forgot-message" style="font-size:12px;margin-top:8px"></p><button class="btn-primary" style="width:100%;margin-top:12px" onclick="submitForgotPassword()">' + CONFIG.FORGOT_PASSWORD_SEND_BTN + '</button><button class="btn-secondary btn-sm" style="margin-top:8px" onclick="closeAdminModal()">' + CONFIG.FORGOT_PASSWORD_CLOSE + '</button>';
        openAdminModal(html);
    } else {
        var waMsg = encodeURIComponent(CONFIG.FORGOT_PASSWORD_WHATSAPP_MSG + document.getElementById('admin-email').value.trim());
        var html = '<h3>' + CONFIG.FORGOT_PASSWORD_TITLE + '</h3><p>' + CONFIG.FORGOT_PASSWORD_SUBTITLE_ADMIN + '</p><a href="https://wa.me/' + CONFIG.CEO_WHATSAPP.replace(/[^0-9]/g, '') + '?text=' + waMsg + '" target="_blank" class="btn-primary" style="width:100%;margin-top:12px;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px"><i class="fab fa-whatsapp"></i> Contact CEO</a><button class="btn-secondary btn-sm" style="margin-top:8px;width:100%" onclick="closeAdminModal()">' + CONFIG.FORGOT_PASSWORD_CLOSE + '</button>';
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

// ============ APPLY FOR ADMINISTRATORSHIP ============
function showAdminApplicationForm() {
    var featuresHtml = CONFIG.ADMIN_APP_FEATURES.map(function(f) { return '<li><i class="fas fa-check-circle" style="color:#27ae60"></i> ' + f + '</li>'; }).join('');
    var expiryDate = new Date(); expiryDate.setMonth(expiryDate.getMonth() + CONFIG.ADMIN_DURATION_MONTHS);
    var expiryStr = expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ', 9:00 am WAT';
    openAdminModal(
        '<h3 style="text-align:center;color:var(--accent)">' + CONFIG.ADMIN_APP_HEADING + '</h3>' +
        '<p style="text-align:center;color:var(--text-secondary);margin-bottom:16px">' + CONFIG.ADMIN_APP_SUBHEADING + '</p>' +
        '<div style="background:var(--bg-secondary);border-radius:12px;padding:12px;margin-bottom:12px"><h4 style="margin-bottom:8px">✨ Administrator Benefits</h4><ul style="list-style:none;padding:0">' + featuresHtml + '</ul></div>' +
        '<div style="background:#fef9f0;border:1px solid var(--accent);border-radius:12px;padding:12px;margin-bottom:12px"><p style="font-weight:700;color:var(--accent)">💰 ' + CONFIG.APP_FORM_PRICE_LABEL + ': ' + CONFIG.ADMIN_PRICE + '/' + CONFIG.APP_FORM_DURATION_LABEL + '</p><p style="font-size:12px;color:var(--text-secondary)">⏰ ' + CONFIG.APP_FORM_EXPIRY_LABEL + ': <strong>' + expiryStr + '</strong></p><p style="font-size:12px;color:var(--text-secondary);margin-top:8px"><strong>📞 ' + CONFIG.APP_FORM_PAYMENT_DETAILS_LABEL + ':</strong><br>' + CONFIG.ADMIN_PAYMENT_INFO + '</p></div>' +
        '<hr style="margin:12px 0">' +
        '<input id="app-name" class="admin-input" placeholder="' + CONFIG.APP_FORM_NAME_LABEL + '" autocomplete="name">' +
        '<input id="app-business" class="admin-input" placeholder="' + CONFIG.APP_FORM_BUSINESS_LABEL + '" autocomplete="organization">' +
        '<input id="app-email" class="admin-input" type="email" placeholder="' + CONFIG.APP_FORM_EMAIL_LABEL + '" autocomplete="email">' +
        '<input id="app-whatsapp" class="admin-input" type="tel" placeholder="' + CONFIG.APP_FORM_WHATSAPP_LABEL + '" autocomplete="tel">' +
        '<button class="btn-primary" style="width:100%;margin-top:12px" onclick="submitAdminApplication()">📤 ' + CONFIG.APP_FORM_SUBMIT_BUTTON + '</button>'
    );
}
async function submitAdminApplication() {
    var name = document.getElementById('app-name').value.trim(); var business = document.getElementById('app-business').value.trim();
    var email = document.getElementById('app-email').value.trim(); var whatsapp = document.getElementById('app-whatsapp').value.trim();
    if (!name || !business || !email || !whatsapp) { showToast('All fields required', 'error'); return; }
    if (CONFIG.ADMIN_CEO_EMAILS.indexOf(email) !== -1) { showToast('This email belongs to the CEO', 'error'); return; }
    var existingAdmin = await supabase.from('admins').select('id').eq('email', email);
    if (existingAdmin.data && existingAdmin.data.length > 0) { showToast('An account with this email already exists', 'error'); return; }
    var existingApp = await supabase.from('admin_applications').select('*').eq('email', email);
    if (existingApp.data && existingApp.data.length > 0) {
        if (existingApp.data[0].status === 'pending') { showToast('You already applied. Please wait for review.', 'info'); return; }
        if (existingApp.data[0].status === 'rejected') { await supabase.from('admin_applications').delete().eq('email', email); }
    }
    var expiryDate = new Date(); expiryDate.setMonth(expiryDate.getMonth() + CONFIG.ADMIN_DURATION_MONTHS);
    await supabase.from('admin_applications').insert({ name: name, business_name: business, email: email, whatsapp: whatsapp, password_hash: '', status: 'pending', expiry_date: expiryDate.toISOString() });
    sendEmail(CEO_EMAIL, '📋 New Administratorship Request from ' + name, '<p><strong>Name:</strong> ' + name + '</p><p><strong>Business:</strong> ' + business + '</p><p><strong>Email:</strong> ' + email + '</p><p><strong>WhatsApp:</strong> ' + whatsapp + '</p>');
    closeAdminModal();
    showToast('Request sent! Check your email for updates.', 'success');
}

// ============ UTILS ============
function filterByCategory(id) { currentFilterCategory = id; navigateTo('shop'); var pills = document.querySelectorAll('#shop-categories-filter .category-pill'); pills.forEach(function(p) { p.classList.remove('active'); }); renderAllProducts(); }
function filterAllProducts() { currentFilterCategory = null; navigateTo('shop'); var pills = document.querySelectorAll('#shop-categories-filter .category-pill'); pills.forEach(function(p) { p.classList.remove('active'); }); if (pills[0]) pills[0].classList.add('active'); renderAllProducts(); }
function scrollToBooks() { navigateTo('about'); setTimeout(function() { var b = document.querySelector('#books-container'); if (b) b.scrollIntoView({ behavior: 'smooth' }); }, 200); }
function toggleTheme() { document.body.classList.toggle('dark-mode'); localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light'); }
if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
function closeAnnouncement() { document.getElementById('announcement-bar').classList.add('closed'); }
function openAdminModal(html) { var content = document.getElementById('admin-form-modal-content'); content.innerHTML = '<span class="custom-order-close" onclick="closeAdminModal()">&times;</span>' + html; document.getElementById('admin-form-modal').style.display = 'flex'; }
function closeAdminModal() { document.getElementById('admin-form-modal').style.display = 'none'; }
function shareProduct(id) { var url = window.location.origin + '/product-detail?id=' + id; navigator.clipboard.writeText(url).then(function() { showToast('Link copied! 📋', 'success'); }); }

function updateCategoriesHome() { var c = document.getElementById('categories-home'); if (!c) return; var cats = allCategories.length ? allCategories : []; c.innerHTML = cats.length ? cats.map(function(cat) { return '<div class="category-pill" onclick="filterByCategory(\'' + cat.id + '\')">' + (cat.emoji || '') + ' ' + cat.name + '</div>'; }).join('') : '<div class="empty-state"><i class="fas fa-folder-open"></i><p>' + CONFIG.EMPTY_CATEGORIES + '</p></div>'; }
function updateShopCategories() { var c = document.getElementById('shop-categories-filter'); if (!c) return; c.innerHTML = '<div class="category-pill active" onclick="filterAllProducts()">All</div>' + allCategories.map(function(cat) { return '<div class="category-pill" onclick="filterByCategory(\'' + cat.id + '\')">' + (cat.emoji || '') + ' ' + cat.name + '</div>'; }).join(''); }

function buyNow(id) {
    var p = allProducts.find(function(x) { return x.id == id; }); if (!p) return;
    if (p.is_mock) { showToast('This is a mock product for display', 'info'); return; }
    var whatsapp = p.owner_whatsapp || CONFIG.WHATSAPP_NUMBER;
    window.open('https://wa.me/' + whatsapp.replace(/[^0-9]/g, '') + '?text=Hello! I want: ' + encodeURIComponent(p.name) + ' (₦' + p.price + ')', '_blank');
}
function showExpiryWarning(expiryDate) { showToast('Your partnership expires on ' + expiryDate.toLocaleDateString() + '. Contact CEO to renew.', 'info'); }
async function checkUnreadMessages(email) {
    var msgs = await supabase.from('messages').select('*').eq('to_admin_email', email).eq('seen', false);
    if (msgs.data && msgs.data.length > 0) { showToast('📬 You have ' + msgs.data.length + ' unread message(s)', 'info'); }
}

// ============ MAINTENANCE MODE ============
async function checkMaintenanceMode() {
    if (!maintenanceModeActive) return;
    var bp = CONFIG.MAINTENANCE_MODE_BYPASS_PATH || '/admin';
    if (window.location.pathname === bp) return;
    var ms = await supabase.from('site_settings').select('maintenance_mode').eq('id', 1).single();
    if (ms.data && ms.data.maintenance_mode === true) showMaintenanceScreen();
}
function showMaintenanceScreen() {
    document.body.innerHTML = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(135deg,#3d2a18,#2c1f10,#1a1008,#0d0804);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;font-family:Inter,sans-serif"><div style="text-align:center;max-width:500px"><img src="' + CONFIG.LOGO_URL + '" style="width:100px;height:100px;border-radius:50%;margin-bottom:20px;border:2px solid rgba(184,124,79,0.4)"><h1 style="font-family:Playfair Display,serif;color:#d49b6a;font-size:28px;margin-bottom:12px">' + CONFIG.MAINTENANCE_MODE_TITLE + '</h1><p style="color:#cbbcaa;font-size:14px;line-height:1.7;margin-bottom:24px">' + CONFIG.MAINTENANCE_MODE_MESSAGE + '</p><a href="' + CONFIG.MAINTENANCE_MODE_BYPASS_PATH + '" style="color:rgba(184,124,79,0.4);font-size:10px;text-decoration:none">' + CONFIG.MAINTENANCE_MODE_ADMIN_LINK_TEXT + '</a></div></div>';
    document.body.style.overflow = 'hidden';
}
async function toggleMaintenanceMode(enabled) {
    maintenanceModeActive = enabled;
    await supabase.from('site_settings').update({ maintenance_mode: enabled }).eq('id', 1);
    showToast(enabled ? 'Maintenance mode ON' : 'Maintenance mode OFF', 'info');
    if (isAdminLoggedIn) renderAdminPanels();
}

// ============ EXPOSE PUBLIC FUNCTIONS ============
window.navigateTo = navigateTo; window.goBackSmart = goBackSmart; window.showPage = showPage;
window.toggleTheme = toggleTheme; window.showProductDetail = showProductDetail;
window.buyNow = buyNow; window.searchProducts = searchProducts;
window.filterByCategory = filterByCategory; window.filterAllProducts = filterAllProducts;
window.adminLogin = adminLogin; window.logoutAdmin = logoutAdmin;
window.showCreateAccountModal = showCreateAccountModal; window.createAdminAccount = createAdminAccount;
window.forgotPassword = forgotPassword; window.submitForgotPassword = submitForgotPassword;
window.showAdminApplicationForm = showAdminApplicationForm; window.submitAdminApplication = submitAdminApplication;
window.toggleMockData = toggleMockData; window.generateMockCount = generateMockCount;
window.setMockFeaturePercent = setMockFeaturePercent; window.randomizeMockData = randomizeMockData;
window.toggleMaintenanceMode = toggleMaintenanceMode;
window.navigateDetailImage = navigateDetailImage; window.jumpToDetailImage = jumpToDetailImage;
window.shareProduct = shareProduct;
window.scrollToBooks = scrollToBooks; window.closeAnnouncement = closeAnnouncement;
window.openAdminModal = openAdminModal; window.closeAdminModal = closeAdminModal;
window.goToSlide = goToSlide;
window.showHaniPopup = showHaniPopup; window.closeHaniPopup = closeHaniPopup;
window.toggleHaniChat = toggleHaniChat; window.showPWABanner = showPWABanner;
window.closePWAInstall = closePWAInstall; window.installPWA = installPWA;
window.toggleHaniVisibility = toggleHaniVisibility;
// ============ ADMIN DASHBOARD ============
async function renderAdminPanels() {
    await loadDynamicData();
    var isCEO = currentUserIsCEO;
    var ownerFilter = viewingAdminEmail || currentUserEmail;
    var container = document.getElementById('admin-dashboard-content');
    if (!container) return;

    var filteredCategories = allCategories.filter(function(c) { return c.owner_email === ownerFilter && !c.is_mock; });
    var filteredSubcategories = allSubcategories.filter(function(s) { return s.owner_email === ownerFilter && !s.is_mock; });
    var filteredProducts = allProducts.filter(function(p) { return p.owner_email === ownerFilter && !p.is_mock; });
    if (isCEO && !viewingAdminEmail) { filteredCategories = allCategories.filter(function(c){return !c.is_mock;}); filteredSubcategories = allSubcategories.filter(function(s){return !s.is_mock;}); filteredProducts = allProducts.filter(function(p){return !p.is_mock;}); }

    var html = '';
    var allPartners = [];
    try { var ap = await supabase.from('admins').select('*').neq('role','Owner'); allPartners = ap.data || []; } catch(e) {}

    // Viewing partner banner (CEO only)
    if (isCEO && viewingAdminEmail) {
        var viewedAdmin = await supabase.from('admins').select('*').eq('email', viewingAdminEmail).single();
        var ad = viewedAdmin.data || {};
        var isExpired = ad.expiry_date && new Date(ad.expiry_date) < new Date();
        var isFrozen = ad.status === 'frozen';
        var statusLabel = isFrozen ? 'FROZEN' : (isExpired ? 'EXPIRED' : 'Active');
        var statusColor = isFrozen ? '#2980b9' : (isExpired ? '#e74c3c' : '#27ae60');
        var statusBg = isFrozen ? '#e8f0fe' : (isExpired ? '#fde8e8' : '#e8f8e8');
        html += '<div class="business-info-card"><h3>🏪 ' + (ad.business_name || viewingAdminEmail) + '</h3><div class="info-grid"><span>Owner:</span><strong>' + (ad.name || 'N/A') + '</strong><span>Email:</span><strong>' + (ad.email || 'N/A') + '</strong><span>WhatsApp:</span><strong>' + (ad.whatsapp || 'N/A') + '</strong><span>Expires:</span><strong>' + (ad.expiry_date ? new Date(ad.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A') + '</strong></div><span style="display:inline-block;padding:3px 10px;border-radius:10px;font-size:10px;font-weight:700;background:' + statusBg + ';color:' + statusColor + '">' + statusLabel + '</span></div>';
        html += '<div class="admin-actions-row">';
        if (!isFrozen) { html += '<button class="btn-blue btn-sm" onclick="freezeAdmin(\'' + viewingAdminEmail + '\')">❄️ Freeze</button>'; }
        else { html += '<button class="btn-green btn-sm" onclick="unfreezeAdmin(\'' + viewingAdminEmail + '\')">🌤️ Unfreeze</button>'; }
        html += '<button class="btn-danger btn-sm" onclick="deleteAdminCompletely(\'' + viewingAdminEmail + '\',\'' + (ad.business_name || viewingAdminEmail).replace(/'/g,"\\'") + '\')">🗑️ Delete Store</button></div>';
    }

    // Welcome card (only for own dashboard)
    if (!viewingAdminEmail) {
        var expiryDate = '';
        if (!isCEO) { try { var sa = await supabase.from('admins').select('expiry_date').eq('email', currentUserEmail).single(); if (sa.data && sa.data.expiry_date) expiryDate = 'Expires: ' + new Date(sa.data.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); } catch(e) {} }
        var roleLabel = isCEO ? CONFIG.DASHBOARD_WELCOME_CEO_ROLE : CONFIG.DASHBOARD_WELCOME_ADMIN_ROLE;
        var roleClass = isCEO ? 'ceo' : 'admin';
        html += '<div class="welcome-card"><h3>Welcome, ' + (currentUserEmail.split('@')[0] || 'Admin') + '</h3><span class="role-badge ' + roleClass + '">' + roleLabel + '</span>' + (expiryDate ? '<p class="welcome-expiry">' + expiryDate + '</p>' : '') + '</div>';
    }

    // CEO: Requests & Partners
    if (isCEO && !viewingAdminEmail) {
        try { var appCount = await supabase.from('admin_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'); var pendingCount = appCount.count || 0; var badgeHtml = pendingCount > 0 ? '<span class="badge">' + pendingCount + '</span>' : ''; html += '<div class="admin-section-card"><h4 onclick="renderAdminRequests()" style="cursor:pointer">' + CONFIG.ADMIN_REQUESTS_SECTION_NAME + badgeHtml + ' <i class="fas fa-arrow-right" style="font-size:14px;color:var(--text-muted)"></i></h4></div>'; } catch(e) {}
        html += '<div class="admin-section-card"><h4 onclick="renderPartners()" style="cursor:pointer">' + CONFIG.ADMIN_PARTNERS_SECTION_NAME + ' <i class="fas fa-arrow-right" style="font-size:14px;color:var(--text-muted)"></i></h4></div>';
    }

    // Settings (only own dashboard)
    if (!viewingAdminEmail) {
        html += '<div class="admin-card" style="cursor:pointer" onclick="renderSettings()"><h4 style="color:var(--accent)"><i class="fas fa-cog"></i> ' + CONFIG.SETTINGS_TITLE + '</h4><p style="font-size:11px;color:var(--text-muted)">Manage your details</p></div>';
        if (isCEO) {
            html += '<div class="admin-card" style="margin-top:12px"><h4 style="color:var(--accent);display:flex;align-items:center;justify-content:space-between">🌸 Hani <label class="mock-toggle"><input type="checkbox" id="hani-toggle-checkbox" checked onchange="toggleHaniVisibility(this.checked)"><span class="mock-toggle-slider"></span></label></h4></div>';
        }
    }

    html += '<div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap"><button class="btn-primary" onclick="showAddProductForm()"><i class="fas fa-plus"></i> ' + CONFIG.UI_ADD_PRODUCT + '</button><button class="btn-secondary" onclick="showAddCategoryForm()"><i class="fas fa-plus"></i> ' + CONFIG.UI_ADD_CATEGORY + '</button></div>';
    html += '<div class="admin-card" style="cursor:pointer" onclick="renderAllProductsAdmin()"><h4>📦 All Products (' + filteredProducts.length + ')</h4><p style="font-size:11px;color:var(--text-muted)">Tap to view, edit or delete</p></div>';
    html += '<div class="admin-card" style="cursor:pointer" onclick="renderCategoriesListAdmin()"><h4>📁 Categories (' + filteredCategories.length + ')</h4><p style="font-size:11px;color:var(--text-muted)">Tap to browse categories</p></div>';

    if (!viewingAdminEmail) {
        html += '<div class="admin-card" style="cursor:pointer;margin-top:12px" onclick="renderEmailCenter()"><h4 style="color:var(--accent)"><i class="fas fa-envelope"></i> ' + CONFIG.UI_EMAIL_CENTER_TITLE + '</h4><p style="font-size:11px;color:var(--text-muted)">' + (isCEO ? 'Send professional emails' : 'Send message to CEO or partners') + '</p></div>';
    }

    if (isCEO && !viewingAdminEmail) {
        html += '<div class="admin-card" style="margin-top:16px"><h4>' + CONFIG.ADMIN_ANNOUNCEMENT_SECTION + '</h4>';
        html += '<label style="font-size:13px;font-weight:600">📢 Announcement</label><input id="admin-announcement" class="admin-input" value="' + (announcementText || '') + '" placeholder="Announcement text"><button class="btn-primary btn-sm" style="margin-top:8px" onclick="saveAnnouncement()">Save Announcement</button>';
        html += '<hr style="margin:16px 0;border-color:var(--border)"><label style="font-size:13px;font-weight:600">🔧 Maintenance Mode</label><div style="display:flex;align-items:center;gap:12px;margin:8px 0"><span>OFF</span><label class="mock-toggle"><input type="checkbox" id="maintenance-toggle-checkbox" ' + (maintenanceModeActive ? 'checked' : '') + ' onchange="toggleMaintenanceMode(this.checked)"><span class="mock-toggle-slider"></span></label><span>ON</span></div></div>';
        html += '<div class="admin-card" style="margin-top:20px"><h4>' + CONFIG.UI_MOCK_DATA_TITLE + '</h4>';
        html += '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px"><span>' + CONFIG.UI_MOCK_DATA_OFF + '</span><label class="mock-toggle"><input type="checkbox" id="mock-toggle-checkbox" ' + (mockDataActive ? 'checked' : '') + ' onchange="toggleMockData(this.checked)"><span class="mock-toggle-slider"></span></label><span>' + CONFIG.UI_MOCK_DATA_ON + '</span></div>';
        if (mockDataActive) {
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px"><label style="font-size:13px">' + CONFIG.UI_MOCK_DATA_COUNT_LABEL + ' <input type="number" id="mock-data-count" value="' + (CONFIG.MOCK_DATA_PRODUCT_COUNT || 20) + '" min="1" max="500" class="admin-input" style="width:70px;display:inline-block"></label><button class="btn-primary btn-sm" onclick="generateMockCount()">Generate</button></div>';
            html += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><label style="font-size:13px">Feature %: <input type="number" id="mock-feature-percent" value="' + CONFIG.MOCK_DATA_FEATURE_PERCENT + '" min="0" max="100" class="admin-input" style="width:60px;display:inline-block">%</label><button class="btn-secondary btn-sm" onclick="setMockFeaturePercent()">Set Featured</button><button class="btn-secondary btn-sm" onclick="randomizeMockData()">Randomize</button></div>';
            html += '<p style="font-size:11px;color:var(--text-muted);margin-top:8px">' + CONFIG.UI_MOCK_DATA_ACTIVE + ' <strong>' + mockProducts.length + '</strong> ' + CONFIG.UI_MOCK_DATA_PRODUCTS + '</p>';
        }
        html += '</div>';
    }

    container.innerHTML = html;
}

// ============ ADMIN REQUESTS ============
function renderAdminRequests() {
    var container = document.getElementById('admin-dashboard-content');
    var html = '<div class="flex-between" style="margin-bottom:16px"><button class="btn-outline btn-sm" onclick="renderAdminPanels()">← Back</button><h3>📋 Requests</h3><span></span></div>';
    html += '<div class="admin-tabs"><button class="admin-tab active" onclick="loadRequestTab(\'pending\',this)">Pending</button><button class="admin-tab" onclick="loadRequestTab(\'approved\',this)">Approved</button><button class="admin-tab" onclick="loadRequestTab(\'rejected\',this)">Rejected</button></div>';
    html += '<div id="request-tab-content"></div>';
    container.innerHTML = html;
    loadRequestTab('pending', document.querySelector('.admin-tab'));
}
async function loadRequestTab(status, btn) {
    var tabs = document.querySelectorAll('.admin-tab'); for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
    if (btn) btn.classList.add('active');
    var container = document.getElementById('request-tab-content');
    container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:20px">Loading...</p>';
    var apps = await supabase.from('admin_applications').select('*').eq('status', status).order('created_at', { ascending: false });
    var data = apps.data || [];
    if (data.length === 0) { container.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:30px">Nothing here</p>'; return; }
    var html = '';
    for (var i = 0; i < data.length; i++) {
        var a = data[i];
        html += '<div class="card"><div class="flex-between"><div><strong>' + a.name + '</strong><br><small>' + a.email + '</small><br><small>' + a.business_name + ' | ' + a.whatsapp + '</small><br><small style="color:var(--text-muted)">' + new Date(a.created_at).toLocaleDateString() + '</small></div>';
        if (status === 'pending') { html += '<div class="flex"><button class="btn-green btn-sm" onclick="approveApp(\'' + a.id + '\')">✅ Approve</button><button class="btn-danger btn-sm" onclick="rejectApp(\'' + a.id + '\')">❌ Reject</button></div>'; }
        if (status === 'rejected') { html += '<div><small style="color:#e74c3c">' + (a.reject_reason || 'No reason') + '</small><br><button class="btn-danger btn-sm" style="margin-top:4px" onclick="deleteRejectedApp(\'' + a.id + '\')">🗑️ Delete</button></div>'; }
        if (status === 'approved') { html += '<div><small style="color:#27ae60">Approved: ' + new Date(a.approved_at).toLocaleDateString() + '</small></div>'; }
        html += '</div></div>';
    }
    container.innerHTML = html;
}
async function approveApp(id) {
    var app = await supabase.from('admin_applications').select('*').eq('id', id).single(); if (!app.data) return;
    var d = app.data; var expiry = new Date(); expiry.setMonth(expiry.getMonth() + CONFIG.ADMIN_DURATION_MONTHS);
    await supabase.from('admin_applications').update({ status: 'approved', approved_at: new Date().toISOString(), expiry_date: expiry.toISOString() }).eq('id', id);
    await supabase.from('admins').insert({ email: d.email, password_hash: '', name: d.name, business_name: d.business_name, whatsapp: d.whatsapp, role: 'admin', status: 'pending_password', expiry_date: expiry.toISOString() });
    sendEmail(d.email, CONFIG.APPROVAL_EMAIL_SUBJECT, CONFIG.APPROVAL_EMAIL_BODY.replace(/{name}/g, d.name).replace(/{business}/g, d.business_name).replace(/{expiry}/g, expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })));
    sendEmail(CEO_EMAIL, 'New Admin Approved: ' + d.name, '<p>' + d.name + ' (' + d.business_name + ') approved.</p>');
    showToast('Approved! Email sent.', 'success'); loadRequestTab('pending', document.querySelector('.admin-tab'));
}
async function rejectApp(id) {
    var reason = prompt('Reason for rejection:', 'Due to unconfirmed payment'); if (!reason) return;
    var app = await supabase.from('admin_applications').select('*').eq('id', id).single(); if (!app.data) return;
    await supabase.from('admin_applications').update({ status: 'rejected', reject_reason: reason, rejected_at: new Date().toISOString() }).eq('id', id);
    sendEmail(app.data.email, CONFIG.REJECTION_EMAIL_SUBJECT, CONFIG.REJECTION_EMAIL_BODY.replace(/{name}/g, app.data.name).replace(/{business}/g, app.data.business_name).replace(/{reason}/g, reason));
    showToast('Rejected. Email sent.', 'info'); loadRequestTab('pending', document.querySelector('.admin-tab'));
}
async function deleteRejectedApp(id) {
    if (!confirm('Delete this rejected application? The person can re-apply after this.')) return;
    await supabase.from('admin_applications').delete().eq('id', id);
    showToast('Deleted!', 'success'); loadRequestTab('rejected', document.querySelector('.admin-tab'));
}

// ============ PARTNERS ============
async function renderPartners() {
    var container = document.getElementById('admin-dashboard-content');
    var partners = []; try { var ap = await supabase.from('admins').select('*').neq('role','Owner').order('created_at', { ascending: false }); partners = ap.data || []; } catch(e) {}
    var html = '<div class="flex-between" style="margin-bottom:16px"><button class="btn-outline btn-sm" onclick="renderAdminPanels()">← Back</button><h3>👥 Partners</h3><span></span></div>';
    if (partners.length === 0) { html += '<p style="text-align:center;color:var(--text-muted);padding:30px">No partners yet</p>'; }
    else {
        for (var i = 0; i < partners.length; i++) {
            var p = partners[i];
            var isExpired = p.expiry_date && new Date(p.expiry_date) < new Date();
            var isFrozen = p.status === 'frozen';
            var statusText = isFrozen ? 'FROZEN' : (isExpired ? 'EXPIRED' : 'Active');
            var statusColor = isFrozen ? '#2980b9' : (isExpired ? '#e74c3c' : '#27ae60');
            var statusBg = isFrozen ? '#e8f0fe' : (isExpired ? '#fde8e8' : '#e8f8e8');
            html += '<div class="card"><div class="flex-between" onclick="viewAdminDashboard(\'' + p.email + '\')" style="cursor:pointer"><div><strong>' + (p.business_name || p.email) + '</strong><br><small>' + p.email + ' | ' + (p.whatsapp || 'N/A') + '</small><br><span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;background:' + statusBg + ';color:' + statusColor + '">' + statusText + '</span></div><span style="font-size:20px;color:var(--accent)">›</span></div><div class="flex" style="margin-top:8px" onclick="event.stopPropagation()">';
            if (!isFrozen) { html += '<button class="btn-blue btn-sm" onclick="freezeAdmin(\'' + p.email + '\')">❄️ Freeze</button>'; }
            else { html += '<button class="btn-green btn-sm" onclick="unfreezeAdmin(\'' + p.email + '\')">🌤️ Unfreeze</button>'; }
            html += '<button class="btn-danger btn-sm" onclick="deleteAdminCompletely(\'' + p.email + '\',\'' + (p.business_name || p.email).replace(/'/g,"\\'") + '\')">🗑️ Delete Store</button></div></div>';
        }
    }
    container.innerHTML = html;
}
function viewAdminDashboard(email) { viewingAdminEmail = email; showPage('admin-dashboard'); renderAdminPanels(); }
async function freezeAdmin(email) {
    var reason = prompt('Reason for freezing (optional):', '');
    await supabase.from('admins').update({ status: 'frozen', frozen_reason: reason || 'Account frozen by CEO' }).eq('email', email);
    sendEmail(email, CONFIG.FREEZE_EMAIL_SUBJECT, CONFIG.FREEZE_EMAIL_BODY.replace(/{name}/g, email).replace(/{reason}/g, reason || 'Policy violation'));
    showToast('Account frozen. Email sent.', 'info');
    if (viewingAdminEmail) { renderAdminPanels(); } else { renderPartners(); }
}
async function unfreezeAdmin(email) {
    await supabase.from('admins').update({ status: 'active', frozen_reason: null }).eq('email', email);
    sendEmail(email, CONFIG.UNFREEZE_EMAIL_SUBJECT, CONFIG.UNFREEZE_EMAIL_BODY.replace(/{name}/g, email));
    showToast('Account unfrozen. Email sent.', 'success');
    if (viewingAdminEmail) { renderAdminPanels(); } else { renderPartners(); }
}
async function deleteAdminCompletely(email, businessName) {
    if (!confirm('Delete "' + businessName + '" and ALL their products? This is PERMANENT.')) return;
    await supabase.from('products').delete().eq('owner_email', email);
    await supabase.from('subcategories').delete().eq('owner_email', email);
    await supabase.from('categories').delete().eq('owner_email', email);
    await supabase.from('messages').delete().eq('to_admin_email', email);
    await supabase.from('admin_applications').delete().eq('email', email);
    await supabase.from('admins').delete().eq('email', email);
    sendEmail(email, 'Your Store Has Been Removed', '<p>Your store on Abihani Express has been removed.</p>');
    showToast('Store deleted. Email sent.', 'success');
    viewingAdminEmail = null; renderAdminPanels();
}

// ============ SETTINGS ============
function renderSettings() {
    var isCEO = currentUserIsCEO;
    var html = '<h3>⚙️ Settings</h3>';
    if (isCEO) {
        html += '<label>New Password</label><input id="set-new-pass" type="password" class="admin-input" placeholder="New Password"><label>Confirm Password</label><input id="set-confirm-pass" type="password" class="admin-input" placeholder="Confirm"><button class="btn-primary" style="width:100%" onclick="saveCEOSettings()">Save</button>';
    } else {
        html += '<label>Business Name</label><input id="set-business" class="admin-input" placeholder="Business Name"><label>WhatsApp Number</label><input id="set-whatsapp" class="admin-input" placeholder="WhatsApp Number"><label>New Password</label><input id="set-new-pass" type="password" class="admin-input" placeholder="New Password"><label>Confirm Password</label><input id="set-confirm-pass" type="password" class="admin-input" placeholder="Confirm"><label>Current Password (required)</label><input id="set-current-pass" type="password" class="admin-input" placeholder="Current Password"><button class="btn-primary" style="width:100%" onclick="saveAdminSettings()">Save Changes</button>';
    }
    html += '<div id="settings-status" class="status"></div>';
    openAdminModal(html);
    if (!isCEO) {
        supabase.from('admins').select('*').eq('email', currentUserEmail).single().then(function(r) { if (r.data) { document.getElementById('set-business').value = r.data.business_name || ''; document.getElementById('set-whatsapp').value = r.data.whatsapp || ''; } });
    }
}
async function saveAdminSettings() {
    var np = document.getElementById('set-new-pass').value; var cp = document.getElementById('set-confirm-pass').value; var cur = document.getElementById('set-current-pass').value;
    var s = document.getElementById('settings-status');
    if (!cur) { s.textContent = 'Current password required'; s.className = 'status error'; return; }
    if (np && np !== cp) { s.textContent = 'Passwords do not match'; s.className = 'status error'; return; }
    var admin = await supabase.from('admins').select('*').eq('email', currentUserEmail).single();
    if (!admin.data || admin.data.password_hash !== cur) { s.textContent = 'Wrong current password'; s.className = 'status error'; return; }
    var updates = { business_name: document.getElementById('set-business').value.trim(), whatsapp: document.getElementById('set-whatsapp').value.trim() };
    if (np) updates.password_hash = np;
    await supabase.from('admins').update(updates).eq('email', currentUserEmail);
    s.textContent = 'Saved!'; s.className = 'status success'; setTimeout(closeAdminModal, 1000);
}
async function saveCEOSettings() {
    var np = document.getElementById('set-new-pass').value; var cp = document.getElementById('set-confirm-pass').value;
    var s = document.getElementById('settings-status');
    if (!np) { s.textContent = 'Enter new password'; s.className = 'status error'; return; }
    if (np !== cp) { s.textContent = 'Passwords do not match'; s.className = 'status error'; return; }
    var r = await supabase.auth.updateUser({ password: np });
    if (r.error) { s.textContent = r.error.message; s.className = 'status error'; return; }
    s.textContent = 'Saved!'; s.className = 'status success'; setTimeout(closeAdminModal, 1000);
}
async function saveAnnouncement() {
    if (!currentUserIsCEO) return;
    var txt = document.getElementById('admin-announcement').value;
    await supabase.from('site_settings').update({ announcement_text: txt }).eq('id', 1);
    announcementText = txt;
    var atEl = document.getElementById('announcement-text'); if (atEl) atEl.textContent = txt;
    showToast('Announcement saved!', 'success');
}

// ============ ALL PRODUCTS (ADMIN) ============
function renderAllProductsAdmin() {
    var ownerFilter = viewingAdminEmail || currentUserEmail;
    var prods = allProducts.filter(function(p) { return currentUserIsCEO && !viewingAdminEmail ? !p.is_mock : (p.owner_email === ownerFilter && !p.is_mock); });
    var container = document.getElementById('admin-dashboard-content');
    var html = '<div class="flex-between" style="margin-bottom:16px"><button class="btn-outline btn-sm" onclick="renderAdminPanels()">← Back</button><h3>📦 All Products (' + prods.length + ')</h3><span></span></div>';
    if (prods.length === 0) { html += '<p style="text-align:center;color:var(--text-muted);padding:30px">No products yet</p>'; }
    else { for (var i = 0; i < prods.length; i++) { var p = prods[i]; html += '<div class="item-row" onclick="renderEditProduct(\'' + p.id + '\')"><span>' + (p.image_url ? '<img src="' + p.image_url + '" style="width:40px;height:40px;object-fit:cover;border-radius:6px;margin-right:8px;vertical-align:middle">' : '<span style="font-size:24px;margin-right:8px;vertical-align:middle">' + (p.image_icon || '📦') + '</span>') + '<strong>' + p.name + '</strong><br><small style="color:var(--accent)">₦' + (p.price || 0).toLocaleString() + '</small> ' + (p.featured ? '⭐' : '') + '</span><span style="font-size:20px;color:var(--accent)">›</span></div>'; } }
    container.innerHTML = html;
}

// ============ CATEGORIES LIST (ADMIN) ============
function renderCategoriesListAdmin() {
    var ownerFilter = viewingAdminEmail || currentUserEmail;
    var cats = allCategories.filter(function(c) { return currentUserIsCEO && !viewingAdminEmail ? !c.is_mock : (c.owner_email === ownerFilter && !c.is_mock); });
    var container = document.getElementById('admin-dashboard-content');
    var html = '<div class="flex-between" style="margin-bottom:16px"><button class="btn-outline btn-sm" onclick="renderAdminPanels()">← Back</button><h3>📁 Categories (' + cats.length + ')</h3><span></span></div>';
    if (cats.length === 0) { html += '<p style="text-align:center;color:var(--text-muted);padding:30px">No categories yet</p>'; }
    else {
        for (var i = 0; i < cats.length; i++) {
            var cat = cats[i]; var subs = allSubcategories.filter(function(s) { return s.category_id == cat.id; });
            html += '<div class="item-row" onclick="renderSubcategoriesAdmin(\'' + cat.id + '\')"><span><strong>' + (cat.emoji || '📁') + ' ' + cat.name + '</strong> <small style="color:var(--text-muted)">(' + subs.length + ' subs)</small></span><span onclick="event.stopPropagation()"><button class="btn-outline btn-sm" onclick="editCategory(\'' + cat.id + '\')">✏️</button> <button class="btn-danger btn-sm" onclick="deleteCategory(\'' + cat.id + '\')">🗑️</button>' + (currentUserIsCEO ? ' <button class="btn-outline btn-sm" onclick="moveCatUp(' + i + ')">⬆️</button> <button class="btn-outline btn-sm" onclick="moveCatDown(' + i + ')">⬇️</button>' : '') + '</span></div>';
        }
    }
    container.innerHTML = html;
}
function renderSubcategoriesAdmin(catId) {
    var cat = allCategories.find(function(c) { return c.id == catId; }); if (!cat) return;
    var subs = allSubcategories.filter(function(s) { return s.category_id == catId; });
    var container = document.getElementById('admin-dashboard-content');
    var html = '<div class="flex-between" style="margin-bottom:16px"><button class="btn-outline btn-sm" onclick="renderCategoriesListAdmin()">← Back</button><h3>' + (cat.emoji || '') + ' ' + cat.name + '</h3><span></span></div>';
    html += '<button class="btn-outline btn-sm" style="width:100%;margin-bottom:8px" onclick="renderAddSubcategory(\'' + catId + '\')">➕ Add Subcategory</button>';
    if (subs.length === 0) { html += '<p style="text-align:center;color:var(--text-muted);padding:20px">No subcategories</p>'; }
    else { for (var i = 0; i < subs.length; i++) { var sub = subs[i]; var prods = allProducts.filter(function(p) { return p.subcategory_id == sub.id; }); html += '<div class="item-row" onclick="renderSubProductsAdmin(\'' + sub.id + '\')"><span>📂 <strong>' + sub.name + '</strong> <small style="color:var(--text-muted)">(' + prods.length + ' products)</small></span><span onclick="event.stopPropagation()"><button class="btn-outline btn-sm" onclick="editSubcategory(\'' + sub.id + '\')">✏️</button> <button class="btn-danger btn-sm" onclick="deleteSubcategory(\'' + sub.id + '\')">🗑️</button></span></div>'; } }
    container.innerHTML = html;
}
function renderSubProductsAdmin(subId) {
    var sub = allSubcategories.find(function(s) { return s.id == subId; }); if (!sub) return;
    var prods = allProducts.filter(function(p) { return p.subcategory_id == subId; });
    var container = document.getElementById('admin-dashboard-content');
    var html = '<div class="flex-between" style="margin-bottom:16px"><button class="btn-outline btn-sm" onclick="renderSubcategoriesAdmin(\'' + sub.category_id + '\')">← Back</button><h3>📂 ' + sub.name + '</h3><span></span></div>';
    if (prods.length === 0) { html += '<p style="text-align:center;color:var(--text-muted);padding:20px">No products here</p>'; }
    else { for (var i = 0; i < prods.length; i++) { var p = prods[i]; html += '<div class="item-row" onclick="renderEditProduct(\'' + p.id + '\')"><span>' + (p.image_url ? '<img src="' + p.image_url + '" style="width:36px;height:36px;object-fit:cover;border-radius:4px;margin-right:8px;vertical-align:middle">' : '<span style="font-size:22px;margin-right:8px;vertical-align:middle">' + (p.image_icon || '📦') + '</span>') + '<strong>' + p.name + '</strong><br><small style="color:var(--accent)">₦' + (p.price || 0).toLocaleString() + '</small></span><span style="font-size:20px;color:var(--accent)">›</span></div>'; } }
    container.innerHTML = html;
}

// ============ ADD PRODUCT ============
function showAddProductForm() {
    var catOpts = allCategories.filter(function(c){return !c.is_mock;}).map(function(c){return '<option value="'+c.id+'">'+(c.emoji||'')+' '+c.name+'</option>';}).join('');
    var html = '<h3>➕ Add Product</h3>';
    html += '<label>Product Name *</label><input id="ap-name" class="admin-input" placeholder="Product Name">';
    html += '<label>Price (₦) *</label><input id="ap-price" class="admin-input" type="number" placeholder="Price">';
    html += '<label>Category</label><select id="ap-category" class="admin-input" onchange="updateAddSubcats()"><option value="">None</option>' + catOpts + '</select>';
    html += '<label>Subcategory</label><select id="ap-subcategory" class="admin-input"><option value="">None</option></select>';
    html += '<label>Description</label><textarea id="ap-desc" class="admin-input" rows="2"></textarea>';
    html += '<label>Rating</label><input id="ap-rating" class="admin-input" type="number" step="0.1" placeholder="4.5">';
    html += '<label>Review Count</label><input id="ap-reviews" class="admin-input" type="number" placeholder="Auto">';
    html += '<label>Stock Quantity</label><input id="ap-stock" class="admin-input" type="number" placeholder="10">';
    html += '<label>Discount %</label><input id="ap-discount" class="admin-input" type="number" placeholder="0">';
    html += '<label>Vendor</label><input id="ap-vendor" class="admin-input" placeholder="Vendor">';
    html += '<label>Location</label><input id="ap-location" class="admin-input" placeholder="Location">';
    html += '<label style="font-size:12px"><input type="checkbox" id="ap-featured"> Featured on homepage</label>';
    html += '<label>Main Image</label><input type="file" id="ap-main-image" accept="image/*" class="admin-input">';
    html += '<label>Side Images</label><div id="ap-side-container"><input type="file" accept="image/*" class="ap-side-picker" style="font-size:12px"></div>';
    html += '<button class="btn-outline btn-sm" onclick="addAddSidePicker()">+ Add Image</button>';
    html += '<button class="btn-primary" style="width:100%;margin-top:12px" onclick="saveNewProduct()">💾 Save Product</button>';
    openAdminModal(html);
    window.updateAddSubcats = function() { var catId = document.getElementById('ap-category').value; var sel = document.getElementById('ap-subcategory'); sel.innerHTML = '<option value="">None</option>'; allSubcategories.filter(function(s) { return s.category_id == catId; }).forEach(function(s) { sel.innerHTML += '<option value="' + s.id + '">' + s.name + '</option>'; }); };
}
function addAddSidePicker() { var c = document.getElementById('ap-side-container'); var d = document.createElement('div'); d.style.marginTop = '4px'; d.innerHTML = '<input type="file" accept="image/*" class="ap-side-picker" style="font-size:12px">'; c.appendChild(d); }
async function saveNewProduct() {
    var name = document.getElementById('ap-name').value.trim(); var price = parseInt(document.getElementById('ap-price').value);
    if (!name || !price) { showToast('Name and price required', 'error'); return; }
    var ownerEmail = viewingAdminEmail || currentUserEmail;
    var mainUrl = ''; var mf = document.getElementById('ap-main-image').files[0];
    if (mf) { var ext = mf.name.split('.').pop(); var fn = 'products/' + Date.now() + '_main.' + ext; var up = await supabase.storage.from('images').upload(fn, mf); if (!up.error) mainUrl = supabase.storage.from('images').getPublicUrl(fn).data.publicUrl; }
    var extraUrls = []; var pickers = document.querySelectorAll('.ap-side-picker');
    for (var i = 0; i < pickers.length; i++) { if (pickers[i].files && pickers[i].files[0]) { var f = pickers[i].files[0]; var eext = f.name.split('.').pop(); var efn = 'products/' + Date.now() + '_' + i + '_extra.' + eext; var eup = await supabase.storage.from('images').upload(efn, f); if (!eup.error) extraUrls.push(supabase.storage.from('images').getPublicUrl(efn).data.publicUrl); } }
    await supabase.from('products').insert({ name: name, price: price, category_id: document.getElementById('ap-category').value || null, subcategory_id: document.getElementById('ap-subcategory').value || null, description: document.getElementById('ap-desc').value.trim(), rating: parseFloat(document.getElementById('ap-rating').value) || 4.5, review_count: parseInt(document.getElementById('ap-reviews').value) || Math.floor(Math.random() * 235) + 12, stock_quantity: parseInt(document.getElementById('ap-stock').value) || 10, discount_percent: parseInt(document.getElementById('ap-discount').value) || 0, vendor: document.getElementById('ap-vendor').value.trim() || 'Abihani Express', location: document.getElementById('ap-location').value.trim() || 'Potiskum, Yobe State', featured: document.getElementById('ap-featured').checked, image_url: mainUrl, image_urls: JSON.stringify(extraUrls), image_icon: '📦', owner_email: ownerEmail, owner_whatsapp: '' });
    closeAdminModal(); showToast('Product added!', 'success'); renderAdminPanels();
}

// ============ EDIT PRODUCT ============
function renderEditProduct(id) {
    var p = allProducts.find(function(x) { return x.id == id; }); if (!p) return;
    var sideUrls = []; try { sideUrls = JSON.parse(p.image_urls || '[]'); } catch(e) {}
    var catOpts = allCategories.map(function(c) { return '<option value="' + c.id + '"' + (c.id == p.category_id ? ' selected' : '') + '>' + (c.emoji || '') + ' ' + c.name + '</option>'; }).join('');
    var html = '<h3>✏️ Edit Product</h3>';
    html += '<label>Product Name</label><input id="ep-name" class="admin-input" value="' + p.name + '">';
    html += '<label>Price (₦)</label><input id="ep-price" class="admin-input" type="number" value="' + p.price + '">';
    html += '<label>Category</label><select id="ep-category" class="admin-input" onchange="updateEditSubcats()">' + catOpts + '</select>';
    html += '<label>Subcategory</label><select id="ep-subcategory" class="admin-input"><option value="">None</option></select>';
    html += '<label>Description</label><textarea id="ep-desc" class="admin-input" rows="2">' + (p.description || '') + '</textarea>';
    html += '<label>Rating</label><input id="ep-rating" class="admin-input" type="number" step="0.1" value="' + (p.rating || 4.5) + '">';
    html += '<label>Review Count</label><input id="ep-reviews" class="admin-input" type="number" value="' + (p.review_count || 0) + '">';
    html += '<label>Stock Quantity</label><input id="ep-stock" class="admin-input" type="number" value="' + (p.stock_quantity || 10) + '">';
    html += '<label>Discount %</label><input id="ep-discount" class="admin-input" type="number" value="' + (p.discount_percent || 0) + '">';
    html += '<label>Vendor</label><input id="ep-vendor" class="admin-input" value="' + (p.vendor || '') + '">';
    html += '<label>Location</label><input id="ep-location" class="admin-input" value="' + (p.location || '') + '">';
    html += '<label style="font-size:12px"><input type="checkbox" id="ep-featured" ' + (p.featured ? 'checked' : '') + '> Featured</label>';
    if (p.image_url) { html += '<label>Current Image</label><div><img src="' + p.image_url + '" class="image-preview"><button class="btn-danger btn-sm" onclick="removeMainImage()">✕ Remove</button></div>'; }
    html += '<label>New Main Image</label><input type="file" id="ep-main-image" accept="image/*" class="admin-input"><input type="hidden" id="ep-image-removed" value="false">';
    html += '<label>Side Images</label><div id="side-images-container">';
    for (var i = 0; i < sideUrls.length; i++) { html += '<div data-index="' + i + '" style="display:flex;align-items:center;gap:8px;margin:4px 0"><img src="' + sideUrls[i] + '" class="image-preview"><button class="btn-danger btn-sm" onclick="removeSideRow(this)">✕</button></div>'; }
    html += '</div><input type="hidden" id="side-removed" value="[]"><button class="btn-outline btn-sm" onclick="addSidePicker()">+ Add Image</button>';
    html += '<button class="btn-primary" style="width:100%;margin-top:12px" onclick="saveEditProduct(\'' + p.id + '\')">💾 Save Changes</button>';
    html += '<button class="btn-danger" style="width:100%;margin-top:8px" onclick="deleteProductConfirm(\'' + p.id + '\',\'' + p.name.replace(/'/g,"\\'") + '\')">🗑️ Delete Product</button>';
    openAdminModal(html);
    window._editProduct = p; window._editSideUrls = sideUrls;
    window.updateEditSubcats = function() { var catId = document.getElementById('ep-category').value; var sel = document.getElementById('ep-subcategory'); sel.innerHTML = '<option value="">None</option>'; allSubcategories.filter(function(s) { return s.category_id == catId; }).forEach(function(s) { sel.innerHTML += '<option value="' + s.id + '"' + (s.id == p.subcategory_id ? ' selected' : '') + '>' + s.name + '</option>'; }); };
    window.removeMainImage = function() { document.getElementById('ep-image-removed').value = 'true'; var pw = document.querySelector('#admin-form-modal .image-preview'); if (pw && pw.parentElement) pw.parentElement.style.display = 'none'; };
    setTimeout(function() { window.updateEditSubcats(); }, 100);
}
function addSidePicker() { var c = document.getElementById('side-images-container'); var d = document.createElement('div'); d.style.cssText = 'display:flex;align-items:center;gap:8px;margin:4px 0'; d.innerHTML = '<input type="file" accept="image/*" class="side-picker" style="font-size:12px;flex:1"><button class="btn-danger btn-sm" onclick="removeSideRow(this)">✕</button>'; c.appendChild(d); }
function removeSideRow(btn) { var row = btn.parentElement; var idx = row.getAttribute('data-index'); if (idx !== null) { var removed = JSON.parse(document.getElementById('side-removed').value || '[]'); removed.push(parseInt(idx)); document.getElementById('side-removed').value = JSON.stringify(removed); } row.remove(); }
async function saveEditProduct(id) {
    var name = document.getElementById('ep-name').value.trim(); var price = parseInt(document.getElementById('ep-price').value);
    if (!name || !price) { showToast('Name and price required', 'error'); return; }
    var updates = { name: name, price: price, category_id: document.getElementById('ep-category').value || null, subcategory_id: document.getElementById('ep-subcategory').value || null, description: document.getElementById('ep-desc').value.trim(), rating: parseFloat(document.getElementById('ep-rating').value) || 4.5, review_count: parseInt(document.getElementById('ep-reviews').value) || 0, stock_quantity: parseInt(document.getElementById('ep-stock').value) || 10, discount_percent: parseInt(document.getElementById('ep-discount').value) || 0, vendor: document.getElementById('ep-vendor').value.trim(), location: document.getElementById('ep-location').value.trim(), featured: document.getElementById('ep-featured').checked };
    if (document.getElementById('ep-image-removed').value === 'true') { updates.image_url = ''; updates.image_icon = '📦'; }
    var imgFile = document.getElementById('ep-main-image').files[0]; if (imgFile) { var ext = imgFile.name.split('.').pop(); var fn = 'products/' + Date.now() + '_main.' + ext; var up = await supabase.storage.from('images').upload(fn, imgFile); if (!up.error) updates.image_url = supabase.storage.from('images').getPublicUrl(fn).data.publicUrl; }
    var keptUrls = []; var removedIndices = JSON.parse(document.getElementById('side-removed').value || '[]');
    for (var i = 0; i < window._editSideUrls.length; i++) { if (removedIndices.indexOf(i) === -1) keptUrls.push(window._editSideUrls[i]); }
    var pickers = document.querySelectorAll('.side-picker'); for (var j = 0; j < pickers.length; j++) { if (pickers[j].files && pickers[j].files[0]) { var f = pickers[j].files[0]; var eext = f.name.split('.').pop(); var efn = 'products/' + Date.now() + '_' + j + '_extra.' + eext; var eup = await supabase.storage.from('images').upload(efn, f); if (!eup.error) keptUrls.push(supabase.storage.from('images').getPublicUrl(efn).data.publicUrl); } }
    updates.image_urls = JSON.stringify(keptUrls);
    await supabase.from('products').update(updates).eq('id', id);
    closeAdminModal(); showToast('Product updated!', 'success'); renderAdminPanels();
}
async function deleteProductConfirm(id, name) {
    if (!confirm('Delete "' + name + '" permanently?')) return;
    await supabase.from('products').delete().eq('id', id);
    closeAdminModal(); showToast('Product deleted', 'success'); renderAdminPanels();
}

// ============ CATEGORY CRUD ============
function showAddCategoryForm() { var html = '<h3>➕ Add Category</h3><label>Category Name</label><input id="ac-name" class="admin-input" placeholder="Name"><label>Emoji</label><input id="ac-emoji" class="admin-input" placeholder="e.g. 👞"><button class="btn-primary" style="width:100%" onclick="saveNewCategory()">Save</button>'; openAdminModal(html); }
async function saveNewCategory() { var name = document.getElementById('ac-name').value.trim(); if (!name) { showToast('Name required', 'error'); return; } await supabase.from('categories').insert({ name: name, emoji: document.getElementById('ac-emoji').value.trim() || '📁', sort_order: allCategories.length + 1, owner_email: viewingAdminEmail || currentUserEmail }); closeAdminModal(); showToast('Category added!', 'success'); renderAdminPanels(); }
function editCategory(id) { var cat = allCategories.find(function(c) { return c.id == id; }); if (!cat) return; var html = '<h3>✏️ Edit Category</h3><label>Name</label><input id="ec-name" class="admin-input" value="' + cat.name + '"><label>Emoji</label><input id="ec-emoji" class="admin-input" value="' + (cat.emoji || '') + '"><button class="btn-primary" style="width:100%" onclick="saveEditCategory(\'' + id + '\')">Update</button>'; openAdminModal(html); }
async function saveEditCategory(id) { var name = document.getElementById('ec-name').value.trim(); if (!name) { showToast('Name required', 'error'); return; } await supabase.from('categories').update({ name: name, emoji: document.getElementById('ec-emoji').value.trim() }).eq('id', id); closeAdminModal(); showToast('Updated!', 'success'); renderCategoriesListAdmin(); }
async function deleteCategory(id) { var cat = allCategories.find(function(c) { return c.id == id; }); if (!cat) return; if (!confirm('Delete "' + cat.name + '" and all its subcategories?')) return; await supabase.from('categories').delete().eq('id', id); showToast('Deleted!', 'success'); renderCategoriesListAdmin(); }
async function moveCatUp(i) { if (i === 0) return; var a = allCategories[i], b = allCategories[i - 1]; await supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id); await supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id); loadDynamicData(); renderCategoriesListAdmin(); }
async function moveCatDown(i) { if (i >= allCategories.length - 1) return; var a = allCategories[i], b = allCategories[i + 1]; await supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id); await supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id); loadDynamicData(); renderCategoriesListAdmin(); }

// ============ SUBCATEGORY CRUD ============
function renderAddSubcategory(catId) { var html = '<h3>➕ Add Subcategory</h3><label>Name</label><input id="as-name" class="admin-input" placeholder="Subcategory Name"><button class="btn-primary" style="width:100%" onclick="saveNewSubcategory(\'' + catId + '\')">Save</button>'; openAdminModal(html); }
async function saveNewSubcategory(catId) { var name = document.getElementById('as-name').value.trim(); if (!name) { showToast('Name required', 'error'); return; } await supabase.from('subcategories').insert({ name: name, category_id: parseInt(catId), owner_email: viewingAdminEmail || currentUserEmail }); closeAdminModal(); showToast('Added!', 'success'); renderSubcategoriesAdmin(catId); }
function editSubcategory(id) { var sub = allSubcategories.find(function(s) { return s.id == id; }); if (!sub) return; var html = '<h3>✏️ Edit Subcategory</h3><label>Name</label><input id="es-name" class="admin-input" value="' + sub.name + '"><button class="btn-primary" style="width:100%" onclick="saveEditSubcategory(\'' + id + '\')">Update</button>'; openAdminModal(html); }
async function saveEditSubcategory(id) { var name = document.getElementById('es-name').value.trim(); if (!name) { showToast('Name required', 'error'); return; } var sub = allSubcategories.find(function(s) { return s.id == id; }); await supabase.from('subcategories').update({ name: name }).eq('id', id); closeAdminModal(); showToast('Updated!', 'success'); renderSubcategoriesAdmin(sub.category_id); }
async function deleteSubcategory(id) { if (!confirm('Delete this subcategory and all its products?')) return; var sub = allSubcategories.find(function(s) { return s.id == id; }); await supabase.from('subcategories').delete().eq('id', id); showToast('Deleted!', 'success'); renderSubcategoriesAdmin(sub.category_id); }

// ============ EMAIL CENTER ============
function renderEmailCenter() {
    var isCEO = currentUserIsCEO;
    var html = '<h3>✉️ Email Center</h3>';
    if (isCEO) {
        html += '<div class="tabs"><button class="tab active" onclick="switchEmailTab(\'partner\',this)">Registered Partner</button><button class="tab" onclick="switchEmailTab(\'custom\',this)">Custom Email</button></div>';
        html += '<div id="email-partner-section"><label>Search Partner</label><input id="partner-search-input" class="admin-input" placeholder="Type business name..." oninput="filterPartnerDropdown()" autocomplete="off"><div class="dropdown-list" id="partner-dropdown"></div></div>';
        html += '<div id="email-custom-section" style="display:none"><label>Recipient Email</label><input id="custom-recipient" type="email" class="admin-input" placeholder="customer@example.com"></div>';
    } else {
        html += '<div class="tabs"><button class="tab active" onclick="switchEmailTab(\'partner\',this)">Registered Partner</button><button class="tab" onclick="switchEmailTab(\'ceo\',this)">Send to CEO</button></div>';
        html += '<div id="email-partner-section"><label>Select Partner</label><div class="dropdown-list show" id="partner-dropdown"></div></div>';
        html += '<div id="email-custom-section" style="display:none"><p style="font-size:12px;color:var(--text-muted)">Message will be sent to the CEO</p></div>';
    }
    html += '<label>Subject</label><input id="email-subject" class="admin-input" placeholder="Subject"><label>Message</label><textarea id="email-message" class="admin-input" placeholder="Message" rows="3"></textarea>';
    html += '<button class="btn-primary" style="width:100%" onclick="sendCustomEmail()">📤 Send Email</button><div id="email-status" class="status"></div>';
    openAdminModal(html);
    window._emailType = 'partner'; window._selectedPartner = null;
    var dd = document.getElementById('partner-dropdown'); dd.innerHTML = '';
    if (!isCEO) { dd.innerHTML += '<div class="dropdown-item" onclick="selectPartner(\'bayeroisa2003@gmail.com\',\'Abihani Isa (CEO)\')">Abihani Isa (CEO) <small style="color:var(--text-muted)">bayeroisa2003@gmail.com</small></div>'; }
    supabase.from('admins').select('email,business_name').neq('role','Owner').then(function(r) { var partners = r.data || []; for (var i = 0; i < partners.length; i++) { var p = partners[i]; dd.innerHTML += '<div class="dropdown-item" onclick="selectPartner(\'' + p.email + '\',\'' + (p.business_name || p.email).replace(/'/g,"\\'") + '\')">' + (p.business_name || p.email) + ' <small style="color:var(--text-muted)">' + p.email + '</small></div>'; } dd.classList.add('show'); });
}
function filterPartnerDropdown() { var q = document.getElementById('partner-search-input').value.toLowerCase(); var dd = document.getElementById('partner-dropdown'); var items = dd.querySelectorAll('.dropdown-item'); for (var i = 0; i < items.length; i++) { items[i].style.display = items[i].textContent.toLowerCase().indexOf(q) !== -1 ? 'block' : 'none'; } dd.classList.add('show'); }
function selectPartner(email, name) { window._selectedPartner = email; var si = document.getElementById('partner-search-input'); if (si) si.value = name + ' (' + email + ')'; document.getElementById('partner-dropdown').classList.remove('show'); }
function switchEmailTab(type, btn) { window._emailType = type; var tabs = document.querySelectorAll('.tab'); for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active'); btn.classList.add('active'); var ps = document.getElementById('email-partner-section'); var cs = document.getElementById('email-custom-section'); if (type === 'partner') { ps.style.display = 'block'; cs.style.display = 'none'; } else { ps.style.display = 'none'; cs.style.display = 'block'; } }
async function sendCustomEmail() {
    var recipient;
    if (window._emailType === 'partner') { recipient = window._selectedPartner; }
    else if (window._emailType === 'ceo') { recipient = CONFIG.CEO_EMAIL; }
    else { recipient = document.getElementById('custom-recipient').value.trim(); }
    var subject = document.getElementById('email-subject').value.trim();
    var message = document.getElementById('email-message').value.trim();
    var statusEl = document.getElementById('email-status');
    if (!recipient) { statusEl.textContent = 'Select or enter a recipient'; statusEl.className = 'status error'; return; }
    if (!subject) { statusEl.textContent = 'Subject required'; statusEl.className = 'status error'; return; }
    if (!message) { statusEl.textContent = 'Message required'; statusEl.className = 'status error'; return; }
    statusEl.textContent = 'Sending...'; statusEl.className = 'status info';
    var footer = currentUserIsCEO ? '<br><br><hr><p style="font-size:11px;color:#a6947e">Abihani Isa<br>Founder & CEO, Abihani Nig Ltd<br>www.abihaniexpress.com.ng</p>' : '';
    var ok = await sendEmail(recipient, subject, '<p>' + message.replace(/\n/g, '<br>') + '</p>' + footer);
    if (ok) { statusEl.textContent = 'Email sent! ✉️'; statusEl.className = 'status success'; document.getElementById('email-subject').value = ''; document.getElementById('email-message').value = ''; }
    else { statusEl.textContent = 'Failed to send.'; statusEl.className = 'status error'; }
}

// ============ POPUPS (CUSTOM ORDER, BOOKS, ARTISAN) ============
function openCustomOrderPopup() {
    document.getElementById('custom-order-popup-title').textContent = CONFIG.CUSTOM_ORDER_TITLE;
    document.getElementById('custom-order-popup-subtitle').textContent = CONFIG.CUSTOM_ORDER_SUBTITLE;
    var form = document.getElementById('custom-order-form'); if (!form) return;
    var h = '';
    for (var f = 0; f < CONFIG.CUSTOM_ORDER_FIELDS.length; f++) { var fd = CONFIG.CUSTOM_ORDER_FIELDS[f]; h += '<label style="font-size:13px;font-weight:500;margin-top:8px;display:block">' + fd.label + (fd.required ? ' *' : ' <span style="color:var(--text-muted)">(Optional)</span>') + '</label>'; if (fd.type === 'textarea') h += '<textarea name="co_' + f + '" placeholder="' + fd.placeholder + '" ' + (fd.required ? 'required' : '') + ' rows="3" style="width:100%;padding:12px;border-radius:25px;border:1px solid var(--border);margin:4px 0;font-family:inherit;background:var(--bg-primary);color:var(--text-primary)"></textarea>'; else h += '<input type="' + fd.type + '" name="co_' + f + '" placeholder="' + fd.placeholder + '" ' + (fd.required ? 'required' : '') + ' style="width:100%;padding:12px;border-radius:25px;border:1px solid var(--border);margin:4px 0;background:var(--bg-primary);color:var(--text-primary)">'; }
    h += '<button type="submit" class="btn-submit-order"><i class="fab fa-whatsapp"></i> Send via WhatsApp</button>';
    form.innerHTML = h; document.getElementById('custom-order-popup').style.display = 'flex'; document.body.style.overflow = 'hidden';
}
function closeCustomOrderPopup() { document.getElementById('custom-order-popup').style.display = 'none'; document.body.style.overflow = ''; }
function submitCustomOrder(e) {
    e.preventDefault(); var msg = '🛠️ *CUSTOM ORDER REQUEST*\n\n';
    for (var f = 0; f < CONFIG.CUSTOM_ORDER_FIELDS.length; f++) { var val = (document.querySelector('[name="co_' + f + '"]') ? document.querySelector('[name="co_' + f + '"]').value : '').trim(); if (val) msg += '*' + CONFIG.CUSTOM_ORDER_FIELDS[f].label + ':* ' + val + '\n'; }
    msg += '\n📅 _Sent from Abihani Express Website_';
    window.open('https://wa.me/' + CONFIG.WHATSAPP_NUMBER.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg), '_blank');
    closeCustomOrderPopup(); showToast('Sent via WhatsApp!', 'success');
}
function openBookPopup(i) { var b = CONFIG.BOOKS[i]; if (!b) return; document.getElementById('book-popup-img').src = b.cover; document.getElementById('book-popup-title').textContent = b.title; document.getElementById('book-popup-author').textContent = 'by ' + b.author; document.getElementById('book-popup-price').textContent = b.price; document.getElementById('book-popup-synopsis').textContent = b.synopsis || ''; var ab = document.getElementById('book-popup-action-btn'); if (b.isFree) { ab.innerHTML = '<i class="fas fa-download"></i> Download Free PDF'; ab.className = 'btn-popup-download'; ab.href = b.pdfUrl; ab.target = '_blank'; } else { ab.innerHTML = '<i class="fab fa-whatsapp"></i> Buy via WhatsApp'; ab.className = 'btn-popup-wa'; ab.href = 'https://wa.me/' + CONFIG.WHATSAPP_NUMBER.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(b.waMessage); ab.target = '_blank'; } document.getElementById('book-popup').style.display = 'flex'; document.body.style.overflow = 'hidden'; }
function closeBookPopup() { document.getElementById('book-popup').style.display = 'none'; document.body.style.overflow = ''; }
function openArtisanPopup() { var container = document.getElementById('artisan-popup-container'); if (!container) return; container.innerHTML = '<div class="book-popup-overlay" style="display:flex" id="artisan-popup-inner"><div class="book-popup-content" style="max-width:500px"><span class="book-popup-close" onclick="closeArtisanPopup()">&times;</span><div style="text-align:center"><img src="' + CONFIG.ARTISAN_IMAGE + '" style="width:100%;max-width:300px;border-radius:16px;margin-bottom:16px" alt="' + CONFIG.ARTISAN_NAME + '"><span class="artisan-badge" style="display:inline-block;margin-bottom:8px">' + CONFIG.ARTISAN_BADGE_TEXT + '</span><h3 style="color:var(--accent);margin-bottom:8px">' + CONFIG.ARTISAN_NAME + '</h3><p style="color:var(--text-secondary);font-size:13px;line-height:1.6;margin-bottom:16px">' + CONFIG.ARTISAN_FULL_STORY + '</p><a href="https://wa.me/234' + CONFIG.ARTISAN_WHATSAPP.replace(/^0/, '') + '" class="btn-popup-wa" target="_blank"><i class="fab fa-whatsapp"></i> ' + CONFIG.ARTISAN_POPUP_CONTACT_TEXT + '</a></div></div></div>'; document.body.style.overflow = 'hidden'; }
function closeArtisanPopup() { document.getElementById('artisan-popup-container').innerHTML = ''; document.body.style.overflow = ''; }

// ============ FEEDBACK ============
async function submitFeedback() {
    var n = document.getElementById('contact-name') ? document.getElementById('contact-name').value.trim() : 'Anonymous';
    var e = document.getElementById('contact-email') ? document.getElementById('contact-email').value.trim() : '';
    var m = document.getElementById('contact-message') ? document.getElementById('contact-message').value.trim() : '';
    if (!m) { showToast('Please enter a message', 'error'); return; }
    var btn = document.getElementById('feedback-send-btn'); setBtnLoading(btn, 'Sending...');
    await supabase.from('feedback').insert({ name: n || 'Anonymous', message: m });
    var emailBody = '<p><strong>Name:</strong> ' + (n || 'Anonymous') + '</p>';
    if (e) emailBody += '<p><strong>Email:</strong> ' + e + '</p>';
    emailBody += '<p><strong>Message:</strong></p><p>' + m.replace(/\n/g, '<br>') + '</p>';
    sendEmail(CONFIG.CEO_EMAIL, '📬 New Feedback from ' + (n || 'Anonymous'), emailBody);
    resetBtn(btn, 'Send feedback');
    document.getElementById('contact-name').value = ''; if (document.getElementById('contact-email')) document.getElementById('contact-email').value = ''; document.getElementById('contact-message').value = '';
    showToast('Feedback sent! Thank you! 📬', 'success');
}

// ============ SESSION CHECK ============
(async function() {
    var session = await supabase.auth.getSession();
    if (session.data && session.data.session) {
        var email = session.data.session.user.email;
        if (CONFIG.ADMIN_CEO_EMAILS.indexOf(email) !== -1) { isAdminLoggedIn = true; currentUserEmail = email; currentUserRole = 'Owner'; currentUserIsCEO = true; saveSession(); }
    }
})();

// ============ FINAL EXPOSE ============
window.renderAdminPanels = renderAdminPanels;
window.renderAdminRequests = renderAdminRequests;
window.loadRequestTab = loadRequestTab;
window.approveApp = approveApp; window.rejectApp = rejectApp; window.deleteRejectedApp = deleteRejectedApp;
window.renderPartners = renderPartners;
window.viewAdminDashboard = viewAdminDashboard;
window.freezeAdmin = freezeAdmin; window.unfreezeAdmin = unfreezeAdmin; window.deleteAdminCompletely = deleteAdminCompletely;
window.renderSettings = renderSettings; window.saveAdminSettings = saveAdminSettings; window.saveCEOSettings = saveCEOSettings;
window.saveAnnouncement = saveAnnouncement;
window.renderAllProductsAdmin = renderAllProductsAdmin;
window.renderCategoriesListAdmin = renderCategoriesListAdmin;
window.renderSubcategoriesAdmin = renderSubcategoriesAdmin;
window.renderSubProductsAdmin = renderSubProductsAdmin;
window.showAddProductForm = showAddProductForm; window.addAddSidePicker = addAddSidePicker;
window.saveNewProduct = saveNewProduct;
window.renderEditProduct = renderEditProduct; window.addSidePicker = addSidePicker;
window.removeSideRow = removeSideRow;
window.saveEditProduct = saveEditProduct; window.deleteProductConfirm = deleteProductConfirm;
window.showAddCategoryForm = showAddCategoryForm; window.saveNewCategory = saveNewCategory;
window.editCategory = editCategory; window.saveEditCategory = saveEditCategory;
window.deleteCategory = deleteCategory;
window.moveCatUp = moveCatUp; window.moveCatDown = moveCatDown;
window.renderAddSubcategory = renderAddSubcategory; window.saveNewSubcategory = saveNewSubcategory;
window.editSubcategory = editSubcategory; window.saveEditSubcategory = saveEditSubcategory;
window.deleteSubcategory = deleteSubcategory;
window.renderEmailCenter = renderEmailCenter; window.switchEmailTab = switchEmailTab;
window.filterPartnerDropdown = filterPartnerDropdown; window.selectPartner = selectPartner;
window.sendCustomEmail = sendCustomEmail;
window.openCustomOrderPopup = openCustomOrderPopup; window.closeCustomOrderPopup = closeCustomOrderPopup;
window.submitCustomOrder = submitCustomOrder;
window.openBookPopup = openBookPopup; window.closeBookPopup = closeBookPopup;
window.openArtisanPopup = openArtisanPopup; window.closeArtisanPopup = closeArtisanPopup;
window.submitFeedback = submitFeedback;

// ============================================
// END — ABIHANI EXPRESS v18 🌸
// ============================================