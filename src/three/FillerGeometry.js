import * as THREE from 'three';

/**
 * Creates a delicate sprig of Baby's Breath (Gypsophila)
 * Features branched green stems ending in tiny white florets
 */
export function createBabysBreathSprig() {
  const sprigGroup = new THREE.Group();
  sprigGroup.name = 'babysBreath';

  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x487538,
    roughness: 0.8
  });

  const floretMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.4,
    metalness: 0.05,
    emissive: 0x111111 // Subtle pearly glow
  });

  // Base stem
  const mainStemGeo = new THREE.CylinderGeometry(0.02, 0.03, 1.8, 5);
  const mainStem = new THREE.Mesh(mainStemGeo, stemMat);
  mainStem.position.y = 0.9;
  sprigGroup.add(mainStem);

  // Small floret geometry (tiny clustered sphere/star)
  const floretGeo = new THREE.DodecahedronGeometry(0.065, 0);

  // Generate 8-14 branchlets
  const branchCount = 10;
  for (let b = 0; b < branchCount; b++) {
    const branchGroup = new THREE.Group();
    const branchLength = 0.5 + Math.random() * 0.4;

    const bStemGeo = new THREE.CylinderGeometry(0.012, 0.018, branchLength, 4);
    const bStem = new THREE.Mesh(bStemGeo, stemMat);
    bStem.position.y = branchLength / 2;
    branchGroup.add(bStem);

    // End floret cluster (2-3 tiny florets)
    const clusterCount = 2 + Math.floor(Math.random() * 2);
    for (let c = 0; c < clusterCount; c++) {
      const floret = new THREE.Mesh(floretGeo, floretMat);
      floret.position.set(
        (Math.random() - 0.5) * 0.1,
        branchLength + (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.1
      );
      const s = 0.75 + Math.random() * 0.5;
      floret.scale.set(s, s, s);
      branchGroup.add(floret);
    }

    // Position and angle the branch along the main stem
    const branchHeight = 0.8 + (b / branchCount) * 1.0;
    const angleY = (b * 2.4) + (Math.random() - 0.5) * 0.4;
    const angleTilt = 0.4 + Math.random() * 0.5;

    branchGroup.position.set(0, branchHeight, 0);
    branchGroup.rotation.y = angleY;
    branchGroup.rotation.z = angleTilt;

    sprigGroup.add(branchGroup);
  }

  return sprigGroup;
}

