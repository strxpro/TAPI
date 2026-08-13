import { Component, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ALWAYS_DARK } from '../theme/tokens';

/**
 * Zapora na błędy renderowania.
 *
 * Bez niej wyjątek przy starcie daje **biały ekran bez słowa wyjaśnienia** —
 * a to najgorszy rodzaj awarii, bo nie wiadomo nawet, gdzie szukać. Kosztowało
 * nas to całą turę zgadywania, więc od teraz aplikacja mówi, co ją wywróciło.
 *
 * Świadomie pokazujemy treść błędu na ekranie. To narzędzie do pracy, nie
 * ekran dla gościa — gdy aplikacja pójdzie do ludzi, trzeba tu wstawić
 * przeprosiny i wysyłkę zgłoszenia, a szczegóły zostawić w dzienniku.
 */

type Props = { children: ReactNode };
type State = { error: Error | null; stack: string | null };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, stack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // Do dziennika trafia całość — na ekranie i tak się nie zmieści.
    console.error('Aplikacja się wywróciła:', error, info.componentStack);
    this.setState({ stack: info.componentStack ?? null });
  }

  render() {
    const { error, stack } = this.state;
    if (!error) return this.props.children;

    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={styles.title}>Aplikacja się zatrzymała</Text>
          <Text style={styles.message}>{error.message || String(error)}</Text>

          {stack ? (
            <>
              <Text style={styles.label}>Gdzie</Text>
              <Text style={styles.stack}>{stack.trim().split('\n').slice(0, 12).join('\n')}</Text>
            </>
          ) : null}

          {error.stack ? (
            <>
              <Text style={styles.label}>Ślad</Text>
              <Text style={styles.stack}>{error.stack.split('\n').slice(0, 10).join('\n')}</Text>
            </>
          ) : null}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: ALWAYS_DARK.bg },
  body: { padding: 24, paddingTop: 72, gap: 10 },
  title: { color: ALWAYS_DARK.ink, fontSize: 20, fontWeight: '700' },
  message: { color: '#E8966E', fontSize: 14, lineHeight: 20 },
  label: {
    color: 'rgba(244,242,237,0.5)',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: 14,
  },
  stack: {
    color: 'rgba(244,242,237,0.75)',
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'monospace',
  },
});
