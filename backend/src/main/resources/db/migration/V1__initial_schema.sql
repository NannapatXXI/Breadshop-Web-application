-- ============================================================
-- V1__initial_schema.sql
-- [Claude] Initial schema สำหรับ BreadShop XXI
--
-- ⚠️  ไฟล์นี้คือ BASELINE — Flyway จะไม่รันไฟล์นี้จริงๆ
--     (เพราะตั้ง baseline-on-migrate=true, baseline-version=1)
--     ใช้เป็นเอกสารอ้างอิง schema ณ จุดเริ่มต้นใช้ Flyway เท่านั้น
--
-- การแก้ schema ในอนาคต → สร้าง V2__*.sql, V3__*.sql ต่อไปเรื่อยๆ
-- ตัวอย่าง:
--   V2__add_sku_to_products.sql      → ALTER TABLE products ADD COLUMN sku VARCHAR(100);
--   V3__add_auth_type_to_users.sql   → เพิ่มตาราง auth_type ตาม Detail.md
-- ============================================================


-- ─── 1. usersapp ─────────────────────────────────────────────
-- ตาราง user หลัก (ชื่อ usersapp เพื่อหลีกเลี่ยง reserved word "users")
-- provider: "credentials" = สมัครปกติ, "google" = Google Login
CREATE TABLE IF NOT EXISTS usersapp (
    id           INT           AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(255)  NOT NULL UNIQUE,
    email        VARCHAR(255)  NOT NULL UNIQUE,
    password     VARCHAR(255)  NOT NULL,
    provider     VARCHAR(100),
    role         VARCHAR(50)   NOT NULL DEFAULT 'USER',
    created_at   DATETIME(6)   NOT NULL,
    updated_at   DATETIME(6)   NOT NULL,
    last_login_at DATETIME(6)
);


-- ─── 2. products ─────────────────────────────────────────────
-- category ใช้ ENUM string: BREAD, CAKE, COOKIE, DRINK
-- price ใช้ DECIMAL แทน DOUBLE เพื่อความแม่นยำทางการเงิน
CREATE TABLE IF NOT EXISTS products (
    id           BIGINT        AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(255)  NOT NULL,
    price        DECIMAL(10,2) NOT NULL,
    stock        INT           NOT NULL,
    description  VARCHAR(1000),
    image_url    VARCHAR(255),
    category     VARCHAR(50)   NOT NULL,
    expiry_date  DATE,
    created_at   DATETIME(6)   NOT NULL,
    updated_at   DATETIME(6)   NOT NULL
);


-- ─── 3. user_addresses ───────────────────────────────────────
-- ที่อยู่จัดส่ง user แต่ละคนมีได้หลายที่อยู่
-- is_default: 1 คน มี default ได้แค่ 1 ที่อยู่ (enforce ใน UserAddressService)
CREATE TABLE IF NOT EXISTS user_addresses (
    id             INT           AUTO_INCREMENT PRIMARY KEY,
    user_id        INT           NOT NULL,
    name           VARCHAR(255)  NOT NULL,        -- ชื่อเรียก เช่น "บ้าน"
    recipient_name VARCHAR(255)  NOT NULL,        -- ชื่อผู้รับ
    phone          VARCHAR(20)   NOT NULL,
    address        TEXT          NOT NULL,        -- บ้านเลขที่ ถนน ซอย
    province       VARCHAR(100)  NOT NULL,
    district       VARCHAR(100)  NOT NULL,
    subdistrict    VARCHAR(100)  NOT NULL,
    postcode       VARCHAR(10)   NOT NULL,
    is_default     TINYINT(1)    NOT NULL DEFAULT 0,
    created_at     DATETIME(6)   NOT NULL,
    updated_at     DATETIME(6)   NOT NULL,
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES usersapp(id) ON DELETE CASCADE
);


-- ─── 4. promotions ───────────────────────────────────────────
-- discount_type: FIXED (ลดคงที่) หรือ PERCENT (ลด %)
-- max_discount: ใช้กับ PERCENT เพื่อกำหนด cap สูงสุด
CREATE TABLE IF NOT EXISTS promotions (
    id               INT           AUTO_INCREMENT PRIMARY KEY,
    code             VARCHAR(50)   NOT NULL UNIQUE,
    name             VARCHAR(255)  NOT NULL,
    discount_type    VARCHAR(20)   NOT NULL,       -- FIXED | PERCENT
    discount_value   DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(12,2),
    max_discount     DECIMAL(12,2),
    usage_limit      INT,
    used_count       INT           NOT NULL DEFAULT 0,
    started_at       DATETIME(6)   NOT NULL,
    expired_at       DATETIME(6)   NOT NULL,
    is_active        TINYINT(1)    NOT NULL DEFAULT 1,
    created_at       DATETIME(6)   NOT NULL
);


-- ─── 5. orders ───────────────────────────────────────────────
-- shipping_* คือ snapshot ที่อยู่ตอนสั่ง (ห้ามแก้ไขหลัง order confirm)
-- address_id เก็บไว้เพื่ออ้างอิง แต่ถ้า address ถูกลบ ข้อมูล shipping_* ยังอยู่
CREATE TABLE IF NOT EXISTS orders (
    id                  INT           AUTO_INCREMENT PRIMARY KEY,
    order_no            VARCHAR(50)   NOT NULL UNIQUE,
    user_id             INT           NOT NULL,
    address_id          INT,                       -- nullable: ถ้า address ถูกลบ
    promotion_id        INT,
    promotion_code      VARCHAR(50),
    shipping_name       VARCHAR(255)  NOT NULL,
    shipping_phone      VARCHAR(20)   NOT NULL,
    shipping_address    TEXT          NOT NULL,
    shipping_province   VARCHAR(100)  NOT NULL,
    shipping_district   VARCHAR(100)  NOT NULL,
    shipping_subdistrict VARCHAR(100) NOT NULL,
    shipping_postcode   VARCHAR(10)   NOT NULL,
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    shipping_fee        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status              VARCHAR(20)   NOT NULL DEFAULT 'PENDING',
    tracking_no         VARCHAR(100),
    note                TEXT,
    created_at          DATETIME(6)   NOT NULL,
    updated_at          DATETIME(6)   NOT NULL,
    CONSTRAINT fk_orders_user      FOREIGN KEY (user_id)      REFERENCES usersapp(id),
    CONSTRAINT fk_orders_address   FOREIGN KEY (address_id)   REFERENCES user_addresses(id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL
);


-- ─── 6. order_lines ──────────────────────────────────────────
-- 1 order มีหลาย line (แต่ละสินค้า = 1 line)
-- product_name/product_sku คือ snapshot ตอนสั่ง (ป้องกัน product ถูกแก้ไขทีหลัง)
CREATE TABLE IF NOT EXISTS order_lines (
    id              INT           AUTO_INCREMENT PRIMARY KEY,
    order_id        INT           NOT NULL,
    product_id      BIGINT        NOT NULL,
    product_name    VARCHAR(255)  NOT NULL,        -- snapshot
    product_sku     VARCHAR(100),                  -- snapshot (optional)
    unit_price      DECIMAL(12,2) NOT NULL,
    quantity        INT           NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_price     DECIMAL(12,2) NOT NULL,
    created_at      DATETIME(6)   NOT NULL,
    CONSTRAINT fk_order_lines_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_order_lines_product FOREIGN KEY (product_id) REFERENCES products(id)
);


-- ─── 7. refresh_tokens ───────────────────────────────────────
-- เก็บ refresh token แต่ละตัวที่ออกให้ user
-- revoked = true หมายถึงถูก logout หรือ rotate แล้ว
-- Cleanup job ลบ token ที่หมดอายุทุก 1 ชั่วโมง (RefreshTokenCleanupJob.java)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT        AUTO_INCREMENT PRIMARY KEY,
    user_id     INT           NOT NULL,
    token       VARCHAR(512)  NOT NULL UNIQUE,
    expires_at  DATETIME(6)   NOT NULL,
    revoked     TINYINT(1)    NOT NULL DEFAULT 0,
    created_at  DATETIME(6),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES usersapp(id) ON DELETE CASCADE
);


-- ─── 8. email_otp ────────────────────────────────────────────
-- OTP สำหรับ reset password / verify email
-- purpose: RESET_PASSWORD | VERIFY_EMAIL
-- otp_hash: hash ของ OTP จริง (ไม่เก็บ plain text)
-- token: UUID ที่คืนให้ frontend ใช้อ้างอิง session นี้
-- Cleanup job ลบ OTP ที่หมดอายุทุกชั่วโมง (OtpCleanupJob.java)
CREATE TABLE IF NOT EXISTS email_otp (
    id            BIGINT        AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255),
    otp_hash      VARCHAR(255),
    purpose       VARCHAR(50),
    expires_at    DATETIME(6),
    used          TINYINT(1)    NOT NULL DEFAULT 0,
    verified      TINYINT(1)    NOT NULL DEFAULT 0,
    token         VARCHAR(255),
    attempt_count INT           NOT NULL DEFAULT 0,
    created_at    DATETIME(6)
);
