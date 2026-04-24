// ============================================
// ABIHANI EXPRESS - COMPLETE CORRECTED APP
// All features aligned with SQL structure
// NO JSON for sliders/badges - uses separate columns
// ============================================

// ---------- SUPABASE INITIALIZATION ----------
const supabase = window.supabase.createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY);

// ---------- GLOBAL STATE ----------
const state = {
    siteSettings: null,
    allCategories: [],
    allSubcategories: [],
    allProducts: [],
    isAdminLoggedIn: false,
    currentUser: null,
    currentSlide: 0,
    // These will be populated from separate columns
    sliders: [],
    trustBadges: [],
    sustainabilityBadges: [],
    customOrderFields: [],
    autoSlideInterval: null,
    currentProductForWA: null
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function closeAnnouncement() {
    const bar = document.getElementById('announcement-bar');
    if (bar) bar.classList.add('closed');
    localStorage.setItem('announcementClosed', 'true');
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('show');
}

function closeMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.remove('show');
}

// Back to Top Button
function initBackToTop() {
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.className = 'back-to-top';
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) btn.classList.add('visible');
        else btn.classList.remove('visible');
    });
}

// ============================================
// ROUTING & PAGE NAVIGATION
// ============================================

let isUpdatingHash = false;

function showPage(pageName, scrollToBooksFlag = false, productId = null) {
    window.scrollTo(0, 0);
    
    if (!isUpdatingHash && window.location.hash.slice(1).split('?')[0] !== pageName) {
        isUpdatingHash = true;
        window.location.hash = pageName;
        isUpdatingHash = false;
    }
    
    document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active-page'));
    
    const pageMap = {
        'home': () => document.getElementById('home-page').classList.add('active-page'),
        'shop': () => { document.getElementById('shop-page').classList.add('active-page'); loadAllProducts(); },
        'product-detail': () => { document.getElementById('product-detail-page').classList.add('active-page'); if (productId) showProductDetail(productId); },
        'search': () => { document.getElementById('search-page').classList.add('active-page'); document.getElementById('search-results').innerHTML = ''; document.getElementById('search-input').value = ''; },
        'admin-login': () => document.getElementById('admin-login-page').classList.add('active-page'),
        'admin-dashboard': () => { if (state.isAdminLoggedIn) { document.getElementById('admin-dashboard-page').classList.add('active-page'); renderAdminPanels(); } else showPage('admin-login'); },
        'about': () => { document.getElementById('about-page').classList.add('active-page'); if (scrollToBooksFlag) setTimeout(() => { const books = document.querySelector('.books-container'); if (books) books.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200); },
        'terms': () => document.getElementById('terms-page').classList.add('active-page'),
        'privacy': () => document.getElementById('privacy-page').classList.add('active-page'),
        'contact': () => document.getElementById('contact-page').classList.add('active-page'),
        'blog': () => { document.getElementById('blog-page').classList.add('active-page'); loadBlogPosts(); },
        'profile': () => {
            if (state.isAdminLoggedIn) showPage('admin-dashboard');
            else document.getElementById('profile-page').classList.add('active-page');
        }
    };
    
    if (pageMap[pageName]) pageMap[pageName]();
    
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navMap = { 'home': 'nav-home', 'shop': 'nav-shop', 'search': 'nav-search', 'profile': 'nav-profile', 'admin-login': 'nav-profile', 'admin-dashboard': 'nav-profile', 'blog': 'nav-blog' };
    if (navMap[pageName]) document.getElementById(navMap[pageName])?.classList.add('active');
}

function handleHashChange() {
    if (isUpdatingHash) return;
    let hash = window.location.hash.slice(1).split('?')[0];
    const validPages = ['home', 'shop', 'search', 'about', 'contact', 'profile', 'admin-login', 'product-detail', 'terms', 'privacy', 'blog'];
    if (hash && validPages.includes(hash)) {
        isUpdatingHash = true;
        showPage(hash);
        isUpdatingHash = false;
    } else if (!hash || hash === '') {
        isUpdatingHash = true;
        showPage('home');
        isUpdatingHash = false;
    }
}

window.addEventListener('hashchange', handleHashChange);

function scrollToBooks() {
    showPage('about', true);
}

// ============================================
// STAR RATING GENERATOR - Upgrade #3
// ============================================

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

// ============================================
// PRODUCT CARD HTML
// ============================================

function productImageHTML(imageUrl, fallbackIcon, altText) {
    if (!imageUrl) return `<div style="font-size:48px;">${fallbackIcon || '📦'}</div>`;
    return `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(altText || '')}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='${fallbackIcon || '📦'}';this.parentElement.style.fontSize='48px';">`;
}

function productCardHTML(p) {
    const imageContent = productImageHTML(p.image_url, p.image_icon, p.name);
    const rating = p.rating || 4.5;
    const reviewCount = p.review_count || 24;
    const stars = generateStarRating(rating);
    const finalPrice = p.discount_percent ? p.price * (1 - p.discount_percent / 100) : p.price;
    const discountHtml = p.discount_percent ? `<span class="original-price">₦${p.price?.toLocaleString()}</span>` : '';
    const discountBadge = p.discount_percent ? `<div class="discount-badge">-${p.discount_percent}%</div>` : '';
    const lowStockHtml = (p.stock_quantity <= p.low_stock_alert && p.stock_quantity > 0) ? `<div class="low-stock-badge">⚠️ Only ${p.stock_quantity} left</div>` : '';
    const outOfStock = p.stock_quantity === 0;
    const shareButton = state.isAdminLoggedIn ? 
        `<button class="btn-share-wa-status" onclick="window.shareToWhatsAppStatus(${p.id}); event.stopPropagation();">
            <i class="fab fa-whatsapp"></i> Share to Status
        </button>` : '';
    
    return `<div class="product-card" onclick="window.showProductDetail(${p.id})">
        <div class="product-image">
            ${discountBadge}
            ${lowStockHtml}
            ${imageContent}
        </div>
        <div class="product-info">
            <h4>${escapeHtml(p.name)}</h4>
            <div class="product-price">₦${Math.round(finalPrice).toLocaleString()}${discountHtml}</div>
            <div class="product-rating">${stars}<span>(${reviewCount} reviews)</span></div>
            <div class="product-vendor"><i class="fas fa-store"></i> ${escapeHtml(p.vendor || 'Abihani Express')}</div>
            <button class="btn-wa-small" onclick="window.openWASummary(${p.id}); event.stopPropagation();" ${outOfStock ? 'disabled' : ''}>
                <i class="fab fa-whatsapp"></i> ${outOfStock ? 'Out of Stock' : 'Buy Now'}
            </button>
            ${shareButton}
        </div>
    </div>`;
}

// ============================================
// WHATSAPP ORDER SUMMARY - Suggestion #1
// ============================================

function openWASummary(productId) {
    const product = state.allProducts?.find(p => p.id === productId);
    if (!product) return;
    if (product.stock_quantity === 0) { showToast('Out of stock!', 'error'); return; }
    
    state.currentProductForWA = product;
    const finalPrice = product.discount_percent ? product.price * (1 - product.discount_percent / 100) : product.price;
    
    let overlay = document.getElementById('wa-summary-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'wa-summary-overlay';
        overlay.className = 'wa-summary-overlay';
        document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
        <div class="wa-summary-content">
            <h3>📝 Confirm Order</h3>
            <p><strong>${escapeHtml(product.name)}</strong></p>
            <p>Price: ₦${Math.round(finalPrice).toLocaleString()}</p>
            <p>Quantity: <input type="number" id="wa-quantity" value="1" min="1" max="${product.stock_quantity}" style="width:80px; padding:8px; border-radius:20px; border:1px solid var(--border);"></p>
            <div class="wa-summary-actions">
                <button class="btn-secondary" onclick="closeWASummary()">Cancel</button>
                <button class="btn-primary" onclick="confirmAndSendWA()">Send to WhatsApp</button>
            </div>
        </div>
    `;
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeWASummary() {
    const overlay = document.getElementById('wa-summary-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function confirmAndSendWA() {
    const product = state.currentProductForWA;
    if (!product) return;
    const quantity = parseInt(document.getElementById('wa-quantity')?.value) || 1;
    const finalPrice = product.discount_percent ? product.price * (1 - product.discount_percent / 100) : product.price;
    const totalPrice = finalPrice * quantity;
    const whatsapp = state.siteSettings?.whatsapp_number || ENV.WHATSAPP_NUMBER;
    const message = `Hello Abihani Express!%0a%0aI'm interested in buying:%0a🛍️ ${product.name}%0a📦 Quantity: ${quantity}%0a💰 Total: ₦${Math.round(totalPrice).toLocaleString()}%0a%0aPlease provide payment details.`;
    const cleanNumber = whatsapp.replace(/[^0-9]/g, '');
    closeWASummary();
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
}

// ============================================
// PRODUCT DETAILS - Upgrade #15 & Suggestion #8
// ============================================

async function showProductDetail(productId) {
    const { data, error } = await supabase
        .from('products')
        .select('*, categories(name), subcategories(name)')
        .eq('id', productId)
        .single();
    if (error || !data) { showToast('Product not found', 'error'); return; }
    
    const product = data;
    const stars = generateStarRating(product.rating || 4.5);
    const finalPrice = product.discount_percent ? product.price * (1 - product.discount_percent / 100) : product.price;
    const discountHtml = product.discount_percent ? `<span class="product-detail-original-price">₦${product.price?.toLocaleString()}</span>` : '';
    
    let stockHtml = '';
    if (product.stock_quantity === 0) stockHtml = '<span class="stock-out">❌ Out of Stock</span>';
    else if (product.stock_quantity <= product.low_stock_alert) stockHtml = `<span class="stock-low">⚠️ Only ${product.stock_quantity} left in stock!</span>`;
    else stockHtml = `<span class="stock-in-stock">✅ In Stock (${product.stock_quantity} available)</span>`;
    
    // Parse multiple images
    let images = [];
    try { images = JSON.parse(product.image_urls || '[]'); } catch(e) { images = []; }
    if (product.image_url && !images.includes(product.image_url)) images.unshift(product.image_url);
    if (images.length === 0) images = [null];
    
    const mainImage = images[0] ? `<img src="${escapeHtml(images[0])}" alt="${escapeHtml(product.name)}" id="detail-main-image">` : `<div style="font-size:80px;">${product.image_icon || '📦'}</div>`;
    const thumbnails = images.slice(1).map(img => img ? `<img src="${escapeHtml(img)}" onclick="document.getElementById('detail-main-image').src='${escapeHtml(img)}'">` : '').join('');
    
    // Load related products
    const { data: related } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', productId)
        .limit(4);
    
    const container = document.getElementById('product-detail-container');
    if (!container) return;
    
    container.innerHTML = `
        <div class="product-detail-container">
            <div class="product-detail-images">
                <div class="product-detail-main-image">${mainImage}</div>
                <div class="product-detail-thumbnails">${thumbnails}</div>
            </div>
            <div class="product-detail-info">
                <h1>${escapeHtml(product.name)}</h1>
                <div class="product-detail-price">₦${Math.round(finalPrice).toLocaleString()}${discountHtml}</div>
                <div class="product-detail-rating">${stars} <span>(${product.review_count || 0} reviews)</span></div>
                <div class="product-detail-stock">${stockHtml}</div>
                <div class="product-detail-meta">
                    <p><i class="fas fa-tag"></i> ${product.categories?.name || 'Uncategorized'}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${product.vendor_location || 'Potiskum, Yobe State'}</p>
                    <p><i class="fas fa-store"></i> ${product.vendor || 'Abihani Express'}</p>
                </div>
                <div class="product-detail-description">
                    <h4>Description</h4>
                    <p>${product.description || 'No description available'}</p>
                </div>
                <button class="btn-primary" onclick="window.openWASummary(${product.id})" ${product.stock_quantity === 0 ? 'disabled' : ''}>
                    <i class="fab fa-whatsapp"></i> ${product.stock_quantity === 0 ? 'Out of Stock' : 'Buy Now via WhatsApp'}
                </button>
                <button class="btn-secondary" style="margin-top:12px;" onclick="window.showPage('shop')">← Back to Products</button>
            </div>
        </div>
        ${related && related.length ? `
        <div class="related-products">
            <h3>✨ You might also like</h3>
            <div class="related-scroll">
                ${related.map(p => productCardHTML(p)).join('')}
            </div>
        </div>` : ''}
    `;
    showPage('product-detail');
}

// ============================================
// SEARCH & FILTERS - Suggestion #3
// ============================================

let searchDebounceTimer = null;
let currentPriceMax = 100000;

async function searchProducts() {
    const query = document.getElementById('search-input')?.value.toLowerCase().trim();
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) return;
    if (query === '') { clearTimeout(searchDebounceTimer); resultsDiv.innerHTML = '<p style="text-align:center;">Type to search products...</p>'; return; }
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(async () => {
        let searchQuery = supabase.from('products').select('*');
        if (query) searchQuery = searchQuery.ilike('name', `%${query}%`);
        const { data } = await searchQuery;
        resultsDiv.innerHTML = (data && data.length) ? data.map(p => productCardHTML(p)).join('') : '<p style="text-align:center;">No products found</p>';
    }, 300);
}

function renderFilterUI() {
    const existingFilter = document.querySelector('#shop-page .filter-bar');
    if (existingFilter) existingFilter.remove();
    
    const filterBar = document.createElement('div');
    filterBar.className = 'filter-bar';
    filterBar.innerHTML = `
        <select id="filter-category" style="flex:1; padding:10px 16px; border-radius:40px; border:1px solid var(--border); background:var(--bg-primary); color:var(--text-primary);">
            <option value="all">All Categories</option>
            ${state.allCategories.map(c => `<option value="${c.id}">${c.icon || '📦'} ${escapeHtml(c.name)}</option>`).join('')}
        </select>
        <select id="filter-sort" style="flex:1; padding:10px 16px; border-radius:40px; border:1px solid var(--border); background:var(--bg-primary); color:var(--text-primary);">
            <option value="default">Sort by: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
        </select>
        <div style="flex:2; min-width:150px;">
            <input type="range" id="price-range" min="0" max="200000" step="5000" value="100000" style="width:100%;">
            <span>Max Price: ₦<span id="price-value">100,000</span></span>
        </div>
    `;
    const sectionTitle = document.querySelector('#shop-page .section-title');
    if (sectionTitle) sectionTitle.after(filterBar);
    
    document.getElementById('filter-category')?.addEventListener('change', applyFilters);
    document.getElementById('filter-sort')?.addEventListener('change', applyFilters);
    document.getElementById('price-range')?.addEventListener('input', (e) => {
        document.getElementById('price-value').textContent = parseInt(e.target.value).toLocaleString();
        currentPriceMax = parseInt(e.target.value);
        applyFilters();
    });
}

async function applyFilters() {
    const categoryId = document.getElementById('filter-category')?.value;
    const sortBy = document.getElementById('filter-sort')?.value;
    
    let query = supabase.from('products').select('*');
    if (categoryId && categoryId !== 'all') query = query.eq('category_id', parseInt(categoryId));
    query = query.lte('price', currentPriceMax);
    
    const { data } = await query;
    let products = data || [];
    
    if (sortBy === 'price_asc') products.sort((a,b) => a.price - b.price);
    else if (sortBy === 'price_desc') products.sort((a,b) => b.price - a.price);
    else if (sortBy === 'rating') products.sort((a,b) => (b.rating || 0) - (a.rating || 0));
    
    renderAllProducts(products);
}

// ============================================
// DATA LOADING FUNCTIONS - CORRECTED to read from columns
// ============================================

async function loadSiteSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (error) { console.error('Error loading site settings:', error); return; }
    
    state.siteSettings = data;
    
    // Load sliders from SEPARATE columns (NOT JSON)
    state.sliders = [];
    for (let i = 1; i <= 5; i++) {
        if (data[`slider${i}_enabled`] && data[`slider${i}_title`] && data[`slider${i}_title`].trim() !== '') {
            state.sliders.push({ 
                title: data[`slider${i}_title`], 
                subtitle: data[`slider${i}_subtitle`] || '' 
            });
        }
    }
    
    // Load trust badges from SEPARATE columns
    state.trustBadges = [];
    for (let i = 1; i <= 4; i++) {
        const text = data[`trust_badge${i}_text`];
        if (text && text.trim() !== '') {
            state.trustBadges.push({ 
                icon: data[`trust_badge${i}_icon`] || 'fa-tag', 
                text: text 
            });
        }
    }
    
    // Load sustainability badges from SEPARATE columns
    state.sustainabilityBadges = [];
    for (let i = 1; i <= 3; i++) {
        const text = data[`sustain_badge${i}_text`];
        if (text && text.trim() !== '') {
            state.sustainabilityBadges.push({ 
                icon: data[`sustain_badge${i}_icon`] || 'fa-leaf', 
                text: text 
            });
        }
    }
    
    // Load custom order fields
    try { 
        state.customOrderFields = JSON.parse(data.custom_order_fields_json || '[]'); 
    } catch(e) { 
        state.customOrderFields = []; 
    }
    
    // Apply colors
    if (data.primary_color) document.documentElement.style.setProperty('--accent', data.primary_color);
    if (data.background_color) document.documentElement.style.setProperty('--bg-primary', data.background_color);
    if (data.text_color) document.documentElement.style.setProperty('--text-primary', data.text_color);
    
    // Update HTML elements
    document.title = data.site_name || 'Abihani Express';
    const logoH1 = document.querySelector('.logo h1');
    if (logoH1) logoH1.textContent = data.site_name || 'Abihani Express';
    const logoSpan = document.querySelector('.logo span');
    if (logoSpan) logoSpan.textContent = data.slogan || 'MOM · DAD · UMMIHANI';
    const copyrightSpan = document.getElementById('copyright');
    if (copyrightSpan) copyrightSpan.innerHTML = `© 2026 ${data.site_name || 'Abihani Express'}`;
    const footerText = document.getElementById('footer-text');
    if (footerText) footerText.textContent = data.footer_text || 'Buy for Mom. Dad. Ummihani. 🎉';
    const footerSiteName = document.getElementById('footer-site-name');
    if (footerSiteName) footerSiteName.textContent = data.site_name || 'Abihani Express';
    
    const nigeriaBadge = document.querySelector('.nigeria-badge');
    if (nigeriaBadge && data.nigeria_badge_text) nigeriaBadge.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${data.nigeria_badge_text}`;
    
    const announcementSpan = document.querySelector('#announcement-bar span');
    if (announcementSpan && data.announcement_text) announcementSpan.innerHTML = data.announcement_text;
    
    if (localStorage.getItem('announcementClosed') === 'true') closeAnnouncement();
    
    // Render all sections
    renderSlider();
    renderInfoSections();
    renderSocialLinks();
    renderTrustBadges();
    renderEcoSection();
    renderArtisanSection();
    renderArtisanPopup();
    renderBooksSection();
    renderCustomOrderForm();
    renderTermsPage();
    renderPrivacyPage();
    renderAboutPage();
    renderMissionSection();
}

async function loadCategories() {
    const { data, error } = await supabase.from('categories').select('*').order('order');
    if (!error) state.allCategories = data || [];
    renderCategoriesHome();
    renderCategoriesFilter();
    renderFilterUI();
}

async function loadSubcategories() {
    const { data, error } = await supabase.from('subcategories').select('*');
    if (!error) state.allSubcategories = data || [];
}

async function loadFeaturedProducts() {
    const { data, error } = await supabase.from('products').select('*').eq('featured', true).order('featured_order');
    if (!error) renderFeaturedProducts(data || []);
}

async function loadAllProducts(categoryId = null) {
    let query = supabase.from('products').select('*');
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error } = await query;
    if (!error) {
        state.allProducts = data || [];
        renderAllProducts(data || []);
    }
}

async function loadBlogPosts() {
    const { data, error } = await supabase.from('blog_posts').select('*').eq('published', true).order('date', { ascending: false });
    if (!error) renderBlogPosts(data || []);
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderSlider() {
    const container = document.getElementById('slider-container');
    if (!container) return;
    if (!state.sliders || state.sliders.length === 0) {
        container.innerHTML = `<div class="slider-card"><h2>Welcome to Abihani Express</h2><p>Premium handcrafted leather goods from Yobe State, Nigeria</p></div><div class="slider-dots"><span class="dot active"></span></div>`;
        return;
    }
    const renderSlide = (index) => {
        const slide = state.sliders[index];
        container.innerHTML = `<div class="slider-card"><h2>${escapeHtml(slide.title)}</h2><p>${escapeHtml(slide.subtitle)}</p></div>
            <div class="slider-dots">${state.sliders.map((_, i) => `<span class="dot ${i === index ? 'active' : ''}" onclick="window.setSlide(${i})"></span>`).join('')}</div>`;
    };
    renderSlide(0);
    if (state.autoSlideInterval) clearInterval(state.autoSlideInterval);
    if (state.sliders.length > 1) {
        state.autoSlideInterval = setInterval(() => {
            state.currentSlide = (state.currentSlide + 1) % state.sliders.length;
            renderSlide(state.currentSlide);
        }, 5000);
    }
}

function setSlide(index) {
    if (!state.sliders || !state.sliders[index]) return;
    state.currentSlide = index;
    const container = document.getElementById('slider-container');
    const slide = state.sliders[index];
    const sliderCard = container.querySelector('.slider-card');
    if (sliderCard) sliderCard.innerHTML = `<h2>${escapeHtml(slide.title)}</h2><p>${escapeHtml(slide.subtitle)}</p>`;
    document.querySelectorAll('.dot').forEach((dot, i) => dot.classList.toggle('active', i === index));
}

function renderCategoriesHome() {
    const container = document.getElementById('categories-home');
    if (!container) return;
    const cats = state.allCategories || [];
    if (!cats.length) { container.innerHTML = '<div class="category-pill">Loading...</div>'; return; }
    container.innerHTML = cats.map(cat => `<div class="category-pill" onclick="window.filterByCategoryAndGoToShop(${cat.id})"><span style="font-size:18px; margin-right:6px;">${cat.icon || '📦'}</span> ${cat.name}</div>`).join('');
}

function filterByCategoryAndGoToShop(categoryId) {
    sessionStorage.setItem('filterCategory', categoryId);
    showPage('shop');
    setTimeout(() => {
        const catFilter = document.getElementById('filter-category');
        if (catFilter) catFilter.value = categoryId;
        applyFilters();
    }, 100);
}

function renderCategoriesFilter() {
    const container = document.getElementById('categories-filter');
    if (!container) return;
    const cats = state.allCategories || [];
    container.innerHTML = `<div class="category-pill active" onclick="window.filterAllProducts()">All</div>` +
        cats.map(cat => `<div class="category-pill" onclick="window.filterByCategory(${cat.id})"><span style="font-size:14px; margin-right:6px;">${cat.icon || '📦'}</span> ${cat.name}</div>`).join('');
}

function filterByCategory(categoryId) {
    loadAllProducts(categoryId);
    document.querySelectorAll('#categories-filter .category-pill').forEach(p => p.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
}

function filterAllProducts() {
    loadAllProducts();
    document.querySelectorAll('#categories-filter .category-pill').forEach(p => p.classList.remove('active'));
    const firstPill = document.querySelector('#categories-filter .category-pill:first-child');
    if (firstPill) firstPill.classList.add('active');
}

function renderFeaturedProducts(products) {
    const container = document.getElementById('featured-products');
    if (!container) return;
    if (!products || products.length === 0) {
        const fallbacks = [
            { id: 1, name: 'Classic Leather Brogues', price: 45000, image_icon: '👞', rating: 4.8, review_count: 128, stock_quantity: 10, low_stock_alert: 5 },
            { id: 2, name: 'Premium Tote Bag', price: 38000, image_icon: '👜', rating: 4.9, review_count: 95, stock_quantity: 10, low_stock_alert: 5 }
        ];
        container.innerHTML = fallbacks.map(p => productCardHTML(p)).join('');
        return;
    }
    container.innerHTML = products.map(p => productCardHTML(p)).join('');
}

function renderAllProducts(products) {
    const container = document.getElementById('all-products-grid');
    if (!container) return;
    if (!products || products.length === 0) {
        const fallbacks = [
            { id: 1, name: 'Classic Leather Brogues', price: 45000, image_icon: '👞', rating: 4.8, review_count: 128, stock_quantity: 10, low_stock_alert: 5 },
            { id: 2, name: 'Premium Tote Bag', price: 38000, image_icon: '👜', rating: 4.9, review_count: 95, stock_quantity: 10, low_stock_alert: 5 },
            { id: 3, name: 'Genuine Leather Belt', price: 12000, image_icon: '🔗', rating: 4.5, review_count: 67, stock_quantity: 10, low_stock_alert: 5 },
            { id: 4, name: 'Handmade Sandals', price: 22000, image_icon: '👡', rating: 4.6, review_count: 52, stock_quantity: 10, low_stock_alert: 5 }
        ];
        container.innerHTML = fallbacks.map(p => productCardHTML(p)).join('');
        return;
    }
    container.innerHTML = products.map(p => productCardHTML(p)).join('');
}

function renderInfoSections() {
    const container = document.getElementById('info-sections');
    if (!container) return;
    const s = state.siteSettings || {};
    const logoUrl = s.logo_url || 'https://placehold.co/200x200/e6d5c0/8b5a2b?text=Logo';
    const ceoImageUrl = s.ceo_image_url || 'https://placehold.co/160x220/e6d5c0/8b5a2b?text=CEO';
    const siteName = s.site_name || 'Abihani Express';
    const aboutText = s.about_who_we_are || 'Abihani Express is the premier online destination for premium leather goods in Yobe State, Nigeria.';
    
    container.innerHTML = `
        <div class="section-left">
            <img src="${logoUrl}" alt="Logo" class="circle-image" onerror="this.src='https://placehold.co/200x200/e6d5c0/8b5a2b?text=Logo'">
            <div class="text-content"><h3>${escapeHtml(siteName)}</h3><p>${escapeHtml(aboutText)}</p></div>
        </div>
        <div class="section-right">
            <img src="${ceoImageUrl}" class="ceo-image" alt="CEO" onerror="this.src='https://placehold.co/160x220/e6d5c0/8b5a2b?text=CEO'">
            <div class="text-content"><h3>About Abihani Isa</h3><p>${escapeHtml(s.ceo_bio || 'Abihani Isa is the founder and CEO of Abihani Nig Ltd...')}</p></div>
        </div>
    `;
}

function renderMissionSection() {
    const container = document.getElementById('mission-section');
    if (!container) return;
    const s = state.siteSettings || {};
    container.innerHTML = `
        <div class="info-card" style="text-align:center;">
            <h4>Our Mission</h4>
            <p>${escapeHtml(s.about_mission || 'To provide affordable, durable, and stylish leather products while supporting local artisans and growing the community economy.')}</p>
        </div>
    `;
}

function renderSocialLinks() {
    const container = document.getElementById('social-links');
    if (!container) return;
    const s = state.siteSettings || {};
    const whatsapp = s.whatsapp_number || ENV.WHATSAPP_NUMBER;
    container.innerHTML = `
        <a href="https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}" target="_blank"><i class="fab fa-whatsapp"></i></a>
        <a href="${s.facebook_url || 'https://www.facebook.com/Abihaniisa'}" target="_blank"><i class="fab fa-facebook"></i></a>
        <a href="${s.instagram_url || 'https://www.instagram.com/abihani_isa'}" target="_blank"><i class="fab fa-instagram"></i></a>
        <a href="${s.twitter_url || 'https://x.com/abihaniisa01'}" target="_blank"><i class="fab fa-twitter"></i></a>
    `;
}

function renderTrustBadges() {
    const container = document.getElementById('trust-badges-container');
    if (!container) return;
    let badges = (state.trustBadges && state.trustBadges.length) ? state.trustBadges : [
        { icon: "fa-shield-alt", text: "Secure Checkout" },
        { icon: "fa-truck", text: "Free Delivery Over ₦50,000" },
        { icon: "fa-undo-alt", text: "7-Day Returns" },
        { icon: "fab fa-whatsapp", text: "24/7 WhatsApp Support" }
    ];
    container.innerHTML = `<div class="trust-badges">${badges.map(b => `<div class="trust-item"><i class="fas ${b.icon}"></i><span>${escapeHtml(b.text)}</span></div>`).join('')}</div>`;
}

function renderEcoSection() {
    const container = document.getElementById('eco-section-container');
    if (!container) return;
    const ecoText = state.siteSettings?.eco_text || 'Every Abihani Express product is handcrafted using responsibly sourced leather. We partner with local artisans, pay fair wages, and minimize waste.';
    let badges = (state.sustainabilityBadges && state.sustainabilityBadges.length) ? state.sustainabilityBadges : [
        { icon: "fa-hand-holding-heart", text: "Fair Trade" },
        { icon: "fa-recycle", text: "Eco-Friendly" },
        { icon: "fa-users", text: "Local Artisans" }
    ];
    container.innerHTML = `
        <div class="sustainability-section">
            <i class="fas fa-leaf"></i>
            <h3>Ethically Crafted, Sustainably Made</h3>
            <p>${escapeHtml(ecoText)}</p>
            <div class="sustainability-badges">${badges.map(b => `<span><i class="fas ${b.icon}"></i> ${escapeHtml(b.text)}</span>`).join('')}</div>
        </div>
    `;
}

function renderArtisanSection() {
    const container = document.getElementById('artisan-section-container');
    if (!container) return;
    const s = state.siteSettings || {};
    const artisanImageUrl = s.artisan_image_url || 'https://placehold.co/500x500/e6d5c0/8b5a2b?text=Master+Artisan';
    const artisanName = s.artisan_name || 'Adamu Yahaya AYFOOTIES';
    const artisanStory = s.artisan_story || 'With over 20 years of leather crafting experience, Adamu Yahaya leads our workshop in Potiskum.';
    container.innerHTML = `
        <div class="artisan-section">
            <div class="artisan-image"><img src="${artisanImageUrl}" alt="${escapeHtml(artisanName)}"></div>
            <div class="artisan-content">
                <span class="artisan-badge">✨ Meet Our Master Artisan ✨</span>
                <h3>${escapeHtml(artisanName)}</h3>
                <p>${escapeHtml(artisanStory)}</p>
                <button class="btn-secondary" onclick="window.openArtisanPopup()">Learn More →</button>
            </div>
        </div>
    `;
}

function renderArtisanPopup() {
    const container = document.getElementById('artisan-popup-container');
    if (!container) return;
    const s = state.siteSettings || {};
    const artisanImageUrl = s.artisan_image_url || 'https://placehold.co/400x400/e6d5c0/8b5a2b?text=Master+Artisan';
    const artisanName = s.artisan_name || 'Adamu Yahaya AYFOOTIES';
    const artisanFullStory = s.artisan_full_story || s.artisan_story || 'Adamu Yahaya AYFOOTIES has been crafting leather goods for over 20 years. He learned the trade from his father. Today, he leads a team of 15 artisans at the Abihani Express workshop in Potiskum, Yobe State.';
    container.innerHTML = `
        <div id="artisan-popup" class="artisan-popup-overlay">
            <div class="artisan-popup-content">
                <span class="artisan-popup-close" onclick="window.closeArtisanPopup()">&times;</span>
                <div class="artisan-popup-body">
                    <div class="artisan-popup-image"><img src="${artisanImageUrl}" alt="${escapeHtml(artisanName)}"></div>
                    <div class="artisan-popup-info">
                        <h3>${escapeHtml(artisanName)}</h3>
                        <p class="artisan-popup-title">✨ Master Artisan ✨</p>
                        <div class="artisan-popup-story"><p>${escapeHtml(artisanFullStory)}</p></div>
                        <a href="https://wa.me/${(s.whatsapp_number || '2347067551684').replace(/[^0-9]/g, '')}" class="btn-primary" style="text-decoration:none; display:inline-block; margin-top:20px;"><i class="fab fa-whatsapp"></i> Contact for Custom Work</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function openArtisanPopup() {
    const popup = document.getElementById('artisan-popup');
    if (popup) { popup.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeArtisanPopup() {
    const popup = document.getElementById('artisan-popup');
    if (popup) { popup.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

let bookData = [];

function renderBooksSection() {
    const container = document.getElementById('books-container');
    if (!container) return;
    const s = state.siteSettings || {};
    bookData = [
        { title: s.book1_title || 'My Gifts to Dear Students', author: s.book1_author || 'Abihani Isa', price: s.book1_price || 'FREE', cover: s.book1_cover_url || 'https://placehold.co/400x600/e6d5c0/8b5a2b?text=Book1', isFree: s.book1_is_free !== false, pdfUrl: s.book1_pdf_url || '' },
        { title: s.book2_title || 'The Symphony of Two Hearts', author: s.book2_author || 'Abihani Isa', price: s.book2_price || '₦1,500', cover: s.book2_cover_url || 'https://placehold.co/400x600/e6d5c0/8b5a2b?text=Book2', isFree: s.book2_is_free || false, pdfUrl: s.book2_pdf_url || '', waMessage: s.book2_whatsapp_message || 'Hello Abihani Express, I want to purchase "The Symphony of Two Hearts" for ₦1,500.' }
    ];
    container.innerHTML = bookData.map((book, idx) => `
        <div class="book-card" onclick="window.openBookPopup(${idx})">
            <div class="book-image"><img src="${book.cover}" alt="${escapeHtml(book.title)}"></div>
            <div class="book-info">
                <h4>${escapeHtml(book.title)}</h4>
                <p class="book-author">by ${escapeHtml(book.author)}</p>
                <p class="book-price">${escapeHtml(book.price)}</p>
                ${book.isFree ? `<a href="${book.pdfUrl || '#'}" class="btn-book-download" target="_blank" onclick="event.stopPropagation()"><i class="fas fa-download"></i> Download PDF</a>` : `<button class="btn-book-buy" onclick="event.stopPropagation(); window.openBookPopup(${idx})"><i class="fab fa-whatsapp"></i> Preview & Buy</button>`}
            </div>
        </div>
    `).join('');
}

function openBookPopup(bookIndex) {
    const book = bookData[bookIndex];
    if (!book) return;
    const popup = document.getElementById('book-popup');
    const img = document.getElementById('book-popup-img');
    const title = document.getElementById('book-popup-title');
    const author = document.getElementById('book-popup-author');
    const priceSpan = document.getElementById('book-popup-price');
    const waLink = document.getElementById('book-popup-wa');
    
    if (img) img.src = book.cover;
    if (title) title.textContent = book.title;
    if (author) author.textContent = `by ${book.author}`;
    if (priceSpan) priceSpan.textContent = book.price;
    
    const whatsapp = state.siteSettings?.whatsapp_number || '2347067551684';
    const message = book.isFree ? `Hello Abihani Express, I want to download "${book.title}"` : (book.waMessage || `Hello Abihani Express, I want to purchase "${book.title}" for ${book.price}`);
    if (waLink) waLink.href = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    
    if (popup) { popup.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeBookPopup() {
    const popup = document.getElementById('book-popup');
    if (popup) { popup.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

function renderCustomOrderForm() {
    const container = document.getElementById('custom-order-form-container');
    if (!container) return;
    const s = state.siteSettings || {};
    const title = s.custom_order_title || 'Custom Order Request';
    const subtitle = s.custom_order_subtitle || 'Fill this form and we will WhatsApp you within minutes to confirm.';
    const fields = state.customOrderFields.length ? state.customOrderFields : [
        {name:"name",label:"Full Name",type:"text",required:true,placeholder:"Enter your full name"},
        {name:"product_type",label:"Product Type",type:"text",required:true,placeholder:"e.g., Shoes, Bag, Belt"},
        {name:"description",label:"Description",type:"textarea",required:true,placeholder:"Describe exactly what you want and we will strive to make it for you"}
    ];
    
    container.innerHTML = `
        <div class="custom-order-content">
            <span class="custom-order-close" onclick="window.closeCustomOrderPopup()">&times;</span>
            <h3><i class="fas fa-pen-alt"></i> ${escapeHtml(title)}</h3>
            <p>${escapeHtml(subtitle)}</p>
            <form id="custom-order-form" onsubmit="event.preventDefault(); window.submitCustomOrder()">
                ${fields.map(f => `
                    <div class="form-group">
                        <label>${escapeHtml(f.label)} ${f.required ? '<span class="required">*</span>' : ''}</label>
                        ${f.type === 'textarea' ? 
                            `<textarea id="order-${f.name}" rows="4" placeholder="${escapeHtml(f.placeholder || '')}" ${f.required ? 'required' : ''}></textarea>` : 
                            `<input type="${f.type}" id="order-${f.name}" placeholder="${escapeHtml(f.placeholder || '')}" ${f.required ? 'required' : ''}>`
                        }
                    </div>
                `).join('')}
                <button type="submit" class="btn-submit-order"><i class="fab fa-whatsapp"></i> Send Request via WhatsApp</button>
            </form>
        </div>
    `;
}

function openCustomOrderPopup() {
    const popup = document.getElementById('custom-order-popup');
    if (popup) { popup.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
}

function closeCustomOrderPopup() {
    const popup = document.getElementById('custom-order-popup');
    if (popup) { popup.style.display = 'none'; document.body.style.overflow = 'auto'; }
}

function submitCustomOrder() {
    const fields = state.customOrderFields.length ? state.customOrderFields : [
        {name:"name",required:true},{name:"product_type",required:true},{name:"description",required:true}
    ];
    
    for (const field of fields) {
        if (field.required) {
            const value = document.getElementById(`order-${field.name}`)?.value.trim();
            if (!value) { showToast(`Please fill in ${field.label || field.name}`, 'error'); return; }
        }
    }
    
    let message = `🛍️ NEW CUSTOM ORDER 🛍️%0a%0a`;
    for (const field of fields) {
        const value = document.getElementById(`order-${field.name}`)?.value.trim();
        if (value) message += `*${field.label || field.name}:* ${value}%0a`;
    }
    
    const whatsappNumber = state.siteSettings?.whatsapp_number || '2347067551684';
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    closeCustomOrderPopup();
    showToast('Order request sent!', 'success');
}

function renderTermsPage() {
    const container = document.getElementById('terms-container');
    if (!container) return;
    container.innerHTML = `<div class="admin-card">${state.siteSettings?.terms_text || '<h4>Terms & Conditions</h4><p>1. By using this platform, you agree to these terms.</p>'}</div>`;
}

function renderPrivacyPage() {
    const container = document.getElementById('privacy-container');
    if (!container) return;
    container.innerHTML = `<div class="admin-card">${state.siteSettings?.privacy_text || '<h4>Privacy Policy</h4><p>We collect name, email, and usage data to improve service.</p>'}</div>`;
}

function renderAboutPage() {
    const who = document.getElementById('about-who-container');
    const mission = document.getElementById('mission-container');
    if (who && state.siteSettings?.about_who_we_are) {
        who.innerHTML = `<div class="info-card"><h4>Who We Are</h4><p>${escapeHtml(state.siteSettings.about_who_we_are)}</p></div>`;
    }
}

function renderBlogPosts(posts) {
    const container = document.getElementById('blog-posts-container');
    if (!container) return;
    if (!posts || posts.length === 0) {
        container.innerHTML = '<p>No blog posts yet. Check back soon!</p>';
        return;
    }
    container.innerHTML = posts.map(post => `
        <div class="blog-card">
            <h3>${escapeHtml(post.title)}</h3>
            <small>${new Date(post.date).toLocaleDateString()}</small>
            <p>${escapeHtml(post.content)}</p>
        </div>
    `).join('');
}

// ============================================
// FEEDBACK
// ============================================

async function submitFeedback() {
    const name = document.getElementById('contact-name')?.value || 'Anonymous';
    const email = document.getElementById('contact-email')?.value || 'Not provided';
    const message = document.getElementById('contact-message')?.value;
    if (!message) { showToast('Please enter a message', 'error'); return; }
    const { error } = await supabase.from('feedback').insert([{ name, email, message, status: 'unread', created_at: new Date() }]);
    if (error) { showToast('Error: ' + error.message, 'error'); } else {
        showToast('Feedback sent! Thank you.', 'success');
        if (document.getElementById('contact-name')) document.getElementById('contact-name').value = '';
        if (document.getElementById('contact-email')) document.getElementById('contact-email').value = '';
        if (document.getElementById('contact-message')) document.getElementById('contact-message').value = '';
    }
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

async function adminLogin() {
    const email = document.getElementById('admin-email')?.value;
    const password = document.getElementById('admin-password')?.value;
    if (!email || !password) { showToast('Enter email and password', 'error'); return; }
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const { data: adminData } = await supabase.from('admins').select('email').eq('email', email).single();
        if (!adminData) { await supabase.auth.signOut(); showToast('No admin privileges', 'error'); return; }
        state.isAdminLoggedIn = true;
        state.currentUser = data.user;
        showPage('admin-dashboard');
        await renderAdminPanels();
        showToast('Welcome Admin!', 'success');
    } catch (error) { showToast('Login failed: ' + error.message, 'error'); }
}

async function logoutAdmin() {
    await supabase.auth.signOut();
    state.isAdminLoggedIn = false;
    state.currentUser = null;
    showPage('home');
    showToast('Logged out', 'success');
}

async function renderAdminPanels() {
    const cats = await supabase.from('categories').select('*').order('order');
    const catList = document.getElementById('admin-categories-list');
    if (catList) catList.innerHTML = cats.data?.map(c => `<div class="admin-item"><span>${c.icon || '📦'} ${escapeHtml(c.name)}</span><span class="admin-actions"><i class="fas fa-edit" onclick="window.editCategory(${c.id})"></i><i class="fas fa-trash" onclick="window.deleteCategory(${c.id})"></i></span></div>`).join('') || '<p>No categories</p>';
    
    const subs = await supabase.from('subcategories').select('*, categories(name)');
    const subList = document.getElementById('admin-subcategories-list');
    if (subList) subList.innerHTML = subs.data?.map(s => `<div class="admin-item"><span>${escapeHtml(s.name)} (${s.categories?.name || 'Unknown'})</span><span class="admin-actions"><i class="fas fa-edit" onclick="window.editSubcategory(${s.id})"></i><i class="fas fa-trash" onclick="window.deleteSubcategory(${s.id})"></i></span></div>`).join('') || '<p>No subcategories</p>';
    
    const prods = await supabase.from('products').select('*').order('id');
    const prodList = document.getElementById('admin-products-list');
    if (prodList) prodList.innerHTML = prods.data?.map(p => `<div class="admin-item"><span>${p.image_icon || '📦'} ${escapeHtml(p.name)} - ₦${p.price}</span><span class="admin-actions"><i class="fas fa-star${p.featured ? ' text-warning' : ''}" onclick="window.toggleFeatured(${p.id})" style="color:${p.featured ? '#FFD700' : 'var(--text-muted)'}; cursor:pointer;"></i><i class="fas fa-edit" onclick="window.editProduct(${p.id})"></i><i class="fas fa-trash" onclick="window.deleteProduct(${p.id})"></i></span></div>`).join('') || '<p>No products</p>';
    
    const fb = await supabase.from('feedback').select('*').order('created_at', { ascending: false });
    const fbList = document.getElementById('admin-feedback-list');
    if (fbList) fbList.innerHTML = fb.data?.map(f => `<div class="admin-item" style="flex-direction:column; align-items:flex-start;"><div style="width:100%; display:flex; justify-content:space-between;"><strong>${escapeHtml(f.name || 'Anonymous')}</strong><span><i class="fas fa-trash" onclick="window.deleteFeedback(${f.id})" style="color:red; cursor:pointer;"></i></span></div><small>${escapeHtml(f.email)} | ${new Date(f.created_at).toLocaleString()}</small><p>${escapeHtml(f.message)}</p></div>`).join('') || '<p>No feedback</p>';
    
    const blogs = await supabase.from('blog_posts').select('*').order('date', { ascending: false });
    const blogList = document.getElementById('admin-blog-list');
    if (blogList) blogList.innerHTML = blogs.data?.map(b => `<div class="admin-item"><span>${escapeHtml(b.title)}</span><span class="admin-actions"><i class="fas fa-edit" onclick="window.editBlogPost(${b.id})"></i><i class="fas fa-trash" onclick="window.deleteBlogPost(${b.id})"></i></span></div>`).join('') || '<p>No blog posts</p>';
}

async function toggleFeatured(productId) {
    const { data } = await supabase.from('products').select('featured').eq('id', productId).single();
    await supabase.from('products').update({ featured: !data?.featured }).eq('id', productId);
    await renderAdminPanels();
    await loadFeaturedProducts();
    showToast('Featured status updated', 'success');
}

async function deleteFeedback(id) {
    if (!confirm('Delete this feedback?')) return;
    await supabase.from('feedback').delete().eq('id', id);
    await renderAdminPanels();
    showToast('Feedback deleted', 'success');
}

async function editSiteSettings() {
    const s = state.siteSettings || {};
    const modalContent = document.getElementById('admin-modal-content');
    modalContent.innerHTML = `
        <div style="max-height:70vh; overflow-y:auto;">
            <h3>⚙️ Site Settings</h3>
            <div class="settings-section"><h4>🏢 Basic Info</h4>
                <label>Site Name</label><input type="text" id="edit-site-name" class="admin-input" value="${escapeHtml(s.site_name || '')}">
                <label>Slogan</label><input type="text" id="edit-slogan" class="admin-input" value="${escapeHtml(s.slogan || '')}">
                <label>Footer Text</label><input type="text" id="edit-footer-text" class="admin-input" value="${escapeHtml(s.footer_text || '')}">
                <label>Nigeria Badge</label><input type="text" id="edit-nigeria-badge" class="admin-input" value="${escapeHtml(s.nigeria_badge_text || '')}">
                <label>Announcement</label><textarea id="edit-announcement" class="admin-input" rows="2">${escapeHtml(s.announcement_text || '')}</textarea>
            </div>
            <div class="settings-section"><h4>📞 Contact & Social</h4>
                <label>WhatsApp Number</label><input type="text" id="edit-whatsapp" class="admin-input" value="${escapeHtml(s.whatsapp_number || '')}">
                <label>Facebook URL</label><input type="url" id="edit-facebook" class="admin-input" value="${escapeHtml(s.facebook_url || '')}">
                <label>Instagram URL</label><input type="url" id="edit-instagram" class="admin-input" value="${escapeHtml(s.instagram_url || '')}">
                <label>Twitter URL</label><input type="url" id="edit-twitter" class="admin-input" value="${escapeHtml(s.twitter_url || '')}">
            </div>
            <div class="settings-section"><h4>🖼️ Images</h4>
                <label>Logo URL</label><input type="url" id="edit-logo-url" class="admin-input" value="${escapeHtml(s.logo_url || '')}">
                <label>CEO Image URL</label><input type="url" id="edit-ceo-url" class="admin-input" value="${escapeHtml(s.ceo_image_url || '')}">
                <label>Artisan Image URL</label><input type="url" id="edit-artisan-url" class="admin-input" value="${escapeHtml(s.artisan_image_url || '')}">
            </div>
            <div class="settings-section"><h4>🎨 Colors</h4>
                <label>Primary Color</label><input type="color" id="edit-primary-color" class="admin-input" value="${s.primary_color || '#b87c4f'}">
                <label>Background Color</label><input type="color" id="edit-background-color" class="admin-input" value="${s.background_color || '#fdf9f5'}">
                <label>Text Color</label><input type="color" id="edit-text-color" class="admin-input" value="${s.text_color || '#2c2418'}">
            </div>
            <div class="settings-section"><h4>📄 Content</h4>
                <label>Artisan Name</label><input type="text" id="edit-artisan-name" class="admin-input" value="${escapeHtml(s.artisan_name || '')}">
                <label>Artisan Story</label><textarea id="edit-artisan-story" class="admin-input" rows="3">${escapeHtml(s.artisan_story || '')}</textarea>
                <label>Artisan Full Story (Popup)</label><textarea id="edit-artisan-full" class="admin-input" rows="4">${escapeHtml(s.artisan_full_story || '')}</textarea>
                <label>Eco Text</label><textarea id="edit-eco-text" class="admin-input" rows="2">${escapeHtml(s.eco_text || '')}</textarea>
                <label>Who We Are (About page)</label><textarea id="edit-about-who" class="admin-input" rows="3">${escapeHtml(s.about_who_we_are || '')}</textarea>
                <label>Our Mission</label><textarea id="edit-about-mission" class="admin-input" rows="2">${escapeHtml(s.about_mission || '')}</textarea>
                <label>CEO Bio</label><textarea id="edit-ceo-bio" class="admin-input" rows="4">${escapeHtml(s.ceo_bio || '')}</textarea>
                <label>Terms & Conditions</label><textarea id="edit-terms" class="admin-input" rows="4">${escapeHtml(s.terms_text || '')}</textarea>
                <label>Privacy Policy</label><textarea id="edit-privacy" class="admin-input" rows="4">${escapeHtml(s.privacy_text || '')}</textarea>
            </div>
            <div class="settings-section"><h4>📚 Books</h4>
                <label>Book 1 Title</label><input type="text" id="edit-book1-title" class="admin-input" value="${escapeHtml(s.book1_title || '')}">
                <label>Book 1 Author</label><input type="text" id="edit-book1-author" class="admin-input" value="${escapeHtml(s.book1_author || '')}">
                <label>Book 1 Price</label><input type="text" id="edit-book1-price" class="admin-input" value="${escapeHtml(s.book1_price || '')}">
                <label>Book 1 Cover URL</label><input type="url" id="edit-book1-cover" class="admin-input" value="${escapeHtml(s.book1_cover_url || '')}">
                <label>Book 1 PDF URL</label><input type="url" id="edit-book1-pdf" class="admin-input" value="${escapeHtml(s.book1_pdf_url || '')}">
                <label><input type="checkbox" id="edit-book1-free" ${s.book1_is_free ? 'checked' : ''}> Free?</label>
                <hr>
                <label>Book 2 Title</label><input type="text" id="edit-book2-title" class="admin-input" value="${escapeHtml(s.book2_title || '')}">
                <label>Book 2 Author</label><input type="text" id="edit-book2-author" class="admin-input" value="${escapeHtml(s.book2_author || '')}">
                <label>Book 2 Price</label><input type="text" id="edit-book2-price" class="admin-input" value="${escapeHtml(s.book2_price || '')}">
                <label>Book 2 Cover URL</label><input type="url" id="edit-book2-cover" class="admin-input" value="${escapeHtml(s.book2_cover_url || '')}">
                <label>Book 2 PDF URL</label><input type="url" id="edit-book2-pdf" class="admin-input" value="${escapeHtml(s.book2_pdf_url || '')}">
                <label><input type="checkbox" id="edit-book2-free" ${s.book2_is_free ? 'checked' : ''}> Free?</label>
                <label>Book 2 WhatsApp Message</label><textarea id="edit-book2-wa" class="admin-input" rows="2">${escapeHtml(s.book2_whatsapp_message || '')}</textarea>
            </div>
            <div class="settings-section"><h4>⚙️ Custom Order</h4>
                <label>Form Title</label><input type="text" id="edit-custom-title" class="admin-input" value="${escapeHtml(s.custom_order_title || '')}">
                <label>Form Subtitle</label><input type="text" id="edit-custom-subtitle" class="admin-input" value="${escapeHtml(s.custom_order_subtitle || '')}">
                <label>Custom Fields (JSON)</label>
                <textarea id="edit-custom-fields" class="admin-input" rows="6">${escapeHtml(s.custom_order_fields_json || '[]')}</textarea>
                <small>Format: [{"name":"field_name","label":"Display Label","type":"text","required":true,"placeholder":"Hint"}]</small>
            </div>
            <div class="modal-actions" style="margin-top:20px;">
                <button class="btn-secondary" onclick="window.closeModal()">Cancel</button>
                <button class="btn-primary" onclick="window.saveSiteSettings()">Save All Changes</button>
            </div>
        </div>
    `;
    document.getElementById('admin-modal').classList.add('active');
}

async function saveSiteSettings() {
    const updates = {
        site_name: document.getElementById('edit-site-name')?.value,
        slogan: document.getElementById('edit-slogan')?.value,
        footer_text: document.getElementById('edit-footer-text')?.value,
        nigeria_badge_text: document.getElementById('edit-nigeria-badge')?.value,
        announcement_text: document.getElementById('edit-announcement')?.value,
        whatsapp_number: document.getElementById('edit-whatsapp')?.value,
        facebook_url: document.getElementById('edit-facebook')?.value,
        instagram_url: document.getElementById('edit-instagram')?.value,
        twitter_url: document.getElementById('edit-twitter')?.value,
        logo_url: document.getElementById('edit-logo-url')?.value,
        ceo_image_url: document.getElementById('edit-ceo-url')?.value,
        artisan_image_url: document.getElementById('edit-artisan-url')?.value,
        primary_color: document.getElementById('edit-primary-color')?.value,
        background_color: document.getElementById('edit-background-color')?.value,
        text_color: document.getElementById('edit-text-color')?.value,
        artisan_name: document.getElementById('edit-artisan-name')?.value,
        artisan_story: document.getElementById('edit-artisan-story')?.value,
        artisan_full_story: document.getElementById('edit-artisan-full')?.value,
        eco_text: document.getElementById('edit-eco-text')?.value,
        about_who_we_are: document.getElementById('edit-about-who')?.value,
        about_mission: document.getElementById('edit-about-mission')?.value,
        ceo_bio: document.getElementById('edit-ceo-bio')?.value,
        terms_text: document.getElementById('edit-terms')?.value,
        privacy_text: document.getElementById('edit-privacy')?.value,
        book1_title: document.getElementById('edit-book1-title')?.value,
        book1_author: document.getElementById('edit-book1-author')?.value,
        book1_price: document.getElementById('edit-book1-price')?.value,
        book1_cover_url: document.getElementById('edit-book1-cover')?.value,
        book1_pdf_url: document.getElementById('edit-book1-pdf')?.value,
        book1_is_free: document.getElementById('edit-book1-free')?.checked,
        book2_title: document.getElementById('edit-book2-title')?.value,
        book2_author: document.getElementById('edit-book2-author')?.value,
        book2_price: document.getElementById('edit-book2-price')?.value,
        book2_cover_url: document.getElementById('edit-book2-cover')?.value,
        book2_pdf_url: document.getElementById('edit-book2-pdf')?.value,
        book2_is_free: document.getElementById('edit-book2-free')?.checked,
        book2_whatsapp_message: document.getElementById('edit-book2-wa')?.value,
        custom_order_title: document.getElementById('edit-custom-title')?.value,
        custom_order_subtitle: document.getElementById('edit-custom-subtitle')?.value,
        custom_order_fields_json: document.getElementById('edit-custom-fields')?.value
    };
    const { error } = await supabase.from('site_settings').update(updates).eq('id', 1);
    if (error) { showToast('Error: ' + error.message, 'error'); return; }
    closeModal();
    await loadSiteSettings();
    showToast('Settings saved! Refresh to see changes.', 'success');
    setTimeout(() => location.reload(), 1500);
}

function closeModal() {
    document.getElementById('admin-modal').classList.remove('active');
    document.getElementById('admin-modal-content').innerHTML = '';
}

// Category CRUD
async function showAddCategory() {
    openModal(`<h3>Add Category</h3><label>Name</label><input type="text" id="cat-name" class="admin-input"><label>Emoji/Icon</label><input type="text" id="cat-icon" class="admin-input" placeholder="👞"><label>Order</label><input type="number" id="cat-order" class="admin-input" value="0"><div class="modal-actions"><button class="btn-secondary" onclick="window.closeModal()">Cancel</button><button class="btn-primary" onclick="window.saveCategory()">Save</button></div>`);
}
async function saveCategory() {
    const name = document.getElementById('cat-name')?.value.trim();
    if (!name) { showToast('Enter name', 'error'); return; }
    await supabase.from('categories').insert([{ name, icon: document.getElementById('cat-icon')?.value || '📦', order: parseInt(document.getElementById('cat-order')?.value) || 0 }]);
    closeModal();
    await loadCategories();
    await renderAdminPanels();
    showToast('Category added', 'success');
}
async function editCategory(id) {
    const { data } = await supabase.from('categories').select('*').eq('id', id).single();
    openModal(`<h3>Edit Category</h3><label>Name</label><input type="text" id="cat-name" class="admin-input" value="${escapeHtml(data?.name || '')}"><label>Emoji</label><input type="text" id="cat-icon" class="admin-input" value="${data?.icon || '📦'}"><label>Order</label><input type="number" id="cat-order" class="admin-input" value="${data?.order || 0}"><div class="modal-actions"><button class="btn-secondary" onclick="window.closeModal()">Cancel</button><button class="btn-primary" onclick="window.updateCategory(${id})">Update</button></div>`);
}
async function updateCategory(id) {
    const name = document.getElementById('cat-name')?.value.trim();
    if (!name) return;
    await supabase.from('categories').update({ name, icon: document.getElementById('cat-icon')?.value, order: parseInt(document.getElementById('cat-order')?.value) }).eq('id', id);
    closeModal();
    await loadCategories();
    await renderAdminPanels();
    showToast('Category updated', 'success');
}
async function deleteCategory(id) {
    if (!confirm('Delete this category?')) return;
    await supabase.from('categories').delete().eq('id', id);
    await loadCategories();
    await renderAdminPanels();
    showToast('Category deleted', 'success');
}

// Subcategory CRUD
async function showAddSubcategory() {
    const { data: cats } = await supabase.from('categories').select('*');
    openModal(`<h3>Add Subcategory</h3><label>Parent Category</label><select id="sub-cat" class="admin-input">${cats?.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select><label>Name</label><input type="text" id="sub-name" class="admin-input"><div class="modal-actions"><button class="btn-secondary" onclick="window.closeModal()">Cancel</button><button class="btn-primary" onclick="window.saveSubcategory()">Save</button></div>`);
}
async function saveSubcategory() {
    const name = document.getElementById('sub-name')?.value.trim();
    if (!name) return;
    await supabase.from('subcategories').insert([{ name, category_id: parseInt(document.getElementById('sub-cat')?.value) }]);
    closeModal();
    await loadSubcategories();
    await renderAdminPanels();
    showToast('Subcategory added', 'success');
}
async function editSubcategory(id) {
    const { data } = await supabase.from('subcategories').select('*').eq('id', id).single();
    const { data: cats } = await supabase.from('categories').select('*');
    openModal(`<h3>Edit Subcategory</h3><label>Parent Category</label><select id="sub-cat" class="admin-input">${cats?.map(c => `<option value="${c.id}" ${c.id === data?.category_id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select><label>Name</label><input type="text" id="sub-name" class="admin-input" value="${escapeHtml(data?.name || '')}"><div class="modal-actions"><button class="btn-secondary" onclick="window.closeModal()">Cancel</button><button class="btn-primary" onclick="window.updateSubcategory(${id})">Update</button></div>`);
}
async function updateSubcategory(id) {
    const name = document.getElementById('sub-name')?.value.trim();
    if (!name) return;
    await supabase.from('subcategories').update({ name, category_id: parseInt(document.getElementById('sub-cat')?.value) }).eq('id', id);
    closeModal();
    await loadSubcategories();
    await renderAdminPanels();
    showToast('Subcategory updated', 'success');
}
async function deleteSubcategory(id) {
    if (!confirm('Delete?')) return;
    await supabase.from('subcategories').delete().eq('id', id);
    await loadSubcategories();
    await renderAdminPanels();
    showToast('Deleted', 'success');
}

// Product CRUD
async function showAddProduct() {
    const { data: cats } = await supabase.from('categories').select('*');
    openModal(`<h3>Add Product</h3>
        <label>Name</label><input type="text" id="prod-name" class="admin-input">
        <label>Price (₦)</label><input type="number" id="prod-price" class="admin-input">
        <label>Discount %</label><input type="number" id="prod-discount" class="admin-input" value="0">
        <label>Stock Quantity</label><input type="number" id="prod-stock" class="admin-input" value="10">
        <label>Low Stock Alert</label><input type="number" id="prod-low-stock" class="admin-input" value="5">
        <label>Category</label><select id="prod-cat" class="admin-input" onchange="window.updateSubcatOptions()">${cats?.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select>
        <label>Subcategory</label><select id="prod-sub" class="admin-input"><option value="">None</option></select>
        <label>Emoji Icon</label><input type="text" id="prod-icon" class="admin-input" value="📦">
        <label>Image URL</label><input type="url" id="prod-image" class="admin-input">
        <label>Multiple Images (JSON URLs)</label><input type="text" id="prod-images" class="admin-input" placeholder='["url1","url2"]'>
        <label>Description</label><textarea id="prod-desc" class="admin-input" rows="3"></textarea>
        <label><input type="checkbox" id="prod-featured"> Featured</label>
        <div class="modal-actions"><button class="btn-secondary" onclick="window.closeModal()">Cancel</button><button class="btn-primary" onclick="window.saveProduct()">Save</button></div>`);
    window.updateSubcatOptions = async function() {
        const catId = document.getElementById('prod-cat')?.value;
        const { data: subs } = await supabase.from('subcategories').select('*').eq('category_id', catId);
        const subSelect = document.getElementById('prod-sub');
        if (subSelect) subSelect.innerHTML = '<option value="">None</option>' + (subs?.map(s => `<option value="${s.id}">${escapeHtml(s.name)}</option>`).join('') || '');
    };
    setTimeout(() => { if (window.updateSubcatOptions) window.updateSubcatOptions(); }, 100);
}
async function saveProduct() {
    const name = document.getElementById('prod-name')?.value.trim();
    const price = parseInt(document.getElementById('prod-price')?.value);
    if (!name || !price) { showToast('Name and price required', 'error'); return; }
    let imageUrls = document.getElementById('prod-images')?.value;
    let parsedUrls = '[]';
    if (imageUrls) {
        try { parsedUrls = JSON.stringify(JSON.parse(imageUrls)); } catch(e) { parsedUrls = '[]'; }
    }
    await supabase.from('products').insert([{
        name, price,
        discount_percent: parseInt(document.getElementById('prod-discount')?.value) || 0,
        stock_quantity: parseInt(document.getElementById('prod-stock')?.value) || 10,
        low_stock_alert: parseInt(document.getElementById('prod-low-stock')?.value) || 5,
        category_id: parseInt(document.getElementById('prod-cat')?.value) || null,
        subcategory_id: parseInt(document.getElementById('prod-sub')?.value) || null,
        image_icon: document.getElementById('prod-icon')?.value || '📦',
        image_url: document.getElementById('prod-image')?.value || null,
        image_urls: parsedUrls,
        description: document.getElementById('prod-desc')?.value || '',
        featured: document.getElementById('prod-featured')?.checked || false
    }]);
    closeModal();
    await loadFeaturedProducts();
    await renderAdminPanels();
    showToast('Product added', 'success');
}
async function editProduct(id) {
    const { data } = await supabase.from('products').select('*').eq('id', id).single();
    const { data: cats } = await supabase.from('categories').select('*');
    openModal(`<h3>Edit Product</h3>
        <label>Name</label><input type="text" id="prod-name" class="admin-input" value="${escapeHtml(data?.name || '')}">
        <label>Price</label><input type="number" id="prod-price" class="admin-input" value="${data?.price || 0}">
        <label>Discount %</label><input type="number" id="prod-discount" class="admin-input" value="${data?.discount_percent || 0}">
        <label>Stock Quantity</label><input type="number" id="prod-stock" class="admin-input" value="${data?.stock_quantity || 10}">
        <label>Low Stock Alert</label><input type="number" id="prod-low-stock" class="admin-input" value="${data?.low_stock_alert || 5}">
        <label>Category</label><select id="prod-cat" class="admin-input">${cats?.map(c => `<option value="${c.id}" ${c.id === data?.category_id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}</select>
        <label>Subcategory</label><select id="prod-sub" class="admin-input"><option value="">None</option></select>
        <label>Emoji</label><input type="text" id="prod-icon" class="admin-input" value="${data?.image_icon || '📦'}">
        <label>Image URL</label><input type="url" id="prod-image" class="admin-input" value="${data?.image_url || ''}">
        <label>Multiple Images (JSON)</label><input type="text" id="prod-images" class="admin-input" value='${escapeHtml(data?.image_urls || '[]')}'>
        <label>Description</label><textarea id="prod-desc" class="admin-input" rows="3">${escapeHtml(data?.description || '')}</textarea>
        <label><input type="checkbox" id="prod-featured" ${data?.featured ? 'checked' : ''}> Featured</label>
        <div class="modal-actions"><button class="btn-secondary" onclick="window.closeModal()">Cancel</button><button class="btn-primary" onclick="window.updateProduct(${id})">Update</button></div>`);
    const subs = await supabase.from('subcategories').select('*').eq('category_id', data?.category_id);
    const subSelect = document.getElementById('prod-sub');
    if (subSelect) subSelect.innerHTML = '<option value="">None</option>' + (subs.data?.map(s => `<option value="${s.id}" ${s.id === data?.subcategory_id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('') || '');
}
async function updateProduct(id) {
    const name = document.getElementById('prod-name')?.value.trim();
    const price = parseInt(document.getElementById('prod-price')?.value);
    if (!name || !price) return;
    let imageUrls = document.getElementById('prod-images')?.value;
    let parsedUrls = '[]';
    if (imageUrls) {
        try { parsedUrls = JSON.stringify(JSON.parse(imageUrls)); } catch(e) { parsedUrls = '[]'; }
    }
    await supabase.from('products').update({
        name, price,
        discount_percent: parseInt(document.getElementById('prod-discount')?.value) || 0,
        stock_quantity: parseInt(document.getElementById('prod-stock')?.value) || 10,
        low_stock_alert: parseInt(document.getElementById('prod-low-stock')?.value) || 5,
        category_id: parseInt(document.getElementById('prod-cat')?.value) || null,
        subcategory_id: parseInt(document.getElementById('prod-sub')?.value) || null,
        image_icon: document.getElementById('prod-icon')?.value,
        image_url: document.getElementById('prod-image')?.value,
        image_urls: parsedUrls,
        description: document.getElementById('prod-desc')?.value,
        featured: document.getElementById('prod-featured')?.checked
    }).eq('id', id);
    closeModal();
    await loadFeaturedProducts();
    await renderAdminPanels();
    showToast('Product updated', 'success');
}
async function deleteProduct(id) {
    if (!confirm('Delete product?')) return;
    await supabase.from('products').delete().eq('id', id);
    await loadFeaturedProducts();
    await renderAdminPanels();
    showToast('Product deleted', 'success');
}

// Blog CRUD
async function showAddBlogPost() {
    openModal(`<h3>Add Blog Post</h3>
        <label>Title</label><input type="text" id="blog-title" class="admin-input">
        <label>Date</label><input type="date" id="blog-date" class="admin-input" value="${new Date().toISOString().split('T')[0]}">
        <label>Content</label><textarea id="blog-content" class="admin-input" rows="6"></textarea>
        <div class="modal-actions"><button class="btn-secondary" onclick="window.closeModal()">Cancel</button><button class="btn-primary" onclick="window.saveBlogPost()">Save</button></div>`);
}
async function saveBlogPost() {
    const title = document.getElementById('blog-title')?.value.trim();
    const content = document.getElementById('blog-content')?.value.trim();
    const date = document.getElementById('blog-date')?.value;
    if (!title || !content) { showToast('Title and content required', 'error'); return; }
    await supabase.from('blog_posts').insert([{ title, content, date, published: true }]);
    closeModal();
    await renderAdminPanels();
    await loadBlogPosts();
    showToast('Blog post added', 'success');
}
async function editBlogPost(id) {
    const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single();
    openModal(`<h3>Edit Blog Post</h3>
        <label>Title</label><input type="text" id="blog-title" class="admin-input" value="${escapeHtml(data?.title || '')}">
        <label>Date</label><input type="date" id="blog-date" class="admin-input" value="${data?.date || ''}">
        <label>Content</label><textarea id="blog-content" class="admin-input" rows="6">${escapeHtml(data?.content || '')}</textarea>
        <div class="modal-actions"><button class="btn-secondary" onclick="window.closeModal()">Cancel</button><button class="btn-primary" onclick="window.updateBlogPost(${id})">Update</button></div>`);
}
async function updateBlogPost(id) {
    const title = document.getElementById('blog-title')?.value.trim();
    const content = document.getElementById('blog-content')?.value.trim();
    const date = document.getElementById('blog-date')?.value;
    if (!title || !content) return;
    await supabase.from('blog_posts').update({ title, content, date }).eq('id', id);
    closeModal();
    await renderAdminPanels();
    await loadBlogPosts();
    showToast('Blog post updated', 'success');
}
async function deleteBlogPost(id) {
    if (!confirm('Delete this blog post?')) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    await renderAdminPanels();
    await loadBlogPosts();
    showToast('Blog post deleted', 'success');
}

function openModal(html) {
    document.getElementById('admin-modal-content').innerHTML = html;
    document.getElementById('admin-modal').classList.add('active');
}

function shareToWhatsAppStatus(productId) {
    const product = state.allProducts?.find(p => p.id === productId);
    if (!product) return;
    const siteUrl = window.location.origin;
    const finalPrice = product.discount_percent ? product.price * (1 - product.discount_percent / 100) : product.price;
    const shareText = `🛍️ ${product.name}%0a💰 ₦${Math.round(finalPrice).toLocaleString()}%0a%0a✨ Available at Abihani Express%0a%0a🛒 Order now: ${siteUrl}`;
    window.open(`https://wa.me/?text=${shareText}`, '_blank');
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('click', (e) => {
    if (e.target === document.getElementById('admin-modal')) closeModal();
    if (e.target === document.getElementById('custom-order-popup')) closeCustomOrderPopup();
    if (e.target === document.getElementById('book-popup')) closeBookPopup();
    if (e.target === document.getElementById('artisan-popup')) closeArtisanPopup();
    if (e.target.classList.contains('wa-summary-overlay')) closeWASummary();
    
    const pageLink = e.target.closest('[data-page]');
    if (pageLink) {
        e.preventDefault();
        const page = pageLink.getAttribute('data-page');
        const scroll = pageLink.getAttribute('data-scroll') === 'books';
        if (page === 'about' && scroll) scrollToBooks();
        else if (page) showPage(page);
    }
});

document.getElementById('search-input')?.addEventListener('keyup', searchProducts);
document.getElementById('menu-toggle')?.addEventListener('click', toggleMobileMenu);

window.addEventListener('load', async () => {
    console.log('Abihani Express loading...');
    initBackToTop();
    await loadSiteSettings();
    await loadCategories();
    await loadSubcategories();
    await loadFeaturedProducts();
    await loadAllProducts();
    await loadBlogPosts();
    handleHashChange();
    
    const savedFilter = sessionStorage.getItem('filterCategory');
    if (savedFilter) { 
        sessionStorage.removeItem('filterCategory'); 
        const catFilter = document.getElementById('filter-category');
        if (catFilter) catFilter.value = savedFilter;
        applyFilters();
    }
    console.log('Abihani Express ready!');
});

// Expose all functions to window
window.showPage = showPage;
window.toggleTheme = toggleTheme;
window.showProductDetail = showProductDetail;
window.openWASummary = openWASummary;
window.closeWASummary = closeWASummary;
window.confirmAndSendWA = confirmAndSendWA;
window.setSlide = setSlide;
window.filterByCategory = filterByCategory;
window.filterAllProducts = filterAllProducts;
window.filterByCategoryAndGoToShop = filterByCategoryAndGoToShop;
window.searchProducts = searchProducts;
window.applyFilters = applyFilters;
window.submitFeedback = submitFeedback;
window.adminLogin = adminLogin;
window.logoutAdmin = logoutAdmin;
window.editSiteSettings = editSiteSettings;
window.saveSiteSettings = saveSiteSettings;
window.closeModal = closeModal;
window.showAddCategory = showAddCategory;
window.saveCategory = saveCategory;
window.editCategory = editCategory;
window.updateCategory = updateCategory;
window.deleteCategory = deleteCategory;
window.showAddSubcategory = showAddSubcategory;
window.saveSubcategory = saveSubcategory;
window.editSubcategory = editSubcategory;
window.updateSubcategory = updateSubcategory;
window.deleteSubcategory = deleteSubcategory;
window.showAddProduct = showAddProduct;
window.saveProduct = saveProduct;
window.editProduct = editProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.toggleFeatured = toggleFeatured;
window.showAddBlogPost = showAddBlogPost;
window.saveBlogPost = saveBlogPost;
window.editBlogPost = editBlogPost;
window.updateBlogPost = updateBlogPost;
window.deleteBlogPost = deleteBlogPost;
window.openCustomOrderPopup = openCustomOrderPopup;
window.closeCustomOrderPopup = closeCustomOrderPopup;
window.submitCustomOrder = submitCustomOrder;
window.openArtisanPopup = openArtisanPopup;
window.closeArtisanPopup = closeArtisanPopup;
window.openBookPopup = openBookPopup;
window.closeBookPopup = closeBookPopup;
window.shareToWhatsAppStatus = shareToWhatsAppStatus;
window.scrollToBooks = scrollToBooks;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.closeAnnouncement = closeAnnouncement;
window.deleteFeedback = deleteFeedback;

console.log('✅ All functions exposed - Abihani Express ready!');
