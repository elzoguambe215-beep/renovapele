CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL CHECK (char_length(trim(full_name)) BETWEEN 2 AND 120),
  phone text NOT NULL CHECK (char_length(trim(phone)) BETWEEN 8 AND 30),
  address text NOT NULL CHECK (char_length(trim(address)) BETWEEN 5 AND 300),
  city text NOT NULL CHECK (char_length(trim(city)) BETWEEN 2 AND 100),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 9),
  delivery_time text NOT NULL CHECK (delivery_time IN ('Qualquer horário (Mais Rápido)', 'Manhã (8h às 12h)', 'Tarde')),
  notes text NOT NULL DEFAULT '' CHECK (char_length(notes) <= 1000),
  unit_price_mzn integer NOT NULL DEFAULT 897 CHECK (unit_price_mzn = 897),
  payment_method text NOT NULL DEFAULT 'Pagamento na entrega' CHECK (payment_method = 'Pagamento na entrega'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can place orders" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE OR REPLACE FUNCTION public.set_orders_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_orders_updated_at();