-- Liczby do pulpitu firmy.
--
-- Świadomie funkcja, a nie rozszerzenie RLS na tabelę `scans`. Polityka
-- „swoje skany" pozwala czytać wyłącznie własne wiersze i tak ma zostać:
-- lokal ma widzieć, ILE osób przyszło, a nie KTO. Stąd wychodzą same sumy
-- oraz godziny zdarzeń — pojedynczy wiersz z identyfikatorem gościa nie
-- opuszcza bazy.
--
-- Zniknął przy okazji „średni rachunek", który pulpit pokazywał jako 87 zł.
-- TAPI nie widzi rachunków i nie ma z czego go policzyć; w jego miejsce
-- wchodzą przyznane punkty, które są prawdziwe.

create or replace function public.venue_stats(v text) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  od_tygodnia timestamptz := date_trunc('day', now()) - interval '6 days';
  wynik jsonb;
begin
  if not public.owns_venue(v) then
    raise exception 'Nie prowadzisz tego lokalu' using errcode = 'insufficient_privilege';
  end if;

  select jsonb_build_object(
    'scansToday', (select count(*) from public.scans s
                    where s.venue_id = v and s.created_at >= date_trunc('day', now())),
    'scansWeek',  (select count(*) from public.scans s
                    where s.venue_id = v and s.created_at >= od_tygodnia),
    'pointsWeek', (select coalesce(sum(s.points), 0) from public.scans s
                    where s.venue_id = v and s.created_at >= od_tygodnia),
    'couponsWeek',(select count(*) from public.coupon_redemptions r
                     join public.coupons c on c.id = r.coupon_id
                    where c.venue_id = v and r.created_at >= od_tygodnia),
    -- Nowy gość to ten, którego pierwszy skan w tym lokalu wypadł w tym
    -- tygodniu. Inaczej każdy stały bywalec liczyłby się jako nowy.
    'newGuests',  (select count(*) from (
                     select s.user_id from public.scans s
                      where s.venue_id = v
                      group by s.user_id
                     having min(s.created_at) >= od_tygodnia) g),
    'days', (select coalesce(jsonb_agg(jsonb_build_object(
                      'd', to_char(t.d, 'YYYY-MM-DD'), 'n', t.n) order by t.d), '[]'::jsonb)
             from (
               select g.d,
                      (select count(*) from public.scans s
                        where s.venue_id = v
                          and s.created_at >= g.d
                          and s.created_at < g.d + interval '1 day') as n
                 from generate_series(od_tygodnia, date_trunc('day', now()), interval '1 day') g(d)
             ) t),
    -- Ostatnie zdarzenia: sama godzina i rodzaj. Bez identyfikatorów gości —
    -- lokal ma widzieć ruch, a nie ludzi.
    'feed', (select coalesce(jsonb_agg(jsonb_build_object(
                      'time', to_char(f.kiedy, 'HH24:MI'), 'kind', f.rodzaj) order by f.kiedy desc), '[]'::jsonb)
             from (
               (select s.created_at as kiedy, 'scan' as rodzaj from public.scans s
                 where s.venue_id = v order by s.created_at desc limit 6)
               union all
               (select r.created_at, 'coupon' from public.coupon_redemptions r
                  join public.coupons c on c.id = r.coupon_id
                 where c.venue_id = v order by r.created_at desc limit 6)
               union all
               (select st2.published_at, 'story' from public.stories st2
                 where st2.venue_id = v order by st2.published_at desc limit 4)
               order by 1 desc limit 6
             ) f)
  ) into wynik;

  return wynik;
end;
$$;

revoke all on function public.venue_stats(text) from public;
revoke all on function public.venue_stats(text) from anon;
grant execute on function public.venue_stats(text) to authenticated;
