-- Tabela dla aktywnych przypisań NFT (kto, gdzie ma NFT)
CREATE TABLE IF NOT EXISTS public.user_nfts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    progress INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Historia zniżek (logi)
CREATE TABLE IF NOT EXISTS public.discounts_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    venue_id TEXT NOT NULL,
    value NUMERIC(10,2) NOT NULL,
    scanned_by TEXT, -- Kto zeskanował (id merchant-a)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relacje B2B
CREATE TABLE IF NOT EXISTS public.b2b_partnerships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id TEXT NOT NULL,
    partner_id TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla szybszego wyszukiwania
CREATE INDEX IF NOT EXISTS user_nfts_user_venue_idx ON public.user_nfts(user_id, venue_id);
CREATE INDEX IF NOT EXISTS b2b_merchant_idx ON public.b2b_partnerships(merchant_id);
