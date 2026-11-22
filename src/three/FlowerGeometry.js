import * as THREE from 'three';

// ============================================================================
// 1. SUNFLOWER (Helianthus annuus)
// Golden yellow radiating petals with a rich, dark textured disc floret center
// ============================================================================

/**
 * Creates procedural texture for sunflower seed disc (Fermat spiral phyllotaxis)
 */
function createSunflowerDiscTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Base gradient: deep espresso brown center to golden amber outer ring
  const radGrad = ctx.createRadialGradient(256, 256, 10, 256, 256, 250);
  radGrad.addColorStop(0.0, '#1c0f06');
  radGrad.addColorStop(0.45, '#2e180a');
  radGrad.addColorStop(0.78, '#4a280e');
  radGrad.addColorStop(0.92, '#7a4212');
  radGrad.addColorStop(1.0, '#a66214'); // Golden rim before petals

  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Fermat spiral seed dots
  const goldenAngle = 2.399963;
  const totalSeeds = 520;
  for (let i = 0; i < totalSeeds; i++) {
    const r = Math.sqrt(i / totalSeeds) * 238;
    const theta = i * goldenAngle;
    const x = 256 + Math.cos(theta) * r;
    const y = 256 + Math.sin(theta) * r;

    const seedR = 1.4 + (r / 238) * 1.8;
    const isOuter = r > 180;
    ctx.fillStyle = isOuter ? '#b56d1b' : (i % 2 === 0 ? '#150a04' : '#381e0c');

    ctx.beginPath();
    ctx.arc(x, y, seedR, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Creates procedural texture for sunflower ray petals
 */
function createSunflowerPetalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Golden amber base to radiant sunny yellow tip
  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0.0, '#e58500'); // Warm amber base
  grad.addColorStop(0.25, '#f59e0b');
  grad.addColorStop(0.65, '#fbbf24');
  grad.addColorStop(1.0, '#fde047'); // Bright sunshine tip

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  // Delicate longitudinal ray veins
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
  ctx.lineWidth = 1.2;
  for (let v = 0; v < 7; v++) {
    const x = 32 + v * 32;
    ctx.beginPath();
    ctx.moveTo(x + (Math.random() - 0.5) * 8, 512);
    ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 12, 256, x + (Math.random() - 0.5) * 6, 20);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Creates an authentic, blooming Sunflower head
 * Features:
 * - Three lush, dense rings of radiant golden ray petals (staggered without twisting or distortion)
 * - Domed dark chocolate espresso seed disc with Fermat spiral florets and golden rim
 * - Protective calyx with leafy green sepals on the underside
 */
export function createSunflowerHead() {
  const group = new THREE.Group();
  group.name = 'sunflower';

  const discTex = createSunflowerDiscTexture();
  const petalTex = createSunflowerPetalTexture();

  // 1. Central Seed Disc (gently domed center)
  const discRadius = 0.48;
  const discGeo = new THREE.CylinderGeometry(discRadius, discRadius * 0.88, 0.12, 36, 4);
  const pos = discGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    if (y > 0.03) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z);
      const ratio = Math.min(1, dist / discRadius);
      const dome = (1 - ratio * ratio) * 0.065;
      pos.setY(i, y + dome);
    }
  }
  discGeo.computeVertexNormals();

  const discMat = new THREE.MeshStandardMaterial({
    map: discTex,
    roughness: 0.85,
    metalness: 0.04
  });
  const discMesh = new THREE.Mesh(discGeo, discMat);
  discMesh.castShadow = true;
  discMesh.receiveShadow = true;
  group.add(discMesh);

  // Amber disc-floret transitional ring between disc and ray petals
  const floretRingGeo = new THREE.TorusGeometry(discRadius * 0.94, 0.032, 8, 36);
  const floretRingMat = new THREE.MeshStandardMaterial({
    color: 0x853909,
    roughness: 0.8
  });
  const floretRing = new THREE.Mesh(floretRingGeo, floretRingMat);
  floretRing.rotation.x = Math.PI / 2;
  floretRing.position.y = 0.06;
  group.add(floretRing);

  // 2. Sunflower Ray Petals
  const petalMat = new THREE.MeshStandardMaterial({
    map: petalTex,
    roughness: 0.38,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  // Petal geometry: built along Z axis (base at z=0, tip at z=len, width along X, normal facing +Y)
  function createSunflowerPetalGeometry(w = 0.22, len = 0.74) {
    const uSegs = 10;
    const vSegs = 16;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j <= vSegs; j++) {
      const v = j / vSegs; // 0 at base, 1 at tip
      // Lanceolate taper: narrow base, wide voluptuous body at mid, acute tapered tip
      const body = Math.sin(v * Math.PI) * (1 - Math.pow(v, 2.8) * 0.42);
      const curW = w * Math.max(0.12, body);

      // Subtle outward tip curl
      const tipCurl = Math.pow(v, 2.2) * 0.09;

      for (let i = 0; i <= uSegs; i++) {
        const u = i / uSegs;
        const uCent = (u - 0.5) * 2; // -1 to +1

        const x = uCent * (curW * 0.5);
        // Longitudinal center groove/crease
        const crease = (1 - Math.abs(uCent)) * 0.032 * Math.sin(v * Math.PI * 0.9);
        const y = crease - tipCurl;
        const z = v * len;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let j = 0; j < vSegs; j++) {
      for (let i = 0; i < uSegs; i++) {
        const a = j * (uSegs + 1) + i;
        const b = j * (uSegs + 1) + i + 1;
        const c = (j + 1) * (uSegs + 1) + i;
        const d = (j + 1) * (uSegs + 1) + i + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // Helper to add clean radial rings via rotation pivots (100% distortion-free)
  function addRadialPetalRing(count, r, petalGeo, layerY, flareAngle, angleOffset = 0) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + angleOffset;
      const pivot = new THREE.Group();
      pivot.position.y = layerY;
      pivot.rotation.y = angle;

      const petalMesh = new THREE.Mesh(petalGeo, petalMat);
      petalMesh.position.z = r;
      petalMesh.rotation.x = flareAngle;
      petalMesh.rotation.z = (Math.random() - 0.5) * 0.03;
      petalMesh.castShadow = true;
      pivot.add(petalMesh);

      group.add(pivot);
    }
  }

  // Layer 1 (Outer): 24 long sweeping petals
  const outerPetalGeo = createSunflowerPetalGeometry(0.24, 0.78);
  addRadialPetalRing(24, 0.44, outerPetalGeo, -0.02, 0.15, 0);

  // Layer 2 (Middle): 22 medium petals, staggered in gaps
  const midPetalGeo = createSunflowerPetalGeometry(0.21, 0.68);
  addRadialPetalRing(22, 0.42, midPetalGeo, 0.01, 0.09, Math.PI / 22);

  // Layer 3 (Inner): 18 shorter accent petals framing the seed disc
  const innerPetalGeo = createSunflowerPetalGeometry(0.18, 0.54);
  addRadialPetalRing(18, 0.40, innerPetalGeo, 0.03, 0.03, Math.PI / 18);

  // 3. Green calyx and sepals on underside
  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x1d4d1f,
    roughness: 0.65
  });

  const baseBulbGeo = new THREE.CylinderGeometry(0.44, 0.16, 0.20, 24);
  const baseBulb = new THREE.Mesh(baseBulbGeo, greenMat);
  baseBulb.position.y = -0.10;
  baseBulb.castShadow = true;
  group.add(baseBulb);

  const sepalGeo = new THREE.ConeGeometry(0.08, 0.36, 5);
  sepalGeo.rotateX(Math.PI / 2);

  for (let s = 0; s < 16; s++) {
    const angle = (s / 16) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.position.y = -0.06;
    pivot.rotation.y = angle;

    const sepal = new THREE.Mesh(sepalGeo, greenMat);
    sepal.position.z = 0.40;
    sepal.rotation.x = -0.32; // Tucks snugly underneath the ray petals
    pivot.add(sepal);
    group.add(pivot);
  }

  group.scale.set(1.18, 1.18, 1.18);
  return group;
}


// ============================================================================
// 2. TULIP (Tulipa)
// Elegant cup-shaped bloom with 6 overlapping silky petals
// ============================================================================

function createTulipPetalTexture(baseColor = '#ff6b8b') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0.0, '#eaf2d7'); // Soft pale chartreuse at base
  grad.addColorStop(0.2, '#fecdd3'); // Soft pink blend
  grad.addColorStop(0.65, baseColor); // Primary vibrant tulip petal color
  grad.addColorStop(1.0, '#fda4af'); // Delicate lighter rim

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  // Soft satin grain veins
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 1;
  for (let v = 0; v < 12; v++) {
    const x = 20 + v * 18;
    ctx.beginPath();
    ctx.moveTo(x, 512);
    ctx.lineTo(x + (Math.random() - 0.5) * 8, 20);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export function createTulipHead(colorHex = '#ff5b79') {
  const group = new THREE.Group();
  group.name = 'tulip';

  const petalTex = createTulipPetalTexture(colorHex);
  const petalMat = new THREE.MeshStandardMaterial({
    map: petalTex,
    color: new THREE.Color(colorHex),
    roughness: 0.32,
    metalness: 0.04,
    side: THREE.DoubleSide
  });

  // Curved cup petal geometry
  function createTulipPetalGeometry(w = 0.52, h = 0.95, cup = 0.28) {
    const uSegs = 16;
    const vSegs = 20;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j <= vSegs; j++) {
      const v = j / vSegs;
      // Elliptic petal profile: narrow at base, broad at mid-height, tapered softly at apex
      const shoulder = Math.sin(v * Math.PI * 0.92);
      const curW = w * (0.2 + 0.8 * shoulder);
      // Inward cupping curve
      const inwardCurve = Math.sin(v * Math.PI) * cup;

      for (let i = 0; i <= uSegs; i++) {
        const u = i / uSegs;
        const uCent = (u - 0.5) * 2;
        const arch = (1 - uCent * uCent) * 0.05 * v;
        const x = uCent * (curW * 0.5);
        const y = v * h + arch;
        const z = (1 - uCent * uCent) * inwardCurve;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let j = 0; j < vSegs; j++) {
      for (let i = 0; i < uSegs; i++) {
        const a = j * (uSegs + 1) + i;
        const b = j * (uSegs + 1) + i + 1;
        const c = (j + 1) * (uSegs + 1) + i;
        const d = (j + 1) * (uSegs + 1) + i + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // 3 Inner Tepals (tighter cup)
  const innerGeo = createTulipPetalGeometry(0.50, 0.92, 0.32);
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const petal = new THREE.Mesh(innerGeo, petalMat);
    const r = 0.12;
    petal.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
    petal.rotation.y = -angle + Math.PI / 2;
    petal.rotation.x = 0.14; // Lean slightly inward
    petal.castShadow = true;
    group.add(petal);
  }

  // 3 Outer Tepals (slightly broader, hugging inner petals)
  const outerGeo = createTulipPetalGeometry(0.56, 0.96, 0.30);
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2 + Math.PI / 3;
    const petal = new THREE.Mesh(outerGeo, petalMat);
    const r = 0.16;
    petal.position.set(Math.cos(angle) * r, -0.02, Math.sin(angle) * r);
    petal.rotation.y = -angle + Math.PI / 2;
    petal.rotation.x = 0.20; // Slightly open
    petal.castShadow = true;
    group.add(petal);
  }

  // Inside pistil and stamens
  const pistilMat = new THREE.MeshStandardMaterial({ color: 0x98ca32, roughness: 0.6 });
  const pistilGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.45, 6);
  const pistil = new THREE.Mesh(pistilGeo, pistilMat);
  pistil.position.y = 0.22;
  group.add(pistil);

  // Calyx base
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x225526, roughness: 0.6 });
  const baseGeo = new THREE.SphereGeometry(0.18, 12, 10);
  baseGeo.scale(1, 1.2, 1);
  const base = new THREE.Mesh(baseGeo, greenMat);
  base.position.y = -0.08;
  group.add(base);

  group.scale.set(0.95, 0.95, 0.95);
  return group;
}


// ============================================================================
// 3. LILY (Lilium / Stargazer Lily)
// Grand star-shaped 6 reflexed petals with stamens and russet anthers
// ============================================================================

function createLilyPetalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Stargazer gradient: pure white edge, vibrant fuchsia/crimson throat center
  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0.0, '#4ade80'); // Green throat base
  grad.addColorStop(0.18, '#db2777'); // Deep fuchsia pink
  grad.addColorStop(0.55, '#f472b6'); // Soft pink
  grad.addColorStop(0.85, '#fdf2f8'); // Luminous ivory white tip
  grad.addColorStop(1.0, '#ffffff');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 512);

  // Papillae (deep crimson freckles along center throat)
  for (let f = 0; f < 65; f++) {
    const x = 128 + (Math.random() - 0.5) * 60;
    const y = 140 + Math.random() * 260;
    const r = 1.2 + Math.random() * 1.8;
    ctx.fillStyle = '#831843';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Strong central raised rib line
  ctx.strokeStyle = '#be185d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(128, 512);
  ctx.lineTo(128, 60);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

export function createLilyHead() {
  const group = new THREE.Group();
  group.name = 'lily';

  const petalTex = createLilyPetalTexture();
  const petalMat = new THREE.MeshStandardMaterial({
    map: petalTex,
    roughness: 0.35,
    metalness: 0.02,
    side: THREE.DoubleSide
  });

  // Long lanceolate petal that arches outward and curls backward
  function createLilyPetalGeometry(w = 0.42, len = 1.25) {
    const uSegs = 14;
    const vSegs = 22;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let j = 0; j <= vSegs; j++) {
      const v = j / vSegs;
      // Lanceolate profile
      const shoulder = Math.sin(v * Math.PI * 0.88);
      const curW = w * (0.15 + 0.85 * shoulder);
      // Elegant backward recurve
      const arch = Math.sin(v * Math.PI * 0.7) * 0.35 - Math.pow(v, 2.5) * 0.55;

      for (let i = 0; i <= uSegs; i++) {
        const u = i / uSegs;
        const uCent = (u - 0.5) * 2;
        const x = uCent * (curW * 0.5);
        const y = v * len;
        // Central groove + wavy ruffle on edge
        const groove = Math.abs(uCent) * 0.05;
        const ruffle = Math.sin(uCent * Math.PI * 3 + v * 6) * 0.02 * v;
        const z = arch - groove + ruffle;

        positions.push(x, y, z);
        uvs.push(u, v);
      }
    }

    for (let j = 0; j < vSegs; j++) {
      for (let i = 0; i < uSegs; i++) {
        const a = j * (uSegs + 1) + i;
        const b = j * (uSegs + 1) + i + 1;
        const c = (j + 1) * (uSegs + 1) + i;
        const d = (j + 1) * (uSegs + 1) + i + 1;
        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  // 6 Petals arranged in a star pattern (3 inner, 3 outer alternating)
  const innerGeo = createLilyPetalGeometry(0.44, 1.28);
  const outerGeo = createLilyPetalGeometry(0.40, 1.22);

  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const isInner = i % 2 === 0;
    const geo = isInner ? innerGeo : outerGeo;
    const petal = new THREE.Mesh(geo, petalMat);

    const r = isInner ? 0.08 : 0.11;
    petal.position.set(Math.cos(angle) * r, isInner ? 0.02 : 0, Math.sin(angle) * r);
    petal.rotation.y = -angle + Math.PI / 2;
    petal.rotation.x = Math.PI / 2 - 0.55; // Spread open wide in star shape
    petal.castShadow = true;
    group.add(petal);
  }

  // 6 Long stamens with T-shaped rusty anthers
  const filamentMat = new THREE.MeshStandardMaterial({ color: 0xc4ef98, roughness: 0.5 });
  const antherMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.7 }); // Dusty terracotta/russet

  for (let s = 0; s < 6; s++) {
    const angle = (s / 6) * Math.PI * 2 + 0.25;
    const filamentGroup = new THREE.Group();

    const fGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.65, 5);
    const filament = new THREE.Mesh(fGeo, filamentMat);
    filament.position.y = 0.32;
    filamentGroup.add(filament);

    // T-shaped pollen anther at tip
    const aGeo = new THREE.BoxGeometry(0.04, 0.12, 0.04);
    const anther = new THREE.Mesh(aGeo, antherMat);
    anther.position.y = 0.65;
    anther.rotation.z = Math.PI / 2;
    filamentGroup.add(anther);

    filamentGroup.position.set(Math.cos(angle) * 0.08, 0.1, Math.sin(angle) * 0.08);
    filamentGroup.rotation.y = -angle;
    filamentGroup.rotation.x = 0.22;
    group.add(filamentGroup);
  }

  // Central pistil
  const pistilGeo = new THREE.CylinderGeometry(0.025, 0.03, 0.75, 6);
  const pistil = new THREE.Mesh(pistilGeo, filamentMat);
  pistil.position.y = 0.4;
  group.add(pistil);

  // Calyx base
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x1d4d1f, roughness: 0.65 });
  const bulbGeo = new THREE.CylinderGeometry(0.20, 0.12, 0.25, 12);
  const bulb = new THREE.Mesh(bulbGeo, greenMat);
  bulb.position.y = -0.12;
  group.add(bulb);

  group.scale.set(0.92, 0.92, 0.92);
  return group;
}


// ============================================================================
// 4. LAVENDER SPIRE (Lavandula angustifolia)
// Slender vertical stem with tiers of fragrant purple florets
// ============================================================================

export function createLavenderSpire() {
  const group = new THREE.Group();
  group.name = 'lavender';

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x4d7543, // Silvery sage green
    roughness: 0.8
  });

  const floretColors = [0x7c3aed, 0x8b5cf6, 0xa78bfa, 0x6d28d9];

  // Slender main vertical stem
  const stemLen = 2.2;
  const stemGeo = new THREE.CylinderGeometry(0.018, 0.026, stemLen, 5);
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = stemLen * 0.5;
  stem.castShadow = true;
  group.add(stem);

  // Fluted tiny floret geometry
  const floretGeo = new THREE.DodecahedronGeometry(0.045, 0);

  // 10 Whorls of florets stacked along the top 1.1 units of stem
  const whorlCount = 10;
  const startY = stemLen - 1.1;

  for (let w = 0; w < whorlCount; w++) {
    const t = w / whorlCount;
    const wy = startY + t * 0.95;
    const whorlRadius = (0.075 - t * 0.035); // Taper upward toward spike tip
    const floretsPerWhorl = 5 + Math.floor(Math.random() * 2);

    for (let f = 0; f < floretsPerWhorl; f++) {
      const angle = (f / floretsPerWhorl) * Math.PI * 2 + w * 0.7;
      const c = floretColors[(w + f) % floretColors.length];
      const fMat = new THREE.MeshStandardMaterial({
        color: c,
        roughness: 0.55
      });
      const floret = new THREE.Mesh(floretGeo, fMat);
      floret.position.set(
        Math.cos(angle) * whorlRadius,
        wy + (Math.random() - 0.5) * 0.03,
        Math.sin(angle) * whorlRadius
      );
      floret.scale.set(1.1, 1.4, 1.1); // Slightly elongated
      group.add(floret);
    }
  }

  return group;
}


// ============================================================================
// 5. DAISY / CHAMOMILE (Bellis perennis)
// Radiant white ray petals around a bright sunshine yellow center
// ============================================================================

export function createDaisyHead() {
  const group = new THREE.Group();
  group.name = 'daisy';

  // Bright golden disc center
  const discMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.6,
    emissive: 0x451a03
  });
  const discGeo = new THREE.SphereGeometry(0.24, 16, 12);
  discGeo.scale(1, 0.45, 1);
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.castShadow = true;
  group.add(disc);

  // 24 Crisp white ray petals
  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.35,
    side: THREE.DoubleSide
  });

  const petalGeo = new THREE.BoxGeometry(0.085, 0.015, 0.48);
  petalGeo.translate(0, 0, 0.24);

  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const petal = new THREE.Mesh(petalGeo, petalMat);
    petal.position.set(Math.cos(angle) * 0.20, 0, Math.sin(angle) * 0.20);
    petal.rotation.y = -angle;
    petal.rotation.x = 0.08 + (Math.random() - 0.5) * 0.04;
    petal.castShadow = true;
    group.add(petal);
  }

  // Base
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x1d4d1f, roughness: 0.7 });
  const baseGeo = new THREE.CylinderGeometry(0.18, 0.08, 0.14, 12);
  const base = new THREE.Mesh(baseGeo, greenMat);
  base.position.y = -0.07;
  group.add(base);

  group.scale.set(1.05, 1.05, 1.05);
  return group;
}
