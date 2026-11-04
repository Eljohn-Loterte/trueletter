import * as THREE from 'three';

/**
 * Creates subtle, magical ambient golden fairy dust sparkles around the bouquet
 * (Red flat falling petals removed to keep view pristine as requested in Image 3)
 */
export class AmbientParticles {
  constructor(scene) {
    this.scene = scene;
    this.enabled = true;
    this.sparkles = null;

    this.initSparkles();
  }

  initSparkles() {
    const sparkleCount = 50;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = Math.random() * 6 - 1.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 245, 210, 1)');
    grad.addColorStop(0.3, 'rgba(255, 215, 130, 0.7)');
    grad.addColorStop(0.7, 'rgba(218, 165, 32, 0.2)');
    grad.addColorStop(1, 'rgba(218, 165, 32, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      map: texture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparkles = new THREE.Points(geo, mat);
    this.scene.add(this.sparkles);
  }

  update(time) {
    if (!this.enabled || !this.sparkles) return;

    const pos = this.sparkles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] += Math.sin(time * 1.5 + i) * 0.002;
    }
    this.sparkles.geometry.attributes.position.needsUpdate = true;
  }

  setVisible(visible) {
    this.enabled = visible;
    if (this.sparkles) this.sparkles.visible = visible;
  }
}
