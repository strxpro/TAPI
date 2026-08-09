import { Suspense, useEffect, useMemo, useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import { Canvas, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useTheme } from '../theme/ThemeProvider';
import { StandModel } from './StandModel';
import { useStandLabel } from './useStandLabel';
import { clampTilt, DRAG_SPEED, initialSpin, type SpinState } from './spin';
import type { StandConfig } from './config';

/**
 * Podgląd stojaka TAPI.
 *
 * Sterowanie robimy własnym `PanResponder`, a nie `OrbitControls`. Powód:
 * kontrolki z three-stdlib wieszają się na zdarzeniach DOM-owych, których
 * w React Native nie ma, a tu i tak potrzebujemy tylko obrotu w poziomie
 * i ograniczonego przechyłu. Przy okazji gest nie walczy z przewijaniem
 * ekranu pod spodem.
 */

export function StandViewer({ config, height = 320 }: { config: StandConfig; height?: number }) {
  const { theme } = useTheme();
  const spin = useRef<SpinState>(initialSpin());
  const { texture, LabelSurface } = useStandLabel(config);

  const pan = useMemo(
    () =>
      PanResponder.create({
        // Bierzemy tylko ruch w bok. Dotknięcie i przesunięcie w pionie
        // zostawiamy ekranowi — inaczej nie da się przewinąć strony palcem
        // położonym na modelu.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_e, g) =>
          Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderGrant: () => {
          const s = spin.current;
          s.dragging = true;
          s.touched = Date.now();
          // Autoobrót zdążył przesunąć model — liczymy gest od tego, co widać.
          s.base = { x: s.x, y: s.y };
        },
        onPanResponderMove: (_e, g) => {
          const s = spin.current;
          s.y = s.base.y + g.dx * DRAG_SPEED;
          s.x = clampTilt(s.base.x + g.dy * DRAG_SPEED * 0.6);
          s.touched = Date.now();
        },
        onPanResponderRelease: () => {
          const s = spin.current;
          s.dragging = false;
          s.touched = Date.now();
          s.base = { x: s.x, y: s.y };
        },
        onPanResponderTerminate: () => {
          const s = spin.current;
          s.dragging = false;
          s.touched = Date.now();
          s.base = { x: s.x, y: s.y };
        },
      }),
    [],
  );

  return (
    <View style={[styles.root, { height }]} {...pan.panHandlers}>
      <Canvas
        camera={{ fov: 35, near: 0.01, far: 100, position: [0, 0.04, 0.5] }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
        }}
      >
        {/* Światło własne, bez pobierania mapy HDR z sieci. */}
        <ambientLight intensity={0.55} />
        <directionalLight position={[1.4, 2.2, 1.8]} intensity={2.2} />
        <directionalLight position={[-1.8, 0.6, -1.2]} intensity={0.7} />
        <Studio />
        <Suspense fallback={null}>
          <StandModel config={config} label={texture} spin={spin} />
        </Suspense>
      </Canvas>

      {/* Rysownia naklejki — niewidoczna, musi być zamontowana. */}
      <LabelSurface />

      <View style={[styles.floor, { backgroundColor: theme.hair }]} pointerEvents="none" />
    </View>
  );
}

/**
 * Odbicia otoczenia z generowanego wnętrza. Bez tego lakier na naklejce
 * nie ma czego odbijać i wygląda jak matowy papier.
 */
function Studio() {
  const { gl, scene } = useThree();

  useEffect(() => {
    // Mapa odbić powstaje przez render do tekstury zmiennoprzecinkowej.
    // Nie każde starsze GL ES to potrafi — gdy się nie uda, zostają same
    // światła. Model dalej widać, tylko lakier jest bardziej matowy.
    let pmrem: THREE.PMREMGenerator | null = null;
    let env: { texture: THREE.Texture } | null = null;
    try {
      pmrem = new THREE.PMREMGenerator(gl);
      env = pmrem.fromScene(new RoomEnvironment(), 0.04);
      scene.environment = env.texture;
    } catch {
      pmrem?.dispose();
      pmrem = null;
      env = null;
    }
    return () => {
      scene.environment = null;
      env?.texture.dispose();
      pmrem?.dispose();
    };
  }, [gl, scene]);

  return null;
}

const styles = StyleSheet.create({
  root: { width: '100%', overflow: 'hidden' },
  // delikatna kreska pod modelem, żeby nie wisiał w próżni
  floor: { position: 'absolute', left: '18%', right: '18%', bottom: 18, height: 1 },
});
