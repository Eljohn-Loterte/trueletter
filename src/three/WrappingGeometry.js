import * as THREE from 'three';

/**
 * Creates the Onyx Silk with Gold Stripes texture
 * Features deep charcoal/black silk weave with bold metallic gold borders along edges
 * and random gold accent stripes on the sides of the sheets as requested by the user
 */
function createOnyxGoldTexture(baseColor = '#181a1f', goldColor = '#dfb858') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // 1. Deep Onyx Silk background with gentle diagonal sheen
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, '#101216');
  grad.addColorStop(0.5, '#191c22');
  grad.addColorStop(1, '#121417');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Fine vertical silk pinstripes
  ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
  for (let x = 0; x < 1024; x += 16) {
    ctx.fillRect(x, 0, 8, 1024);
  }

  // 3. Bold Gold Leaf Edge Borders along the sides and top of the sheet
  ctx.strokeStyle = goldColor;
  ctx.lineWidth = 18;
  ctx.strokeRect(12, 12, 1000, 1000);

  // Inner secondary gold pinstripe border
  ctx.strokeStyle = 'rgba(255, 225, 120, 0.7)';
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 960, 960);

  // 4. Random gold stripes along the sides of the sheet ("squares having random stripes on the sides")
  ctx.strokeStyle = goldColor;
  const stripes = [
    { x1: 12,  y1: 160,  x2: 280, y2: 32,   w: 7 },
    { x1: 740, y1: 32,   x2: 1012, y2: 180, w: 8 },
    { x1: 12,  y1: 380,  x2: 240, y2: 280,  w: 6 },
    { x1: 800, y1: 280,  x2: 1012, y2: 420, w: 6 },
    { x1: 12,  y1: 620,  x2: 210, y2: 520,  w: 5 },
    { x1: 820, y1: 520,  x2: 1012, y2: 660, w: 5 },
    { x1: 32,  y1: 1000, x2: 360, y2: 1000, w: 8 },
    { x1: 660, y1: 1000, x2: 992, y2: 1000, w: 8 }
  ];

  stripes.forEach((st) => {
    ctx.lineWidth = st.w;
    ctx.beginPath();
    ctx.moveTo(st.x1, st.y1);
    ctx.lineTo(st.x2, st.y2);
    ctx.stroke();
  });

  // Delicate gold marbling vein accents
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.65;
  ctx.beginPath();
  ctx.moveTo(150, 24);
  ctx.bezierCurveTo(290, 240, 180, 500, 360, 760);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(850, 40);
  ctx.bezierCurveTo(720, 300, 840, 580, 670, 860);
  ctx.stroke();
  ctx.globalAlpha = 1.0;

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Creates a single rectangular paper sheet curved/rounded diagonally around the cylinder/cone
 * "imagine a rectangle shape being rounded diagonally it forms a cylinder but with pointy edges because it is diagonally rounded"
 */
function createDiagonallyWrappedSheetGeometry(options = {}) {
  const {
    centerAngle = 0,            // Center azimuth theta around the bouquet
    angleSpan = Math.PI * 0.85,    // How far around the cylinder this sheet wraps
    waistY = -1.35,
    waistRadius = 0.96,
    rimRadius = 3.9,            // Expanded grande flare!
    peakHeight = 4.8,           // Height of the diagonal corner peak
    peakT = 0.0,                // Lateral position of corner peak (-1 to +1)
    slopeLeft = 1.45,           // Downward slope of the diagonal rectangle edge to the left
    slopeRight = 1.55,          // Downward slope to the right
    radialOffset = 0.0,         // Layering distance so sheets wrap over each other cleanly
    zFlareBack = 0.45,
    uSeg = 26,
    vSeg = 30
  } = options;

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let j = 0; j <= vSeg; j++) {
    const v = j / vSeg; // 0 at waist, 1 at top edge

    for (let i = 0; i <= uSeg; i++) {
      const u = i / uSeg;
      const t = (u - 0.5) * 2; // -1 (left edge of sheet) to +1 (right edge of sheet)

      // Angle along the cylinder
      const theta = centerAngle + t * (angleSpan * 0.5);

      // Top edge height of a diagonal rectangle:
      // Reaches sharp pointed corner at peakT, and slopes down diagonally to both sides
      const distFromPeak = t - peakT;
      const slope = distFromPeak < 0 ? slopeLeft * (-distFromPeak) : slopeRight * distFromPeak;
      const topY = peakHeight - slope;

      // Vertical position from waist to the diagonal top edge
      const y = waistY + (topY - waistY) * Math.pow(v, 0.96);

      // Conical expansion: radius expands as y rises
      const hRatio = Math.max(0, Math.min(1, (y - waistY) / (5.0 - waistY)));
      const baseR = (waistRadius + (rimRadius - waistRadius) * Math.pow(hRatio, 1.14)) + radialOffset;

      // Subtle fluting along the sheet width for tactile paper stiffness
      const flute = (1 - t * t) * 0.045 * Math.sin(v * Math.PI);
      const r = baseR + flute;

      // Position in 3D: rounded seamlessly along the cylinder/cone
      const backLean = Math.max(0, -Math.cos(theta)) * Math.pow(hRatio, 1.4) * zFlareBack;
      const x = Math.sin(theta) * r;
      const z = Math.cos(theta) * r - backLean;

      positions.push(x, y, z);
      // UV mapping: maps texture diagonally across the sheet to align with the fold
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < vSeg; j++) {
    for (let i = 0; i < uSeg; i++) {
      const a = j * (uSeg + 1) + i;
      const b = j * (uSeg + 1) + i + 1;
      const c = (j + 1) * (uSeg + 1) + i;
      const d = (j + 1) * (uSeg + 1) + i + 1;

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

/**
 * Creates the complete rounded bouquet cover wrapped using overlapping diagonal rectangles
 * Sized substantially larger (super grande, tall back peaks, wide flaring wings)
 */
export function createBouquetWrapping(wrapColor = '#181a1f', accentColor = '#dfb858') {
  const wrapGroup = new THREE.Group();
  wrapGroup.name = 'wrapping';

  // Onyx silk with gold stripes & borders texture
  const onyxGoldTexture = createOnyxGoldTexture(wrapColor, accentColor);

  const onyxMat = new THREE.MeshStandardMaterial({
    map: onyxGoldTexture,
    color: new THREE.Color(wrapColor),
    roughness: 0.36,
    metalness: 0.28,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  });

  // Inner lining paper texture (cream white with gold accents)
  const innerTexture = createOnyxGoldTexture('#fcfbf9', '#dfb858');
  const innerMat = new THREE.MeshStandardMaterial({
    map: innerTexture,
    color: 0xffffff,
    roughness: 0.44,
    metalness: 0.08,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  });

  const waistY = -1.35;
  const waistRadius = 0.82; // Thinner, sleek pinched waist!

  // 1. BACK TALL DIAGONAL SHEETS (Super grande, tall pointed peaks rising up to y ≈ 5.1!)
  const backSheets = [
    // Center back sheet (rises tall to y ≈ 5.05, diagonal corner peak)
    {
      centerAngle: Math.PI,
      angleSpan: Math.PI * 0.88,
      peakHeight: 5.05,
      peakT: 0.05,
      slopeLeft: 1.5,
      slopeRight: 1.5,
      radialOffset: 0.0,
      rimRadius: 4.15,
      zFlareBack: 0.50
    },
    // Back-left tall diagonal sheet (corner peak at y ≈ 4.70, rotated to angle 215°)
    {
      centerAngle: Math.PI * 1.20,
      angleSpan: Math.PI * 0.84,
      peakHeight: 4.70,
      peakT: -0.15,
      slopeLeft: 1.6,
      slopeRight: 1.35,
      radialOffset: 0.04,
      rimRadius: 4.0,
      zFlareBack: 0.45
    },
    // Back-right tall diagonal sheet (corner peak at y ≈ 4.80, rotated to angle 145°)
    {
      centerAngle: Math.PI * 0.80,
      angleSpan: Math.PI * 0.84,
      peakHeight: 4.80,
      peakT: 0.15,
      slopeLeft: 1.35,
      slopeRight: 1.6,
      radialOffset: 0.05,
      rimRadius: 4.05,
      zFlareBack: 0.45
    }
  ];

  backSheets.forEach((cfg) => {
    const geo = createDiagonallyWrappedSheetGeometry({
      centerAngle: cfg.centerAngle,
      angleSpan: cfg.angleSpan,
      waistY,
      waistRadius,
      rimRadius: cfg.rimRadius,
      peakHeight: cfg.peakHeight,
      peakT: cfg.peakT,
      slopeLeft: cfg.slopeLeft,
      slopeRight: cfg.slopeRight,
      radialOffset: cfg.radialOffset,
      zFlareBack: cfg.zFlareBack
    });
    const mesh = new THREE.Mesh(geo, onyxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wrapGroup.add(mesh);
  });

  // 2. INNER LINING LAYER (Folded luxury depth in cream and gold)
  const innerSheets = [
    {
      centerAngle: Math.PI * 1.08,
      angleSpan: Math.PI * 0.80,
      peakHeight: 4.45,
      peakT: 0.0,
      slopeLeft: 1.4,
      slopeRight: 1.4,
      radialOffset: -0.04,
      rimRadius: 3.85,
      zFlareBack: 0.40
    },
    {
      centerAngle: Math.PI * 0.92,
      angleSpan: Math.PI * 0.80,
      peakHeight: 4.40,
      peakT: 0.0,
      slopeLeft: 1.4,
      slopeRight: 1.4,
      radialOffset: -0.04,
      rimRadius: 3.85,
      zFlareBack: 0.40
    }
  ];

  innerSheets.forEach((cfg) => {
    const geo = createDiagonallyWrappedSheetGeometry({
      centerAngle: cfg.centerAngle,
      angleSpan: cfg.angleSpan,
      waistY: waistY + 0.02,
      waistRadius: waistRadius - 0.03,
      rimRadius: cfg.rimRadius,
      peakHeight: cfg.peakHeight,
      peakT: cfg.peakT,
      slopeLeft: cfg.slopeLeft,
      slopeRight: cfg.slopeRight,
      radialOffset: cfg.radialOffset,
      zFlareBack: cfg.zFlareBack
    });
    const mesh = new THREE.Mesh(geo, innerMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wrapGroup.add(mesh);
  });

  // 3. SIDE FLARING DIAGONAL SHEETS (Expanding wide to x ≈ ±3.5, peaks at y ≈ 3.8 - 4.1)
  const sideSheets = [
    // Left side sheet (center angle 255°, peak at y ≈ 3.90)
    {
      centerAngle: Math.PI * 1.44,
      angleSpan: Math.PI * 0.82,
      peakHeight: 3.90,
      peakT: -0.1,
      slopeLeft: 1.5,
      slopeRight: 1.7,
      radialOffset: 0.07,
      rimRadius: 3.75,
      zFlareBack: 0.20
    },
    // Right side sheet (center angle 105°, peak at y ≈ 3.95)
    {
      centerAngle: Math.PI * 0.56,
      angleSpan: Math.PI * 0.82,
      peakHeight: 3.95,
      peakT: 0.1,
      slopeLeft: 1.7,
      slopeRight: 1.5,
      radialOffset: 0.08,
      rimRadius: 3.75,
      zFlareBack: 0.20
    }
  ];

  sideSheets.forEach((cfg) => {
    const geo = createDiagonallyWrappedSheetGeometry({
      centerAngle: cfg.centerAngle,
      angleSpan: cfg.angleSpan,
      waistY,
      waistRadius,
      rimRadius: cfg.rimRadius,
      peakHeight: cfg.peakHeight,
      peakT: cfg.peakT,
      slopeLeft: cfg.slopeLeft,
      slopeRight: cfg.slopeRight,
      radialOffset: cfg.radialOffset,
      zFlareBack: cfg.zFlareBack
    });
    const mesh = new THREE.Mesh(geo, onyxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wrapGroup.add(mesh);
  });

  // 4. FRONT COLLAR SHEETS
  // Wrapping seamlessly across the front to cradle the roses securely inside!
  const frontSheets = [
    // Front-left sheet (center angle 315°)
    {
      centerAngle: Math.PI * 1.75,
      angleSpan: Math.PI * 0.78,
      peakHeight: 2.05,
      peakT: -0.2,
      slopeLeft: 1.3,
      slopeRight: 1.4,
      radialOffset: 0.09,
      rimRadius: 3.35,
      zFlareBack: 0.0
    },
    // Front-right sheet (center angle 45°)
    {
      centerAngle: Math.PI * 0.25,
      angleSpan: Math.PI * 0.78,
      peakHeight: 2.10,
      peakT: 0.2,
      slopeLeft: 1.4,
      slopeRight: 1.3,
      radialOffset: 0.10,
      rimRadius: 3.35,
      zFlareBack: 0.0
    },
    // Front-center low cuff (front cradle - allows roses to pop out prominently above the rim!)
    {
      centerAngle: 0.0,
      angleSpan: Math.PI * 0.74,
      peakHeight: 1.42,
      peakT: 0.0,
      slopeLeft: 1.25,
      slopeRight: 1.25,
      radialOffset: 0.12,
      rimRadius: 3.25,
      zFlareBack: 0.0
    }
  ];

  frontSheets.forEach((cfg) => {
    const geo = createDiagonallyWrappedSheetGeometry({
      centerAngle: cfg.centerAngle,
      angleSpan: cfg.angleSpan,
      waistY,
      waistRadius,
      rimRadius: cfg.rimRadius,
      peakHeight: cfg.peakHeight,
      peakT: cfg.peakT,
      slopeLeft: cfg.slopeLeft,
      slopeRight: cfg.slopeRight,
      radialOffset: cfg.radialOffset,
      zFlareBack: cfg.zFlareBack
    });
    const mesh = new THREE.Mesh(geo, onyxMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    wrapGroup.add(mesh);
  });

  // 5. LOWER HOURGLASS HANDLE (^ TYPE FLARING OUTWARD FROM THE PINCHED WAIST)
  // Sleek, thinner hourglass silhouette; completely hollow tube (open-ended) without bottom endcap/circle
  const handleHeight = 2.5;
  const bottomFlareRadius = 1.20; // Thinner flared skirt (slender hourglass)

  // Completely hollow flaring lower cone (openEnded: true)
  const hourglassBaseGeo = new THREE.CylinderGeometry(waistRadius, bottomFlareRadius, handleHeight, 36, 12, true);
  const hourglassBase = new THREE.Mesh(hourglassBaseGeo, onyxMat);
  hourglassBase.position.y = waistY - handleHeight * 0.5;
  hourglassBase.castShadow = true;
  hourglassBase.receiveShadow = true;
  wrapGroup.add(hourglassBase);

  // Layered diagonal origami folds on the hollow hourglass handle with gold borders
  for (let f = 0; f < 4; f++) {
    const foldAngle = (f / 4) * Math.PI * 2;
    const foldGeo = new THREE.CylinderGeometry(waistRadius + 0.015, bottomFlareRadius + 0.025, handleHeight * 0.92, 18, 4, true, foldAngle, Math.PI * 0.65);
    const foldMesh = new THREE.Mesh(foldGeo, onyxMat);
    foldMesh.position.y = waistY - handleHeight * 0.5;
    foldMesh.rotation.y = foldAngle;
    foldMesh.castShadow = true;
    foldMesh.receiveShadow = true;
    wrapGroup.add(foldMesh);
  }

  // Gold accent ring at the cinched waist
  const goldBandGeo = new THREE.TorusGeometry(waistRadius + 0.018, 0.024, 8, 36);
  const goldBandMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accentColor),
    roughness: 0.22,
    metalness: 0.88
  });
  const goldBand = new THREE.Mesh(goldBandGeo, goldBandMat);
  goldBand.position.y = waistY;
  goldBand.rotation.x = Math.PI / 2;
  wrapGroup.add(goldBand);

  // 6. Gathered trimmed stems emerging from the hollow center of the flared handle
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x1f5223,
    roughness: 0.65
  });

  const stemBundle = new THREE.Group();
  for (let s = 0; s < 22; s++) {
    const angle = (s / 22) * Math.PI * 2;
    const r = Math.random() * 0.32;
    const sx = Math.cos(angle) * r;
    const sz = Math.sin(angle) * r;
    const sLen = 0.95 + (Math.random() - 0.5) * 0.18;

    const sGeo = new THREE.CylinderGeometry(0.042, 0.042, sLen, 6);
    const sMesh = new THREE.Mesh(sGeo, stemMat);
    sMesh.position.set(sx, waistY - handleHeight - sLen * 0.35, sz);
    sMesh.rotation.z = (Math.random() - 0.5) * 0.06;
    sMesh.castShadow = true;
    stemBundle.add(sMesh);
  }
  wrapGroup.add(stemBundle);

  wrapGroup.userData = {
    outerMat: onyxMat,
    innerMat,
    waistY,
    waistRadius: waistRadius + 0.02
  };

  return wrapGroup;
}
