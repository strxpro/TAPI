/**
 * Wystawia złożony dokument pod adresem, żeby dało się go obejrzeć
 * w przeglądarce bez uruchamiania Expo i telefonu.
 *
 *   node tools/serve.mjs        → http://localhost:4321
 *
 * Po co: `assets/app.html` to cała warstwa wizualna aplikacji. Zmiana
 * w `template.html` z niezamkniętym znacznikiem kończy się białym ekranem,
 * a na telefonie widać wtedy tylko biel — bez słowa, co poszło nie tak.
 * Tutaj widać od razu i błędy w konsoli, i to, czy cokolwiek się narysowało.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const DOC = resolve(here, '..', 'assets', 'app.html');
const PORT = 4321;

createServer(async (req, res) => {
  // Tylko korzeń. Oddawanie dokumentu pod każdym adresem wygląda niewinnie,
  // ale runtime dociąga rodzeństwo komponentów po URL-u — dostawał wtedy
  // cztery megabajty HTML-a zamiast pliku i sypał błędami, które nie miały
  // nic wspólnego z aplikacją.
  const sciezka = (req.url || '/').split('?')[0];
  if (sciezka !== '/') {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Nie ma tu nic — ten serwer wystawia wyłącznie assets/app.html pod /');
    return;
  }
  try {
    const html = await readFile(DOC);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      // Bez tego przeglądarka pokazuje poprzednie złożenie i człowiek
      // szuka błędu w kodzie, który już naprawił.
      'Cache-Control': 'no-store',
    });
    res.end(html);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Nie ma czego pokazać: ${err.message}\nZłóż dokument: npm run app`);
  }
}).listen(PORT, () => {
  console.log(`\n  Dokument pod http://localhost:${PORT}`);
  console.log('  Zatrzymanie: Ctrl+C\n');
});
