class Component extends DCLogic {

  buzz(ms, kind) {
    if (typeof window === 'undefined') return;
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'haptic', kind: kind || 'light', ms: ms || 15 }));
      }
    } catch(e) {}
    try {
      if (navigator.vibrate) navigator.vibrate(ms || 15);
    } catch(e) {}
  }

  playPingSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this._audioCtx) this._audioCtx = new AudioCtx();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      const now = this._audioCtx.currentTime;
      const osc = this._audioCtx.createOscillator();
      const gain = this._audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this._audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } catch(e) {}
  }

  openFriendsHub() {
    this.buzz(15, 'light');
    this.setState({ friendsOpen: true, friendsTab: this.state.friendsTab || 'ranking' });
  }

  closeFriendsHub() {
    this.buzz(10, 'light');
    this.setState({ friendsOpen: false, groupInviteOpen: false });
  }

  openGroupInvite(venueName) {
    this.buzz(20, 'medium');
    this.setState({
      groupInviteOpen: true,
      friendsOpen: true,
      friendsTab: 'invite',
      inviteVenue: venueName || (this.state.venue ? this.state.venue.name : 'Nokturn Wine & Vinyl'),
      inviteCode: 'TAPI-PACZKA-15',
      inviteCopied: false
    });
  }

  copyGroupInvite() {
    this.buzz(30, 'success');
    this.playPingSound();
    this.setState({ inviteCopied: true });
    if (this.toast) {
      this.toast(this.state.lang === 'pl' ? 'Skopiowano zaproszenie ze zniżką -15% dla ekipy!' : 'Copied group invite with -15% discount!');
    }
  }

  themes = {
    papier: { paper: '#F4F2ED', ink: '#16181C', sub: '#6C6F75', surf: '#FFFFFF', hair: 'rgba(22,24,28,0.10)', dark: false },
    noc: { paper: '#14161A', ink: '#EDECE8', sub: '#9A9DA3', surf: '#1D2025', hair: 'rgba(237,236,232,0.13)', dark: true }
  };
  accents = {
    las: { hex: '#1F5A46', soft: 'rgba(31,90,70,0.10)', softDark: 'rgba(87,195,159,0.16)', text: '#57C39F', label: 'Las' },
    kobalt: { hex: '#2B4AC7', soft: 'rgba(43,74,199,0.10)', softDark: 'rgba(143,164,255,0.16)', text: '#9CB0FF', label: 'Kobalt' },
    glina: { hex: '#B65C36', soft: 'rgba(182,92,54,0.10)', softDark: 'rgba(232,150,110,0.16)', text: '#E8966E', label: 'Glina' },
    sliwka: { hex: '#6C3F6B', soft: 'rgba(108,63,107,0.10)', softDark: 'rgba(204,150,203,0.16)', text: '#CC96CB', label: 'Śliwka' }
  };

  dict = {
    pl: {
      tagline: 'Odkrywaj miasto i wydarzenia', google: 'Zaloguj przez Google', email: 'Zaloguj przez e-mail',
      or: 'LUB', skip: 'Pomiń i przeglądaj', bizQ: 'Prowadzisz lokal?', bizLink: 'Zaloguj jako firma',
      step1: 'Krok 1 z 2', step2: 'Krok 2 z 2', mailTitle: 'Podaj adres e-mail', codeTitle: 'Wpisz kod z maila',
      sendCode: 'Wyślij kod', checking: 'Sprawdzam kod', navDiscover: 'Odkrywaj', navMap: 'Mapa', navScan: 'Skanuj',
      navSaved: 'Zapisane', navProfile: 'Profil', searchPh: 'Szukaj lokalu, kuchni, wydarzenia',
      today: 'Dziś w mieście', near: 'Blisko ciebie', all: 'Wszystko', open: 'Otwarte', closed: 'Zamknięte', until: 'do',
      route: 'Trasa', call: 'Zadzwoń', site: 'Strona', menu: 'Menu', photos: 'Zdjęcia', reviews: 'Opinie',
      stories: 'Relacje i wydarzenia', gsource: 'Dane z profilu Google', refreshed: 'odświeżone 12 min temu',
      coupon: 'Kupon za skan', slide: 'Przesuń, aby odebrać', nearby: 'Powiadom, gdy będę blisko',
      saved: 'Zapisane', coupons: 'Kupony', settings: 'Ustawienia', language: 'Język', theme: 'Motyw',
      accent: 'Kolor akcentu', notifications: 'Powiadomienia', markRead: 'Oznacz jako przeczytane',
      account: 'Konto', logout: 'Wyloguj się', bizPanel: 'Panel firmy', guest: 'Gość', loginCta: 'Zaloguj się',
      scanTitle: 'Zeskanuj naklejkę w witrynie', scanSub: 'Kod działa 24/7 — także gdy lokal jest zamknięty.',
      scanBtn: 'Symuluj skan', hours: 'Godziny', address: 'Adres', phone: 'Telefon'
    },
    en: {
      tagline: 'Discover the city and its events', google: 'Continue with Google', email: 'Continue with e-mail',
      or: 'OR', skip: 'Skip and browse', bizQ: 'Own a venue?', bizLink: 'Sign in as business',
      step1: 'Step 1 of 2', step2: 'Step 2 of 2', mailTitle: 'Enter your e-mail', codeTitle: 'Enter the code',
      sendCode: 'Send code', checking: 'Checking code', navDiscover: 'Discover', navMap: 'Map', navScan: 'Scan',
      navSaved: 'Saved', navProfile: 'Profile', searchPh: 'Search venues, food, events',
      today: 'Today in town', near: 'Near you', all: 'All', open: 'Open', closed: 'Closed', until: 'until',
      route: 'Route', call: 'Call', site: 'Website', menu: 'Menu', photos: 'Photos', reviews: 'Reviews',
      stories: 'Stories and events', gsource: 'Data from Google profile', refreshed: 'refreshed 12 min ago',
      coupon: 'Scan reward', slide: 'Slide to redeem', nearby: 'Notify me when I am nearby',
      saved: 'Saved', coupons: 'Coupons', settings: 'Settings', language: 'Language', theme: 'Theme',
      accent: 'Accent colour', notifications: 'Notifications', markRead: 'Mark all as read',
      account: 'Account', logout: 'Sign out', bizPanel: 'Business panel', guest: 'Guest', loginCta: 'Sign in',
      scanTitle: 'Scan the sticker in the window', scanSub: 'The code works 24/7 — even when the venue is closed.',
      scanBtn: 'Simulate scan', hours: 'Hours', address: 'Address', phone: 'Phone'
    },
    it: {
      tagline: 'Scopri la città e i suoi eventi', google: 'Continua con Google', email: 'Continua con e-mail',
      or: 'OPPURE', skip: 'Salta ed esplora', bizQ: 'Hai un locale?', bizLink: 'Accedi come azienda',
      step1: 'Passo 1 di 2', step2: 'Passo 2 di 2', mailTitle: 'Inserisci la tua e-mail', codeTitle: 'Inserisci il codice',
      sendCode: 'Invia il codice', checking: 'Verifico il codice', navDiscover: 'Scopri', navMap: 'Mappa', navScan: 'Scansiona',
      navSaved: 'Salvati', navProfile: 'Profilo', searchPh: 'Cerca locali, cucina, eventi',
      today: 'Oggi in città', near: 'Vicino a te', all: 'Tutto', open: 'Aperto', closed: 'Chiuso', until: 'fino alle',
      route: 'Percorso', call: 'Chiama', site: 'Sito', menu: 'Menu', photos: 'Foto', reviews: 'Recensioni',
      stories: 'Storie ed eventi', gsource: 'Dati dal profilo Google', refreshed: 'aggiornati 12 min fa',
      coupon: 'Premio per la scansione', slide: 'Scorri per riscattare', nearby: 'Avvisami quando sono vicino',
      saved: 'Salvati', coupons: 'Coupon', settings: 'Impostazioni', language: 'Lingua', theme: 'Tema',
      accent: 'Colore d\'accento', notifications: 'Notifiche', markRead: 'Segna tutte come lette',
      account: 'Account', logout: 'Esci', bizPanel: 'Pannello azienda', guest: 'Ospite', loginCta: 'Accedi',
      scanTitle: 'Scansiona l\'adesivo in vetrina', scanSub: 'Il codice funziona 24/7 — anche a locale chiuso.',
      scanBtn: 'Simula la scansione', hours: 'Orari', address: 'Indirizzo', phone: 'Telefono'
    }
  };

  venues = MOCK.venues;

  state = {
    isBizLogin: true,
    bizLoginTab: 'register',
    friendsOpen: false,
    friendsTab: 'ranking',
    friendsQuery: '',
    groupInviteOpen: false,
    inviteVenue: 'Nokturn Wine & Vinyl',
    inviteCode: 'TAPI-PACZKA-15',
    inviteCopied: false,
    saveSubTab: 'saved',
    followCount: 1420,
    isFollowing: false,
    ocrStep: 0,
    ocrPages: [],
    ocrLang: 'pl',
    ocrAnalyzing: false,
    ocrResult: null,
    settingsQuery: '',
    proxRadius: 5,
    selectedAvatar: 'initials',
    userBio: 'Kraków, Kazimierz',
    userNip: '6762589912',
    phase: 'splash', tab: 'discover', loading: false, lang: 'pl', theme: 'papier', accent: 'las',
    query: '', cat: 'all', venue: 'nokturn', scanned: false, scan: 'idle',
    sortBy: 'reco', fPrice: 0, fRating: 0, fOpen: false, sortOpen: false,
    bizSub: 'stats', redeemOpen: false, redeemMode: 'scan', redeemCode: '', redeemState: 'idle',
    redeem: 0, dragging: false, coupon: null, secs: 900, geo: false,
    user: null, mail: null, mailStep: 'mail', code: '', pending: null,
    notifOpen: false, notifRead: false, savedIds: ['brama'], savedTab: 'saved',
    collections: [
      { id: 'randka', pl: 'Randka bez planu', en: 'Date, no plan', it: 'Appuntamento senza piano', ids: ['nokturn', 'ostra'] },
      { id: 'praca', pl: 'Kawa do pracy', en: 'Coffee to work', it: 'Caffè per lavorare', ids: ['brama'] }
    ],
    colOpen: null, colNew: false, colDraft: '',
    biz: 'landing', plan: 'base', bizQuery: '', bizPicked: null, oTab: 'home', storyTpl: 0,
    profTab: 'saved', payMethod: 'card', area: 'all', partnersOpen: false,
    langOpen: false, langQuery: '', langAuto: 'pl', navFly: null, bizFly: null, dragX: 0, swiped: false,
    dScroll: false, pScroll: false, headSearch: false, quickOpen: false, quickSec: null, quickPage: null, navDragging: false, navHover: null,
    revSort: 'new', revFilter: 0, revSortOpen: false,
    standOpen: false, standColor: 'white', standName: '', standOrdered: false, standRot: -18, standDrag: false,
    revDraft: '', revStars: 5, myRevs: {},
    bizPane: null, twoFa: true,
    bizData: { name: 'Nokturn', addr: 'ul. Estery 14, Kraków', phone: '+48 12 430 22 18', mail: 'kontakt@nokturn.pl', nip: '676 244 18 02' },
    team: [{ name: 'Marta Sekuła', mail: 'marta@nokturn.pl', owner: true }, { name: 'Piotr Rej', mail: 'piotr@nokturn.pl', owner: false }],
    bizNotif: { scan: true, review: true, payout: true, tips: false },
    bizSub: 'card', cardEdit: false, replyTo: null, replyDraft: '',
    evWhen: 'all', savedEvents: [], couponOpen: false, cDraft: { name: '', cond: 0, limit: 0, days: 0 },
    coupons: [
      { pl: 'Kieliszek wina domu', en: 'House glass of wine', cpl: 'Za pierwszy skan naklejki', cen: 'For a first sticker scan', n: 62, limit: 0, on: true },
      { pl: '−20% na całą kartę', en: '20% off the whole menu', cpl: 'Pn–Cz do 20:00', cen: 'Mon–Thu until 8 pm', n: 24, limit: 100, on: true },
      { pl: 'Deser od szefa', en: 'Dessert on the house', cpl: 'Od piątej wizyty', cen: 'From the fifth visit', n: 10, limit: 50, on: false }
    ],
    cardDesc: 'Wine bar na Kazimierzu. Trzydzieści pozycji na kartę, połowa z Gruzji i Słowenii, do tego deska serów z Podgórza. Wieczorami winyl, nigdy za głośno.',
    cardStories: [{ title: 'Degustacja Gruzji, czwartek', g: 0 }, { title: 'Nowa karta jesienna', g: 1 }, { title: 'Winyl: Ella Fitzgerald', g: 2 }],
    cardRevs: [
      { name: 'Klara Z.', stars: 5, wpl: '3 dni temu', wen: '3 days ago', tpl: 'Najlepsza obsługa na Kazimierzu. Doradzili wino, którego bym sama nie wybrała, i strzał w dziesiątkę.', ten: 'Best service in Kazimierz. They picked a wine I would never have chosen myself, and it was spot on.', reply: null },
      { name: 'Marek W.', stars: 4, wpl: 'tydzień temu', wen: 'a week ago', tpl: 'Świetne wina, ale w piątek po 22:00 nie ma gdzie usiąść. Warto zadzwonić wcześniej.', ten: 'Great wines, but after 10 pm on Friday there is nowhere to sit. Worth calling ahead.', reply: null },
      { name: 'Ada L.', stars: 5, wpl: '2 tygodnie temu', wen: '2 weeks ago', tpl: 'Przyszłam po kupon ze skanu, zostałam na trzy godziny. Deska serów obowiązkowo.', ten: 'Came in for the scan coupon, stayed three hours. Get the cheese board.', reply: 'Dziękujemy! Deska wraca w nowej karcie od piątku.' }
    ],
    partners: { nokturn: ['brama', 'ostra'], brama: ['nokturn'], ostra: ['forum'], forum: ['brama'] },
    notif: { msg: true, prox: false, offers: true, news: false },
    offerState: { happy: true, story: false, vinyl: true }, toast: null,
    interests: [], interestsSaved: false, interestsOpen: false,
    mapQ: '', mapCat: 'all', mapPanel: 'closed', geoAllowed: false, geoDismissed: false, push: false, explored: [],
    pin: null, pinClosing: false, pinShown: false, helpOpen: false, tour: 0, tourDone: false,
    altOpen: false, altPicked: null, billing: 'y', plansOpen: false, plansSeen: false,
    trial: false, trialDays: 14, qty: 10, entered: false,
    bizAccount: false, navDir: 1, interestsSheet: false, savedOpen: false, bizTour: 0,
    following: [], venueMenu: false, report: null, mapStats: false, delAcc: null, delTyped: '', route: null,
    menuScan: false, scanPhase: 0, menuItems: [], invite: false,
    tripStep: 0, tripDays: 3, tripBudget: 700, tripPace: 'normal', tripWho: 'para',
    tripIntro: true, tripNoBudget: false,
    tripInts: [], tripPlan: null, tripDay: 0, tripGen: false, tripSeed: 0,
    me: { name: '', mail: '', phone: '+48 600 118 240', city: 'Kraków', born: '1994' },
    meSaved: { name: '', mail: '', phone: '+48 600 118 240', city: 'Kraków', born: '1994' }, meEdit: false
  };

  navOrder = ['discover', 'map', 'scan', 'friends', 'profile'];
  bizOrder = ['home', 'stories', 'scans', 'profile'];

  spots = MOCK.spots;

  eventDefs = MOCK.eventDefs;

  slotTimes = { am: ['09:30', '11:40'], pm: ['14:00', '16:20'], eve: ['19:00', '21:40'] };
  paceSlots = { spokojne: ['am', 'pm', 'eve'], normal: ['am', 'pm', 'pm', 'eve'], intensywne: ['am', 'am', 'pm', 'pm', 'eve', 'eve'] };

  buildTrip() {
    const st = this.state;
    const tpl = this.paceSlots[st.tripPace] || this.paceSlots.normal;
    const dayBudget = st.tripNoBudget ? 1e9 : st.tripBudget / Math.max(1, st.tripDays);
    const ints = st.tripInts;
    const seed = st.tripSeed || 0;
    const ranked = this.spots.map((s, i) => {
      const hit = ints.length ? s.tags.filter((t) => ints.indexOf(t) > -1).length : 0.6;
      const rnd = (((i + 1) * 37 + seed * 53) % 13) / 13;
      return { s: s, score: hit * 3 + rnd - (s.price > dayBudget * 0.55 ? 1.4 : 0) };
    }).sort((a, b) => b.score - a.score).map((x) => x.s);

    const used = {}, days = [];
    for (let d = 0; d < st.tripDays; d++) {
      const items = []; let spend = 0; const slotUse = { am: 0, pm: 0, eve: 0 };
      tpl.forEach((slot) => {
        let pool = ranked.filter((s) => !used[s.id] && s.slot === slot);
        if (!pool.length) { ranked.forEach((s) => { if (s.slot === slot) delete used[s.id]; });
          pool = ranked.filter((s) => s.slot === slot); }
        const fit = pool.filter((s) => spend + s.price <= dayBudget);
        const pick = fit[0] || pool[0];
        if (!pick) return;
        used[pick.id] = true; spend += pick.price;
        const time = (this.slotTimes[slot] || ['12:00'])[Math.min(slotUse[slot], 1)] || '12:00';
        slotUse[slot]++;
        items.push({ s: pick, time: time, slot: slot });
      });
      days.push({ items: items, spend: spend });
    }
    const total = days.reduce((a, b) => a + b.spend, 0);
    this.setState({ tripPlan: { days: days, total: total }, tripDay: 0, tripGen: false, tripStep: 4 });
  }

  runTrip() {
    this.setState({ tripGen: true, tripStep: 3 });
    clearTimeout(this.tripT);
    this.tripT = setTimeout(() => this.buildTrip(), 2100);
  }

  standDragStart(e) { this.sd = { x: e.clientX, r: this.state.standRot || 0 }; this.setState({ standDrag: true }); }
  standDragMove(e) { if (!this.sd) return; const r = this.sd.r + (e.clientX - this.sd.x) * 0.6;
    this.setState({ standRot: Math.max(-165, Math.min(165, r)) }); }
  standDragEnd() { this.sd = null; if (this.state.standDrag) this.setState({ standDrag: false }); }

  onDiscScroll(e) {
    const y = (e.target && e.target.scrollTop) || 0;
    const dy = y - (this.lastDScroll || 0);
    this.lastDScroll = y;
    if (y < 20) {
      this.setState({ dScroll: false });
    } else if (dy > 3) {
      if (!this.state.dScroll) this.setState({ dScroll: true });
    } else if (dy < -5) {
      if (this.state.dScroll) this.setState({ dScroll: false });
    }
  }

  quickLines() {
    const st = this.state;
    const p = st.quickPage;
    const pts = 240 + (st.savedIds.length * 20) + (st.scanned ? 60 : 0) + (Object.keys(st.myRevs || {}).length * 40);
    if (p === 'saved') return [
      { k: this.l3('Zapisane miejsca', 'Saved places', 'Locali salvati'), v: String(st.savedIds.length) },
      { k: this.l3('Kolekcje', 'Collections', 'Raccolte'), v: String(st.collections.length) },
      { k: this.l3('Aktywne kupony', 'Active coupons', 'Coupon attivi'), v: st.coupon ? '1' : '0' }
    ];
    if (p === 'konto') return [
      { k: this.l3('Imi\u0119', 'Name', 'Nome'), v: (st.user && st.user.name) || st.me.name || this.l3('Go\u015b\u0107', 'Guest', 'Ospite') },
      { k: 'E-mail', v: (st.user && st.user.mail) || st.me.mail || '\u2014' },
      { k: this.l3('Miasto', 'City', 'Citt\u00e0'), v: st.me.city }
    ];
    if (p === 'plan') return [
      { k: this.l3('Punkty', 'Points', 'Punti'), v: String(pts) },
      { k: this.l3('Poziom', 'Level', 'Livello'), v: String(Math.floor(pts / 400) + 1) },
      { k: this.l3('Do nast\u0119pnego', 'To next level', 'Al livello successivo'), v: (400 - (pts % 400)) + ' ' + this.l3('pkt', 'pts', 'pt') }
    ];
    if (p === 'set') return [
      { k: this.l3('J\u0119zyk', 'Language', 'Lingua'), v: { pl: 'Polski', en: 'English', it: 'Italiano' }[st.lang] },
      { k: this.l3('Motyw', 'Theme', 'Tema'), v: this.themes[st.theme].dark ? this.l3('Ciemny', 'Dark', 'Scuro') : this.l3('Jasny', 'Light', 'Chiaro') },
      { k: this.l3('Akcent', 'Accent', 'Accento'), v: this.accents[st.accent].label }
    ];
    return [];
  }


  navRect(el) { return el.getBoundingClientRect(); }

  navAt(x, r) {
    const n = this.navOrder.length;
    const step = (r.width - 12) / n;
    const i = Math.max(0, Math.min(n - 1, Math.floor((x - r.left - 6) / step)));
    return this.navOrder[i];
  }

  navDown(e) {
    const el = e.currentTarget;
    try { el.setPointerCapture(e.pointerId); } catch (err) {}
    this.navR = this.navRect(el);
    const id = this.navAt(e.clientX, this.navR);
    this.navMoved = false;
    this.navX0 = e.clientX;
    this.setState({ navDragging: true, navHover: id });
    this.buzz(8);
  }

  navMove(e) {
    if (!this.state.navDragging || !this.navR) return;
    if (Math.abs(e.clientX - this.navX0) > 5) this.navMoved = true;
    const id = this.navAt(e.clientX, this.navR);
    if (id === this.state.navHover) return;
    const cur = this.state.tab === 'venue' ? 'discover' : this.state.tab;
    const d = this.navOrder.indexOf(id) - this.navOrder.indexOf(cur);
    this.setState({ navHover: id, dragX: Math.max(-92, Math.min(92, -d * 34)) });
    this.buzz(11);
  }

  navUp() {
    if (!this.state.navDragging) return;
    const id = this.state.navHover;
    this.navSkipClick = true;
    setTimeout(() => { this.navSkipClick = false; }, 320);
    this.setState({ navDragging: false, navHover: null, dragX: 0 });
    const cur = this.state.tab === 'venue' ? 'discover' : this.state.tab;
    if (id && id !== cur) { this.buzz([0, 14]); this.go(id); }
  }

  swipeStart(e) {
    const t = e.target;
    if (t && t.closest && (t.closest('.leaflet-container') || t.closest('input') || t.closest('textarea') || t.closest('[data-noswipe]'))) { this.sw = null; return; }
    this.sw = { x: e.clientX, y: e.clientY, lock: null };
  }
  swipeMove(e) {
    const s = this.sw; if (!s) return;
    const dx = e.clientX - s.x, dy = e.clientY - s.y;
    if (!s.lock) {
      if (Math.abs(dx) > 14 && Math.abs(dx) > Math.abs(dy) * 1.5) s.lock = 'x';
      else if (Math.abs(dy) > 14) s.lock = 'y';
    }
    if (s.lock === 'x') {
      const st = this.state;
      const order = st.phase === 'biz' ? this.bizOrder : this.navOrder;
      const cur = st.phase === 'biz' ? st.oTab : (st.tab === 'venue' ? 'discover' : st.tab);
      const i = order.indexOf(cur);
      const edge = (i <= 0 && dx > 0) || (i >= order.length - 1 && dx < 0);
      const capped = edge ? dx * 0.22 : dx;
      if (Math.abs(capped - (st.dragX || 0)) > 0.6) this.setState({ dragX: capped, swiped: true });
    }
  }
  swipeEnd(e) {
    const s = this.sw; this.sw = null;
    if (this.state.dragX) this.setState({ dragX: 0 });
    if (!s || s.lock !== 'x') return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) < 58) return;
    const st = this.state;
    const biz = st.phase === 'biz';
    const order = biz ? this.bizOrder : this.navOrder;
    const cur = biz ? st.oTab : (st.tab === 'venue' ? 'discover' : st.tab);
    let i = order.indexOf(cur);
    if (i < 0) return;
    i += dx < 0 ? 1 : -1;
    if (i < 0 || i >= order.length) return;
    if (biz) this.goBiz(order[i], dx < 0 ? 1 : -1);
    else this.go(order[i]);
  }

  sheetSwipeStart(e) {
    const t = e.target;
    if (t && t.closest && (t.closest('input') || t.closest('textarea'))) return;
    this.shSw = { y: e.clientY, lock: null };
  }
  sheetSwipeMove(e) {
    const s = this.shSw; if (!s) return;
    const dy = e.clientY - s.y;
    if (!s.lock && dy > 12) s.lock = true;
    if (s.lock) this.setState({ sheetDragY: Math.max(0, dy) });
  }
  sheetSwipeEnd() {
    const s = this.shSw; this.shSw = null;
    const d = this.state.sheetDragY || 0;
    this.setState({ sheetDragY: 0 });
    if (s && s.lock && d > 60) {
      this.buzz(8);
      this.setState({ standOpen: false, coupon: null, langOpen: false, partnersOpen: false, redeemOpen: false, altOpen: false, plansOpen: false, helpOpen: false });
    }
  }

  toastSwipeStart(e) {
    this.tSw = { y: e.clientY, lock: null };
  }
  toastSwipeMove(e) {
    const s = this.tSw; if (!s) return;
    const dy = e.clientY - s.y;
    if (!s.lock && dy < -8) s.lock = true;
    if (s.lock) this.setState({ toastDragY: Math.min(0, dy) });
  }
  toastSwipeEnd() {
    const s = this.tSw; this.tSw = null;
    const d = this.state.toastDragY || 0;
    this.setState({ toastDragY: 0 });
    if (s && s.lock && d < -30) {
      this.setState({ toast: '' });
    }
  }

  interestDefs = MOCK.interestDefs;

  tourDefs = [
    { pl: ['Odkrywaj', 'Tu ląduje wszystko, co dziś dzieje się obok ciebie — lokale, okazje, wydarzenia.'], en: ['Discover', 'Everything happening near you today — venues, deals, events.'] },
    { pl: ['Mapa', 'Miasto zaczyna się zamglone. Odkrywasz kolejne kwartały, chodząc po nich.'], en: ['Map', 'The city starts foggy. You uncover districts by walking them.'] },
    { pl: ['Skanuj', 'Zeskanuj naklejkę w witrynie i odbierz kupon — działa też, gdy lokal jest zamknięty.'], en: ['Scan', 'Scan the window sticker to grab a coupon — even when the venue is closed.'] },
    { pl: ['Plan wyjazdu', 'Podaj ile masz dni, jaki budżet i co lubisz — ułożymy rozpiskę godzina po godzinie.'], en: ['Trip plan', 'Tell us your days, budget and taste — we lay out an hour-by-hour itinerary.'] },
    { pl: ['Profil', 'Zapisane miejsca, kupony, twoje dane i ustawienia — wszystko w jednym.'], en: ['Profile', 'Saved places, coupons, your details and settings — all in one.'] }
  ];

  bizTourDefs = [
    { pl: ['Jesteś w aplikacji', 'Konto firmowe widzi dokładnie to, co goście — plus swoje narzędzia. Zacznij od Odkrywaj.'], en: ['You are in the app', 'A business account sees exactly what guests see — plus its own tools. Start with Discover.'] },
    { pl: ['Mapa i twoja pinezka', 'Sprawdź, jak twój lokal wygląda z poziomu gościa i kto jest w okolicy.'], en: ['Map and your pin', 'See how your venue looks to a guest and who is nearby.'] },
    { pl: ['Panel firmy jest w Profilu', 'Pulpit, oferty, kod QR i dane firmy — wszystko pod zakładką Profil.'], en: ['The business panel lives in Profile', 'Dashboard, offers, QR code and business details — all under Profile.'] }
  ];

  emailRef = React.createRef();
  searchRef = React.createRef();
  discRef = React.createRef();
  bizRef = React.createRef();
  delRef = React.createRef();
  gAll = MOCK.gAll;
  gHits(st) {
    const q = ((st.bizQuery || '') + '').trim().toLowerCase();
    if (q.length < 2) return [];
    return (st.gReal || []).slice(0, 6);
  }
  mapRef = React.createRef();
  fogRef = React.createRef();
  popRef = React.createRef();
  mapSearchRef = React.createRef();
  headRef = React.createRef();

  /**
   * Katalog lokali i afisz wydarzeń z bazy.
   *
   * MOCK zostaje jako zapas. Bez sieci albo przy błędzie aplikacja pokazuje to,
   * co ma wbudowane — pusta lista wygląda jak awaria, a nie jak brak zasięgu.
   * Dlatego podmieniamy dopiero wtedy, gdy naprawdę coś przyszło.
   *
   * `od` to pozycja gościa. Podana — odległości są prawdziwe; pominięta —
   * w ich miejscu jest myślnik.
   */
  loadCatalog(od) {
    if (!window.TAPI || !window.TAPI.call) {
      // Most dokłada się po załadowaniu dokumentu, a ten kod biegnie wcześniej.
      // Czekamy na sygnał zamiast odpytywać w pętli — inaczej pierwsze
      // zapytanie przepada i katalog zostaje na danych z pliku do końca sesji.
      if (!this._venuesWaiting) {
        this._venuesWaiting = true;
        window.addEventListener('tapi:ready', () => {
          this._venuesWaiting = false;
          this.loadCatalog(od);
        }, { once: true });
      }
      return;
    }

    window.TAPI.call('db.venues', od || {}).then((r) => {
      if (!r || r.error || !r.venues || !r.venues.length) return;
      this.venues = r.venues;
      this.setState({ venuesSrc: 'baza' });
    }).catch(() => {});

    // Wydarzenia osobnym zapytaniem, nie jednym z lokalami. Gdy jedno padnie,
    // drugie ma się pokazać — katalog i afisz to dwie niezależne rzeczy.
    // Pusta lista jest tu prawidłową odpowiedzią: znaczy „nic w planie",
    // a nie „nie udało się", więc podmieniamy także wtedy.
    window.TAPI.call('db.events', od || {}).then((r) => {
      if (!r || r.error || !Array.isArray(r.events)) return;
      this.eventDefs = r.events;
      this.setState({ eventsSrc: 'baza' });
    }).catch(() => {});
  }

  componentDidMount() {
    const d = this.detectLang();
    if (d !== 'pl') this.setState({ lang: d, langAuto: d });
    this.loadCatalog();
    this.splashT = setTimeout(() => this.setState({ phase: 'auth' }), 2150);
    this.tick = setInterval(() => {
      if (this.state.coupon && this.state.secs > 0) this.setState((s) => ({ secs: s.secs - 1 }));
    }, 1000);
  }
  componentDidUpdate() { this.syncMap(); this.updateFog(); this.updatePinPos(); }

  updateFog() {
    const el = this.fogRef.current;
    if (!el || !this.map) return;
    const ex = this.state.explored || [];
    if (!ex.length) { el.style.webkitMaskImage = 'none'; el.style.maskImage = 'none'; return; }
    const z = this.map.getZoom();
    const parts = ex.map((e) => {
      const p = this.map.latLngToContainerPoint([e[0], e[1]]);
      const mpp = 40075016.686 * Math.cos(e[0] * Math.PI / 180) / (256 * Math.pow(2, z));
      const k = this.revealK == null ? 1 : this.revealK;
      const r = Math.max(24, e[2] / mpp) * k;
      return 'radial-gradient(circle ' + r.toFixed(1) + 'px at ' + p.x.toFixed(1) + 'px ' + p.y.toFixed(1) + 'px, transparent 0, transparent 52%, #000 100%)';
    });
    const v = parts.join(', ');
    el.style.webkitMaskImage = v; el.style.maskImage = v;
    el.style.webkitMaskComposite = 'source-in'; el.style.maskComposite = 'intersect';
  }

  updatePinPos() {
    const el = this.popRef.current;
    if (!el || !this.map || !this.state.pin) return;
    const v = this.venues.filter((x) => x.id === this.state.pin)[0];
    if (!v) return;
    const p = this.map.latLngToContainerPoint([v.lat, v.lng]);
    el.style.left = p.x + 'px';
    el.style.top = p.y + 'px';
  }

  openPin(id) {
    clearTimeout(this.pinT);
    this.setState({ pin: id, pinClosing: false, pinShown: false });
    setTimeout(() => { this.updatePinPos(); this.setState({ pinShown: true }); }, 20);
  }

  closePin() {
    if (!this.state.pin || this.state.pinClosing) return;
    this.setState({ pinClosing: true, pinShown: false });
    clearTimeout(this.pinT);
    this.pinT = setTimeout(() => this.setState({ pin: null, pinClosing: false }), 340);
  }

  allowGeo() {
    const fallbackSpots = [[50.0483, 19.9448, 430], [50.0512, 19.9445, 250], [50.0455, 19.9535, 230]];
    const proceed = (spots) => {
      this.revealK = 0;
      this.setState({ geoAllowed: true, explored: spots, geoDismissed: true, mapBurst: true, mapPanel: 'open' });
      this.buzz(14);
      setTimeout(() => { this.updateFog(); this.runReveal(); }, 60);
      clearTimeout(this.burstT);
      this.burstT = setTimeout(() => this.setState({ mapBurst: false }), 2000);
      setTimeout(() => this.toast(this.l3('Odkryto teren z GPS. Mapa nabrała koloru.', 'GPS area uncovered. The map has colour now.', 'Area GPS svelata. La mappa ha preso colore.')), 1250);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        // Pozycja nie służy tylko do zdjęcia mgły z mapy. Z nią odległości
        // przy lokalach przestają być ozdobą i zaczynają coś znaczyć, więc
        // od razu prosimy o katalog policzony względem gościa.
        this.geo = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        this.loadCatalog(this.geo);
        proceed(fallbackSpots); // In reality we'd map lat/lon to map spots
      }, (err) => {
        this.toast('Błąd GPS: ' + err.message);
        proceed(fallbackSpots);
      });
    } else {
      proceed(fallbackSpots);
    }
  }

  runReveal() {
    cancelAnimationFrame(this.rafR);
    const t0 = (window.performance || Date).now();
    const step = () => {
      const p = Math.min(1, ((window.performance || Date).now() - t0) / 1250);
      this.revealK = 1 - Math.pow(1 - p, 3);
      this.updateFog();
      if (p < 1) this.rafR = requestAnimationFrame(step); else this.revealK = 1;
    };
    this.rafR = requestAnimationFrame(step);
  }

  mapProgress() {
    const ex = this.state.explored || [];
    const t = Math.PI / 180;
    const gap = (a, b, c, d) => {
      const dLat = (c - a) * t, dLng = (d - b) * t;
      const x = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a * t) * Math.cos(c * t) * Math.pow(Math.sin(dLng / 2), 2);
      return 2 * 6371000 * Math.asin(Math.sqrt(x));
    };
    const inside = this.venues.filter((v) => ex.some((e) => gap(e[0], e[1], v.lat, v.lng) <= e[2]));
    const areas = [], open = [];
    this.venues.forEach((v) => { if (areas.indexOf(v.district) < 0) areas.push(v.district); });
    inside.forEach((v) => { if (open.indexOf(v.district) < 0) open.push(v.district); });
    return { pct: areas.length ? Math.round((open.length / areas.length) * 100) : 0,
      visited: inside.length, total: this.venues.length, areas: open.length, allAreas: areas.length };
  }

  startTour() {
    if (this.state.tourDone) return;
    clearTimeout(this.tourT);
    this.tourT = setTimeout(() => { if (!this.state.tourDone) this.setState({ tour: 1 }); }, 1500);
  }
  componentWillUnmount() {
    clearTimeout(this.flyT); clearTimeout(this.bFlyT); clearTimeout(this.rT); clearTimeout(this.tripT);
    clearTimeout(this.splashT); clearInterval(this.tick); clearTimeout(this.toastT);
    clearTimeout(this.authT); clearTimeout(this.loadT); clearInterval(this.scanT); clearInterval(this.leafletWait);
    if (this.map) { this.map.remove(); this.map = null; }
  }

  syncMap() {
    const on = this.state.phase === 'app' && this.state.tab === 'map';
    if (!on) { if (this.map) { this.map.remove(); this.map = null; } return; }
    const el = this.mapRef.current;
    if (!el || this.map) return;
    if (!window.L) {
      if (this.state.mapFail) return;
      if (!document.getElementById('leaflet-css')) {
        const c = document.createElement('link');
        c.id = 'leaflet-css'; c.rel = 'stylesheet';
        c.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(c);
      }
      if (!document.getElementById('leaflet-js')) {
        const s = document.createElement('script');
        s.id = 'leaflet-js'; s.async = true;
        s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        s.onerror = () => this.setState({ mapFail: true });
        document.head.appendChild(s);
      }
      if (!this.leafletWait) {
        let tries = 0;
        this.leafletWait = setInterval(() => {
          tries++;
          if (window.L) { clearInterval(this.leafletWait); this.leafletWait = null; this.syncMap(); return; }
          if (tries > 40) { clearInterval(this.leafletWait); this.leafletWait = null; this.setState({ mapFail: true }); }
        }, 200);
      }
      return;
    }
    const L = window.L;
    const dark = this.themes[this.state.theme].dark;
    this.map = L.map(el, { zoomControl: false, attributionControl: false }).setView([50.0483, 19.9448], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/' + (dark ? 'dark_all' : 'light_all') + '/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(this.map);
    const acc = this.accents[this.state.accent].hex;
    this.markers = {};
    this.venues.forEach((v) => {
      const hasStory = (v.votes > 150 || v.id === 'ostra' || v.id === 'nokturn');
      const grad = 'linear-gradient(45deg, #F58529, #DD2A7B, #8134AF)';
      const outerBg = hasStory ? grad : 'transparent';
      const gapBg = hasStory ? '#FFF' : 'transparent';
      const htmlStr = `<div style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:999px;background:${outerBg};">` +
                      `<div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:${gapBg};">` +
                      `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:999px;background:${acc};color:#fff;font:600 11px Instrument Sans,sans-serif;box-shadow:0 4px 12px rgba(22,24,28,.3);">${v.rating.toFixed(1)}</div>` +
                      `</div></div>`;
      const icon = L.divIcon({ className: '', iconSize: [38, 38], iconAnchor: [19, 19], html: htmlStr });
      const m = L.marker([v.lat, v.lng], { icon: icon }).addTo(this.map);
      m.on('click', (e) => { if (e.originalEvent) L.DomEvent.stopPropagation(e.originalEvent); this.openPin(v.id); });
      this.markers[v.id] = m;
    });
    this.map.on('move zoom moveend zoomend', () => { this.updateFog(); this.updatePinPos(); });
    this.map.on('zoomstart', () => this.setState({ mapZooming: true }));
    this.map.on('zoomend', () => this.setState({ mapZooming: false }));
    this.map.on('click', () => { this.closePin(); this.setState({ mapPanel: 'closed' }); });
    setTimeout(() => { if (this.map) { this.map.invalidateSize(); this.updateFog(); } }, 200);
  }

  toast(msg) { clearTimeout(this.toastT); this.setState({ toast: msg }); this.toastT = setTimeout(() => this.setState({ toast: null }), 2600); }

  go(tab) {
    if (tab === this.state.tab) return;
    this.buzz(9);
    if (tab === 'profile' && this.state.bizAccount) this.setState({ profTab: 'konto' });
    clearTimeout(this.loadT);
    const cur = this.state.tab === 'venue' ? 'discover' : this.state.tab;
    const a = this.navOrder.indexOf(cur), b = this.navOrder.indexOf(tab);
    const dir = (a > -1 && b > -1) ? (b > a ? 1 : -1) : 1;
    this.setState({ tab: tab, navDir: dir, loading: tab === 'discover', dragX: 0, swiped: false });
    if (a > -1 && b > -1 && a !== b) {
      clearTimeout(this.flyT);
      this.setState({ navFly: [Math.min(a, b), Math.max(a, b)] });
      this.flyT = setTimeout(() => this.setState({ navFly: null }), 250);
    }
    if (tab !== 'scan') this.stopCamera();
    this.loadT = setTimeout(() => {
      this.setState({ loading: false });
      if (tab === 'scan') this.startCamera();
    }, 420);
  }

  startCamera() {
    if (this.videoStream) return;
    const v = document.getElementById('qrVideo');
    if (!v) return;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          this.videoStream = stream;
          v.srcObject = stream;
        }).catch(err => console.log('Camera error:', err));
    }
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(t => t.stop());
      this.videoStream = null;
    }
  }

  goBiz(id, dir) {
    const a = this.bizOrder.indexOf(this.state.oTab), b = this.bizOrder.indexOf(id);
    if (b < 0 || a === b) return;
    this.setState({ oTab: id, navDir: dir || (b > a ? 1 : -1), dragX: 0, swiped: false });
    clearTimeout(this.bFlyT);
    this.setState({ bizFly: [Math.min(a, b), Math.max(a, b)] });
    this.bFlyT = setTimeout(() => this.setState({ bizFly: null }), 250);
  }

  needAuth(fn) {
    if (this.state.user) { fn(); return; }
    this.setState({ pending: fn, gate: true });
  }

  finishLogin(name) {
    const fn = this.state.pending;
    this.setState({ user: { name: name, mail: this.state.mailAddr || 'ty@tapi.app' }, mail: null, gate: false, mailStep: 'mail', code: '', pending: null, phase: 'app', entered: true, confetti: true });
    this.buzz(16);
    clearTimeout(this.confT);
    this.confT = setTimeout(() => this.setState({ confetti: false }), 3200);
    this.toast(this.state.lang === 'pl' ? 'Cześć, ' + name.split(' ')[0] + '. Punkty i kupony są już zapisywane.' : 'Hi ' + name.split(' ')[0] + '. Your points are being saved now.');
    this.startTour();
    if (fn) setTimeout(fn, 320);
  }

  keyTap(ch) {
    if (ch === 'del') { this.setState({ code: this.state.code.slice(0, -1) }); return; }
    if (ch === 'ok') { if (this.state.code.length === 6) this.verify(); return; }
    const code = (this.state.code + ch).slice(0, 4);
    this.setState({ code: code });
    if (code.length === 6) setTimeout(() => this.verify(), 240);
  }
  verify() {
    this.setState({ mailStep: 'wait' });
    clearTimeout(this.authT);
    if (!window.TAPI || !window.TAPI.native) {
      this.authT = setTimeout(() => this.finishLogin('Klara Ziarno'), 1150);
      return;
    }
    window.TAPI.call('auth.verifyCode', {
      email: this.state.mailAddr, code: this.state.code,
      business: this.state.isBizLogin === true
    }).then((r) => {
      if (r && r.error) { this.setState({ mailStep: 'code', code: '' }); this.toast(r.error); return; }
      const u = r && r.user;
      this.finishLogin((u && u.name) || (u && u.email) || 'Gość');
      if (u && u.isBusiness) this.setState({ bizAccount: true });
    }).catch((e) => { this.setState({ mailStep: 'code', code: '' }); this.toast(String(e.message || e)); });
  }

  openVenue(id, scanned) {
    this.buzz(8);
    this.setState({ tab: 'venue', venue: id, scanned: !!scanned, redeem: 0, loading: false });
  }

  runScan() {
    if (!window.TAPI || !window.TAPI.native) {
      this.setState({ scan: 'busy', scanStep: 0 });
      let i = 0;
      clearInterval(this.scanT);
      this.scanT = setInterval(() => {
        i++;
        if (i >= 3) { clearInterval(this.scanT); this.setState({ scan: 'idle' }); this.openVenue('nokturn', true);
          this.toast(this.state.lang === 'pl' ? 'Rozpoznano: Nokturn. Kupon czeka w wizytówce.' : 'Recognised: Nokturn. Your coupon is on the card.'); }
        else this.setState({ scanStep: i });
      }, 560);
      return;
    }

    this.setState({ scan: 'busy', scanStep: 1 });
    window.TAPI.call('camera.scanCode').then((r) => {
      this.setState({ scan: 'idle', scanStep: 0 });
      if (!r || r.cancelled) return;
      if (r.error) { this.toast(r.error); return; }

      // Kod prowadzi do lokalu. Dopóki naklejki nie są wydrukowane,
      // przyjmujemy też sam identyfikator wpisany w kodzie.
      var id = String(r.code || '');
      var m = id.match(/tapi\.app\/v\/([\w-]+)/);
      if (m) id = m[1];
      // Szukamy w katalogu, który aplikacja ma pod ręką — a to od teraz baza,
      // nie dane testowe. Naklejka wydrukowana dla nowego lokalu działałaby
      // dopiero po przebudowaniu aplikacji, gdyby zostało `window.MOCK`.
      var known = (this.venues || []).filter(function (v) { return v.id === id; })[0];
      if (!known) { this.toast(this.l3('Nie znam tego kodu.', 'Unknown code.', 'Codice sconosciuto.')); return; }

      this.openVenue(known.id, true);
      this.toast(this.l3('Rozpoznano: ', 'Recognised: ', 'Riconosciuto: ') + known.name);
    }).catch((e) => {
      this.setState({ scan: 'idle', scanStep: 0 });
      this.toast(String(e.message || e));
    });
  }

  dragStart(e) {
    this.rect = e.currentTarget.getBoundingClientRect();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    this.setState({ dragging: true }); this.drag(e.clientX);
  }
  dragMove(e) { if (this.state.dragging) this.drag(e.clientX); }
  drag(x) {
    const r = this.rect; if (!r) return;
    this.setState({ redeem: Math.max(0, Math.min(1, (x - r.left - 27) / (r.width - 54))) });
  }
  dragEnd() {
    if (!this.state.dragging) return;
    const done = this.state.redeem > 0.88;
    this.setState({ dragging: false, redeem: 0 });
    if (!done) return;
    this.needAuth(() => {
      this.setState({ coupon: this.state.venue, secs: (this.props.couponMinutes ?? 15) * 60 });
      this.toast(this.state.lang === 'pl' ? 'Kupon aktywny. Pokaż kod przy barze.' : 'Coupon active. Show the code at the bar.');
    });
  }

  toggleFollow(id) {
    this.buzz(11);
    const cur = this.state.following || [];
    const on = cur.indexOf(id) > -1;
    this.setState({ following: on ? cur.filter((x) => x !== id) : cur.concat([id]) });
    this.toast(on ? this.l3('Nie obserwujesz już tego lokalu.', 'You no longer follow this venue.', 'Non segui più questo locale.')
      : this.l3('Obserwujesz. Damy znać o nowościach.', 'Following. We will tell you what is new.', 'Lo segui. Ti diremo le novità.'));
  }

  startRoute(id) {
    this.buzz([0, 14]);
    this.setState({ tab: 'map', route: id, mapStats: false, venueMenu: false, pinOpen: false });
    this.toast(this.l3('Trasa wyznaczona — 9 minut pieszo.', 'Route ready — a 9-minute walk.', 'Percorso pronto — 9 minuti a piedi.'));
  }

  toggleSaved(id) {
    this.buzz(12);
    const has = this.state.savedIds.indexOf(id) > -1;
    this.setState({ savedIds: has ? this.state.savedIds.filter((x) => x !== id) : this.state.savedIds.concat([id]) });
    this.toast(has ? (this.state.lang === 'pl' ? 'Usunięto z zapisanych.' : 'Removed from saved.') : (this.state.lang === 'pl' ? 'Zapisano w twojej liście.' : 'Saved to your list.'));
  }

  setQuery(v) {
    if (this.searchRef.current) this.searchRef.current.value = v;
    if (this.headRef && this.headRef.current) this.headRef.current.value = v;
    this.setState({ query: v });
  }

  sugFor(st, PL) {
    const q = ((st.query || '') + '').trim().toLowerCase();
    if (q.length < 1) return [];
    const hl = (s) => {
      const i = s.toLowerCase().indexOf(q);
      return i < 0 ? { pre: s, hit: '', post: '' } : { pre: s.slice(0, i), hit: s.slice(i, i + q.length), post: s.slice(i + q.length) };
    };
    const out = [];
    this.venues.forEach((v) => {
      if ((v.name + ' ' + v.catLabel + ' ' + v.district).toLowerCase().indexOf(q) < 0) return;
      out.push(Object.assign({ isVenue: true, kind: this.l3('Lokal', 'Venue', 'Locale'),
        sub: this.dt(v.catLabel) + ' · ' + v.district + ' · ' + v.dist,
        tap: () => this.openVenue(v.id) }, hl(v.name)));
    });
    this.eventDefs.forEach((e) => {
      const name = st.lang === 'it' ? e.it : (PL ? e.pl : e.en);
      if ((name + ' ' + e.place).toLowerCase().indexOf(q) < 0) return;
      out.push(Object.assign({ isEvent: true, kind: this.l3('Wydarzenie', 'Event', 'Evento'),
        sub: e.place + ' · ' + e.time, tap: () => this.openVenue(e.venue) }, hl(name)));
    });
    [{ id: 'gastro', label: this.l3('Jedzenie', 'Food', 'Cibo') }, { id: 'kawa', label: this.l3('Kawa', 'Coffee', 'Caffè') },
     { id: 'noc', label: this.l3('Wieczorem', 'Nightlife', 'Serata') }, { id: 'event', label: this.l3('Wydarzenia', 'Events', 'Eventi') }]
      .forEach((c) => {
        if (c.label.toLowerCase().indexOf(q) < 0) return;
        out.push(Object.assign({ isTag: true, kind: this.l3('Kategoria', 'Category', 'Categoria'),
          sub: this.l3('Filtruj listę', 'Filter the list', 'Filtra la lista'),
          tap: () => { this.setState({ cat: c.id }); this.setQuery(''); } }, hl(c.label)));
      });
    const areas = [];
    this.venues.forEach((v) => { if (areas.indexOf(v.district) < 0) areas.push(v.district); });
    areas.forEach((a) => {
      if (a.toLowerCase().indexOf(q) < 0) return;
      out.push(Object.assign({ isArea: true, kind: this.l3('Dzielnica', 'Area', 'Zona'),
        sub: this.l3('Pokaż wszystko w okolicy', 'Show everything nearby', 'Mostra tutto qui vicino'),
        tap: () => { this.setState({ area: a }); this.setQuery(''); } }, hl(a)));
    });
    return out.slice(0, 6);
  }

  filtered() {
    const st = this.state;
    const q = st.query.trim().toLowerCase();
    let out = this.venues.filter((v) => {
      if (st.cat === 'followed') { if ((st.following || []).indexOf(v.id) < 0) return false; }
      else if (st.cat !== 'all' && v.cat !== st.cat) return false;
      if (st.area && st.area !== 'all' && v.district !== st.area) return false;
      if (st.fOpen && !v.isOpen) return false;
      if (st.fPrice && v.price.length > st.fPrice) return false;
      if (st.fRating && v.rating < st.fRating) return false;
      
      if (st.discoverCat && st.discoverCat !== 'all' && v.cat !== st.discoverCat) return false;
      if (st.discoverBookOnline && !(v.cat === 'rest' || v.cat === 'apt')) return false;
      
      if (!q) return true;
      return (v.name + ' ' + v.catLabel + ' ' + v.district).toLowerCase().indexOf(q) > -1;
    });
    // Bez zgody na pozycję odległość to myślnik. Takie lokale idą na koniec,
    // zamiast rozsypywać kolejność wartością NaN.
    const m = (v) => { const n = parseFloat(v.dist); return isNaN(n) ? Infinity : n * (v.dist.indexOf('km') > -1 ? 1000 : 1); };
    const s = st.sortBy || 'reco';
    if (s === 'cheap') out = out.slice().sort((a, b) => a.price.length - b.price.length || b.rating - a.rating);
    else if (s === 'rated') out = out.slice().sort((a, b) => b.rating - a.rating || b.votes - a.votes);
    else if (s === 'popular') out = out.slice().sort((a, b) => b.votes - a.votes);
    else if (s === 'near') out = out.slice().sort((a, b) => m(a) - m(b));
    
    out = out.slice().sort((a, b) => {
      const aMine = st.myVenueId === a.id || (st.user && st.myVenueId == null && a.id === 'ostra');
      const bMine = st.myVenueId === b.id || (st.user && st.myVenueId == null && b.id === 'ostra');
      if (aMine && !bMine) return -1;
      if (!aMine && bMine) return 1;
      return 0;
    });
    
    return out;
  }

  langDefs = [
    { id: 'pl', code: 'PL', native: 'Polski', en: 'Polish', full: true },
    { id: 'en', code: 'EN', native: 'English', en: 'English', full: true },
    { id: 'it', code: 'IT', native: 'Italiano', en: 'Italian', full: true },
    { id: 'de', code: 'DE', native: 'Deutsch', en: 'German' },
    { id: 'fr', code: 'FR', native: 'Français', en: 'French' },
    { id: 'es', code: 'ES', native: 'Español', en: 'Spanish' },
    { id: 'pt', code: 'PT', native: 'Português', en: 'Portuguese' },
    { id: 'nl', code: 'NL', native: 'Nederlands', en: 'Dutch' },
    { id: 'cs', code: 'CS', native: 'Čeština', en: 'Czech' },
    { id: 'sk', code: 'SK', native: 'Slovenčina', en: 'Slovak' },
    { id: 'uk', code: 'UK', native: 'Українська', en: 'Ukrainian' },
    { id: 'ru', code: 'RU', native: 'Русский', en: 'Russian' },
    { id: 'lt', code: 'LT', native: 'Lietuvių', en: 'Lithuanian' },
    { id: 'lv', code: 'LV', native: 'Latviešu', en: 'Latvian' },
    { id: 'hu', code: 'HU', native: 'Magyar', en: 'Hungarian' },
    { id: 'ro', code: 'RO', native: 'Română', en: 'Romanian' },
    { id: 'hr', code: 'HR', native: 'Hrvatski', en: 'Croatian' },
    { id: 'sv', code: 'SV', native: 'Svenska', en: 'Swedish' },
    { id: 'da', code: 'DA', native: 'Dansk', en: 'Danish' },
    { id: 'no', code: 'NO', native: 'Norsk', en: 'Norwegian' },
    { id: 'fi', code: 'FI', native: 'Suomi', en: 'Finnish' },
    { id: 'el', code: 'EL', native: 'Ελληνικά', en: 'Greek' },
    { id: 'tr', code: 'TR', native: 'Türkçe', en: 'Turkish' },
    { id: 'he', code: 'HE', native: 'עברית', en: 'Hebrew' },
    { id: 'ar', code: 'AR', native: 'العربية', en: 'Arabic' },
    { id: 'hi', code: 'HI', native: 'हिन्दी', en: 'Hindi' },
    { id: 'ja', code: 'JA', native: '日本語', en: 'Japanese' },
    { id: 'ko', code: 'KO', native: '한국어', en: 'Korean' },
    { id: 'zh', code: 'ZH', native: '中文', en: 'Chinese' }
  ];

  detectLang() {
    let tag = 'pl';
    try {
      const n = (navigator.languages && navigator.languages[0]) || navigator.language || 'pl';
      tag = String(n).toLowerCase().split('-')[0];
    } catch (e) { tag = 'pl'; }
    const hit = this.langDefs.filter((l) => l.id === tag && l.full)[0];
    return hit ? hit.id : 'en';
  }

  dataMap = {
    'Degustacja Gruzji, czwartek': 'Georgian tasting, Thursday',
    'Nowa karta jesienna': 'New autumn menu',
    'Winyl: Ella Fitzgerald': 'Vinyl: Ella Fitzgerald',
    'Wine bar na Kazimierzu. Trzydzieści pozycji na kartę, połowa z Gruzji i Słowenii, do tego deska serów z Podgórza. Wieczorami winyl, nigdy za głośno.': 'A wine bar in Kazimierz. Thirty labels on the list, half from Georgia and Slovenia, plus a cheese board from Podgórze. Vinyl in the evenings, never too loud.',
    'Dziękujemy! Deska wraca w nowej karcie od piątku.': 'Thank you! The cheese board is back on the new menu from Friday.',
    'Kawiarnia': 'Coffee bar', 'Wydarzenia': 'Events',
    'Pon': 'Mon', 'Wt': 'Tue', 'Śr': 'Wed', 'Czw': 'Thu', 'Pt': 'Fri', 'Sob': 'Sat', 'Ndz': 'Sun',
    'Zamknięte': 'Closed', 'gratis': 'free', 'od 12 zł': 'from 12 zł',
    'dziś': 'today', 'wt': 'Tue', 'czw 23:30': 'Thu 11:30 pm', 'nd 18:00': 'Sun 6 pm',
    'sob 11:00': 'Sat 11 am', 'nd 20:00': 'Sun 8 pm', 'sob 10:00': 'Sat 10 am', 'wt 19:00': 'Tue 7 pm',
    'Kieliszek bianco frizzante do pierwszego zamówienia': 'A glass of bianco frizzante with your first order',
    'Druga filtrówka za 1 zł — dziś do zamknięcia': 'Second filter coffee for 1 zł — today until closing',
    'Wejściówka −40% na silent disco (zostało 12)': 'Silent disco ticket −40% (12 left)',
    'Amuse-bouche od szefa kuchni + 15% na bar': 'Amuse-bouche from the chef + 15% off the bar',
    'Friuli, skin contact 2024': 'Friuli, skin contact 2024',
    'Deska od sąsiada': 'The neighbour’s board', 'Sery z Hali Targowej, miód': 'Cheeses from the market hall, honey',
    'Set winylowy': 'Vinyl set', 'Czw–sob od 23:30': 'Thu–Sat from 11:30 pm',
    'Filtrówka dnia': 'Filter of the day', 'Kolumbia Huila — nektarynka': 'Colombia Huila — nectarine',
    'Cynamonka': 'Cinnamon bun', 'Z pieca o 6:40': 'Out of the oven at 6:40',
    'W kubku kaucyjnym': 'In a deposit cup',
    'Trzy kanały, start 23:00': 'Three channels, 11 pm start',
    'Taras nad Wisłą': 'Terrace on the Vistula', 'Bez biletu do 22:00': 'No ticket until 10 pm',
    'Bar Hali': 'Hall bar', 'Lokalne piwa i lemonady': 'Local beers and lemonades',
    'Kiszony kalafior': 'Pickled cauliflower', 'Masło z kminkiem, orzech': 'Caraway butter, walnut',
    'Pstrąg z Ojcowa': 'Trout from Ojców', 'Śmietana, koperkowy olej': 'Cream, dill oil',
    'Sernik na zimno': 'No-bake cheesecake', 'Rabarbar z targu': 'Rhubarb from the market',
    'Najlepszy wybór win naturalnych w Krakowie. Obsługa doradza bez zadzierania nosa.': 'The best natural wine list in Kraków. The staff advise without any attitude.',
    'Kameralnie, głośniej po 23. Idealne na jednego przed nocą.': 'Intimate, louder after 11 pm. Perfect for one glass before the night.',
    'Cynamonki znikają przed 11:00 i wiem dlaczego. Kawa równa co do sekundy.': 'The cinnamon buns are gone before 11 and I know why. The coffee is spot on every time.',
    'Praca zdalna: gniazdka, cisza, dobre Wi-Fi.': 'Remote work: sockets, quiet, good Wi-Fi.',
    'Trzy kanały muzyki i nikt nikomu nie przeszkadza. Genialne.': 'Three music channels and nobody bothers anybody. Brilliant.',
    'Kolejka do słuchawek — warto przyjść przed 23.': 'There is a queue for the headphones — come before 11 pm.',
    'Dwanaście miejsc przy barze i widok na kuchnię. Rezerwacji nie ma — przychodzę o 17.': 'Twelve seats at the bar and a view of the kitchen. No bookings — I come at 5 pm.',
    'Karta zmienia się co tydzień, ceny uczciwe.': 'The menu changes every week and the prices are fair.',
    'Nowa dostawa z Friuli': 'New delivery from Friuli', 'Winylowy czwartek': 'Vinyl Thursday',
    'Degustacja pomarańczowych': 'Orange wine tasting', 'Nowa Kolumbia w młynku': 'New Colombia in the grinder',
    'Cupping w sobotę': 'Cupping on Saturday', 'Silent disco dziś 23:00': 'Silent disco tonight, 11 pm',
    'Kino na kocach': 'Blanket cinema', 'Targ śniadaniowy': 'Breakfast market',
    'Nowa karta jesienna': 'New autumn menu', 'Kolacja przy jednym stole': 'Dinner at one table'
  };

  l3(p, e, i) { return this.state.lang === 'pl' ? p : this.state.lang === 'it' ? i : e; }

  curCol() { return this.state.collections.filter((c) => c.id === this.state.colOpen)[0] || null; }

  colShots(c) {
    const gs = c.ids.map((id) => (this.venues.filter((v) => v.id === id)[0] || {}).grad).filter(Boolean).slice(0, 3);
    if (!gs.length) return [{ flex: '1', grad: 'var(--soft, rgba(31,90,70,0.1))' }];
    const fx = ['1.7', '1', '1'];
    return gs.map((g, i) => ({ flex: fx[i], grad: g }));
  }

  colCountLabel(n) {
    return n + ' ' + this.l3(n === 1 ? 'miejsce' : (n > 1 && n < 5 ? 'miejsca' : 'miejsc'), n === 1 ? 'place' : 'places', n === 1 ? 'locale' : 'locali');
  }

  createCol() {
    const n = (this.state.colDraft || '').trim();
    if (!n) { this.toast(this.l3('Nazwij kolekcję.', 'Name the collection.', 'Dai un nome alla raccolta.')); return; }
    const id = 'c' + Date.now();
    this.setState({ collections: this.state.collections.concat([{ id: id, pl: n, en: n, it: n, ids: [] }]), colNew: false, colDraft: '', colOpen: id });
  }

  deleteCol() {
    const id = this.state.colOpen;
    this.setState({ collections: this.state.collections.filter((c) => c.id !== id), colOpen: null });
    this.toast(this.l3('Kolekcja usunięta.', 'Collection deleted.', 'Raccolta eliminata.'));
  }

  toggleInCol(vid) {
    const id = this.state.colOpen;
    this.setState({ collections: this.state.collections.map((c) => c.id !== id ? c
      : Object.assign({}, c, { ids: c.ids.indexOf(vid) > -1 ? c.ids.filter((x) => x !== vid) : c.ids.concat([vid]) })) });
  }

  dt(s) {
    if (!s || this.state.lang === 'pl') return s;
    const en = this.dataMap[s] || s;
    return this.state.lang === 'it' ? (this.itMap[en] || en) : en;
  }

  itMap = {
    "Start typing the name — suggestions come straight from Google Maps.": "Inizia a scrivere il nome — i suggerimenti arrivano da Google Maps.",
    "Results from Google": "Risultati da Google",
    "No match": "Nessun risultato",
    "Check the spelling or add the venue manually — two fields is enough.": "Controlla l’ortografia o aggiungi il locale a mano — bastano due campi.",
    "Code from your bank app": "Codice dall’app della banca",
    "Add a card or Apple Pay": "Aggiungi una carta o Apple Pay",
    "Invoices use the details from the Account tab. Changes apply from the next period.": "Le fatture usano i dati della scheda Account. Le modifiche valgono dal periodo successivo.",
    "Your guests see these at the bottom of your card. If they recommend you back, both cards get a mutual badge.": "I tuoi ospiti li vedono in fondo alla tua vetrina. Se ricambiano, entrambe le vetrine ottengono il badge reciproco.",
    "Ada L. · Dessert on the house": "Ada L. · Dolce offerto",
    "Georgian tasting, Thursday": "Degustazione georgiana, giovedì",
    "Vinyl: Ella Fitzgerald": "Vinile: Ella Fitzgerald",
    "A wine bar in Kazimierz. Thirty labels on the list, half from Georgia and Slovenia, plus a cheese board from Podgórze. Vinyl in the evenings, never too loud.": "Un wine bar nel Kazimierz. Trenta etichette in carta, metà dalla Georgia e dalla Slovenia, più un tagliere di formaggi da Podgórze. Vinile la sera, mai troppo alto.",
    "Thank you! The cheese board is back on the new menu from Friday.": "Grazie! Il tagliere torna nel nuovo menu da venerdì.",
    "Best service in Kazimierz. They picked a wine I would never have chosen myself, and it was spot on.": "Il miglior servizio del Kazimierz. Mi hanno consigliato un vino che non avrei mai scelto da sola, ed era perfetto.",
    "Great wines, but after 10 pm on Friday there is nowhere to sit. Worth calling ahead.": "Vini ottimi, ma il venerdì dopo le 22 non si trova posto. Meglio chiamare prima.",
    "Came in for the scan coupon, stayed three hours. Get the cheese board.": "Sono entrata per il coupon della scansione e sono rimasta tre ore. Prendete il tagliere di formaggi.",
    "This is how a guest sees your card in the app.": "Così un ospite vede la tua vetrina nell’app.",
    "Edit mode. You change what the guest sees, live.": "Modalità modifica. Cambi in diretta ciò che vede l’ospite.",
    "EDIT": "MODIFICA", "PREVIEW": "ANTEPRIMA",
    "Open until midnight": "Aperto fino a mezzanotte",
    "Card saved. Guests see it right away.": "Vetrina salvata. Gli ospiti la vedono subito.",
    "Story added. Visible for 24 hours.": "Storia aggiunta. Visibile per 24 ore.",
    "SCANS THIS WEEK": "SCANSIONI QUESTA SETTIMANA", "REWARDS REDEEMED": "PREMI RITIRATI",
    "NEW GUESTS": "NUOVI CLIENTI", "AVERAGE SPEND": "SPESA MEDIA",
    "Scans day by day": "Scansioni giorno per giorno",
    "From view to visit": "Dalla visualizzazione alla visita",
    "Card views": "Visualizzazioni della vetrina", "QR sticker scans": "Scansioni dell’adesivo QR",
    "Coupons issued": "Coupon emessi", "Redeemed on site": "Ritirati sul posto",
    "Mo": "Lu", "Tu": "Ma", "We": "Me", "Th": "Gi", "Fr": "Ve", "Sa": "Sa", "Su": "Do",
    "Redeem a guest reward": "Ritira il premio di un ospite",
    "Scan the coupon or type 4 digits — two taps, no paperwork.": "Scansiona il coupon o digita 4 cifre — due tocchi, senza scartoffie.",
    "ISSUED TODAY": "EMESSI OGGI", "REDEEMED": "RITIRATI", "PENDING": "IN ATTESA",
    "House glass of wine": "Calice di vino della casa", "For a first sticker scan": "Alla prima scansione dell’adesivo",
    "20% off the whole menu": "−20% su tutta la carta", "Mon–Thu until 8 pm": "Lun–gio fino alle 20",
    "Dessert on the house": "Dolce offerto", "From the fifth visit": "Dalla quinta visita",
    "For every sticker scan": "Per ogni scansione dell’adesivo", "From the third visit": "Dalla terza visita",
    "Free coffee": "Caffè gratis", "20% off the menu": "−20% sulla carta",
    "ACTIVE": "ATTIVA", "PAUSED": "IN PAUSA", "active": "attiva", "paused": "in pausa",
    "Recently redeemed": "Ritirati di recente",
    "Klara Z. · Glass of wine": "Klara Z. · Calice di vino", "Marek W. · 20% off": "Marek W. · −20%",
    "Coupon published. Guests see it on their next scan.": "Coupon pubblicato. Gli ospiti lo vedono alla prossima scansione.",
    "Say what the guest gets.": "Scrivi cosa riceve l’ospite.",
    "Who you recommend": "Chi consigli",
    "Your guests see these at the bottom of your card. If that venue recommends you back, both cards get a “Mutual” badge.": "I tuoi ospiti li vedono in fondo alla tua vetrina. Se quel locale ricambia, entrambe le vetrine ottengono il badge “Reciproco”.",
    "You recommend nobody yet. Start with the neighbour your guests already visit.": "Non consigli ancora nessuno. Inizia dal vicino dove i tuoi ospiti vanno già.",
    "Add a venue": "Aggiungi un locale",
    "Nobody recommends you yet. Recommend first — most reciprocate.": "Nessuno ti consiglia ancora. Consiglia tu per primo — quasi tutti ricambiano.",
    "Venue details": "Dati del locale", "Name, address, phone, hours": "Nome, indirizzo, telefono, orari",
    "Plan and billing": "Piano e pagamenti", "Team": "Team",
    "Scans, coupons, reviews, payouts": "Scansioni, coupon, recensioni, pagamenti",
    "Two-factor: on": "Due fattori: attivo", "Two-factor: off": "Due fattori: disattivo",
    "An SMS code on every sign-in": "Un codice SMS a ogni accesso",
    "iPhone at the bar, office laptop": "iPhone al bancone, laptop in ufficio",
    "Two-factor on.": "Due fattori attivato.", "Two-factor off.": "Due fattori disattivato.",
    "You can sign out each device separately.": "Puoi disconnettere ogni dispositivo separatamente.",
    "New reviews": "Nuove recensioni", "Including anything below three stars": "Comprese quelle sotto le tre stelle",
    "Payouts and invoices": "Pagamenti e fatture", "Summary on the first of the month": "Riepilogo il primo del mese",
    "TAPI tips": "Consigli TAPI", "What to change for more scans": "Cosa cambiare per avere più scansioni",
    "The stand that redeems coupons by itself": "Il totem che convalida i coupon da solo",
    "Your stand is on its way": "Il tuo totem è in arrivo",
    "An acrylic puck for the counter with a QR code and an NFC chip. No power, no cables, no POS integration — the guest taps their phone, the coupon burns itself and you get a notification.": "Un disco in acrilico da banco con codice QR e chip NFC. Senza corrente, senza cavi, senza integrazione con la cassa — l’ospite avvicina il telefono, il coupon si convalida da solo e tu ricevi la notifica.",
    "FREE ON VIP": "GRATIS CON VIP",
    "In production · ships within 48 h": "In produzione · spedito entro 48 h",
    "Free on your plan — you only pay 19 zł shipping.": "Incluso nel tuo piano — paghi solo 19 zł di spedizione.",
    "Free on the VIP plan. 149 zł + shipping now.": "Gratis con il piano VIP. Ora 149 zł + spedizione.",
    "See the order": "Vedi l’ordine", "Order the stand": "Ordina il totem",
    "tap your phone": "avvicina il telefono", "drag to rotate": "trascina per ruotare",
    "Colour": "Colore", "White acrylic": "Acrilico bianco", "Black acrylic": "Acrilico nero",
    "Text on the stand": "Testo sul totem",
    "Your venue name is printed at the top. The TAPI logo always sits under the QR code.": "Il nome del locale è stampato in alto. Il logo TAPI sta sempre sotto il codice QR.",
    "How it works at the counter": "Come funziona alla cassa",
    "A phone tap or a QR scan": "Un tocco del telefono o una scansione QR",
    "The NFC chip sits under the QR code — the guest taps as if paying by card. With no app it still works: your venue page opens with one-click sign-up.": "Il chip NFC è sotto il codice QR — l’ospite avvicina il telefono come per pagare con la carta. Funziona anche senza app: si apre la pagina del locale con registrazione in un clic.",
    "The coupon burns itself": "Il coupon si convalida da solo",
    "An active coupon is redeemed in the same second and shows a full-screen green confirmation with a timer, e.g. “−20% DISCOUNT ACTIVE”.": "Il coupon attivo viene convalidato nello stesso istante e appare una conferma verde a tutto schermo con il timer, ad esempio “SCONTO −20% ATTIVO”.",
    "A PING for your staff": "Un PING per il personale",
    "A short, loud chime at the counter plus a push to the bartender or manager — you know who redeemed what.": "Un segnale breve e ben udibile alla cassa più una notifica push al barman o al manager — sai chi ha usato cosa.",
    "No coupon? A list of deals": "Nessun coupon? La lista delle offerte",
    "A guest with no active coupon sees all your current deals and picks one on the spot.": "Chi non ha un coupon attivo vede tutte le tue offerte del momento e ne scegli una sul posto.",
    "Smart Stand": "Smart Stand", "Shipping (48 h, courier)": "Spedizione (48 h, corriere)", "Total": "Totale",
    "On the VIP plan the stand is free — you only pay for shipping.": "Con il piano VIP il totem è gratuito — paghi solo la spedizione.",
    "On the VIP plan the stand costs 0 zł and you only pay shipping.": "Con il piano VIP il totem costa 0 zł e paghi solo la spedizione.",
    "Order confirmed": "Ordine confermato",
    "Your stand is in production. It ships within 48 h; the tracking number lands in Business details.": "Il totem è in produzione. Spedizione entro 48 h; il numero di tracking arriva nei Dati aziendali.",
    "Ordered": "Ordinato",
    "Already ordered — ships within 48 h.": "Già ordinato — spedizione entro 48 h.",
    "Stand ordered. It ships within 48 h.": "Totem ordinato. Spedizione entro 48 h.",
    "No batteries, no cables, no POS wiring. Just put it on the counter.": "Senza batterie, senza cavi, senza collegamenti alla cassa. Lo appoggi sul banco e basta.",
    "TAPI Smart Stand free (you only pay shipping)": "TAPI Smart Stand gratis (paghi solo la spedizione)",
    "Tuned to your interests": "In linea con i tuoi interessi",
    "Filters and sorting": "Filtri e ordinamento", "All categories": "Tutte le categorie",
    "Category": "Categoria", "District": "Quartiere",
    "YOUR POINTS": "I TUOI PUNTI", "level": "livello", "pts": "pt",
    "per saved place": "per locale salvato", "per sticker scan": "per scansione", "per review": "per recensione",
    "Rewards to claim": "Premi da ritirare", "collecting": "in raccolta", "ready": "pronto", "Claim": "Ritira",
    "Free filter coffee": "Caffè filtro gratis", "House glass of wine": "Calice di vino della casa",
    "Silent disco entry": "Ingresso al silent disco", "Dinner for two −30%": "Cena per due −30%",
    "Turn each one on or off": "Attiva o disattiva ognuna",
    "Replies to your reviews": "Risposte alle tue recensioni",
    "Only from your categories": "Solo dalle tue categorie", "Once a month": "Una volta al mese",
    "TAPI is free for guests and stays that way — points and rewards cost nothing. Only venues pay for plans.": "TAPI è gratuito per gli ospiti e lo resta — punti e premi non costano nulla. Solo i locali pagano i piani.",
    "Full name": "Nome e cognome", "Your name": "Il tuo nome", "Phone": "Telefono",
    "Home city": "Città base", "Year of birth": "Anno di nascita",
    "Save changes": "Salva le modifiche", "Discard": "Annulla", "Details saved.": "Dati salvati.",
    "Done": "Fatto",
    "Do you run a venue?": "Gestisci un locale?",
    "Create a business account — takes 2 minutes.": "Crea un account aziendale — ci vogliono 2 minuti.",
    "Discovering, coupons and trip plans are free. Only venues pay.": "Scoprire, i coupon e i piani di viaggio sono gratis. Pagano solo i locali.",
    "See venue plans": "Guarda i piani per i locali",
    "A guest account is free — we never ask for a card. Only venues pay for their plans.": "L’account ospite è gratuito — non chiediamo mai la carta. Pagano solo i locali per i loro piani.",
    "BASE plan: your card, the QR sticker and basic stats, free.": "Piano BASE: la vetrina, l’adesivo QR e le statistiche di base, gratis.",
    "Back on BASE. Your data and sticker stay.": "Di nuovo su BASE. I tuoi dati e l’adesivo restano.",
    "Your business": "La tua attività",
    "You always keep the guest view — the business tools live here.": "La vista ospite resta sempre — gli strumenti per l’attività sono qui.",
    "Dashboard": "Pannello", "Scans, coupons, chart": "Scansioni, coupon, grafico",
    "Offers": "Offerte", "IG stories and deals": "Storie IG e promozioni",
    "QR code": "Codice QR", "Stickers and ordering": "Adesivi e ordini",
    "Business details": "Dati dell’attività", "Plan, team, billing": "Piano, team, pagamenti",
    "Saved and coupons": "Salvati e coupon",
    "Replies to reviews and invites": "Risposte alle recensioni e inviti",
    "Undiscovered spots within 200 m": "Luoghi non ancora scoperti entro 200 m",
    "Only from categories you like": "Solo dalle categorie che ti piacciono",
    "Once a month, nothing more": "Una volta al mese, niente di più",
    "Your details": "I tuoi dati", "Language and look": "Lingua e aspetto",
    "Trip planner": "Pianificatore di viaggio",
    "How long are you in Kraków?": "Quanto tempo resti a Cracovia?",
    "We lay out every day by the hour — walk time, price and a break built in.": "Organizziamo ogni giorno ora per ora — spostamenti, prezzi e una pausa inclusa.",
    "You can go past a week — the plus button reaches 30 days.": "Puoi andare oltre la settimana — con il più arrivi fino a 30 giorni.",
    "Long trip: past a week places start repeating at different times of day.": "Viaggio lungo: oltre una settimana i locali iniziano a ripetersi in orari diversi.",
    "Who is coming": "Con chi parti",
    "Solo": "Da solo", "Two of us": "In due", "Group": "In gruppo", "With kids": "Con bambini",
    "What is your budget per person?": "Qual è il budget a persona?",
    "Tickets, food and entries. Accommodation and travel are not counted.": "Biglietti, cibo e ingressi. Alloggio e viaggio non sono compresi.",
    "No limit": "Senza limite", "no limit": "senza limite",
    "we still show prices, we just never rule a place out": "i prezzi li mostriamo, ma non escludiamo nulla",
    "Lean": "Essenziale", "Comfortable": "Comodo", "No counting": "Senza pensarci", "do not filter": "non filtrare",
    "What should be in the plan?": "Cosa deve esserci nel piano?",
    "Pick a few things and a pace. We fit the rest so the day actually works.": "Scegli qualche categoria e il ritmo. Il resto lo sistemiamo perché la giornata funzioni.",
    "Pace of the day": "Ritmo della giornata",
    "Easy": "Tranquillo", "Balanced": "Equilibrato", "Packed": "Intenso",
    "3 stops": "3 tappe", "4 stops": "4 tappe", "6 stops": "6 tappe",
    "Continue": "Avanti", "Build my plan": "Crea il mio piano",
    "Laying out the route": "Sto costruendo il percorso",
    "Matching places to your categories": "Abbino i locali alle tue categorie",
    "Checking opening hours and walks": "Controllo orari e spostamenti",
    "Shuffle": "Rimescola", "Change setup": "Cambia le impostazioni", "Save plan": "Salva il piano",
    "Plan cost": "Costo del piano", "left for coffee and souvenirs": "restano per caffè e souvenir",
    "A fresh layout — same rules.": "Nuovo assetto — stesse regole.",
    "Plan saved in Profile → Saved.": "Piano salvato in Profilo → Salvati.",
    "Morning": "Mattina", "Afternoon": "Pomeriggio", "Evening": "Sera",
    "Open the card": "Apri la vetrina",
    "Tell us three things — we do the rest": "Dicci tre cose — al resto pensiamo noi",
    "Royal chambers, the arcaded courtyard and the river view.": "Le stanze reali, il cortile ad arcate e la vista sul fiume.",
    "19th-century Polish painting above the market hall.": "Pittura polacca dell’Ottocento sopra il mercato coperto.",
    "Kraków 1939–1945 told through sets, not vitrines.": "Cracovia 1939–1945 raccontata con le scenografie, non con le vetrine.",
    "Tuesdays cost 1 zł, café looking onto the halls.": "Il martedì costa 1 zł, caffè con vista sulle sale.",
    "Szeroka, Józefa, courtyards and murals — no ticket.": "Szeroka, Józefa, cortili e murales — senza biglietto.",
    "Croquettes, bigos and thermos coffee at tin tables.": "Crocchette, bigos e caffè dal thermos ai tavoli di latta.",
    "The rotunda, the queue and five kinds of sauce.": "La rotonda, la coda e cinque tipi di salsa.",
    "Cheesecake and quiet two blocks off the square.": "Cheesecake e silenzio a due passi dalla piazza.",
    "Colombia Huila and a cinnamon bun straight from the oven.": "Colombia Huila e una girella alla cannella appena sfornata.",
    "Piers, cliffs and water in a colour you will not believe.": "Pontili, rocce e acqua di un colore incredibile.",
    "The best panorama in town and no ticket.": "Il panorama più bello della città, senza biglietto.",
    "Barges, bikes and the Bernatka bridge on the way.": "Chiatte, biciclette e il ponte Bernatka lungo il percorso.",
    "Digging through the crates is the attraction itself.": "Frugare nelle casse è già l’attrazione.",
    "Cheese, pickles and bread from a Beskid baker.": "Formaggi, sott’aceti e pane da un fornaio dei Beschidi.",
    "Twelve seats at the bar and a menu that changes weekly.": "Dodici posti al bancone e un menu che cambia ogni settimana.",
    "Natural wines from Friuli, vinyl from 11:30 pm.": "Vini naturali dal Friuli, vinile dalle 23:30.",
    "Three channels, a terrace over the river, 11 pm start.": "Tre canali, terrazza sul fiume, si parte alle 23:00.",
    "A cellar, a double bass and tables for two.": "Una cantina, un contrabbasso e tavoli per due.",
    "Three screens in a townhouse on the square, no popcorn.": "Tre sale in un palazzo sulla piazza, senza popcorn.",
    "An old factory, ten bars in one yard.": "Una vecchia fabbrica, dieci bar in un solo cortile.",
    "TRIP PLAN": "PIANO DI VIAGGIO",
    "Tell us four things — get a finished plan": "Dicci quattro cose — avrai un piano pronto",
    "No need to browse two hundred places. Answer four questions and we lay out an hour-by-hour plan: where to eat, what to see, how long it takes and what it costs.": "Non devi sfogliare duecento locali. Rispondi a quattro domande e prepariamo un piano ora per ora: dove mangiare, cosa vedere, quanto tempo serve e quanto costa.",
    "Days, budget, pace and who is coming. Nothing else.": "Giorni, budget, ritmo e con chi parti. Nient’altro.",
    "Morning, afternoon and evening per day — with walking time and entry price.": "Mattina, pomeriggio e sera per ogni giorno — con i tempi a piedi e il prezzo d’ingresso.",
    "Swap or drop any stop. The plan recalculates the cost itself.": "Cambia o togli qualsiasi tappa. Il piano ricalcola il costo da solo.",
    "QUESTIONS": "DOMANDE", "TIME NEEDED": "TEMPO NECESSARIO", "FOR THE PLAN": "PER IL PIANO",
    "Free": "Gratis", "day 1": "giorno 1", "done": "fatto",
    "Save the plan to your profile and change it whenever.": "Salvi il piano nel profilo e lo cambi quando vuoi.",
    "Coffee bar": "Caffetteria", "Events": "Eventi",
    "Mon": "Lun", "Tue": "Mar", "Wed": "Mer", "Thu": "Gio", "Fri": "Ven", "Sat": "Sab", "Sun": "Dom",
    "Closed": "Chiuso", "free": "gratis", "from 12 zł": "da 12 zł", "today": "oggi",
    "Thu 11:30 pm": "gio 23:30", "Sun 6 pm": "dom 18:00", "Sat 11 am": "sab 11:00",
    "Sun 8 pm": "dom 20:00", "Sat 10 am": "sab 10:00", "Tue 7 pm": "mar 19:00",
    "A glass of bianco frizzante with your first order": "Un calice di bianco frizzante con la prima ordinazione",
    "Second filter coffee for 1 zł — today until closing": "Secondo caffè filtro a 1 zł — oggi fino alla chiusura",
    "Silent disco ticket −40% (12 left)": "Ingresso al silent disco −40% (ne restano 12)",
    "Amuse-bouche from the chef + 15% off the bar": "Amuse-bouche dello chef + 15% sul bar",
    "The neighbour’s board": "Il tagliere del vicino",
    "Cheeses from the market hall, honey": "Formaggi del mercato coperto, miele",
    "Vinyl set": "Set in vinile", "Thu–Sat from 11:30 pm": "Gio–sab dalle 23:30",
    "Filter of the day": "Filtro del giorno", "Colombia Huila — nectarine": "Colombia Huila — nettarina",
    "Cinnamon bun": "Girella alla cannella", "Out of the oven at 6:40": "Sfornata alle 6:40",
    "In a deposit cup": "In bicchiere con cauzione",
    "Three channels, 11 pm start": "Tre canali, si parte alle 23:00",
    "Terrace on the Vistula": "Terrazza sulla Vistola", "No ticket until 10 pm": "Senza biglietto fino alle 22:00",
    "Hall bar": "Bar della Hala", "Local beers and lemonades": "Birre locali e limonate",
    "Pickled cauliflower": "Cavolfiore fermentato", "Caraway butter, walnut": "Burro al cumino, noce",
    "Trout from Ojców": "Trota di Ojców", "Cream, dill oil": "Panna, olio di aneto",
    "No-bake cheesecake": "Cheesecake a freddo", "Rhubarb from the market": "Rabarbaro del mercato",
    "The best natural wine list in Kraków. The staff advise without any attitude.": "La migliore carta di vini naturali di Cracovia. Il personale consiglia senza fare i difficili.",
    "Intimate, louder after 11 pm. Perfect for one glass before the night.": "Intimo, più rumoroso dopo le 23. Perfetto per un calice prima della notte.",
    "The cinnamon buns are gone before 11 and I know why. The coffee is spot on every time.": "Le girelle alla cannella finiscono prima delle 11 e so perché. Il caffè è sempre perfetto.",
    "Remote work: sockets, quiet, good Wi-Fi.": "Lavoro da remoto: prese, silenzio, buon Wi-Fi.",
    "Three music channels and nobody bothers anybody. Brilliant.": "Tre canali musicali e nessuno disturba nessuno. Geniale.",
    "There is a queue for the headphones — come before 11 pm.": "C’è la coda per le cuffie — meglio arrivare prima delle 23.",
    "Twelve seats at the bar and a view of the kitchen. No bookings — I come at 5 pm.": "Dodici posti al bancone e vista sulla cucina. Non si prenota — arrivo alle 17.",
    "The menu changes every week and the prices are fair.": "Il menu cambia ogni settimana e i prezzi sono onesti.",
    "New delivery from Friuli": "Nuova consegna dal Friuli", "Vinyl Thursday": "Giovedì in vinile",
    "Orange wine tasting": "Degustazione di orange wine", "New Colombia in the grinder": "Nuova Colombia nel macinino",
    "Cupping on Saturday": "Cupping sabato", "Silent disco tonight, 11 pm": "Silent disco stasera alle 23:00",
    "Blanket cinema": "Cinema sulle coperte", "Breakfast market": "Mercato della colazione",
    "Dinner at one table": "Cena a un solo tavolo",
    "Find what you are into": "Trova quello che ti piace",
    "Coffee, wine, gigs, markets, cinema…": "Caffè, vino, concerti, mercatini, cinema…",
    "Notifications": "Notifiche", "Places and coupons": "Locali e coupon",
    "Details and login": "Dati e accesso", "Points and level": "Punti e livello",
    "Language, theme, alerts": "Lingua, tema, notifiche",
    "Light": "Chiaro", "Dark": "Scuro", "Guest": "Ospite", "You": "Tu", "just now": "adesso",
    "Sign in to save places": "Accedi per salvare i locali",
    "Filter": "Filtra", "Show ratings": "Mostra i voti",
    "Newest": "Più recenti", "Highest rated": "Voto più alto", "Lowest rated": "Voto più basso",
    "All ratings": "Tutti i voti", "5★ only": "Solo 5★", "4★ and up": "4★ e più", "3★ and up": "3★ e più",
    "Add your review": "Aggiungi la tua recensione",
    "Tell others how it was — what to order, the vibe, would you return.": "Racconta com’è andata — cosa ordinare, l’atmosfera, se ci torneresti.",
    "Publish review": "Pubblica la recensione", "Write a few words": "Scrivi due righe",
    "Review added — thank you!": "Recensione aggiunta — grazie!",
    "No reviews match this filter.": "Nessuna recensione con questo filtro.",
    "TAPI FOR BUSINESS · 1.0": "TAPI PER AZIENDE · 1.0",
    "All Kraków": "Tutta Cracovia",
    "Upcoming events": "Prossimi eventi",
    "All": "Tutti", "Tomorrow": "Domani", "This weekend": "Questo fine settimana",
    "Next week": "Prossima settimana", "Free entry": "Ingresso libero",
    "Recommended": "Consigliati", "Cheapest": "Più economici", "Top rated": "Meglio recensiti",
    "Most reviewed": "Più recensiti", "Closest": "Più vicini",
    "Filter and sort": "Filtra e ordina", "Sort by": "Ordina per", "Price level": "Fascia di prezzo",
    "Minimum rating": "Voto minimo", "Clear": "Azzera", "Any": "Tutte",
    "Cheapest first": "Dai più economici", "Recommended nearby": "Consigliati qui vicino",
    "Open right now only": "Solo aperti adesso",
    "Hide venues that are already closed": "Nascondi i locali già chiusi",
    "Nothing matches": "Nessun risultato", "Clear everything": "Azzera tutto",
    "Saved": "Salvati", "Account": "Account", "Plan": "Piano", "Settings": "Impostazioni",
    "Stats": "Statistiche", "Rewards": "Premi", "Partners": "Partner", "Details": "Dati", "Card": "Vetrina",
    "Notifications and messages": "Notifiche e messaggi",
    "Messages from venues": "Messaggi dai locali", "When I am nearby": "Quando sono vicino",
    "Deals and happy hours": "Offerte e happy hour", "What is new in TAPI": "Novità su TAPI",
    "Payment methods": "Metodi di pagamento", "Invoices": "Fatture",
    "Your plan": "Il tuo piano", "Change plan": "Cambia piano", "Cancel": "Disdici",
    "Dismiss": "Annulla", "Followed": "Seguiti",
    "Tuned to your interests": "In linea con i tuoi interessi",
    "Drinks, coffee and food from the lowest prices": "Drink, caffè e cibo dai prezzi più bassi",
    "Highest guest rating first": "Dal voto più alto degli ospiti",
    "Most reviews nearby": "Più recensioni qui vicino",
    "Shortest distance from you": "Dalla distanza più breve da te",
    "Filters too tight, or a typo in the search. Start from a clean list — the city has more to show.": "Filtri troppo stretti o un errore di battitura. Riparti da una lista pulita — la città ha altro da mostrare.",
    "Nothing matches": "Nessun risultato",
    "Clear everything": "Azzera tutto",
    "You have no payments": "Non hai pagamenti",
    "App language": "Lingua dell'app", "Search a language": "Cerca una lingua",
    "Picked from your phone settings": "Presa dalle impostazioni del telefono",
    "Set manually": "Impostata manualmente",
    "Add a coupon": "Aggiungi un coupon", "New coupon": "Nuovo coupon",
    "What the guest gets": "Cosa riceve l'ospite", "Who gets it": "Chi lo riceve",
    "How many": "Quanti", "How long the guest has": "Validità per l'ospite",
    "Publish coupon": "Pubblica il coupon", "No limit": "Senza limite",
    "For a first scan": "Alla prima scansione", "For every scan": "A ogni scansione",
    "From the third visit": "Dalla terza visita", "Mon–Thu until 8 pm": "Lun–Gio fino alle 20",
    "15 minutes": "15 minuti", "Until end of day": "Fino a fine giornata", "7 days": "7 giorni",
    "HOW THE GUEST SEES IT": "COME LO VEDE L'OSPITE",
    "Pause": "Sospendi", "Activate": "Attiva",
    "Peak hours": "Ore di punta", "From view to visit": "Dalla vista alla visita",
    "Scans day by day": "Scansioni giorno per giorno",
    "Who you recommend": "Chi consigli", "Who recommends you": "Chi consiglia te",
    "Recommend back": "Consiglia anche tu", "Reciprocated": "Reciproco",
    "Add a venue": "Aggiungi un locale", "Who do you recommend?": "Chi consigli?", "Done": "Fatto",
    "Redeem a reward": "Riscatta un premio", "Scan coupon": "Scansiona il coupon",
    "4-digit code": "Codice a 4 cifre", "Reward redeemed": "Premio riscattato",
    "Next guest": "Prossimo ospite", "Coupon not valid": "Coupon non valido", "Try again": "Riprova",
    "Venue details": "Dati del locale", "Team": "Team", "Security": "Sicurezza",
    "Opening hours": "Orari di apertura", "Save venue details": "Salva i dati del locale",
    "Trip plan": "Piano di viaggio", "Let us start": "Iniziamo", "Four questions": "Quattro domande",
    "An hourly plan": "Un piano ora per ora", "Swap what does not fit": "Cambia ciò che non ti va",
    "Edit": "Modifica", "Preview": "Anteprima", "Save card": "Salva la vetrina",
    "Stories and events": "Storie ed eventi", "Guest reviews": "Recensioni degli ospiti",
    "Reply": "Rispondi", "Publish": "Pubblica", "Venue reply": "Risposta del locale",
    "Alert me when I am close": "Avvisami quando sono vicino", "Alerts are on": "Avvisi attivi",
    "Sort": "Ordina", "Two-factor sign-in": "Accesso a due fattori",
    "Active devices": "Dispositivi attivi", "Sign-in history": "Cronologia accessi",
    "On": "Attivo", "Off": "Disattivo", "View": "Guarda",
    "Pn": "Lun",
    "Wt": "Mar",
    "Śr": "Mer",
    "Cz": "Gio",
    "Pt": "Ven",
    "So": "Sab",
    "Nd": "Dom",
    "Pon": "Lun",
    "Czw": "Gio",
    "Sob": "Sab",
    "Ndz": "Dom",
    "Zamknięte": "Chiuso",
    "Las": "Bosco",
    "Kobalt": "Cobalto",
    "Glina": "Argilla",
    "Śliwka": "Prugna",
    "Kawiarnia": "Caffetteria",
    "Wydarzenia": "Eventi",
    "Bistro": "Bistrot",
    "Wine": "Vino",
    "Breakfast": "Colazioni",
    "Live music": "Concerti",
    "Clubs": "Club",
    "Art": "Arte",
    "Street food": "Street food",
    "Markets": "Mercatini",
    "Cinema": "Cinema",
    "Vinyl": "Vinile",
    "Discover": "Scopri",
    "The city starts foggy": "La città parte nella nebbia",
    "Everything happening near you today — venues, deals, events.": "Tutto quello che succede oggi vicino a te — locali, offerte, eventi.",
    "The city starts foggy. You uncover districts by walking them.": "La città parte nella nebbia. Sveli i quartieri camminandoci.",
    "Scan the window sticker to grab a coupon — even when the venue is closed.": "Scansiona l’adesivo in vetrina per prendere un coupon — anche a locale chiuso.",
    "Places for later and live coupons with a countdown.": "Posti per dopo e coupon attivi con il conto alla rovescia.",
    "Language, theme, accent colour and the business panel.": "Lingua, tema, colore d’accento e accesso al pannello azienda.",
    "Location on. Explored blocks now show on the map.": "Posizione attiva. I quartieri esplorati appariranno sulla mappa.",
    "Recognised: Nokturn. Your coupon is on the card.": "Riconosciuto: Nokturn. Il coupon ti aspetta nella scheda.",
    "Coupon active. Show the code at the bar.": "Coupon attivo. Mostra il codice al bancone.",
    "Removed from saved.": "Rimosso dai salvati.",
    "Saved to your list.": "Salvato nella tua lista.",
    "Phone verification": "Verifica telefonica",
    "We are calling +48 512 884 210 with a code.": "Stiamo chiamando il +48 512 884 210 con un codice.",
    "SMS verification": "Verifica via SMS",
    "Code sent to the business number.": "Codice inviato al numero aziendale.",
    "Google Business Profile": "Profilo dell’attività su Google",
    "Linking the account that manages the listing.": "Colleghiamo l’account che gestisce la scheda.",
    "Company document": "Documento aziendale",
    "Checking the registry entry — up to 24 h.": "Verifichiamo la visura — entro 24 h.",
    "Postcard with a code": "Cartolina con codice",
    "Letter on the way to the venue.": "Lettera in viaggio verso il locale.",
    "A new spot in your category opened 400 m away.": "Un nuovo posto della tua categoria ha aperto a 400 m.",
    "now": "ora",
    "You are 120 m from Brama 7": "Sei a 120 m da Brama 7",
    "Second filter coffee for 1 zł until 7 pm.": "Secondo caffè filtro a 1 zł fino alle 19.",
    "Silent disco starts at 11 pm": "Il silent disco inizia alle 23",
    "Hala Forum, 12 tickets left at −40%.": "Hala Forum, restano 12 biglietti a −40%.",
    "You uncovered a new block": "Hai scoperto un nuovo quartiere",
    "Zabłocie · 3 places came out of the fog.": "Zabłocie · 3 posti sono usciti dalla nebbia.",
    "Guide to venues and events": "Guida a locali ed eventi",
    "Browsing as a guest. Sign in whenever you want coupons.": "Stai esplorando come ospite. Accedi quando vorrai i coupon.",
    "We sent 4 digits to ": "Abbiamo inviato 4 cifre a ",
    "Recenter": "Ricentra",
    "Scanned": "Scansionato",
    "Show this code at the bar": "Mostra questo codice al bancone",
    "Show at venue": "Mostra nel locale",
    "No active coupons": "Nessun coupon attivo",
    "Scan a window sticker to get your first one.": "Scansiona un adesivo in vetrina per ottenere il primo.",
    "Coupons, saved places and alerts": "Coupon, posti salvati e notifiche",
    "Analytics, offers, IG stories": "Statistiche, offerte, storie IG",
    "for business · panel": "per aziende · pannello",
    "for business": "per aziende",
    "Turn your venue into a magnet for guests and travellers.": "Trasforma il tuo locale in una calamita per clienti e viaggiatori.",
    "Add your business from Google Maps in 30 seconds, publish events and generate Instagram stories.": "Aggiungi la tua attività da Google Maps in 30 secondi, pubblica eventi e genera storie Instagram.",
    "Register your venue for free": "Registra il tuo locale gratis",
    "No card needed. BASE stays free forever.": "Nessuna carta. Il piano BASE resta gratis per sempre.",
    "The window sticker works while you rest.": "L’adesivo in vetrina lavora mentre tu riposi.",
    "more walk-ins": "clienti in più",
    "to set up": "per configurare",
    "visibility": "visibilità",
    "Choose a plan": "Scegli il piano",
    "Continue with": "Continua con",
    "Find your venue on Google": "Trova il tuo locale su Google",
    "We pull the name, address, hours, phone, photos and reviews. Then you just add an offer.": "Recuperiamo nome, indirizzo, orari, telefono, foto e recensioni. Poi aggiungi solo un’offerta.",
    "Type your venue name…": "Scrivi il nome del locale…",
    "Pulled from Google": "Recuperato da Google",
    "Opening hours and phone": "Orari di apertura e telefono",
    "18 photos and 212 reviews": "18 foto e 212 recensioni",
    "Menu and map position": "Menu e posizione sulla mappa",
    "Create the card": "Crea la scheda",
    "Scans · 7 days": "Scansioni · 7 giorni",
    "Live": "Live",
    "Free glass of frizzante": "Calice di frizzante offerto",
    "Vinyl Thursday, 11:30 pm": "Giovedì in vinile, 23:30",
    "Autumn menu from today": "Menu d’autunno da oggi",
    "Generate story": "Genera la storia",
    "Window sticker": "Adesivo per la vetrina",
    "Your entry code": "Il tuo codice d’ingresso",
    "Download A5 PDF": "Scarica il PDF A5",
    "Recent scans · today": "Ultime scansioni · oggi",
    "Leave business panel": "Esci dal pannello azienda",
    "Good evening": "Buonasera",
    "Thursday, 6:24 pm · Kazimierz": "Giovedì, 18:24 · Kazimierz",
    "Food": "Cibo",
    "Coffee": "Caffè",
    "Nightlife": "Serata",
    "Events": "Eventi",
    "Silent disco, 3 channels": "Silent disco, 3 canali",
    "New autumn menu": "Nuovo menu d’autunno",
    "TODAY": "OGGI",
    "Delivery from Friuli": "Consegna dal Friuli",
    "NEW": "NUOVO",
    "No results. Clear the filter or try another word.": "Nessun risultato. Togli il filtro o prova un’altra parola.",
    "Notifications marked as read.": "Notifiche segnate come lette.",
    "Your coupon expires in 5 minutes": "Il tuo coupon scade tra 5 minuti",
    "Nokturn · NKT·4192": "Nokturn · NKT·4192",
    "reviews": "recensioni",
    "Slide — we will ask you to sign in": "Scorri — ti chiederemo di accedere",
    "On · 200 m radius": "Attivo · raggio 200 m",
    "Off": "Spento",
    "Turned off.": "Disattivato.",
    "We will ping you nearby.": "Ti avviseremo quando sarai vicino.",
    "READING CODE": "LEGGO IL CODICE",
    "CONNECTING": "MI COLLEGO",
    "ASSIGNING COUPON": "ASSEGNO IL COUPON",
    "Nothing here yet. Save places with the bookmark on each card.": "Ancora nulla. Salva i posti con il segnalibro su ogni scheda.",
    "guest mode": "modalità ospite",
    "Signed out.": "Disconnesso.",
    "Paper": "Carta",
    "Night": "Notte",
    "Visibility": "Visibilità",
    "Your events on the city map and in the Today feed.": "I tuoi eventi sulla mappa della città e nel feed Oggi.",
    "Ready templates": "Template pronti",
    "Instagram story generated in one click.": "Storia Instagram generata con un clic.",
    "QR sticker for the window": "Adesivo QR per la vetrina",
    "Works 24/7, even when you are closed.": "Funziona 24/7, anche a locale chiuso.",
    "forever": "per sempre",
    "Google Maps card": "Scheda Google Maps",
    "1 active offer": "1 offerta attiva",
    "QR sticker": "Adesivo QR",
    "per month": "al mese",
    "Everything in BASE": "Tutto di BASE",
    "IG stories and events": "Storie IG ed eventi",
    "Scan analytics": "Statistiche delle scansioni",
    "Everything in PRO": "Tutto di PRO",
    "Featured on the map": "In evidenza sulla mappa",
    "Account manager": "Account manager",
    "MOST POPULAR": "IL PIÙ SCELTO",
    "PRO and VIP: first week free, first month half price. Cancel in one click.": "PRO e VIP: prima settimana gratis, primo mese a metà prezzo. Disdici con un clic.",
    " · TRIAL": " · PROVA",
    "Pulled from Google: hours, phone, photos.": "Da Google: orari, telefono, foto.",
    "What you actually get with TAPI": "Cosa ottieni davvero con TAPI",
    "Guests walking past": "Chi passa davanti al locale",
    "The window sticker works 24/7 — even when you are closed.": "L’adesivo in vetrina lavora 24/7 — anche a locale chiuso.",
    "Events visible across town": "Eventi visibili in tutta la città",
    "Your offers land on the map and in the Today feed.": "Le tue offerte finiscono sulla mappa e nel feed Oggi.",
    "IG story in one click": "Storia IG con un clic",
    "A ready 1080×1920 template with your data and price.": "Un template 1080×1920 pronto con i tuoi dati e il prezzo.",
    "Let us start": "Iniziamo",
    "Takes about 2 minutes. No card needed.": "Bastano circa 2 minuti. Nessuna carta.",
    "Find your business": "Trova la tua attività",
    "Type the name — we pull the data from your Google listing.": "Scrivi il nome — recuperiamo i dati dalla tua scheda Google.",
    "Your venue": "Il tuo locale",
    "Venue name": "Nome del locale",
    "Address": "Indirizzo",
    "Phone": "Telefono",
    "Business e-mail": "E-mail aziendale",
    "Cannot find your business?": "Non trovi la tua attività?",
    "Continue": "Continua",
    "Back to search": "Torna alla ricerca",
    "Confirm this is your business": "Conferma che è la tua attività",
    "This address comes from your Google listing. We will send a one-time link there.": "Questo indirizzo viene dalla tua scheda Google. Ci invieremo un link monouso.",
    "E-mail from the listing": "E-mail dalla scheda",
    "Verify": "Verifica",
    "Sending the link and checking the domain…": "Invio il link e controllo il dominio…",
    "Verified — this is your business.": "Verificato — è la tua attività.",
    "No access to that address? We can verify by phone.": "Non hai accesso a questo indirizzo? Possiamo verificare al telefono.",
    "We pulled this from Google": "Questo l’abbiamo preso da Google",
    "You can change everything later in the panel.": "Potrai cambiare tutto più tardi nel pannello.",
    "Name": "Nome",
    "Hours": "Orari",
    "7 days, today until 3:00": "7 giorni, oggi fino alle 3:00",
    "Reviews": "Recensioni",
    "Photos": "Foto",
    "18 shots": "18 scatti",
    "2 WEEKS OF PRO FOR FREE": "2 SETTIMANE DI PRO GRATIS",
    "Monthly": "Mensile",
    "Yearly · −20%": "Annuale · −20%",
    "to begin": "per iniziare",
    "Google listing card": "Scheda Google",
    "for most venues": "per la maggior parte dei locali",
    "for chains and clubs": "per catene e club",
    "per month, billed yearly": "al mese, con addebito annuale",
    "First 2 weeks of PRO free. Cancel later in one click.": "Prime 2 settimane di PRO gratis. Disdici poi con un clic.",
    "Overview": "Panoramica",
    "Stories": "Storie",
    "Scans": "Scansioni",
    "Today at your place": "Oggi da te",
    "Stories and events": "Storie ed eventi",
    "Scans and sticker": "Scansioni e adesivo",
    "SCANS TODAY": "SCANSIONI OGGI",
    "COUPONS USED": "COUPON USATI",
    "NEW GUESTS": "NUOVI CLIENTI",
    "first visit": "prima visita",
    "AVG. BILL": "SCONTRINO MEDIO",
    "Coupon NKT·4192 used": "Coupon NKT·4192 utilizzato",
    "New scan — first-time guest": "Nuova scansione — cliente nuovo",
    "Someone saved you for later": "Qualcuno vi ha salvati per dopo",
    "Story published to IG": "Storia pubblicata su IG",
    "Deal": "Offerta",
    "Event": "Evento",
    "Daily menu": "Menu del giorno",
    "Story 1080×1920 ready — sent to your Instagram.": "Storia 1080×1920 pronta — inviata al tuo Instagram.",
    "Board for two −25%": "Tagliere per due −25%",
    "Weekends": "Nel weekend",
    "Vinyl for points": "Vinile con i punti",
    "Limit 12": "Limite 12",
    "active": "attiva",
    "paused": "in pausa",
    "Klara Z. · coupon used": "Klara Z. · coupon usato",
    "Marek P. · first scan": "Marek P. · prima scansione",
    "Ada J. · saved you": "Ada J. · vi ha salvati",
    "Tomek R. · coupon expired": "Tomek R. · coupon scaduto",
    "A5 sticker PDF sent to your inbox.": "PDF A5 dell’adesivo inviato alla tua e-mail.",
    "How does discovering work?": "Come funziona la scoperta?",
    "Got it": "Chiaro, iniziamo",
    "The city starts foggy": "La città parte nella nebbia",
    "The map is greyed out at first. You only see what you have already visited.": "All’inizio la mappa è in grigio. Vedi solo ciò che hai già visitato.",
    "Walk to uncover": "Cammina e scopri",
    "Each new block clears when you get there. Venues in the fog stay hidden.": "Ogni quartiere si svela quando ci arrivi. I locali nella nebbia restano nascosti.",
    "Scan and collect": "Scansiona e colleziona",
    "The window QR sticker gives a coupon and a district badge. We ping you when something new is nearby.": "L’adesivo QR in vetrina dà un coupon e il badge del quartiere. Ti avvisiamo quando c’è qualcosa di nuovo vicino.",
    "What are you into?": "Cosa ti interessa?",
    "Pick a few — we tune your feed and ping you when something like it pops up nearby.": "Scegline qualcuno — adattiamo il feed e ti avvisiamo quando spunta qualcosa di simile vicino a te.",
    "Pick at least one": "Scegline almeno uno",
    "Later": "Più tardi",
    "Done. We will ping you when something matches.": "Fatto. Ti avviseremo quando arriva qualcosa di adatto.",
    "Your interests: ": "I tuoi interessi: ",
    "Edit": "Modifica",
    "Search the map…": "Cerca sulla mappa…",
    "Uncover your area": "Svela la tua zona",
    "The map stays foggy until we know where you have been. Turn on location and explored blocks stay yours.": "La mappa resta nella nebbia finché non sappiamo dove sei stato. Attiva la posizione e i quartieri esplorati restano tuoi.",
    "Allow location": "Consenti la posizione",
    "Not now": "Non ora",
    "Alerts when I am nearby": "Notifiche quando sono vicino",
    "Push about an undiscovered spot within 200 m": "Push su un posto non scoperto entro 200 m",
    "Push off.": "Push disattivate.",
    "We will ping you near undiscovered spots.": "Ti avviseremo vicino ai posti da scoprire.",
    "Open in Discover": "Apri in Scopri",
    "Start": "Inizio",
    "Next": "Avanti",
    "Skip": "Salta",
    "Have fun. The city is waiting.": "Buon divertimento. La città ti aspetta.",
    "Letter on the way — enter the code when it arrives.": "Lettera in arrivo — inserisci il codice quando la ricevi.",
    "Documents received — we will get back within 24 h.": "Documenti ricevuti — ti rispondiamo entro 24 h.",
    "No access to that address?": "Non hai accesso a questo indirizzo?",
    "Try another way": "Prova un altro metodo",
    "Back to e-mail": "Torna all’e-mail",
    "Other ways to verify": "Altri modi per verificare",
    "Pick the one you have access to. Each proves the venue is yours.": "Scegli quello a cui hai accesso. Ognuno dimostra che il locale è tuo.",
    "Call the listed number": "Chiamata al numero della scheda",
    "Answer the robocall and type the 6-digit code. +48 512 884 210": "Rispondi al messaggio automatico e digita il codice di 6 cifre. +48 512 884 210",
    "2 min": "2 min",
    "SMS to the business number": "SMS al numero aziendale",
    "The code goes to the same number as on Google.": "Il codice arriva allo stesso numero che c’è su Google.",
    "Connect Google Business Profile": "Collega il Profilo dell’attività su Google",
    "Sign in with the account that manages the listing — instant.": "Accedi con l’account che gestisce la scheda — immediato.",
    "instant": "immediato",
    "Company document or VAT ID": "Documento aziendale o partita IVA",
    "Registry entry or a photo of the lease.": "Visura camerale o foto del contratto d’affitto.",
    "1 day": "1 giorno",
    "We post a letter to the venue address. The most reliable one.": "Spediamo una lettera all’indirizzo del locale. Il metodo più sicuro.",
    "3–5 days": "3–5 giorni",
    "Grow your venue at your pace": "Fai crescere il locale al tuo ritmo",
    "Stay on BASE as long as you like. Try PRO free for 2 weeks — no card.": "Resta su BASE quanto vuoi. Provi PRO per 2 settimane a 0 zł — senza carta.",
    "2 WEEKS OF PRO FREE": "2 SETTIMANE DI PRO A 0 ZŁ",
    "Yearly: save 192 zł on PRO, 600 zł on VIP": "Annuale: −192 zł su PRO, −600 zł su VIP",
    "free to start": "per iniziare, senza costi",
    "Listing pulled from Google": "Scheda recuperata da Google",
    "QR sticker — 30 zł shipping only": "Adesivo QR — paghi solo 30 zł di spedizione",
    "7-day analytics": "Statistiche di 7 giorni",
    "Unlimited offers and events": "Offerte ed eventi illimitati",
    "Push to guests within 500 m": "Push ai clienti entro 500 m",
    "10 QR stickers for 15 zł, free shipping": "10 adesivi QR a 15 zł, spedizione gratis",
    "90-day analytics and CSV export": "Statistiche 90 giorni ed esportazione CSV",
    "Reply to reviews from the panel": "Rispondi alle recensioni dal pannello",
    "for chains, clubs and venues": "per catene, club e locali",
    "Featured pin on the map": "Pin in evidenza sulla mappa",
    "10 QR stickers free, more at −50%": "10 adesivi QR gratis, gli altri a −50%",
    "Top slot in the Today feed": "Primo posto nel feed Oggi",
    "Account manager and campaigns": "Account manager e campagne stagionali",
    "Booking system integration": "Integrazione con le prenotazioni",
    "Monthly PDF report": "Report mensile in PDF",
    "per mo, billed yearly": "al mese, addebito annuale",
    "CURRENT": "ATTUALE",
    "Stay on BASE": "Resta su BASE",
    "Decide later": "Deciderò più tardi",
    "After 14 days we ask before charging anything. Cancel in one click.": "Dopo 14 giorni ti chiediamo conferma prima di addebitare. Disdici con un clic.",
    "Staying on BASE. Come back anytime.": "Resti su BASE. Torna quando vuoi.",
    "Your listing is live. The business panel is yours.": "La scheda è online. Il pannello azienda è tuo.",
    "Create the business account": "Crea l’account azienda",
    "Offers": "Offerte",
    "QR code": "Codice QR",
    "Profile": "Profilo",
    "Offers and stories": "Offerte e storie",
    "QR code and stickers": "Codice QR e adesivi",
    "Your business": "La tua attività",
    "Verified · Kazimierz, Kraków": "Verificata · Kazimierz, Cracovia",
    "2 weeks of PRO free — active": "2 settimane di PRO a 0 zł — attive",
    "Business details": "Dati aziendali",
    "Name, address, hours, phone": "Nome, indirizzo, orari, telefono",
    "Plan and billing": "Piano e pagamenti",
    "Team": "Team",
    "2 people with panel access": "2 persone con accesso al pannello",
    "Notifications": "Notifiche",
    "Scans, coupons, reviews": "Scansioni, coupon, recensioni",
    "Security": "Sicurezza",
    "Two-factor sign-in": "Accesso a due fattori",
    "Switch to guest view": "Passa alla vista ospite",
    "Order QR stickers": "Ordina gli adesivi QR",
    "Printed on weatherproof vinyl, shipped within 48 h. Stick it on the window and you are done.": "Stampati su vinile resistente alla pioggia, spediti in 48 h. Li attacchi al vetro ed è fatta.",
    "How many": "Quanti adesivi",
    "free": "gratis",
    "Courier shipping": "Spedizione con corriere",
    "stickers free": "adesivi gratis",
    "15 zł / 10 pcs": "15 zł / 10 pz",
    "first 10 free": "primi 10 gratis",
    "Total": "Totale",
    "Delivered in 48 h · card or cash on delivery": "Consegna in 48 h · carta o contrassegno",
    "On PRO: 10 stickers for 15 zł, shipping free.": "Con PRO: 10 adesivi a 15 zł e spedizione gratis.",
    "On VIP: first 10 stickers free, more at −50%.": "Con VIP: primi 10 adesivi gratis, gli altri a −50%.",
    "Discover": "Scopri",
    "Map": "Mappa",
    "Scan": "Scansiona",
    "Saved": "Salvati",
    "All": "Tutto",
  };

  itRules = [
    [/^We sent 4 digits to (.+)$/, 'Abbiamo inviato 4 cifre a $1'],
    [/^Results · (\d+)$/, 'Risultati · $1'],
    [/^Your interests: (.+)$/, function (m, a) { return 'I tuoi interessi: ' + a.split(', ').map((x) => this.trStr(x)).join(', '); }],
    [/^Turn on alerts \((\d+)\)$/, 'Attiva le notifiche ($1)'],
    [/^Category: (.+)$/, function (m, a) { return 'Categoria: ' + this.trStr(a); }],
    [/^Hi (.+)\. Your points are being saved now\.$/, 'Ciao $1. I tuoi punti vengono già salvati.'],
    [/^([A-Z]+) · TRIAL$/, '$1 · PROVA'],
    [/^Current: (.+)$/, function (m, a) { return 'Attuale: ' + a.replace(' · trial', ' · prova'); }],
    [/^Try 2 weeks of ([A-Z]+) free$/, 'Prova 2 settimane di $1 a 0 zł'],
    [/^Stickers \((\d+) pcs\)$/, 'Adesivi ($1 pz)'],
    [/^(\d+) pcs$/, '$1 pz'],
    [/^Hi (.+)$/, 'Ciao $1'],
    [/^Trial until (.+)\. Then billed monthly — we ask first\.$/, 'Prova fino al $1. Poi addebito mensile — chiediamo prima.'],
    [/^Expires (.+) · default$/, 'Scade $1 · predefinita'],
    [/^Stickers, (\d+) pcs$/, 'Adesivi, $1 pz'],
    [/^([A-Z]+) · (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})$/, function (m, a, b, c) {
      const M = { January: 'gennaio', February: 'febbraio', March: 'marzo', April: 'aprile', May: 'maggio', June: 'giugno',
        July: 'luglio', August: 'agosto', September: 'settembre', October: 'ottobre', November: 'novembre', December: 'dicembre' };
      return a + ' · ' + (M[b] || b) + ' ' + c; }],
    [/^(\d+) August$/, '$1 agosto'],
    [/^Order for (.+)$/, 'Ordina per $1'],
    [/^(\d+) scans · 7 days$/, '$1 scansioni · 7 giorni'],
    [/^(\d+) scans$/, '$1 scansioni'],
    [/^a week ago$/, 'una settimana fa'],
    [/^(\d+) weeks ago$/, '$1 settimane fa'],
    [/^Ordered: (\d+) stickers for (.+)\. Courier in 48 h\.$/, 'Ordinati: $1 adesivi per $2. Corriere in 48 h.'],
    [/^(\d+) days left\. See what PRO unlocks\.$/, 'Restano $1 giorni. Scopri cosa sblocca PRO.'],
    [/^Your 2 free weeks of PRO are running — (\d+) days left\. Pick what comes next\.$/, 'Le tue 2 settimane di PRO a 0 zł sono attive — restano $1 giorni. Scegli come proseguire.'],
    [/^SAVE (\d+) ZŁ \/ YEAR$/, 'RISPARMI $1 ZŁ / ANNO'],
    [/^([A-Z]+) active — 2 weeks free\. We will remind you\.$/, '$1 attivo — 2 settimane a 0 zł. Ti ricorderemo prima della fine.'],
    [/^(.+) — coming soon\.$/, function (m, a) { return this.trStr(a) + ' — in arrivo.'; }],
    [/^(\d+) reviews$/, '$1 recensioni'],
    [/^(\d+) days ago$/, '$1 giorni fa'],
    [/^(\d+) reviews · ([\d.,]+) average$/, function (m, a, b) { return a + ' recensioni · media ' + String(b).replace('.', ','); }],
    [/^Order for (\d+) zł$/, 'Ordina per $1 zł'],
    [/^(\d+) pts to level (\d+)\.$/, '$1 pt al livello $2.'],
    [/^(\d+) ready$/, function (m, a) { return a === '1' ? '1 pronto' : a + ' pronti'; }],
    [/^(\d+) to go$/, 'mancano $1'],
    [/^Reward added to coupons: (.+)$/, function (m, a) { return 'Premio aggiunto ai coupon: ' + this.trStr(a); }],
    [/^(\d+) pts to go for this reward\.$/, 'Mancano $1 pt per questo premio.'],
    [/^(\d+) days$/, '$1 giorni'],
    [/^(\d+) day$/, '$1 giorno'],
    [/^(\d+) nights$/, '$1 notti'],
    [/^that is (\d+) zł a day$/, 'cioè $1 zł al giorno'],
    [/^Fitting the (\d+) zł budget$/, 'Rientro nel budget di $1 zł'],
    [/^Day (\d+)$/, 'Giorno $1'],
    [/^Day (\d+) · (\d+) stops$/, 'Giorno $1 · $2 tappe'],
    [/^Your plan for (\d+) days$/, 'Il tuo piano per $1 giorni'],
    [/^Your plan for (\d+) day$/, 'Il tuo piano per $1 giorno'],
    [/^of a (\d+) zł budget$/, 'su un budget di $1 zł'],
    [/^FROM (.+)$/, 'DA $1'],
    [/^Via (.+)$/, 'Tramite $1'],
    [/^(.+) recommends these to its guests\. All are on TAPI, so coupons work the same\.$/, '$1 li consiglia ai suoi ospiti. Sono tutti su TAPI, quindi i coupon funzionano allo stesso modo.'],
    [/^([A-Z]+) plan$/, 'Piano $1'],
    [/^(.+) near you$/, function (m, a) { return this.trStr(a) + ' vicino a te'; }],
    [/^(\d+) places nearby$/, '$1 locali qui vicino'],
    [/^(\d+) scheduled$/, '$1 in calendario'],
    [/^Show (\d+) places?$/, 'Mostra $1 locali'],
    [/^(\d+) redeemed$/, '$1 riscattati'],
    [/^(\d+) redeemed \/ (\d+)$/, '$1 riscattati / $2'],
    [/^(\d+) people with panel access$/, '$1 persone con accesso al pannello'],
    [/^(\d+) reviews$/, '$1 recensioni'],
    [/^Current: (.+)$/, 'Attuale: $1'],
    [/^fully translated$/, 'tradotta del tutto'],
    [/^(.+) · fully translated$/, '$1 · tradotta del tutto'],
    [/^(.+) · English base$/, '$1 · base inglese'],
    [/^Language: (.+)$/, 'Lingua: $1']
  ];

  trStr(s) {
    if (!s) return s;
    const d = this.itMap[s];
    if (d) return d;
    for (let i = 0; i < this.itRules.length; i++) {
      const r = this.itRules[i];
      const m = s.match(r[0]);
      if (m) return typeof r[1] === 'function' ? r[1].apply(this, m) : s.replace(r[0], r[1]);
    }
    return s;
  }

  tr(v, depth) {
    const dp = depth || 0;
    if (typeof v === 'string') return this.trStr(v);
    if (dp > 4 || !v || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map((x) => this.tr(x, dp + 1));
    if (v.$typeof || v.nodeType || v.current === null || (v.current && v.current.nodeType)) return v;
    if (Object.getPrototypeOf(v) !== Object.prototype) return v;
    const o = {};
    for (const k in v) o[k] = this.tr(v[k], dp + 1);
    return o;
  }

  renderVals() {
    const st = this.state;
    const t = this.dict[st.lang] || this.dict.en;
    const th = this.themes[st.theme];
    const ac = this.accents[st.accent];
    const at = th.dark ? ac.text : ac.hex;
    const soft = th.dark ? ac.softDark : ac.soft;
    const cc = this.curCol();
    const notifRows = [
      { id: 'msg', pl: 'Wiadomości od lokali', en: 'Messages from venues', it: 'Messaggi dai locali', spl: 'Odpowiedzi na opinie', sen: 'Replies to your reviews', sit: 'Risposte alle recensioni' },
      { id: 'prox', pl: 'Gdy jestem blisko', en: 'When I am nearby', it: 'Quando sono vicino', spl: 'Nieodkryte miejsca w 200 m', sen: 'Undiscovered spots within 200 m', sit: 'Luoghi non scoperti entro 200 m' },
      { id: 'offers', pl: 'Okazje i happy hours', en: 'Deals and happy hours', it: 'Offerte e happy hour', spl: 'Tylko z twoich kategorii', sen: 'Only from your categories', sit: 'Solo dalle tue categorie' },
      { id: 'news', pl: 'Nowości w TAPI', en: 'What is new in TAPI', it: 'Novità in TAPI', spl: 'Raz w miesiącu', sen: 'Once a month', sit: 'Una volta al mese' }
    ].map((n) => { const on = !!(st.notif || {})[n.id];
      return { label: this.l3(n.pl, n.en, n.it), sub: this.l3(n.spl, n.sen, n.sit),
        track: on ? ac.hex : th.hair, knob: on ? '16px' : '0px',
        toggle: () => { const nx = Object.assign({}, this.state.notif); nx[n.id] = !nx[n.id]; this.buzz(9);
          this.setState({ notif: nx }); if (n.id === 'prox') this.setState({ push: nx.prox }); } }; });
    const v = this.venues.filter((x) => x.id === st.venue)[0] || this.venues[0];
    const anyOverlay = !!(st.sortOpen || st.notifOpen || st.langOpen || st.plansOpen || st.helpOpen || st.tourOn
      || st.mailOpen || st.gateOpen || st.partnersOpen || st.couponOpen || st.redeemOpen || st.altOpen
      || st.quickOpen || st.interestsSheet || st.savedOpen || st.venueMenu || st.report || st.mapStats || st.delAcc
      || st.menuScan || st.invite);
    const avaName = (st.user && st.user.name) || st.me.name || '';
    const quickWho = avaName || (st.lang === 'pl' ? 'Gość' : (st.lang === 'it' ? 'Ospite' : 'Guest'));
    const dSc = !!st.dScroll;
    const pSc = !!st.pScroll;
    const PL0 = st.lang === 'pl';
    const revBase = v.opinions.map((o, i) => ({ who: o[0], rate: o[1], text: this.dt(o[2]), age: i + 2, mine: false }));
    let revAll = (((st.myRevs || {})[v.id]) || []).map((m) => ({ who: m.who, rate: m.rate, text: m.text, age: 0, mine: true })).concat(revBase);
    const revTotal = revAll.length;
    const revAvg = revTotal ? (revAll.reduce((a, r) => a + r.rate, 0) / revTotal) : 0;
    if (st.revFilter) revAll = revAll.filter((r) => r.rate >= st.revFilter);
    if (st.revSort === 'high') revAll = revAll.slice().sort((a, b) => (b.rate - a.rate) || (a.age - b.age));
    else if (st.revSort === 'low') revAll = revAll.slice().sort((a, b) => (a.rate - b.rate) || (a.age - b.age));
    else revAll = revAll.slice().sort((a, b) => a.age - b.age);
    const revDraftOk = (st.revDraft || '').trim().length > 3;
    const catNow = ({ gastro: PL0 ? 'Jedzenie' : 'Food', kawa: PL0 ? 'Kawa' : 'Coffee',
      noc: PL0 ? 'Wieczorem' : 'Nightlife', event: PL0 ? 'Wydarzenia' : 'Events',
      followed: PL0 ? 'Obserwowane' : 'Followed' })[st.cat];
    const pts = 240 + (st.savedIds.length * 20) + (st.scanned ? 60 : 0) + (Object.keys(st.myRevs || {}).length * 40);
    const lvlSize = 400;
    const lvl = Math.floor(pts / lvlSize) + 1;
    const lvlPts = pts % lvlSize;
    const rewardDefs = [
      { id: 'coffee', need: 200, pl: 'Filtrowa kawa gratis', en: 'Free filter coffee', at: 'Brama 7', ic: 'cup', val: '4 €' },
      { id: 'wine', need: 400, pl: 'Kieliszek wina domu', en: 'House glass of wine', at: 'Nokturn', ic: 'glass', val: '6 €' },
      { id: 'disco', need: 700, pl: 'Wejściówka na silent disco', en: 'Silent disco entry', at: 'Hala Forum', ic: 'ticket', val: '12 €' },
      { id: 'bill', need: 1000, pl: '−10 € na rachunek', en: this.l3('−10 € na rachunek', '−10 € off the bill', '−10 € sul conto'), at: this.l3('dowolny lokal TAPI', 'any TAPI venue', 'qualsiasi locale TAPI'), ic: 'ticket', val: '−10 €' },
      { id: 'dinner', need: 1400, pl: 'Kolacja dla dwojga −30%', en: 'Dinner for two −30%', at: 'Ostra Kuchnia', ic: 'plate', val: '−30%' }
    ];
    const readyCount = rewardDefs.filter((r) => pts >= r.need).length;
    const standFree = st.plan === 'vip';
    const standBlack = (st.standColor || 'white') === 'black';
    const trIt = (s) => st.lang === 'it' ? this.trStr(s) : s;
    const cv = st.coupon ? this.venues.filter((x) => x.id === st.coupon)[0] : null;
    const list = this.filtered();
    const sortNames = { reco: ['Polecane', 'Recommended'], cheap: ['Najtańsze', 'Cheapest'],
      rated: ['Najlepiej oceniane', 'Top rated'], popular: ['Najpopularniejsze', 'Most reviewed'], near: ['Najbliżej', 'Closest'] };
    const fN = ((st.sortBy && st.sortBy !== 'reco') ? 1 : 0) + (st.fPrice ? 1 : 0) + (st.fRating ? 1 : 0) + (st.fOpen ? 1 : 0) + ((st.area && st.area !== 'all') ? 1 : 0);
    const lq = (st.langQuery || '').trim().toLowerCase();
    const langHits = this.langDefs.filter((l) => !lq || (l.native + ' ' + l.en + ' ' + l.code).toLowerCase().indexOf(lq) > -1);
    const profTabDefs = [
      { id: 'konto', pl: 'Konto', en: 'Account', it: 'Account' }, { id: 'saved', pl: 'Zapisane', en: 'Saved', it: 'Salvati' },
      { id: 'plan', pl: 'Nagrody', en: 'Rewards', it: 'Premi' }, { id: 'set', pl: 'Ustawienia', en: 'Settings', it: 'Impostazioni' }
    ];
    const pIdx = Math.max(0, profTabDefs.map((p) => p.id).indexOf(st.profTab || 'saved'));
    const planHot = st.bizAccount && st.plan !== 'base';
    const myId = st.bizPicked || 'nokturn';
    const myV = this.venues.filter((x) => x.id === myId)[0] || this.venues[0];
    const LI = st.lang === 'it';
    const evScope = this.eventDefs.filter((e) => !st.area || st.area === 'all' || e.district === st.area);
    const ew = st.evWhen || 'all';
    const evHits = evScope.filter((e) => {
      if (ew === 'tom') return e.d <= 1;
      if (ew === 'week') return e.d >= 3 && e.d <= 5;
      if (ew === 'next') return e.d >= 6 && e.d <= 9;
      if (ew === 'free') return e.price === 0;
      return true;
    });
    const myPart = ((st.partners || {})[myId] || []).map((id) => this.venues.filter((x) => x.id === id)[0]).filter(Boolean);
    const inb = this.venues.filter((x) => x.id !== myId && ((st.partners || {})[x.id] || []).indexOf(myId) > -1);
    const vPart = ((st.partners || {})[st.venue] || []).map((id) => this.venues.filter((x) => x.id === id)[0]).filter(Boolean);
    const meSnap = st.meSaved || {};
    const meChanged = ['name', 'mail', 'phone', 'city', 'born'].some((k) => (st.me[k] || '') !== (meSnap[k] || ''));
    const plMiejsc = list.length === 1 ? ' miejsce' : (list.length >= 2 && list.length <= 4 ? ' miejsca' : ' miejsc');
    const mins = this.props.couponMinutes ?? 15;
    const mm = Math.floor(st.secs / 60), ss = st.secs % 60;
    const PLx = st.lang === 'pl';
    const navDefs = [
      { id: 'discover', label: t.navDiscover }, { id: 'map', label: t.navMap },
      { id: 'scan', label: t.navScan },
      { id: 'friends', label: PLx ? 'Znajomi' : 'Friends' },
      { id: 'profile', label: t.navProfile }
    ];
    const active = st.tab === 'venue' ? 'discover' : st.tab;
    const navSel = (st.navDragging && st.navHover) ? st.navHover : active;
    const navIdx = Math.max(0, this.navOrder.indexOf(navSel));

    const bizIdx = Math.max(0, this.bizOrder.indexOf(st.oTab));
    const fly = st.navFly;
    const flyFrom = fly ? fly[0] : navIdx;
    const flySpan = fly ? (fly[1] - fly[0] + 1) : 1;
    const bFly = st.bizFly;
    const bFrom = bFly ? bFly[0] : bizIdx;
    const bSpan = bFly ? (bFly[1] - bFly[0] + 1) : 1;
    const dragPx = st.dragX || 0;

    const PL = st.lang === 'pl';
    const peekCur = st.tab === 'venue' ? 'discover' : st.tab;
    let peekTarget = null;
    if (st.navDragging && st.navHover) {
      if (st.navHover !== peekCur) peekTarget = st.navHover;
    } else if (st.phase === 'app' && st.tab !== 'venue' && Math.abs(dragPx) > 6) {
      const pI = this.navOrder.indexOf(peekCur), pT = pI + (dragPx < 0 ? 1 : -1);
      if (pI > -1 && pT >= 0 && pT < this.navOrder.length) peekTarget = this.navOrder[pT];
    }
    const peekDef = peekTarget ? navDefs.filter((n) => n.id === peekTarget)[0] : null;
    const peekProg = Math.min(1, Math.abs(dragPx) / 62);
    const yearly = st.billing === 'y';
    const packs = Math.max(1, Math.round(st.qty / 10));
    const stickerCost = st.plan === 'base' ? (packs - 1) * 25 : st.plan === 'pro' ? packs * 15 : (packs - 1) * 8;
    const ship = st.plan === 'base' ? 30 : 0;
    const total = stickerCost + ship;
    const mq = st.mapQ.trim().toLowerCase();
    const mapList = this.venues.filter((x) => {
      if (st.mapCat !== 'all' && x.cat !== st.mapCat) return false;
      if (!mq) return true;
      return (x.name + ' ' + x.catLabel + ' ' + x.district).toLowerCase().indexOf(mq) > -1;
    }).slice().sort((a, b) => {
      const m = (v) => { const n = parseFloat(v.dist); return isNaN(n) ? Infinity : n * (v.dist.indexOf('km') > -1 ? 1000 : 1); };
      const s = st.sortBy || 'reco';
      if (s === 'cheap') return a.price.length - b.price.length || b.rating - a.rating;
      if (s === 'rated') return b.rating - a.rating || b.votes - a.votes;
      if (s === 'popular') return b.votes - a.votes;
      if (s === 'near') return m(a) - m(b);
      return 0;
    });
    const pv = st.pin ? this.venues.filter((x) => x.id === st.pin)[0] : null;
    const bizT = st.bizTour > 0;
    const tourN = bizT ? st.bizTour : st.tour;
    const tourMax = bizT ? 3 : 5;
    const tourSrc = bizT ? this.bizTourDefs : this.tourDefs;
    const tourStep = tourN > 0 ? ((tourSrc[tourN - 1] || {})[st.lang] || (tourSrc[tourN - 1] || {}).en) : null;
    const altNames = {
      call: [PL ? 'Weryfikacja telefoniczna' : 'Phone verification', PL ? 'Dzwonimy na +48 512 884 210 z kodem.' : 'We are calling +48 512 884 210 with a code.'],
      sms: [PL ? 'Weryfikacja SMS' : 'SMS verification', PL ? 'Kod poszedł na numer firmowy.' : 'Code sent to the business number.'],
      g: [PL ? 'Profil Firmy w Google' : 'Google Business Profile', PL ? 'Łączymy konto zarządzające wizytówką.' : 'Linking the account that manages the listing.'],
      doc: [PL ? 'Dokument firmy' : 'Company document', PL ? 'Sprawdzamy wpis w CEIDG — do 24 h.' : 'Checking the registry entry — up to 24 h.'],
      post: [PL ? 'Pocztówka z kodem' : 'Postcard with a code', PL ? 'List w drodze na adres lokalu.' : 'Letter on the way to the venue.']
    };
    const altSel = st.altPicked ? { n: altNames[st.altPicked][0], d: altNames[st.altPicked][1] } : null;
    const iLabels = this.interestDefs.filter((d) => st.interests.indexOf(d.id) > -1).map((d) => PL ? d.pl : d.en);
    const notifList = [];
    if (st.interestsSaved && iLabels.length) {
      notifList.push({ title: PL ? iLabels[0] + ' obok ciebie' : iLabels[0] + ' near you',
        body: PL ? 'Nowe miejsce z twojej kategorii otworzyło się 400 m stąd.' : 'A new spot in your category opened 400 m away.',
        time: PL ? 'teraz' : 'now', fresh: !st.notifRead, delay: '0ms',
        open: () => { this.setState({ notifOpen: false }); this.openVenue('brama'); } });
    }
    notifList.push(
      { title: PL ? 'Jesteś 120 m od Brama 7' : 'You are 120 m from Brama 7', body: PL ? 'Druga filtrówka za 1 zł do 19:00.' : 'Second filter coffee for 1 zł until 7 pm.', time: PL ? 'teraz' : 'now', fresh: !st.notifRead, delay: '60ms', open: () => { this.setState({ notifOpen: false }); this.openVenue('brama'); } },
      { title: PL ? 'Silent disco startuje o 23:00' : 'Silent disco starts at 11 pm', body: PL ? 'Hala Forum, zostało 12 wejściówek −40%.' : 'Hala Forum, 12 tickets left at −40%.', time: '17:40', fresh: !st.notifRead, delay: '120ms', open: () => { this.setState({ notifOpen: false }); this.openVenue('forum'); } },
      { title: PL ? 'Odkryłeś nowy kwartał' : 'You uncovered a new block', body: PL ? 'Zabłocie · 3 miejsca wyszły z mgły.' : 'Zabłocie · 3 places came out of the fog.', time: '16:02', fresh: false, delay: '180ms', open: () => { this.setState({ notifOpen: false }); this.go('map'); } }
    );

    const vals = {
      openTripPlanner: () => {
        this.buzz(20, 'light');
        this.setState({ tab: 'trip', tripStep: 0, tripIntro: true, navDir: 1 });
      },
      t: t,
      tPaper: th.paper, tInk: th.ink, tSub: th.sub, tSurf: th.surf, tHair: th.hair,
      tAcc: ac.hex, tAcct: at, tAccl: ac.text, tSoft: th.dark ? ac.softDark : ac.soft, tOnAcc: '#FBFAF7',
      deviceDark: st.phase === 'splash' || th.dark || (st.phase === 'app' && st.tab === 'scan'),

      isSplash: st.phase === 'splash', isAuth: st.phase === 'auth',
      splashLabel: st.lang === 'pl' ? 'Przewodnik po lokalach i wydarzeniach' : 'Guide to venues and events',
      loginGoogle: () => { 
        this.toast(st.lang === 'pl' ? 'Otwieram okno logowania Google...' : 'Opening Google Sign-In...');
        this.setState({ mail: 'wait', mailStep: 'wait' }); clearTimeout(this.authT); 
        this.authT = setTimeout(() => this.finishLogin('Klara Ziarno'), 1500); 
      },
      loginEmail: () => this.setState({ mail: 'flow', mailStep: 'mail', code: '' }),
      skipLogin: () => { this.setState({ phase: 'app', tab: 'discover' }); this.toast(st.lang === 'pl' ? 'Przeglądasz jako gość. Zaloguj się, gdy zechcesz zbierać kupony.' : 'Browsing as a guest. Sign in whenever you want coupons.'); },
      gateOpen: !!st.gate,
      closeGate: () => this.setState({ gate: false, pending: null }),
      gateTitle: PL ? 'Załóż konto, żeby to zrobić' : 'Create an account to do that',
      gateBody: PL ? 'Kupony, zapisane miejsca, plany wyjazdu i powiadomienia zapisują się na twoim koncie. Zajmie to pół minuty.' : 'Coupons, saved places, trip plans and alerts live on your account. Half a minute and you are in.',
      gateRegister: PL ? 'Załóż konto e-mailem' : 'Sign up with e-mail',
      gateHave: PL ? 'Mam już konto — zaloguj mnie' : 'I already have an account',
      gateLater: PL ? 'Może później' : 'Maybe later',
      gateGoogle: () => { 
        this.toast(st.lang === 'pl' ? 'Otwieram okno logowania Google...' : 'Opening Google Sign-In...');
        this.setState({ gate: false, mail: 'wait', mailStep: 'wait' }); clearTimeout(this.authT); 
        this.authT = setTimeout(() => this.finishLogin('Klara Ziarno'), 1500); 
      },
      gateToRegister: () => this.setState({ gate: false, mail: 'flow', authMode: 'register', mailStep: 'mail', code: '' }),
      gateToLogin: () => this.setState({ gate: false, mail: 'flow', authMode: 'login', mailStep: 'mail', code: '' }),
      gatePerks: [
        { t: this.l3('Kupony i kody rabatowe', 'Coupons and discount codes', 'Coupon e codici sconto') },
        { t: this.l3('Zapisane miejsca i plany wyjazdu', 'Saved places and trip plans', 'Locali salvati e piani di viaggio') },
        { t: this.l3('Powiadomienia o okazjach obok', 'Alerts about deals nearby', 'Avvisi sulle offerte qui vicino') }
      ].map((p, i) => ({ text: p.t, delay: (i * 70) + 'ms' })),
      mailTitle: st.authMode === 'login'
        ? this.l3('Zaloguj się e-mailem', 'Sign in with e-mail', 'Accedi con e-mail')
        : this.l3('Podaj adres e-mail', 'Enter your e-mail', 'Inserisci la tua e-mail'),
      mailOpen: !!st.mail, mailStep1: st.mailStep === 'mail', mailStep2: st.mailStep === 'code', 
      mailStep3: st.mailStep === 'name', mailStep4: st.mailStep === 'avatar',
      mailWait: st.mailStep === 'wait',
      closeMail: () => this.setState({ mail: null, mailStep: 'mail', code: '', pending: null }),
      emailRef: this.emailRef, codeRef: this.codeRef, regNameRef: this.regNameRef, regUserRef: this.regUserRef,
      sendCode: () => { const m = (this.emailRef.current && this.emailRef.current.value) || 'ty@tapi.app';
        this.setState({ mailAddr: m, mailStep: 'code', code: '' });
        if (window.TAPI && window.TAPI.native) {
          window.TAPI.call('auth.sendCode', { email: m, business: this.state.isBizLogin === true })
            .then((r) => { if (r && r.error) this.toast(r.error); })
            .catch((e) => this.toast(String(e.message || e)));
        } },
      codeHint: (st.lang === 'pl' ? 'Wysłaliśmy 4 cyfry na ' : 'We sent 4 digits to ') + (st.mailAddr || 'ty@tapi.app'),
      codeCells: [0, 1, 2, 3, 4, 5].map((i) => ({ ch: st.code[i] || '', border: st.code.length === i ? at : th.hair })),
      keypad: ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((k) => ({
        label: k === 'del' ? '←' : (k === 'ok' ? '✓' : k),
        bg: k === 'ok' ? ac.hex : th.surf, fg: k === 'ok' ? '#FBFAF7' : th.ink, tap: () => this.keyTap(k) })),

      showNav: st.phase === 'app',
      navBg: th.dark ? 'rgba(29,32,37,0.86)' : 'rgba(255,255,255,0.86)',
      navPillL: 'calc(6px + (100% - 12px) * ' + (flyFrom / navDefs.length) + ')',
      navPillW: 'calc((100% - 12px) / ' + navDefs.length + ' * ' + flySpan + ')',
      navItems: navDefs.map((n) => ({
        label: n.label, isDiscover: n.id === 'discover', isMap: n.id === 'map', isScan: n.id === 'scan',
        isFriends: n.id === 'friends', isProfile: n.id === 'profile',
        pill: navSel === n.id ? ac.soft : 'transparent',
        fg: navSel === n.id ? at : th.sub, labelFg: navSel === n.id ? at : th.sub,
        weight: navSel === n.id ? 600 : 500,
        lift: navSel === n.id ? 'translateY(-1px)' : 'none',
        iconT: navSel === n.id ? 'translateY(-2px) scale(1.18)' : 'translateY(0) scale(1)',
        dotOp: navSel === n.id ? '1' : '0', dotS: navSel === n.id ? '1' : '0.3',
        tap: () => { if (this.navSkipClick) return; this.go(n.id); } })),
      navDown: (e) => this.navDown(e), navMove: (e) => this.navMove(e), navUp: () => this.navUp(),
      navBarT: st.navDragging ? 'translateY(-3px) scale(1.015)' : 'none',
      navBarShadow: st.navDragging
        ? '0 30px 56px -18px rgba(22,24,28,0.6), 0 6px 16px -6px rgba(22,24,28,0.24)'
        : '0 22px 44px -20px rgba(22,24,28,0.5), 0 4px 12px -6px rgba(22,24,28,0.18)',
      navPillT: st.navDragging ? 'scale(1.09)' : 'none',
      swipeStart: (e) => this.swipeStart(e), swipeMove: (e) => this.swipeMove(e), swipeEnd: (e) => this.swipeEnd(e),
      sheetSwipeStart: (e) => this.sheetSwipeStart(e), sheetSwipeMove: (e) => this.sheetSwipeMove(e), sheetSwipeEnd: (e) => this.sheetSwipeEnd(e),
      toastSwipeStart: (e) => this.toastSwipeStart(e), toastSwipeMove: (e) => this.toastSwipeMove(e), toastSwipeEnd: (e) => this.toastSwipeEnd(e),
      toastDragT: st.toastDragY ? 'translateY(' + st.toastDragY + 'px)' : 'none',
      toastDragEase: st.toastDragY ? 'none' : 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease',
      sheetDragT: st.sheetDragY ? 'translateY(' + st.sheetDragY + 'px)' : 'none',
      sheetDragEase: st.sheetDragY ? 'none' : 'transform 0.42s cubic-bezier(0.16,1,0.3,1)',
      dragShift: dragPx ? 'translateX(' + dragPx + 'px) scale(' + (1 - Math.min(0.035, Math.abs(dragPx) / 2400)).toFixed(4) + ')' : 'none',
      dragEase: dragPx ? 'none' : 'transform 0.42s cubic-bezier(0.16,1,0.3,1)',
      dragFade: dragPx ? (1 - Math.min(0.14, Math.abs(dragPx) / 900)) : 1,
      scrIn: (st.dragX || st.swiped) ? 'none' : (st.navDir > 0 ? 'slideInR' : 'slideInL') + ' 0.44s cubic-bezier(0.16,1,0.3,1) both',

      hasToast: !!st.toast, toast: st.toast,

      recenterMap: () => { if (this.map) this.map.flyTo([50.0483, 19.9448], 15, { duration: 0.8 }); },
      recenterLabel: st.lang === 'pl' ? 'Wyśrodkuj' : 'Recenter',
      scannedLabel: st.lang === 'pl' ? 'Zeskanowane' : 'Scanned',
      codeShowLabel: st.lang === 'pl' ? 'Pokaż ten kod przy barze' : 'Show this code at the bar',
      openCoupon: () => this.openVenue(st.coupon, true),
      showAtVenue: st.lang === 'pl' ? 'Pokaż w lokalu' : 'Show at venue',
      noCouponTitle: st.lang === 'pl' ? 'Brak aktywnych kuponów' : 'No active coupons',
      noCouponSub: st.lang === 'pl' ? 'Zeskanuj naklejkę w witrynie, aby odebrać pierwszy.' : 'Scan a window sticker to get your first one.',
      goScanTab: () => this.go('scan'),
      loginWhy: st.lang === 'pl' ? 'Kupony, zapisane miejsca i powiadomienia' : 'Coupons, saved places and alerts',
      bizPanelSub: st.lang === 'pl' ? 'Statystyki, oferty, relacje na IG' : 'Analytics, offers, IG stories',
      bizLabel: st.biz === 'panel' ? (st.lang === 'pl' ? 'dla firm · panel' : 'for business · panel') : (st.lang === 'pl' ? 'dla firm' : 'for business'),
      heroTitle: st.lang === 'pl' ? 'Zmień swój lokal w magnes na gości i turystów.' : 'Turn your venue into a magnet for guests and travellers.',
      heroSub: st.lang === 'pl' ? 'Dodaj firmę z Google Maps w 30 sekund, publikuj wydarzenia i generuj relacje na Instagram.' : 'Add your business from Google Maps in 30 seconds, publish events and generate Instagram stories.',
      heroCta: st.lang === 'pl' ? 'Zarejestruj lokal za darmo' : 'Register your venue for free',
      heroNote: st.lang === 'pl' ? 'Bez karty. Plan BASE zostaje darmowy na zawsze.' : 'No card needed. BASE stays free forever.',
      proofTitle: st.lang === 'pl' ? 'Naklejka na szybie pracuje, gdy ty odpoczywasz.' : 'The window sticker works while you rest.',
      proof1: st.lang === 'pl' ? 'więcej wejść' : 'more walk-ins',
      proof2: st.lang === 'pl' ? 'konfiguracja' : 'to set up',
      proof3: st.lang === 'pl' ? 'widoczność' : 'visibility',
      plansTitle: st.lang === 'pl' ? 'Wybierz pakiet' : 'Choose a plan',
      continueWith: st.lang === 'pl' ? 'Kontynuuj z' : 'Continue with',
      regTitle: st.lang === 'pl' ? 'Znajdź swój lokal w Google' : 'Find your venue on Google',
      regSub: st.lang === 'pl' ? 'Zaciągniemy nazwę, adres, godziny, telefon, zdjęcia i opinie. Potem tylko dodajesz ofertę.' : 'We pull the name, address, hours, phone, photos and reviews. Then you just add an offer.',
      regPh: st.lang === 'pl' ? 'Wpisz nazwę lokalu…' : 'Type your venue name…',
      pulledLabel: st.lang === 'pl' ? 'Dane pobrane z Google' : 'Pulled from Google',
      pulled1: st.lang === 'pl' ? 'Godziny otwarcia i telefon' : 'Opening hours and phone',
      pulled2: st.lang === 'pl' ? '18 zdjęć i 212 opinii' : '18 photos and 212 reviews',
      pulled3: st.lang === 'pl' ? 'Menu i pozycja na mapie' : 'Menu and map position',
      createLabel: st.lang === 'pl' ? 'Utwórz wizytówkę' : 'Create the card',
      openLivePreview: () => {
        const mockV = {
          id: 'mock_preview',
          name: st.bizData ? st.bizData.name : 'Twój Lokal',
          typeLabel: st.bizCategory === 'apartments' ? 'Apartamenty' : 'Restauracja',
          address: 'Kraków, Rynek Główny 1',
          openStatus: 'Otwarte',
          phone: '+48 123 456 789',
          rating: 4.8,
          photos: [
            'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=800&q=80'
          ]
        };
        this.setState({ bizLivePreview: true, isVenue: true, v: mockV });
      },
      scanMenu: () => this.toast(st.lang === 'pl' ? 'Uruchamiam skaner menu z AI...' : 'Starting AI menu scanner...'),
      chartLabel: st.lang === 'pl' ? 'Skany · 7 dni' : 'Scans · 7 days',
      liveLabel: st.lang === 'pl' ? 'Na żywo' : 'Live',
      storyHeadline: [st.lang === 'pl' ? 'Kieliszek frizzante gratis' : 'Free glass of frizzante', st.lang === 'pl' ? 'Winylowy czwartek, 23:30' : 'Vinyl Thursday, 11:30 pm', st.lang === 'pl' ? 'Karta jesienna od dziś' : 'Autumn menu from today'][st.storyTpl],
      genLabel: st.lang === 'pl' ? 'Generuj relację' : 'Generate story',
      stickerLabel: st.lang === 'pl' ? 'Naklejka na szybę' : 'Window sticker',
      stickerTitle: st.lang === 'pl' ? 'Twój kod wejściowy' : 'Your entry code',
      stickerCta: st.lang === 'pl' ? 'Pobierz PDF A5' : 'Download A5 PDF',
      scansLabel: st.lang === 'pl' ? 'Ostatnie skany · dziś' : 'Recent scans · today',
      exitLabel: st.lang === 'pl' ? 'Wyjdź z panelu firmy' : 'Leave business panel',

      headStick: '54px',
      headPadR: dSc ? '64px' : '0px',
      filtRowLabel: PL ? 'Filtry i sortowanie' : 'Filters and sorting',
      filtRowSub: [
        (st.cat === 'all' ? trIt(PL ? 'Wszystkie kategorie' : 'All categories') : trIt(catNow || '')),
        (st.area === 'all' ? trIt(PL ? 'Cały Kraków' : 'All Kraków') : st.area)
      ].filter(Boolean).join(' · '),
      catHead: PL ? 'Kategoria' : 'Category',
      areaHead: PL ? 'Dzielnica' : 'District',
      navPillBg: th.dark
        ? 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(87,195,159,0.14))'
        : 'linear-gradient(180deg, rgba(255,255,255,0.96), ' + ac.soft + ')',
      navPillBorder: th.dark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.9)',
      navPillShadow: th.dark
        ? '0 8px 18px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.22)'
        : '0 8px 18px -10px rgba(22,24,28,0.4), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 0 0 1px ' + ac.soft + '',
      navPillGloss: th.dark
        ? 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0))'
        : 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0))',

      /* ══ MENU LOKALU (PANEL FIRMY) ══ */
      menuTitle: this.l3('Dodaj menu w minutę', 'Add your menu in a minute', 'Aggiungi il menu in un minuto'),
      menuLead: this.l3('Goście widzą menu w twojej wizytówce. Ceny i opisy zmienisz w każdej chwili.',
        'Guests see the menu on your card. Prices and descriptions stay editable.',
        'Gli ospiti vedono il menu nella tua vetrina. Prezzi e descrizioni restano modificabili.'),
      menuTransNote: this.l3('Każda pozycja tłumaczy się od razu na polski, angielski i włoski.',
        'Every item is translated into Polish, English and Italian right away.',
        'Ogni voce viene tradotta subito in polacco, inglese e italiano.'),
      menuScanTitle: this.l3('Zeskanuj kartę', 'Scan the menu', 'Scansiona il menu'),
      menuScanSub: this.l3('Kamera czyta stronę po stronie i sama rozpoznaje ceny.',
        'The camera reads page by page and picks up prices on its own.',
        'La fotocamera legge pagina per pagina e riconosce i prezzi da sola.'),
      menuFastTag: this.l3('NAJSZYBCIEJ', 'FASTEST', 'PIÙ VELOCE'),
      menuWays: [
        { ic: 'photo', t: this.l3('Wgraj zdjęcia', 'Upload photos', 'Carica foto'),
          b: this.l3('Do dziesięciu kadrów karty albo tablicy.', 'Up to ten shots of the card or the board.', 'Fino a dieci scatti della carta o della lavagna.') },
        { ic: 'pdf', t: this.l3('Wgraj PDF', 'Upload a PDF', 'Carica un PDF'),
          b: this.l3('Ten sam plik, który wysyłasz do druku.', 'The same file you send to the printer.', 'Lo stesso file che mandi in stampa.') },
        { ic: 'manual', t: this.l3('Wpisz ręcznie', 'Type it in', 'Inserisci a mano'),
          b: this.l3('Najwolniej, ale masz pełną kontrolę.', 'Slowest, but you control every line.', 'Il più lento, ma controlli ogni riga.') }
      ].map((w, i) => ({ title: w.t, sub: w.b, delay: (i * 60) + 'ms',
        isPhoto: w.ic === 'photo', isPdf: w.ic === 'pdf', isManual: w.ic === 'manual',
        tap: () => { this.buzz(9); this.toast(this.l3('Wybierz plik z telefonu.', 'Pick a file from your phone.', 'Scegli un file dal telefono.')); } })),
      menuHasItems: (st.menuItems || []).length > 0,
      menuLiveHead: this.l3('W twoim menu', 'On your menu', 'Nel tuo menu'),
      menuItems: (st.menuItems || []).map((m, i) => ({ name: m.name, desc: m.desc, price: m.price, delay: (i * 55) + 'ms' })),

      /* ══ SKANER MENU ══ */
      menuScanOpen: !!st.menuScan,
      openMenuScan: () => {
        this.buzz(10);
        if (!window.TAPI || !window.TAPI.native) {
          this.setState({ menuScan: true, scanPhase: 0 });
          clearTimeout(this.msT);
          this.msT = setTimeout(() => { this.buzz([0, 14]); this.setState({ scanPhase: 1 }); }, 1900);
          return;
        }
        this.setState({ menuScan: true, scanPhase: 0 });
        window.TAPI.call('camera.scanMenu').then((r) => {
          if (!r || r.cancelled) { this.setState({ menuScan: false, scanPhase: 0 }); return; }
          if (r.error) { this.setState({ menuScan: false, scanPhase: 0 }); this.toast(r.error); return; }
          var items = (r.items || []).map(function (x) {
            return { name: x.name, desc: x.description || '', price: x.price };
          });
          if (!items.length) {
            this.setState({ menuScan: false, scanPhase: 0 });
            this.toast(this.l3('Nic nie odczytałem z tego zdjęcia.', 'Nothing readable in that photo.', 'Nulla di leggibile in quella foto.'));
            return;
          }
          this.buzz([0, 14]);
          this.setState({ scanPhase: 1, menuItems: items });
        }).catch((e) => { this.setState({ menuScan: false, scanPhase: 0 }); this.toast(String(e.message || e)); });
      },
      closeMenuScan: () => { clearTimeout(this.msT); this.setState({ menuScan: false, scanPhase: 0 }); },
      scanSeeking: (st.scanPhase || 0) === 0,
      scanLocked: (st.scanPhase || 0) === 1,
      frameColor: (st.scanPhase || 0) === 1 ? '#57C39F' : 'rgba(244,242,237,0.42)',
      frameGlow: (st.scanPhase || 0) === 1 ? '46px' : '0px',
      menuScanPage: this.l3('Strona 1 z 3', 'Page 1 of 3', 'Pagina 1 di 3'),
      scanHint: this.l3('Ustaw kartę w ramce. Trzymaj telefon nieruchomo.',
        'Line the menu up inside the frame. Hold the phone steady.',
        'Allinea il menu nella cornice. Tieni fermo il telefono.'),
      scanFoundLabel: this.l3('Rozpoznano 6 pozycji', '6 items recognised', '6 voci riconosciute'),
      scanLines: [
        { name: this.l3('Espresso', 'Espresso', 'Espresso'), price: '9 zł' },
        { name: this.l3('Flat white', 'Flat white', 'Flat white'), price: '16 zł' },
        { name: this.l3('Tost z serem i ziołami', 'Cheese and herb toastie', 'Toast formaggio ed erbe'), price: '24 zł' },
        { name: this.l3('Zupa dnia', 'Soup of the day', 'Zuppa del giorno'), price: '19 zł' },
        { name: this.l3('Wino domu, kieliszek', 'House wine, glass', 'Vino della casa, calice'), price: '22 zł' },
        { name: this.l3('Sernik baskijski', 'Basque cheesecake', 'Cheesecake basca'), price: '21 zł' }
      ].map((l, i) => ({ name: l.name, price: l.price,
        op: (st.scanPhase || 0) === 1 ? '1' : '0',
        y: (st.scanPhase || 0) === 1 ? '0px' : '10px' })),
      scanLangs: [
        { code: 'PL', state: this.l3('gotowe', 'done', 'fatto'), delay: '0ms' },
        { code: 'EN', state: this.l3('gotowe', 'done', 'fatto'), delay: '90ms' },
        { code: 'IT', state: this.l3('gotowe', 'done', 'fatto'), delay: '180ms' }
      ],
      scanCta: (st.scanPhase || 0) === 1
        ? this.l3('Dodaj do menu', 'Add to the menu', 'Aggiungi al menu')
        : this.l3('Szukam karty…', 'Looking for the menu…', 'Cerco il menu…'),
      scanCtaBg: (st.scanPhase || 0) === 1 ? '#57C39F' : 'rgba(244,242,237,0.12)',
      scanCtaFg: (st.scanPhase || 0) === 1 ? '#14161A' : 'rgba(244,242,237,0.5)',
      menuScanCta: () => {
        if ((st.scanPhase || 0) !== 1) return;
        this.buzz([0, 16]);
        this.setState({ menuScan: false, scanPhase: 0, bizSub: 'menu', menuItems: [
          { name: this.l3('Espresso', 'Espresso', 'Espresso'), desc: this.l3('Ziarno z palarni obok', 'Beans from the roastery next door', 'Chicchi dalla torrefazione accanto'), price: '9 zł' },
          { name: 'Flat white', desc: this.l3('Mleko krowie albo owsiane', 'Cow or oat milk', 'Latte vaccino o d’avena'), price: '16 zł' },
          { name: this.l3('Tost z serem i ziołami', 'Cheese and herb toastie', 'Toast formaggio ed erbe'), desc: this.l3('Na zakwasie', 'On sourdough', 'Su pane a lievitazione naturale'), price: '24 zł' },
          { name: this.l3('Zupa dnia', 'Soup of the day', 'Zuppa del giorno'), desc: this.l3('Zmienia się codziennie', 'Changes every day', 'Cambia ogni giorno'), price: '19 zł' },
          { name: this.l3('Wino domu, kieliszek', 'House wine, glass', 'Vino della casa, calice'), desc: this.l3('Białe albo czerwone', 'White or red', 'Bianco o rosso'), price: '22 zł' },
          { name: this.l3('Sernik baskijski', 'Basque cheesecake', 'Cheesecake basca'), desc: this.l3('Pieczony rano', 'Baked this morning', 'Sfornata stamattina'), price: '21 zł' }
        ] });
        this.toast(this.l3('Sześć pozycji w menu, przetłumaczonych na trzy języki.',
          'Six items on the menu, translated into three languages.',
          'Sei voci nel menu, tradotte in tre lingue.'));
      },

      /* ══ ZAPROŚ ZNAJOMYCH ══ */
      inviteOpen: !!st.invite,
      openInvite: () => { this.buzz(9); this.setState({ invite: true }); },
      closeInvite: () => this.setState({ invite: false }),
      inviteKicker: st.phase === 'biz' ? this.l3('POLECAJ LOKALE', 'REFER VENUES', 'PORTA ALTRI LOCALI') : this.l3('ZAPROŚ ZNAJOMYCH', 'INVITE FRIENDS', 'INVITA AMICI'),
      inviteTitle: st.phase === 'biz'
        ? this.l3('Polecisz lokal — obaj zyskujecie', 'Refer a venue — you both gain', 'Porta un locale — ci guadagnate entrambi')
        : this.l3('Zaproś znajomego — obaj dostajecie', 'Invite a friend — you both get something', 'Invita un amico — ricevete entrambi'),
      inviteLead: st.phase === 'biz'
        ? this.l3('Za każdy lokal, który wejdzie z twojego linku, dostajesz miesiąc pakietu za darmo. On startuje z pakietem PRO na 30 dni.',
          'For every venue that joins through your link you get a free month of your plan. They start on PRO for 30 days.',
          'Per ogni locale che entra dal tuo link ricevi un mese gratis del tuo piano. Loro partono con PRO per 30 giorni.')
        : this.l3('Znajomy dostaje 10 € na pierwszy rachunek, ty 300 punktów, kiedy zeskanuje pierwszy kod.',
          'Your friend gets 10 € off their first bill, you get 300 points once they scan their first code.',
          'Il tuo amico riceve 10 € sul primo conto, tu 300 punti quando scansiona il primo codice.'),
      inviteCodeLabel: this.l3('Twój kod', 'Your code', 'Il tuo codice'),
      inviteCode: st.phase === 'biz' ? 'NOKTURN-24' : 'TAPI-M4RTA',
      inviteCopy: this.l3('Kopiuj', 'Copy', 'Copia'),
      copyInvite: () => { this.buzz(11); this.toast(this.l3('Kod skopiowany.', 'Code copied.', 'Codice copiato.')); },
      inviteSides: st.phase === 'biz'
        ? [{ v: this.l3('1 miesiąc', '1 month', '1 mese'), k: this.l3('twojego pakietu za darmo', 'of your plan, free', 'del tuo piano, gratis') },
           { v: this.l3('30 dni PRO', '30 days PRO', '30 giorni PRO'), k: this.l3('dla lokalu, który polecisz', 'for the venue you refer', 'per il locale che porti') }]
        : [{ v: '10 €', k: this.l3('dla znajomego na pierwszy rachunek', 'for your friend, first bill', 'per il tuo amico, primo conto') },
           { v: '300 pkt', k: this.l3('dla ciebie po jego pierwszym skanie', 'for you after their first scan', 'per te dopo la sua prima scansione') }],
      inviteHowHead: this.l3('Jak to działa', 'How it works', 'Come funziona'),
      inviteSteps: (st.phase === 'biz'
        ? [{ t: this.l3('Wysyłasz link', 'You send the link', 'Mandi il link'), b: this.l3('Właścicielowi lokalu, którego znasz.', 'To an owner you know.', 'Al proprietario di un locale che conosci.') },
           { t: this.l3('Lokal zakłada konto', 'The venue signs up', 'Il locale si registra'), b: this.l3('Z twojego linku, w ciągu 30 dni.', 'Through your link, within 30 days.', 'Dal tuo link, entro 30 giorni.') },
           { t: this.l3('Obaj dostajecie bonus', 'You both get the bonus', 'Ricevete entrambi il bonus'), b: this.l3('Naliczamy przy pierwszym rachunku.', 'Applied on the first invoice.', 'Applicato sulla prima fattura.') }]
        : [{ t: this.l3('Wysyłasz link', 'You send the link', 'Mandi il link'), b: this.l3('WhatsApp, SMS, gdziekolwiek.', 'WhatsApp, SMS, anywhere.', 'WhatsApp, SMS, ovunque.') },
           { t: this.l3('Znajomy zakłada konto', 'Your friend signs up', 'Il tuo amico si registra'), b: this.l3('Kupon 10 € czeka od razu w profilu.', 'The 10 € coupon waits in their profile.', 'Il coupon da 10 € lo aspetta nel profilo.') },
           { t: this.l3('Skanuje pierwszy kod', 'They scan their first code', 'Scansiona il primo codice'), b: this.l3('Wtedy dostajesz swoje 300 punktów.', 'That is when your 300 points land.', 'È allora che arrivano i tuoi 300 punti.') }]
      ).map((s, i) => ({ n: String(i + 1), t: s.t, b: s.b, delay: (i * 70) + 'ms' })),
      inviteHasFriends: st.phase !== 'biz',
      inviteListHead: this.l3('Zaproszeni', 'Invited', 'Invitati'),
      inviteFriends: [
        { name: 'Kasia W.', done: true }, { name: 'Tomek B.', done: true }, { name: 'Giulia R.', done: false }
      ].map((f) => ({ initial: f.name.charAt(0), name: f.name,
        state: f.done ? this.l3('zeskanował pierwszy kod', 'scanned their first code', 'ha scansionato il primo codice')
                      : this.l3('konto założone, czeka na skan', 'signed up, waiting for a scan', 'registrato, in attesa di una scansione'),
        reward: f.done ? '+300' : '—', fg: f.done ? at : th.sub })),
      inviteShare: this.l3('Wyślij zaproszenie', 'Send the invite', 'Invia l’invito'),
      inviteCardSub: st.phase === 'biz'
        ? this.l3('Miesiąc pakietu za każdy polecony lokal', 'A free month for every venue you refer', 'Un mese gratis per ogni locale che porti')
        : this.l3('10 € dla znajomego, 300 punktów dla ciebie', '10 € for your friend, 300 points for you', '10 € per il tuo amico, 300 punti per te'),
      shareInvite: () => { this.buzz([0, 14]); this.toast(this.l3('Link gotowy do wysłania.', 'Link ready to send.', 'Link pronto da inviare.')); },
      inviteFoot: st.phase === 'biz'
        ? this.l3('Bez limitu poleceń. Bonus nalicza się po pierwszej opłaconej fakturze.', 'No cap on referrals. The bonus applies after their first paid invoice.', 'Nessun limite di segnalazioni. Il bonus scatta dopo la prima fattura pagata.')
        : this.l3('Bez limitu zaproszeń. Punkty wpadają automatycznie.', 'No cap on invites. Points land automatically.', 'Nessun limite di inviti. I punti arrivano da soli.'),

      /* ══ MENU LOKALU, ZGŁOSZENIA, OBSERWOWANIE ══ */
      cancelLabel: this.l3('Anuluj', 'Dismiss', 'Annulla'),
      venueMenuOpen: !!st.venueMenu,
      openVenueMenu: () => { this.buzz(9); this.setState({ venueMenu: true }); },
      closeVenueMenu: () => this.setState({ venueMenu: false }),
      followBtnBg: (st.following || []).indexOf(v.id) > -1 ? ac.hex : 'rgba(255,255,255,0.94)',
      followBtnFg: (st.following || []).indexOf(v.id) > -1 ? '#FBFAF7' : '#16181C',
      toggleFollow: () => this.toggleFollow(v.id),
      venueMenuRows: (() => {
        const on = (st.following || []).indexOf(v.id) > -1;
        return [
          { isFollow: true, label: on ? this.l3('Przestań obserwować', 'Unfollow', 'Smetti di seguire') : this.l3('Obserwuj lokal', 'Follow venue', 'Segui il locale'),
            sub: this.l3('Powiadomimy o nowych ofertach i wydarzeniach', 'We alert you to new offers and events', 'Ti avvisiamo su nuove offerte ed eventi'),
            fg: th.ink, tap: () => { this.toggleFollow(v.id); this.setState({ venueMenu: false }); } },
          { isRoute: true, label: this.l3('Wyznacz trasę', 'Get directions', 'Indicazioni stradali'),
            sub: this.l3('Otwórz nawigację na mapie', 'Open navigation on the map', 'Apri la navigazione sulla mappa'),
            fg: th.ink, tap: () => { this.setState({ venueMenu: false }); this.startRoute(v.id); } },
          { isShare: true, label: this.l3('Udostępnij', 'Share', 'Condividi'),
            sub: this.l3('Wyślij link do lokalu', 'Send a link to this venue', 'Invia il link del locale'),
            fg: th.ink, tap: () => { this.setState({ venueMenu: false }); this.buzz(9);
              this.toast(this.l3('Link skopiowany.', 'Link copied.', 'Link copiato.')); } },
          { isReport: true, label: this.l3('Zgłoś lokal', 'Report venue', 'Segnala il locale'),
            sub: this.l3('Nieprawdziwe dane, zamknięty, coś nie gra', 'Wrong details, closed down, something is off', 'Dati errati, chiuso, qualcosa non va'),
            fg: '#C44A3A', tap: () => this.setState({ venueMenu: false, report: { kind: 'venue', pick: null } }) },
          { isTerms: true, label: this.l3('Regulamin i zasady', 'Terms and guidelines', 'Termini e linee guida'),
            sub: this.l3('Zasady programu, opinii i kuponów', 'Rules for the programme, reviews and coupons', 'Regole del programma, recensioni e coupon'),
            fg: th.ink, tap: () => { this.setState({ venueMenu: false }); this.buzz(7);
              this.toast(this.l3('Regulamin otwiera się w przeglądarce.', 'Terms open in the browser.', 'I termini si aprono nel browser.')); } }
        ];
      })(),
      reportOpen: !!st.report,
      closeReport: () => this.setState({ report: null }),
      reportTitle: (st.report && st.report.kind === 'review')
        ? this.l3('Zgłoś opinię', 'Report this review', 'Segnala la recensione')
        : this.l3('Zgłoś lokal', 'Report this venue', 'Segnala il locale'),
      reportSub: this.l3('Sprawdzimy zgłoszenie w ciągu 48 godzin. Twoje dane zostają u nas.',
        'We review reports within 48 hours. Your details stay with us.',
        'Esaminiamo le segnalazioni entro 48 ore. I tuoi dati restano da noi.'),
      reportReasons: (() => {
        const rk = st.report && st.report.kind;
        const list = rk === 'review'
          ? [this.l3('Obraźliwa treść', 'Offensive content', 'Contenuto offensivo'),
             this.l3('Spam albo reklama', 'Spam or advertising', 'Spam o pubblicità'),
             this.l3('Nieprawdziwa opinia', 'Fake review', 'Recensione falsa'),
             this.l3('Dane osobowe', 'Personal data', 'Dati personali'),
             this.l3('Coś innego', 'Something else', 'Altro')]
          : [this.l3('Lokal jest zamknięty', 'The venue has closed', 'Il locale ha chiuso'),
             this.l3('Błędny adres albo godziny', 'Wrong address or hours', 'Indirizzo o orari sbagliati'),
             this.l3('Kupon nie został uznany', 'Coupon was refused', 'Coupon rifiutato'),
             this.l3('Zdjęcia nie zgadzają się z lokalem', 'Photos do not match the venue', 'Le foto non corrispondono'),
             this.l3('Coś innego', 'Something else', 'Altro')];
        const sel = st.report && st.report.pick;
        return list.map((label, i) => ({ label: label,
          dotBg: sel === i ? ac.hex : 'transparent', dotBorder: sel === i ? ac.hex : th.hair,
          tap: () => { this.buzz(7); this.setState({ report: Object.assign({}, st.report, { pick: i }) }); } }));
      })(),
      reportSend: this.l3('Wyślij zgłoszenie', 'Send report', 'Invia segnalazione'),
      reportSendBg: (st.report && st.report.pick != null) ? ac.hex : th.hair,
      reportSendFg: (st.report && st.report.pick != null) ? '#FBFAF7' : th.sub,
      sendReport: () => { if (!st.report || st.report.pick == null) return;
        this.buzz([0, 12]); this.setState({ report: null });
        this.toast(this.l3('Zgłoszenie wysłane. Odezwiemy się mailem.', 'Report sent. We will e-mail you.', 'Segnalazione inviata. Ti scriviamo via e-mail.')); },

      /* ══ STATYSTYKI MAPY ══ */
      mapStatsOpen: !!st.mapStats,
      openMapStats: () => { this.buzz(9); this.setState({ mapStats: true }); },
      closeMapStats: () => this.setState({ mapStats: false }),
      statsRingDash: ((this.mapProgress().pct / 100) * 289).toFixed(1) + ' 289',
      statsPctLabel: this.l3('odkryte', 'uncovered', 'svelata'),
      statsTitle: this.l3('Twoja mapa Krakowa', 'Your map of Kraków', 'La tua mappa di Cracovia'),
      statsAreasHead: this.l3('Dzielnice', 'Districts', 'Quartieri'),
      statsCards: (() => { const m = this.mapProgress();
        return [
          { v: m.areas + '/' + m.allAreas, k: this.l3('kwartałów odkrytych', 'blocks uncovered', 'quartieri svelati') },
          { v: m.visited + '/' + m.total, k: this.l3('miejsc odwiedzonych', 'places visited', 'locali visitati') },
          { v: String((st.savedIds || []).length), k: this.l3('zapisanych miejsc', 'saved places', 'locali salvati') },
          { v: String((st.following || []).length), k: this.l3('obserwowanych lokali', 'venues followed', 'locali seguiti') },
          { v: String(m.areas * 30), k: this.l3('punktów z odkrywania', 'points from exploring', 'punti dall’esplorazione') },
          { v: (m.allAreas - m.areas) + '', k: this.l3('kwartałów przed tobą', 'blocks still ahead', 'quartieri ancora da fare') }
        ].map((s, i) => ({ v: s.v, k: s.k, delay: (i * 55) + 'ms' })); })(),
      statsAreas: (() => {
        const ex = st.explored || [];
        const t = Math.PI / 180;
        const gap = (a, b, c, d) => { const dLat = (c - a) * t, dLng = (d - b) * t;
          const x = Math.pow(Math.sin(dLat / 2), 2) + Math.cos(a * t) * Math.cos(c * t) * Math.pow(Math.sin(dLng / 2), 2);
          return 2 * 6371000 * Math.asin(Math.sqrt(x)); };
        const map = {};
        this.venues.forEach((vn) => {
          if (!map[vn.district]) map[vn.district] = { all: 0, hit: 0 };
          map[vn.district].all++;
          if (ex.some((e) => gap(e[0], e[1], vn.lat, vn.lng) <= e[2])) map[vn.district].hit++;
        });
        return Object.keys(map).map((name, i) => {
          const d = map[name], pct = Math.round((d.hit / d.all) * 100);
          return { name: name, pct: pct + '%', delay: (i * 55) + 'ms',
            sub: d.hit + '/' + d.all + ' ' + this.l3('miejsc', 'places', 'locali'),
            iconBg: pct > 0 ? (th.dark ? ac.softDark : ac.soft) : th.hair,
            iconFg: pct > 0 ? at : th.sub, tickOp: pct > 0 ? '1' : '0.25',
            pctFg: pct > 0 ? at : th.sub };
        });
      })(),

      /* ══ USUWANIE KONTA ══ */
      delOpen: !!st.delAcc,
      delStep1: st.delAcc === 1, delStep2: st.delAcc === 2,
      delRef: this.delRef,
      openDel: () => { this.buzz(11); this.setState({ delAcc: 1, delTyped: '' }); },
      closeDel: () => this.setState({ delAcc: null, delTyped: '' }),
      delTitle: st.delAcc === 2
        ? this.l3('Ostatni krok', 'One last step', 'Ultimo passaggio')
        : this.l3('Usunąć konto na stałe?', 'Delete your account for good?', 'Eliminare l’account per sempre?'),
      delBody: st.delAcc === 2
        ? this.l3('Wpisz USUŃ, żeby potwierdzić. Tego nie da się cofnąć.', 'Type DELETE to confirm. This cannot be undone.', 'Scrivi ELIMINA per confermare. Non è reversibile.')
        : this.l3('Konto i wszystko, co się z nim wiąże, znika po 30 dniach. Do tego czasu możesz wrócić, logując się ponownie.',
          'Your account and everything tied to it disappears after 30 days. Until then you can come back by signing in.',
          'Il tuo account e tutto ciò che vi è collegato spariscono dopo 30 giorni. Fino ad allora puoi tornare accedendo di nuovo.'),
      delLoses: [
        { t: this.l3((st.points || 0) + ' punktów i wszystkie nagrody', (st.points || 0) + ' points and every reward', (st.points || 0) + ' punti e tutti i premi') },
        { t: this.l3('Zapisane miejsca, kupony i plany wyjazdu', 'Saved places, coupons and trip plans', 'Locali salvati, coupon e piani di viaggio') },
        { t: this.l3('Odkryta mapa i historia wizyt', 'Your uncovered map and visit history', 'La mappa svelata e lo storico delle visite') }
      ],
      delTypeLabel: this.l3('Potwierdzenie', 'Confirmation', 'Conferma'),
      delWord: this.l3('USUŃ', 'DELETE', 'ELIMINA'),
      onDelType: (e) => this.setState({ delTyped: e.target.value }),
      delBorder: ((st.delTyped || '').trim().toUpperCase() === this.l3('USUŃ', 'DELETE', 'ELIMINA')) ? '#C44A3A' : th.hair,
      delCta: st.delAcc === 2 ? this.l3('Usuń konto', 'Delete account', 'Elimina account') : this.l3('Rozumiem, dalej', 'I understand, continue', 'Ho capito, continua'),
      delCtaBg: st.delAcc === 2
        ? (((st.delTyped || '').trim().toUpperCase() === this.l3('USUŃ', 'DELETE', 'ELIMINA')) ? '#C44A3A' : th.hair)
        : '#C44A3A',
      delCtaFg: st.delAcc === 2
        ? (((st.delTyped || '').trim().toUpperCase() === this.l3('USUŃ', 'DELETE', 'ELIMINA')) ? '#FFF' : th.sub)
        : '#FFF',
      delNext: () => {
        if (st.delAcc === 1) { this.buzz(10); this.setState({ delAcc: 2, delTyped: '' });
          setTimeout(() => { if (this.delRef.current) this.delRef.current.focus(); }, 120); return; }
        if ((st.delTyped || '').trim().toUpperCase() !== this.l3('USUŃ', 'DELETE', 'ELIMINA')) { this.buzz([0, 8, 60, 8]); return; }
        this.buzz([0, 18]);
        this.setState({ delAcc: null, delTyped: '', user: null, coupon: null, savedIds: [], following: [], profTab: 'saved' });
        this.toast(this.l3('Konto usunięte. Przykro nam, że odchodzisz.', 'Account deleted. Sorry to see you go.', 'Account eliminato. Ci dispiace vederti andare.'));
      },

      /* ══ TAPI SMART STAND ══ */
      standOpen: !!st.standOpen,
      openStand: () => { this.buzz(9); this.setState({ standOpen: true, standStep: 0 }); },
      closeStand: () => { this.buzz(8); this.setState({ standOpen: false }); },
      standBack: () => { this.buzz(8); if ((st.standStep || 0) > 0) this.setState({ standStep: 0 }); else this.setState({ standOpen: false }); },
      standSwipeStart: (e) => { this.stSw = { x: e.clientX, y: e.clientY, lock: null }; },
      standSwipeMove: (e) => { const s = this.stSw; if (!s) return;
        const dx = e.clientX - s.x, dy = e.clientY - s.y;
        if (!s.lock && (Math.abs(dx) > 9 || Math.abs(dy) > 9)) s.lock = Math.abs(dx) > Math.abs(dy) * 1.5 ? 'x' : 'y';
        if (s.lock === 'x' && dx > 0) this.setState({ standDragX: Math.min(150, dx) }); },
      standSwipeEnd: () => { const s = this.stSw; this.stSw = null;
        const d = this.state.standDragX || 0;
        this.setState({ standDragX: 0 });
        if (s && s.lock === 'x' && d > 62) { this.buzz(11);
          if ((this.state.standStep || 0) > 0) this.setState({ standStep: 0 }); else this.setState({ standOpen: false }); } },
      standDragT: st.standDragX ? 'translateX(' + st.standDragX + 'px)' : 'none',
      standDragEase: st.standDragX ? 'none' : 'transform 0.44s cubic-bezier(0.16,1,0.3,1)',
      standStep0: (st.standStep || 0) === 0, standStep1: (st.standStep || 0) === 1,
      standPills: [0, 1].map((i) => ({ fill: (st.standStep || 0) >= i ? '100%' : '0%' })),
      standToProduct: () => this.setState({ standStep: 1 }),
      standToHow: () => this.setState({ standStep: 0 }),
      standNextCta: this.l3('Dalej — wybierz swój', 'Next — pick yours', 'Avanti — scegli il tuo'),
      standBackHow: this.l3('Wróć do opisu', 'Back to how it works', 'Torna a come funziona'),
      standHowKicker: this.l3('JAK TO DZIAŁA', 'HOW IT WORKS', 'COME FUNZIONA'),
      standStickers: this.l3('10 naklejek QR na stoliki — gratis w każdej przesyłce',
        '10 QR table stickers — free in every shipment',
        '10 adesivi QR da tavolo — gratis in ogni spedizione'),
      standCardTitle: this.l3('Zamów TAPI Smart Stand', 'Order the TAPI Smart Stand', 'Ordina il TAPI Smart Stand'),
      standPlanTag: st.plan === 'vip' ? 'VIP · −70%' : st.plan === 'pro' ? 'PRO · −50%' : this.l3('BASE · cena podstawowa', 'BASE · list price', 'BASE · prezzo di listino'),
      standPriceNow: st.plan === 'vip' ? '7,50 €' : st.plan === 'pro' ? '12,50 €' : '25 €',
      standPriceWas: st.plan === 'base' ? '' : '25 €',
      standHasWas: st.plan !== 'base',
      standKicker: 'TAPI SMART STAND',
      standTitle: st.standOrdered
        ? (PL ? 'Twój stojak jest w drodze' : 'Your stand is on its way')
        : (PL ? 'Stojak, który sam rozlicza kupony' : 'The stand that redeems coupons by itself'),
      standLead: PL
        ? 'Akrylowy krążek na ladzie z kodem QR i chipem NFC. Bez prądu, bez kabli, bez integracji z kasą — gość zbliża telefon, kupon spala się sam, a ty dostajesz powiadomienie.'
        : 'An acrylic puck for the counter with a QR code and an NFC chip. No power, no cables, no POS integration — the guest taps their phone, the coupon burns itself and you get a notification.',
      standFree: standFree,
      standOrdered: !!st.standOrdered,
      standFreeTag: PL ? 'GRATIS W VIP' : 'FREE ON VIP',
      standCardSub: st.standOrdered
        ? this.l3('W produkcji · wysyłka w 48 h', 'In production · ships within 48 h', 'In produzione · spedizione entro 48 h')
        : this.l3('Wysyłka i 10 naklejek QR w cenie. W PRO −50%, w VIP −70%.',
          'Shipping and 10 QR stickers included. −50% on PRO, −70% on VIP.',
          'Spedizione e 10 adesivi QR inclusi. −50% con PRO, −70% con VIP.'),
      standCardCta: st.standOrdered ? (PL ? 'Zobacz zamówienie' : 'See the order') : (PL ? 'Zamów stojak' : 'Order the stand'),
      standCardBg: standFree ? ac.hex : th.surf,
      standCardFg: standFree ? '#FBFAF7' : th.ink,
      standCardBorder: standFree ? ac.hex : th.hair,
      standCtaBg: standFree ? 'rgba(255,255,255,0.18)' : ac.hex,
      standCtaFg: standFree ? '#FBFAF7' : '#FBFAF7',
      standMiniFace: standBlack ? 'linear-gradient(160deg, #2A2D33, #14161A)' : 'linear-gradient(160deg, #FFFFFF, #E9E6DF)',
      standMiniEdge: standBlack ? 'rgba(255,255,255,0.22)' : 'rgba(22,24,28,0.16)',
      standMiniInk: standBlack ? '#F4F2ED' : '#16181C',
      standMiniQrBg: standBlack ? 'rgba(255,255,255,0.14)' : 'rgba(22,24,28,0.07)',
      standMiniQrFg: standBlack ? '#F4F2ED' : '#16181C',
      standStageBg: th.dark ? 'radial-gradient(120% 80% at 50% 30%, rgba(87,195,159,0.08), transparent 70%)' : 'radial-gradient(120% 80% at 50% 30%, rgba(31,90,70,0.07), transparent 70%)',
      standFace: standBlack ? 'linear-gradient(158deg, #2C3037 0%, #191C21 55%, #101215 100%)' : 'linear-gradient(158deg, #FFFFFF 0%, #F6F4EF 55%, #E7E3DA 100%)',
      standBackFace: standBlack ? '#0E1014' : '#DED9CF',
      standEdge: standBlack ? 'linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.05))' : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(22,24,28,0.1))',
      standFaceBorder: standBlack ? 'rgba(255,255,255,0.16)' : 'rgba(22,24,28,0.12)',
      standShadow: standBlack ? '0 30px 54px -28px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.18)' : '0 30px 54px -30px rgba(22,24,28,0.6), inset 0 1px 0 rgba(255,255,255,0.9)',
      standSheen: standBlack ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.75)',
      standInk: standBlack ? '#F4F2ED' : '#16181C',
      standInkSoft: standBlack ? 'rgba(244,242,237,0.55)' : 'rgba(22,24,28,0.45)',
      standQrRing: standBlack ? 'rgba(255,255,255,0.08)' : 'rgba(22,24,28,0.05)',
      standQrPulse: standBlack ? 'rgba(87,195,159,0.5)' : 'rgba(31,90,70,0.35)',
      standQrBg: standBlack ? '#F4F2ED' : '#FFFFFF',
      standNfcFg: standBlack ? 'rgba(244,242,237,0.3)' : 'rgba(22,24,28,0.22)',
      standBase: standBlack ? 'linear-gradient(180deg, #3A3F47, #1B1E23)' : 'linear-gradient(180deg, #F2EFE8, #CFC8BA)',
      standFloorShade: th.dark ? 'rgba(0,0,0,0.55)' : 'rgba(22,24,28,0.22)',
      standQr: Array.apply(null, { length: 81 }).map((_, i) => {
        const r = Math.floor(i / 9), c = i % 9;
        const corner = (r < 3 && c < 3) || (r < 3 && c > 5) || (r > 5 && c < 3);
        const ring = corner && (r === 0 || r === 2 || c === 0 || c === 2 || (r > 5 && (r === 6 || r === 8)) || (c > 5 && (c === 6 || c === 8)));
        const on = corner ? ring : ((i * 7 + r * 3 + c * 5) % 5 < 2);
        return { bg: on ? (standBlack ? '#16181C' : '#16181C') : 'transparent' };
      }),
      standScanHint: PL ? 'zbliż telefon' : 'tap your phone',
      standNameShown: (st.standName || myV.name),
      standRotDeg: (st.standRot || 0) + 'deg',
      standRotEase: st.standDrag ? 'none' : 'transform 0.7s cubic-bezier(0.16,1,0.3,1)',
      standDragStart: (e) => this.standDragStart(e),
      standDragMove: (e) => this.standDragMove(e),
      standDragEnd: () => this.standDragEnd(),
      standDragHint: PL ? 'przeciągnij, aby obrócić' : 'drag to rotate',
      standColorHead: PL ? 'Kolor' : 'Colour',
      standColors: [
        { id: 'white', pl: 'Biały akryl', en: 'White acrylic', sw: 'linear-gradient(150deg, #FFFFFF, #E7E3DA)' },
        { id: 'black', pl: 'Czarny akryl', en: 'Black acrylic', sw: 'linear-gradient(150deg, #2C3037, #101215)' }
      ].map((c) => { const on = (st.standColor || 'white') === c.id;
        return { label: PL ? c.pl : c.en, swatch: c.sw, border: on ? at : th.hair, fg: on ? at : th.sub,
          pick: () => this.setState({ standColor: c.id }) }; }),
      standNameHead: PL ? 'Napis na stojaku' : 'Text on the stand',
      standName: st.standName,
      setStandName: (e) => this.setState({ standName: e.target.value }),
      standNamePh: myV.name,
      standNameNote: PL ? 'Nazwa lokalu drukowana u góry. Pod kodem QR zawsze logo TAPI.' : 'Your venue name is printed at the top. The TAPI logo always sits under the QR code.',
      standHowHead: PL ? 'Jak to działa przy kasie' : 'How it works at the counter',
      standHow: [
        { ic: 'tap', pl: 'Zbliżenie telefonu albo skan QR', en: 'A phone tap or a QR scan',
          bpl: 'Chip NFC siedzi pod kodem QR — gość przykłada telefon jak przy płatności kartą. Bez aplikacji też działa: otwiera się strona lokalu z rejestracją jednym kliknięciem.',
          ben: 'The NFC chip sits under the QR code — the guest taps as if paying by card. With no app it still works: your venue page opens with one-click sign-up.' },
        { ic: 'burn', pl: 'Kupon spala się sam', en: 'The coupon burns itself',
          bpl: 'Aktywny kupon znika z bazy w tej samej sekundzie i pokazuje pełnoekranowy zielony ekran ze stoperem, np. „ZNIŻKA −20% AKTYWNA”.',
          ben: 'An active coupon is redeemed in the same second and shows a full-screen green confirmation with a timer, e.g. “−20% DISCOUNT ACTIVE”.' },
        { ic: 'ping', pl: 'Dźwięk PING dla obsługi', en: 'A PING for your staff',
          bpl: 'Głośny, krótki sygnał przy kasie plus push na telefon barmana lub menedżera — wiadomo, kto i co odebrał.',
          ben: 'A short, loud chime at the counter plus a push to the bartender or manager — you know who redeemed what.' },
        { ic: 'off', pl: 'Brak kuponu? Lista promocji', en: 'No coupon? A list of deals',
          bpl: 'Gość bez aktywnego kuponu widzi wszystkie twoje aktualne promocje i wybiera jedną na miejscu.',
          ben: 'A guest with no active coupon sees all your current deals and picks one on the spot.' }
      ].map((h, i) => ({ title: PL ? h.pl : h.en, body: PL ? h.bpl : h.ben, delay: (i * 70) + 'ms',
        isTap: h.ic === 'tap', isBurn: h.ic === 'burn', isPing: h.ic === 'ping', isOff: h.ic === 'off' })),
      standBill: [
        { k: this.l3('Smart Stand (akryl + NFC)', 'Smart Stand (acrylic + NFC)', 'Smart Stand (acrilico + NFC)'), v: '25 €',
          size: '12.5px', weight: 500, fg: th.sub, vFg: th.ink },
        { k: this.l3('Zniżka pakietu', 'Plan discount', 'Sconto del piano'),
          v: st.plan === 'vip' ? '−17,50 €' : st.plan === 'pro' ? '−12,50 €' : '—',
          size: '12.5px', weight: 500, fg: th.sub, vFg: st.plan === 'base' ? th.sub : at },
        { k: this.l3('10 naklejek QR', '10 QR stickers', '10 adesivi QR'), v: this.l3('gratis', 'free', 'gratis'),
          size: '12.5px', weight: 500, fg: th.sub, vFg: at },
        { k: this.l3('Wysyłka (48 h, kurier)', 'Shipping (48 h, courier)', 'Spedizione (48 h, corriere)'), v: this.l3('w cenie', 'included', 'inclusa'),
          size: '12.5px', weight: 500, fg: th.sub, vFg: at },
        { k: this.l3('Razem', 'Total', 'Totale'), v: st.plan === 'vip' ? '7,50 €' : st.plan === 'pro' ? '12,50 €' : '25 €',
          size: '15px', weight: 700, fg: th.ink, vFg: th.ink }
      ],
      standBillNote: standFree
        ? (PL ? 'W pakiecie VIP stojak jest bezpłatny — płacisz wyłącznie za wysyłkę.' : 'On the VIP plan the stand is free — you only pay for shipping.')
        : (PL ? 'W pakiecie VIP dostajesz stojak za 0 zł, płacisz tylko wysyłkę.' : 'On the VIP plan the stand costs 0 zł and you only pay shipping.'),
      standOkTitle: PL ? 'Zamówienie przyjęte' : 'Order confirmed',
      standOkBody: PL ? 'Stojak jest w produkcji. Wysyłka w 48 h, numer przesyłki znajdziesz w Danych firmy.' : 'Your stand is in production. It ships within 48 h; the tracking number lands in Business details.',
      standMainBg: st.standOrdered ? (th.dark ? 'rgba(255,255,255,0.08)' : 'rgba(22,24,28,0.06)') : ac.hex,
      standMainFg: st.standOrdered ? th.sub : '#FBFAF7',
      standMainCta: st.standOrdered
        ? this.l3('Zamówione', 'Ordered', 'Ordinato')
        : this.l3('Zamów za ', 'Order for ', 'Ordina per ') + (st.plan === 'vip' ? '7,50 €' : st.plan === 'pro' ? '12,50 €' : '25 €'),
      orderStand: () => { if (st.standOrdered) { this.toast(PL ? 'Stojak już zamówiony — wysyłka w 48 h.' : 'Already ordered — ships within 48 h.'); return; }
        this.setState({ standOrdered: true });
        this.toast(PL ? 'Zamówiliśmy stojak. Wysyłka w 48 h.' : 'Stand ordered. It ships within 48 h.'); },
      standFoot: PL ? 'Bez baterii, bez kabli, bez podłączania do kasy fiskalnej. Wystarczy postawić na ladzie.' : 'No batteries, no cables, no POS wiring. Just put it on the counter.',

      /* ══ PUNKTY I NAGRODY ══ */
      ptsKicker: PL ? 'TWOJE PUNKTY' : 'YOUR POINTS',
      ptsValue: String(pts),
      ptsUnit: PL ? 'pkt' : 'pts',
      ptsNext: PL
        ? 'Jeszcze ' + (lvlSize - lvlPts) + ' pkt do poziomu ' + (lvl + 1) + '.'
        : (lvlSize - lvlPts) + ' pts to level ' + (lvl + 1) + '.',
      ptsPct: Math.round((lvlPts / lvlSize) * 100) + '%',
      ringDash: ((lvlPts / lvlSize) * 238.8).toFixed(1) + ' 238.8',
      lvlKicker: PL ? 'poziom' : 'level',
      lvlLabel: String(lvl),
      ptsWays: [
        { v: '+20', kpl: 'za zapisane miejsce', ken: 'per saved place' },
        { v: '+60', kpl: 'za skan naklejki', ken: 'per sticker scan' },
        { v: '+40', kpl: 'za opinię', ken: 'per review' }
      ].map((w, i) => ({ v: w.v, k: PL ? w.kpl : w.ken, delay: (i * 70) + 'ms' })),
      rewardsHead: PL ? 'Nagrody do odebrania' : 'Rewards to claim',
      rewardsReadyLine: readyCount
        ? (PL ? readyCount + ' gotowe' : readyCount + ' ready')
        : (PL ? 'zbierasz' : 'collecting'),
      prizeList: rewardDefs.map((r, i) => {
        const ready = pts >= r.need;
        const pct = Math.min(1, pts / r.need);
        const fx = st.claimFx === r.id;
        return {
          title: PL ? r.pl : r.en, at: r.at, delay: (i * 70) + 'ms',
          val: r.val, fx: fx,
          valBg: ready ? (th.dark ? ac.softDark : ac.soft) : 'transparent',
          valFg: ready ? at : th.sub,
          valBorder: ready ? at : th.hair,
          rowAnim: fx ? 'claimFlash 0.9s cubic-bezier(0.16,1,0.3,1) both' : 'rise 0.5s cubic-bezier(0.16,1,0.3,1) both',
          ready: ready, pct: Math.round(pct * 100) + '%',
          state: ready ? (PL ? 'gotowe' : 'ready') : (PL ? 'brakuje ' + (r.need - pts) : (r.need - pts) + ' to go'),
          cta: ready ? (PL ? 'Odbierz' : 'Claim') : String(r.need),
          ctaBg: ready ? ac.hex : (th.dark ? 'rgba(255,255,255,0.06)' : 'rgba(22,24,28,0.04)'),
          ctaFg: ready ? '#FBFAF7' : th.sub,
          cursor: ready ? 'pointer' : 'default',
          border: ready ? at : th.hair,
          iconBg: ready ? (th.dark ? ac.softDark : ac.soft) : (th.dark ? 'rgba(255,255,255,0.05)' : 'rgba(22,24,28,0.04)'),
          iconFg: ready ? at : th.sub,
          barFg: ready ? ac.hex : th.sub,
          isCup: r.ic === 'cup', isGlass: r.ic === 'glass', isTicket: r.ic === 'ticket', isPlate: r.ic === 'plate',
          claim: () => { if (!ready) { this.toast(PL ? 'Jeszcze ' + (r.need - pts) + ' pkt do tej nagrody.' : (r.need - pts) + ' pts to go for this reward.'); return; }
            this.needAuth(() => {
              this.buzz(12);
              this.setState({ claimFx: r.id });
              clearTimeout(this.fxT);
              this.fxT = setTimeout(() => this.setState({ claimFx: null }), 1200);
              this.toast(PL ? 'Nagroda w kuponach: ' + r.pl : 'Reward added to coupons: ' + r.en);
            }); }
        };
      }),
      /* ══ NAGRODY: GOŚĆ vs FIRMA ══ */
      premiSwitchOn: !!st.bizAccount,
      premiTabs: [
        { id: 'biz', label: this.l3('Mój lokal', 'My venue', 'Il mio locale') },
        { id: 'me', label: this.l3('Moje punkty', 'My points', 'I miei punti') }
      ].map((p) => { const on = (st.premiView || (st.bizAccount ? 'biz' : 'me')) === p.id;
        return { label: p.label, bg: on ? th.ink : 'transparent', fg: on ? th.paper : th.sub,
          pick: () => this.setState({ premiView: p.id }) }; }),
      showMePremi: !st.bizAccount || (st.premiView || 'biz') === 'me',
      showBizPremi: !!st.bizAccount && (st.premiView || 'biz') === 'biz',
      bizRankKicker: this.l3('RANGA LOKALU', 'VENUE RANK', 'RANGO DEL LOCALE'),
      bizRankName: 'ORO',
      bizRankNext: this.l3('Jeszcze 260 skanów do rangi PLATINO.', '260 scans to reach PLATINO.', 'Ancora 260 scansioni per il rango PLATINO.'),
      bizRankPct: '74%',
      bizRankDash: (0.74 * 238.8).toFixed(1) + ' 238.8',
      bizStatsHead: this.l3('Ten miesiąc', 'This month', 'Questo mese'),
      bizPremiStats: [
        { v: '1 284', k: this.l3('zeskanowane kody', 'codes scanned', 'codici scansionati') },
        { v: '412', k: this.l3('goście odblokowali', 'guests unlocked', 'ospiti sbloccati') },
        { v: '356', k: this.l3('kupony spalone', 'coupons burned', 'coupon bruciati') },
        { v: '28%', k: this.l3('wraca drugi raz', 'come back twice', 'tornano due volte') },
        { v: '4,8', k: this.l3('średnia ocena', 'average rating', 'valutazione media') },
        { v: '+19%', k: this.l3('rachunek vs. bez kuponu', 'bill vs. no coupon', 'conto vs. senza coupon') }
      ].map((s, i) => ({ v: s.v, k: s.k, delay: (i * 60) + 'ms' })),
      bizRanksHead: this.l3('Rangi i co dają', 'Ranks and what they give', 'Ranghi e cosa danno'),
      bizRanksSub: this.l3('Ranga rośnie od skanów. Im wyżej, tym taniej i bardziej widocznie.',
        'Rank grows with scans. The higher you are, the cheaper and more visible you get.',
        'Il rango cresce con le scansioni. Più sali, più risparmi e più sei visibile.'),
      bizRanks: [
        { n: 'BRONZO', need: this.l3('od 0 skanów', 'from 0 scans', 'da 0 scansioni'),
          give: this.l3('Wizytówka, 1 oferta, naklejka QR', 'Listing, 1 offer, QR sticker', 'Scheda, 1 offerta, adesivo QR') },
        { n: 'ARGENTO', need: this.l3('od 300 skanów', 'from 300 scans', 'da 300 scansioni'),
          give: this.l3('3 oferty naraz, statystyki 30 dni, −20% na naklejki', '3 offers at once, 30-day analytics, −20% on stickers', '3 offerte insieme, statistiche 30 giorni, −20% sugli adesivi') },
        { n: 'ORO', need: this.l3('od 900 skanów', 'from 900 scans', 'da 900 scansioni'),
          give: this.l3('Wyższa pozycja na mapie, slot w „Dziś w mieście”, −50% na Smart Stand', 'Higher map position, a slot in Today, −50% on the Smart Stand', 'Posizione più alta sulla mappa, slot in Oggi, −50% sullo Smart Stand') },
        { n: 'PLATINO', need: this.l3('od 1 800 skanów', 'from 1,800 scans', 'da 1.800 scansioni'),
          give: this.l3('Wyróżniona pinezka, push do gości w 500 m, Smart Stand −70%', 'Featured pin, push to guests within 500 m, Smart Stand −70%', 'Pin in evidenza, push agli ospiti entro 500 m, Smart Stand −70%') }
      ].map((r, i) => { const on = r.n === 'ORO', done = i < 2;
        return { n: r.n, need: r.need, give: r.give, delay: (i * 70) + 'ms',
          bg: on ? (th.dark ? ac.softDark : ac.soft) : th.surf,
          border: on ? at : th.hair, fg: on ? at : th.ink,
          dotBg: (on || done) ? ac.hex : th.hair, isNow: on, isDone: done }; }),
      bizWorthHead: this.l3('Co to daje w pieniądzach', 'What it means in money', 'Cosa significa in denaro'),
      bizWorthLine: this.l3('356 spalonych kuponów to 412 wizyt, których inaczej by nie było. Przy średnim rachunku 18 € to 7 400 € obrotu z jednego krążka na ladzie.',
        '356 burned coupons means 412 visits you would not have had. At an 18 € average bill that is 7,400 € of revenue from one puck on the counter.',
        '356 coupon bruciati significano 412 visite che non avresti avuto. Con uno scontrino medio di 18 € sono 7.400 € di incasso da un solo disco sul bancone.'),
      earnHead: this.l3('Jak zdobywasz punkty', 'How you earn points', 'Come guadagni punti'),
      earnSub: this.l3('Cztery rzeczy, nic więcej. Punkty wpadają od razu po akcji.',
        'Four things, nothing else. Points land right after each action.',
        'Quattro cose, niente altro. I punti arrivano subito dopo ogni azione.'),
      earnRows: [
        { ic: 'scan', v: '+60', t: this.l3('Skan naklejki w witrynie', 'Scan a window sticker', 'Scansiona l’adesivo in vetrina'),
          b: this.l3('Raz dziennie na lokal. Od razu dostajesz kupon.', 'Once a day per venue. You get a coupon right away.', 'Una volta al giorno per locale. Ricevi subito un coupon.') },
        { ic: 'star', v: '+40', t: this.l3('Opinia po wizycie', 'A review after your visit', 'Una recensione dopo la visita'),
          b: this.l3('Minimum 40 znaków. Zdjęcie daje dodatkowe 15 pkt.', 'At least 40 characters. A photo adds 15 more.', 'Almeno 40 caratteri. Una foto vale 15 punti in più.') },
        { ic: 'flag', v: '+30', t: this.l3('Nowy kwartał na mapie', 'A new block on the map', 'Un nuovo quartiere sulla mappa'),
          b: this.l3('Za każdą dzielnicę, którą wyjdziesz z mgły.', 'For every district you clear out of the fog.', 'Per ogni quartiere che togli dalla nebbia.') },
        { ic: 'bookmark', v: '+20', t: this.l3('Zapisane miejsce', 'A saved place', 'Un locale salvato'),
          b: this.l3('Do pięciu miejsc dziennie.', 'Up to five places a day.', 'Fino a cinque locali al giorno.') }
      ].map((e, i) => ({ v: e.v, t: e.t, b: e.b, delay: (i * 80) + 'ms',
        isScan: e.ic === 'scan', isStar: e.ic === 'star', isFlag: e.ic === 'flag', isBookmark: e.ic === 'bookmark' })),
      valueHead: this.l3('Wartość nagród', 'Reward value', 'Valore dei premi'),
      valueLine: this.l3('Nagrody na twoim poziomie są warte 32 € — nic za nie nie płacisz.',
        'The rewards at your level are worth 32 € — you pay nothing for them.',
        'I premi al tuo livello valgono 32 € — non paghi nulla.'),
      freeNote: PL
        ? 'TAPI jest i zostanie bezpłatne dla gości — punkty i nagrody nic nie kosztują. Pakiety płatne mają tylko lokale.'
        : 'TAPI is free for guests and stays that way — points and rewards cost nothing. Only venues pay for plans.',
      quickPts: () => { this.setState({ quickOpen: false, profTab: 'plan' }); this.go('profile'); },

      /* ══ NAGŁÓWEK ODKRYWAJ ══ */
      discRef: this.discRef,
      onDiscScroll: (e) => this.onDiscScroll(e),
      profAvaSize: pSc ? '38px' : '52px',
      profAvaFont: pSc ? '15px' : '19px',
      profNameFont: pSc ? '21px' : '27px',
      profMailH: pSc ? '0px' : '18px',
      profMailOp: pSc ? '0' : '1',
      onProfScroll: (e) => { const y = (e.target && e.target.scrollTop) || 0; const c = y > 30;
        if (!!this.state.pScroll !== c) this.setState({ pScroll: c }); },
      searchH: dSc ? '42px' : '48px',
      backTopW: dSc ? '41px' : '0px',
      headBackOp: dSc ? '1' : '0',
      toTop: () => { const el = this.discRef.current; if (el) el.scrollTo({ top: 0, behavior: 'smooth' }); },
      headSearchOn: !!st.headSearch, headSearchOff: !st.headSearch, headRef: this.headRef,
      openHeadSearch: () => { this.buzz(7); this.setState({ headSearch: true });
        setTimeout(() => { const el = this.headRef.current; if (el) { el.value = this.state.query || ''; el.focus(); } }, 90); },
      closeHeadSearch: () => { if (this.searchRef.current) this.searchRef.current.value = '';
        this.setState({ headSearch: false, query: '' }); },
      headPadB: dSc ? '10px' : '12px',
      headIntH: dSc ? '0px' : '86px',
      headAreaH: dSc ? '0px' : '104px',
      headExtraOp: dSc ? '0' : '1',
      headExtraY: dSc ? '-10px' : '0px',
      headStick: '92px',
      headShade: dSc ? (th.dark ? 'rgba(0,0,0,0.6)' : 'rgba(22,24,28,0.2)') : (th.dark ? 'rgba(0,0,0,0.28)' : 'rgba(22,24,28,0.06)'),

      /* ══ AWATAR I SZYBKIE USTAWIENIA ══ */
      showAvatar: st.phase === 'app' && st.tab !== 'scan' && !anyOverlay,
      avaBg: ac.hex,
      avaInitial: quickWho.trim().charAt(0).toUpperCase(),
      avaT: st.quickOpen ? 'scale(1.08)' : 'none',
      quickOpen: !!st.quickOpen,
      toggleQuick: () => this.setState({ quickOpen: !st.quickOpen }),
      closeQuick: () => this.setState({ quickOpen: false, quickPage: null }),
      quickName: quickWho,
      quickSub: (st.user && st.user.mail) || st.me.mail || (PL ? 'Zaloguj się, aby zapisywać miejsca' : 'Sign in to save places'),
      quickItems: [
        { id: 'saved', pl: 'Zapisane', en: 'Saved', spl: 'Miejsca i kupony', sen: 'Places and coupons', ic: 'saved' },
        { id: 'notif', pl: 'Powiadomienia', en: 'Notifications', spl: 'Włącz lub wyłącz jednym dotknięciem', sen: 'Turn each one on or off', ic: 'bell' },
        { id: 'konto', pl: 'Konto', en: 'Account', spl: 'Dane i logowanie', sen: 'Details and login', ic: 'konto' },
        { id: 'plan', pl: 'Nagrody', en: 'Rewards', spl: 'Punkty i poziom', sen: 'Points and level', ic: 'plan' },
        { id: 'set', pl: 'Ustawienia', en: 'Settings', spl: 'Język, motyw, alerty', sen: 'Language, theme, alerts', ic: 'set' }
      ].map((q) => ({ label: PL ? q.pl : q.en, sub: PL ? q.spl : q.sen,
        isSaved: q.ic === 'saved', isKonto: q.ic === 'konto', isPlan: q.ic === 'plan',
        isSet: q.ic === 'set', isBell: q.ic === 'bell', dot: q.id === 'notif' && !st.notifRead,
        expanded: false, caret: 'none', wrapBg: 'transparent',
        rows: [],
        tap: () => { this.buzz(7); this.setState({ quickPage: q.id }); } })),

      quickRoot: !st.quickPage,
      quickPageOn: !!st.quickPage,
      quickHasRows: st.quickPage === 'notif',
      quickHasLines: !!st.quickPage && st.quickPage !== 'notif',
      quickRows: st.quickPage === 'notif' ? notifRows : [],
      quickBack: () => this.setState({ quickPage: null }),
      quickPageTitle: this.l3(
        { saved: 'Zapisane', notif: 'Powiadomienia', konto: 'Konto', plan: 'Nagrody', set: 'Ustawienia' }[st.quickPage] || '',
        { saved: 'Saved', notif: 'Notifications', konto: 'Account', plan: 'Rewards', set: 'Settings' }[st.quickPage] || '',
        { saved: 'Salvati', notif: 'Notifiche', konto: 'Account', plan: 'Premi', set: 'Impostazioni' }[st.quickPage] || ''),
      quickPageSub: this.l3(
        { saved: 'Miejsca, kolekcje i kupony', notif: 'Włącz lub wyłącz jednym dotknięciem', konto: 'Dane i logowanie', plan: 'Punkty i poziom', set: 'Język, motyw, alerty' }[st.quickPage] || '',
        { saved: 'Places, collections and coupons', notif: 'Turn each one on or off', konto: 'Details and login', plan: 'Points and level', set: 'Language, theme, alerts' }[st.quickPage] || '',
        { saved: 'Locali, raccolte e coupon', notif: 'Attiva o disattiva con un tocco', konto: 'Dati e accesso', plan: 'Punti e livello', set: 'Lingua, tema, avvisi' }[st.quickPage] || ''),
      quickLines: this.quickLines(),
      quickGoLabel: this.l3('Przejdź do sekcji', 'Open the section', 'Apri la sezione'),
      quickGo: () => { const p = st.quickPage; this.buzz(10);
        this.setState({ quickOpen: false, quickPage: null, profTab: p === 'notif' ? 'set' : p }); this.go('profile'); },
      quickThemeLabel: th.dark ? (PL ? 'Jasny' : 'Light') : (PL ? 'Ciemny' : 'Dark'),
      quickTheme: () => this.setState({ theme: th.dark ? 'papier' : 'noc' }),
      quickLangLabel: (this.langDefs.filter((l) => l.id === st.lang)[0] || { code: 'EN' }).code,
      quickLang: () => this.setState({ quickOpen: false, langOpen: true, langQuery: '' }),

      /* ══ PODGLĄD SĄSIEDNIEJ ZAKŁADKI ══ */
      peekOn: !!peekDef,
      peekPanelL: dragPx < 0 ? '100%' : '-100%',
      peekShadow: dragPx < 0 ? '-26px 0 60px -30px rgba(22,24,28,0.8)' : '26px 0 60px -30px rgba(22,24,28,0.8)',
      peekOrigin: dragPx < 0 ? 'left center' : 'right center',
      peekScale: (0.94 + 0.06 * peekProg).toFixed(3),
      peekRows: [
        { thumb: '58px', w: '68%', w2: '44%', op: '1' },
        { thumb: '58px', w: '52%', w2: '38%', op: '0.82' },
        { thumb: '58px', w: '61%', w2: '46%', op: '0.62' },
        { thumb: '58px', w: '47%', w2: '33%', op: '0.42' },
        { thumb: '58px', w: '56%', w2: '40%', op: '0.24' }
      ],
      peekOp: String(Math.min(1, peekProg * 1.2).toFixed(2)),
      peekX: Math.round(dragPx) + 'px',
      peekLabel: peekDef ? peekDef.label : '',
      peekIsDiscover: peekTarget === 'discover', peekIsMap: peekTarget === 'map',
      peekIsScan: peekTarget === 'scan', peekIsTrip: peekTarget === 'trip',
      peekIsProfile: peekTarget === 'profile',

      isDiscover: st.phase === 'app' && st.tab === 'discover', isMap: st.phase === 'app' && st.tab === 'map',
      isScan: st.phase === 'app' && st.tab === 'scan', isVenue: st.phase === 'app' && st.tab === 'venue',
      isSaved: st.phase === 'app' && st.tab === 'saved',
      isTrip: st.phase === 'app' && st.tab === 'trip',
      isFriendsTab: st.phase === 'app' && st.tab === 'friends', isProfile: st.phase === 'app' && st.tab === 'profile',
      loading: st.loading, ready: !st.loading,
      searchRef: this.searchRef, mapRef: this.mapRef, bizRef: this.bizRef,
      onQuery: (e) => this.setState({ query: e.target.value }),
      hasQuery: st.query.length > 0,
      sugOn: this.sugFor(st, PL).length > 0,
      sugHead: PL ? 'Podpowiedzi' : 'Suggestions',
      sugOnHead: !!st.headSearch && this.sugFor(st, PL).length > 0,
      sugList: this.sugFor(st, PL).map((s, i) => Object.assign({}, s, { delay: (i * 45) + 'ms' })),
      clearQuery: () => this.setQuery(''),
      greeting: st.user ? (st.lang === 'pl' ? 'Cześć, ' + st.user.name.split(' ')[0] : 'Hi ' + st.user.name.split(' ')[0]) : (st.lang === 'pl' ? 'Dobry wieczór' : 'Good evening'),
      subGreeting: st.lang === 'pl' ? 'Czwartek, 18:24 · Kazimierz' : 'Thursday, 6:24 pm · Kazimierz',

      cats: [
        { id: 'all', label: t.all },
        { id: 'followed', label: this.l3('Obserwowane', 'Followed', 'Seguiti') }, { id: 'gastro', label: st.lang === 'pl' ? 'Jedzenie' : 'Food' },
        { id: 'kawa', label: st.lang === 'pl' ? 'Kawa' : 'Coffee' }, { id: 'noc', label: st.lang === 'pl' ? 'Wieczorem' : 'Nightlife' },
        { id: 'event', label: st.lang === 'pl' ? 'Wydarzenia' : 'Events' }
      ].map((c) => ({ label: c.label, bg: st.cat === c.id ? th.ink : th.surf, fg: st.cat === c.id ? th.paper : th.sub,
        border: st.cat === c.id ? th.ink : th.hair, pick: () => { this.buzz(7); this.setState({ cat: c.id }); } })),

      todayCards: [
        { venue: 'forum', title: st.lang === 'pl' ? 'Silent disco, 3 kanały' : 'Silent disco, 3 channels', when: '23:00', place: 'Hala Forum', tag: 'LIVE', grad: 'linear-gradient(150deg, #EFDDC4, #D2A177 60%, #7A5535)', delay: '0ms' },
        { venue: 'ostra', title: st.lang === 'pl' ? 'Nowa karta jesienna' : 'New autumn menu', when: '17:00', place: 'Ostra Kuchnia', tag: st.lang === 'pl' ? 'DZIŚ' : 'TODAY', grad: 'linear-gradient(150deg, #DDE7D6, #7EA083 60%, #33503C)', delay: '70ms' },
        { venue: 'nokturn', title: st.lang === 'pl' ? 'Dostawa z Friuli' : 'Delivery from Friuli', when: '19:00', place: 'Nokturn', tag: st.lang === 'pl' ? 'NOWE' : 'NEW', grad: 'linear-gradient(150deg, #EAD6DE, #A8788C 60%, #4E3040)', delay: '140ms' }
      ].map((c) => ({ title: c.title, when: c.when, place: c.place, tag: c.tag, grad: c.grad, delay: c.delay, open: () => this.openVenue(c.venue) })),

      filterCats: [
        { id: 'all', label: PL ? 'Wszystko' : 'All' }, { id: 'rest', label: PL ? 'Restauracje' : 'Restaurants' },
        { id: 'apt', label: PL ? 'Apartamenty' : 'Apartments' }, { id: 'beauty', label: 'Beauty & Spa' }
      ].map((c) => {
        const on = (st.discoverCat || 'all') === c.id;
        return { label: c.label, bg: on ? th.ink : th.surf, fg: on ? th.paper : th.sub, border: on ? th.ink : th.hair, toggle: () => this.setState({ discoverCat: c.id }) };
      }),
      bookOnlineBg: st.discoverBookOnline ? ac.hex : th.hair,
      bookOnlineKnob: st.discoverBookOnline ? 'translateX(20px)' : 'translateX(0px)',
      toggleBookOnline: () => this.setState({ discoverBookOnline: !st.discoverBookOnline }),

      evHead: PL ? 'Nadchodzące wydarzenia' : 'Upcoming events',
      evCount: evScope.length + (PL ? ' w kalendarzu' : ' scheduled'),
      evWhen: [
        { id: 'all', pl: 'Wszystkie', en: 'All' }, { id: 'tom', pl: 'Jutro', en: 'Tomorrow' },
        { id: 'week', pl: 'Weekend', en: 'This weekend' }, { id: 'next', pl: 'Za tydzień', en: 'Next week' },
        { id: 'free', pl: 'Bezpłatne', en: 'Free entry' }
      ].map((w) => { const on = (st.evWhen || 'all') === w.id; return { label: PL ? w.pl : w.en,
        bg: on ? th.ink : th.surf, fg: on ? th.paper : th.sub, border: on ? th.ink : th.hair,
        pick: () => this.setState({ evWhen: w.id }) }; }),
      evList: evHits.map((e, i) => ({
        // Miesiąc z daty wydarzenia. Wcześniej był tu wpisany sierpień — na
        // danych z pliku nikt tego nie widział, bo wszystkie były sierpniowe.
        mon: (e.mon || ['SIE', 'AUG', 'AGO'])[LI ? 2 : (PL ? 0 : 1)],
        day: String(e.day), dow: e.dow[LI ? 2 : (PL ? 0 : 1)],
        time: e.time, title: LI ? e.it : (PL ? e.pl : e.en), place: e.place, dist: e.dist,
        price: e.price === 0 ? (LI ? 'ingresso libero' : (PL ? 'wejście wolne' : 'free entry')) : e.price + ' zł',
        tag: e.d <= 1 ? (LI ? 'DOMANI' : (PL ? 'JUTRO' : 'TOMORROW'))
          : e.d <= 5 ? (LI ? 'WEEKEND' : 'WEEKEND')
          : e.d <= 9 ? (LI ? 'PROSSIMA SETT.' : (PL ? 'ZA TYDZIEŃ' : 'NEXT WEEK'))
          : (LI ? 'PIÙ AVANTI' : (PL ? 'PÓŹNIEJ' : 'LATER')),
        delay: (i * 60) + 'ms',
        dateBg: e.d <= 1 ? ac.hex : (th.dark ? ac.softDark : ac.soft),
        dateFg: e.d <= 1 ? '#FBFAF7' : at,
        tagBg: e.price === 0 ? (th.dark ? ac.softDark : ac.soft) : (th.dark ? 'rgba(255,255,255,0.07)' : 'rgba(22,24,28,0.06)'),
        tagFg: e.price === 0 ? at : th.sub,
        saveBg: (st.savedEvents || []).indexOf(e.id) > -1 ? (th.dark ? ac.softDark : ac.soft) : 'transparent',
        saveFill: (st.savedEvents || []).indexOf(e.id) > -1 ? ac.hex : 'none',
        saveStroke: (st.savedEvents || []).indexOf(e.id) > -1 ? ac.hex : th.sub,
        open: () => this.openVenue(e.venue),
        save: (ev) => { if (ev && ev.stopPropagation) ev.stopPropagation();
          this.needAuth(() => { const cur = (this.state.savedEvents || []).slice();
            const k = cur.indexOf(e.id);
            if (k > -1) { cur.splice(k, 1); this.toast(PL ? 'Usunięte z zapisanych.' : 'Removed from saved.'); }
            else { cur.push(e.id); this.toast(PL ? 'Zapisane. Przypomnimy dzień wcześniej.' : 'Saved. We will remind you a day before.'); }
            this.setState({ savedEvents: cur }); }); } })),
      evEmpty: evHits.length === 0,
      evEmptyText: (st.area && st.area !== 'all')
        ? (PL ? 'W ' + st.area + ' nic w tym terminie. Wybierz „Cały Kraków" albo inny dzień.' : 'Nothing in ' + st.area + ' then. Try “All Kraków” or another day.')
        : (PL ? 'W tym terminie nic nie zaplanowano. Zobacz „Wszystkie" — w tym tygodniu dzieje się więcej.' : 'Nothing scheduled then. Try “All” — there is more this week.'),

      list: list.map((x, i) => {
        const isMine = st.myVenueId === x.id || (st.user && st.myVenueId == null && x.id === 'ostra');
        return {
        name: x.name, catLabel: this.dt(x.catLabel), district: x.district, dist: x.dist, grad: x.grad,
        rating: x.rating.toFixed(1), votes: '(' + x.votes + ')', price: x.price,
        statusLabel: x.isOpen ? t.open + ' · ' + t.until + ' ' + x.closes : t.closed,
        statusFg: x.isOpen ? at : th.sub, delay: (i * 70) + 'ms', isMine: isMine,
        savedFill: st.savedIds.indexOf(x.id) > -1 ? ac.hex : 'none',
        hasBooking: x.cat === 'rest' || x.cat === 'apt', bookLabel: PL ? 'Zarezerwuj online' : 'Book online',
        open: () => this.openVenue(x.id), save: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.needAuth(() => this.toggleSaved(x.id)); } };
      }),
      empty: list.length === 0,
      emptyText: st.lang === 'pl' ? 'Brak wyników. Zdejmij filtr albo napisz inaczej.' : 'No results. Clear the filter or try another word.',

      notifOpen: st.notifOpen, notifDot: !st.notifRead,
      openNotif: () => this.setState({ notifOpen: true }),
      closeNotif: () => this.setState({ notifOpen: false }),
      markRead: () => { this.setState({ notifRead: true, notifOpen: false }); this.toast(st.lang === 'pl' ? 'Powiadomienia oznaczone jako przeczytane.' : 'Notifications marked as read.'); },
      notifs: [
        { title: st.lang === 'pl' ? 'Jesteś 120 m od Brama 7' : 'You are 120 m from Brama 7', body: st.lang === 'pl' ? 'Druga filtrówka za 1 zł do 19:00.' : 'Second filter coffee for 1 zł until 7 pm.', time: st.lang === 'pl' ? 'teraz' : 'now', fresh: !st.notifRead, delay: '0ms', open: () => { this.setState({ notifOpen: false }); this.openVenue('brama'); } },
        { title: st.lang === 'pl' ? 'Silent disco startuje o 23:00' : 'Silent disco starts at 11 pm', body: st.lang === 'pl' ? 'Hala Forum, zostało 12 wejściówek −40%.' : 'Hala Forum, 12 tickets left at −40%.', time: '17:40', fresh: !st.notifRead, delay: '60ms', open: () => { this.setState({ notifOpen: false }); this.openVenue('forum'); } },
        { title: st.lang === 'pl' ? 'Twój kupon wygasa za 5 minut' : 'Your coupon expires in 5 minutes', body: st.lang === 'pl' ? 'Nokturn · NKT·4192' : 'Nokturn · NKT·4192', time: '16:02', fresh: false, delay: '120ms', open: () => { this.setState({ notifOpen: false }); this.go('saved'); } }
      ],

      vName: v.name, vCat: this.dt(v.catLabel), vGrad: v.grad, vRating: v.rating.toFixed(1), vVotes: v.votes + ' ' + (st.lang === 'pl' ? 'opinii' : 'reviews'),
      vPrice: v.price, vDistrict: v.district, vDist: v.dist, vAddress: v.address, vPhone: v.phone, vSite: v.site,
      vStatus: v.isOpen ? t.open : t.closed, vStatusFg: v.isOpen ? at : th.sub, vCloses: t.until + ' ' + v.closes,
      vHours: v.hours.map((h) => ({ day: this.dt(h[0]), val: this.dt(h[1]) })),
      vMenu: v.menu.map((m, i) => ({ name: this.dt(m[0]), desc: this.dt(m[1]), price: this.dt(m[2]), delay: (i * 60) + 'ms' })),
      vOpinions: revAll.map((o, i) => ({ who: o.who, initial: (o.who || '?').charAt(0).toUpperCase(),
        stars: '★★★★★'.slice(0, o.rate), text: o.text, delay: (i * 60) + 'ms',
        mine: o.mine && !!avaName, mineLabel: PL ? 'Ty' : 'You',
        ago: o.mine ? (PL ? 'teraz' : 'just now') : (PL ? o.age + ' dni temu' : o.age + ' days ago'),
        border: o.mine ? at : th.hair,
        avaBg: o.mine ? ac.hex : (th.dark ? ac.softDark : ac.soft), avaFg: o.mine ? '#FBFAF7' : at })),
      revSortOpen: !!st.revSortOpen,
      toggleRevSort: () => this.setState({ revSortOpen: !st.revSortOpen }),
      revCaret: st.revSortOpen ? 'rotate(180deg)' : 'none',
      revSortBg: (st.revSortOpen || st.revFilter || st.revSort !== 'new') ? (th.dark ? ac.softDark : ac.soft) : th.surf,
      revSortBorder: (st.revSortOpen || st.revFilter || st.revSort !== 'new') ? at : th.hair,
      revSortFg: (st.revSortOpen || st.revFilter || st.revSort !== 'new') ? at : th.sub,
      revSortLabel: PL ? 'Filtruj' : 'Filter',
      revSortHead: PL ? 'Sortuj' : 'Sort by',
      revFiltHead: PL ? 'Pokaż oceny' : 'Show ratings',
      revMeta: PL
        ? (revTotal + ' opinii · średnia ' + revAvg.toFixed(1).replace('.', ','))
        : (revTotal + ' reviews · ' + revAvg.toFixed(1) + ' average'),
      revSortOpts: [
        { id: 'new', pl: 'Najnowsze', en: 'Newest' },
        { id: 'high', pl: 'Najwyższe oceny', en: 'Highest rated' },
        { id: 'low', pl: 'Najniższe oceny', en: 'Lowest rated' }
      ].map((s) => { const on = (st.revSort || 'new') === s.id;
        return { label: PL ? s.pl : s.en, bg: on ? th.ink : th.paper, fg: on ? th.paper : th.sub,
          border: on ? th.ink : th.hair, pick: () => this.setState({ revSort: s.id }) }; }),
      revFiltOpts: [
        { v: 0, pl: 'Wszystkie', en: 'All ratings' }, { v: 5, pl: 'Tylko 5★', en: '5★ only' },
        { v: 4, pl: '4★ i wyżej', en: '4★ and up' }, { v: 3, pl: '3★ i wyżej', en: '3★ and up' }
      ].map((f) => { const on = (st.revFilter || 0) === f.v;
        return { label: PL ? f.pl : f.en, bg: on ? th.ink : th.paper, fg: on ? th.paper : th.sub,
          border: on ? th.ink : th.hair, pick: () => this.setState({ revFilter: f.v }) }; }),
      revEmpty: revAll.length === 0,
      revEmptyText: PL ? 'Brak opinii z tym filtrem.' : 'No reviews match this filter.',
      revWriteTitle: PL ? 'Dodaj swoją opinię' : 'Add your review',
      revStarPick: [1, 2, 3, 4, 5].map((n) => { const on = n <= (st.revStars || 5);
        return { bg: on ? (th.dark ? ac.softDark : ac.soft) : th.paper, fg: on ? at : th.sub,
          sc: on ? '1' : '0.9', pick: () => this.setState({ revStars: n }) }; }),
      revStarsLabel: (st.revStars || 5) + '/5',
      revDraft: st.revDraft || '',
      setRevDraft: (e) => this.setState({ revDraft: e.target.value }),
      revPh: PL ? 'Napisz, jak było — co zamówić, jaki klimat, czy wrócisz.' : 'Tell others how it was — what to order, the vibe, would you return.',
      revCta: revDraftOk ? (PL ? 'Opublikuj opinię' : 'Publish review') : (PL ? 'Napisz kilka słów' : 'Write a few words'),
      revCtaBg: revDraftOk ? ac.hex : (th.dark ? 'rgba(237,236,232,0.08)' : 'rgba(22,24,28,0.05)'),
      revCtaFg: revDraftOk ? '#FBFAF7' : th.sub,
      revBoxBorder: revDraftOk ? at : th.hair,
      submitRev: () => {
        if (!revDraftOk) return;
        const next = {};
        for (const k in (st.myRevs || {})) next[k] = st.myRevs[k];
        next[v.id] = [{ who: avaName || (PL ? 'Ty' : (st.lang === 'it' ? 'Tu' : 'You')), rate: st.revStars || 5, text: st.revDraft.trim() }]
          .concat((st.myRevs || {})[v.id] || []);
        this.setState({ myRevs: next, revDraft: '', revSort: 'new', revFilter: 0, revSortOpen: false });
        this.toast(PL ? 'Opinia dodana — dzięki!' : 'Review added — thank you!');
      },
      vStories: v.stories.map((s, i) => ({ title: this.dt(s[0]), when: this.dt(s[1]), delay: (i * 60) + 'ms', grad: v.grad })),
      partnersTitle: PL ? 'Polecane obok' : 'Recommended nearby',
      partnersKicker: PL ? 'OD ' + v.name.toUpperCase() : 'FROM ' + v.name.toUpperCase(),
      partnersNote: PL ? 'Lokale, które ' + v.name + ' poleca gościom. Wszystkie mają konto w TAPI, więc kupon odbierzesz tak samo.' : v.name + ' recommends these to its guests. All are on TAPI, so coupons work the same.',
      hasPartners: vPart.length > 0,
      vPartners: vPart.map((p, i) => ({
        name: p.name, grad: p.grad, delay: (i * 70) + 'ms',
        meta: this.dt(p.catLabel) + ' · ' + p.dist,
        mutual: ((st.partners || {})[p.id] || []).indexOf(v.id) > -1,
        mutualLabel: PL ? 'POLECACIE SIĘ' : 'MUTUAL',
        why: PL ? 'Poleca ' + v.name : 'Via ' + v.name,
        open: () => this.openVenue(p.id) })),
      vReward: this.dt(v.reward), vCode: v.code,
      scanned: st.scanned, notScanned: !st.scanned,
      hoursOpen: st.hoursOpen, toggleHours: () => this.setState({ hoursOpen: !st.hoursOpen }),
      vSavedFill: st.savedIds.indexOf(v.id) > -1 ? ac.hex : 'none',
      saveVenue: () => this.needAuth(() => this.toggleSaved(v.id)),
      callVenue: () => this.toast(st.lang === 'pl' ? 'Dzwonię: ' + v.phone : 'Calling ' + v.phone),
      routeVenue: () => { this.go('map'); this.toast(st.lang === 'pl' ? 'Trasa do ' + v.name + ' · 4 min pieszo' : 'Route to ' + v.name + ' · 4 min walk'); },
      siteVenue: () => this.toast(v.site),
      bizLivePreview: st.bizLivePreview,
      back: () => { if (st.bizLivePreview) { this.setState({ bizLivePreview: false, isVenue: false }); } else { this.go('discover'); } },

      couponActive: !!cv, noCoupon: !cv,
      couponName: cv ? cv.name : '', couponReward: cv ? this.dt(cv.reward) : '', couponCode: cv ? cv.code : '',
      clock: (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss,
      couponPct: Math.round((st.secs / (mins * 60)) * 100) + '%',
      redeemPct: Math.round(st.redeem * 100) + '%',
      knobX: Math.round(st.redeem * ((this.rect ? this.rect.width : 338) - 54)) + 'px',
      redeemLabel: st.user ? t.slide : (st.lang === 'pl' ? 'Przesuń — poprosimy o logowanie' : 'Slide — we will ask you to sign in'),
      dragStart: (e) => this.dragStart(e), dragMove: (e) => this.dragMove(e), dragEnd: () => this.dragEnd(),
      geo: st.geo, geoX: st.geo ? '18px' : '0px', geoTrack: st.geo ? at : th.hair,
      geoHint: st.geo ? (st.lang === 'pl' ? 'Włączone · promień 200 m' : 'On · 200 m radius') : (st.lang === 'pl' ? 'Wyłączone' : 'Off'),
      toggleGeo: () => this.needAuth(() => { this.setState({ geo: !st.geo }); this.toast(st.geo ? (st.lang === 'pl' ? 'Wyłączone.' : 'Turned off.') : (st.lang === 'pl' ? 'Damy znać, gdy będziesz obok.' : 'We will ping you nearby.')); }),

      scanBusy: st.scan === 'busy', scanIdle: st.scan === 'idle',
      scanLabel: [st.lang === 'pl' ? 'CZYTAM KOD' : 'READING CODE', st.lang === 'pl' ? 'ŁĄCZĘ Z LOKALEM' : 'CONNECTING', st.lang === 'pl' ? 'PRZYPISUJĘ KUPON' : 'ASSIGNING COUPON'][st.scanStep || 0],
      doScan: () => this.runScan(),
      manualQR: !!st.manualQR,
      openManualQR: () => this.setState({ manualQR: true }),
      closeManualQR: () => this.setState({ manualQR: false }),
      handleManualQR: (e) => {
        if (e.target.value.length >= 4) {
          this.setState({ manualQR: false });
          this.runScan();
        }
      },

      /* ══ JĘZYK ══ */
      langOpen: !!st.langOpen,
      openLang: () => this.setState({ langOpen: true, langQuery: '' }),
      closeLang: () => this.setState({ langOpen: false }),
      langNowName: (this.langDefs.filter((l) => l.id === st.lang)[0] || this.langDefs[1]).native,
      langSubLine: st.langAuto === st.lang
        ? (PL ? 'Wybrany z ustawień telefonu' : 'Picked from your phone settings')
        : (PL ? 'Ustawiony ręcznie' : 'Set manually'),
      langTitle: PL ? 'Język aplikacji' : 'App language',
      langNote: PL ? 'Przy pierwszym uruchomieniu bierzemy język z telefonu. Polski, angielski i włoski są przetłumaczone w całości — pozostałe języki działają na angielskiej bazie, tłumaczenia dochodzą partiami.' : 'On first launch we take the language from your phone. Polish, English and Italian are fully translated — the rest run on the English base while translations land in batches.',
      langSearchPh: PL ? 'Szukaj języka' : 'Search a language',
      langQuery: st.langQuery || '',
      setLangQuery: (e) => this.setState({ langQuery: e.target.value }),
      langRows: langHits.map((l) => { const on = st.lang === l.id; return {
        code: l.code, native: l.native, on: on,
        meta: (PL ? l.en : l.en) + (l.full ? (PL ? ' · pełne tłumaczenie' : ' · fully translated') : (PL ? ' · baza angielska' : ' · English base')),
        bg: on ? (th.dark ? ac.softDark : ac.soft) : th.surf, border: on ? at : th.hair,
        fg: on ? at : th.ink,
        codeBg: on ? ac.hex : (th.dark ? 'rgba(255,255,255,0.06)' : 'rgba(22,24,28,0.05)'),
        codeFg: on ? '#FBFAF7' : th.sub,
        pick: () => { const target = l.full ? l.id : 'en';
          this.setState({ lang: target, langOpen: false, langAuto: null });
          this.toast(l.full ? (PL ? 'Język: ' + l.native : 'Language: ' + l.native)
            : (PL ? l.native + ' jeszcze w tłumaczeniu — na razie angielski.' : l.native + ' is still in translation — English for now.')); } }; }),
      langNone: langHits.length === 0,
      langNoneText: PL ? 'Nie mamy jeszcze tego języka. Napisz do nas — dodajemy te, o które pytacie najczęściej.' : 'We do not have that language yet. Write to us — we add the most requested ones.',

      /* ══ ZAKŁADKI PROFILU ══ */
      pKonto: !!st.user && st.profTab === 'konto', pSaved: !!st.user && (st.profTab || 'saved') === 'saved',
      pPlan: !!st.user && (st.profTab === 'premi' || st.profTab === 'plan'), pSet: !!st.user && st.profTab === 'set',
      notAnon: !!st.user,
      profTabs: profTabDefs.map((p) => ({ label: this.l3(p.pl, p.en, p.it),
        fg: (st.profTab || 'saved') === p.id ? th.paper : th.sub,
        pick: () => this.setState({ profTab: p.id }) })),
      pPillL: 'calc(4px + (100% - 8px) * ' + (pIdx / 4) + ')',
      pPillW: 'calc((100% - 8px) / 4)',

      /* ══ PLAN I PŁATNOŚCI ══ */
      myPlanKicker: PL ? 'Twój pakiet' : 'Your plan',
      myPlanName: st.bizAccount ? st.plan.toUpperCase() : (PL ? 'TAPI' : 'EXPLORER'),
      myPlanPrice: st.bizAccount ? (st.plan === 'base' ? '0 zł' : st.plan === 'pro' ? '99 zł' : '249 zł') : '0 zł',
      myPlanPer: st.bizAccount && st.plan !== 'base' ? (PL ? 'miesięcznie' : 'per month') : (PL ? 'na zawsze' : 'forever'),
      myPlanNote: st.bizAccount
        ? (st.trial ? (PL ? 'Okres próbny do 18 sierpnia. Potem ' + (st.plan === 'pro' ? '99' : '249') + ' zł miesięcznie — zapytamy, zanim pobierzemy.' : 'Trial until 18 August. Then billed monthly — we ask first.')
          : (PL ? 'Pakiet BASE: wizytówka, naklejka QR i podstawowe statystyki bez opłat.' : 'BASE plan: your card, the QR sticker and basic stats, free.'))
        : (PL ? 'Odkrywanie, kupony i plan wyjazdu są bezpłatne. Płacą tylko lokale.' : 'Discovering, coupons and trip plans are free. Only venues pay.'),
      myPlanBg: planHot ? ac.hex : th.surf,
      myPlanFg: planHot ? '#FBFAF7' : th.ink,
      myPlanBorder: planHot ? ac.hex : th.hair,
      myPlanHair: planHot ? 'rgba(255,255,255,0.28)' : th.hair,
      myPlanBtnBg: planHot ? 'rgba(255,255,255,0.18)' : th.ink,
      myPlanBtnFg: planHot ? '#FBFAF7' : th.paper,
      myPlanCta: st.bizAccount ? (PL ? 'Zmień pakiet' : 'Change plan') : (PL ? 'Zobacz pakiety dla lokali' : 'See venue plans'),
      canCancel: st.bizAccount && st.plan !== 'base',
      cancelLabel: PL ? 'Rezygnuję' : 'Cancel',
      cancelPlan: () => { this.setState({ plan: 'base', trial: false });
        this.toast(PL ? 'Wróciłeś na BASE. Dane i naklejka zostają.' : 'Back on BASE. Your data and sticker stay.'); },
      noPayTitle: PL ? 'Nie masz żadnych płatności' : 'You have no payments',
      noPaySub: PL ? 'Konto gościa jest bezpłatne — nie prosimy o kartę. Płacą tylko lokale za swoje pakiety.' : 'A guest account is free — we never ask for a card. Only venues pay for their plans.',
      payLabel: PL ? 'Metody płatności' : 'Payment methods',
      payMethods: [
        { id: 'card', logo: 'VISA', logoBg: '#1A1F71', logoFg: '#FFF', title: '•••• 4471', spl: 'Wygasa 08/28 · domyślna', sen: 'Expires 08/28 · default' },
        { id: 'blik', logo: 'BLIK', logoBg: '#000', logoFg: '#FFF', title: 'BLIK', spl: 'Kod z aplikacji banku', sen: 'Code from your bank app' }
      ].map((p) => { const on = (st.payMethod || 'card') === p.id; return { logo: p.logo, logoBg: p.logoBg, logoFg: p.logoFg,
        title: p.title, sub: PL ? p.spl : p.sen, on: on,
        bg: on ? (th.dark ? ac.softDark : ac.soft) : 'transparent',
        pick: () => this.setState({ payMethod: p.id }) }; }),
      addCardLabel: PL ? 'Dodaj kartę albo Apple Pay' : 'Add a card or Apple Pay',
      addCard: () => this.toast(PL ? 'Dodawanie karty otworzy się w bezpiecznym oknie banku.' : 'Adding a card opens in your bank window.'),
      invLabel: PL ? 'Faktury' : 'Invoices',
      invoices: [
        { spl: 'PRO · lipiec 2026', sen: 'PRO · July 2026', d: '01.07.2026', s: '99 zł' },
        { spl: 'Naklejki 20 szt.', sen: 'Stickers, 20 pcs', d: '18.06.2026', s: '30 zł' },
        { spl: 'PRO · czerwiec 2026', sen: 'PRO · June 2026', d: '01.06.2026', s: '49,50 zł' }
      ].map((i) => ({ title: PL ? i.spl : i.sen, date: i.d, sum: i.s,
        get: () => this.toast(PL ? 'Faktura PDF pobrana.' : 'Invoice PDF downloaded.') })),
      invFoot: PL ? 'Faktury wystawiamy na dane firmy z zakładki Konto. Zmiana danych działa od kolejnego okresu.' : 'Invoices use the details from the Account tab. Changes apply from the next period.',

      notifLabel: PL ? 'Powiadomienia i wiadomości' : 'Notifications and messages',
      notifRows: [
        { id: 'msg', pl: 'Wiadomości od lokali', en: 'Messages from venues', spl: 'Odpowiedzi na opinie i zaproszenia', sen: 'Replies to reviews and invites' },
        { id: 'prox', pl: 'Gdy jestem blisko', en: 'When I am nearby', spl: 'Nieodkryte miejsca w promieniu 200 m', sen: 'Undiscovered spots within 200 m' },
        { id: 'offers', pl: 'Okazje i happy hours', en: 'Deals and happy hours', spl: 'Tylko z kategorii, które lubisz', sen: 'Only from categories you like' },
        { id: 'news', pl: 'Nowości w TAPI', en: 'What is new in TAPI', spl: 'Raz w miesiącu, nic więcej', sen: 'Once a month, nothing more' }
      ].map((n) => { const on = !!(st.notif || {})[n.id]; return { label: PL ? n.pl : n.en, sub: PL ? n.spl : n.sen,
        track: on ? at : th.hair, knob: on ? '18px' : '0px',
        toggle: () => { const nx = Object.assign({}, this.state.notif); nx[n.id] = !nx[n.id];
          this.setState({ notif: nx }); if (n.id === 'prox') this.setState({ push: nx.prox }); } }; }),

      savedTab: st.savedTab, savedIsList: st.savedTab === 'saved', savedIsCoupons: st.savedTab === 'coupons',

      savedIsCols: st.savedTab === 'cols',
      colGrid: st.savedTab === 'cols' && !st.colOpen,
      colDetail: st.savedTab === 'cols' && !!st.colOpen,
      colNew: st.colNew,
      colNewLabel: this.l3('Nowa kolekcja', 'New collection', 'Nuova raccolta'),
      colPh: this.l3('np. Śniadania w weekend', 'e.g. Weekend breakfasts', 'es. Colazioni nel weekend'),
      colCancelLabel: this.l3('Anuluj', 'Cancel', 'Annulla'),
      colCreateLabel: this.l3('Utwórz', 'Create', 'Crea'),
      colNewOpen: () => this.setState({ colNew: true, colDraft: '' }),
      colCancel: () => this.setState({ colNew: false, colDraft: '' }),
      onColDraft: (e) => this.setState({ colDraft: e.target.value }),
      colCreate: () => this.createCol(),
      colBack: () => this.setState({ colOpen: null }),
      colDelete: () => this.deleteCol(),
      collections: st.collections.map((c, i) => ({
        name: this.l3(c.pl, c.en, c.it), count: this.colCountLabel(c.ids.length),
        delay: (i * 70) + 'ms', shots: this.colShots(c),
        open: () => this.setState({ colOpen: c.id }) })),
      colName: cc ? this.l3(cc.pl, cc.en, cc.it) : '',
      colCount: cc ? this.colCountLabel(cc.ids.length) : '',
      colEmpty: cc ? cc.ids.length === 0 : false,
      colEmptyText: this.l3('Pusto. Dorzuć coś z listy poniżej.', 'Empty. Add something from the list below.', 'Vuoto. Aggiungi qualcosa dall’elenco qui sotto.'),
      colAddLabel: this.l3('Dodaj z zapisanych', 'Add from saved', 'Aggiungi dai salvati'),
      colVenues: cc ? this.venues.filter((x) => cc.ids.indexOf(x.id) > -1).map((x, i) => ({
        name: x.name, catLabel: this.dt(x.catLabel), district: x.district, grad: x.grad, rating: x.rating.toFixed(1),
        statusLabel: x.isOpen ? t.open : t.closed, delay: (i * 70) + 'ms',
        open: () => this.openVenue(x.id),
        remove: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.toggleInCol(x.id); } })) : [],
      colPool: this.venues.filter((x) => st.savedIds.indexOf(x.id) > -1).map((x) => {
        const inC = !!cc && cc.ids.indexOf(x.id) > -1;
        return { name: x.name, bg: inC ? soft : 'transparent', fg: inC ? at : th.sub,
          border: inC ? ac.hex : th.hair, toggle: () => this.toggleInCol(x.id) }; }),
      colPoolEmpty: st.savedIds.length === 0,

      savedTabs: [{ id: 'saved', label: t.saved }, { id: 'cols', label: this.l3('Kolekcje', 'Collections', 'Raccolte') }, { id: 'coupons', label: t.coupons }].map((s) => ({
        label: s.label, bg: st.savedTab === s.id ? th.ink : 'transparent', fg: st.savedTab === s.id ? th.paper : th.sub,
        pick: () => this.setState({ savedTab: s.id }) })),
      savedList: this.venues.filter((x) => st.savedIds.indexOf(x.id) > -1).map((x, i) => ({
        name: x.name, catLabel: this.dt(x.catLabel), district: x.district, grad: x.grad, rating: x.rating.toFixed(1),
        statusLabel: x.isOpen ? t.open : t.closed, delay: (i * 70) + 'ms',
        open: () => this.openVenue(x.id), remove: (e) => { if (e && e.stopPropagation) e.stopPropagation(); this.toggleSaved(x.id); } })),
      savedEmpty: st.savedIds.length === 0,
      savedEmptyText: st.lang === 'pl' ? 'Nic tu jeszcze nie ma. Zapisuj miejsca zakładką po prawej stronie karty.' : 'Nothing here yet. Save places with the bookmark on each card.',

      userName: st.user ? st.user.name : t.guest, userMail: st.user ? st.user.mail : (st.lang === 'pl' ? 'tryb gościa' : 'guest mode'),
      userInitial: st.user ? st.user.name[0] : quickWho.trim().charAt(0).toUpperCase(),
      anon: !st.user, logged: !!st.user,
      showTopCover: st.phase === 'app' && ['discover', 'profile', 'trip', 'saved'].indexOf(st.tab) > -1,
      listMinH: st.query && st.query.trim() ? '780px' : '0px',
      avaRingDash: ((lvlPts / lvlSize) * 144.5).toFixed(1) + ' 144.5',
      confettiOn: !!st.confetti,
      confPieces: (() => {
        const cols = [ac.hex, '#57C39F', '#D2A177', '#EFDDC4', th.ink];
        const out = [];
        for (let i = 0; i < 26; i++) {
          const right = i % 2 === 1;
          const v = i % 3;
          out.push({
            side: right ? 'auto' : (6 + (i % 5) * 7) + 'px',
            sideR: right ? (6 + (i % 5) * 7) + 'px' : 'auto',
            bottom: (96 + (i % 4) * 16) + 'px',
            bg: cols[i % cols.length],
            w: (5 + (i % 4) * 2) + 'px',
            h: (8 + (i % 3) * 4) + 'px',
            radius: i % 4 === 0 ? '999px' : '2px',
            anim: (right ? 'confR' : 'confL') + (v === 0 ? 'a' : v === 1 ? 'b' : 'c'),
            delay: ((i % 7) * 55) + 'ms',
            dur: (1500 + (i % 5) * 260) + 'ms'
          });
        }
        return out;
      })(),
      loginFromProfile: () => this.setState({ mail: 'flow', authMode: 'login', mailStep: 'mail', code: '' }),
      anonTitle: this.l3('Zaloguj się, żeby zbierać punkty', 'Sign in to start collecting', 'Accedi per iniziare a raccogliere'),
      anonBody: this.l3('Kupony, zapisane miejsca, poziomy i nagrody zapisują się tylko na koncie.',
        'Coupons, saved places, levels and rewards are kept on your account only.',
        'Coupon, locali salvati, livelli e premi restano solo sul tuo account.'),
      anonMail: this.l3('Dalej z e-mailem', 'Continue with e-mail', 'Continua con e-mail'),
      anonBizQ: this.l3('Masz lokal?', 'Own a venue?', 'Hai un locale?'),
      anonBiz: this.l3('Zaloguj się jako firma', 'Sign in as a business', 'Accedi come azienda'),
      orLabel: this.l3('albo', 'or', 'oppure'),
      toRegister: () => this.setState({ mailStep: 'name' }),
      toAvatarStep: () => this.setState({ mailStep: 'avatar' }),
      finishRegister: () => {
        const n = (this.regNameRef && this.regNameRef.current && this.regNameRef.current.value) || 'Nowy Użytkownik';
        this.setState({ mailStep: 'wait' });
        setTimeout(() => this.finishLogin(n), 1000);
      },
      pickAvatar: () => {
        this.buzz(10);
        this.toast(this.l3('Wybieranie zdjęcia z galerii...', 'Picking from gallery...', 'Scelta dalla galleria...'));
      },
      onCodeInput: (e) => {
        const v = e.target.value;
        this.setState({ code: v });
        if (v.length === 4) {
          this.verify();
        }
      },
      bizFromLogin: () => this.setState({ mail: null, gate: false, mailStep: 'mail', code: '',
        phase: 'biz', biz: 'flow', bizStep: 0, bizManual: false, bizVerify: 'idle',
bizEditMode: false,
      bizCategory: 'apartments',
      bizLivePreview: false, bizCategory: 'apartments', bizLivePreview: false }),
      delEntry: this.l3('Usuń konto', 'Delete account', 'Elimina account'),
      logout: () => { this.buzz(10); this.setState({ user: null, coupon: null }); this.toast(st.lang === 'pl' ? 'Wylogowano.' : 'Signed out.'); },
      langOpts: [{ id: 'pl', label: 'Polski' }, { id: 'en', label: 'English' }, { id: 'it', label: 'Italiano' }].map((l) => ({
        label: l.label, bg: st.lang === l.id ? th.ink : 'transparent', fg: st.lang === l.id ? th.paper : th.sub,
        pick: () => this.setState({ lang: l.id }) })),
      themeOpts: [{ id: 'papier', label: st.lang === 'pl' ? 'Papier' : 'Paper' }, { id: 'noc', label: st.lang === 'pl' ? 'Noc' : 'Night' }].map((x) => ({
        label: x.label, bg: st.theme === x.id ? th.ink : 'transparent', fg: st.theme === x.id ? th.paper : th.sub,
        pick: () => { this.setState({ theme: x.id }); if (this.map) { this.map.remove(); this.map = null; } } })),
      accentOpts: Object.keys(this.accents).map((k) => ({
        label: this.accents[k].label, hex: this.accents[k].hex,
        ring: st.accent === k ? this.accents[k].hex : 'transparent',
        pick: () => { this.setState({ accent: k }); if (this.map) { this.map.remove(); this.map = null; } } })),
      isBiz: st.phase === 'biz',
      bizLanding: st.biz === 'landing', bizPlans: st.biz === 'plans', bizRegister: st.biz === 'register', bizPanel: st.biz === 'panel',

      bizToPlans: () => this.setState({ biz: 'plans' }),
      benefits: [
        { title: st.lang === 'pl' ? 'Zauważalność' : 'Visibility', body: st.lang === 'pl' ? 'Twoje wydarzenia na mapie miasta i w kanale „Dziś w mieście”.' : 'Your events on the city map and in the Today feed.', isChart: true, delay: '0ms' },
        { title: st.lang === 'pl' ? 'Gotowe szablony' : 'Ready templates', body: st.lang === 'pl' ? 'Relacja na Instagram generowana jednym kliknięciem.' : 'Instagram story generated in one click.', isBrush: true, delay: '70ms' },
        { title: st.lang === 'pl' ? 'Naklejka QR na szybę' : 'QR sticker for the window', body: st.lang === 'pl' ? 'Działa 24/7, także gdy lokal jest zamknięty.' : 'Works 24/7, even when you are closed.', isQr: true, delay: '140ms' }
      ],
      plans: [
        { id: 'base', name: 'BASE', price: '0 zł', per: st.lang === 'pl' ? 'na zawsze' : 'forever', feats: [st.lang === 'pl' ? 'Wizytówka z Google Maps' : 'Google Maps card', st.lang === 'pl' ? '1 aktywna oferta' : '1 active offer', st.lang === 'pl' ? 'Naklejka QR' : 'QR sticker'] },
        { id: 'pro', name: 'PRO', price: '79 zł', per: st.lang === 'pl' ? 'miesięcznie' : 'per month', feats: [st.lang === 'pl' ? 'Wszystko z BASE' : 'Everything in BASE', st.lang === 'pl' ? 'Relacje na IG i wydarzenia' : 'IG stories and events', st.lang === 'pl' ? 'Statystyki skanów' : 'Scan analytics'] },
        { id: 'vip', name: 'VIP', price: '249 zł', per: st.lang === 'pl' ? 'miesięcznie' : 'per month', feats: [st.lang === 'pl' ? 'Wszystko z PRO' : 'Everything in PRO', st.lang === 'pl' ? 'Wyróżnienie na mapie' : 'Featured on the map', st.lang === 'pl' ? 'Opiekun i kampanie' : 'Account manager'] }
      ].map((p) => ({ name: p.name, price: p.price, per: p.per, feats: p.feats.map((f) => ({ text: f })),
        border: st.plan === p.id ? at : th.hair, bg: st.plan === p.id ? (th.dark ? ac.softDark : ac.soft) : th.surf,
        badge: p.id === 'pro' ? (st.lang === 'pl' ? 'NAJCZĘŚCIEJ WYBIERANY' : 'MOST POPULAR') : '',
        showBadge: p.id === 'pro', pick: () => this.setState({ plan: p.id }) })),
      trialNote: st.lang === 'pl' ? 'PRO i VIP: pierwszy tydzień za 0 zł, pierwszy miesiąc −50%. Rezygnujesz jednym kliknięciem.' : 'PRO and VIP: first week free, first month half price. Cancel in one click.',
      planName: st.trial ? st.plan.toUpperCase() + (PL ? ' · PRÓBNY' : ' · TRIAL') : st.plan.toUpperCase(),
      bizToRegister: () => this.setState({ biz: 'register', bizPicked: null }),
      onBizQuery: (e) => {
        const v = e.target.value;
        this.setState({ bizQuery: v, gBusy: v.trim().length > 1 });
        clearTimeout(this.gT);
        this.gT = setTimeout(() => {
          const q = v.trim();
          if (q.length < 2) { this.setState({ gBusy: false, gReal: [] }); return; }
          if (!window.TAPI || !window.TAPI.native) {
            const low = q.toLowerCase();
            this.setState({ gBusy: false,
              gReal: this.gAll.filter((g) => (g.name + ' ' + g.addr).toLowerCase().indexOf(low) > -1) });
            return;
          }
          window.TAPI.call('maps.search', { query: q }).then((r) => {
            this.setState({ gBusy: false, gReal: ((r && r.results) || []).map((x) => ({
              name: x.name, addr: x.address, placeId: x.placeId,
              rating: (x.rating ? String(x.rating).replace('.', ',') : '—') + ' · ' + (x.votes || 0)
            })) });
          }).catch(() => this.setState({ gBusy: false, gReal: [] }));
        }, 430);
      },
      clearBizQuery: () => {
        if (this.bizRef.current) { this.bizRef.current.value = ''; this.bizRef.current.focus(); }
        clearTimeout(this.gT);
        this.setState({ bizQuery: '', gBusy: false });
      },
      gPlaces: [
        { name: 'Nokturn Wine & Vinyl', addr: 'ul. Józefa 12, Kraków', rating: '4,8 · 212' },
        { name: 'Nokturn Bistro', addr: 'ul. Starowiślna 44, Kraków', rating: '4,5 · 87' },
        { name: 'Nokturn Cafe', addr: 'Rynek Podgórski 3, Kraków', rating: '4,7 · 41' }
      ].map((g, i) => ({ name: g.name, addr: g.addr, rating: g.rating, delay: (i * 60) + 'ms',
        pick: () => { this.setState({ bizPicked: g.name }); this.toast(st.lang === 'pl' ? 'Zaciągnęliśmy dane z Google: godziny, telefon, zdjęcia.' : 'Pulled from Google: hours, phone, photos.'); } })),
      bizPicked: st.bizPicked, bizNotPicked: !st.bizPicked,
      welcomeText: st.lang === 'pl' ? 'Witamy w TAPI,' : 'Welcome to TAPI,',
      bizCreate: () => { 
        this.setState({ phase: 'bizWelcome' });
        setTimeout(() => {
          this.setState({ phase: 'biz', biz: 'panel', oTab: 'home' }); 
          this.toast(st.lang === 'pl' ? 'Wizytówka gotowa. Pakiet ' + st.plan.toUpperCase() + ' — tydzień próbny aktywny.' : 'Card is live. ' + st.plan.toUpperCase() + ' trial week started.'); 
        }, 4000);
      },

      bizFlow: st.biz === 'landing' || st.biz === 'flow',
      bizPlans: st.biz === 'plans',
      step0: (st.bizStep || 0) === 0, step1: (st.bizStep || 0) === 1, step15: (st.bizStep || 0) === 1.5, step2: (st.bizStep || 0) === 2, step3: (st.bizStep || 0) === 3,
      showPills: (st.bizStep || 0) > 0,
      pills: [1, 2, 3, 4].map((i) => ({ fill: (st.bizStep || 0) >= (i===2 ? 1.5 : (i===3 ? 2 : (i===4 ? 3 : i))) ? '100%' : '0%' })),
      
      tosScrolled: false,
      tosAccepted: false,
      onTosScroll: (e) => {
        if (this.state.tosScrolled) return;
        const el = e.target;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 15) {
          this.setState({ tosScrolled: true });
        }
      },
      toggleTos: () => {
        if (this.state.tosScrolled) this.setState({ tosAccepted: !this.state.tosAccepted });
      },

      stepNext: () => {
        const n = (st.bizStep || 0);
        if (n === 1) { this.setState({ bizStep: 1.5, bizManual: false }); return; }
        if (n === 1.5) { 
          if (!st.tosAccepted) return;
          this.setState({ bizStep: 2 }); 
          return; 
        }
        if (n === 2) { this.setState({ bizStep: 3 }); return; }
        if (n >= 3) { this.setState({ biz: 'plans' }); return; }
        this.setState({ bizStep: n + 1, bizManual: false });
      },

      bizIntroTitle: st.lang === 'pl' ? 'Co realnie dostajesz w TAPI' : 'What you actually get with TAPI',
      bizIntroPoints: [
        { title: st.lang === 'pl' ? 'Goście, którzy przechodzą obok' : 'Guests walking past', body: st.lang === 'pl' ? 'Naklejka w witrynie działa 24/7 — także gdy masz zamknięte.' : 'The window sticker works 24/7 — even when you are closed.', delay: '0ms', isSticker: true },
        { title: st.lang === 'pl' ? 'Wydarzenia widoczne w mieście' : 'Events visible across town', body: st.lang === 'pl' ? 'Twoje okazje trafiają na mapę i do kanału „Dziś w mieście”.' : 'Your offers land on the map and in the Today feed.', delay: '80ms', isPin: true },
        { title: st.lang === 'pl' ? 'Relacja na IG w jednym kliknięciu' : 'IG story in one click', body: st.lang === 'pl' ? 'Gotowy szablon 1080×1920 z twoimi danymi i ceną.' : 'A ready 1080×1920 template with your data and price.', delay: '160ms', isSpark: true }
      ],
      startLabel: st.lang === 'pl' ? 'Zaczynamy' : 'Let us start',
      introNote: st.lang === 'pl' ? 'Rejestracja zajmuje około 2 minut. Bez karty.' : 'Takes about 2 minutes. No card needed.',
      searchTitle: st.lang === 'pl' ? 'Znajdź swoją firmę' : 'Find your business',
      searchSub: st.lang === 'pl' ? 'Wpisz nazwę — dane pobierzemy z wizytówki Google.' : 'Type the name — we pull the data from your Google listing.',
      manual: !!st.bizManual, notManual: !st.bizManual,
      goManual: () => this.setState({ bizManual: true }),
      leaveManual: () => this.setState({ bizManual: false }),
      manualDone: () => {
        // Zapisz wybraną kategorię
        const catSelect = document.querySelector('select');
        const cat = catSelect ? catSelect.value : 'HOSPITALITY';
        this.setState({ bizStep: 1.5, bizPicked: st.lang === 'pl' ? 'Twój lokal' : 'Your venue', bizManual: false, bizCategory: cat });
      },
      manualFields: [
        { ph: st.lang === 'pl' ? 'Nazwa lokalu' : 'Venue name' },
        { ph: st.lang === 'pl' ? 'Adres' : 'Address' }
      ],
      noFindLabel: st.lang === 'pl' ? 'Nie znalazłeś swojej firmy?' : 'Cannot find your business?',
      nextLabel: st.lang === 'pl' ? 'Dalej' : 'Continue',
      backToSearch: st.lang === 'pl' ? 'Wróć do wyszukiwania' : 'Back to search',
      gPlaces: this.gHits(st).map((g, i) => {
        const q = ((st.bizQuery || '') + '').trim().toLowerCase();
        const at2 = g.name.toLowerCase().indexOf(q);
        return { name: g.name, addr: g.addr, rating: g.rating, delay: (i * 55) + 'ms',
          pre: at2 > -1 ? g.name.slice(0, at2) : g.name,
          hit: at2 > -1 ? g.name.slice(at2, at2 + q.length) : '',
          post: at2 > -1 ? g.name.slice(at2 + q.length) : '',
          pick: () => { this.setState({ bizPicked: g.name, bizAddr: g.addr, bizRating: g.rating, bizPlaceId: g.placeId || null, bizStep: 2, bizVerify: 'idle' }); } };
      }),
      gTyped: ((st.bizQuery || '') + '').trim().length > 0,
      gBusy: !!st.gBusy,
      gIdle: !st.gBusy && ((st.bizQuery || '') + '').trim().length < 2,
      gHas: !st.gBusy && this.gHits(st).length > 0,
      gEmpty: !st.gBusy && ((st.bizQuery || '') + '').trim().length > 1 && this.gHits(st).length === 0,
      gSkeleton: [{ w: '64%', delay: '0ms' }, { w: '48%', delay: '90ms' }, { w: '56%', delay: '180ms' }],
      gFieldBorder: ((st.bizQuery || '') + '').trim() ? at : th.hair,
      gIconStroke: ((st.bizQuery || '') + '').trim() ? at : th.sub,
      gIdleHint: PL ? 'Zacznij pisać nazwę — podpowiedzi lecą prosto z Google Maps.' : 'Start typing the name — suggestions come straight from Google Maps.',
      gAttrib: PL ? 'Wyniki z Google' : 'Results from Google',
      gEmptyTitle: PL ? 'Brak dopasowania' : 'No match',
      gEmptySub: PL ? 'Sprawdź pisownię albo dodaj lokal ręcznie — wystarczą dwa pola.' : 'Check the spelling or add the venue manually — two fields is enough.',
      verifyTitle: st.lang === 'pl' ? 'Potwierdź, że to twoja firma' : 'Confirm this is your business',
      verifySub: st.lang === 'pl' ? 'Ten adres jest podany w wizytówce Google. Wyślemy na niego jednorazowy link.' : 'This address comes from your Google listing. We will send a one-time link there.',
      verifyFrom: st.lang === 'pl' ? 'E-mail z wizytówki' : 'E-mail from the listing',
      bizMail: 'kontakt@nokturn.wine',
      verifyCta: st.lang === 'pl' ? 'Zweryfikuj' : 'Verify',
      verifyBusy: st.lang === 'pl' ? 'Wysyłam link i sprawdzam domenę…' : 'Sending the link and checking the domain…',
      verifyDone: st.lang === 'pl' ? 'Zweryfikowano — to twoja firma.' : 'Verified — this is your business.',
      verifyFoot: st.lang === 'pl' ? 'Nie masz dostępu do tego adresu? Zweryfikujemy telefonicznie.' : 'No access to that address? We can verify by phone.',
      vIdle: (st.bizVerify || 'idle') === 'idle', vBusy: st.bizVerify === 'busy', vDone: st.bizVerify === 'done',
      doVerify: () => { this.setState({ bizVerify: 'busy' }); clearTimeout(this.vT); this.vT = setTimeout(() => this.setState({ bizVerify: 'done' }), 1400); },
      sumTitle: st.lang === 'pl' ? 'Pobraliśmy to z Google' : 'We pulled this from Google',
      sumSub: st.lang === 'pl' ? 'Wszystko zmienisz później w panelu.' : 'You can change everything later in the panel.',
      sumRows: [
        { label: st.lang === 'pl' ? 'Nazwa' : 'Name', value: st.bizPicked || 'Nokturn Wine & Vinyl' },
        { label: st.lang === 'pl' ? 'Adres' : 'Address', value: st.bizAddr || 'ul. Józefa 12, Kraków' },
        { label: st.lang === 'pl' ? 'Godziny' : 'Hours', value: st.lang === 'pl' ? '7 dni, dziś do 3:00' : '7 days, today until 3:00' },
        { label: st.lang === 'pl' ? 'Opinie' : 'Reviews', value: st.bizRating || '4,8 · 212' }
      ].map((r, i) => ({ label: r.label, value: r.value, delay: (i * 55) + 'ms' })),
      toPlansLabel: st.lang === 'pl' ? 'Wybierz pakiet' : 'Choose a plan',
      trialBadge: st.lang === 'pl' ? '2 TYGODNIE PRO ZA 0 ZŁ' : '2 WEEKS OF PRO FOR FREE',
      billOpts: [
        { id: 'm', label: st.lang === 'pl' ? 'Miesięcznie' : 'Monthly' },
        { id: 'y', label: st.lang === 'pl' ? 'Rocznie · −20%' : 'Yearly · −20%' }
      ].map((b) => ({ label: b.label, bg: (st.billing || 'm') === b.id ? th.ink : 'transparent',
        fg: (st.billing || 'm') === b.id ? th.paper : th.sub, pick: () => this.setState({ billing: b.id }) })),
      plans: [
        { id: 'base', name: 'BASE', m: '0 zł', y: '0 zł', oldM: '', oldY: '', tag: st.lang === 'pl' ? 'na start' : 'to begin',
          feats: [st.lang === 'pl' ? 'Wizytówka z Google' : 'Google listing card', st.lang === 'pl' ? '1 aktywna oferta' : '1 active offer', st.lang === 'pl' ? 'Naklejka QR' : 'QR sticker'] },
        { id: 'pro', name: 'PRO', m: '79 zł', y: '63 zł', oldM: '99 zł', oldY: '79 zł', tag: st.lang === 'pl' ? 'dla większości lokali' : 'for most venues',
          feats: [st.lang === 'pl' ? 'Wszystko z BASE' : 'Everything in BASE', st.lang === 'pl' ? 'Relacje IG i wydarzenia' : 'IG stories and events', st.lang === 'pl' ? 'Statystyki skanów' : 'Scan analytics'] },
        { id: 'vip', name: 'VIP', m: '249 zł', y: '199 zł', oldM: '299 zł', oldY: '249 zł', tag: st.lang === 'pl' ? 'dla sieci i klubów' : 'for chains and clubs',
          feats: [st.lang === 'pl' ? 'Wszystko z PRO' : 'Everything in PRO', st.lang === 'pl' ? 'Wyróżnienie na mapie' : 'Featured on the map', st.lang === 'pl' ? 'Opiekun i kampanie' : 'Account manager'] }
      ].map((p) => {
        const yearly = (st.billing || 'm') === 'y';
        const old = yearly ? p.oldY : p.oldM;
        return { name: p.name, tag: p.tag, price: yearly ? p.y : p.m, old: old, hasOld: !!old,
          per: yearly ? (st.lang === 'pl' ? 'mies. przy płatności rocznej' : 'per month, billed yearly') : (st.lang === 'pl' ? 'miesięcznie' : 'per month'),
          feats: p.feats.map((f) => ({ text: f })),
          border: st.plan === p.id ? at : th.hair, bg: st.plan === p.id ? (th.dark ? ac.softDark : ac.soft) : th.surf,
          shadow: st.plan === p.id ? '0 18px 40px -30px rgba(22,24,28,0.9)' : '0 10px 26px -24px rgba(22,24,28,0.8)',
          badge: st.lang === 'pl' ? 'NAJCZĘŚCIEJ WYBIERANY' : 'MOST POPULAR', showBadge: p.id === 'pro',
          pick: () => this.setState({ plan: p.id }) };
      }),
      trialNote: st.lang === 'pl' ? 'Pierwsze 2 tygodnie PRO bez opłat. Potem rezygnujesz jednym kliknięciem.' : 'First 2 weeks of PRO free. Cancel later in one click.',
      createLabel: st.lang === 'pl' ? 'Utwórz wizytówkę' : 'Create the card',
      goBiz: () => this.setState({ phase: 'biz', biz: 'flow', bizStep: 0, bizManual: false, bizVerify: 'idle' }),
      goBizPanel: () => this.setState({ phase: 'biz', biz: 'flow', bizStep: 0, bizManual: false, bizVerify: 'idle' }),

      oTab: st.oTab, oHome: st.oTab === 'home', oStories: st.oTab === 'stories', oScans: st.oTab === 'scans',
      ownerTabs: [
        { id: 'home', label: st.lang === 'pl' ? 'Pulpit' : 'Overview' },
        { id: 'stories', label: st.lang === 'pl' ? 'Relacje' : 'Stories' },
        { id: 'scans', label: st.lang === 'pl' ? 'Skany' : 'Scans' }
      ].map((o) => ({ label: o.label, bg: st.oTab === o.id ? th.ink : 'transparent', fg: st.oTab === o.id ? th.paper : th.sub,
        pick: () => this.setState({ oTab: o.id }) })),
      ownerTitle: st.oTab === 'home' ? (st.lang === 'pl' ? 'Dzisiaj u ciebie' : 'Today at your place') : (st.oTab === 'stories' ? (st.lang === 'pl' ? 'Relacje i wydarzenia' : 'Stories and events') : (st.lang === 'pl' ? 'Skany i naklejka' : 'Scans and sticker')),
      kpis: [
        { label: st.lang === 'pl' ? 'SKANY DZIŚ' : 'SCANS TODAY', value: '34', trend: '+18%', delay: '0ms' },
        { label: st.lang === 'pl' ? 'KUPONY ODEBRANE' : 'COUPONS USED', value: '12', trend: '35%', delay: '70ms' },
        { label: st.lang === 'pl' ? 'NOWI GOŚCIE' : 'NEW GUESTS', value: '9', trend: st.lang === 'pl' ? 'pierwsza wizyta' : 'first visit', delay: '140ms' },
        { label: st.lang === 'pl' ? 'ŚREDNI RACHUNEK' : 'AVG. BILL', value: '86 zł', trend: '+11 zł', delay: '210ms' }
      ],
      bars: [['Pn', 38], ['Wt', 52], ['Śr', 44], ['Cz', 71], ['Pt', 96], ['So', 88], ['Nd', 61]].map((b, i) => ({
        day: b[0], h: b[1] + '%', delay: (i * 60) + 'ms', bg: i === 4 ? at : th.hair })),
      feed: [
        { time: '18:12', text: st.lang === 'pl' ? 'Kupon NKT·4192 wykorzystany' : 'Coupon NKT·4192 used', delay: '0ms' },
        { time: '17:48', text: st.lang === 'pl' ? 'Nowy skan — gość pierwszorazowy' : 'New scan — first-time guest', delay: '60ms' },
        { time: '17:20', text: st.lang === 'pl' ? 'Ktoś zapisał was na później' : 'Someone saved you for later', delay: '120ms' },
        { time: '16:55', text: st.lang === 'pl' ? 'Relacja opublikowana na IG' : 'Story published to IG', delay: '180ms' }
      ],
      storyTpls: [
        { name: st.lang === 'pl' ? 'Okazja' : 'Deal', grad: 'linear-gradient(160deg, #EAD6DE, #A8788C)' },
        { name: st.lang === 'pl' ? 'Wydarzenie' : 'Event', grad: 'linear-gradient(160deg, #EFDDC4, #B67B4C)' },
        { name: st.lang === 'pl' ? 'Menu dnia' : 'Daily menu', grad: 'linear-gradient(160deg, #DDE7D6, #6E9077)' }
      ].map((s, i) => ({ name: s.name, grad: s.grad, border: st.storyTpl === i ? at : th.hair,
        pick: () => this.setState({ storyTpl: i }) })),
      storyGrad: ['linear-gradient(160deg, #EAD6DE, #A8788C)', 'linear-gradient(160deg, #EFDDC4, #B67B4C)', 'linear-gradient(160deg, #DDE7D6, #6E9077)'][st.storyTpl],
      genStory: () => this.toast(st.lang === 'pl' ? 'Relacja 1080×1920 gotowa — wysłaliśmy na twój Instagram.' : 'Story 1080×1920 ready — sent to your Instagram.'),
      offers: [
        { id: 'happy', name: st.lang === 'pl' ? 'Kieliszek frizzante gratis' : 'Free glass of frizzante', meta: '18:00 – 20:00', taken: '124' },
        { id: 'story', name: st.lang === 'pl' ? 'Deska dla dwojga −25%' : 'Board for two −25%', meta: st.lang === 'pl' ? 'Weekendy' : 'Weekends', taken: '46' },
        { id: 'vinyl', name: st.lang === 'pl' ? 'Winyl za punkty' : 'Vinyl for points', meta: st.lang === 'pl' ? 'Limit 12 szt.' : 'Limit 12', taken: '7' }
      ].map((o, i) => {
        const on = !!st.offerState[o.id];
        return { name: o.name, meta: o.meta, taken: o.taken, delay: (i * 70) + 'ms',
          state: on ? (st.lang === 'pl' ? 'aktywna' : 'active') : (st.lang === 'pl' ? 'wstrzymana' : 'paused'),
          stateFg: on ? at : th.sub, track: on ? ac.hex : th.hair, knob: on ? '18px' : '0px',
          toggle: () => { const n = Object.assign({}, st.offerState); n[o.id] = !on; this.setState({ offerState: n }); } };
      }),
      qr: (function () { const out = []; for (let i = 0; i < 144; i++) { const r = Math.floor(i / 12), c = i % 12;
        const corner = (r < 3 && c < 3) || (r < 3 && c > 8) || (r > 8 && c < 3);
        out.push({ bg: corner ? (r % 2 === 0 || c % 2 === 0 ? '#16181C' : 'transparent') : ((r * 5 + c * 7 + (r * c) % 4) % 3 === 0 ? '#16181C' : 'transparent') }); } return out; })(),
      scans: [
        { who: 'KZ', text: st.lang === 'pl' ? 'Klara Z. · kupon odebrany' : 'Klara Z. · coupon used', time: '18:12', delay: '0ms' },
        { who: 'MP', text: st.lang === 'pl' ? 'Marek P. · pierwszy skan' : 'Marek P. · first scan', time: '17:48', delay: '60ms' },
        { who: 'AJ', text: st.lang === 'pl' ? 'Ada J. · zapisała lokal' : 'Ada J. · saved you', time: '17:20', delay: '120ms' },
        { who: 'TR', text: st.lang === 'pl' ? 'Tomek R. · kupon wygasł' : 'Tomek R. · coupon expired', time: '16:31', delay: '180ms' }
      ],
      downloadQR: () => this.toast(st.lang === 'pl' ? 'Naklejka A5 w PDF — wysłana na maila.' : 'A5 sticker PDF sent to your inbox.'),
      bizBackDown: () => {
        this.bizBackTmr = setTimeout(() => {
          this.bizBackTmr = null;
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
          this.setState({ bizBackModal: true });
        }, 500);
      },
      bizBackUp: () => {
        if (this.bizBackTmr) {
          clearTimeout(this.bizBackTmr);
          this.bizBackTmr = null;
          if (this.state && this.state.bizBackStep) this.state.bizBackStep();
        }
      },
      bizBackCancel: () => {
        if (this.bizBackTmr) {
          clearTimeout(this.bizBackTmr);
          this.bizBackTmr = null;
        }
      },
      closeBizBackModal: () => this.setState({ bizBackModal: false }),
      bizBackStep: () => {
        this.setState({ bizBackModal: false });
        if (st.biz === 'panel') { this.setState({ phase: (st.user || st.entered) ? 'app' : 'auth', tab: 'profile' }); return; }
        if (st.biz === 'plans') { this.setState({ biz: 'flow', bizStep: 3 }); return; }
        const n = (st.bizStep || 0);
        if (n === 1.5) { this.setState({ bizStep: 1, bizManual: false }); return; }
        if (n === 2) { this.setState({ bizStep: 1.5 }); return; }
        if (n === 3) { this.setState({ bizStep: 2 }); return; }
        if (n > 0) { this.setState({ bizStep: n - 1, bizManual: false }); return; }
        this.setState({ phase: (st.user || st.entered) ? 'app' : 'auth', tab: 'profile' });
      },
      bizBack: () => {
        if (this.state && this.state.bizBackStep) this.state.bizBackStep();
      },
      bizUndoChanges: () => {
        this.setState({ bizBackModal: false });
        this.toast(st.lang === 'pl' ? 'Cofnięto zmiany.' : 'Changes undone.');
        // Reset logic if needed
      },
      bizBackHome: () => {
        this.setState({ bizBackModal: false, phase: (st.user || st.entered) ? 'app' : 'auth', tab: 'profile' });
      },
      toggleBizEdit: () => this.setState({ bizEditMode: !this.state.bizEditMode }),
      exitBiz: () => { this.setState({ phase: (st.user || st.entered) ? 'app' : 'auth', tab: 'profile' }); },

      /* ══ FILTRY I SORTOWANIE ══ */
      sortOpen: !!st.sortOpen,
      openSort: () => this.setState({ sortOpen: true }),
      closeSort: () => this.setState({ sortOpen: false }),
      sortTitle: PL ? 'Filtruj i sortuj' : 'Filter and sort',
      sortResetLabel: PL ? 'Wyczyść' : 'Clear',
      resetSort: () => { this.buzz(9); this.setState({ cat: 'all', sortBy: 'reco', fPrice: 0, fRating: 0, fOpen: false, area: 'all' }); },
      sortHead: PL ? 'Sortuj według' : 'Sort by',
      priceHead: PL ? 'Poziom cen' : 'Price level',
      ratingHead: PL ? 'Ocena minimalna' : 'Minimum rating',
      hasFilters: fN > 0, filterCount: String(fN),
      filtBtnBg: fN > 0 ? (th.dark ? ac.softDark : ac.soft) : th.surf,
      filtBtnBorder: fN > 0 ? at : th.hair,
      filtBtnFg: fN > 0 ? at : th.ink,
      sortChip: sortNames[st.sortBy || 'reco'][PL ? 0 : 1],
      noResults: list.length === 0,
      emptyTitle: PL ? 'Nic nie pasuje' : 'Nothing matches',
      emptySub: PL ? 'Zbyt ciasne filtry albo literówka w wyszukiwaniu. Zacznij od czystej listy — miasto ma więcej do pokazania.' : 'Filters too tight, or a typo in the search. Start from a clean list — the city has more to show.',
      emptyCta: PL ? 'Wyczyść wszystko' : 'Clear everything',
      clearAll: () => { if (this.searchRef.current) this.searchRef.current.value = '';
        this.setState({ query: '', cat: 'all', area: 'all', sortBy: 'reco', fPrice: 0, fRating: 0, fOpen: false }); },
      stickyShade: th.dark ? 'rgba(0,0,0,0.5)' : 'rgba(22,24,28,0.14)',
      areas: [{ id: 'all', pl: 'Cały Kraków', en: 'All Kraków' }].concat(
        this.venues.map((v) => v.district).filter((d, i, arr) => arr.indexOf(d) === i).map((d) => ({ id: d, pl: d, en: d }))
      ).map((a) => { const on = (st.area || 'all') === a.id;
        const n = a.id === 'all' ? this.venues.length : this.venues.filter((v) => v.district === a.id).length;
        return { label: PL ? a.pl : a.en, n: String(n),
          bg: on ? th.ink : th.surf, fg: on ? th.paper : th.ink, border: on ? th.ink : th.hair,
          dotBg: on ? 'rgba(255,255,255,0.18)' : (th.dark ? ac.softDark : ac.soft),
          dotFg: on ? th.paper : at,
          pick: () => this.setState({ area: a.id }) }; }),
      resultLine: list.length + (PL ? plMiejsc + ' w okolicy' : ' places nearby'),
      sortApply: (PL ? 'Pokaż ' : 'Show ') + list.length + (PL ? plMiejsc : ' places'),
      sortOpts: [
        { id: 'reco', pl: 'Polecane', en: 'Recommended', spl: 'Dopasowane do twoich zainteresowań', sen: 'Tuned to your interests' },
        { id: 'cheap', pl: 'Najtańsze', en: 'Cheapest first', spl: 'Drinki, kawa i jedzenie od najniższych cen', sen: 'Drinks, coffee and food from the lowest prices' },
        { id: 'rated', pl: 'Najlepiej oceniane', en: 'Top rated', spl: 'Od najwyższej oceny gości', sen: 'Highest guest rating first' },
        { id: 'popular', pl: 'Najpopularniejsze', en: 'Most reviewed', spl: 'Najwięcej opinii w okolicy', sen: 'Most reviews nearby' },
        { id: 'near', pl: 'Najbliżej', en: 'Closest', spl: 'Od najkrótszego dystansu od ciebie', sen: 'Shortest distance from you' }
      ].map((s) => { const on = (st.sortBy || 'reco') === s.id; return {
        label: PL ? s.pl : s.en, sub: PL ? s.spl : s.sen, on: on, fg: on ? at : th.ink,
        bg: on ? (th.dark ? ac.softDark : ac.soft) : th.surf, border: on ? at : th.hair,
        pick: () => { this.buzz(7); this.setState({ sortBy: s.id }); } }; }),
      priceOpts: [{ id: 0, label: PL ? 'Wszystkie' : 'Any' }, { id: 1, label: '•' }, { id: 2, label: '••' }, { id: 3, label: '•••' }]
        .map((p) => { const on = (st.fPrice || 0) === p.id; return { label: p.label,
          bg: on ? th.ink : th.surf, fg: on ? th.paper : th.sub, border: on ? th.ink : th.hair,
          pick: () => this.setState({ fPrice: p.id }) }; }),
      ratingOpts: [{ id: 0, label: PL ? 'Dowolna' : 'Any' }, { id: 4, label: '4,0+' }, { id: 4.5, label: '4,5+' }, { id: 4.8, label: '4,8+' }]
        .map((r) => { const on = (st.fRating || 0) === r.id; return { label: r.label,
          bg: on ? th.ink : th.surf, fg: on ? th.paper : th.sub, border: on ? th.ink : th.hair,
          pick: () => this.setState({ fRating: r.id }) }; }),
      fOpenLabel: PL ? 'Tylko otwarte teraz' : 'Open right now only',
      fOpenSub: PL ? 'Ukryj lokale, które są już zamknięte' : 'Hide venues that are already closed',
      fOpenTrack: st.fOpen ? at : th.hair, fOpenKnob: st.fOpen ? '18px' : '0px',
      toggleFOpen: () => this.setState({ fOpen: !st.fOpen }),

      /* ══ PANEL FIRMY — PODZAKŁADKI ══ */
      bizSubs: [
        { id: 'card', pl: 'Wizytówka', en: 'Card' },
        { id: 'menu', pl: 'Menu', en: 'Menu' },
        { id: 'stats', pl: 'Statystyki', en: 'Stats' },
        { id: 'rewards', pl: 'Nagrody', en: 'Rewards' },
        { id: 'partners', pl: 'Polecane', en: 'Partners' },
        { id: 'data', pl: 'Dane', en: 'Details' }
      ].map((s) => { const on = (st.bizSub || 'stats') === s.id; return { label: PL ? s.pl : s.en,
        bg: on ? th.ink : 'transparent', fg: on ? th.paper : th.sub,
        pick: () => { this.buzz(7); this.setState({ bizSub: s.id }); } }; }),
      subMenu: st.bizSub === 'menu',
      subStats: (st.bizSub || 'stats') === 'stats',
      subRewards: st.bizSub === 'rewards',
      subData: st.bizSub === 'data',
      subPartners: st.bizSub === 'partners',
      subCard: st.bizSub === 'card',

      /* ══ WIZYTÓWKA OCZAMI GOŚCIA ══ */
      cardEditing: !!st.cardEdit, cardReading: !st.cardEdit,
      toggleCardEdit: () => this.setState({ cardEdit: !st.cardEdit, replyTo: null }),
      eyeNote: st.cardEdit
        ? (PL ? 'Tryb edycji. Zmieniasz to, co gość widzi, na żywo.' : 'Edit mode. You change what the guest sees, live.')
        : (PL ? 'Tak twoją wizytówkę widzi gość w aplikacji.' : 'This is how a guest sees your card in the app.'),
      eyeBg: st.cardEdit ? (th.dark ? ac.softDark : ac.soft) : th.surf,
      eyeBorder: st.cardEdit ? at : th.hair,
      eyeFg: st.cardEdit ? at : th.sub,
      eyeBtnBg: st.cardEdit ? ac.hex : th.ink,
      eyeBtnFg: st.cardEdit ? '#FBFAF7' : th.paper,
      eyeBtnLabel: st.cardEdit ? (PL ? 'PODGLĄD' : 'PREVIEW') : (PL ? 'EDYTUJ' : 'EDIT'),
      cardGrad: myV.grad,
      cardName: (st.bizData || {}).name || myV.name,
      cardRating: String(myV.rating).replace('.', PL ? ',' : '.'),
      cardVotes: myV.votes + (PL ? ' opinii' : ' reviews'),
      cardMeta: this.dt(myV.catLabel) + ' · ' + myV.district,
      cardOpenLine: PL ? 'Otwarte do 24:00' : 'Open until midnight',
      cardDesc: this.dt(st.cardDesc),
      setCardDesc: (e) => this.setState({ cardDesc: e.target.value }),
      photoLabel: PL ? 'Zmień zdjęcie' : 'Change photo',
      shufflePhoto: () => this.toast(PL ? 'Zdjęcia bierzemy z profilu Google. Możesz dodać własne z galerii.' : 'Photos come from Google. You can add your own from the gallery.'),
      storiesHead: PL ? 'Relacje i wydarzenia' : 'Stories and events',
      addStoryLabel: PL ? '+ Dodaj relację' : '+ Add story',
      addStory: () => { const n = (st.cardStories || []).concat([{ title: PL ? 'Nowa relacja' : 'New story', g: 3 }]);
        this.setState({ cardStories: n }); this.toast(PL ? 'Relacja dodana. Widoczna 24 godziny.' : 'Story added. Visible for 24 hours.'); },
      cardStories: (st.cardStories || []).map((s, i) => ({ title: this.dt(s.title), delay: (i * 70) + 'ms',
        grad: this.venues[s.g % this.venues.length].grad, editing: !!st.cardEdit,
        remove: () => this.setState({ cardStories: (this.state.cardStories || []).filter((_, k) => k !== i) }) })),
      reviewsHead: PL ? 'Opinie gości' : 'Guest reviews',
      replyPh: PL ? 'Odpowiedz gościowi — krótko i po ludzku.' : 'Reply to the guest — short and human.',
      replyDraft: st.replyDraft || '',
      setReply: (e) => this.setState({ replyDraft: e.target.value }),
      cancelReply: () => this.setState({ replyTo: null, replyDraft: '' }),
      cancelReplyLabel: PL ? 'Anuluj' : 'Cancel',
      sendReplyLabel: PL ? 'Opublikuj' : 'Publish',
      cardReviews: (st.cardRevs || []).map((r, i) => ({
        initial: r.name.charAt(0), name: r.name, when: PL ? r.wpl : r.wen,
        stars: '★ ' + String(r.stars).replace('.', PL ? ',' : '.'),
        text: PL ? r.tpl : r.ten, delay: (i * 70) + 'ms',
        hasReply: !!r.reply, reply: r.reply,
        replyHead: PL ? 'Odpowiedź lokalu' : 'Venue reply',
        canReply: !r.reply && st.replyTo !== i,
        replying: st.replyTo === i,
        replyLabel: PL ? 'Odpowiedz' : 'Reply',
        startReply: () => this.setState({ replyTo: i, replyDraft: '' }),
        sendReply: () => { const txt = (this.state.replyDraft || '').trim();
          if (!txt) { this.toast(PL ? 'Napisz choć jedno zdanie.' : 'Write at least one sentence.'); return; }
          const nx = (this.state.cardRevs || []).slice();
          nx[i] = Object.assign({}, nx[i], { reply: txt });
          this.setState({ cardRevs: nx, replyTo: null, replyDraft: '' });
          this.toast(PL ? 'Odpowiedź opublikowana pod opinią.' : 'Reply published under the review.'); } })),
      saveCardLabel: PL ? 'Zapisz wizytówkę' : 'Save card',
      saveCard: () => { this.setState({ cardEdit: false }); this.toast(PL ? 'Wizytówka zapisana. Goście widzą zmiany od razu.' : 'Card saved. Guests see it right away.'); },
      cardFoot: PL ? 'Nazwę, adres i godziny zaciągamy z Google — zmieniasz je w zakładce Dane. Opis, relacje i odpowiedzi na opinie należą do ciebie.' : 'Name, address and hours come from Google — change them in Details. The description, stories and replies are yours.',
      /* ══ POLECANE LOKALE (FIRMA) ══ */
      partHead: PL ? 'Kogo polecasz gościom' : 'Who you recommend',
      partIntro: PL ? 'Twoi goście zobaczą te lokale na dole twojej wizytówki. Jeśli tamten lokal poleci ciebie, obie wizytówki dostają znaczek „Polecacie się".' : 'Your guests see these at the bottom of your card. If they recommend you back, both cards get a mutual badge.',
      myPartners: myPart.map((p, i) => ({
        name: p.name, grad: p.grad, delay: (i * 70) + 'ms',
        meta: p.catLabel + ' · ' + p.district,
        mutual: ((st.partners || {})[p.id] || []).indexOf(myId) > -1,
        mutualLabel: PL ? 'POLECA CIĘ' : 'RECOMMENDS YOU',
        oneWay: ((st.partners || {})[p.id] || []).indexOf(myId) < 0,
        oneWayLabel: PL ? 'Jeszcze nie odwzajemnił' : 'Not reciprocated yet',
        remove: () => { const nx = Object.assign({}, this.state.partners);
          nx[myId] = (nx[myId] || []).filter((x) => x !== p.id); this.setState({ partners: nx });
          this.toast(PL ? p.name + ' zdjęty z poleconych.' : p.name + ' removed.'); } })),
      myPartnersEmpty: myPart.length === 0,
      partEmptyText: PL ? 'Nikogo jeszcze nie polecasz. Zacznij od sąsiada, u którego twoi goście i tak bywają.' : 'You recommend nobody yet. Start with the neighbour your guests already visit.',
      partAddLabel: PL ? 'Dodaj lokal do poleconych' : 'Add a venue',
      openPartners: () => this.setState({ partnersOpen: true }),
      closePartners: () => this.setState({ partnersOpen: false }),
      partnersOpen: !!st.partnersOpen,
      partPickTitle: PL ? 'Kogo polecasz?' : 'Who do you recommend?',
      partPickNote: PL ? 'Widzisz tylko lokale z kontem w TAPI — dzięki temu gość odbierze u nich kupon tak samo jak u ciebie.' : 'Only venues with a TAPI account — so your guest redeems there exactly as here.',
      partCandidates: this.venues.filter((x) => x.id !== myId).map((x, i) => {
        const on = (((st.partners || {})[myId]) || []).indexOf(x.id) > -1;
        return { name: x.name, grad: x.grad, meta: x.catLabel + ' · ' + x.district, delay: (i * 60) + 'ms',
          on: on, rowBg: on ? (th.dark ? ac.softDark : ac.soft) : th.surf, rowBorder: on ? at : th.hair,
          boxBg: on ? ac.hex : 'transparent', boxBorder: on ? ac.hex : th.hair,
          theyDo: ((st.partners || {})[x.id] || []).indexOf(myId) > -1,
          theyDoLabel: PL ? 'Ten lokal już cię poleca' : 'Already recommends you',
          toggle: () => { const nx = Object.assign({}, this.state.partners);
            const cur = (nx[myId] || []).slice();
            const k = cur.indexOf(x.id);
            if (k > -1) cur.splice(k, 1); else cur.push(x.id);
            nx[myId] = cur; this.setState({ partners: nx }); } }; }),
      partDoneLabel: PL ? 'Gotowe' : 'Done',
      inboundHead: PL ? 'Kto poleca ciebie' : 'Who recommends you',
      inbound: inb.map((p, i) => ({ name: p.name, grad: p.grad, delay: (i * 60) + 'ms',
        meta: p.catLabel + ' · ' + p.district,
        back: (((st.partners || {})[myId]) || []).indexOf(p.id) > -1,
        notBack: (((st.partners || {})[myId]) || []).indexOf(p.id) < 0,
        backLabel: PL ? 'Odwzajemnione' : 'Reciprocated',
        addLabel: PL ? 'Odwzajemnij' : 'Recommend back',
        add: () => { const nx = Object.assign({}, this.state.partners);
          nx[myId] = ((nx[myId] || []).concat([p.id]));
          this.setState({ partners: nx });
          this.toast(PL ? p.name + ' dodany do twoich poleconych.' : p.name + ' added.'); } })),
      inboundEmpty: inb.length === 0,
      inboundEmptyText: PL ? 'Jeszcze nikt cię nie poleca. Poleć kogoś pierwszy — w praktyce większość odwzajemnia.' : 'Nobody recommends you yet. Recommend first — most reciprocate.',
      bizStats: [
        { pl: 'SKANY W TYM TYGODNIU', en: 'SCANS THIS WEEK', v: '218', d: '+18%' },
        { pl: 'ODEBRANE NAGRODY', en: 'REWARDS REDEEMED', v: '96', d: '+31%' },
        { pl: 'NOWI GOŚCIE', en: 'NEW GUESTS', v: '54', d: '+12%' },
        { pl: 'ŚREDNI RACHUNEK', en: 'AVERAGE SPEND', v: '87 zł', d: '+6 zł' }
      ].map((k, i) => ({ label: PL ? k.pl : k.en, value: k.v, trend: k.d, delay: (i * 60) + 'ms', trendFg: at })),
      weekTitle: PL ? 'Skany dzień po dniu' : 'Scans day by day',
      weekTotal: PL ? '218 skanów · 7 dni' : '218 scans · 7 days',
      weekBars: [['Pn', 18], ['Wt', 24], ['Śr', 31], ['Cz', 44], ['Pt', 52], ['So', 29], ['Nd', 20]].map((b, i) => ({
        day: PL ? b[0] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i],
        h: Math.round((b[1] / 52) * 84) + 'px', val: String(b[1]), delay: (i * 70) + 'ms',
        bg: b[1] >= 44 ? ac.hex : (th.dark ? ac.softDark : ac.soft), fg: b[1] >= 44 ? at : th.sub })),
      proLocked: st.plan === 'base' && !st.trial,
      lockVeil: th.dark ? 'rgba(20,22,26,0.72)' : 'rgba(244,242,237,0.76)',
      lockTitle: PL ? 'Godziny szczytu — w PRO' : 'Peak hours — on PRO',
      lockSub: PL ? 'Zobacz, o której gość faktycznie wchodzi, i ustaw happy hour pod ruch.' : 'See when guests actually walk in and time your happy hour.',
      lockTitle2: PL ? 'Lejek gości — w PRO' : 'Guest funnel — on PRO',
      lockSub2: PL ? 'Od wyświetlenia wizytówki do odebranej nagrody — gdzie tracisz gościa.' : 'From card view to redeemed reward — where you lose the guest.',
      lockCta: PL ? 'Wypróbuj 2 tygodnie za 0 zł' : 'Try 2 weeks free',
      peakTitle: PL ? 'Godziny szczytu' : 'Peak hours',
      peakRows: [['18–20', 34], ['20–22', 68], ['22–24', 100], ['00–02', 46]].map((p, i) => ({
        label: p[0], w: p[1] + '%', delay: (i * 70) + 'ms',
        bg: p[1] >= 90 ? ac.hex : (th.dark ? ac.softDark : ac.soft),
        value: Math.round(p[1] * 0.62) + (PL ? ' skanów' : ' scans') })),
      funnelTitle: PL ? 'Od wyświetlenia do wizyty' : 'From view to visit',
      funnelRows: [
        { pl: 'Wyświetlenia wizytówki', en: 'Card views', v: '1 420', w: '100%' },
        { pl: 'Skany naklejki QR', en: 'QR sticker scans', v: '218', w: '62%' },
        { pl: 'Wydane kupony', en: 'Coupons issued', v: '141', w: '44%' },
        { pl: 'Odebrane w lokalu', en: 'Redeemed on site', v: '96', w: '30%' }
      ].map((f, i) => ({ label: PL ? f.pl : f.en, value: f.v, w: f.w, delay: (i * 70) + 'ms',
        bg: i === 3 ? ac.hex : (th.dark ? ac.softDark : ac.soft), fg: i === 3 ? '#FBFAF7' : th.ink })),
      rewardHead: PL ? 'Odbierz nagrodę gościa' : 'Redeem a guest reward',
      rewardHeadSub: PL ? 'Skan kuponu albo 4 cyfry — dwa dotknięcia, bez papierologii.' : 'Scan the coupon or type 4 digits — two taps, no paperwork.',
      rewardStats: [
        { pl: 'WYDANE DZIŚ', en: 'ISSUED TODAY', v: '14' },
        { pl: 'ODEBRANE DZIŚ', en: 'REDEEMED', v: '9' },
        { pl: 'CZEKA', en: 'PENDING', v: '5' }
      ].map((r, i) => ({ label: PL ? r.pl : r.en, value: r.v, delay: (i * 60) + 'ms' })),
      rewardList: (st.coupons || []).map((r, i) => ({
        name: PL ? r.pl : (r.en || r.pl), cond: PL ? r.cpl : (r.cen || r.cpl),
        w: Math.min(100, Math.round((r.n / Math.max(1, r.limit || 80)) * 100)) + '%', delay: (i * 70) + 'ms',
        count: r.n + (PL ? ' odebrań' : ' redeemed') + (r.limit ? ' / ' + r.limit : ''),
        chip: r.on ? (PL ? 'AKTYWNY' : 'ACTIVE') : (PL ? 'WSTRZYMANY' : 'PAUSED'),
        chipBg: r.on ? ac.hex : th.hair, chipFg: r.on ? '#FBFAF7' : th.sub,
        toggle: () => { const nx = (this.state.coupons || []).slice();
          nx[i] = Object.assign({}, nx[i], { on: !nx[i].on });
          this.setState({ coupons: nx });
          this.toast(nx[i].on ? (PL ? 'Kupon aktywny — goście już go widzą.' : 'Coupon live — guests see it now.')
            : (PL ? 'Kupon wstrzymany. Wydane kupony zostają ważne.' : 'Coupon paused. Issued coupons stay valid.')); },
        toggleLabel: r.on ? (PL ? 'Wstrzymaj' : 'Pause') : (PL ? 'Włącz' : 'Activate'),
        drop: () => { this.setState({ coupons: (this.state.coupons || []).filter((_, k) => k !== i) });
          this.toast(PL ? 'Kupon usunięty.' : 'Coupon deleted.'); } })),
      couponsEmpty: (st.coupons || []).length === 0,
      couponsEmptyText: PL ? 'Nie masz jeszcze kuponu. Bez niego skan naklejki nic gościowi nie daje.' : 'No coupon yet. Without one, scanning your sticker gives the guest nothing.',
      addCouponLabel: PL ? 'Dodaj kupon' : 'Add a coupon',
      openCoupon: () => this.setState({ couponOpen: true, cDraft: { name: '', cond: 0, limit: 0, days: 0 } }),
      closeCoupon: () => this.setState({ couponOpen: false }),
      couponOpen: !!st.couponOpen,
      cTitle: PL ? 'Nowy kupon' : 'New coupon',
      cNote: PL ? 'Gość dostaje go po zeskanowaniu naklejki. Ty odbierasz kod przy barze — nic więcej nie trzeba ustawiać.' : 'The guest gets it after scanning your sticker. You redeem the code at the bar — nothing else to set up.',
      cNameLabel: PL ? 'Co dostaje gość' : 'What the guest gets',
      cNamePh: PL ? 'np. Kieliszek wina domu' : 'e.g. House glass of wine',
      cName: (st.cDraft || {}).name || '',
      setCName: (e) => this.setState({ cDraft: Object.assign({}, this.state.cDraft, { name: e.target.value }) }),
      cQuick: [
        { pl: 'Kieliszek wina domu', en: 'House glass of wine' },
        { pl: 'Kawa gratis', en: 'Free coffee' },
        { pl: '−20% na kartę', en: '20% off the menu' },
        { pl: 'Deser od szefa', en: 'Dessert on the house' }
      ].map((q) => ({ label: PL ? q.pl : q.en,
        pick: () => this.setState({ cDraft: Object.assign({}, this.state.cDraft, { name: PL ? q.pl : q.en }) }) })),
      cCondLabel: PL ? 'Kto go dostaje' : 'Who gets it',
      cConds: [
        { pl: 'Za pierwszy skan', en: 'For a first scan' },
        { pl: 'Za każdy skan', en: 'For every scan' },
        { pl: 'Od trzeciej wizyty', en: 'From the third visit' },
        { pl: 'Pn–Cz do 20:00', en: 'Mon–Thu until 8 pm' }
      ].map((c, k) => { const on = ((st.cDraft || {}).cond || 0) === k; return { label: PL ? c.pl : c.en,
        bg: on ? (th.dark ? ac.softDark : ac.soft) : th.surf, border: on ? at : th.hair, fg: on ? at : th.sub,
        pick: () => this.setState({ cDraft: Object.assign({}, this.state.cDraft, { cond: k }) }) }; }),
      cLimitLabel: PL ? 'Limit sztuk' : 'How many',
      cLimits: [{ v: 0, pl: 'Bez limitu', en: 'No limit' }, { v: 50, pl: '50', en: '50' }, { v: 100, pl: '100', en: '100' }, { v: 250, pl: '250', en: '250' }]
        .map((l) => { const on = ((st.cDraft || {}).limit || 0) === l.v; return { label: PL ? l.pl : l.en,
          bg: on ? th.ink : th.surf, fg: on ? th.paper : th.sub, border: on ? th.ink : th.hair,
          pick: () => this.setState({ cDraft: Object.assign({}, this.state.cDraft, { limit: l.v }) }) }; }),
      cDaysLabel: PL ? 'Ważność kuponu u gościa' : 'How long the guest has',
      cDays: [{ v: 0, pl: '15 minut', en: '15 minutes' }, { v: 1, pl: 'Do końca dnia', en: 'Until end of day' }, { v: 7, pl: '7 dni', en: '7 days' }]
        .map((d) => { const on = ((st.cDraft || {}).days || 0) === d.v; return { label: PL ? d.pl : d.en,
          bg: on ? th.ink : th.surf, fg: on ? th.paper : th.sub, border: on ? th.ink : th.hair,
          pick: () => this.setState({ cDraft: Object.assign({}, this.state.cDraft, { days: d.v }) }) }; }),
      cPreviewHead: PL ? 'TAK ZOBACZY TO GOŚĆ' : 'HOW THE GUEST SEES IT',
      cPreviewName: ((st.cDraft || {}).name || '').trim() || (PL ? 'Nazwa kuponu' : 'Coupon name'),
      cPreviewCond: [PL ? 'Za pierwszy skan' : 'For a first scan', PL ? 'Za każdy skan' : 'For every scan',
        PL ? 'Od trzeciej wizyty' : 'From the third visit', PL ? 'Pn–Cz do 20:00' : 'Mon–Thu until 8 pm'][(st.cDraft || {}).cond || 0],
      cPreviewValid: [(PL ? 'ważny 15 minut' : 'valid 15 minutes'), (PL ? 'ważny do końca dnia' : 'valid until end of day'), (PL ? 'ważny 7 dni' : 'valid 7 days')][[0, 1, 7].indexOf((st.cDraft || {}).days || 0)],
      cSaveLabel: PL ? 'Opublikuj kupon' : 'Publish coupon',
      saveCoupon: () => { const d = this.state.cDraft || {};
        const nm = (d.name || '').trim();
        if (!nm) { this.toast(PL ? 'Napisz, co dostaje gość.' : 'Say what the guest gets.'); return; }
        const conds = [['Za pierwszy skan naklejki', 'For a first sticker scan'], ['Za każdy skan naklejki', 'For every sticker scan'],
          ['Od trzeciej wizyty', 'From the third visit'], ['Pn–Cz do 20:00', 'Mon–Thu until 8 pm']];
        const c = conds[d.cond || 0];
        const nx = [{ pl: nm, en: nm, cpl: c[0], cen: c[1], n: 0, limit: d.limit || 0, on: true }].concat(this.state.coupons || []);
        this.setState({ coupons: nx, couponOpen: false });
        this.toast(PL ? 'Kupon opublikowany. Goście zobaczą go przy następnym skanie.' : 'Coupon published. Guests see it on their next scan.'); },
      recentTitle: PL ? 'Ostatnio odebrane' : 'Recently redeemed',
      recentRows: [
        { i: 'K', pl: 'Klara Z. · Kieliszek wina', en: 'Klara Z. · Glass of wine', t: '18:12' },
        { i: 'M', pl: 'Marek W. · −20% na kartę', en: 'Marek W. · 20% off', t: '17:48' },
        { i: 'A', pl: 'Ada L. · Deser od szefa', en: 'Ada L. · Dessert on the house', t: '17:05' }
      ].map((r, i) => ({ initial: r.i, text: PL ? r.pl : r.en, time: r.t, delay: (i * 60) + 'ms' })),

      /* ══ ODBIÓR NAGRODY ══ */
      redeemOpen: !!st.redeemOpen,
      bizAccount: !!st.bizAccount,
      bizRedeemCta: PL ? 'Jesteś firmą — odbierz kupon gościa' : 'You are a business — redeem a coupon',
      bizRedeemSub: PL ? 'Skan albo 4 cyfry z ekranu gościa' : 'Scan or 4 digits from the guest screen',
      openRedeem: () => this.setState({ redeemOpen: true, redeemMode: 'scan', redeemState: 'idle', redeemCode: '' }),
      closeRedeem: () => { clearTimeout(this.rT); this.setState({ redeemOpen: false, redeemState: 'idle', redeemCode: '' }); },
      redeemTitle: PL ? 'Odbierz nagrodę' : 'Redeem a reward',
      rPick: st.redeemState === 'idle',
      rScan: (st.redeemMode || 'scan') === 'scan' && st.redeemState === 'idle',
      rCode: st.redeemMode === 'code' && st.redeemState === 'idle',
      rBusy: st.redeemState === 'busy', rOk: st.redeemState === 'ok', rBad: st.redeemState === 'bad',
      redeemModes: [
        { id: 'scan', pl: 'Skanuj kupon', en: 'Scan coupon' },
        { id: 'code', pl: 'Kod 4 cyfry', en: '4-digit code' }
      ].map((m) => { const on = (st.redeemMode || 'scan') === m.id; return { label: PL ? m.pl : m.en,
        bg: on ? '#FBFAF7' : 'transparent', fg: on ? '#14161A' : 'rgba(244,242,237,0.6)',
        pick: () => this.setState({ redeemMode: m.id, redeemState: 'idle', redeemCode: '' }) }; }),
      rScanHint: PL ? 'Poproś gościa o pokazanie kuponu w aplikacji. Kamera odczyta go sama.' : 'Ask the guest to show the coupon. The camera reads it.',
      rScanBtn: PL ? 'Symuluj skan kuponu' : 'Simulate coupon scan',
      doRedeemScan: () => { clearTimeout(this.rT); this.setState({ redeemState: 'busy' });
        this.rT = setTimeout(() => this.setState({ redeemState: 'ok' }), 1050); },
      rCodeHint: PL ? 'Gość czyta 4 cyfry z ekranu kuponu — wpisz je tutaj.' : 'The guest reads 4 digits from the coupon — type them here.',
      rCells: [0, 1, 2, 3].map((i) => ({ ch: (st.redeemCode || '')[i] || '',
        border: (st.redeemCode || '').length === i ? '#57C39F' : 'rgba(244,242,237,0.16)' })),
      rKeypad: ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok'].map((k) => ({
        label: k === 'del' ? '←' : (k === 'ok' ? '✓' : k),
        bg: k === 'ok' ? '#57C39F' : 'rgba(244,242,237,0.07)',
        fg: k === 'ok' ? '#14161A' : '#F4F2ED',
        tap: () => { const c = st.redeemCode || '';
          if (k === 'del') { this.setState({ redeemCode: c.slice(0, -1) }); return; }
          if (k === 'ok') { if (c.length < 4) return; clearTimeout(this.rT); this.setState({ redeemState: 'busy' });
            this.rT = setTimeout(() => this.setState({ redeemState: c === '0000' ? 'bad' : 'ok' }), 900); return; }
          if (c.length >= 4) return;
          this.setState({ redeemCode: c + k }); } })),
      rBusyLabel: PL ? 'SPRAWDZAM KUPON' : 'CHECKING COUPON',
      rOkTitle: PL ? 'Nagroda odebrana' : 'Reward redeemed',
      rOkReward: PL ? 'Kieliszek wina domu' : 'House glass of wine',
      rOkGuest: PL ? 'Klara Z. · pierwsza wizyta' : 'Klara Z. · first visit',
      rOkNote: PL ? 'Zapisane w statystykach. Gość widzi potwierdzenie w swojej aplikacji.' : 'Saved to your stats. The guest sees the confirmation in the app.',
      rOkBtn: PL ? 'Gotowe' : 'Done',
      rNext: PL ? 'Następny gość' : 'Next guest',
      rBadTitle: PL ? 'Kupon nieważny' : 'Coupon not valid',
      rBadNote: PL ? 'Kod wygasł albo został już odebrany. Poproś gościa o odświeżenie kuponu.' : 'The code expired or was already used. Ask the guest to refresh it.',
      rAgain: PL ? 'Spróbuj ponownie' : 'Try again',
      redeemAgain: () => this.setState({ redeemState: 'idle', redeemCode: '' }),
      finishRedeem: () => { clearTimeout(this.rT); this.setState({ redeemOpen: false, redeemState: 'idle', redeemCode: '' });
        this.toast(PL ? 'Nagroda odebrana. Statystyki zaktualizowane.' : 'Reward redeemed. Stats updated.'); },

      /* ══ POMOC ══ */
      openHelp: () => this.setState({ helpOpen: true }),
      setBizLoginTab: () => this.setState({ bizLoginTab: 'login' }),
      setBizRegisterTab: () => this.setState({ bizLoginTab: 'register' }),
      isBizLoginActive: st.bizLoginTab !== 'register',
      isBizRegisterActive: st.bizLoginTab === 'register',
      bizLoginTabBg: st.bizLoginTab !== 'register' ? 'var(--acc, #1F5A46)' : 'transparent',
      bizLoginTabFg: st.bizLoginTab !== 'register' ? '#FBFAF7' : 'var(--sub, #6C6F75)',
      bizRegisterTabBg: st.bizLoginTab === 'register' ? 'var(--acc, #1F5A46)' : 'transparent',
      bizRegisterTabFg: st.bizLoginTab === 'register' ? '#FBFAF7' : 'var(--sub, #6C6F75)',
      tBizLoginTab: this.l3('Zaloguj się', 'Sign in', 'Accedi'),
      tBizRegisterTab: this.l3('Zarejestruj lokal', 'Register venue', 'Registra locale'),
      loginBizDirect: () => this.setState({ phase: 'biz', biz: 'panel', bizAccount: true }),
      openFriendsHub: () => this.setState({ friendsOpen: true }),
      closeFriendsHub: () => this.setState({ friendsOpen: false }),
      setFriendsTabRanking: () => this.setState({ friendsTab: 'ranking' }),
      setFriendsTabNear: () => this.setState({ friendsTab: 'near' }),
      setFriendsTabInvite: () => this.setState({ friendsTab: 'invite' }),
      friendsIsRanking: st.friendsTab === 'ranking',
      friendsIsNear: st.friendsTab === 'near',
      friendsIsInvite: st.friendsTab === 'invite',
      friendsTabRankingBg: st.friendsTab === 'ranking' ? 'var(--acc, #1F5A46)' : 'transparent',
      friendsTabRankingFg: st.friendsTab === 'ranking' ? '#FBFAF7' : 'var(--sub, #6C6F75)',
      friendsTabNearBg: st.friendsTab === 'near' ? 'var(--acc, #1F5A46)' : 'transparent',
      friendsTabNearFg: st.friendsTab === 'near' ? '#FBFAF7' : 'var(--sub, #6C6F75)',
      friendsTabInviteBg: st.friendsTab === 'invite' ? 'var(--acc, #1F5A46)' : 'transparent',
      friendsTabInviteFg: st.friendsTab === 'invite' ? '#FBFAF7' : 'var(--sub, #6C6F75)',
      copyGroupInvite: () => this.setState({ inviteCopied: true }),
      copyInviteLabel: st.inviteCopied ? this.l3('Skopiowano', 'Copied', 'Copiato') : this.l3('Kopiuj kod', 'Copy code', 'Copia codice'),
      openGroupInviteVenue: (v) => this.setState({ groupInviteOpen: true, inviteVenue: v && v.name ? v.name : st.inviteVenue }),
      setSavedTabSaved: () => this.setState({ savedTab: 'saved' }),
      setSavedTabFollowed: () => this.setState({ savedTab: 'followed' }),
      setSavedTabCols: () => this.setState({ savedTab: 'cols' }),
      savedIsFollowed: st.savedTab === 'followed',
      savedListCount: (st.savedIds || []).length,
      tabSavedBg: st.savedTab === 'saved' ? 'var(--acc, #1F5A46)' : 'transparent',
      tabSavedFg: st.savedTab === 'saved' ? '#FBFAF7' : 'var(--sub, #6C6F75)',
      tabFollowedBg: st.savedTab === 'followed' ? 'var(--acc, #1F5A46)' : 'transparent',
      tabFollowedFg: st.savedTab === 'followed' ? '#FBFAF7' : 'var(--sub, #6C6F75)',
      tabColsBg: st.savedTab === 'cols' ? 'var(--acc, #1F5A46)' : 'transparent',
      tabColsFg: st.savedTab === 'cols' ? '#FBFAF7' : 'var(--sub, #6C6F75)',
      vSavedBg: (st.savedIds || []).indexOf(st.pin) > -1 ? 'var(--acc, #1F5A46)' : 'var(--surf, #FFF)',
      vSavedFg: (st.savedIds || []).indexOf(st.pin) > -1 ? '#FBFAF7' : 'var(--ink, #16181C)',
      vSavedLabel: (st.savedIds || []).indexOf(st.pin) > -1 ? this.l3('Zapisane', 'Saved', 'Salvato') : this.l3('Zapisz', 'Save', 'Salva'),
      followText: this.l3('Obserwuj', 'Follow', 'Segui'),
      filterHighlights: () => this.setState({ sortOpen: true }),
      closeMapToDiscover: () => this.setState({ tab: 'discover' }),
      closeHelp: () => this.setState({ helpOpen: false }),
      helpOpen: st.helpOpen,
      helpTitle: st.phase === 'biz' ? (PL ? 'Jak przebiega rejestracja?' : 'How does registration work?')
        : st.tab === 'map' ? (PL ? 'Jak czytać mapę?' : 'How to read the map?')
        : st.tab === 'trip' ? (PL ? 'Jak działa plan wyjazdu?' : 'How does the trip plan work?')
        : st.tab === 'scan' ? (PL ? 'Co daje skanowanie?' : 'What does scanning give me?')
        : st.tab === 'profile' ? (PL ? 'Co masz w profilu?' : 'What is in your profile?')
        : (PL ? 'Na czym polega odkrywanie?' : 'How does discovering work?'),
      helpCta: PL ? 'Jasne, zaczynam' : 'Got it',
      helpSteps: (st.phase === 'biz' ? [
        { n: '1', title: PL ? 'Znajdź lokal w Google' : 'Find your venue on Google', body: PL ? 'Wpisujesz nazwę i wybierasz swoją wizytówkę. Nazwę, adres, godziny i zdjęcia zaciągamy automatycznie.' : 'Type the name and pick your listing. Name, address, hours and photos come across automatically.' },
        { n: '2', title: PL ? 'Potwierdź, że lokal jest twój' : 'Prove the venue is yours', body: PL ? 'Link na e-mail z wizytówki, telefon, SMS albo dokument — wybierasz sposób.' : 'A link to the listing e-mail, a call, an SMS or a document — you pick.' },
        { n: '3', title: PL ? 'Tydzień PRO za 0 zł' : 'A week of PRO free', body: PL ? 'Wszystkie narzędzia od razu. Rezygnacja jednym kliknięciem, bez okresu wypowiedzenia.' : 'Every tool right away. Cancel in one click, no notice period.' },
        { n: '4', title: PL ? 'Naklejka w witrynie' : 'Sticker in the window', body: PL ? 'Wysyłamy naklejkę QR. Gość skanuje, dostaje kupon, ty widzisz to w statystykach.' : 'We ship the QR sticker. The guest scans, gets a coupon, you see it in your stats.' }
      ] : st.tab === 'map' ? [
        { n: '1', title: PL ? 'Miasto pod mgłą' : 'The city under fog', body: PL ? 'Kwartały, w których nie byłeś, są wyszarzone. Lokale w mgle pozostają ukryte.' : 'Districts you have not walked are greyed out. Venues in the fog stay hidden.' },
        { n: '2', title: PL ? 'Pinezki i szybki podgląd' : 'Pins and quick preview', body: PL ? 'Dotknij pinezki — zobaczysz ocenę, dystans i zdjęcia bez wychodzenia z mapy.' : 'Tap a pin — rating, distance and photos without leaving the map.' },
        { n: '3', title: PL ? 'Powiadomienia o bliskości' : 'Proximity alerts', body: PL ? 'Włącz jednym przełącznikiem — damy znać, gdy miniesz nieodkryte miejsce w promieniu 200 m.' : 'One toggle — we ping you when you pass an undiscovered spot within 200 m.' }
      ] : st.tab === 'trip' ? [
        { n: '1', title: PL ? 'Powiedz nam cztery rzeczy' : 'Tell us four things', body: PL ? 'Ile dni, jaki budżet, jakie tempo i z kim jedziesz. Nic więcej nie musisz wypełniać.' : 'How many days, what budget, what pace and who is coming. Nothing else to fill in.' },
        { n: '2', title: PL ? 'Dostajesz rozpiskę godzinową' : 'You get an hourly plan', body: PL ? 'Poranek, popołudnie i wieczór na każdy dzień, z czasem przejścia i ceną wejścia.' : 'Morning, afternoon and evening for each day, with walking time and entry price.' },
        { n: '3', title: PL ? 'Zamieniasz, co ci nie pasuje' : 'Swap what does not fit', body: PL ? 'Każdy punkt można wymienić na inny albo wyrzucić — plan przelicza się sam.' : 'Swap or drop any stop — the plan recalculates itself.' }
      ] : st.tab === 'scan' ? [
        { n: '1', title: PL ? 'Naklejka działa 24/7' : 'The sticker works 24/7', body: PL ? 'Skanujesz kod w witrynie także wtedy, gdy lokal jest zamknięty.' : 'Scan the code in the window even when the venue is closed.' },
        { n: '2', title: PL ? 'Kupon na 15 minut' : 'A 15-minute coupon', body: PL ? 'Nagroda pojawia się od razu. Pokazujesz kod obsłudze — 4 cyfry albo QR.' : 'The reward shows up instantly. Show the code to the staff — 4 digits or a QR.' },
        { n: '3', title: PL ? 'Odznaka za dzielnicę' : 'A badge per district', body: PL ? 'Każdy nowy skan odsłania kwartał na mapie i dodaje odznakę do profilu.' : 'Every new scan uncovers a district on the map and adds a badge to your profile.' }
      ] : st.tab === 'profile' ? [
        { n: '1', title: PL ? 'Zapisane i kupony' : 'Saved and coupons', body: PL ? 'Wszystko, co zapisałeś zakładką, i każdy aktywny kupon w jednej zakładce.' : 'Everything you bookmarked and every live coupon in one tab.' },
        { n: '2', title: PL ? 'Twoje dane' : 'Your details', body: PL ? 'Dotknij ołówka, żeby edytować. Zapisz pojawia się tylko wtedy, gdy naprawdę coś zmieniłeś.' : 'Tap the pencil to edit. Save appears only when something really changed.' },
        { n: '3', title: PL ? 'Język i wygląd' : 'Language and look', body: PL ? 'Język ustawia się sam z twojej lokalizacji, ale możesz wybrać dowolny z listy.' : 'The language follows your location, but you can pick any from the list.' }
      ] : [
        { n: '1', title: PL ? 'Miasto jest zamglone' : 'The city starts foggy', body: PL ? 'Na starcie mapa jest wyszarzona. Widzisz tylko to, co już odwiedziłeś.' : 'The map is greyed out at first. You only see what you have already visited.' },
        { n: '2', title: PL ? 'Chodzisz — odkrywasz' : 'Walk to uncover', body: PL ? 'Każdy nowy kwartał odsłania się, gdy się w nim znajdziesz. Lokale w mgle są ukryte.' : 'Each new block clears when you get there. Venues in the fog stay hidden.' },
        { n: '3', title: PL ? 'Skanujesz i zbierasz' : 'Scan and collect', body: PL ? 'Naklejka QR w witrynie daje kupon i odznakę dzielnicy. Powiadomimy cię, gdy będziesz obok czegoś nowego.' : 'The window QR sticker gives a coupon and a district badge. We ping you when something new is nearby.' }
      ]).map((h, i) => ({ n: h.n, title: h.title, body: h.body, delay: (i * 70) + 'ms' })),

      /* ══ ZAINTERESOWANIA ══ */
      interestsCard: st.phase === 'app' && st.tab === 'discover' && !st.interestsSaved && st.interestsOpen,
      interestsSet: st.phase === 'app' && st.tab === 'discover' && st.interestsSaved,
      openInterests: () => this.setState({ interestsSaved: false, interestsOpen: true }),
      intBtnLabel: PL ? 'Znajdź, co cię interesuje' : 'Find what you are into',
      intBtnSub: st.interestsSaved && iLabels.length ? iLabels.join(' · ') : (PL ? 'Kawa, wino, koncerty, targi, kino…' : 'Coffee, wine, gigs, markets, cinema…'),
      intBtnBorder: st.interestsSaved ? 'transparent' : at,
      intTitle: PL ? 'Co cię interesuje?' : 'What are you into?',
      intSub: PL ? 'Wybierz kilka rzeczy — dopasujemy kanał i wyślemy powiadomienie, gdy coś takiego pojawi się obok.' : 'Pick a few — we tune your feed and ping you when something like it pops up nearby.',
      interestChips: this.interestDefs.map((d) => {
        const on = st.interests.indexOf(d.id) > -1;
        return { label: PL ? d.pl : d.en, on: on,
          bg: on ? ac.hex : th.surf, fg: on ? '#FBFAF7' : th.sub, border: on ? ac.hex : th.hair,
          toggle: () => this.setState({ interests: on ? st.interests.filter((x) => x !== d.id) : st.interests.concat([d.id]) }) };
      }),
      intCta: st.interests.length ? (PL ? 'Włącz powiadomienia (' + st.interests.length + ')' : 'Turn on alerts (' + st.interests.length + ')') : (PL ? 'Wybierz choć jedno' : 'Pick at least one'),
      intCtaBg: st.interests.length ? ac.hex : th.hair,
      intCtaFg: st.interests.length ? '#FBFAF7' : th.sub,
      intSkip: PL ? 'Później' : 'Later',
      saveInterests: () => {
        if (!st.interests.length) return;
        const first = this.interestDefs.filter((d) => d.id === st.interests[0])[0];
        this.setState({ interestsSaved: true, cat: first ? first.cat : 'all' });
        this.toast(PL ? 'Gotowe. Damy znać, gdy pojawi się coś z twoich kategorii.' : 'Done. We will ping you when something matches.');
      },
      skipInterests: () => this.setState({ interestsOpen: false }),
      editInterests: () => this.setState({ interestsSaved: false, interestsOpen: true }),
      intActive: (PL ? 'Twoje kategorie: ' : 'Your interests: ') + this.interestDefs.filter((d) => st.interests.indexOf(d.id) > -1).map((d) => PL ? d.pl : d.en).join(', '),
      intEdit: PL ? 'Zmień' : 'Edit',

      /* ══ MAPA ══ */
      mapFail: !!st.mapFail,
      mapFailTitle: PL ? 'Nie udało się załadować mapy' : 'The map could not load',
      mapFailBody: PL ? 'Sprawdź połączenie i spróbuj ponownie — reszta aplikacji działa normalnie.' : 'Check your connection and try again — the rest of the app works fine.',
      mapFailCta: PL ? 'Spróbuj ponownie' : 'Try again',
      mapRetry: () => { const s = document.getElementById('leaflet-js'); if (s) s.remove(); this.setState({ mapFail: false }); },
      mapSearchRef: this.mapSearchRef, fogRef: this.fogRef, popRef: this.popRef,
      fogColor: th.dark ? 'rgba(8,10,13,0.66)' : 'rgba(144,148,155,0.5)',
      mapBurst: !!st.mapBurst,
      geoOn: !!st.geoAllowed, geoOff: !st.geoAllowed,
      progHead: this.l3('Odkryta mapa', 'Map uncovered', 'Mappa svelata'),
      progCity: this.l3('Kraków · jesteś w Kazimierzu', 'Kraków · you are in Kazimierz', 'Cracovia · sei a Kazimierz'),
      progPct: this.mapProgress().pct + '%',
      progPctLabel: String(this.mapProgress().pct),
      progRingDash: ((this.mapProgress().pct / 100) * 106.8).toFixed(1) + ' 106.8',
      progInline: (() => { const m = this.mapProgress();
        if (!st.geoAllowed) return this.l3('Włącz lokalizację, żeby odsłaniać miasto.', 'Turn on location to uncover the city.', 'Attiva la posizione per svelare la città.');
        return m.areas + '/' + m.allAreas + ' ' + this.l3('kwartałów', 'blocks', 'quartieri') + ' · '
          + m.visited + '/' + m.total + ' ' + this.l3('miejsc', 'places', 'locali'); })(),
      progStats: (() => { const m = this.mapProgress(); return [
        { v: m.areas + '/' + m.allAreas, k: this.l3('kwartały', 'blocks', 'quartieri'), delay: '0ms' },
        { v: m.visited + '/' + m.total, k: this.l3('miejsca', 'places', 'locali'), delay: '70ms' },
        { v: String((st.savedIds || []).length), k: this.l3('zapisane', 'saved', 'salvati'), delay: '140ms' }
      ]; })(),
      progHint: this.l3('Idź dalej — każdy nowy kwartał to +30 pkt i nowe lokale na mapie.',
        'Keep walking — every new block is +30 pts and more venues on the map.',
        'Continua a camminare — ogni nuovo quartiere vale +30 punti e nuovi locali.'),
      progOffHint: this.l3('Włącz lokalizację, żeby zacząć odsłaniać miasto.',
        'Turn on location to start uncovering the city.',
        'Attiva la posizione per iniziare a svelare la città.'),
      mapSearchPh: PL ? 'Szukaj na mapie…' : 'Search the map…',
      hasMapQuery: st.mapQ.length > 0,
      onMapQuery: (e) => this.setState({ mapQ: e.target.value }),
      clearMapQuery: () => { if (this.mapSearchRef.current) this.mapSearchRef.current.value = ''; this.setState({ mapQ: '' }); },
      mapCats: [
        { id: 'all', label: t.all }, { id: 'gastro', label: PL ? 'Jedzenie' : 'Food' },
        { id: 'kawa', label: PL ? 'Kawa' : 'Coffee' }, { id: 'noc', label: PL ? 'Wieczorem' : 'Nightlife' },
        { id: 'event', label: PL ? 'Wydarzenia' : 'Events' }
      ].map((c) => ({ label: c.label, bg: st.mapCat === c.id ? th.ink : th.surf, fg: st.mapCat === c.id ? th.paper : th.sub,
        border: st.mapCat === c.id ? th.ink : th.hair, pick: () => this.setState({ mapCat: c.id }) })),
      mapList: mapList.map((x, i) => ({ name: x.name, rating: x.rating.toFixed(1), dist: x.dist, grad: x.grad,
        delay: (i * 60) + 'ms', open: () => this.openPin(x.id) })),
      mapEmpty: mapList.length === 0,
      mapOpen: (st.mapPanel || 'open') === 'open',
      mapClosed: st.mapPanel === 'closed',
      mapUiOpacity: st.mapZooming ? 0.25 : 1,
      openMapPanel: () => this.setState({ mapPanel: 'open' }),
      closeMapPanel: () => this.setState({ mapPanel: 'closed' }),
      sortShort: PL ? 'Wysortuj' : 'Sort',
      pushPillLabel: st.push ? (PL ? 'Powiadomienia włączone' : 'Alerts are on') : (PL ? 'Informuj, gdy będę blisko' : 'Alert me when I am close'),
      pushPillSub: st.push ? (PL ? 'Promień 200 m · nieodkryte miejsca' : '200 m radius · undiscovered spots') : (PL ? 'Jedno dotknięcie, wyłączysz tak samo' : 'One tap, off the same way'),
      pushPillBg: st.push ? ac.hex : th.surf,
      pushPillFg: st.push ? '#FBFAF7' : th.ink,
      pushPillBorder: st.push ? ac.hex : th.hair,
      pushIconBg: st.push ? 'rgba(255,255,255,0.18)' : (th.dark ? ac.softDark : ac.soft),
      pushIconFg: st.push ? '#FBFAF7' : at,
      pushRowBg: st.push ? (th.dark ? ac.softDark : ac.soft) : 'transparent',
      pushRowFg: st.push ? at : th.sub,
      pushBell: st.push ? 'bell 2.8s ease-in-out 1s infinite' : 'none',
      pushKnobSm: st.push ? '16px' : '0px',
      mapListTitle: st.mapQ || st.mapCat !== 'all' ? (PL ? 'Wyniki · ' + mapList.length : 'Results · ' + mapList.length) : t.near,
      geoAsk: st.phase === 'app' && st.tab === 'map' && !st.geoAllowed && !st.geoDismissed,
      geoAskTitle: PL ? 'Odsłoń swoją okolicę' : 'Uncover your area',
      geoAskBody: PL ? 'Mapa jest zamglona, dopóki nie wiemy, gdzie byłeś. Włącz lokalizację, a odkryte kwartały zostaną z tobą na stałe.' : 'The map stays foggy until we know where you have been. Turn on location and explored blocks stay yours.',
      geoAllowLabel: PL ? 'Zezwól na lokalizację' : 'Allow location',
      geoLater: PL ? 'Nie teraz' : 'Not now',
      allowGeo: () => this.allowGeo(),
      dismissGeo: () => this.setState({ geoDismissed: true }),
      pushLabel: PL ? 'Powiadomienia, gdy jestem obok' : 'Alerts when I am nearby',
      pushSub: PL ? 'Push o nieodkrytym miejscu w promieniu 200 m' : 'Push about an undiscovered spot within 200 m',
      pushTrack: st.push ? at : th.hair, pushKnob: st.push ? '18px' : '0px',
      togglePush: () => { this.setState({ push: !st.push }); this.toast(st.push ? (PL ? 'Push wyłączony.' : 'Push off.') : (PL ? 'Damy znać, gdy obok będzie coś nieodkrytego.' : 'We will ping you near undiscovered spots.')); },
      pinOpen: !!st.pin,
      pinScale: st.pinShown ? 'scale(1)' : 'scale(0.18) translateY(14px)',
      pinOpacity: st.pinShown ? 1 : 0,
      pinName: pv ? pv.name : '', pinCat: pv ? this.dt(pv.catLabel) : '', pinDist: pv ? pv.dist : '',
      pinRating: pv ? pv.rating.toFixed(1) : '', pinStars: pv ? '★★★★★'.slice(0, Math.round(pv.rating)) : '',
      pinVotes: pv ? (pv.votes + ' ' + (PL ? 'opinii' : 'reviews')) : '',
      pinCta: PL ? 'Zobacz w Odkrywaj' : 'Open in Discover',
      pinShots: pv ? [{ flex: 1.6, grad: pv.grad }, { flex: 1, grad: pv.grad.replace('150deg', '20deg') }, { flex: 1, grad: pv.grad.replace('150deg', '300deg') }] : [],
      pinCta: PL ? 'Otwórz wizytówkę' : 'Open the card',
      startNavMode: () => { this.setState({ navTransportSelect: true }); },
      cancelNavTransport: () => { this.setState({ navTransportSelect: false }); },
      selectNavTransport: (mode) => {
        let msg = PL ? 'Wytyczanie trasy pieszej...' : 'Calculating walk route...';
        if (mode === 'car') msg = PL ? 'Wytyczanie trasy samochodowej...' : 'Calculating car route...';
        if (mode === 'bike') msg = PL ? 'Wytyczanie trasy rowerowej...' : 'Calculating bike route...';
        if (mode === 'transit') msg = PL ? 'Szukanie połączeń...' : 'Finding transit options...';
        this.setState({ navTransportSelect: false, navMode: true, mapUiOpacity: 0, navTransportMode: mode });
        this.toast(msg);
      },
      stopNavMode: () => this.setState({ navMode: false, mapUiOpacity: 1 }),
      pinGo: () => {
        if (!pv) return;
        const id = pv.id;
        this.setState({ pin: null, pinClosing: false, pinShown: false });
        setTimeout(() => this.openVenue(id), 120);
      },

      /* ══ SAMOUCZEK ══ */
      tourOn: st.phase === 'app' && (st.tour > 0 || st.bizTour > 0),
      spotL: 'calc(12px + (100% - 24px) * ' + ((bizT ? [0, 1, 4][st.bizTour - 1] : st.tour - 1) / 5) + ')',
      spotW: 'calc((100% - 24px) / 5)', spotB: '24px', spotH: '62px', spotR: '999px', tipB: '104px',
      tourDots: (bizT ? [1, 2, 3] : [1, 2, 3, 4, 5]).map((i) => ({ flex: i === tourN ? 3 : 1, bg: i <= tourN ? ac.hex : th.hair })),
      tourTitle: tourStep ? tourStep[0] : '',
      tourBody: tourStep ? tourStep[1] : '',
      tourNextLabel: tourN >= tourMax ? (PL ? 'Zaczynam' : 'Start') : (PL ? 'Dalej' : 'Next'),
      tourSkipLabel: PL ? 'Pomiń' : 'Skip',
      tourNext: () => {
        if (bizT) {
          if (st.bizTour >= 3) { this.setState({ bizTour: 0, tab: 'profile', navDir: 1 }); this.toast(PL ? 'Panel firmy masz w Profilu.' : 'Your business panel lives in Profile.'); return; }
          const nx = st.bizTour + 1;
          this.setState({ bizTour: nx, tab: ['discover', 'map', 'profile'][nx - 1], navDir: 1 });
          return;
        }
        if (st.tour >= 5) { this.setState({ tour: 0, tourDone: true }); this.toast(PL ? 'Powodzenia. Miasto czeka.' : 'Have fun. The city is waiting.'); return; }
        this.setState({ tour: st.tour + 1 });
      },
      tourSkip: () => this.setState({ tour: 0, bizTour: 0, tourDone: true }),
      skipLogin: () => { this.setState({ phase: 'app', tab: 'discover', entered: true }); this.startTour(); this.toast(PL ? 'Przeglądasz jako gość. Zaloguj się, gdy zechcesz zbierać kupony.' : 'Browsing as a guest. Sign in whenever you want coupons.'); },

      /* ══ WERYFIKACJA — INNE METODY ══ */
      verifyBusy: altSel ? altSel.d : (PL ? 'Wysyłam link i sprawdzam domenę…' : 'Sending the link and checking the domain…'),
      verifyDone: st.altPicked === 'post' ? (PL ? 'List w drodze — kod wpiszesz po odbiorze.' : 'Letter on the way — enter the code when it arrives.')
        : st.altPicked === 'doc' ? (PL ? 'Dokumenty przyjęte — odezwiemy się w 24 h.' : 'Documents received — we will get back within 24 h.')
        : (PL ? 'Zweryfikowano — to twoja firma.' : 'Verified — this is your business.'),
      verifyFoot: PL ? 'Nie masz dostępu do tego adresu?' : 'No access to that address?',
      altLink: PL ? 'Spróbuj innej metody' : 'Try another way',
      altOpen: st.altOpen,
      openAlt: () => this.setState({ altOpen: true }),
      closeAlt: () => this.setState({ altOpen: false }),
      altCancel: PL ? 'Wróć do e-maila' : 'Back to e-mail',
      altTitle: PL ? 'Inne sposoby weryfikacji' : 'Other ways to verify',
      altSub: PL ? 'Wybierz metodę, do której masz dostęp. Każda potwierdza, że lokal należy do ciebie.' : 'Pick the one you have access to. Each proves the venue is yours.',
      altMethods: [
        { id: 'call', isCall: true, name: PL ? 'Telefon na numer z wizytówki' : 'Call the listed number', desc: PL ? 'Odbierasz automat i przepisujesz 6-cyfrowy kod. +48 512 884 210' : 'Answer the robocall and type the 6-digit code. +48 512 884 210', time: PL ? '2 min' : '2 min' },
        { id: 'sms', isSms: true, name: PL ? 'SMS na numer firmowy' : 'SMS to the business number', desc: PL ? 'Kod przychodzi na ten sam numer co w Google.' : 'The code goes to the same number as on Google.', time: PL ? '2 min' : '2 min' },
        { id: 'g', isG: true, name: PL ? 'Połącz Profil Firmy w Google' : 'Connect Google Business Profile', desc: PL ? 'Zaloguj się kontem, które zarządza wizytówką — bez czekania.' : 'Sign in with the account that manages the listing — instant.', time: PL ? 'od ręki' : 'instant' },
        { id: 'doc', isDoc: true, name: PL ? 'Dokument firmy lub NIP' : 'Company document or VAT ID', desc: PL ? 'Wpis do CEIDG/KRS albo zdjęcie umowy najmu lokalu.' : 'Registry entry or a photo of the lease.', time: PL ? '1 dzień' : '1 day' },
        { id: 'post', isPost: true, name: PL ? 'Pocztówka z kodem' : 'Postcard with a code', desc: PL ? 'Wysyłamy list na adres lokalu. Najpewniejsza metoda.' : 'We post a letter to the venue address. The most reliable one.', time: PL ? '3–5 dni' : '3–5 days' }
      ].map((m, i) => Object.assign({}, m, { delay: (i * 55) + 'ms',
        pick: () => { this.setState({ altOpen: false, altPicked: m.id, bizVerify: 'busy' }); clearTimeout(this.vT);
          this.vT = setTimeout(() => this.setState({ bizVerify: 'done' }), 1500); } })),
      altPicked: !!st.altPicked,
      altPickedName: altSel ? altSel.n : '',
      altPickedNote: altSel ? altSel.d : '',

      /* ══ PAKIETY ══ */
      plansOpen: st.plansOpen,
      openPlans: () => this.setState({ plansOpen: true, plansSeen: true }),
      closePlans: () => this.setState({ plansOpen: false, plansSeen: true }),
      plansTitle: PL ? 'Rozwiń lokal w swoim tempie' : 'Grow your venue at your pace',
      plansSub: st.trial ? (PL ? 'Masz aktywne 2 tygodnie PRO za 0 zł — zostało ' + st.trialDays + ' dni. Wybierz, co dalej.' : 'Your 2 free weeks of PRO are running — ' + st.trialDays + ' days left. Pick what comes next.') : (PL ? 'Zostajesz na BASE tak długo, jak chcesz. PRO wypróbujesz przez 2 tygodnie za 0 zł — bez karty.' : 'Stay on BASE as long as you like. Try PRO free for 2 weeks — no card.'),
      trialBadge: PL ? '2 TYGODNIE PRO ZA 0 ZŁ' : '2 WEEKS OF PRO FREE',
      isYearly: yearly,
      priceAnim: (yearly ? 'countUp' : 'stagger') + ' 0.45s cubic-bezier(0.16,1,0.3,1) both',
      saveLine: PL ? 'Rocznie: −192 zł na PRO, −600 zł na VIP' : 'Yearly: save 192 zł on PRO, 600 zł on VIP',
      billOpts: [
        { id: 'm', label: PL ? 'Miesięcznie' : 'Monthly' },
        { id: 'y', label: PL ? 'Rocznie · −20%' : 'Yearly · −20%' }
      ].map((b) => ({ label: b.label, bg: st.billing === b.id ? th.ink : 'transparent',
        fg: st.billing === b.id ? th.paper : th.sub,
        shadow: st.billing === b.id ? '0 8px 18px -14px rgba(22,24,28,0.9)' : 'none',
        pick: () => this.setState({ billing: b.id }) })),
      plans: [
        { id: 'base', name: 'BASE', m: 0, y: 0, oldM: 0, oldY: 0, tag: PL ? 'na start, bez opłat' : 'free to start',
          feats: PL ? ['Wizytówka zaciągnięta z Google', '1 aktywna oferta', 'Naklejka QR — płacisz tylko 30 zł wysyłki', 'Statystyki z 7 dni']
                    : ['Listing pulled from Google', '1 active offer', 'QR sticker — 30 zł shipping only', '7-day analytics'] },
        { id: 'pro', name: 'PRO', m: 79, y: 63, oldM: 99, oldY: 79, tag: PL ? 'dla większości lokali' : 'for most venues',
          feats: PL ? ['Wszystko z BASE', 'Nielimitowane oferty i wydarzenia', 'Relacja na IG jednym kliknięciem', 'Push do gości w promieniu 500 m', '10 naklejek QR za 15 zł, wysyłka gratis', 'Statystyki 90 dni i eksport CSV', 'Odpowiedzi na opinie z poziomu panelu']
                    : ['Everything in BASE', 'Unlimited offers and events', 'IG story in one click', 'Push to guests within 500 m', '10 QR stickers for 15 zł, free shipping', '90-day analytics and CSV export', 'Reply to reviews from the panel'] },
        { id: 'vip', name: 'VIP', m: 249, y: 199, oldM: 299, oldY: 249, tag: PL ? 'dla sieci, klubów i scen' : 'for chains, clubs and venues',
          feats: PL ? ['Wszystko z PRO', 'TAPI Smart Stand gratis (płacisz tylko wysyłkę)', 'Wyróżniona pinezka na mapie', '10 naklejek QR gratis, kolejne −50%', 'Pierwsze miejsce w „Dziś w mieście”', 'Opiekun i kampanie sezonowe', 'Integracja z rezerwacjami', 'Raport miesięczny w PDF']
                    : ['Everything in PRO', 'TAPI Smart Stand free (you only pay shipping)', 'Featured pin on the map', '10 QR stickers free, more at −50%', 'Top slot in the Today feed', 'Account manager and campaigns', 'Booking system integration', 'Monthly PDF report'] }
      ].map((p, i) => {
        const price = yearly ? p.y : p.m;
        const old = yearly ? p.oldY : p.oldM;
        const sel = st.plan === p.id;
        const save = (p.m - p.y) * 12;
        return { name: p.name, tag: p.tag, price: price === 0 ? '0 zł' : price + ' zł',
          old: old ? old + ' zł' : '', hasOld: !!old && old !== price,
          per: p.m === 0 ? (PL ? 'na zawsze' : 'forever') : (yearly ? (PL ? 'mies., płatne rocznie' : 'per mo, billed yearly') : (PL ? 'miesięcznie' : 'per month')),
          feats: p.feats.map((f) => ({ text: f, fg: sel ? th.ink : th.sub })),
          border: sel ? at : th.hair, bg: sel ? (th.dark ? ac.softDark : ac.soft) : th.surf,
          shadow: sel ? '0 26px 50px -26px rgba(22,24,28,0.95)' : '0 10px 26px -24px rgba(22,24,28,0.8)',
          scale: sel ? 'translateY(-3px) scale(1.012)' : 'none',
          selected: sel, dotBorder: sel ? ac.hex : th.hair, dotBg: sel ? ac.hex : 'transparent',
          badge: PL ? 'NAJCZĘŚCIEJ WYBIERANY' : 'MOST POPULAR', showBadge: p.id === 'pro',
          current: st.plan === p.id && p.id === 'base' && !st.trial, currentLabel: PL ? 'TWÓJ' : 'CURRENT',
          hasSave: yearly && save > 0, saveTag: PL ? 'OSZCZĘDZASZ ' + save + ' ZŁ / ROK' : 'SAVE ' + save + ' ZŁ / YEAR',
          delay: (i * 80) + 'ms',
          pick: () => this.setState({ plan: p.id }) };
      }),
      planCta: st.plan === 'base' ? (PL ? 'Zostań przy BASE' : 'Stay on BASE') : (PL ? 'Wypróbuj 2 tygodnie ' + st.plan.toUpperCase() + ' za 0 zł' : 'Try 2 weeks of ' + st.plan.toUpperCase() + ' free'),
      planLater: PL ? 'Zdecyduję później' : 'Decide later',
      trialNote: PL ? 'Po 14 dniach zapytamy, zanim cokolwiek pobierzemy. Rezygnacja jednym kliknięciem.' : 'After 14 days we ask before charging anything. Cancel in one click.',
      confirmPlan: () => {
        this.setState({ plansOpen: false, plansSeen: true, trial: st.plan !== 'base' });
        this.toast(st.plan === 'base' ? (PL ? 'Zostajesz na BASE. Wrócisz do tego, kiedy zechcesz.' : 'Staying on BASE. Come back anytime.')
          : (PL ? st.plan.toUpperCase() + ' aktywny — 2 tygodnie za 0 zł. Przypomnimy przed końcem.' : st.plan.toUpperCase() + ' active — 2 weeks free. We will remind you.'));
      },

      /* ══ APLIKACJA FIRMY ══ */
      stepNext: () => {
        const n = (st.bizStep || 0) + 1;
        if (n > 3) {
          this.setState({ phase: 'app', tab: 'discover', navDir: 1, biz: 'panel', oTab: 'home',
            registered: true, bizAccount: true, entered: true, plan: 'pro', trial: true,
            plansSeen: false, plansOpen: false, bizTour: 0,
            user: this.state.user || { name: st.bizPicked || 'Nokturn Wine & Vinyl', mail: 'kontakt@nokturn.wine' } });
          this.toast(PL ? 'Konto firmowe gotowe. Widzisz aplikację tak jak goście.' : 'Business account ready. You see the app exactly as guests do.');
          clearTimeout(this.bizTourT);
          this.bizTourT = setTimeout(() => this.setState({ bizTour: 1 }), 900);
          clearTimeout(this.plansT);
          this.plansT = setTimeout(() => { if (!this.state.plansSeen) this.setState({ plansOpen: true, plansSeen: true }); }, 9000);
          return;
        }
        this.setState({ bizStep: n, bizManual: false });
      },
      toPlansLabel: PL ? 'Utwórz konto firmy' : 'Create the business account',

      goBizPanel: () => this.setState({ phase: 'biz', biz: st.registered ? 'panel' : 'flow', bizStep: 0, bizManual: false, bizVerify: 'idle' }),
      showBizNav: st.phase === 'biz' && st.biz === 'panel',
      bizNavItems: [
        { id: 'home', label: PL ? 'Pulpit' : 'Overview', isHome: true },
        { id: 'stories', label: PL ? 'Oferty' : 'Offers', isOffers: true },
        { id: 'scans', label: PL ? 'Kod QR' : 'QR code', isQr: true },
        { id: 'profile', label: PL ? 'Profil' : 'Profile', isBizProfile: true }
      ].map((n) => ({ label: n.label, isHome: !!n.isHome, isOffers: !!n.isOffers, isQr: !!n.isQr, isBizProfile: !!n.isBizProfile,
        fg: st.oTab === n.id ? at : th.sub, labelFg: st.oTab === n.id ? at : th.sub,
        weight: st.oTab === n.id ? 600 : 500, lift: st.oTab === n.id ? 'translateY(-1px)' : 'none',
        tap: () => this.goBiz(n.id) })),
      bizPillL: 'calc(6px + (100% - 12px) * ' + (bFrom / 4) + ')',
      bizPillW: 'calc((100% - 12px) / 4 * ' + bSpan + ')',
      oProfile: st.oTab === 'profile',
      ownerTitle: st.oTab === 'home' ? (PL ? 'Dzisiaj u ciebie' : 'Today at your place')
        : st.oTab === 'stories' ? (PL ? 'Oferty i relacje' : 'Offers and stories')
        : st.oTab === 'scans' ? (PL ? 'Kod QR i naklejki' : 'QR code and stickers')
        : (PL ? 'Twoja firma' : 'Your business'),
      bizVenueName: st.bizPicked || 'Nokturn Wine & Vinyl',
      bizInitial: (st.bizPicked || 'Nokturn')[0],
      bizVerifiedLine: PL ? 'Zweryfikowana · Kazimierz, Kraków' : 'Verified · Kazimierz, Kraków',
      planName: st.trial ? st.plan.toUpperCase() + (PL ? ' · PRÓBNY' : ' · TRIAL') : st.plan.toUpperCase(),
      planChipBg: st.trial ? ac.hex : th.surf,
      planChipFg: st.trial ? '#FBFAF7' : th.sub,
      planChipBorder: st.trial ? ac.hex : th.hair,
      trialOn: st.trial && st.oTab === 'home',
      trialTitle: PL ? '2 tygodnie PRO za 0 zł — aktywne' : '2 weeks of PRO free — active',
      trialSub: PL ? 'Zostało ' + st.trialDays + ' dni. Zobacz, co odblokowuje PRO.' : st.trialDays + ' days left. See what PRO unlocks.',
      bizRows: [
        { id: 'details', label: PL ? 'Dane lokalu' : 'Venue details', sub: PL ? 'Nazwa, adres, telefon, godziny' : 'Name, address, phone, hours' },
        { id: 'plans', label: PL ? 'Pakiet i płatności' : 'Plan and billing', sub: (PL ? 'Obecnie: ' : 'Current: ') + st.plan.toUpperCase() + (st.trial ? (PL ? ' · okres próbny' : ' · trial') : '') },
        { id: 'team', label: PL ? 'Zespół' : 'Team', sub: (st.team || []).length + (PL ? ' osoby z dostępem do panelu' : ' people with panel access') },
        { id: 'notif', label: PL ? 'Powiadomienia' : 'Notifications', sub: PL ? 'Skany, kupony, opinie, wypłaty' : 'Scans, coupons, reviews, payouts' },
        { id: 'sec', label: PL ? 'Bezpieczeństwo' : 'Security', sub: st.twoFa ? (PL ? 'Dwuskładnikowe: włączone' : 'Two-factor: on') : (PL ? 'Dwuskładnikowe: wyłączone' : 'Two-factor: off') }
      ].map((r) => ({ label: r.label, sub: r.sub,
        tap: () => r.id === 'plans' ? this.setState({ plansOpen: true, plansSeen: true }) : this.setState({ bizPane: r.id }) })),

      /* ══ EKRANY DANYCH FIRMY ══ */
      paneList: !st.bizPane, paneOpen: !!st.bizPane,
      paneDetails: st.bizPane === 'details', paneTeam: st.bizPane === 'team',
      paneNotif: st.bizPane === 'notif', paneSec: st.bizPane === 'sec',
      closePane: () => this.setState({ bizPane: null }),
      paneTitle: st.bizPane === 'details' ? (PL ? 'Dane lokalu' : 'Venue details')
        : st.bizPane === 'team' ? (PL ? 'Zespół' : 'Team')
        : st.bizPane === 'notif' ? (PL ? 'Powiadomienia' : 'Notifications')
        : (PL ? 'Bezpieczeństwo' : 'Security'),
      bizFields: [
        { key: 'name', label: PL ? 'Nazwa' : 'Name' },
        { key: 'addr', label: PL ? 'Adres' : 'Address' },
        { key: 'phone', label: PL ? 'Telefon' : 'Phone' },
        { key: 'mail', label: 'E-mail' },
        { key: 'nip', label: PL ? 'NIP' : 'Tax ID' }
      ].map((b) => ({ label: b.label, value: (st.bizData || {})[b.key] || '',
        onEdit: (e) => { const n = Object.assign({}, this.state.bizData); n[b.key] = e.target.value; this.setState({ bizData: n }); } })),
      hoursHead: PL ? 'Godziny otwarcia' : 'Opening hours',
      bizHours: [['Pn', 16, 23], ['Wt', 16, 23], ['Śr', 16, 24], ['Cz', 16, 24], ['Pt', 16, 26], ['So', 14, 26], ['Nd', 14, 22]].map((h, i) => ({
        day: PL ? h[0] : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'][i],
        left: Math.round(((h[1] - 12) / 15) * 100) + '%',
        width: Math.round(((h[2] - h[1]) / 15) * 100) + '%',
        barBg: th.dark ? 'rgba(255,255,255,0.05)' : 'rgba(22,24,28,0.05)',
        fill: h[2] > 24 ? ac.hex : (th.dark ? ac.softDark : ac.soft),
        range: h[1] + ':00–' + (h[2] > 24 ? (h[2] - 24) : h[2]) + ':00' })),
      saveBizLabel: PL ? 'Zapisz dane lokalu' : 'Save venue details',
      saveBiz: () => this.toast(PL ? 'Dane zapisane. Wizytówka zaktualizowana.' : 'Saved. Your card is updated.'),
      teamRows: (st.team || []).map((m) => ({ initial: m.name.charAt(0), name: m.name, mail: m.mail,
        role: m.owner ? (PL ? 'WŁAŚCICIEL' : 'OWNER') : (PL ? 'OBSŁUGA' : 'STAFF'),
        chipBg: m.owner ? ac.hex : (th.dark ? 'rgba(255,255,255,0.07)' : 'rgba(22,24,28,0.06)'),
        chipFg: m.owner ? '#FBFAF7' : th.sub })),
      addMemberLabel: PL ? 'Zaproś osobę do panelu' : 'Invite someone to the panel',
      addMember: () => { const n = (st.team || []).concat([{ name: PL ? 'Nowa osoba' : 'New person', mail: 'zaproszenie@wysłane', owner: false }]);
        this.setState({ team: n }); this.toast(PL ? 'Zaproszenie wysłane. Osoba ustawi hasło sama.' : 'Invite sent. They set their own password.'); },
      teamNote: PL ? 'Obsługa może odbierać nagrody i widzieć statystyki. Tylko właściciel zmienia pakiet, dane firmy i wypłaty.' : 'Staff can redeem rewards and see stats. Only the owner changes the plan, details and payouts.',
      bizNotifRows: [
        { id: 'scan', pl: 'Każdy skan naklejki', en: 'Every sticker scan', spl: 'Push, gdy gość odbiera kupon', sen: 'Push when a guest takes a coupon' },
        { id: 'review', pl: 'Nowe opinie', en: 'New reviews', spl: 'Także te poniżej trzech gwiazdek', sen: 'Including anything below three stars' },
        { id: 'payout', pl: 'Wypłaty i faktury', en: 'Payouts and invoices', spl: 'Podsumowanie pierwszego dnia miesiąca', sen: 'Summary on the first of the month' },
        { id: 'tips', pl: 'Podpowiedzi TAPI', en: 'TAPI tips', spl: 'Co zmienić, żeby mieć więcej skanów', sen: 'What to change for more scans' }
      ].map((n) => { const on = !!(st.bizNotif || {})[n.id]; return { label: PL ? n.pl : n.en, sub: PL ? n.spl : n.sen,
        track: on ? at : th.hair, knob: on ? '18px' : '0px',
        toggle: () => { const nx = Object.assign({}, this.state.bizNotif); nx[n.id] = !nx[n.id]; this.setState({ bizNotif: nx }); } }; }),
      secRows: [
        { pl: 'Logowanie dwuskładnikowe', en: 'Two-factor sign-in', spl: 'Kod SMS przy każdym logowaniu', sen: 'An SMS code on every sign-in',
          on: !!st.twoFa, tap: () => { this.setState({ twoFa: !st.twoFa });
            this.toast(!st.twoFa ? (PL ? 'Dwuskładnikowe włączone.' : 'Two-factor on.') : (PL ? 'Dwuskładnikowe wyłączone.' : 'Two-factor off.')); } },
        { pl: 'Aktywne urządzenia', en: 'Active devices', spl: 'iPhone przy barze, laptop w biurze', sen: 'iPhone at the bar, office laptop',
          val: '2', tap: () => this.toast(PL ? 'Możesz wylogować każde urządzenie osobno.' : 'You can sign out each device separately.') },
        { pl: 'Historia logowań', en: 'Sign-in history', spl: 'Ostatnie 30 dni', sen: 'Last 30 days',
          val: PL ? 'Podejrzyj' : 'View', tap: () => this.toast(PL ? 'Ostatnie logowanie: dziś, 17:42, Kraków.' : 'Last sign-in: today, 5:42 pm, Kraków.') }
      ].map((s) => ({ label: PL ? s.pl : s.en, sub: PL ? s.spl : s.sen, tap: s.tap,
        state: s.val ? s.val : (s.on ? (PL ? 'Włączone' : 'On') : (PL ? 'Wyłączone' : 'Off')),
        stateFg: s.val ? th.sub : (s.on ? at : th.sub) })),
      secNote: PL ? 'Nie przechowujemy haseł ani danych kart. Płatności obsługuje operator, my widzimy tylko status.' : 'We store no passwords or card data. Payments run through the provider; we only see the status.',
      exitLabel: PL ? 'Przełącz na widok gościa' : 'Switch to guest view',
      bizFoot: (PL ? 'TAPI DLA FIRM' : 'TAPI FOR BUSINESS') + ' · 1.0',

      /* ══ ZAMÓWIENIE NAKLEJEK ══ */
      orderTitle: PL ? 'Zamów naklejki QR' : 'Order QR stickers',
      orderSub: PL ? 'Drukujemy na winylu odpornym na deszcz i wysyłamy w 48 h. Przyklejasz na szybę i gotowe.' : 'Printed on weatherproof vinyl, shipped within 48 h. Stick it on the window and you are done.',
      qtyLabel: PL ? 'Ile naklejek' : 'How many',
      qtyText: st.qty + (PL ? ' szt.' : ' pcs'),
      qtyUp: () => this.setState({ qty: Math.min(100, st.qty + 10) }),
      qtyDown: () => this.setState({ qty: Math.max(10, st.qty - 10) }),
      orderRows: [
        { label: PL ? 'Naklejki (' + st.qty + ' szt.)' : 'Stickers (' + st.qty + ' pcs)', value: stickerCost === 0 ? (PL ? 'gratis' : 'free') : stickerCost + ' zł', fg: stickerCost === 0 ? at : th.ink },
        { label: PL ? 'Wysyłka kurierem' : 'Courier shipping', value: ship === 0 ? (PL ? 'gratis' : 'free') : ship + ' zł', fg: ship === 0 ? at : th.ink },
        { label: PL ? 'Pakiet ' + st.plan.toUpperCase() : st.plan.toUpperCase() + ' plan', value: st.plan === 'base' ? (PL ? 'naklejki gratis' : 'stickers free') : st.plan === 'pro' ? (PL ? '15 zł / 10 szt.' : '15 zł / 10 pcs') : (PL ? 'pierwsze 10 gratis' : 'first 10 free'), fg: at }
      ],
      totalLabel: PL ? 'Razem' : 'Total',
      orderTotal: total + ' zł',
      orderCta: PL ? 'Zamów za ' + total + ' zł' : 'Order for ' + total + ' zł',
      orderFoot: PL ? 'Dostawa 48 h · płatność przy odbiorze lub kartą' : 'Delivered in 48 h · card or cash on delivery',
      orderStickers: () => this.toast(PL ? 'Zamówione: ' + st.qty + ' naklejek za ' + total + ' zł. Kurier w 48 h.' : 'Ordered: ' + st.qty + ' stickers for ' + total + ' zł. Courier in 48 h.'),
      orderUpsell: st.plan !== 'vip',
      orderUpsellText: st.plan === 'base'
        ? (PL ? 'W PRO: 10 naklejek za 15 zł i wysyłka gratis.' : 'On PRO: 10 stickers for 15 zł, shipping free.')
        : (PL ? 'W VIP: pierwsze 10 naklejek gratis, kolejne −50%.' : 'On VIP: first 10 stickers free, more at −50%.'),

      /* ══ PLANER WYJAZDU ══ */
      tripStep0: st.tripStep === 0 && !st.tripIntro, tripStep1: st.tripStep === 1 && !st.tripIntro,
      tripStep2: st.tripStep === 2 && !st.tripIntro,
      tripSetup: st.tripStep < 3 && !st.tripIntro,
      tripIntro: !!st.tripIntro,
      introKicker: PL ? 'PLAN WYJAZDU' : 'TRIP PLAN',
      introTitle: PL ? 'Powiedz nam cztery rzeczy — dostaniesz gotowy plan' : 'Tell us four things — get a finished plan',
      introLead: this.l3('Cztery pytania, a rozpiszemy plan godzina po godzinie — z czasem dojścia i ceną.', 'Four questions and we lay out an hour-by-hour plan — walking times and prices included.', 'Quattro domande e prepariamo un piano ora per ora — con tempi a piedi e prezzi.'),
      introPoints: [
        { n: '1', pl: 'Cztery pytania', en: 'Four questions', bpl: 'Ile dni, jaki budżet, jakie tempo i z kim jedziesz. Nic więcej.', ben: 'Days, budget, pace and who is coming. Nothing else.' },
        { n: '2', pl: 'Rozpiska godzinowa', en: 'An hourly plan', bpl: 'Poranek, popołudnie i wieczór na każdy dzień — z czasem przejścia i ceną wejścia.', ben: 'Morning, afternoon and evening per day — with walking time and entry price.' },
        { n: '3', pl: 'Zamieniasz, co nie pasuje', en: 'Swap what does not fit', bpl: 'Każdy punkt wymienisz albo wyrzucisz. Plan przelicza koszt sam.', ben: 'Swap or drop any stop. The plan recalculates the cost itself.' }
      ].map((p, i) => ({ n: p.n, title: PL ? p.pl : p.en, body: PL ? p.bpl : p.ben, delay: (i * 90) + 'ms' })),
      introFacts: [
        { v: '4', kpl: 'PYTANIA', ken: 'QUESTIONS' },
        { v: PL ? '~20 s' : '~20 s', kpl: 'TYLE ZAJMIE', ken: 'TIME NEEDED' },
        { v: PL ? '0 zł' : 'Free', kpl: 'ZA PLAN', ken: 'FOR THE PLAN' }
      ].map((i, k) => ({ v: i.v, k: PL ? i.kpl : i.ken, delay: (k * 70) + 'ms' })),
      introCta: PL ? 'Zaczynamy' : 'Let us start',
      introFoot: PL ? 'Plan zapiszesz w profilu i zmienisz, kiedy chcesz.' : 'Save the plan to your profile and change it whenever.',
      startTrip: () => this.setState({ tripIntro: false, tripStep: 0 }),
      introDay1: PL ? 'dzień 1' : 'day 1',
      introDone: PL ? 'gotowe' : 'done',
      tripPlanTitle: (PL ? 'Twój plan na ' : 'Your plan for ') + st.tripDays + (PL ? (st.tripDays === 1 ? ' dzień' : ' dni') : (st.tripDays === 1 ? ' day' : ' days')),
      tripCostLabel: PL ? 'Koszt planu' : 'Plan cost',
      tripOpenCard: PL ? 'Otwórz wizytówkę' : 'Open the card',
      budgetCoins: [0, 1, 2, 3, 4, 5].map((i) => {
        const on = st.tripBudget >= 200 + i * 300;
        return { border: on ? ac.hex : th.hair, bg: on ? (th.dark ? ac.softDark : ac.soft) : 'transparent',
          op: on ? 1 : 0.4, delay: (i * 70) + 'ms' };
      }),
      tripBusy: st.tripStep === 3, tripDone: st.tripStep === 4,
      tripKicker: PL ? 'Planer wyjazdu' : 'Trip planner',
      tripPills: [0, 1, 2].map((i) => ({ flex: Math.min(st.tripStep, 2) === i ? 3 : 1, bg: i <= st.tripStep ? at : th.hair })),
      tripTitle0: PL ? 'Ile masz czasu w Krakowie?' : 'How long are you in Kraków?',
      tripSub0: PL ? 'Rozpiszemy każdy dzień na godziny — z dojściem, ceną i rezerwą na przerwę.' : 'We lay out every day by the hour — walk time, price and a break built in.',
      tripDays: st.tripDays,
      tripDaysLabel: st.tripDays + ' ' + (PL ? (st.tripDays === 1 ? 'dzień' : 'dni') : (st.tripDays === 1 ? 'day' : 'days')),
      tripNights: PL ? (st.tripDays - 1) + ' ' + ((st.tripDays - 1) === 1 ? 'noc' : 'nocy') : (st.tripDays - 1) + ' nights',
      tripDayUp: () => this.setState({ tripDays: Math.min(60, st.tripDays + 1) }),
      tripDayDown: () => this.setState({ tripDays: Math.max(1, st.tripDays - 1) }),
      dayQuick: [3, 5, 7, 10, 14, 21, 30].map((d) => ({ label: String(d),
        bg: st.tripDays === d ? th.ink : th.surf, fg: st.tripDays === d ? th.paper : th.sub,
        border: st.tripDays === d ? th.ink : th.hair,
        pick: () => this.setState({ tripDays: d }) })),
      dayNote: st.tripDays > 7
        ? (PL ? 'Długi wyjazd: przy ' + st.tripDays + ' dniach miejsca zaczynają się powtarzać w innych porach dnia — to normalne, Kraków ma swoje granice.' : 'Long trip: past a week places start repeating at different times of day.')
        : (PL ? 'Możesz iść dalej niż tydzień — plusem dobijesz choćby do 30 dni.' : 'You can go past a week — the plus button reaches 30 days.'),
      tripDayBars: Array.apply(null, { length: Math.min(14, Math.max(7, st.tripDays)) }).map((_, k) => k + 1).map((d) => ({
        h: (26 + Math.round(d * (63 / Math.min(14, Math.max(7, st.tripDays))))) + 'px', on: d <= st.tripDays,
        bg: d <= st.tripDays ? ac.hex : th.hair, op: d <= st.tripDays ? 1 : 0.55,
        delay: (d * 26) + 'ms', tdelay: (Math.min(d, 8) * 22) + 'ms',
        pick: () => this.setState({ tripDays: d }), label: d })),
      whoLabel: PL ? 'Z kim jedziesz' : 'Who is coming',
      whoOpts: [
        { id: 'solo', pl: 'Sam', en: 'Solo' }, { id: 'para', pl: 'We dwoje', en: 'Two of us' },
        { id: 'ekipa', pl: 'Ekipa', en: 'Group' }, { id: 'rodzina', pl: 'Z dziećmi', en: 'With kids' }
      ].map((w) => ({ label: PL ? w.pl : w.en, bg: st.tripWho === w.id ? th.ink : th.surf,
        fg: st.tripWho === w.id ? th.paper : th.sub, border: st.tripWho === w.id ? th.ink : th.hair,
        pick: () => this.setState({ tripWho: w.id }) })),
      tripTitle1: PL ? 'Jaki budżet na osobę?' : 'What is your budget per person?',
      tripSub1: PL ? 'Liczymy bilety, jedzenie i wejściówki. Noclegu i dojazdu tu nie ma.' : 'Tickets, food and entries. Accommodation and travel are not counted.',
      tripBudget: st.tripNoBudget ? (PL ? 'Bez limitu' : 'No limit') : st.tripBudget + ' zł',
      tripPerDay: st.tripNoBudget
        ? (PL ? 'ceny podamy, ale nie odrzucimy nic za drogiego' : 'we still show prices, we just never rule a place out')
        : (PL ? 'to ' : 'that is ') + Math.round(st.tripBudget / Math.max(1, st.tripDays)) + (PL ? ' zł na dzień' : ' zł a day'),
      budgetPct: st.tripNoBudget ? '100%' : Math.round(Math.min(1, (st.tripBudget - 200) / 1800) * 100) + '%',
      budgetMin: '200 zł',
      budgetMax: st.tripNoBudget ? (PL ? 'bez limitu' : 'no limit') : '2000 zł+',
      budgetUp: () => { if (st.tripNoBudget) return;
        const n = st.tripBudget + 100;
        if (n > 2000) this.setState({ tripNoBudget: true, tripBudget: 2000 });
        else this.setState({ tripBudget: n }); },
      budgetDown: () => { if (st.tripNoBudget) { this.setState({ tripNoBudget: false, tripBudget: 2000 }); return; }
        this.setState({ tripBudget: Math.max(200, st.tripBudget - 100) }); },
      budgetTiers: [
        { v: 400, pl: 'Oszczędnie', en: 'Lean', spl: '400 zł', sen: '400 zł' },
        { v: 700, pl: 'Wygodnie', en: 'Comfortable', spl: '700 zł', sen: '700 zł' },
        { v: 1200, pl: 'Bez liczenia', en: 'No counting', spl: '1200 zł', sen: '1200 zł' },
        { v: 0, pl: 'Bez limitu', en: 'No limit', spl: 'nie filtruj', sen: 'do not filter' }
      ].map((b) => { const on = b.v === 0 ? st.tripNoBudget : (!st.tripNoBudget && st.tripBudget === b.v);
        return { label: PL ? b.pl : b.en, sub: PL ? b.spl : b.sen,
          bg: on ? (th.dark ? ac.softDark : ac.soft) : th.surf,
          border: on ? at : th.hair, fg: on ? at : th.sub,
          pick: () => b.v === 0 ? this.setState({ tripNoBudget: true }) : this.setState({ tripNoBudget: false, tripBudget: b.v }) }; }),
      tripTitle2: PL ? 'Co ma być w planie?' : 'What should be in the plan?',
      tripSub2: PL ? 'Wybierz kilka rzeczy i tempo. Resztę dobierzemy tak, żeby dzień się spinał.' : 'Pick a few things and a pace. We fit the rest so the day actually works.',
      tripChips: this.interestDefs.map((d) => {
        const on = st.tripInts.indexOf(d.id) > -1;
        return { label: PL ? d.pl : d.en, on: on, bg: on ? ac.hex : th.surf, fg: on ? '#FBFAF7' : th.sub,
          border: on ? ac.hex : th.hair,
          toggle: () => this.setState({ tripInts: on ? st.tripInts.filter((x) => x !== d.id) : st.tripInts.concat([d.id]) }) };
      }),
      paceLabel: PL ? 'Tempo dnia' : 'Pace of the day',
      paceOpts: [
        { id: 'spokojne', pl: 'Spokojnie', en: 'Easy', spl: '3 punkty', sen: '3 stops' },
        { id: 'normal', pl: 'Normalnie', en: 'Balanced', spl: '4 punkty', sen: '4 stops' },
        { id: 'intensywne', pl: 'Intensywnie', en: 'Packed', spl: '6 punktów', sen: '6 stops' }
      ].map((p) => ({ label: PL ? p.pl : p.en, sub: PL ? p.spl : p.sen,
        bg: st.tripPace === p.id ? (th.dark ? ac.softDark : ac.soft) : th.surf,
        border: st.tripPace === p.id ? at : th.hair, fg: st.tripPace === p.id ? at : th.sub,
        pick: () => this.setState({ tripPace: p.id }) })),
      tripBack: () => { if (st.tripStep === 0) { this.setState({ tripIntro: true }); return; }
        this.setState({ tripStep: Math.max(0, st.tripStep - 1) }); },
      tripNext: () => this.setState({ tripStep: st.tripStep + 1 }),
      tripNextLabel: PL ? 'Dalej' : 'Continue',
      tripGoLabel: st.tripInts.length ? (PL ? 'Ułóż mój plan' : 'Build my plan') : (PL ? 'Wybierz choć jedno' : 'Pick at least one'),
      tripGoBg: st.tripInts.length ? ac.hex : th.hair,
      tripGoFg: st.tripInts.length ? '#FBFAF7' : th.sub,
      runTrip: () => { if (!st.tripInts.length) return; this.runTrip(); },
      tripBusyLabel: PL ? 'Układam trasę' : 'Laying out the route',
      tripBusySteps: [
        PL ? 'Dobieram miejsca pod twoje kategorie' : 'Matching places to your categories',
        PL ? 'Sprawdzam godziny otwarcia i dojścia' : 'Checking opening hours and walks',
        PL ? 'Domykam budżet ' + st.tripBudget + ' zł' : 'Fitting the ' + st.tripBudget + ' zł budget'
      ].map((s, i) => ({ text: s, delay: (i * 480) + 'ms' })),
      tripDayTabs: (st.tripPlan ? st.tripPlan.days : []).map((d, i) => ({
        label: (PL ? 'Dzień ' : 'Day ') + (i + 1), sub: d.spend + ' zł',
        bg: st.tripDay === i ? th.ink : th.surf, fg: st.tripDay === i ? th.paper : th.sub,
        border: st.tripDay === i ? th.ink : th.hair,
        pick: () => this.setState({ tripDay: i }) })),
      tripItems: (st.tripPlan && st.tripPlan.days[st.tripDay] ? st.tripPlan.days[st.tripDay].items : []).map((it, i, arr) => {
        const s = it.s;
        const tg = s.tags;
        const kind = tg.indexOf('kawa') > -1 ? 'cup' : tg.indexOf('kino') > -1 ? 'film'
          : (tg.indexOf('koncerty') > -1 || tg.indexOf('kluby') > -1 || tg.indexOf('winyle') > -1 || tg.indexOf('wino') > -1) ? 'music'
          : (tg.indexOf('sniadania') > -1 || tg.indexOf('street') > -1 || tg.indexOf('targi') > -1) ? 'fork' : 'art';
        return { time: it.time, name: st.lang === 'it' ? s.it : (PL ? s.pl : s.en),
          note: PL ? s.npl : s.nen, area: s.area,
          price: s.price === 0 ? (PL ? 'gratis' : 'free') : s.price + ' zł',
          priceFg: s.price === 0 ? at : th.ink,
          dur: Math.round(s.dur / 60 * 10) / 10 + ' h',
          slotLabel: it.slot === 'am' ? (PL ? 'Rano' : 'Morning') : it.slot === 'pm' ? (PL ? 'Popołudnie' : 'Afternoon') : (PL ? 'Wieczór' : 'Evening'),
          isCup: kind === 'cup', isFork: kind === 'fork', isMusic: kind === 'music', isFilm: kind === 'film', isArt: kind === 'art',
          hasVenue: !!s.venue, notLast: i < arr.length - 1, delay: (i * 90) + 'ms',
          open: () => { if (s.venue) this.openVenue(s.venue); else this.toast(PL ? s.pl + ' · ' + s.area : s.en + ' · ' + s.area); } };
      }),
      tripDayTitle: (PL ? 'Dzień ' : 'Day ') + (st.tripDay + 1) + ' · ' + (st.tripPlan && st.tripPlan.days[st.tripDay] ? st.tripPlan.days[st.tripDay].items.length : 0) + (PL ? ' punktów' : ' stops'),
      tripDaySpend: (st.tripPlan && st.tripPlan.days[st.tripDay] ? st.tripPlan.days[st.tripDay].spend : 0) + ' zł',
      tripTotal: (st.tripPlan ? st.tripPlan.total : 0) + ' zł',
      tripBudgetLine: PL ? 'z ' + st.tripBudget + ' zł budżetu' : 'of a ' + st.tripBudget + ' zł budget',
      tripLeft: (st.tripPlan ? Math.max(0, st.tripBudget - st.tripPlan.total) : 0) + ' zł',
      tripLeftLabel: PL ? 'zostaje na kawę i pamiątki' : 'left for coffee and souvenirs',
      tripBarPct: st.tripPlan ? Math.min(100, Math.round(st.tripPlan.total / Math.max(1, st.tripBudget) * 100)) + '%' : '0%',
      tripBarFg: st.tripPlan && st.tripPlan.total > st.tripBudget ? '#B65C36' : ac.hex,
      tripRegen: () => { this.setState({ tripSeed: (st.tripSeed || 0) + 1 }); setTimeout(() => this.buildTrip(), 10); this.toast(PL ? 'Nowy układ dnia — te same zasady.' : 'A fresh layout — same rules.'); },
      tripRegenLabel: PL ? 'Ułóż inaczej' : 'Shuffle',
      tripEditLabel: PL ? 'Zmień założenia' : 'Change setup',
      tripEdit: () => this.setState({ tripStep: 0 }),
      tripSave: () => this.needAuth(() => this.toast(PL ? 'Plan zapisany w Profilu → Zapisane.' : 'Plan saved in Profile → Saved.')),
      tripSaveLabel: PL ? 'Zapisz plan' : 'Save plan',
      tripHeroTitle: PL ? 'Powiedz nam trzy rzeczy — resztę ułożymy' : 'Tell us three things — we do the rest',

      /* ══ PROFIL ══ */
      meName: st.me.name || (st.user ? st.user.name : ''),
      meMail: st.me.mail || (st.user ? st.user.mail : ''),
      mePhone: st.me.phone, meCity: st.me.city, meBorn: st.me.born,
      setMe: (k) => (e) => { const n = Object.assign({}, this.state.me); n[k] = e.target.value; this.setState({ me: n }); },
      meEditOn: !!st.meEdit, meEditOff: !st.meEdit,
      meEditLabel: st.meEdit ? (PL ? 'Gotowe' : 'Done') : (PL ? 'Edytuj' : 'Edit'),
      meEditBg: st.meEdit ? ac.hex : (th.dark ? ac.softDark : ac.soft),
      meEditFg: st.meEdit ? '#FBFAF7' : at,
      meEditBorder: st.meEdit ? ac.hex : 'transparent',
      meCardBorder: st.meEdit ? at : th.hair,
      toggleMeEdit: () => this.setState({ meEdit: !st.meEdit }),
      meFields: [
        { key: 'name', label: PL ? 'Imię i nazwisko' : 'Full name', value: st.me.name || (st.user ? st.user.name : ''), ph: PL ? 'Klara Ziarno' : 'Your name' },
        { key: 'mail', label: 'E-mail', value: st.me.mail || (st.user ? st.user.mail : ''), ph: 'ty@tapi.app' },
        { key: 'phone', label: PL ? 'Telefon' : 'Phone', value: st.me.phone, ph: '+48 600 000 000' },
        { key: 'city', label: PL ? 'Miasto bazowe' : 'Home city', value: st.me.city, ph: 'Kraków' },
        { key: 'born', label: PL ? 'Rok urodzenia' : 'Year of birth', value: st.me.born, ph: '1994' }
      ].map((f) => ({ label: f.label, value: f.value, ph: f.ph,
        locked: !st.meEdit, cursor: st.meEdit ? 'text' : 'default',
        changed: st.meEdit && (st.meSaved || {})[f.key] !== undefined && (st.meSaved || {})[f.key] !== f.value,
        rowBg: st.meEdit ? (th.dark ? 'rgba(255,255,255,0.03)' : 'rgba(22,24,28,0.015)') : 'transparent',
        onEdit: (e) => { if (!this.state.meEdit) return; const n = Object.assign({}, this.state.me); n[f.key] = e.target.value; this.setState({ me: n }); } })),
      meDirty: meChanged,
      meRevertLabel: PL ? 'Cofnij' : 'Discard',
      meRevert: () => this.setState({ me: Object.assign({}, st.meSaved || this.state.me) }),
      meSave: () => { this.setState({ meSaved: Object.assign({}, this.state.me), meEdit: false }); this.toast(PL ? 'Dane zapisane.' : 'Details saved.'); },
      meSaveLabel: PL ? 'Zapisz zmiany' : 'Save changes',
      meDataLabel: PL ? 'Twoje dane' : 'Your details',
      profSavedLabel: PL ? 'Zapisane i kupony' : 'Saved and coupons',
      savedCount: st.savedIds.length,
      bizAccount: st.bizAccount, notBizAccount: !st.bizAccount,
      ownVenueQ: PL ? 'Prowadzisz lokal?' : 'Do you run a venue?',
      ownVenueSub: PL ? 'Załóż konto firmowe — zajmuje 2 minuty.' : 'Create a business account — takes 2 minutes.',
      bizHubLabel: PL ? 'Twoja firma' : 'Your business',
      bizHubSub: PL ? 'Widok gościa masz cały czas — narzędzia firmy są tutaj.' : 'You always keep the guest view — the business tools live here.',
      bizTiles: [
        { id: 'home', pl: 'Pulpit', en: 'Dashboard', spl: 'Skany, kupony, wykres', sen: 'Scans, coupons, chart', isHome: true },
        { id: 'stories', pl: 'Oferty', en: 'Offers', spl: 'Relacje IG i promocje', sen: 'IG stories and deals', isOffers: true },
        { id: 'scans', pl: 'Kod QR', en: 'QR code', spl: 'Naklejki i zamówienie', sen: 'Stickers and ordering', isQr: true },
        { id: 'profile', pl: 'Dane firmy', en: 'Business details', spl: 'Pakiet, zespół, płatności', sen: 'Plan, team, billing', isBizProfile: true }
      ].map((b, i) => ({ label: PL ? b.pl : b.en, sub: PL ? b.spl : b.sen, delay: (i * 60) + 'ms',
        isHome: !!b.isHome, isOffers: !!b.isOffers, isQr: !!b.isQr, isBizProfile: !!b.isBizProfile,
        tap: () => this.setState({ phase: 'biz', biz: 'panel', oTab: b.id }) })),

      /* ══ POWIADOMIENIA Z ZAINTERESOWAŃ ══ */
      notifs: notifList
    };
    return st.lang === 'it' ? this.tr(vals) : vals;
  }
}
