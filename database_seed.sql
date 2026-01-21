-- Seed data for EcommerceFS2026 catalog demo
INSERT INTO categories (id, name, slug, active, created_at, updated_at)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Smartphones', 'smartphones', true, NOW(), NOW()),
    ('22222222-2222-2222-2222-222222222222', 'Notebooks', 'notebooks', true, NOW(), NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Audio', 'audio', true, NOW(), NOW()),
    ('44444444-4444-4444-4444-444444444444', 'Accesorios', 'accesorios', true, NOW(), NOW());

INSERT INTO products (id, name, description, brand, category_id, slug, active, created_at, updated_at)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'iPhone 15 Pro 256GB', 'Chip A17 Pro, cámara pro y titanio.', 'Apple', '11111111-1111-1111-1111-111111111111', 'iphone-15-pro-256', true, NOW(), NOW()),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Galaxy S24 Ultra 512GB', 'Pantalla 6.8" QHD, S Pen integrado.', 'Samsung', '11111111-1111-1111-1111-111111111111', 'galaxy-s24-ultra-512', true, NOW(), NOW()),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'MacBook Air M3 16GB', 'Ultraligera con chip M3 y batería todo el día.', 'Apple', '22222222-2222-2222-2222-222222222222', 'macbook-air-m3-16', true, NOW(), NOW()),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Lenovo ThinkPad X1 Carbon', 'Productividad premium y máxima portabilidad.', 'Lenovo', '22222222-2222-2222-2222-222222222222', 'thinkpad-x1-carbon', true, NOW(), NOW()),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Auriculares Sony WH-1000XM5', 'Cancelación de ruido líder y audio Hi-Res.', 'Sony', '33333333-3333-3333-3333-333333333333', 'sony-wh1000xm5', true, NOW(), NOW()),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Cargador USB-C 65W', 'Carga rápida para notebooks y smartphones.', 'Anker', '44444444-4444-4444-4444-444444444444', 'cargador-usb-c-65w', true, NOW(), NOW());

INSERT INTO product_variants (id, product_id, color, ram, storage, sku, price, stock_actual, stock_reserved, active, created_at, updated_at)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Titanio Natural', '8GB', '256GB', 'APL-IP15P-256-TN', 2150000, 12, 0, true, NOW(), NOW()),
    ('a2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Negro', '12GB', '512GB', 'SAM-S24U-512-BK', 2450000, 8, 1, true, NOW(), NOW()),
    ('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Gris Espacial', '16GB', '512GB', 'APL-MBA-M3-16-512', 2100000, 5, 0, true, NOW(), NOW()),
    ('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Negro', '16GB', '1TB', 'LEN-X1C-16-1TB', 2380000, 3, 0, true, NOW(), NOW()),
    ('a5555555-5555-5555-5555-555555555555', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Negro', 'N/A', 'N/A', 'SON-XM5-BK', 520000, 20, 0, true, NOW(), NOW()),
    ('a6666666-6666-6666-6666-666666666666', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'Blanco', 'N/A', 'N/A', 'ANK-65W-WH', 65000, 50, 0, true, NOW(), NOW());

INSERT INTO product_images (id, product_id, url, "order", alt_text, public_id, created_at, updated_at)
VALUES
    ('b1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'https://placehold.co/800x800?text=iPhone+15+Pro', 1, 'iPhone 15 Pro', null, NOW(), NOW()),
    ('b2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'https://placehold.co/800x800?text=Galaxy+S24+Ultra', 1, 'Galaxy S24 Ultra', null, NOW(), NOW()),
    ('b3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'https://placehold.co/800x800?text=MacBook+Air+M3', 1, 'MacBook Air M3', null, NOW(), NOW()),
    ('b4444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'https://placehold.co/800x800?text=Sony+XM5', 1, 'Sony WH-1000XM5', null, NOW(), NOW()),
    ('b5555555-5555-5555-5555-555555555555', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'https://placehold.co/800x800?text=Cargador+65W', 1, 'Cargador USB-C 65W', null, NOW(), NOW());

INSERT INTO promotions (id, name, description, type, value, code, starts_at, ends_at, active, combinable, created_at, updated_at)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Promo lanzamiento Apple', 'Descuento por lanzamiento iPhone 15 Pro.', 1, 10, null, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', true, false, NOW(), NOW()),
    ('c2222222-2222-2222-2222-222222222222', 'Promo audio', 'Descuento en auriculares premium.', 1, 15, null, NOW() - INTERVAL '2 days', NOW() + INTERVAL '15 days', true, false, NOW(), NOW());

INSERT INTO promotion_products (promotion_id, product_id)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    ('c2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');
