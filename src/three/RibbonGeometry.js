import * as THREE from 'three';

/**
 * Creates a cute, slender whitish satin ribbon bow
 */
function createCuteRibbonLoop(material, isLeft = true) {
  const dir = isLeft ? -1 : 1;
  const points = [
    new THREE.Vector3(0, 0, 0.04),
    new THREE.Vector3(dir * 0.32, 0.18, 0.16),
    new THREE.Vector3(dir * 0.75, 0.26, 0.18),
    new THREE.Vector3(dir * 0.95, 0.04, 0.14),
    new THREE.Vector3(dir * 0.78, -0.16, 0.10),
    new THREE.Vector3(dir * 0.38, -0.12, 0.06),
    new THREE.Vector3(0, -0.04, 0.04)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.10, 8, false);
  tubeGeo.scale(1, 1, 0.28); // Flatten into silk ribbon strip

  const mesh = new THREE.Mesh(tubeGeo, material);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Creates a cute slender ribbon tail flowing down the V-funnel
 */
function createCuteRibbonTail(material, isLeft = true) {
  const dir = isLeft ? -1 : 1;
  const points = [
    new THREE.Vector3(0, 0, 0.06),
    new THREE.Vector3(dir * 0.14, -0.45, 0.16),
    new THREE.Vector3(dir * 0.32, -1.05, 0.15),
    new THREE.Vector3(dir * 0.42, -1.65, 0.12)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.10, 8, false);
  tubeGeo.scale(1, 1, 0.25);

  const mesh = new THREE.Mesh(tubeGeo, material);
  mesh.castShadow = true;
  return mesh;
}

/**
 * Creates the cute whitish satin ribbon & bow at the bouquet waist
 */
export function createRibbonBow(ribbonColor = '#fcfbf8', waistRadius = 0.86, waistY = -1.2) {
  const ribbonGroup = new THREE.Group();
  ribbonGroup.name = 'ribbonBow';

  // Pearlescent whitish silk ribbon material
  const ribbonMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(ribbonColor),
    roughness: 0.30,
    metalness: 0.12,
    side: THREE.DoubleSide
  });

  // 1. Slender Torus Band wrapped snugly around waist
  const bandRadius = waistRadius + 0.03;
  const bandGeo = new THREE.TorusGeometry(bandRadius, 0.055, 10, 48);
  const band = new THREE.Mesh(bandGeo, ribbonMat);
  band.rotation.x = Math.PI / 2;
  band.castShadow = true;
  ribbonGroup.add(band);

  // 2. Cute, Dainty Center Knot
  const knotGeo = new THREE.SphereGeometry(0.16, 14, 12);
  knotGeo.scale(1.2, 0.95, 0.85);
  const knot = new THREE.Mesh(knotGeo, ribbonMat);
  knot.position.set(0, 0, bandRadius + 0.08);
  knot.castShadow = true;
  ribbonGroup.add(knot);

  // 3. Left Bow Loop
  const leftLoop = createCuteRibbonLoop(ribbonMat, true);
  leftLoop.position.set(-0.04, 0.02, bandRadius + 0.08);
  leftLoop.rotation.z = 0.12;
  leftLoop.rotation.y = -0.16;
  ribbonGroup.add(leftLoop);

  // 4. Right Bow Loop
  const rightLoop = createCuteRibbonLoop(ribbonMat, false);
  rightLoop.position.set(0.04, 0.02, bandRadius + 0.08);
  rightLoop.rotation.z = -0.12;
  rightLoop.rotation.y = 0.16;
  ribbonGroup.add(rightLoop);

  // 5. Left Tail
  const leftTail = createCuteRibbonTail(ribbonMat, true);
  leftTail.position.set(-0.08, -0.06, bandRadius + 0.09);
  leftTail.rotation.z = 0.16;
  ribbonGroup.add(leftTail);

  // 6. Right Tail
  const rightTail = createCuteRibbonTail(ribbonMat, false);
  rightTail.position.set(0.08, -0.06, bandRadius + 0.09);
  rightTail.rotation.z = -0.16;
  ribbonGroup.add(rightTail);

  ribbonGroup.position.set(0, waistY, 0);

  ribbonGroup.userData = {
    ribbonMat
  };

  return ribbonGroup;
}
