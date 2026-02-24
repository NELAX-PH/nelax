# Nelax Systems - Database Schema Documentation

## Overview

This document describes the database schema for Nelax Systems, a POS and inventory management platform for small businesses in the Philippines.

## Database Technology

- **Database**: PostgreSQL (managed by Supabase)
- **ORM**: Direct Supabase client
- **Migration**: Supabase Migrations

## Tables

### 1. profiles

Stores user profile information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'admin'
  plan TEXT DEFAULT 'lite', -- 'lite', 'pro'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_plan ON profiles(plan);
CREATE INDEX idx_profiles_deleted ON profiles(is_deleted);
```

### 2. stores

Represents business stores (e.g., sari-sari stores) owned by users.

```sql
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  business_type TEXT, -- 'sari-sari', 'mini-grocery', 'convenience', etc.
  opening_hours JSONB,
  logo_url TEXT,
  currency TEXT DEFAULT 'PHP',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE,
  CONSTRAINT stores_owner_id_key UNIQUE (owner_id)
);

-- Indexes
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_deleted ON stores(is_deleted);
```

### 3. products

Products available in stores.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  unit TEXT, -- 'piece', 'kg', 'liter', 'pack'
  cost_price DECIMAL(10, 2) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  max_stock_level INTEGER,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_deleted ON products(is_deleted);
```

### 4. suppliers

Product suppliers.

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_suppliers_store ON suppliers(store_id);
CREATE INDEX idx_suppliers_deleted ON suppliers(is_deleted);
```

### 5. sales

Sales transactions.

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  sale_date TIMESTAMPTZ DEFAULT NOW(),
  total_amount DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,
  profit DECIMAL(10, 2) GENERATED ALWAYS AS (total_amount - total_cost) STORED,
  payment_method TEXT, -- 'cash', 'gcash', 'maya', 'card'
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'refunded', 'voided'
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_sales_store ON sales(store_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sales_payment ON sales(payment_method);
CREATE INDEX idx_sales_deleted ON sales(is_deleted);
```

### 6. sale_items

Individual items in a sale.

```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  cost_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  cost_subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * cost_price) STORED,
  profit DECIMAL(10, 2) GENERATED ALWAYS AS (subtotal - cost_subtotal) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);
CREATE INDEX idx_sale_items_deleted ON sale_items(is_deleted);
```

### 7. inventory_movements

Tracks stock movements (in/out).

```sql
CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- 'purchase', 'sale', 'return', 'adjustment', 'transfer'
  quantity INTEGER NOT NULL,
  reference_id UUID, -- Links to sale, purchase, or adjustment
  reference_type TEXT, -- 'sale', 'purchase', 'adjustment'
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_inventory_store ON inventory_movements(store_id);
CREATE INDEX idx_inventory_product ON inventory_movements(product_id);
CREATE INDEX idx_inventory_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_date ON inventory_movements(created_at);
```

### 8. customers

Customer information (optional).

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  loyalty_points INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_customers_store ON customers(store_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_deleted ON customers(is_deleted);
```

### 9. reports

Generated reports (optional - for caching).

```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL, -- 'daily_sales', 'weekly_sales', 'inventory', 'profit_loss'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_store ON reports(store_id);
CREATE INDEX idx_reports_type ON reports(report_type);
CREATE INDEX idx_reports_period ON reports(period_start, period_end);
```

### 10. subscriptions

User subscription data.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL, -- 'lite', 'pro'
  status TEXT DEFAULT 'active', -- 'active', 'past_due', 'cancelled', 'expired'
  start_date DATE NOT NULL,
  end_date DATE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
-- Unique active subscription per user
CREATE UNIQUE INDEX idx_subscriptions_active ON subscriptions(user_id)
  WHERE status = 'active';
```

### 11. audit_logs

Audit trail for data changes.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_table ON audit_logs(table_name);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

### 12. notifications

User notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

## Row Level Security (RLS) Policies

### profile

```sql
-- Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### store

```sql
-- Users can only see their own Stores
CREATE POLICY "Users can view own Stores"
  ON stores FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own Store"
  ON stores FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own Store"
  ON stores FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own Store"
  ON stores FOR DELETE
  USING (auth.uid() = owner_id);
```

### product

```sql
-- Users can only see products from their stores
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

-- Users can create products in their stores
CREATE POLICY "Users can create products in own store"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.owner_id = auth.uid()
    )
  );
```

### sales

```sql
-- Users can only see sales from their stores
CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = sales.store_id
      AND stores.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sales in own store"
  ON sales FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = sales.store_id
      AND stores.owner_id = auth.uid()
    )
  );
```

## Functions

### Updated At Trigger

```sql
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at_store
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ... apply to all relevant tables
```

## Backup and Restore

### Backup

```bash
# Using Supabase CLI
supabase db dump -f backup.sql
```

### Restore

```bash
# Using Supabase CLI
supabase db reset
```

## Performance Considerations

### Indexes

- All foreign keys have indexes
- Frequently queried columns (email, status, dates) have indexes
- Composite indexes for complex queries

### Query Optimization

- Use `EXPLAIN ANALYZE` to analyze slow queries
- Consider materialized views for complex aggregations
- Implement database connection pooling

## Data Retention Policy

- Sales data: Keep for 7 years (Philippine law)
- Audit logs: Keep for 1 year
- Notification logs: Keep for 90 days
- Soft-deleted records: Archive after 1 year, purge after 3 years

## Migration Strategy

```typescript
// Example migration file
// supabase/migrations/001_initial_schema.sql

-- See SQL blocks above for table definitions
```

## Notes

1. **Soft Deletes**: Most tables use `is_deleted` flag for soft deletes
2. **Timestamps**: All tables use `TIMESTAMPTZ` for timezone-aware timestamps
3. **UUID**: Using PostgreSQL's built-in UUID generation
4. **Decimal**: Using DECIMAL(10,2) for financial calculations to avoid floating-point errors
5. **Generated Columns**: Using PostgreSQL 12+ generated columns for computed values

---

Last Updated: 2026-02-23
Maintained by: Nelax Development Team
