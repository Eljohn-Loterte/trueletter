import * as THREE from 'three';

/**
 * Creates a procedural velvety petal canvas texture with subtle translucent veins
 * and warm champagne depth at the center (characteristic of real white tea roses)
 */
function createRosePetalTexture(baseColorHex = '#fdfcf7') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Background: gradient from warm creamy champagne at the base (v=0, bottom)
  // to luminous bridal white at the reflexed margin (v=1, top)
  const grad = ctx.createLinearGradient(0, 512, 0, 0);
  grad.addColorStop(0.0, '#f4ebd4'); // Warm golden champagne at base
  grad.addColorStop(0.25, '#faedd9'); // Soft ivory
  grad.addColorStop(0.65, '#faf7f0'); // Creamy white
  grad.addColorStop(1.0, '#ffffff'); // Pure luminous white rim

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Soft translucent radiating micro-veins
  ctx.strokeStyle = 'rgba(235, 222, 198, 0.45)';
  ctx.lineWidth = 1.5;

  const numVeins = 32;
  for (let i = 0; i < numVeins; i++) {
    const startX = 256 + (Math.random() - 0.5) * 80;
    const endX = 40 + (i / numVeins) * 432 + (Math.random() - 0.5) * 20;
    const midX = (startX + endX) * 0.5 + (Math.random() - 0.5) * 40;

    ctx.beginPath();
    ctx.moveTo(startX, 512);
    ctx.quadraticCurveTo(midX, 260, endX, 30);
    ctx.stroke();
  }

  // Soft lateral branching micro-capillaries
  ctx.strokeStyle = 'rgba(240, 230, 210, 0.25)';
  ctx.lineWidth = 0.8;
  for (let j = 0; j < 40; j++) {
    const y = 80 + Math.random() * 380;
    const x = 80 + Math.random() * 352;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (Math.random() - 0.5) * 45, y - 25);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Creates an authentic English Garden Tea Rose Petal Geometry
 * Features:
 * - Narrow claw base, voluptuous round shoulders, broad fan apex (NOT POINTY!)
 * - Soft heart-notch indentation at top apex
 * - Deep concave cupping across the width
 * - Reflexed outer curl (margins curl backwards away from bloom center)
 * - Delicate natural edge wave / ruffle
 */
function createRealisticTeaRosePetalGeometry(width = 0.78, height = 0.96, cupDepth = 0.40, reflex = 0.26) {
  const uSegments = 24;
  const vSegments = 28;

  const positions = [];
  const uvs = [];
  const indices = [];

  for (let j = 0; j <= vSegments; j++) {
    const v = j / vSegments; // 0 at base (receptacle), 1 at petal margin

    // True tea rose width profile:
    // Narrow base (0.18 at v=0), wide voluptuous body at v=0.65 (1.0), broad fan apex at v=1.0 (0.76)
    const baseTaper = Math.pow(v, 0.45);
    const shoulder = 0.18 + 0.82 * Math.sin(baseTaper * Math.PI * 0.75);
    const currentW = width * shoulder;

    // Backward reflex curl at the petal tip
    const tipCurl = Math.pow(v, 2.2) * reflex;

    for (let i = 0; i <= uSegments; i++) {
      const u = i / uSegments;
      const uCentered = (u - 0.5) * 2; // -1 to +1

      // Smooth rounded top arch with a soft Gaussian center heart cleft (no sharp spiky cusps)
      const arch = (1 - uCentered * uCentered) * 0.08 * Math.pow(v, 2.5);
      const cleft = Math.exp(-uCentered * uCentered * 12.0) * 0.032 * Math.pow(v, 3.5);
      const x = uCentered * (currentW * 0.5);
      const y = v * height + arch - cleft;

      // Concave cupping in the center, reflexing backward at top margin
      const cup = (1 - uCentered * uCentered) * cupDepth * Math.sin(v * Math.PI * 0.85);
      const wave = Math.sin(uCentered * Math.PI) * 0.016 * Math.pow(v, 2.0);
      const z = cup - tipCurl + wave;

      positions.push(x, y, z);
      uvs.push(u, v);
    }
  }

  for (let j = 0; j < vSegments; j++) {
    for (let i = 0; i < uSegments; i++) {
      const a = j * (uSegments + 1) + i;
      const b = j * (uSegments + 1) + i + 1;
      const c = (j + 1) * (uSegments + 1) + i;
      const d = (j + 1) * (uSegments + 1) + i + 1;

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
 * Creates the tight spiral swirl center (the iconic heart of the tea rose in Image 2)
 * 10 interlocking petals forming an elegant Archimedean spiral vortex
 */
function createRoseSpiralHeart(petalMat) {
  const heartGroup = new THREE.Group();

  // Spiral vortex: 10 tightly curled petals wrapping around the center axis
  const spiralPetalCount = 10;
  const goldenAngle = 2.399963;

  for (let i = 0; i < spiralPetalCount; i++) {
    const t = i / spiralPetalCount;
    const angle = i * goldenAngle + 0.4;
    const r = 0.035 + t * 0.12;
    const w = 0.32 + t * 0.28;
    const h = 0.52 + t * 0.28;
    const cup = 0.38 + t * 0.08;
    const reflex = -0.05 + t * 0.12;
    const tilt = 0.08 + t * 0.22;

    const geo = createRealisticTeaRosePetalGeometry(w, h, cup, reflex);
    const mesh = new THREE.Mesh(geo, petalMat);

    mesh.position.set(Math.cos(angle) * r, t * 0.04, Math.sin(angle) * r);
    mesh.rotation.y = -angle + Math.PI / 2 + 0.35;
    mesh.rotation.x = tilt;
    mesh.rotation.z = (Math.random() - 0.5) * 0.08;

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    heartGroup.add(mesh);
  }

  // Inner warm champagne core cone so center is never hollow
  const coreGeo = new THREE.ConeGeometry(0.11, 0.48, 14);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xf5edd8,
    roughness: 0.65
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  core.position.y = 0.22;
  heartGroup.add(core);

  return heartGroup;
}

/**
 * Creates an undeniably authentic, blooming English Garden Tea Rose
 * Scaled up to be full, luscious, and prominent (~0.88 unit scale)
 * Total 35 petals: 10 spiral heart petals + 4 concentric Fibonacci whorls (25 petals)
 */
export function createRoseHead(roseColor = '#fdfcf7') {
  const rose = new THREE.Group();
  rose.name = 'rose';

  // Procedural petal texture with delicate veins and warm champagne base
  const petalTexture = createRosePetalTexture(roseColor);

  const petalMaterial = new THREE.MeshStandardMaterial({
    map: petalTexture,
    color: new THREE.Color(roseColor),
    roughness: 0.35,
    metalness: 0.02,
    side: THREE.DoubleSide,
    shadowSide: THREE.DoubleSide
  });

  const greenMaterial = new THREE.MeshStandardMaterial({
    color: 0x1d4d1f,
    roughness: 0.55,
    metalness: 0.05
  });

  // Receptacle base bulb (hypanthium)
  const bulbGeo = new THREE.SphereGeometry(0.22, 16, 14);
  bulbGeo.scale(1, 1.2, 1);
  const bulb = new THREE.Mesh(bulbGeo, greenMaterial);
  bulb.position.y = -0.12;
  bulb.castShadow = true;
  rose.add(bulb);

  // 5 Green Calyx Sepals curling snugly downward beneath the receptacle bulb (hugging stem, not poking outward)
  for (let s = 0; s < 5; s++) {
    const angle = (s / 5) * Math.PI * 2;
    const sepalGeo = new THREE.ConeGeometry(0.045, 0.28, 5);
    sepalGeo.translate(0, 0.14, 0);
    const sepal = new THREE.Mesh(sepalGeo, greenMaterial);
    sepal.position.set(0, -0.16, 0);
    sepal.rotation.y = angle;
    sepal.rotation.x = 1.52; // Tucked straight down along stem so no green points poke into petals
    sepal.castShadow = true;
    rose.add(sepal);
  }

  // 1. Tight Spiral Heart (10 interlocking petals)
  const heart = createRoseSpiralHeart(petalMaterial);
  rose.add(heart);

  // 2. 4 Concentric Whorls of Fibonacci Petals (25 outer petals) - Luscious, blooming dimensions!
  const whorls = [
    // Inner Cup: 5 petals, cupped upright
    { count: 5, w: 0.50, h: 0.72, cup: 0.42, reflex: 0.14, r: 0.19, tilt: 0.32, y: -0.01 },
    // Middle Cup: 6 petals, opening
    { count: 6, w: 0.64, h: 0.82, cup: 0.46, reflex: 0.22, r: 0.30, tilt: 0.52, y: -0.02 },
    // Outer Bloom: 7 petals, wide shoulders, reflexed tips
    { count: 7, w: 0.78, h: 0.90, cup: 0.50, reflex: 0.32, r: 0.42, tilt: 0.75, y: -0.03 },
    // Flared Skirt: 7 petals, voluptuous guard petals framing the bloom
    { count: 7, w: 0.90, h: 0.98, cup: 0.54, reflex: 0.40, r: 0.54, tilt: 0.98, y: -0.04 }
  ];

  let currentAngle = Math.random() * Math.PI * 2;
  const goldenAngle = 2.399963;

  whorls.forEach((whorl) => {
    const geo = createRealisticTeaRosePetalGeometry(whorl.w, whorl.h, whorl.cup, whorl.reflex);

    for (let p = 0; p < whorl.count; p++) {
      currentAngle += goldenAngle + (Math.random() - 0.5) * 0.06;
      const petalMesh = new THREE.Mesh(geo, petalMaterial);
      petalMesh.castShadow = true;
      petalMesh.receiveShadow = true;

      const px = Math.cos(currentAngle) * whorl.r;
      const pz = Math.sin(currentAngle) * whorl.r;

      petalMesh.position.set(px, whorl.y, pz);
      petalMesh.rotation.y = -currentAngle + Math.PI / 2;
      petalMesh.rotation.x = whorl.tilt + (Math.random() - 0.5) * 0.04;
      petalMesh.rotation.z = (Math.random() - 0.5) * 0.05;

      const s = 0.96 + Math.random() * 0.08;
      petalMesh.scale.set(s, s, s);

      rose.add(petalMesh);
    }
  });

  // Scale the entire rose head to ~0.88 unit scale (larger, blooming, luscious!)
  rose.scale.set(0.88, 0.88, 0.88);

  rose.userData = {
    isFlower: true,
    petalMaterial
  };

  return rose;
}

/**
 * Creates prominent glossy green rose leaves
 */
export function createProminentLeafSpray() {
  const spray = new THREE.Group();
  spray.name = 'roseLeaves';

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x1e5822,
    roughness: 0.28,
    metalness: 0.08,
    side: THREE.DoubleSide
  });

  const veinMat = new THREE.MeshStandardMaterial({
    color: 0x2b7531,
    roughness: 0.4
  });

  function createDetailedLeaf(w = 0.70, h = 1.20) {
    const leafGroup = new THREE.Group();

    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(w * 0.65, h * 0.25, w * 0.75, h * 0.65, 0, h);
    shape.bezierCurveTo(-w * 0.75, h * 0.65, -w * 0.65, h * 0.25, 0, 0);

    const geo = new THREE.ShapeGeometry(shape, 14);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      pos.setZ(i, -(x * x) * 0.7 + Math.sin((y / h) * Math.PI) * 0.10);
    }
    geo.computeVertexNormals();

    const blade = new THREE.Mesh(geo, leafMat);
    blade.castShadow = true;
    blade.receiveShadow = true;
    leafGroup.add(blade);

    const ribCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.12, 0),
      new THREE.Vector3(0, h * 0.5, 0.038),
      new THREE.Vector3(0, h, 0)
    ]);
    const ribGeo = new THREE.TubeGeometry(ribCurve, 10, 0.024, 5, false);
    const rib = new THREE.Mesh(ribGeo, veinMat);
    leafGroup.add(rib);

    return leafGroup;
  }

  const centerLeaf = createDetailedLeaf(0.78, 1.30);
  spray.add(centerLeaf);

  const leftLeaf = createDetailedLeaf(0.62, 1.05);
  leftLeaf.position.set(-0.32, -0.10, 0.06);
  leftLeaf.rotation.z = 0.54;
  leftLeaf.rotation.x = -0.15;
  spray.add(leftLeaf);

  const rightLeaf = createDetailedLeaf(0.62, 1.05);
  rightLeaf.position.set(0.32, -0.10, 0.06);
  rightLeaf.rotation.z = -0.54;
  rightLeaf.rotation.x = -0.15;
  spray.add(rightLeaf);

  spray.scale.set(0.95, 0.95, 0.95);
  return spray;
}

/**
 * Creates downward stem flowing inward to waist
 */
export function createDownwardStem(startPos, endPos) {
  const midY = startPos.y * 0.45 + endPos.y * 0.55;
  const midX = startPos.x * 0.55 + endPos.x * 0.45;
  const midZ = startPos.z * 0.55 + endPos.z * 0.45;

  const points = [
    new THREE.Vector3(startPos.x, startPos.y, startPos.z),
    new THREE.Vector3(midX, midY, midZ),
    new THREE.Vector3(endPos.x, endPos.y, endPos.z)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const stemGeo = new THREE.TubeGeometry(curve, 14, 0.040, 6, false);

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x1d4d1f,
    roughness: 0.65,
    metalness: 0.04
  });

  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  stemMesh.castShadow = true;
  return stemMesh;
}
