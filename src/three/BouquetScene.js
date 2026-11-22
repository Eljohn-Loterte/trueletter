import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createRoseHead, createDownwardStem, createProminentLeafSpray } from './RoseGeometry.js';
import { 
  createSunflowerHead, 
  createTulipHead, 
  createLilyHead, 
  createLavenderSpire, 
  createDaisyHead 
} from './FlowerGeometry.js';
import { createBabysBreathSprig } from './FillerGeometry.js';
import { createBouquetWrapping } from './WrappingGeometry.js';
import { createRibbonBow } from './RibbonGeometry.js';
import { FaunaManager } from './Fauna.js';
import { AmbientParticles } from './Particles.js';
import { createGiftTag } from './GiftTag.js';
import { soundManager } from '../utils/audioSynth.js';

export class BouquetScene {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      roseColor: '#c8102e',    // Velvet romantic crimson red rose
      wrapColor: '#181a1f',    // Onyx silk with gold stripes matching Image 1
      accentColor: '#dfb858',  // Metallic gold accents & borders
      ribbonColor: '#fcfbf8',  // Whitish silk ribbon matching user request
      roseCount: 13,           // 13 mixed luxury blooms in staircase tiers
      showFauna: true,
      showParticles: false,    // Turned off intrusive floating flakes
      showGiftTag: true,       // Love letter pops out and is clickable!
      autoRotate: false,
      recipient: 'chuchu',
      giftMessage: 'Every petal in this bouquet was gathered just for you. You bring so much sweetness, beauty, and warmth into every single day. No matter how many moments pass, you will always be my favorite thought.',
      sender: 'Yours Truly',
      onOpenLetter: null,
      ...options
    };

    this.roses = [];
    this.stems = [];
    this.fillers = [];
    this.leaves = [];
    this.isDisposed = false;
    this.clock = new THREE.Clock();

    this.initScene();
    this.initLights();
    this.buildBouquet();
    this.initFauna();
    this.initParticles();
    this.initRaycaster();
    this.animate();

    this.handleResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  initScene() {
    this.scene = new THREE.Scene();

    // Studio background with soft gradient
    this.scene.background = new THREE.Color(0xdce3ea);
    this.scene.fog = new THREE.FogExp2(0xdce3ea, 0.020);

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    this.renderer.domElement.style.touchAction = 'none';

    this.container.appendChild(this.renderer.domElement);

    // OrbitControls with touch support
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 22;
    this.controls.minDistance = 3.5;
    this.controls.target.set(0, 0.8, 0);
    this.controls.autoRotate = this.options.autoRotate;
    this.controls.autoRotateSpeed = 1.0;
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    this.userHasMovedCamera = false;
    this.controls.addEventListener('start', () => {
      this.userHasMovedCamera = true;
    });

    // Frame camera responsively for mobile, tablet, or desktop
    this.updateCameraFraming(width, height, true);

    // Bouquet root group
    this.bouquetGroup = new THREE.Group();
    this.scene.add(this.bouquetGroup);
  }

  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    this.scene.add(ambientLight);

    // Directional Key light from front-top-right
    this.keyLight = new THREE.DirectionalLight(0xfff8ee, 2.0);
    this.keyLight.position.set(6.0, 9.5, 8.0);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0004;
    this.keyLight.shadow.radius = 2.0;
    this.keyLight.shadow.camera.near = 1.0;
    this.keyLight.shadow.camera.far = 30;
    this.keyLight.shadow.camera.left = -7;
    this.keyLight.shadow.camera.right = 7;
    this.keyLight.shadow.camera.top = 7;
    this.keyLight.shadow.camera.bottom = -7;
    this.scene.add(this.keyLight);

    // Soft fill light from left
    const fillLight = new THREE.DirectionalLight(0xdbe8ff, 1.15);
    fillLight.position.set(-6.5, 4.0, 4.5);
    this.scene.add(fillLight);

    // Rim light to highlight the gold edges and white petal contours
    const rimLight = new THREE.DirectionalLight(0xffffff, 1.50);
    rimLight.position.set(0, 7.5, -7.0);
    this.scene.add(rimLight);

    // Soft bounce light from beneath
    const bounceLight = new THREE.DirectionalLight(0xffeedd, 0.45);
    bounceLight.position.set(0, -6, 4);
    this.scene.add(bounceLight);
  }

  buildBouquet() {
    while (this.bouquetGroup.children.length > 0) {
      this.bouquetGroup.remove(this.bouquetGroup.children[0]);
    }
    this.roses = [];
    this.stems = [];
    this.lavenders = [];
    this.fillers = [];
    this.leaves = [];

    // 1. Super Grande Layered Onyx Silk Origami Wrapper with Gold Stripes
    this.wrappingMesh = createBouquetWrapping(this.options.wrapColor, this.options.accentColor);
    this.bouquetGroup.add(this.wrappingMesh);

    // 2. Cute Whitish Satin Ribbon at waist
    const waistRadius = this.wrappingMesh.userData.waistRadius || 0.98;
    const waistY = this.wrappingMesh.userData.waistY || -1.35;
    this.ribbonMesh = createRibbonBow(this.options.ribbonColor, waistRadius, waistY);
    this.bouquetGroup.add(this.ribbonMesh);

    // 3. Mixed Floral Masterpiece (Sunflowers, Tulips, Lilies, Red Roses, Daisies)
    this.arrangeRoses();

    // 4. Fragrant Lavender Spires framing the bouquet
    this.arrangeLavender();

    // 5. Prominent Green Leaves Framing the Bouquet
    this.arrangeFoliage();

    // 6. Fine Baby's Breath sprays
    this.arrangeFillers();

    // 7. Interactive 3D Love Letter Envelope (Pops out in front, clickable!)
    this.giftTag = createGiftTag(
      this.options.recipient || 'Dear chuchu',
      this.options.giftMessage || 'Forever & Always in my heart',
      this.options.sender || 'Yours Truly'
    );
    this.giftTag.group.visible = this.options.showGiftTag !== false;
    this.bouquetGroup.add(this.giftTag.group);
  }

  arrangeRoses() {
    // Mixed floral luxury arrangement with Sunflowers pushed to the top crown,
    // organic differing heights for every bloom, Tulips, Lilies, Red Roses, and Daisies
    const waistY = this.wrappingMesh.userData.waistY || -1.35;
    const count = this.options.roseCount || 13;

    const flowerConfigs = [
      // --- TIER 5: TOP CROWN (Crown Hero Sunflower dominating the apex, tilted forward at 48°!) ---
      // Peak Crown Hero Sunflower - elevated to y = 4.15, pushed forward to z = -1.30, scale = 1.42
      { x: 0.0,   y: 4.15, z: -1.30, rx: 0.84, ry: 0.0,   scale: 1.42, type: 'sunflower' },

      // --- TIER 4: HIGH UPPER STEP (Lilies & Secondary Sunflower pushed clear of any overlap) ---
      // High right Stargazer Lily (pushed wide to right flank to never be covered by crown sunflower)
      { x: 1.62,  y: 3.28, z: -1.25, rx: 0.35, ry: 0.52,  scale: 1.12, type: 'lily' },
      // High left Stargazer Lily (pushed wide to left flank clear of crown and secondary sunflowers)
      { x: -1.68, y: 3.25, z: -1.25, rx: 0.35, ry: -0.55, scale: 1.12, type: 'lily' },
      // Upper-mid left Radiant Sunflower (elevated to y = 3.25, stepped forward to z = -0.75, scale = 1.25, tilted forward at 45°)
      { x: -1.05, y: 3.25, z: -0.75, rx: 0.78, ry: -0.28, scale: 1.25, type: 'sunflower' },
      // High Daisy with golden disc (moved from under crown sunflower into clear sunny right window)
      { x: 0.52,  y: 2.95, z: -0.70, rx: 0.38, ry: 0.18,  scale: 1.05, type: 'daisy' },

      // --- TIER 3: MID-UPPER TIER (Pushed so flowers beneath sunflowers are 100% visible) ---
      // Upper-right warm sunset Tulip (pushed outward on right)
      { x: 1.55,  y: 2.68, z: -0.75, rx: 0.38, ry: 0.52,  scale: 1.08, type: 'tulip', color: '#fb923c' },
      // Mid-upper center-right Velvet Crimson Rose (clear of crown sunflower)
      { x: 0.85,  y: 2.45, z: -0.45, rx: 0.40, ry: 0.30,  scale: 1.06, type: 'red_rose', color: '#b91326' },
      // Mid-center deep Velvet Red Rose (stepped forward with clear line-of-sight)
      { x: 0.0,   y: 2.25, z: -0.15, rx: 0.42, ry: 0.0,   scale: 1.08, type: 'red_rose', color: '#c8102e' },
      // Mid-left rich Ruby Red Rose (pushed outward & forward so secondary sunflower doesn't cover it)
      { x: -1.62, y: 2.05, z: -0.18, rx: 0.45, ry: -0.58, scale: 1.05, type: 'red_rose', color: '#ba0c2f' },

      // --- TIER 2: MID-FRONT TIER ---
      // Mid-right spring pink chalice Tulip
      { x: 1.48,  y: 2.05, z: -0.12, rx: 0.42, ry: 0.58,  scale: 1.06, type: 'tulip', color: '#f472b6' },

      // --- TIER 1: FRONT SHOWCASE STEP (Lower tier framing love letter) ---
      // Front center Velvet Red Rose right above letter
      { x: 0.0,   y: 1.65, z: 0.42,  rx: 0.50, ry: 0.0,   scale: 1.08, type: 'red_rose', color: '#c8102e' },
      // Front right sunny white Daisy with golden eye
      { x: 0.90,  y: 1.52, z: 0.42,  rx: 0.52, ry: 0.32,  scale: 1.04, type: 'daisy' },
      // Front left sweet coral cup Tulip
      { x: -0.90, y: 1.50, z: 0.42,  rx: 0.52, ry: -0.32, scale: 1.06, type: 'tulip', color: '#ff5b79' }
    ];

    const actualCount = Math.min(count, flowerConfigs.length);

    for (let i = 0; i < actualCount; i++) {
      const cfg = flowerConfigs[i];
      const headPos = new THREE.Vector3(cfg.x, cfg.y, cfg.z);

      let flowerHead;
      if (cfg.type === 'sunflower') {
        flowerHead = createSunflowerHead();
      } else if (cfg.type === 'tulip') {
        flowerHead = createTulipHead(cfg.color || '#ff5b79');
      } else if (cfg.type === 'lily') {
        flowerHead = createLilyHead();
      } else if (cfg.type === 'daisy') {
        flowerHead = createDaisyHead();
      } else {
        // Red Rose (honoring user rose color or default crimson)
        const roseCol = (this.options.roseColor && this.options.roseColor !== '#fdfcf7')
          ? this.options.roseColor
          : (cfg.color || '#c8102e');
        flowerHead = createRoseHead(roseCol);
      }

      flowerHead.position.copy(headPos);
      flowerHead.rotation.x = cfg.rx;
      flowerHead.rotation.y = cfg.ry;
      flowerHead.rotation.z = (Math.random() - 0.5) * 0.06;

      const s = cfg.scale;
      flowerHead.scale.multiplyScalar(s);

      flowerHead.userData = {
        id: i,
        flowerType: cfg.type,
        baseScale: flowerHead.scale.x,
        isFlower: true
      };

      this.bouquetGroup.add(flowerHead);
      this.roses.push(flowerHead);

      // Downward Stem: connects flower base gracefully downward to waist and into lower stem bundle
      const startStem = headPos.clone().add(new THREE.Vector3(0, -0.15, 0));
      const endStem = new THREE.Vector3(cfg.x * 0.12, waistY - 0.15, cfg.z * 0.12);

      const stemMesh = createDownwardStem(startStem, endStem);
      this.bouquetGroup.add(stemMesh);
      this.stems.push(stemMesh);
    }
  }

  arrangeLavender() {
    this.lavenders = [];
    const lavenderConfigs = [
      // Top crown spires rising behind the upper sunflower and lilies
      { x: -0.55, y: 2.35, z: -2.18, rx: 0.12, ry: -0.15, rz: -0.08, scale: 1.08 },
      { x: 0.55,  y: 2.35, z: -2.18, rx: 0.12, ry: 0.15,  rz: 0.08,  scale: 1.08 },
      { x: -1.15, y: 2.15, z: -2.05, rx: 0.15, ry: -0.32, rz: -0.18, scale: 1.02 },
      { x: 1.15,  y: 2.15, z: -2.05, rx: 0.15, ry: 0.32,  rz: 0.18,  scale: 1.02 },

      // Mid-tier flank spires arching from sides
      { x: -1.75, y: 1.45, z: -0.65, rx: 0.25, ry: -0.65, rz: -0.28, scale: 0.95 },
      { x: 1.75,  y: 1.45, z: -0.65, rx: 0.25, ry: 0.65,  rz: 0.28,  scale: 0.95 },
      { x: -1.65, y: 1.75, z: -1.15, rx: 0.18, ry: -0.50, rz: -0.22, scale: 0.95 },
      { x: 1.65,  y: 1.75, z: -1.15, rx: 0.18, ry: 0.50,  rz: 0.22,  scale: 0.95 },

      // Infill between steps
      { x: -0.65, y: 1.55, z: -0.45, rx: 0.32, ry: -0.22, rz: -0.12, scale: 0.90 },
      { x: 0.65,  y: 1.55, z: -0.45, rx: 0.32, ry: 0.22,  rz: 0.12,  scale: 0.90 }
    ];

    lavenderConfigs.forEach((cfg) => {
      const spire = createLavenderSpire();
      spire.position.set(cfg.x, cfg.y, cfg.z);
      spire.rotation.set(cfg.rx, cfg.ry, cfg.rz);
      spire.scale.set(cfg.scale, cfg.scale, cfg.scale);
      spire.castShadow = true;
      this.bouquetGroup.add(spire);
      this.lavenders.push(spire);
    });
  }

  arrangeFoliage() {
    // Elegant background and flank leaves framing the bouquet staircase tiers (no leaves in front!)
    const leafPlacements = [
      // Top crown leaves behind the elevated crown sunflower and lilies
      { x: 0.0,   y: 4.25, z: -2.15, rx: 0.15, ry: 0.0,   rz: 0.0,  scale: 1.25 },
      { x: -1.15, y: 3.85, z: -1.95, rx: 0.18, ry: -0.32, rz: 0.20, scale: 1.15 },
      { x: 1.15,  y: 3.85, z: -1.95, rx: 0.18, ry: 0.32,  rz: -0.20, scale: 1.15 },

      // Tier 4 back leaves framing the flank lilies
      { x: -1.85, y: 3.20, z: -1.45, rx: 0.20, ry: -0.50, rz: 0.25, scale: 1.15 },
      { x: 1.85,  y: 3.20, z: -1.45, rx: 0.20, ry: 0.50,  rz: -0.25, scale: 1.15 },

      // Tier 2 flank side leaves
      { x: -2.05, y: 2.25, z: -0.45, rx: 0.35, ry: -0.80, rz: 0.30, scale: 1.15 },
      { x: 2.05,  y: 2.25, z: -0.45, rx: 0.35, ry: 0.80,  rz: -0.30, scale: 1.15 },

      // Deep crevices between middle-back roses (rear fill)
      { x: -0.55, y: 2.36, z: -0.75, rx: 0.30, ry: -0.25, rz: 0.20, scale: 0.85 },
      { x: 0.55,  y: 2.36, z: -0.75, rx: 0.30, ry: 0.25,  rz: -0.20, scale: 0.85 }
    ];

    leafPlacements.forEach((lp) => {
      const spray = createProminentLeafSpray();
      spray.position.set(lp.x, lp.y, lp.z);
      spray.rotation.set(lp.rx, lp.ry, lp.rz);
      spray.scale.set(lp.scale, lp.scale, lp.scale);
      this.bouquetGroup.add(spray);
      this.leaves.push(spray);
    });
  }

  arrangeFillers() {
    // Delicate baby's breath tucked in the crevices between the staircase steps
    const fillerPlacements = [
      { x: -0.45, y: 3.11, z: -1.75, r: 0.85 },
      { x: 0.45,  y: 3.11, z: -1.75, r: 0.85 },
      { x: -0.55, y: 2.71, z: -1.25, r: 0.85 },
      { x: 0.55,  y: 2.71, z: -1.25, r: 0.85 },
      { x: -1.55, y: 2.41, z: -0.85, r: 0.85 },
      { x: 1.55,  y: 2.41, z: -0.85, r: 0.85 },
      { x: -0.60, y: 1.91, z: -0.10, r: 0.80 },
      { x: 0.60,  y: 1.91, z: -0.10, r: 0.80 },
      { x: -1.35, y: 1.71, z: 0.05,  r: 0.80 },
      { x: 1.35,  y: 1.71, z: 0.05,  r: 0.80 },
      { x: -0.45, y: 1.54, z: 0.32,  r: 0.75 },
      { x: 0.45,  y: 1.54, z: 0.32,  r: 0.75 }
    ];

    fillerPlacements.forEach((fp) => {
      const sprig = createBabysBreathSprig();
      sprig.position.set(fp.x, fp.y, fp.z);
      sprig.scale.set(fp.r, fp.r, fp.r);
      sprig.rotation.y = Math.random() * Math.PI * 2;
      sprig.rotation.x = 0.20 + Math.random() * 0.25;

      this.bouquetGroup.add(sprig);
      this.fillers.push(sprig);
    });
  }

  initFauna() {
    this.fauna = new FaunaManager(this.scene);
    this.fauna.setVisible(this.options.showFauna);
  }

  initParticles() {
    this.particles = new AmbientParticles(this.scene);
    this.particles.setVisible(this.options.showParticles);
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerDownTime = 0;

    const onPointerDown = (e) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      pointerDownTime = performance.now();
    };

    const onPointerUp = (e) => {
      // Discard drag gestures (rotation/orbiting) so only clean taps trigger clicks
      const dist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      const duration = performance.now() - pointerDownTime;
      if (dist > 8 || duration > 600) return;

      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 1. Check if the 3D Love Letter Envelope was tapped/clicked!
      if (this.giftTag && this.giftTag.group && this.giftTag.group.visible) {
        const letterIntersects = this.raycaster.intersectObjects([this.giftTag.group], true);
        if (letterIntersects.length > 0) {
          soundManager.playChime(784);
          if (this.options.onOpenLetter) {
            this.options.onOpenLetter();
          }
          return;
        }
      }

      // 2. Check if a rose was clicked
      const intersects = this.raycaster.intersectObjects(this.roses, true);
      if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && obj.name !== 'rose' && obj.parent) {
          obj = obj.parent;
        }

        if (obj && obj.name === 'rose') {
          this.triggerFlowerPluckAnimation(obj);
          soundManager.playChime(660 + Math.random() * 300);
        }
      }
    };

    const onPointerMove = (e) => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const isHoverLetter = this.giftTag && this.giftTag.group && this.giftTag.group.visible &&
        this.raycaster.intersectObjects([this.giftTag.group], true).length > 0;
      const isHoverRose = this.raycaster.intersectObjects(this.roses, true).length > 0;

      if (isHoverLetter) {
        this.renderer.domElement.style.cursor = 'pointer';
        this.giftTag.group.scale.set(1.08, 1.08, 1.08);
      } else {
        if (this.giftTag && this.giftTag.group) {
          this.giftTag.group.scale.set(1.0, 1.0, 1.0);
        }
        this.renderer.domElement.style.cursor = isHoverRose ? 'pointer' : 'default';
      }
    };

    this.renderer.domElement.addEventListener('pointerdown', onPointerDown);
    this.renderer.domElement.addEventListener('pointerup', onPointerUp);
    this.renderer.domElement.addEventListener('pointermove', onPointerMove);
  }

  triggerFlowerPluckAnimation(roseGroup) {
    const baseScale = roseGroup.userData.baseScale || 0.88;
    let t = 0;

    const anim = () => {
      t += 0.08;
      const pulse = 1 + Math.sin(t * Math.PI) * 0.20 * Math.exp(-t * 2);
      roseGroup.scale.set(baseScale * pulse, baseScale * pulse, baseScale * pulse);

      if (t < 1.5) {
        requestAnimationFrame(anim);
      } else {
        roseGroup.scale.set(baseScale, baseScale, baseScale);
      }
    };
    anim();
  }

  setRoseColor(hexColor) {
    this.options.roseColor = hexColor;
    const color = new THREE.Color(hexColor);
    this.roses.forEach((rose) => {
      if (!rose.userData || rose.userData.flowerType === 'red_rose' || rose.name === 'rose') {
        rose.traverse((child) => {
          if (child.isMesh && child.material) {
            if (child.material.color && child.material.roughness <= 0.46) {
              child.material.color.copy(color);
            }
          }
        });
      }
    });
  }

  setWrapColor(wrapHex, accentHex) {
    this.options.wrapColor = wrapHex;
    if (accentHex) this.options.accentColor = accentHex;
    if (this.wrappingMesh) {
      if (this.wrappingMesh.userData.outerMat) this.wrappingMesh.userData.outerMat.color.set(wrapHex);
      if (this.wrappingMesh.userData.innerMat && accentHex) this.wrappingMesh.userData.innerMat.color.set(accentHex);
    }
  }

  setRibbonColor(hexColor) {
    this.options.ribbonColor = hexColor;
    if (this.ribbonMesh && this.ribbonMesh.userData.ribbonMat) {
      this.ribbonMesh.userData.ribbonMat.color.set(hexColor);
    }
  }

  setRoseCount(count) {
    if (this.options.roseCount === count) return;
    this.options.roseCount = count;
    this.buildBouquet();
  }

  updateGiftTagText(recipient, message, sender) {
    this.options.recipient = recipient;
    this.options.giftMessage = message;
    this.options.sender = sender;
    if (this.giftTag) {
      this.giftTag.updateText(recipient, message, sender);
    }
  }

  toggleGiftTag(visible) {
    this.options.showGiftTag = visible;
    if (this.giftTag) {
      this.giftTag.group.visible = visible;
    }
  }

  toggleFauna(visible) {
    this.options.showFauna = visible;
    if (this.fauna) this.fauna.setVisible(visible);
  }

  toggleParticles(visible) {
    this.options.showParticles = visible;
    if (this.particles) this.particles.setVisible(visible);
  }

  toggleAutoRotate(enable) {
    this.options.autoRotate = enable;
    if (this.controls) this.controls.autoRotate = enable;
  }

  setCameraPreset(preset) {
    const duration = 1000;
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();

    let targetPos = new THREE.Vector3(0, 0.8, 12.0);
    let targetLook = new THREE.Vector3(0, 0.8, 0);

    if (preset === 'top') {
      targetPos = new THREE.Vector3(0, 9.8, 4.2);
      targetLook = new THREE.Vector3(0, 2.0, 0);
    } else if (preset === 'detail') {
      targetPos = new THREE.Vector3(0.9, 1.8, 5.5);
      targetLook = new THREE.Vector3(0.0, 1.8, -0.2);
    } else if (preset === 'ribbon') {
      targetPos = new THREE.Vector3(0, -1.35, 5.2);
      targetLook = new THREE.Vector3(0, -1.35, 0);
    } else if (preset === 'front') {
      this.userHasMovedCamera = false;
      const width = this.container ? this.container.clientWidth : window.innerWidth;
      const height = this.container ? this.container.clientHeight : window.innerHeight;
      const aspect = width / height;
      const baseDistance = 12.0;
      const targetZ = aspect < 1.0 
        ? baseDistance * Math.min(1.35, Math.max(1.0, 0.95 / aspect))
        : baseDistance;
      targetPos = new THREE.Vector3(0, 0.8, targetZ);
      targetLook = new THREE.Vector3(0, 0.8, 0);
    }

    const startTime = performance.now();
    const animateCamera = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.lerpVectors(startTarget, targetLook, ease);
      this.controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(animateCamera);
      }
    };
    requestAnimationFrame(animateCamera);
  }

  takeSnapshot() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  onWindowResize() {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.updateCameraFraming(width, height, false);
  }

  updateCameraFraming(width, height, isInitial = false) {
    if (!this.camera || !this.renderer) return;
    const aspect = width / height;
    this.camera.aspect = aspect;

    const baseFov = 38;
    const baseDistance = 12.0;

    if (aspect < 1.0) {
      // Portrait mode on mobile phones and vertical tablets:
      // Dynamically widen FOV and adjust Z distance so the bouquet, wrapping wings, and card are never clipped horizontally
      const portraitMultiplier = Math.max(1.0, 0.88 / aspect);
      this.camera.fov = Math.min(52, baseFov * Math.sqrt(portraitMultiplier));

      if (isInitial || !this.userHasMovedCamera) {
        const targetZ = baseDistance * Math.min(1.35, Math.max(1.0, 0.95 / aspect));
        this.camera.position.set(0, 0.8, targetZ);
        if (this.controls) this.controls.target.set(0, 0.8, 0);
      }
    } else {
      // Landscape mode on desktop, laptop, or landscape tablet
      this.camera.fov = baseFov;
      if (isInitial || !this.userHasMovedCamera) {
        this.camera.position.set(0, 0.8, baseDistance);
        if (this.controls) this.controls.target.set(0, 0.8, 0);
      }
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    if (this.isDisposed) return;

    requestAnimationFrame(this.animate.bind(this));

    const time = this.clock.getElapsedTime();

    this.controls.update();

    if (this.fauna) {
      this.fauna.update(time);
    }

    if (this.particles) {
      this.particles.update(time);
    }

    if (this.giftTag && this.giftTag.update) {
      this.giftTag.update(time);
    }

    if (this.bouquetGroup) {
      this.bouquetGroup.position.y = Math.sin(time * 0.8) * 0.025;
    }

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.isDisposed = true;
    window.removeEventListener('resize', this.handleResize);

    if (this.controls) this.controls.dispose();
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }
}
