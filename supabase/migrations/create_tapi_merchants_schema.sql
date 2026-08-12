-- 1. Typ Enum dla Archetypów Biznesowych
CREATE TYPE venue_archetype AS ENUM ('HOSPITALITY', 'NOCLEGI', 'BEAUTY', 'NIGHTLIFE', 'SERVICES');

-- 2. Tabela Główna Firm (Venues)
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_place_id VARCHAR(255) UNIQUE NULL, -- opcjonalne, gdy rejestracja jest bez Google
    is_manual_registration BOOLEAN DEFAULT FALSE,
    registration_doc_url TEXT NULL, -- opcjonalny dokument do weryfikacji (NIP/CEIDG/KRS)
    verification_status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    name VARCHAR(255) NOT NULL,
    archetype venue_archetype NOT NULL,
    tos_accepted_at TIMESTAMPTZ NULL,
    tos_version VARCHAR(50) NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela Ustawień i Flaga Modułów
CREATE TABLE IF NOT EXISTS venue_settings (
    venue_id UUID PRIMARY KEY REFERENCES venues(id) ON DELETE CASCADE,
    show_menu_scanner BOOLEAN DEFAULT FALSE,
    show_table_booking BOOLEAN DEFAULT FALSE,
    show_ical_booking BOOLEAN DEFAULT FALSE,
    show_service_booking BOOLEAN DEFAULT FALSE,
    ical_sync_url TEXT NULL,
    google_calendar_id TEXT NULL,
    ai_auto_responder_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Profil Wypłat i Płatności (Stripe & Przelewy)
CREATE TABLE IF NOT EXISTS venue_payout_profiles (
    venue_id UUID PRIMARY KEY REFERENCES venues(id) ON DELETE CASCADE,
    stripe_account_id VARCHAR(255) NULL,
    payout_bank_account VARCHAR(34) NULL, -- IBAN
    payout_bank_name VARCHAR(255) NULL,
    payout_holder_name VARCHAR(255) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    balance_available_eur NUMERIC(10,2) DEFAULT 0.00,
    balance_pending_eur NUMERIC(10,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela Rezerwacji i Transakcji
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL,
    booking_type VARCHAR(50) NOT NULL, -- 'TABLE', 'ROOM', 'SERVICE', 'TICKET'
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'CANCELLED'
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    platform_fee_amount NUMERIC(10,2) DEFAULT 0.00, -- 10% Prowizji TAPI
    merchant_amount NUMERIC(10,2) DEFAULT 0.00,
    booking_start TIMESTAMPTZ NOT NULL,
    booking_end TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
