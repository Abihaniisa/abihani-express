// ============================================
// js/config.js — ABIHANI EXPRESS CONFIGURATION
// 100% editable. Change anything here.
// ============================================
var CONFIG = {
    // ============ SITE IDENTITY ============
    SITE_NAME: "Abihani Express",
    SLOGAN: "MOM · DAD · UMMIHANI",
    FOOTER_TEXT: "Your perfect home for leather works",
    LOGO_URL: "https://hibpuvurlvkuqjawkqlu.supabase.co/storage/v1/object/public/images/logo.png",
    SITE_DOMAIN: "www.abihaniexpress.com.ng",
    SITE_URL: "https://www.abihaniexpress.com.ng",
    SOCIAL_SHARE_IMAGE: "https://hibpuvurlvkuqjawkqlu.supabase.co/storage/v1/object/public/images/social-share.jpg",
    
    // ============ COLORS ============
    PRIMARY_COLOR: "#b87c4f",
    BACKGROUND_COLOR: "#fdf9f5",
    TEXT_COLOR: "#2c2418",
    
    // ============ CONTACT ============
    WHATSAPP_NUMBER: "+2347067551684",
    CEO_EMAIL: "bayeroisa2003@gmail.com",
    CEO_WHATSAPP: "+2347067551684",
    CEO_PHONE: "07067551684",
    
    // ============ SOCIAL LINKS ============
    FACEBOOK_URL: "https://www.facebook.com/Abihaniisa",
    INSTAGRAM_URL: "https://www.instagram.com/abihani_isa",
    TWITTER_URL: "https://x.com/abihaniisa01",
    
    // ============ CEO IDENTITY ============
    CEO_NAME: "Abihani Isa",
    CEO_BIO: "Abihani Isa is the founder and CEO of Abihani Nig Ltd, the parent company under which Abihani Express — his brand for leather works — operates. He is also MD of AY FOOTIES, a bestselling author of The Symphony of Two Hearts and My Gifts to Dear Students, and currently pursuing a degree in Computer Science.",
    CEO_IMAGE: "https://hibpuvurlvkuqjawkqlu.supabase.co/storage/v1/object/public/images/ceo.jpeg",
    CEO_SECTION_IMAGE_LEFT: true,
    
    // ============ CEO SUPER ADMIN EMAILS ============
    ADMIN_CEO_EMAILS: ["bayeroisa2003@gmail.com", "abihaniisa@gmail.com", "mrsabihani@gmail.com"],
    
    // ============ ADMINISTRATORSHIP ============
    ADMIN_PRICE: "₦10,000",
    ADMIN_DURATION_MONTHS: 12,
    ADMIN_EXPIRY_WARNING_MONTHS: 3,
    ADMIN_EXPIRY_REASON: "Administratorship expired after the stipulated duration.",
    ADMIN_REJECT_REASON: "Due to unconfirmed payment.",
    ADMIN_PAYMENT_INFO: "Pay to: ISA BAYERO YAHYA | 07067551684 | OPAY",
    
    // ============ DASHBOARD LABELS ============
    DASHBOARD_WELCOME_CEO_ROLE: "CEO — FULL ACCESS",
    DASHBOARD_WELCOME_ADMIN_ROLE: "ADMINISTRATOR",
    DASHBOARD_WELCOME_CEO_SUBTITLE: "Managing Abihani Express — Supreme Control",
    DASHBOARD_WELCOME_ADMIN_SUBTITLE: "Managing Your Store — Abihani Express Partner",
    ADMIN_REQUESTS_SECTION_NAME: "📋 Administratorship Requests",
    ADMIN_PARTNERS_SECTION_NAME: "👥 Abihani Express Partners",
    ADMIN_GUIDE_TITLE: "📖 Admin Guide",
    ADMIN_GUIDE_FOOTER: "CEO Directive — Abihani Nig Ltd © 2026",
    ADMIN_ANNOUNCEMENT_SECTION: "📢 Announcement & Maintenance",
    
    DASHBOARD_TAB_PENDING: "Pending",
    DASHBOARD_TAB_APPROVED: "Approved",
    DASHBOARD_TAB_REJECTED: "Rejected",
    
    // ============ SETTINGS ============
    SETTINGS_TITLE: "⚙️ Settings",
    SETTINGS_BUSINESS_LABEL: "Business Name",
    SETTINGS_WHATSAPP_LABEL: "WhatsApp Number",
    SETTINGS_EMAIL_LABEL: "Email Address",
    SETTINGS_NEW_PASSWORD_LABEL: "New Password (leave empty to keep current)",
    SETTINGS_CURRENT_PASSWORD_LABEL: "Current Password (required to save)",
    SETTINGS_SAVE_BTN: "Save Changes",
    SETTINGS_SAVED: "Settings updated successfully!",
    SETTINGS_WRONG_PASSWORD: "Current password is incorrect.",
    SETTINGS_CEO_PASSWORD_LABEL: "New Password",
    
    // ============ CREATE ACCOUNT ============
    CREATE_ACCOUNT_TITLE: "Create Your Account",
    CREATE_ACCOUNT_SUBTITLE: "Set your password to activate your Administratorship account.",
    CREATE_ACCOUNT_EMAIL_LABEL: "Email Address (must be your approved email)",
    CREATE_ACCOUNT_PASSWORD_LABEL: "Create Password",
    CREATE_ACCOUNT_CONFIRM_LABEL: "Confirm Password",
    CREATE_ACCOUNT_BTN: "Create Account",
    CREATE_ACCOUNT_SUCCESS: "Account created successfully! You can now log in.",
    CREATE_ACCOUNT_EMAIL_NOT_APPROVED: "This email has not been granted Administratorship access on Abihani Express. To partner with us as an administrator, please visit the Admin Portal and apply for Administratorship.",
    CREATE_ACCOUNT_ALREADY_EXISTS: "An account with this email already exists. Please log in or reset your password.",
    CREATE_ACCOUNT_PASSWORD_MISMATCH: "Passwords do not match.",
    
    // ============ ADMIN LOGIN MESSAGES ============
    LOGIN_NO_ACCOUNT: "This email has not been granted Administratorship access on Abihani Express. To partner with us, please apply for Administratorship.",
    LOGIN_PENDING_PASSWORD: "Your Administratorship has been approved! Please create your account by clicking 'Create an account' below.",
    LOGIN_WRONG_PASSWORD: "Incorrect password. Please try again, or reset your password.",
    LOGIN_ACCOUNT_EXPIRED: "Your Administratorship has expired. Renew to continue enjoying partnership with Abihani Express.",
    LOGIN_ACCOUNT_FROZEN: "Your account has been suspended by Abihani Express. Please contact Abihani Express to restore your account.",
    LOGIN_CONTACT_CEO_HINT: "Go to Home → Contact to reach the CEO.",
    UI_CREATE_ACCOUNT_LINK: "Create an account",
    UI_APPLY_ADMIN_LINK: "Apply for Administratorship",
    
    // ============ BACK ARROW LABELS ============
    UI_BACK_TO_HOME: "← Back to Home",
    UI_BACK_TO_SHOP: "← Back to Shop",
    UI_BACK_TO_PROFILE: "← Back to Admin Portal",
    UI_BACK_TO_DASHBOARD: "← Back to Dashboard",
    
    // ============ MAINTENANCE MODE ============
    MAINTENANCE_MODE_ENABLED: false,
    MAINTENANCE_MODE_TITLE: "We're Crafting Something Special",
    MAINTENANCE_MODE_MESSAGE: "Abihani Express is currently undergoing a brief enhancement. We'll return shortly with an even finer collection of handcrafted leather goods. Thank you for your patience.",
    MAINTENANCE_MODE_BYPASS_PATH: "/admin",
    MAINTENANCE_MODE_SHOW_ANIMATION: true,
    MAINTENANCE_MODE_BACKGROUND_STYLE: "leather",
    MAINTENANCE_MODE_ADMIN_LINK_TEXT: "Administrator Access",
    MAINTENANCE_MODE_TOGGLE_NOTE: "When enabled, all visitors will see a full-screen maintenance display. To regain access, visit www.abihaniexpress.com.ng/admin to log in.",
    
    // ============ VIEWING ADMIN BANNER ============
    VIEWING_ADMIN_BANNER_PREFIX: "You are viewing",
    VIEWING_ADMIN_BANNER_SUFFIX: "store",
    VIEWING_ADMIN_RETURN_BUTTON: "← Return to your dashboard",
    VIEWING_ADMIN_INFO_TITLE: "Business Information",
    VIEWING_ADMIN_SEND_MESSAGE_LABEL: "Send Message to this Administrator",
    VIEWING_ADMIN_SEND_MESSAGE_PLACEHOLDER: "Type your message here...",
    VIEWING_ADMIN_SEND_MESSAGE_BUTTON: "Send Message",
    VIEWING_ADMIN_MESSAGE_SENT: "Message sent successfully!",
    VIEWING_ADMIN_LET_HIM_BUTTON: "Let Him Continue",
    VIEWING_ADMIN_FREEZE_BUTTON: "Freeze Account",
    VIEWING_ADMIN_UNFREEZE_BUTTON: "Unfreeze Account",
    VIEWING_ADMIN_FREEZE_PROMPT: "Reason for freezing (optional):",
    VIEWING_ADMIN_FROZEN_MESSAGE: "Your account has been frozen by Abihani Express. Please contact Abihani Express to unfreeze your account.",
    VIEWING_ADMIN_EXPIRED_LABEL: "EXPIRED",
    VIEWING_ADMIN_FROZEN_LABEL: "FROZEN",
    
    // ============ ADMIN APPLICATION FORM (NO PASSWORD) ============
    ADMIN_APP_HEADING: "Become an Administrator",
    ADMIN_APP_SUBHEADING: "Unlock the power to manage your own store, products, and categories. Join the leading leather e-commerce platform today.",
    ADMIN_APP_FEATURES: [
        "Create and manage your own product listings",
        "Upload unlimited product images",
        "Set your own prices and discounts",
        "Create custom categories and subcategories",
        "Get discovered by thousands of customers",
        "Boost your sales with vendor branding",
        "Direct WhatsApp contact with your buyers",
        "24/7 platform support"
    ],
    ADMIN_APP_SAFETY_NOTES: [
        "Abihani Express does not have access to your password. It is private.",
        "Abihani Express reserves the right to terminate Administratorship for policy violations.",
        "If your Administratorship is terminated without violation, contact the CEO with proof to restore it.",
        "Your Administratorship will auto-expire after the stipulated duration. You will be notified 3 months before expiry."
    ],
    ADMIN_APP_SUCCESS_TITLE: "Request Sent Successfully!",
    ADMIN_APP_SUCCESS_MESSAGE: "Your application has been submitted. You will receive an approval or rejection email. Please check your inbox regularly.",
    ADMIN_APP_SUCCESS_CLOSE_NOTE: "Send your payment receipt via WhatsApp to complete your application.",
    ADMIN_APP_APPROVED_EMAIL_NOTE: "Once approved, go to Admin Login and click 'Create an account' to set your password.",
    
    APP_FORM_NAME_LABEL: "Full Name *",
    APP_FORM_BUSINESS_LABEL: "Business Name *",
    APP_FORM_EMAIL_LABEL: "Email (will be your login) *",
    APP_FORM_WHATSAPP_LABEL: "WhatsApp Number *",
    APP_FORM_RECEIPT_LABEL: "Attach Payment Receipt (optional)",
    APP_FORM_SUBMIT_BUTTON: "Send Request",
    APP_FORM_PRICE_LABEL: "Price",
    APP_FORM_DURATION_LABEL: "per year",
    APP_FORM_EXPIRY_LABEL: "Expires",
    APP_FORM_PAYMENT_DETAILS_LABEL: "Payment Details",
    APP_FORM_SAFETY_TITLE: "Safety Notes",
    
    // ============ FORGOT PASSWORD ============
    UI_LOGIN_FORGOT: "Forgot your password? Reset it here",
    FORGOT_PASSWORD_TITLE: "Reset Your Password",
    FORGOT_PASSWORD_SUBTITLE: "Enter your registered email address. We'll send you a secure link to create a new password.",
    FORGOT_PASSWORD_PLACEHOLDER: "Enter your email address",
    FORGOT_PASSWORD_SEND_BTN: "Send Reset Link",
    FORGOT_PASSWORD_SUCCESS: "A secure reset link has been sent to your email. Please check your inbox and follow the instructions.",
    FORGOT_PASSWORD_ERROR: "We couldn't send the reset link. Please verify your email address and try again.",
    FORGOT_PASSWORD_CLOSE: "Close",
    
    // ============ HERO SLIDER ============
    SLIDES: [
        { title: "Welcome to Abihani Express", subtitle: "Your perfect home for leather works" },
        { title: "Quality & Durability", subtitle: "Premium leather goods from Yobe State — built to last a lifetime" },
        { title: "Proudly Nigerian, Globally Exceptional", subtitle: "Supporting local artisans, delivering world-class leather since 2020" }
    ],
    
    NIGERIA_BADGE_TEXT: "Abihani Nig Ltd",
    
    // ============ TRUST BADGES ============
    TRUST_BADGES: [
        { icon: "fa-shield-alt", text: "Secure Checkout" },
        { icon: "fa-truck", text: "Free Delivery Over ₦50,000" },
        { icon: "fa-undo-alt", text: "7-Day Returns" },
        { icon: "fab fa-whatsapp", text: "24/7 WhatsApp Support" }
    ],
    
    ECO_HEADING: "Ethically Crafted, Sustainably Made",
    ECO_TEXT: "Every Abihani Express product is handcrafted with care for both people and the planet. We source our leather ethically, minimize waste, and support local communities through fair wages.",
    SUSTAIN_BADGES: [
        { icon: "fa-hand-holding-heart", text: "Fair Trade" },
        { icon: "fa-recycle", text: "Eco-Friendly" },
        { icon: "fa-users", text: "Local Artisans" }
    ],
    
    // ============ TESTIMONIALS ============
    TESTIMONIALS_HEADING: "❤️ What Our Customers Say",
    TESTIMONIALS: [
        { quote: "The quality of the leather shoes I received was exceptional. You can feel the craftsmanship in every stitch.", name: "Aisha Usman Garba", location: "Kano, Nigeria" },
        { quote: "Abihani Express delivered my custom bag in just two weeks. The attention to detail was remarkable.", name: "Ibrahim Muhammad Mustapha", location: "Abuja, Nigeria" },
        { quote: "As a business owner, their Administratorship program helped me reach customers I never could before.", name: "Khalid Yahaya Bayero", location: "Lagos, Nigeria" },
        { quote: "I ordered sandals for my wedding and they were perfect. The fit, the finish, everything was world-class.", name: "Hani Abihani Isa", location: "Potiskum, Nigeria" },
        { quote: "Best leather belt I've ever owned. Two years and it still looks brand new. This is Nigerian excellence.", name: "Michael Peter", location: "Abuja, Nigeria" },
        { quote: "My wife loved the handbag I got her. She uses it every day and it still looks beautiful.", name: "Abdullahi Sani", location: "Kaduna, Nigeria" },
        { quote: "The custom order process was smooth. They understood exactly what I wanted and delivered beyond expectations.", name: "Zainab Musa", location: "Yobe, Nigeria" },
        { quote: "I've been buying leather goods for 20 years. Abihani Express matches international quality at Nigerian prices.", name: "Yusuf Ibrahim", location: "Maiduguri, Nigeria" },
        { quote: "Their customer service is unmatched. I had an issue with sizing and they resolved it within hours.", name: "Maryam Abubakar", location: "Sokoto, Nigeria" },
        { quote: "Proudly Nigerian, globally exceptional. That's not just a slogan — it's the truth.", name: "Ummihani Isa", location: "Potiskum, Nigeria" }
    ],
    
    // ============ MASTER ARTISAN ============
    ARTISAN_NAME: "Adamu Yahaya (AYFOOTIES)",
    ARTISAN_SHORT_STORY: "With over 15 years of leather crafting experience, Adamu Yahaya leads our workshop in Potiskum, Yobe State. He is the founder and CEO of AY FOOTIES — the seed that grew into our ultimate vision, Abihani Nig Ltd.",
    ARTISAN_FULL_STORY: "Adamu Yahaya, widely known in the leather crafting community as AYFOOTIES, began his journey as a young, talented apprentice in Jos, Plateau State. Over one and a half decades, he mastered the art of handcrafting leather goods — blending traditional Hausa techniques with contemporary design. Every stitch, every cut, every finish reflects his relentless dedication to perfection. Today, he is the founder and CEO of AYFOOTIES — a world-class skin leather brand that gave birth to Abihani Nig Ltd, our giant e-commerce platform for premium leather works. From his workshop in Potiskum, Adamu mentors the next generation of artisans while creating exceptional products for customers across the globe.",
    ARTISAN_IMAGE: "https://hibpuvurlvkuqjawkqlu.supabase.co/storage/v1/object/public/images/masterartisan2.jpg",
    ARTISAN_WHATSAPP: "08168867633",
    ARTISAN_LEARN_MORE_BUTTON: "Learn More →",
    ARTISAN_BADGE_TEXT: "✨ Master Artisan ✨",
    ARTISAN_POPUP_CONTACT_TEXT: "Contact",
    
    // ============ ABOUT & MISSION ============
    WHO_WE_ARE: "We are the first and leading online store in Yobe State specializing in everything leather works. Quality and durability is our promise.",
    OUR_MISSION: "To provide affordable, durable, and stylish leather products while supporting local artisans and growing the community economy.",
    
    // ============ BOOKS ============
    BOOKS_SECTION_TITLE: "📚 Books by Abihani Isa",
    BOOKS: [
        {
            title: "My Gifts to Dear Students", author: "Abihani Isa", price: "FREE",
            cover: "https://hibpuvurlvkuqjawkqlu.supabase.co/storage/v1/object/public/images/books/gifts-front.jpg",
            pdfUrl: "https://hibpuvurlvkuqjawkqlu.supabase.co/storage/v1/object/public/images/books/GUZIRINA_GA_YAN_MAKARANTA.pdf",
            isFree: true, synopsis: "A collection of heartfelt advice and wisdom for students navigating life, faith, and education."
        },
        {
            title: "The Symphony of Two Hearts", author: "Abihani Isa", price: "₦1,500",
            cover: "https://hibpuvurlvkuqjawkqlu.supabase.co/storage/v1/object/public/images/books/symphony-front.jpg",
            isFree: false,
            synopsis: "The Symphony of Two Hearts is an inspiring story that chronicles the journey of Abihani Isa, a brilliant graduate student with big dreams, and Ummihani, a compassionate soul with unwavering faith. Their paths cross in a way that only destiny could orchestrate.",
            waMessage: 'Hello Abihani Express, I want to purchase "The Symphony of Two Hearts" for ₦1,500.'
        }
    ],
    
    // ============ CUSTOM ORDER FORM ============
    CUSTOM_ORDER_TITLE: "Custom Order Request",
    CUSTOM_ORDER_SUBTITLE: "Fill this form and we will WhatsApp you within minutes to confirm.",
    CUSTOM_ORDER_OPTIONAL_LABEL: "(Optional)",
    CUSTOM_ORDER_FIELDS: [
        { label: "Full Name", type: "text", required: true, placeholder: "Enter your full name" },
        { label: "Phone Number", type: "tel", required: false, placeholder: "08012345678" },
        { label: "Email", type: "email", required: false, placeholder: "you@example.com" },
        { label: "Product Type", type: "text", required: true, placeholder: "e.g., Shoes, Bag, Belt" },
        { label: "Delivery Deadline", type: "text", required: false, placeholder: "e.g., 2 weeks" },
        { label: "Description", type: "textarea", required: true, placeholder: "Describe exactly what you want and we will strive to make it for you" }
    ],
    
    // ============ TERMS & PRIVACY ============
    TERMS_TITLE: "Terms and Conditions",
    TERMS_TEXT: "<p>1. By using this platform, you agree to these terms.</p><p>2. All products are handcrafted and may have slight variations.</p><p>3. Prices are in Nigerian Naira (₦).</p><p>4. Administratorship is subject to approval and may be terminated for policy violations.</p>",
    PRIVACY_TITLE: "Privacy Policy",
    PRIVACY_TEXT: "<p>We collect only necessary information to process your orders and improve our service.</p><p>Your data is never sold to third parties.</p><p>Passwords are encrypted and not visible to anyone, including Abihani Express staff.</p>",
    
    // ============ EMAIL TEMPLATES ============
    APPROVAL_EMAIL_SUBJECT: "Welcome to Abihani Express — Your Administratorship Has Been Approved",
    APPROVAL_EMAIL_BODY: "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fdf9f5;'><div style='text-align:center;padding:20px 0;'><h1 style='color:#b87c4f;font-family:Georgia,serif;font-size:28px;margin:0;'>Abihani Express</h1><p style='color:#6b5a4a;font-size:13px;margin:4px 0 0;'>Your perfect home for leather works</p></div><div style='background:#fff;border-radius:12px;padding:24px;border:1px solid #e8dfd6;'><h2 style='color:#27ae60;font-size:20px;margin:0 0 16px;'>🎉 Congratulations, {name}!</h2><p style='color:#2c2418;font-size:15px;line-height:1.6;'>Your application to become an Abihani Express Administrator for <strong>{business}</strong> has been <strong style='color:#27ae60;'>approved</strong>.</p><div style='background:#fef9f0;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #b87c4f;'><p><strong>🔐 Next Step:</strong> Go to Admin Login and click <strong>'Create an account'</strong> to set your password and activate your store.</p><p><strong>🌐 Visit:</strong> <a href='https://www.abihaniexpress.com.ng/#admin-login'>Abihani Express Admin Login</a></p><p><strong>📅 Valid Until:</strong> {expiry}</p></div><p>🛡️ <em>Your password is strictly private.</em></p><p>Welcome to Nigeria's leading leather e-commerce platform.</p><p>Warm regards,<br><strong>Abihani Isa</strong><br>Founder & CEO, Abihani Nig Ltd</p></div></div>",
    REJECTION_EMAIL_SUBJECT: "Update Regarding Your Abihani Express Administratorship Application",
    REJECTION_EMAIL_BODY: "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fdf9f5;'><div style='text-align:center;padding:20px 0;'><h1 style='color:#b87c4f;font-family:Georgia,serif;font-size:28px;margin:0;'>Abihani Express</h1></div><div style='background:#fff;border-radius:12px;padding:24px;'><h2 style='color:#2c2418;'>Application Update</h2><p>Dear {name},</p><p>Your application for <strong>{business}</strong> was not approved at this time.</p><p><strong>Reason:</strong> {reason}</p><p>If you believe there has been an error, please reach out via WhatsApp.</p><p>Respectfully,<br><strong>Abihani Isa</strong></p></div></div>",
    CONFIRMATION_EMAIL_SUBJECT: "We've Received Your Abihani Express Administratorship Application",
    CONFIRMATION_EMAIL_BODY: "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fdf9f5;'><div style='text-align:center;padding:20px 0;'><h1 style='color:#b87c4f;font-family:Georgia,serif;font-size:28px;margin:0;'>Abihani Express</h1></div><div style='background:#fff;border-radius:12px;padding:24px;'><h2>Application Received</h2><p>Dear {name},</p><p>Your application for <strong>{business}</strong> has been received and is under review.</p><p><strong>📋 Next Step:</strong> Send your payment receipt of <strong>₦10,000</strong> via WhatsApp to <strong>+234 706 755 1684</strong>.</p><p>Kind regards,<br><strong>Abihani Isa</strong></p></div></div>",
    MESSAGE_EMAIL_SUBJECT: "You Have a New Message from Abihani Express",
    MESSAGE_EMAIL_BODY: "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fdf9f5;'><div style='text-align:center;padding:20px 0;'><h1 style='color:#b87c4f;font-family:Georgia,serif;font-size:28px;margin:0;'>Abihani Express</h1></div><div style='background:#fff;border-radius:12px;padding:24px;'><h2>📬 Message from Management</h2><p>Dear {name},</p><div style='background:#f5efe8;padding:16px;border-radius:8px;margin:16px 0;'>{message}</div><p>Best regards,<br><strong>Abihani Isa</strong></p></div></div>",
    FREEZE_EMAIL_SUBJECT: "Important Notice Regarding Your Abihani Express Account",
    FREEZE_EMAIL_BODY: "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fdf9f5;'><div style='text-align:center;padding:20px 0;'><h1 style='color:#b87c4f;font-family:Georgia,serif;font-size:28px;margin:0;'>Abihani Express</h1></div><div style='background:#fff;border-radius:12px;padding:24px;'><h2 style='color:#2980b9;'>Account Status Update</h2><p>Dear {name},</p><p>Your account has been temporarily suspended.</p><p><strong>Reason:</strong> {reason}</p><p>To resolve this, contact us via WhatsApp at <strong>+234 706 755 1684</strong>.</p><p>Respectfully,<br><strong>Abihani Isa</strong></p></div></div>",
    UNFREEZE_EMAIL_SUBJECT: "Your Abihani Express Account Has Been Restored",
    UNFREEZE_EMAIL_BODY: "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#fdf9f5;'><div style='text-align:center;padding:20px 0;'><h1 style='color:#b87c4f;font-family:Georgia,serif;font-size:28px;margin:0;'>Abihani Express</h1></div><div style='background:#fff;border-radius:12px;padding:24px;'><h2 style='color:#27ae60;'>Account Restored</h2><p>Dear {name},</p><p>Your account has been restored. You may now log in.</p><p>Warm regards,<br><strong>Abihani Isa</strong></p></div></div>",
    
    // ============ PRODUCT DEFAULTS ============
    PRODUCT_DEFAULT_RATING: 4.5,
    PRODUCT_DEFAULT_STOCK: 10,
    PRODUCT_DEFAULT_VENDOR: "Abihani Express",
    PRODUCT_DEFAULT_LOCATION: "Potiskum, Yobe State",
    PRODUCT_DEFAULT_ICON: "📦",
    CATEGORY_DEFAULT_ICON: "📦",
    
    // ============ ENHANCEMENT TOGGLES ============
    ENHANCEMENT_SMOOTH_TRANSITIONS: true,
    ENHANCEMENT_HERO_PARALLAX: true,
    ENHANCEMENT_BACK_TO_TOP_BOUNCE: true,
    ENHANCEMENT_ANIMATED_EMPTY_STATES: true,
    ENHANCEMENT_PRODUCT_CARD_GLOW: true,
    ENHANCEMENT_WARMER_SHIMMER: true,
    ENHANCEMENT_FOOTER_DIVIDER: true,
    ENHANCEMENT_CATEGORY_SNAP: true,
    ENHANCEMENT_TESTIMONIAL_CROSSFADE: true,
    ENHANCEMENT_CUSTOM_SCROLLBAR: true,
    ENHANCEMENT_DARK_MODE_TEXT_FIX: true,
    
    FEATURED_PRODUCTS_DISPLAY_COUNT: 8,
    SIDE_IMAGES_MAX_REGULAR: 2,
    SIDE_IMAGES_MAX_CEO: 99,
    
    // ============ RELATED PRODUCTS ============
    UI_RELATED_PRODUCTS_HEADING: "You May Also Like",
    UI_RELATED_PRODUCTS_COUNT: 6,
    PRODUCT_DETAIL_SHOW_BREADCRUMB: true,
    PRODUCT_DETAIL_SHOW_RELATED: true,
    PRODUCT_DETAIL_SHOW_SHARE: true,
    
    // ============ SHARE BUTTON ============
    UI_SHARE_BUTTON: "Share",
    UI_SHARE_COPY_LINK: "Copy Link",
    UI_SHARE_LINK_COPIED: "Link copied!",
    UI_SHARE_WHATSAPP: "Share via WhatsApp",
    
    SEARCH_INCLUDE_CATEGORIES: true,
    SEARCH_INCLUDE_DESCRIPTIONS: true,
    
    // ============ MOCK DATA GENERATOR (ON BY DEFAULT) ============
    MOCK_DATA_ENABLED: true,
    MOCK_DATA_PRODUCT_COUNT: 20,
    MOCK_DATA_FEATURE_PERCENT: 25,
    MOCK_DATA_CATEGORIES: [
        { name: "👞 Men's Footwear", emoji: "👞" },
        { name: "👢 Women's Footwear", emoji: "👢" },
        { name: "👜 Bags & Wallets", emoji: "👜" },
        { name: "👡 Sandals & Slippers", emoji: "👡" },
        { name: "💼 Briefcases", emoji: "💼" },
        { name: "👑 Luxury Collection", emoji: "👑" },
        { name: "🎒 Backpacks", emoji: "🎒" },
        { name: "🧥 Leather Jackets", emoji: "🧥" },
        { name: "👝 Pouches & Clutches", emoji: "👝" },
        { name: "🎁 Gift Sets", emoji: "🎁" }
    ],
    MOCK_DATA_SUBCATEGORIES: [
        { name: "Classic", categoryIndex: 0 }, { name: "Modern", categoryIndex: 0 }, { name: "Premium", categoryIndex: 0 },
        { name: "Heels", categoryIndex: 1 }, { name: "Flats", categoryIndex: 1 },
        { name: "Tote Bags", categoryIndex: 2 }, { name: "Wallets", categoryIndex: 2 },
        { name: "Beach Sandals", categoryIndex: 3 }, { name: "Office Slippers", categoryIndex: 3 },
        { name: "Executive", categoryIndex: 4 }, { name: "Travel", categoryIndex: 4 },
        { name: "Designer", categoryIndex: 5 }, { name: "Limited Edition", categoryIndex: 5 },
        { name: "School", categoryIndex: 6 }, { name: "Hiking", categoryIndex: 6 },
        { name: "Bomber", categoryIndex: 7 }, { name: "Blazer", categoryIndex: 7 },
        { name: "Evening", categoryIndex: 8 }, { name: "Casual", categoryIndex: 8 },
        { name: "Wedding", categoryIndex: 9 }, { name: "Corporate", categoryIndex: 9 }
    ],
    MOCK_PRODUCT_NAMES: [
        "Premium Handcrafted Leather Loafers", "Classic Brown Derby Shoes", "Elegant Black Oxford",
        "Hand-Stitched Moccasins", "Royal Leather Sandals", "Artisan Woven Slides",
        "Vintage Leather Tote", "Compact Bifold Wallet", "Slim Card Holder",
        "Executive Briefcase", "Luxury Travel Duffle", "Designer Crossbody Bag",
        "Leather Backpack Classic", "Double Stitch Belt", "Premium Watch Strap",
        "Leather Key Holder", "Embossed Journal Cover", "Handcrafted Phone Case",
        "Beaded Leather Slippers", "Traditional Hausa Sandals", "Modern Ankara Slides",
        "Corporate Laptop Bag", "Leather Portfolio Folder", "Weekend Getaway Bag",
        "Premium Gift Box Set", "Bridal Leather Clutch", "Groom's Leather Set",
        "Classic Driving Loafers", "Italian Style Monk Strap", "Braided Leather Belt",
        "Studded Leather Cuff", "Minimalist Leather Satchel", "Vintage Messenger Bag",
        "Hand-Dyed Moroccan Slides", "Leather Coasters Set", "Desk Organizer Leather",
        "Travel Passport Holder", "Leather Luggage Tag", "Cable Organizer Pouch",
        "Executive Pen Holder", "Leather Valet Tray", "Heavy Duty Tool Pouch",
        "Artisan Leather Apron", "Traditional Fulani Bag", "Modern Laptop Sleeve",
        "Adjustable Camera Strap", "Leather Dog Collar", "Premium Guitar Strap"
    ],
    MOCK_DATA_ICONS: ["📦","👞","👢","👜","👡","💼","👑","🎒","🧥","👝","🎁","💎","✨","🔥","🌟","💫","🛍️","🎯","🏆","🔖"],
    MOCK_DATA_TOAST_TITLE: "Mock Product",
    MOCK_DATA_TOAST_MESSAGE: "This is a mock product for display purposes only. Real products coming soon.",
    MOCK_DATA_TOAST_FOOTER: "— CEO Directives, Abihani Isa",
    MOCK_DATA_TOAST_CLOSE: "Close",
    
    // ============ UI TEXT ============
    UI_ANNOUNCEMENT_DEFAULT: "🎉 NEW: Handcrafted Leather Collection just dropped! Free delivery on orders over ₦50,000 🎉",
    UI_NO_FEATURED_PRODUCTS: "No featured products yet — check back soon!",
    UI_NO_PRODUCTS_FOUND: "No products found in this category.",
    UI_NO_SEARCH_RESULTS: "No products found.",
    UI_SEARCH_PLACEHOLDER: "Search by name, category, or description...",
    UI_BUY_NOW: "Buy Now",
    UI_BUY_VIA_WHATSAPP: "Buy Now via WhatsApp",
    UI_BACK_TO_PRODUCTS: "← Back to Products",
    UI_EXPLORE_COLLECTION: "Explore Collection",
    UI_CUSTOM_ORDER: "Custom Order",
    UI_SEE_ALL: "See all →",
    UI_SHOP_BY_CATEGORIES: "Shop by Categories",
    UI_FEATURED_PRODUCTS: "⭐ Featured Products",
    UI_ALL_PRODUCTS: "All Products",
    UI_OUR_MISSION: "Our Mission",
    UI_MEET_CEO: "Meet Abihani Isa",
    UI_ABOUT_LOGO_TITLE: "Abihani Express",
    UI_ABOUT_LOGO_TEXT: "We are the first and leading online store in Yobe State specializing in everything leather works. Quality and durability is our promise.",
    UI_FOOTER_BRAND: "Abihani Express",
    UI_FOOTER_ABOUT: "About",
    UI_FOOTER_TERMS: "Terms",
    UI_FOOTER_PRIVACY: "Privacy",
    UI_FOOTER_CONTACT: "Feedback & Contact",
    UI_FOOTER_COPYRIGHT: "Abihani Express © 2026. All rights reserved.",
    UI_PROFILE_HEADING: "Admin Portal",
    UI_PROFILE_SUBHEADING: "Only for Abihani Express administrators",
    UI_PROFILE_LOGIN_BTN: "🔐 Admin Login",
    UI_PROFILE_NO_ACCOUNT: "Don't have an account yet?",
    UI_PROFILE_APPLY_BTN: "📝 Apply for Administratorship",
    UI_PROFILE_PRICE_NOTE: "Get your own store — just ₦10,000/year",
    UI_LOGIN_HEADING: "🔐 Admin Portal",
    UI_LOGIN_BTN: "Log In",
    UI_DASHBOARD_HEADING: "👑 Admin Dashboard",
    UI_DASHBOARD_LOGOUT: "Logout",
    UI_ADD_PRODUCT: "Add Product",
    UI_ADD_CATEGORY: "Add Category",
    UI_SAVE_PRODUCT: "Save Product",
    UI_SAVE_CATEGORY: "Save Category",
    UI_UPDATE_PRODUCT: "Update Product",
    UI_UPDATE_CATEGORY: "Update",
    UI_DELETE_CONFIRM_TITLE: "⚠️ Confirm Delete",
    UI_DELETE_CONFIRM_YES: "Yes, Delete",
    UI_DELETE_CONFIRM_NO: "Cancel",
    UI_CONTACT_HEADING: "📬 Contact & Feedback",
    UI_CONTACT_SEND: "Send feedback",
    UI_REMOVE_IMAGE: "✕",
    
    UI_MOCK_DATA_TITLE: "🎭 Mock Data Generator",
    UI_MOCK_DATA_ON: "ON",
    UI_MOCK_DATA_OFF: "OFF",
    UI_MOCK_DATA_COUNT_LABEL: "Number of products:",
    UI_MOCK_DATA_RANDOMIZE: "🎲 Randomize",
    UI_MOCK_DATA_ACTIVE: "Mock data is active —",
    UI_MOCK_DATA_PRODUCTS: "products displaying",
    UI_MOCK_DATA_CEO_ONLY: "Only CEO can control mock data",
    
    UI_SIDE_IMAGES_LABEL: "Side Images (Optional)",
    UI_SIDE_IMAGES_ADD_MORE: "+ Add Another Image",
    UI_SIDE_IMAGES_SELECTED: "Selected:",
    UI_SIDE_IMAGES_LIMIT_REGULAR: "Maximum 2 side images for regular administrators",
    UI_SIDE_IMAGES_LIMIT_CEO: "Unlimited side images for CEO",
    
    PROFILE_APP_STATUS_CARD_TITLE: "📋 Your Administratorship Application",
    PROFILE_APP_STATUS_PENDING: "⏳ Pending Review",
    PROFILE_APP_STATUS_APPROVED: "✅ Approved — Create your account to get started!",
    PROFILE_APP_STATUS_REJECTED: "❌ Rejected",
    PROFILE_APP_SEND_RECEIPT_TEXT: "If you've paid, send your receipt:",
    PROFILE_APP_SEND_RECEIPT_BTN: "Send Receipt",
    PROFILE_APP_CLOSE_BTN: "Close",
    PROFILE_APP_NOTE: "You can also send your receipt anytime through Home → Contact.",
    APP_STATUS_OWNER_ONLY: true,

// ============ EMAIL CENTER ============
UI_EMAIL_CENTER_TITLE: "✉️ Email Center",
UI_EMAIL_CENTER_REGULAR_SUBTITLE: "Send a message to the CEO",
UI_EMAIL_CENTER_CEO_SUBTITLE: "Send professional emails from your custom domain",
UI_EMAIL_RECIPIENT_TYPE_PARTNER: "Registered Partner",
UI_EMAIL_RECIPIENT_TYPE_CUSTOM: "Custom Email",
UI_EMAIL_SEARCH_PARTNER: "Search partner by business name...",
UI_EMAIL_CUSTOM_RECIPIENT: "Recipient Email Address",
UI_EMAIL_SUBJECT: "Subject",
UI_EMAIL_MESSAGE: "Message",
UI_EMAIL_SEND_BTN: "Send Email",
UI_EMAIL_SENT: "Email sent successfully!",
UI_EMAIL_NO_RECIPIENT: "Please select a partner or enter an email address.",
UI_EMAIL_NO_SUBJECT: "Please enter a subject.",
UI_EMAIL_NO_MESSAGE: "Please enter a message.",
UI_EMAIL_CEO_FOOTER: "Abihani Isa\nFounder & CEO, Abihani Nig Ltd\nwww.abihaniexpress.com.ng"
};
