-- RestaurantIQ Multi-Tenant Migration
-- Einmalig im Supabase SQL Editor ausführen

-- 1. Restaurants-Tabelle anlegen
CREATE TABLE IF NOT EXISTS restaurants (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name          text NOT NULL,
  username      text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- 2. restaurant_id zu bestehenden Tabellen hinzufügen
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES restaurants(id);
ALTER TABLE availability  ADD COLUMN IF NOT EXISTS restaurant_id uuid REFERENCES restaurants(id);

-- Fertig. Danach über POST /api/auth/create-restaurant das erste Restaurant anlegen.
