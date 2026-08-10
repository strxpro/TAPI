/**
 * Dane testowe aplikacji.
 *
 * Wydzielone z logiki, zeby widok byl czysty i gotowy na podmiane na dane
 * z Supabase. Logika siega po nie przez MOCK.nazwa, wiec zmiana zrodla
 * to praca w tym jednym pliku, bez ruszania ekranow.
 *
 * Docelowo katalog lokali i wydarzen przychodzi z bazy przez most
 * (db.venues, db.events w src/bridge/handlers.ts), a to zostaje
 * jako zapas na czas braku sieci.
 */
window.MOCK = {
  /* gAll */
  gAll: [
    { name: 'Nokturn Wine & Vinyl', addr: 'ul. Józefa 12, Kraków', rating: '4,8 · 212' },
    { name: 'Nokturn Bistro', addr: 'ul. Starowiślna 44, Kraków', rating: '4,5 · 87' },
    { name: 'Nokturn Cafe', addr: 'Rynek Podgórski 3, Kraków', rating: '4,7 · 41' },
    { name: 'Nokturn Cocktail Room', addr: 'ul. Meiselsa 9, Kraków', rating: '4,9 · 64' },
    { name: 'Kawiarnia Nokia Bar', addr: 'ul. Krupnicza 22, Kraków', rating: '4,3 · 128' },
    { name: 'Piekarnia Nowak', addr: 'ul. Długa 51, Kraków', rating: '4,6 · 310' },
    { name: 'Bar Mleczny Barka', addr: 'ul. Kalwaryjska 8, Kraków', rating: '4,4 · 96' },
    { name: 'Cafe Bocian', addr: 'pl. Nowy 4, Kraków', rating: '4,7 · 173' }
  ],

  /* interestDefs */
  interestDefs: [
    { id: 'kawa', pl: 'Kawa', en: 'Coffee', cat: 'kawa' },
    { id: 'wino', pl: 'Wino', en: 'Wine', cat: 'noc' },
    { id: 'sniadania', pl: 'Śniadania', en: 'Breakfast', cat: 'gastro' },
    { id: 'koncerty', pl: 'Koncerty', en: 'Live music', cat: 'event' },
    { id: 'kluby', pl: 'Kluby', en: 'Clubs', cat: 'noc' },
    { id: 'sztuka', pl: 'Sztuka', en: 'Art', cat: 'event' },
    { id: 'street', pl: 'Street food', en: 'Street food', cat: 'gastro' },
    { id: 'targi', pl: 'Targi', en: 'Markets', cat: 'event' },
    { id: 'kino', pl: 'Kino', en: 'Cinema', cat: 'event' },
    { id: 'winyle', pl: 'Winyle', en: 'Vinyl', cat: 'noc' }
  ],

  /* eventDefs */
  eventDefs: [
    { id: 'e3', venue: 'brama', d: 1, day: 5, dow: ['Śr', 'We', 'Mer'], time: '20:30', price: 45, cat: 'koncerty', district: 'Podgórze',
      pl: 'Kwartet smyczkowy na dziedzińcu', en: 'String quartet in the courtyard', it: 'Quartetto d\u2019archi nel cortile', place: 'Brama 7', dist: '600 m' },
    { id: 'e4', venue: 'ostra', d: 1, day: 5, dow: ['Śr', 'We', 'Mer'], time: '17:00', price: 0, cat: 'sniadania', district: 'Zabłocie',
      pl: 'Nowa karta jesienna — przedpremiera', en: 'Autumn menu preview', it: 'Anteprima del menu d\u2019autunno', place: 'Ostra Kuchnia', dist: '1,4 km' },
    { id: 'e5', venue: 'forum', d: 3, day: 7, dow: ['Pt', 'Fr', 'Ven'], time: '21:00', price: 60, cat: 'koncerty', district: 'Zabłocie',
      pl: 'Noc winyli: soul i funk', en: 'Vinyl night: soul and funk', it: 'Notte in vinile: soul e funk', place: 'Hala Forum', dist: '2,1 km' },
    { id: 'e6', venue: 'brama', d: 4, day: 8, dow: ['So', 'Sa', 'Sab'], time: '10:00', price: 0, cat: 'targi', district: 'Podgórze',
      pl: 'Targ śniadaniowy na dziedzińcu', en: 'Breakfast market in the courtyard', it: 'Mercato della colazione nel cortile', place: 'Brama 7', dist: '600 m' },
    { id: 'e7', venue: 'nokturn', d: 5, day: 9, dow: ['Nd', 'Su', 'Dom'], time: '18:00', price: 25, cat: 'wino', district: 'Kazimierz',
      pl: 'Niedzielne wino z serem', en: 'Sunday wine and cheese', it: 'Vino e formaggio di domenica', place: 'Nokturn', dist: '250 m' },
    { id: 'e8', venue: 'ostra', d: 9, day: 13, dow: ['Cz', 'Th', 'Gio'], time: '19:30', price: 120, cat: 'gastro', district: 'Zabłocie',
      pl: 'Kolacja przy jednym stole, 12 osób', en: 'One-table dinner for twelve', it: 'Cena a un solo tavolo per dodici', place: 'Ostra Kuchnia', dist: '1,4 km' },
    { id: 'e9', venue: 'nokturn', d: 11, day: 15, dow: ['So', 'Sa', 'Sab'], time: '20:00', price: 55, cat: 'koncerty', district: 'Kazimierz',
      pl: 'Kontrabas i wino, dwa sety', en: 'Double bass and wine, two sets', it: 'Contrabbasso e vino, due set', place: 'Nokturn', dist: '250 m' },
    { id: 'e10', venue: 'brama', d: 13, day: 17, dow: ['Pn', 'Mo', 'Lun'], time: '18:30', price: 0, cat: 'sztuka', district: 'Podgórze',
      pl: 'Wystawa: Kraków nocą, wernisaż', en: 'Show: Kraków at night, opening', it: 'Mostra: Cracovia di notte, inaugurazione', place: 'Brama 7', dist: '600 m' }
  ],

  /* spots */
  spots: [
    { id: 'wawel', pl: 'Wawel — zamek i katedra', en: 'Wawel — castle and cathedral', it: 'Wawel — castello e cattedrale', tags: ['sztuka'], price: 45, dur: 150, slot: 'am', area: 'Stare Miasto', npl: 'Komnaty królewskie, dziedziniec arkadowy i widok na Wisłę.', nen: 'Royal chambers, the arcaded courtyard and the river view.' },
    { id: 'sukiennice', pl: 'Galeria w Sukiennicach', en: 'Gallery in the Cloth Hall', it: 'Galleria nel Panno', tags: ['sztuka'], price: 30, dur: 90, slot: 'am', area: 'Rynek Główny', npl: 'XIX-wieczne malarstwo polskie nad halą kupiecką.', nen: '19th-century Polish painting above the market hall.' },
    { id: 'schindler', pl: 'Fabryka Schindlera', en: 'Schindler’s Factory', it: 'Fabbrica di Schindler', tags: ['sztuka'], price: 42, dur: 120, slot: 'am', area: 'Zabłocie', npl: 'Kraków 1939–1945 opowiedziany scenografią, nie gablotą.', nen: 'Kraków 1939–1945 told through sets, not vitrines.' },
    { id: 'mocak', pl: 'MOCAK — sztuka współczesna', en: 'MOCAK — contemporary art', it: 'MOCAK — arte contemporanea', tags: ['sztuka'], price: 22, dur: 100, slot: 'pm', area: 'Zabłocie', npl: 'Wtorki za złotówkę, kawiarnia z widokiem na hale.', nen: 'Tuesdays cost 1 zł, café looking onto the halls.' },
    { id: 'kazimierz', pl: 'Spacer po Kazimierzu', en: 'Kazimierz walk', it: 'Passeggiata nel Kazimierz', tags: ['sztuka', 'targi'], price: 0, dur: 110, slot: 'pm', area: 'Kazimierz', npl: 'Szeroka, Józefa, podwórka i murale — bez biletu.', nen: 'Szeroka, Józefa, courtyards and murals — no ticket.' },
    { id: 'hala', pl: 'Hala Targowa — śniadanie z budki', en: 'Hala Targowa — breakfast stall', it: 'Hala Targowa — colazione al banco', tags: ['sniadania', 'targi', 'street'], price: 25, dur: 60, slot: 'am', area: 'Grzegórzki', npl: 'Krokiety, bigos i kawa z termosu przy blaszanych stołach.', nen: 'Croquettes, bigos and thermos coffee at tin tables.' },
    { id: 'placnowy', pl: 'Plac Nowy — zapiekanka o północy', en: 'Plac Nowy — midnight zapiekanka', it: 'Plac Nowy — zapiekanka di mezzanotte', tags: ['street'], price: 18, dur: 40, slot: 'eve', area: 'Kazimierz', npl: 'Okrąglak, kolejka i pięć rodzajów sosu.', nen: 'The rotunda, the queue and five kinds of sauce.' },
    { id: 'camelot', pl: 'Kawa w Camelot', en: 'Coffee at Camelot', it: 'Caffè al Camelot', tags: ['kawa'], price: 26, dur: 60, slot: 'am', area: 'Stare Miasto', npl: 'Sernik i cisza dwie przecznice od Rynku.', nen: 'Cheesecake and quiet two blocks off the square.' },
    { id: 'brama', pl: 'Brama 7 — filtrówka dnia', en: 'Brama 7 — filter of the day', it: 'Brama 7 — filtro del giorno', tags: ['kawa', 'sniadania'], price: 22, dur: 45, slot: 'am', area: 'Podgórze', venue: 'brama', npl: 'Kolumbia Huila i cynamonka prosto z pieca.', nen: 'Colombia Huila and a cinnamon bun straight from the oven.' },
    { id: 'zakrzowek', pl: 'Zakrzówek — turkusowy kamieniołom', en: 'Zakrzówek — turquoise quarry', it: 'Zakrzówek — cava turchese', tags: ['sztuka'], price: 0, dur: 120, slot: 'pm', area: 'Dębniki', npl: 'Pomosty, skały i woda w kolorze, w który nie uwierzysz.', nen: 'Piers, cliffs and water in a colour you will not believe.' },
    { id: 'kopiec', pl: 'Kopiec Krakusa o zachodzie', en: 'Krakus Mound at sunset', it: 'Tumulo di Krak al tramonto', tags: ['sztuka'], price: 0, dur: 90, slot: 'pm', area: 'Podgórze', npl: 'Najlepsza panorama miasta i zero biletu.', nen: 'The best panorama in town and no ticket.' },
    { id: 'bulwary', pl: 'Bulwary Wiślane', en: 'Vistula boulevards', it: 'Lungofiume della Vistola', tags: ['sztuka'], price: 0, dur: 60, slot: 'pm', area: 'Podgórze', npl: 'Barki, rowery i most Bernatka po drodze.', nen: 'Barges, bikes and the Bernatka bridge on the way.' },
    { id: 'winyle', pl: 'Sklep z winylami na Józefa', en: 'Vinyl shop on Józefa', it: 'Negozio di vinili in Józefa', tags: ['winyle', 'sztuka'], price: 0, dur: 45, slot: 'pm', area: 'Kazimierz', npl: 'Przegrzebywanie skrzynek to osobna atrakcja.', nen: 'Digging through the crates is the attraction itself.' },
    { id: 'targ', pl: 'Targ Pietruszkowy', en: 'Parsley farmers market', it: 'Mercato Pietruszkowy', tags: ['targi', 'sniadania'], price: 30, dur: 90, slot: 'am', area: 'Podgórze', npl: 'Sery, kiszonki i chleb od piekarza z Beskidu.', nen: 'Cheese, pickles and bread from a Beskid baker.' },
    { id: 'ostra', pl: 'Kolacja w Ostrej Kuchni', en: 'Dinner at Ostra Kuchnia', it: 'Cena a Ostra Kuchnia', tags: ['sniadania', 'street'], price: 110, dur: 120, slot: 'eve', area: 'Kazimierz', venue: 'ostra', npl: 'Dwanaście miejsc przy barze i karta zmieniana co tydzień.', nen: 'Twelve seats at the bar and a menu that changes weekly.' },
    { id: 'nokturn', pl: 'Wino w Nokturnie', en: 'Wine at Nokturn', it: 'Vino da Nokturn', tags: ['wino', 'winyle'], price: 60, dur: 120, slot: 'eve', area: 'Kazimierz', venue: 'nokturn', npl: 'Naturalne z Friuli, winyl od 23:30.', nen: 'Natural wines from Friuli, vinyl from 11:30 pm.' },
    { id: 'forum', pl: 'Silent disco w Hali Forum', en: 'Silent disco at Hala Forum', it: 'Silent disco a Hala Forum', tags: ['kluby', 'koncerty'], price: 39, dur: 180, slot: 'eve', area: 'Zabłocie', venue: 'forum', npl: 'Trzy kanały, taras nad Wisłą, start 23:00.', nen: 'Three channels, a terrace over the river, 11 pm start.' },
    { id: 'piecart', pl: 'Jazz w Piec Art', en: 'Jazz at Piec Art', it: 'Jazz al Piec Art', tags: ['koncerty'], price: 45, dur: 150, slot: 'eve', area: 'Stare Miasto', npl: 'Piwnica, kontrabas i stoliki na dwie osoby.', nen: 'A cellar, a double bass and tables for two.' },
    { id: 'kino', pl: 'Kino Pod Baranami', en: 'Kino Pod Baranami', it: 'Cinema Pod Baranami', tags: ['kino'], price: 28, dur: 120, slot: 'eve', area: 'Rynek Główny', npl: 'Trzy sale w kamienicy przy Rynku, kino bez popcornu.', nen: 'Three screens in a townhouse on the square, no popcorn.' },
    { id: 'tytano', pl: 'Wieczór w Tytano', en: 'Night at Tytano', it: 'Serata al Tytano', tags: ['kluby'], price: 35, dur: 180, slot: 'eve', area: 'Kleparz', npl: 'Dawna fabryka, dziesięć barów na jednym podwórku.', nen: 'An old factory, ten bars in one yard.' }
  ],

  /* venues */
  venues: [
    { id: 'nokturn', name: 'Nokturn', cat: 'noc', catLabel: 'Wine bar', lat: 50.0512, lng: 19.9445,
      rating: 4.8, votes: 212, price: '••', dist: '320 m', district: 'Kazimierz', isOpen: true, closes: '3:00',
      address: 'ul. Józefa 12, 31-056 Kraków', phone: '+48 512 884 210', site: 'nokturn.wine',
      grad: 'linear-gradient(150deg, #EAD6DE, #A8788C 55%, #4E3040)',
      hours: [['Pon', '17:00 – 1:00'], ['Wt', '17:00 – 1:00'], ['Śr', '17:00 – 2:00'], ['Czw', '17:00 – 3:00'], ['Pt', '16:00 – 3:00'], ['Sob', '16:00 – 3:00'], ['Ndz', 'Zamknięte']],
      reward: 'Kieliszek bianco frizzante do pierwszego zamówienia', code: 'NKT·4192',
      menu: [['Bianco Frizzante', 'Friuli, skin contact 2024', '24 zł'], ['Deska od sąsiada', 'Sery z Hali Targowej, miód', '46 zł'], ['Set winylowy', 'Czw–sob od 23:30', 'gratis']],
      opinions: [['Marta K.', 5, 'Najlepszy wybór win naturalnych w Krakowie. Obsługa doradza bez zadzierania nosa.'], ['Jakub W.', 4, 'Kameralnie, głośniej po 23. Idealne na jednego przed nocą.']],
      stories: [['Nowa dostawa z Friuli', 'dziś'], ['Winylowy czwartek', 'czw 23:30'], ['Degustacja pomarańczowych', 'nd 18:00']] },
    { id: 'brama', name: 'Brama 7', cat: 'kawa', catLabel: 'Kawiarnia', lat: 50.0455, lng: 19.9535,
      rating: 4.9, votes: 431, price: '•', dist: '140 m', district: 'Podgórze', isOpen: true, closes: '19:00',
      address: 'ul. Nadwiślańska 7, 30-527 Kraków', phone: '+48 733 118 402', site: 'brama7.coffee',
      grad: 'linear-gradient(150deg, #F0E2CB, #C79C68 55%, #6B4A2A)',
      hours: [['Pon', '7:30 – 18:00'], ['Wt', '7:30 – 18:00'], ['Śr', '7:30 – 18:00'], ['Czw', '7:30 – 19:00'], ['Pt', '7:30 – 19:00'], ['Sob', '9:00 – 19:00'], ['Ndz', '9:00 – 16:00']],
      reward: 'Druga filtrówka za 1 zł — dziś do zamknięcia', code: 'BR7·2280',
      menu: [['Filtrówka dnia', 'Kolumbia Huila — nektarynka', '16 zł'], ['Cynamonka', 'Z pieca o 6:40', '14 zł'], ['Cold brew tonic', 'W kubku kaucyjnym', '19 zł']],
      opinions: [['Ola P.', 5, 'Cynamonki znikają przed 11:00 i wiem dlaczego. Kawa równa co do sekundy.'], ['Tomasz L.', 5, 'Praca zdalna: gniazdka, cisza, dobre Wi-Fi.']],
      stories: [['Nowa Kolumbia w młynku', 'wt'], ['Cupping w sobotę', 'sob 11:00']] },
    { id: 'forum', name: 'Hala Forum', cat: 'event', catLabel: 'Wydarzenia', lat: 50.0468, lng: 19.9358,
      rating: 4.7, votes: 88, price: '••', dist: '320 m', district: 'Zabłocie', isOpen: true, closes: '4:00',
      address: 'ul. Marii Konopnickiej 28, Kraków', phone: '+48 604 227 019', site: 'halaforum.pl',
      grad: 'linear-gradient(150deg, #EFDDC4, #D2A177 55%, #7A5535)',
      hours: [['Pon', 'Zamknięte'], ['Wt', 'Zamknięte'], ['Śr', '18:00 – 1:00'], ['Czw', '18:00 – 3:00'], ['Pt', '18:00 – 4:00'], ['Sob', '16:00 – 4:00'], ['Ndz', '12:00 – 22:00']],
      reward: 'Wejściówka −40% na silent disco (zostało 12)', code: 'FRM·7714',
      menu: [['Silent disco', 'Trzy kanały, start 23:00', '39 zł'], ['Taras nad Wisłą', 'Bez biletu do 22:00', 'gratis'], ['Bar Hali', 'Lokalne piwa i lemonady', 'od 12 zł']],
      opinions: [['Kasia M.', 5, 'Trzy kanały muzyki i nikt nikomu nie przeszkadza. Genialne.'], ['Michał D.', 4, 'Kolejka do słuchawek — warto przyjść przed 23.']],
      stories: [['Silent disco dziś 23:00', 'live'], ['Kino na kocach', 'nd 20:00'], ['Targ śniadaniowy', 'sob 10:00']] },
    { id: 'ostra', name: 'Ostra Kuchnia', cat: 'gastro', catLabel: 'Bistro', lat: 50.0489, lng: 19.9482,
      rating: 4.8, votes: 306, price: '•••', dist: '480 m', district: 'Kazimierz', isOpen: false, closes: '23:00',
      address: 'ul. Bożego Ciała 5, 31-059 Kraków', phone: '+48 511 200 664', site: 'ostrakuchnia.pl',
      grad: 'linear-gradient(150deg, #DDE7D6, #7EA083 55%, #33503C)',
      hours: [['Pon', 'Zamknięte'], ['Wt', '17:00 – 22:00'], ['Śr', '17:00 – 22:00'], ['Czw', '17:00 – 23:00'], ['Pt', '17:00 – 23:00'], ['Sob', '13:00 – 23:00'], ['Ndz', '13:00 – 20:00']],
      reward: 'Amuse-bouche od szefa kuchni + 15% na bar', code: 'OSK·5031',
      menu: [['Kiszony kalafior', 'Masło z kminkiem, orzech', '32 zł'], ['Pstrąg z Ojcowa', 'Śmietana, koperkowy olej', '68 zł'], ['Sernik na zimno', 'Rabarbar z targu', '28 zł']],
      opinions: [['Ewa S.', 5, 'Dwanaście miejsc przy barze i widok na kuchnię. Rezerwacji nie ma — przychodzę o 17.'], ['Bartek N.', 4, 'Karta zmienia się co tydzień, ceny uczciwe.']],
      stories: [['Nowa karta jesienna', 'dziś'], ['Kolacja przy jednym stole', 'wt 19:00']] }
  ],
};
