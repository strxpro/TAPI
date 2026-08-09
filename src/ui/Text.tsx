import { Text as RNText, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { em, fonts, size } from '../theme/tokens';

/**
 * Warianty odpowiadają rzeczywistym parom rozmiar + waga + letter-spacing
 * użytym w prototypie. Nie ma tu wartości pośrednich — jeśli czegoś brakuje,
 * dopisujemy po znalezieniu w Bywalec.dc.html.
 *
 * W React Native nie mieszamy fontFamily z fontWeight — wagę niesie sam krój.
 */
const V = {
  /** etykieta zakładki, 9 px / 0.03em (linia 4017) */
  navLabel: { fontFamily: fonts.sans, fontSize: size.s9, letterSpacing: em(size.s9, 0.03) },
  navLabelOn: { fontFamily: fonts.sansSemi, fontSize: size.s9, letterSpacing: em(size.s9, 0.03) },

  /** 9,5 px / 700 / 0.07em — podpis pod podglądem zakładki (linia 3998) */
  tiny: { fontFamily: fonts.sansBold, fontSize: size.s95, letterSpacing: em(size.s95, 0.07) },

  /** 10,5 px / 0.14em uppercase — najczęstsza etykieta sekcji */
  label: { fontFamily: fonts.sansSemi, fontSize: size.s105, letterSpacing: em(size.s105, 0.14) },
  /** 10 px / 0.16em uppercase — nagłówek nad tytułem ekranu */
  labelWide: { fontFamily: fonts.sansSemi, fontSize: size.s10, letterSpacing: em(size.s10, 0.16) },

  /** 11,5 px — opis pod tytułem */
  caption: { fontFamily: fonts.sans, fontSize: size.s115, lineHeight: 16 },
  /** 12,5 px — najczęstszy rozmiar w prototypie (103×) */
  body: { fontFamily: fonts.sans, fontSize: size.s125, lineHeight: 17 },
  bodySemi: { fontFamily: fonts.sansSemi, fontSize: size.s125, lineHeight: 17 },
  /** 13,5 px / 700 / −0.01em — tytuł wiersza */
  title: {
    fontFamily: fonts.sansBold,
    fontSize: size.s135,
    letterSpacing: em(size.s135, -0.01),
    lineHeight: 18,
  },
  /** 15 px — treść */
  bodyLg: { fontFamily: fonts.sans, fontSize: size.s15, lineHeight: 21 },

  /** Instrument Serif — nagłówki brandowe */
  serifSm: { fontFamily: fonts.serif, fontSize: size.s21, letterSpacing: em(size.s21, -0.02) },
  serif: { fontFamily: fonts.serif, fontSize: size.s24, letterSpacing: em(size.s24, -0.03) },
  serifLg: { fontFamily: fonts.serif, fontSize: size.s27, letterSpacing: em(size.s27, -0.03) },
  serifXl: { fontFamily: fonts.serif, fontSize: size.s30, letterSpacing: em(size.s30, -0.03) },

  /** Archivo — liczby i statystyki */
  num: { fontFamily: fonts.archivo, fontSize: size.s22, letterSpacing: em(size.s22, -0.02) },
  numLg: { fontFamily: fonts.archivoBold, fontSize: size.s30, letterSpacing: em(size.s30, -0.035) },
} satisfies Record<string, TextStyle>;

export type Variant = keyof typeof V;
export type Tone = 'ink' | 'sub' | 'accent' | 'onAccent';

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
  upper?: boolean;
  color?: string;
};

export function Text({
  variant = 'body',
  tone = 'ink',
  upper,
  color,
  style,
  children,
  ...rest
}: Props) {
  const { theme, accent } = useTheme();

  const resolved =
    color ??
    (tone === 'sub'
      ? theme.sub
      : tone === 'accent'
        ? theme.dark
          ? accent.text
          : accent.hex
        : tone === 'onAccent'
          ? '#FBFAF7'
          : theme.ink);

  return (
    <RNText
      allowFontScaling={false}
      style={[V[variant], { color: resolved }, upper && UPPER, style]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const UPPER: TextStyle = { textTransform: 'uppercase' };

/**
 * Tekst bez wariantu — do miejsc, gdzie rozmiar, waga i interlinia są
 * wypisane wprost z prototypu i nie ma sensu szukać dla nich wariantu.
 * Jedyne, co dokłada, to wyłączenie skalowania czcionki systemowej,
 * bo układ ekranów jest liczony w pikselach.
 */
export function Raw({ style, children, ...rest }: TextProps) {
  return (
    <RNText allowFontScaling={false} style={style} {...rest}>
      {children}
    </RNText>
  );
}
