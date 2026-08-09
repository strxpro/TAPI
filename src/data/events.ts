/**
 * Kalendarz wydarzeń — przepisany 1:1 z TAPI-standalone.html (`eventDefs`).
 *
 * Dane demonstracyjne z prototypu (Kraków, sierpień). Docelowo wchodzi tu
 * katalog z backendu; struktura pól celowo zostaje ta sama, żeby podmiana
 * źródła nie ruszała warstwy widoku.
 *
 * `d` to odległość w dniach od „dziś" — po niej idzie zarówno filtr terminu
 * (jutro / weekend / za tydzień), jak i plakietka nad tytułem.
 * `dow` to skrót dnia tygodnia w kolejności [pl, en, it].
 */

export type EventCat = 'koncerty' | 'sniadania' | 'targi' | 'wino' | 'gastro' | 'sztuka';

export type CityEvent = {
  id: string;
  /** lokal, do którego prowadzi tapnięcie */
  venue: string;
  /** ile dni od dziś */
  d: number;
  /** dzień miesiąca w kostce daty */
  day: number;
  /** skrót dnia tygodnia: [pl, en, it] */
  dow: [string, string, string];
  time: string;
  /** 0 = wejście wolne */
  price: number;
  cat: EventCat;
  district: string;
  pl: string;
  en: string;
  it: string;
  place: string;
  dist: string;
};

export const cityEvents: CityEvent[] = [
  {
    id: 'e3',
    venue: 'brama',
    d: 1,
    day: 5,
    dow: ['Śr', 'We', 'Mer'],
    time: '20:30',
    price: 45,
    cat: 'koncerty',
    district: 'Podgórze',
    pl: 'Kwartet smyczkowy na dziedzińcu',
    en: 'String quartet in the courtyard',
    it: 'Quartetto d’archi nel cortile',
    place: 'Brama 7',
    dist: '600 m',
  },
  {
    id: 'e4',
    venue: 'ostra',
    d: 1,
    day: 5,
    dow: ['Śr', 'We', 'Mer'],
    time: '17:00',
    price: 0,
    cat: 'sniadania',
    district: 'Zabłocie',
    pl: 'Nowa karta jesienna — przedpremiera',
    en: 'Autumn menu preview',
    it: 'Anteprima del menu d’autunno',
    place: 'Ostra Kuchnia',
    dist: '1,4 km',
  },
  {
    id: 'e5',
    venue: 'forum',
    d: 3,
    day: 7,
    dow: ['Pt', 'Fr', 'Ven'],
    time: '21:00',
    price: 60,
    cat: 'koncerty',
    district: 'Zabłocie',
    pl: 'Noc winyli: soul i funk',
    en: 'Vinyl night: soul and funk',
    it: 'Notte in vinile: soul e funk',
    place: 'Hala Forum',
    dist: '2,1 km',
  },
  {
    id: 'e6',
    venue: 'brama',
    d: 4,
    day: 8,
    dow: ['So', 'Sa', 'Sab'],
    time: '10:00',
    price: 0,
    cat: 'targi',
    district: 'Podgórze',
    pl: 'Targ śniadaniowy na dziedzińcu',
    en: 'Breakfast market in the courtyard',
    it: 'Mercato della colazione nel cortile',
    place: 'Brama 7',
    dist: '600 m',
  },
  {
    id: 'e7',
    venue: 'nokturn',
    d: 5,
    day: 9,
    dow: ['Nd', 'Su', 'Dom'],
    time: '18:00',
    price: 25,
    cat: 'wino',
    district: 'Kazimierz',
    pl: 'Niedzielne wino z serem',
    en: 'Sunday wine and cheese',
    it: 'Vino e formaggio di domenica',
    place: 'Nokturn',
    dist: '250 m',
  },
  {
    id: 'e8',
    venue: 'ostra',
    d: 9,
    day: 13,
    dow: ['Cz', 'Th', 'Gio'],
    time: '19:30',
    price: 120,
    cat: 'gastro',
    district: 'Zabłocie',
    pl: 'Kolacja przy jednym stole, 12 osób',
    en: 'One-table dinner for twelve',
    it: 'Cena a un solo tavolo per dodici',
    place: 'Ostra Kuchnia',
    dist: '1,4 km',
  },
  {
    id: 'e9',
    venue: 'nokturn',
    d: 11,
    day: 15,
    dow: ['So', 'Sa', 'Sab'],
    time: '20:00',
    price: 55,
    cat: 'koncerty',
    district: 'Kazimierz',
    pl: 'Kontrabas i wino, dwa sety',
    en: 'Double bass and wine, two sets',
    it: 'Contrabbasso e vino, due set',
    place: 'Nokturn',
    dist: '250 m',
  },
  {
    id: 'e10',
    venue: 'brama',
    d: 13,
    day: 17,
    dow: ['Pn', 'Mo', 'Lun'],
    time: '18:30',
    price: 0,
    cat: 'sztuka',
    district: 'Podgórze',
    pl: 'Wystawa: Kraków nocą, wernisaż',
    en: 'Show: Kraków at night, opening',
    it: 'Mostra: Cracovia di notte, inaugurazione',
    place: 'Brama 7',
    dist: '600 m',
  },
];
