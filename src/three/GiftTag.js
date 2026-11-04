import * as THREE from 'three';

/**
 * Creates an interactive, simple minimalist card tucked proudly in front of the bouquet
 * Matches the user's reference design: Onyx black card with gold geometric borders,
 * corner diagonal cuts, center diamond (rhombus), and "letter for you" in the middle.
 */
export function createGiftTag(recipient = "chuchu", message = "", sender = "chuchu") {
  const cardGroup = new THREE.Group();
  cardGroup.name = 'simpleCard';

  const cardWidth = 0.95;
  const cardHeight = 1.38;

  // --- 1. FRONT COVER TEXTURE (CANVAS) ---
  const canvasWidth = 512;
  const canvasHeight = 740;
  const coverCanvas = document.createElement('canvas');
  coverCanvas.width = canvasWidth;
  coverCanvas.height = canvasHeight;
  const ctx = coverCanvas.getContext('2d');

  const paperImg = new Image();
  paperImg.crossOrigin = 'anonymous';
  paperImg.src = '/paper-texture.jpg';

  function drawSimpleCardCover() {
    // 1. Draw authentic paper texture image if loaded, or warm paper gradient fallback
    if (paperImg.complete && paperImg.naturalWidth > 0) {
      ctx.drawImage(paperImg, 0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = '#f9eed9';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      const grad = ctx.createRadialGradient(
        canvasWidth * 0.35, canvasHeight * 0.3, 60,
        canvasWidth * 0.5, canvasHeight * 0.5, canvasHeight * 0.7
      );
      grad.addColorStop(0, '#fdfbf6');
      grad.addColorStop(0.65, '#f4ece0');
      grad.addColorStop(1, '#ebe0ce');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }

    // 2. Elegant Front Border Design (ONLY ON FRONT)
    const margin = 26;
    const bw = canvasWidth - margin * 2;
    const bh = canvasHeight - margin * 2;

    // Outer frame
    ctx.strokeStyle = 'rgba(145, 120, 90, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(margin, margin, bw, bh);

    // Inner hairline frame
    const innerM = 36;
    ctx.strokeStyle = 'rgba(145, 120, 90, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(innerM, innerM, canvasWidth - innerM * 2, canvasHeight - innerM * 2);

    // 4 Corner vintage accents
    const cSize = 20;
    ctx.strokeStyle = 'rgba(145, 120, 90, 0.75)';
    ctx.lineWidth = 2;
    // Top-Left
    ctx.beginPath();
    ctx.moveTo(innerM, innerM + cSize);
    ctx.lineTo(innerM + cSize, innerM + cSize);
    ctx.lineTo(innerM + cSize, innerM);
    ctx.stroke();
    // Top-Right
    ctx.beginPath();
    ctx.moveTo(canvasWidth - innerM, innerM + cSize);
    ctx.lineTo(canvasWidth - innerM - cSize, innerM + cSize);
    ctx.lineTo(canvasWidth - innerM - cSize, innerM);
    ctx.stroke();
    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(innerM, canvasHeight - innerM - cSize);
    ctx.lineTo(innerM + cSize, canvasHeight - innerM - cSize);
    ctx.lineTo(innerM + cSize, canvasHeight - innerM);
    ctx.stroke();
    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(canvasWidth - innerM, canvasHeight - innerM - cSize);
    ctx.lineTo(canvasWidth - innerM - cSize, canvasHeight - innerM - cSize);
    ctx.lineTo(canvasWidth - innerM - cSize, canvasHeight - innerM);
    ctx.stroke();

    // 3. "LETTER OF TRUTH" in a Wave Arc (NO emoji circle)
    const text = 'LETTER OF TRUTH';
    const chars = text.split('');
    const totalChars = chars.length;
    const startX = 65;
    const endX = canvasWidth - 65;
    const cy = canvasHeight * 0.50;

    ctx.font = '600 24px "Poppins", "Tenor Sans", "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#3e3226';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < totalChars; i++) {
      const norm = (i + 0.5) / totalChars;
      const x = startX + norm * (endX - startX);
      const arch = Math.sin(norm * Math.PI) * -42;
      const wave = Math.sin(norm * Math.PI * 2.2) * 15;
      const y = cy + arch + wave;

      const dx = 2;
      const normNext = (x + dx - startX) / (endX - startX);
      const yNext = cy + Math.sin(normNext * Math.PI) * -42 + Math.sin(normNext * Math.PI * 2.2) * 15;
      const angle = Math.atan2(yNext - y, dx);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillText(chars[i], 0, 0);
      ctx.restore();
    }

    // Delicate wavy flourish accent below text
    ctx.strokeStyle = 'rgba(150, 125, 95, 0.45)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(canvasWidth * 0.32, cy + 60);
    ctx.quadraticCurveTo(canvasWidth * 0.50, cy + 45, canvasWidth * 0.68, cy + 60);
    ctx.stroke();

    ctx.fillStyle = 'rgba(150, 125, 95, 0.55)';
    ctx.beginPath();
    ctx.arc(canvasWidth * 0.50, cy + 52, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  drawSimpleCardCover();

  const coverTexture = new THREE.CanvasTexture(coverCanvas);
  coverTexture.anisotropy = 4;

  paperImg.onload = () => {
    drawSimpleCardCover();
    coverTexture.needsUpdate = true;
  };

  const textureLoader = new THREE.TextureLoader();
  const paperTexture = textureLoader.load('/paper-texture.jpg');

  // --- 2. 3D SINGLE FLIP CARD (Paper Theme) ---
  const cardGeo = new THREE.BoxGeometry(cardWidth, cardHeight, 0.018);
  
  const sideMat = new THREE.MeshStandardMaterial({
    color: 0xf5ede0,
    roughness: 0.85,
    metalness: 0.02
  });
  const frontMat = new THREE.MeshStandardMaterial({
    map: coverTexture,
    roughness: 0.75,
    metalness: 0.02
  });
  const backMat = new THREE.MeshStandardMaterial({
    map: paperTexture,
    roughness: 0.85,
    metalness: 0.02
  });
  
  // Materials: +X, -X, +Y, -Y, +Z (Front), -Z (Back)
  const cardMaterials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
  
  const cardMesh = new THREE.Mesh(cardGeo, cardMaterials);
  cardMesh.castShadow = true;
  cardMesh.receiveShadow = true;
  cardMesh.userData = { isLetter: true, isClickable: true };
  cardGroup.add(cardMesh);

  // Golden string tying the card directly onto the ribbon knot
  const stringCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, cardHeight * 0.48, 0.01),
    new THREE.Vector3(-0.08, cardHeight * 0.58, -0.05),
    new THREE.Vector3(-0.24, cardHeight * 0.66, -0.16)
  ]);
  const stringGeo = new THREE.TubeGeometry(stringCurve, 12, 0.012, 6, false);
  const stringMat = new THREE.MeshStandardMaterial({
    color: 0xdfb858,
    metalness: 0.85,
    roughness: 0.22
  });
  const stringMesh = new THREE.Mesh(stringGeo, stringMat);
  stringMesh.castShadow = true;
  cardGroup.add(stringMesh);

  // Delicate gold eyelet ring at top of card
  const eyeletGeo = new THREE.TorusGeometry(0.032, 0.009, 8, 20);
  const eyeletMesh = new THREE.Mesh(eyeletGeo, stringMat);
  eyeletMesh.position.set(0, cardHeight * 0.46, 0.01);
  cardGroup.add(eyeletMesh);

  // Positioned directly ON the whitish satin ribbon at the bouquet waist
  const basePos = new THREE.Vector3(0.24, -1.38, 1.28);
  cardGroup.position.copy(basePos);
  cardGroup.rotation.set(0.06, -0.15, 0.10);

  cardGroup.userData = {
    isLetter: true,
    isClickable: true,
    basePos: basePos.clone(),
    baseScale: 1.0
  };

  return {
    group: cardGroup,
    update: (time) => {
      // Gentle floating bobbing motion resting with the ribbon
      cardGroup.position.y = basePos.y + Math.sin(time * 2.0) * 0.018;
      cardGroup.rotation.z = 0.10 + Math.sin(time * 1.6) * 0.015;
    },
    updateText: () => {
      drawSimpleCardCover();
      coverTexture.needsUpdate = true;
    }
  };
}
