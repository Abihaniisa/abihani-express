-- Drop existing policies
DROP POLICY IF EXISTS "Public Access for images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload to images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Update to images bucket" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete from images bucket" ON storage.objects;

-- Drop existing tables
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS subcategories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS admin_applications CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create tables
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL DEFAULT '',
    business_name TEXT NOT NULL DEFAULT '',
    whatsapp TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'admin',
    status TEXT NOT NULL DEFAULT 'pending_password',
    expiry_date TIMESTAMPTZ,
    frozen_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE admin_applications (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    business_name TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    password_hash TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    reject_reason TEXT,
    rejected_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approval_note TEXT,
    expiry_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '📦',
    sort_order INTEGER NOT NULL DEFAULT 0,
    owner_email TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subcategories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
    owner_email TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    subcategory_id BIGINT REFERENCES subcategories(id) ON DELETE SET NULL,
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    image_urls TEXT DEFAULT '[]',
    image_icon TEXT DEFAULT '📦',
    rating REAL DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    stock_quantity INTEGER DEFAULT 10,
    discount_percent INTEGER DEFAULT 0,
    vendor TEXT DEFAULT 'Abihani Express',
    location TEXT DEFAULT 'Potiskum, Yobe State',
    featured BOOLEAN DEFAULT false,
    owner_email TEXT NOT NULL DEFAULT '',
    owner_whatsapp TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE site_settings (
    id BIGSERIAL PRIMARY KEY,
    announcement_text TEXT DEFAULT '',
    mock_data_enabled BOOLEAN DEFAULT true,
    mock_data_count INTEGER DEFAULT 20,
    maintenance_mode BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE feedback (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Anonymous',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    from_ceo TEXT NOT NULL,
    to_admin_email TEXT NOT NULL,
    message TEXT NOT NULL,
    seen BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default data
INSERT INTO site_settings (id, announcement_text, mock_data_enabled, mock_data_count, maintenance_mode)
VALUES (1, '', true, 20, false)
ON CONFLICT (id) DO UPDATE SET mock_data_enabled = true, maintenance_mode = false;

INSERT INTO admins (email, password_hash, name, business_name, whatsapp, role, status)
VALUES
    ('bayeroisa2003@gmail.com', '', 'Abihani Isa', 'Abihani Express', '+2347067551684', 'Owner', 'active'),
    ('abihaniisa@gmail.com', '', 'Abihani Isa', 'Abihani Express', '+2347067551684', 'Owner', 'active'),
    ('mrsabihani@gmail.com', '', 'Mrs. Abihani - Aisha Usman Garba', 'Abihani Express', '+2347067551684', 'Owner', 'active')
ON CONFLICT (email) DO NOTHING;

-- Disable RLS
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE admin_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Storage policies
CREATE POLICY "Public Access for images bucket" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Public Upload to images bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "Public Update to images bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
CREATE POLICY "Public Delete from images bucket" ON storage.objects FOR DELETE USING (bucket_id = 'images');