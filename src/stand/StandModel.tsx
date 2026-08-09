import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STAND_BODY, type StandConfig } from './config';
import type { SpinState } from './spin';

/**
 * Model stojaka wczytany z `assets/stojak.glb`.
 *
 * Nazwy w pliku: obiekty to `Stojak_Obudowa` i `Stojak_Naklejka`, a materiały
 * — `Mat_Stojak` i `Stojak_Etykieta`. Szukamy najpierw po obiekcie, potem po
 * materiale, żeby przemianowanie w Blenderze niczego nie wysypało.
 *
 * Kolor obudowy i naklejka zmieniają się na istniejących materiałach, bez
 * ponownego wczytywania modelu.
 */

/** Ile bezruchu, zanim model wróci do powolnego obrotu. */
const IDLE_MS = 1400;
/** Obrót jałowy: pełne koło w ~28 s. */
const IDLE_SPEED = (Math.PI * 2) / 28;

export function StandModel({
  config,
  label,
  spin,
}: {
  config: StandConfig;
  label: THREE.Texture | null;
  spin: React.RefObject<SpinState>;
}) {
  const gltf = useLoader(GLTFLoader, require('../../assets/stojak.glb') as string);
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();

  /**
   * Model jest współdzielony przez pamięć podręczną loadera, a my zmieniamy
   * mu materiały — dlatego pracujemy na własnej kopii.
   */
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);

  const parts = useMemo(() => {
    const byName = (object: string, material: string) => {
      const node = scene.getObjectByName(object);
      if (node instanceof THREE.Mesh) return node;
      let found: THREE.Mesh | null = null;
      scene.traverse((o) => {
        if (found || !(o instanceof THREE.Mesh)) return;
        const mat = Array.isArray(o.material) ? o.material[0] : o.material;
        if (mat?.name === material) found = o;
      });
      return found;
    };
    return {
      body: byName('Stojak_Obudowa', 'Mat_Stojak'),
      label: byName('Stojak_Naklejka', 'Stojak_Etykieta'),
    };
  }, [scene]);

  /* ── materiały: własne kopie, żeby nie ruszać cache'a loadera ── */
  const materials = useMemo(() => {
    const body = parts.body
      ? ((Array.isArray(parts.body.material) ? parts.body.material[0] : parts.body.material).clone() as THREE.MeshStandardMaterial)
      : null;
    if (body && parts.body) parts.body.material = body;

    // Naklejka to lakierowana folia: mały „roughness", wyraźny odblask.
    const sticker = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0,
      specularIntensity: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      // Cienka nakładka tuż nad obudową — bez tego walczy z nią o głębię.
      depthWrite: false,
    });
    if (parts.label) {
      parts.label.material = sticker;
      parts.label.renderOrder = 1;
    }
    return { body, sticker };
  }, [parts]);

  useEffect(
    () => () => {
      materials.body?.dispose();
      materials.sticker.dispose();
    },
    [materials],
  );

  /* ── kolor obudowy na żywo ── */
  useEffect(() => {
    materials.body?.color.set(STAND_BODY[config.color]);
    if (materials.body) materials.body.needsUpdate = true;
  }, [materials.body, config.color]);

  /* ── naklejka na żywo ── */
  useEffect(() => {
    materials.sticker.map = label;
    materials.sticker.needsUpdate = true;
  }, [materials.sticker, label]);

  /* ── wyśrodkowanie i ustawienie kamery pod rozmiar modelu ── */
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    scene.position.sub(center);

    const radius = Math.max(size.x, size.y, size.z) * 0.5;
    if (!(camera instanceof THREE.PerspectiveCamera) || radius <= 0) return;
    const fov = (camera.fov * Math.PI) / 180;
    // zapas 1.6, żeby stojak nie dotykał krawędzi przy obrocie
    const distance = (radius / Math.sin(fov / 2)) * 1.6;
    camera.position.set(0, radius * 0.35, distance);
    camera.near = distance / 100;
    camera.far = distance * 10;
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [scene, camera]);

  /* ── obrót: palcem, a w spoczynku sam ── */
  useFrame((_, delta) => {
    const s = spin.current;
    if (!group.current || !s) return;
    if (!s.dragging && Date.now() - s.touched > IDLE_MS) s.y += IDLE_SPEED * delta;
    group.current.rotation.y = s.y;
    group.current.rotation.x = s.x;
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}
