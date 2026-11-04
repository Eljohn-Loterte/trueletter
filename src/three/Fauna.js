import * as THREE from 'three';

/**
 * Creates an animated Hummingbird
 */
export function createHummingbird(color = 0xc43d3b) {
  const bird = new THREE.Group();
  bird.name = 'hummingbird';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.35,
    metalness: 0.25,
    emissive: 0x220505
  });

  const bellyMat = new THREE.MeshStandardMaterial({
    color: 0xf5e6d3,
    roughness: 0.5
  });

  const beakMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.2
  });

  const wingMat = new THREE.MeshStandardMaterial({
    color: 0xd65d5d,
    roughness: 0.3,
    transparent: true,
    opacity: 0.82,
    side: THREE.DoubleSide
  });

  const bodyGeo = new THREE.SphereGeometry(0.18, 12, 10);
  bodyGeo.scale(0.8, 0.8, 1.6);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  bird.add(body);

  const breastGeo = new THREE.SphereGeometry(0.13, 10, 8);
  breastGeo.scale(0.7, 0.9, 1.1);
  const breast = new THREE.Mesh(breastGeo, bellyMat);
  breast.position.set(0, -0.06, 0.08);
  bird.add(breast);

  const headGeo = new THREE.SphereGeometry(0.11, 10, 10);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 0.08, 0.25);
  bird.add(head);

  const beakGeo = new THREE.ConeGeometry(0.02, 0.32, 6);
  beakGeo.rotateX(-Math.PI / 2);
  const beak = new THREE.Mesh(beakGeo, beakMat);
  beak.position.set(0, 0.08, 0.44);
  bird.add(beak);

  const tailGeo = new THREE.ConeGeometry(0.08, 0.35, 4);
  tailGeo.rotateX(Math.PI / 2);
  tailGeo.scale(1.4, 0.2, 1);
  const tail = new THREE.Mesh(tailGeo, bodyMat);
  tail.position.set(0, 0.02, -0.36);
  bird.add(tail);

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.lineTo(0.1, 0.25);
  wingShape.lineTo(0.55, 0.4);
  wingShape.lineTo(0.5, 0.1);
  wingShape.lineTo(0, 0);
  const wingGeo = new THREE.ShapeGeometry(wingShape);

  const leftWingPivot = new THREE.Group();
  leftWingPivot.position.set(-0.1, 0.08, 0.05);
  const leftWingMesh = new THREE.Mesh(wingGeo, wingMat);
  leftWingMesh.rotation.y = Math.PI;
  leftWingPivot.add(leftWingMesh);
  bird.add(leftWingPivot);

  const rightWingPivot = new THREE.Group();
  rightWingPivot.position.set(0.1, 0.08, 0.05);
  const rightWingMesh = new THREE.Mesh(wingGeo, wingMat);
  rightWingPivot.add(rightWingMesh);
  bird.add(rightWingPivot);

  bird.scale.set(0.85, 0.85, 0.85);

  return {
    group: bird,
    update: (time, speed = 1.0) => {
      const flap = Math.sin(time * 35 * speed) * 0.75;
      leftWingPivot.rotation.z = flap;
      rightWingPivot.rotation.z = -flap;
      leftWingPivot.rotation.x = Math.cos(time * 35 * speed) * 0.2;
      rightWingPivot.rotation.x = Math.cos(time * 35 * speed) * 0.2;
    }
  };
}

/**
 * Creates an animated Butterfly
 */
export function createButterfly(color = 0xa31e28) {
  const butterfly = new THREE.Group();
  butterfly.name = 'butterfly';

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.8
  });

  const wingMat = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.45,
    metalness: 0.1,
    side: THREE.DoubleSide
  });

  const bodyGeo = new THREE.CylinderGeometry(0.02, 0.025, 0.35, 6);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  butterfly.add(body);

  for (let a of [-1, 1]) {
    const antGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.18, 4);
    const ant = new THREE.Mesh(antGeo, bodyMat);
    ant.position.set(a * 0.03, 0.06, 0.18);
    ant.rotation.z = a * 0.4;
    ant.rotation.x = 0.5;
    butterfly.add(ant);
  }

  function createButterflyWingGeometry() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.1, 0.25, 0.4, 0.55, 0.65, 0.5);
    shape.bezierCurveTo(0.75, 0.35, 0.6, 0.1, 0.35, 0.05);
    shape.bezierCurveTo(0.55, -0.15, 0.45, -0.4, 0.25, -0.38);
    shape.bezierCurveTo(0.1, -0.35, 0.05, -0.15, 0, 0);
    return new THREE.ShapeGeometry(shape, 12);
  }

  const wingGeo = createButterflyWingGeometry();

  const leftWingPivot = new THREE.Group();
  leftWingPivot.position.set(-0.02, 0.02, 0);
  const leftWing = new THREE.Mesh(wingGeo, wingMat);
  leftWing.rotation.y = Math.PI;
  leftWingPivot.add(leftWing);
  butterfly.add(leftWingPivot);

  const rightWingPivot = new THREE.Group();
  rightWingPivot.position.set(0.02, 0.02, 0);
  const rightWing = new THREE.Mesh(wingGeo, wingMat);
  rightWingPivot.add(rightWing);
  butterfly.add(rightWingPivot);

  butterfly.scale.set(0.85, 0.85, 0.85);

  return {
    group: butterfly,
    update: (time, speed = 1.0) => {
      const flap = Math.sin(time * 12 * speed) * 0.85;
      leftWingPivot.rotation.y = Math.PI + flap;
      rightWingPivot.rotation.y = -flap;
    }
  };
}

export class FaunaManager {
  constructor(scene) {
    this.scene = scene;
    this.hummingbirds = [];
    this.butterflies = [];
    this.enabled = true;
    this.speed = 1.0;

    this.initFauna();
  }

  initFauna() {
    // 1. Top Right Hummingbird
    const hb1 = createHummingbird(0xb83838);
    hb1.basePos = new THREE.Vector3(2.4, 2.3, 1.2);
    hb1.radius = 0.35;
    hb1.phase = 0;
    this.scene.add(hb1.group);
    this.hummingbirds.push(hb1);

    // 2. Mid Right Hummingbird
    const hb2 = createHummingbird(0xa83232);
    hb2.basePos = new THREE.Vector3(2.6, 1.4, 0.9);
    hb2.radius = 0.25;
    hb2.phase = 2.1;
    this.scene.add(hb2.group);
    this.hummingbirds.push(hb2);

    // (Left hummingbird removed per user request: "reduce one humming bird on the left")

    // 3. Perched Butterfly (sitting on the front rim fold)
    const bf1 = createButterfly(0x9e1d24);
    bf1.basePos = new THREE.Vector3(0.65, 0.55, 2.3);
    bf1.isPerched = true;
    bf1.group.position.copy(bf1.basePos);
    bf1.group.rotation.set(-0.35, -0.2, 0.15);
    this.scene.add(bf1.group);
    this.butterflies.push(bf1);

    // 5. Flying Butterfly (fluttering in lower left air)
    const bf2 = createButterfly(0xb5222b);
    bf2.basePos = new THREE.Vector3(-2.2, -0.6, 1.8);
    bf2.isPerched = false;
    this.scene.add(bf2.group);
    this.butterflies.push(bf2);
  }

  update(time) {
    if (!this.enabled) return;

    this.hummingbirds.forEach((hb) => {
      hb.update(time, this.speed);

      const t = time * 2.0 * this.speed + hb.phase;
      const hoverX = hb.basePos.x + Math.sin(t * 0.7) * hb.radius;
      const hoverY = hb.basePos.y + Math.cos(t * 1.3) * (hb.radius * 0.4);
      const hoverZ = hb.basePos.z + Math.sin(t * 1.1) * (hb.radius * 0.3);

      hb.group.position.set(hoverX, hoverY, hoverZ);
      const target = new THREE.Vector3(0, 1.5, 0);
      hb.group.lookAt(target);
      hb.group.rotation.x += Math.sin(t * 1.5) * 0.08;
    });

    this.butterflies.forEach((bf) => {
      if (bf.isPerched) {
        bf.update(time * 0.35, this.speed);
      } else {
        bf.update(time, this.speed);
        const t = time * 1.5 * this.speed;
        const x = bf.basePos.x + Math.sin(t) * 0.45;
        const y = bf.basePos.y + Math.cos(t * 1.8) * 0.25;
        const z = bf.basePos.z + Math.cos(t * 0.9) * 0.3;

        bf.group.position.set(x, y, z);
        bf.group.rotation.y = Math.sin(t * 0.5) * 0.5 + Math.PI / 4;
        bf.group.rotation.z = Math.cos(t * 1.5) * 0.2;
      }
    });
  }

  setVisible(visible) {
    this.enabled = visible;
    this.hummingbirds.forEach(h => h.group.visible = visible);
    this.butterflies.forEach(b => b.group.visible = visible);
  }
}
