/**
 * Katalog lokali — przepisany 1:1 z Bywalec.dc.html, linie 4110–4147.
 *
 * To są dane demonstracyjne z prototypu (Kraków). Docelowo wchodzi tu
 * Google Places + własna baza; struktura pól celowo zostaje ta sama,
 * żeby podmiana źródła nie ruszała warstwy widoku.
 */

export type VenueCat = 'noc' | 'kawa' | 'event' | 'gastro';

export type Venue = {
  id: string;
  name: string;
  cat: VenueCat;
  catLabel: string;
  lat: number;
  lng: number;
  rating: number;
  votes: number;
  /** poziom cenowy: •, ••, ••• */
  price: string;
  dist: string;
  district: string;
  isOpen: boolean;
  closes: string;
  address: string;
  phone: string;
  site: string;
  /** trzy przystanki gradientu odczytane z `grad` w prototypie (kąt 150°) */
  grad: [string, string, string];
  hours: [string, string][];
  reward: string;
  code: string;
  menu: [string, string, string][];
  opinions: [string, number, string][];
  stories: [string, string][];
};

export const venues: Venue[] = [
  {
    id: 'nokturn',
    name: 'Nokturn',
    cat: 'noc',
    catLabel: 'Wine bar',
    lat: 50.0512,
    lng: 19.9445,
    rating: 4.8,
    votes: 212,
    price: '••',
    dist: '320 m',
    district: 'Kazimierz',
    isOpen: true,
    closes: '3:00',
    address: 'ul. Józefa 12, 31-056 Kraków',
    phone: '+48 512 884 210',
    site: 'nokturn.wine',
    grad: ['#EAD6DE', '#A8788C', '#4E3040'],
    hours: [
      ['Pon', '17:00 – 1:00'],
      ['Wt', '17:00 – 1:00'],
      ['Śr', '17:00 – 2:00'],
      ['Czw', '17:00 – 3:00'],
      ['Pt', '16:00 – 3:00'],
      ['Sob', '16:00 – 3:00'],
      ['Ndz', 'Zamknięte'],
    ],
    reward: 'Kieliszek bianco frizzante do pierwszego zamówienia',
    code: 'NKT·4192',
    menu: [
      ['Bianco Frizzante', 'Friuli, skin contact 2024', '24 zł'],
      ['Deska od sąsiada', 'Sery z Hali Targowej, miód', '46 zł'],
      ['Set winylowy', 'Czw–sob od 23:30', 'gratis'],
    ],
    opinions: [
      ['Marta K.', 5, 'Najlepszy wybór win naturalnych w Krakowie. Obsługa doradza bez zadzierania nosa.'],
      ['Jakub W.', 4, 'Kameralnie, głośniej po 23. Idealne na jednego przed nocą.'],
    ],
    stories: [
      ['Nowa dostawa z Friuli', 'dziś'],
      ['Winylowy czwartek', 'czw 23:30'],
      ['Degustacja pomarańczowych', 'nd 18:00'],
    ],
  },
  {
    id: 'brama',
    name: 'Brama 7',
    cat: 'kawa',
    catLabel: 'Kawiarnia',
    lat: 50.0455,
    lng: 19.9535,
    rating: 4.9,
    votes: 431,
    price: '•',
    dist: '140 m',
    district: 'Podgórze',
    isOpen: true,
    closes: '19:00',
    address: 'ul. Nadwiślańska 7, 30-527 Kraków',
    phone: '+48 733 118 402',
    site: 'brama7.coffee',
    grad: ['#F0E2CB', '#C79C68', '#6B4A2A'],
    hours: [
      ['Pon', '7:30 – 18:00'],
      ['Wt', '7:30 – 18:00'],
      ['Śr', '7:30 – 18:00'],
      ['Czw', '7:30 – 19:00'],
      ['Pt', '7:30 – 19:00'],
      ['Sob', '9:00 – 19:00'],
      ['Ndz', '9:00 – 16:00'],
    ],
    reward: 'Druga filtrówka za 1 zł — dziś do zamknięcia',
    code: 'BR7·2280',
    menu: [
      ['Filtrówka dnia', 'Kolumbia Huila — nektarynka', '16 zł'],
      ['Cynamonka', 'Z pieca o 6:40', '14 zł'],
      ['Cold brew tonic', 'W kubku kaucyjnym', '19 zł'],
    ],
    opinions: [
      ['Ola P.', 5, 'Cynamonki znikają przed 11:00 i wiem dlaczego. Kawa równa co do sekundy.'],
      ['Tomasz L.', 5, 'Praca zdalna: gniazdka, cisza, dobre Wi-Fi.'],
    ],
    stories: [
      ['Nowa Kolumbia w młynku', 'wt'],
      ['Cupping w sobotę', 'sob 11:00'],
    ],
  },
  {
    id: 'forum',
    name: 'Hala Forum',
    cat: 'event',
    catLabel: 'Wydarzenia',
    lat: 50.0468,
    lng: 19.9358,
    rating: 4.7,
    votes: 88,
    price: '••',
    dist: '320 m',
    district: 'Zabłocie',
    isOpen: true,
    closes: '4:00',
    address: 'ul. Marii Konopnickiej 28, Kraków',
    phone: '+48 604 227 019',
    site: 'halaforum.pl',
    grad: ['#EFDDC4', '#D2A177', '#7A5535'],
    hours: [
      ['Pon', 'Zamknięte'],
      ['Wt', 'Zamknięte'],
      ['Śr', '18:00 – 1:00'],
      ['Czw', '18:00 – 3:00'],
      ['Pt', '18:00 – 4:00'],
      ['Sob', '16:00 – 4:00'],
      ['Ndz', '12:00 – 22:00'],
    ],
    reward: 'Wejściówka −40% na silent disco (zostało 12)',
    code: 'FRM·7714',
    menu: [
      ['Silent disco', 'Trzy kanały, start 23:00', '39 zł'],
      ['Taras nad Wisłą', 'Bez biletu do 22:00', 'gratis'],
      ['Bar Hali', 'Lokalne piwa i lemonady', 'od 12 zł'],
    ],
    opinions: [
      ['Kasia M.', 5, 'Trzy kanały muzyki i nikt nikomu nie przeszkadza. Genialne.'],
      ['Michał D.', 4, 'Kolejka do słuchawek — warto przyjść przed 23.'],
    ],
    stories: [
      ['Silent disco dziś 23:00', 'live'],
      ['Kino na kocach', 'nd 20:00'],
      ['Targ śniadaniowy', 'sob 10:00'],
    ],
  },
  {
    id: 'ostra',
    name: 'Ostra Kuchnia',
    cat: 'gastro',
    catLabel: 'Bistro',
    lat: 50.0489,
    lng: 19.9482,
    rating: 4.8,
    votes: 306,
    price: '•••',
    dist: '480 m',
    district: 'Kazimierz',
    isOpen: false,
    closes: '23:00',
    address: 'ul. Bożego Ciała 5, 31-059 Kraków',
    phone: '+48 511 200 664',
    site: 'ostrakuchnia.pl',
    grad: ['#DDE7D6', '#7EA083', '#33503C'],
    hours: [
      ['Pon', 'Zamknięte'],
      ['Wt', '17:00 – 22:00'],
      ['Śr', '17:00 – 22:00'],
      ['Czw', '17:00 – 23:00'],
      ['Pt', '17:00 – 23:00'],
      ['Sob', '13:00 – 23:00'],
      ['Ndz', '13:00 – 20:00'],
    ],
    reward: 'Amuse-bouche od szefa kuchni + 15% na bar',
    code: 'OSK·5031',
    menu: [
      ['Kiszony kalafior', 'Masło z kminkiem, orzech', '32 zł'],
      ['Pstrąg z Ojcowa', 'Śmietana, koperkowy olej', '68 zł'],
      ['Sernik na zimno', 'Rabarbar z targu', '28 zł'],
    ],
    opinions: [
      ['Ewa S.', 5, 'Dwanaście miejsc przy barze i widok na kuchnię. Rezerwacji nie ma — przychodzę o 17.'],
      ['Bartek N.', 4, 'Karta zmienia się co tydzień, ceny uczciwe.'],
    ],
    stories: [
      ['Nowa karta jesienna', 'dziś'],
      ['Kolacja przy jednym stole', 'wt 19:00'],
    ],
  },
];

export function venueById(id: string): Venue | undefined {
  return venues.find((v) => v.id === id);
}
