import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GARMENTS, MATERIALS, PLACEMENTS, fullOutline } from './garments.js';
import { patternCanvas } from './textures.js';

const HOOD_HALF = [
  [0, 1.66], [0.26, 1.63], [0.46, 1.52], [0.58, 1.32], [0.6, 1.12], [0.5, 0.98], [0.3, 0.9], [0, 0.88],
];

const EXTRUDE = {
  depth: 0.08,
  bevelEnabled: true,
  bevelThickness: 0.11,
  bevelSize: 0.07,
  bevelSegments: 10,
  curveSegments: 12,
};

/**
 * Small three.js stage for one garment.
 * state = { garment, color, material, design: { source, placement, x, y, size } }
 */
export class Stage {
  constructor(container) {
    this.container = container;
    this.state = {
      garment: 'tshirt',
      color: '#f5f5f2',
      material: 'cotton',
      design: null,
      placement: 'center',
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    this.scene = scene;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x50505a, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2.5, 3, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffffff, 0.9);
    rim.position.set(-3, 2, -3);
    scene.add(rim);

    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    this.camera.position.set(0, 0.15, 6.4);

    const controls = new OrbitControls(this.camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3.2;
    controls.maxDistance = 10;
    controls.autoRotateSpeed = 1.6;
    controls.target.set(0, 0.1, 0);
    this.controls = controls;

    // soft contact shadow
    const sh = document.createElement('canvas');
    sh.width = sh.height = 128;
    const sg = sh.getContext('2d');
    const grad = sg.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.35)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sg.fillStyle = grad;
    sg.fillRect(0, 0, 128, 128);
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 1.2),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sh), transparent: true, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.75;
    scene.add(shadow);

    this.group = new THREE.Group();
    scene.add(this.group);

    this.bumpTex = null;
    this.frontCanvas = document.createElement('canvas');
    this.backCanvas = document.createElement('canvas');
    this.frontTex = new THREE.CanvasTexture(this.frontCanvas);
    this.backTex = new THREE.CanvasTexture(this.backCanvas);
    for (const t of [this.frontTex, this.backTex]) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    }
    this.frontMat = new THREE.MeshPhysicalMaterial({ map: this.frontTex });
    this.backMat = new THREE.MeshPhysicalMaterial({ map: this.backTex });
    this.hoodMat = new THREE.MeshPhysicalMaterial();

    this.buildGarment();
    this.applyMaterial();

    this.resizeObs = new ResizeObserver(() => this.resize());
    this.resizeObs.observe(container);
    this.resize();

    const loop = () => {
      this.raf = requestAnimationFrame(loop);
      controls.update();
      renderer.render(scene, this.camera);
    };
    loop();
  }

  // ---------- public API ----------
  set(partial) {
    const prev = this.state;
    this.state = { ...prev, ...partial };
    if (partial.garment && partial.garment !== prev.garment) this.buildGarment();
    if (partial.material && partial.material !== prev.material) this.applyMaterial();
    this.paint();
  }

  setAutoRotate(on) {
    this.controls.autoRotate = on;
  }

  resetView() {
    this.controls.reset();
    this.camera.position.set(0, 0.15, 6.4);
    this.controls.target.set(0, 0.1, 0);
  }

  showSide(side) {
    const z = side === 'back' ? -6.4 : 6.4;
    this.camera.position.set(0, 0.15, z);
    this.controls.target.set(0, 0.1, 0);
  }

  exportPNG() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.resizeObs.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  // ---------- internals ----------
  resize() {
    const { clientWidth: w, clientHeight: h } = this.container;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  buildGarment() {
    const def = GARMENTS[this.state.garment];
    for (const c of [...this.group.children]) {
      c.geometry.dispose();
      this.group.remove(c);
    }

    const outline = fullOutline(def.half);
    const xs = outline.map((p) => p[0]);
    const ys = outline.map((p) => p[1]);
    this.bbox = {
      minX: Math.min(...xs), maxX: Math.max(...xs),
      minY: Math.min(...ys), maxY: Math.max(...ys),
    };
    this.bbox.w = this.bbox.maxX - this.bbox.minX;
    this.bbox.h = this.bbox.maxY - this.bbox.minY;

    const body = this.extrude(outline);
    // Split cap group into back (first half) and front (second half) so the back can carry its own print.
    const [caps, sides] = body.groups;
    body.clearGroups();
    const half = caps.count / 2;
    body.addGroup(0, half, 1);
    body.addGroup(half, half, 0);
    body.addGroup(sides.start, sides.count, 0);
    const bodyMesh = new THREE.Mesh(body, [this.frontMat, this.backMat]);
    this.group.add(bodyMesh);

    if (def.hood) {
      const hood = this.extrude(fullOutline(HOOD_HALF), 0.6);
      const hoodMesh = new THREE.Mesh(hood, this.hoodMat);
      hoodMesh.position.z = -0.14;
      this.group.add(hoodMesh);
    }

    this.group.position.y = -0.1;

    // canvas sized to the garment's aspect so prints aren't stretched
    const W = 1400;
    const H = Math.round((W * this.bbox.h) / this.bbox.w);
    for (const c of [this.frontCanvas, this.backCanvas]) { c.width = W; c.height = H; }
    this.frontTex.dispose();
    this.backTex.dispose();
    this.frontTex.needsUpdate = true;
    this.backTex.needsUpdate = true;
    this.updateBumpRepeat();
    this.paint();
  }

  extrude(points, depthScale = 1) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const geo = new THREE.ExtrudeGeometry(shape, {
      ...EXTRUDE,
      depth: EXTRUDE.depth * depthScale,
      bevelThickness: EXTRUDE.bevelThickness * depthScale,
    });
    geo.translate(0, 0, -(EXTRUDE.depth * depthScale) / 2);
    // Re-map UVs to the garment bounding box (0..1) so one canvas covers the whole garment.
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const { minX, minY, w, h } = this.bbox;
    for (let i = 0; i < pos.count; i++) {
      uv.setXY(i, (pos.getX(i) - minX) / w, (pos.getY(i) - minY) / h);
    }
    uv.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }

  applyMaterial() {
    const m = MATERIALS[this.state.material];
    if (this.bumpTex) this.bumpTex.dispose();
    this.bumpTex = new THREE.CanvasTexture(patternCanvas(m.pattern));
    this.bumpTex.wrapS = this.bumpTex.wrapT = THREE.RepeatWrapping;
    this.updateBumpRepeat();
    for (const mat of [this.frontMat, this.backMat, this.hoodMat]) {
      mat.roughness = m.roughness;
      mat.metalness = m.metalness;
      mat.sheen = m.sheen;
      mat.sheenRoughness = 0.8;
      mat.clearcoat = m.clearcoat;
      mat.clearcoatRoughness = 0.4;
      mat.bumpMap = this.bumpTex;
      mat.bumpScale = m.bump;
      mat.envMapIntensity = m.metalness > 0.5 ? 1.2 : 0.5;
      mat.needsUpdate = true;
    }
  }

  updateBumpRepeat() {
    if (!this.bumpTex || !this.bbox) return;
    const density = MATERIALS[this.state.material].pattern === 'ripstop' ? 3 : 6;
    this.bumpTex.repeat.set(this.bbox.w * density, this.bbox.h * density);
  }

  // world (garment units) -> canvas px
  px(x, y) {
    const { minX, minY, w, h } = this.bbox;
    const c = this.frontCanvas;
    return [((x - minX) / w) * c.width, (1 - (y - minY) / h) * c.height];
  }
  unit() {
    return this.frontCanvas.width / this.bbox.w;
  }

  paint() {
    const s = this.state;
    const def = GARMENTS[s.garment];
    const base = s.color;
    this.hoodMat.color.set(shade(base, -0.12));
    this.paintSide(this.frontCanvas, def, base, 'front');
    this.paintSide(this.backCanvas, def, base, 'back');
    this.frontTex.needsUpdate = true;
    this.backTex.needsUpdate = true;
  }

  paintSide(canvas, def, base, side) {
    const g = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height, u = this.unit();
    g.setLineDash([]);
    g.fillStyle = base;
    g.fillRect(0, 0, W, H);

    // soft side shading = rounder body
    const sideShade = g.createLinearGradient(0, 0, W, 0);
    sideShade.addColorStop(0, 'rgba(0,0,0,0.16)');
    sideShade.addColorStop(0.3, 'rgba(0,0,0,0)');
    sideShade.addColorStop(0.7, 'rgba(0,0,0,0)');
    sideShade.addColorStop(1, 'rgba(0,0,0,0.16)');
    g.fillStyle = sideShade;
    g.fillRect(0, 0, W, H);
    const top = g.createLinearGradient(0, 0, 0, H);
    top.addColorStop(0, 'rgba(255,255,255,0.06)');
    top.addColorStop(1, 'rgba(0,0,0,0.08)');
    g.fillStyle = top;
    g.fillRect(0, 0, W, H);

    const dark = ribShade(base);
    const stitch = isLight(base) ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.22)';
    const half = def.half;
    const hemY = half[half.length - 1][1];

    // neckline band
    const neck = half.slice(0, 4);
    const neckFull = [...neck.slice(1).reverse().map(([x, y]) => [-x, y]), ...neck];
    g.lineJoin = g.lineCap = 'round';
    if (side === 'front') {
      g.strokeStyle = dark;
      g.lineWidth = 0.07 * u;
      polyline(g, neckFull.map(([x, y]) => this.px(x, y - 0.03)));
      g.stroke();
    }
    g.strokeStyle = stitch;
    g.lineWidth = 2;
    g.setLineDash([8, 6]);
    polyline(g, neckFull.map(([x, y]) => this.px(x, y - 0.08)));
    g.stroke();

    // hem: rib band or stitched hem
    const hemH = def.rib.hem || 0.06;
    const [hx0, hy0] = this.px(this.bbox.minX, hemY + hemH);
    const [hx1, hy1] = this.px(this.bbox.maxX, hemY);
    if (def.rib.hem) {
      g.setLineDash([]);
      g.fillStyle = dark;
      g.fillRect(hx0, hy0, hx1 - hx0, hy1 - hy0 + 20);
      ribLines(g, hx0, hy0, hx1 - hx0, hy1 - hy0 + 20, base);
    } else {
      g.strokeStyle = stitch;
      g.setLineDash([8, 6]);
      g.beginPath(); g.moveTo(hx0, hy0); g.lineTo(hx1, hy0); g.stroke();
    }

    // cuffs
    if (def.rib.cuffs) {
      g.setLineDash([]);
      for (const sx of [1, -1]) {
        const [[ax, ay], [bx, by]] = def.rib.cuffs;
        const poly = [[ax, ay], [bx, by], [bx - 0.03, by + 0.17], [ax - 0.03, ay + 0.17]]
          .map(([x, y]) => this.px(x * sx, y));
        g.fillStyle = dark;
        polyline(g, poly, true);
        g.fill();
      }
    } else {
      // short sleeve hem stitch
      g.strokeStyle = stitch;
      g.setLineDash([8, 6]);
      for (const sx of [1, -1]) {
        polyline(g, [[1.32, 0.56], [1.03, 0.29]].map(([x, y]) => this.px((x - 0.05) * sx, y + 0.05)));
        g.stroke();
      }
    }

    // garment details (front only)
    if (side === 'front') {
      for (const d of def.details) this.drawDetail(g, d, base, dark, stitch);
    }

    // print
    const s = this.state;
    const pl = PLACEMENTS[s.placement];
    if (s.design && pl.side === side) {
      const img = s.design;
      const size = pl.size * s.scale;
      const aspect = img.height / img.width;
      const dw = size * u;
      const dh = size * aspect * u;
      const [cx, cy] = this.px(pl.x + s.offsetX, pl.y + s.offsetY);
      g.save();
      g.setLineDash([]);
      if (side === 'back') {
        // back cap is seen mirrored, so flip the print to read correctly
        g.translate(W, 0);
        g.scale(-1, 1);
        g.drawImage(img, W - cx - dw / 2, cy - dh / 2, dw, dh);
      } else {
        g.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
      }
      g.restore();
    }
    g.setLineDash([]);
  }

  drawDetail(g, d, base, dark, stitch) {
    const u = this.unit();
    g.setLineDash([]);
    if (d === 'pocket') {
      const p = [[-0.55, -0.98], [0.55, -0.98], [0.42, -0.42], [-0.42, -0.42]].map(([x, y]) => this.px(x, y));
      g.fillStyle = 'rgba(0,0,0,0.05)';
      polyline(g, p, true); g.fill();
      g.strokeStyle = dark; g.lineWidth = 3;
      polyline(g, p, true); g.stroke();
      g.strokeStyle = stitch; g.lineWidth = 2; g.setLineDash([8, 6]);
      polyline(g, [[-0.5, -0.94], [0.5, -0.94], [0.38, -0.46], [-0.38, -0.46]].map(([x, y]) => this.px(x, y)), true);
      g.stroke();
    }
    if (d === 'strings') {
      g.strokeStyle = shade(base, isLight(base) ? -0.25 : 0.35);
      g.lineWidth = 0.035 * u;
      g.lineCap = 'round';
      for (const sx of [-1, 1]) {
        g.beginPath();
        const [x0, y0] = this.px(0.13 * sx, 0.96);
        const [x1, y1] = this.px(0.16 * sx, 0.5);
        g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
      }
    }
    if (d === 'zip') {
      const [x0, y0] = this.px(0, 1.06);
      const [, y1] = this.px(0, -1.3);
      g.fillStyle = 'rgba(0,0,0,0.18)';
      g.fillRect(x0 - 0.035 * u, y0, 0.07 * u, y1 - y0);
      g.strokeStyle = '#9aa0a6';
      g.lineWidth = 0.02 * u;
      g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0, y1); g.stroke();
      g.setLineDash([]);
      g.fillStyle = '#c9ccd1';
      g.fillRect(x0 - 0.025 * u, y0 + 0.06 * u, 0.05 * u, 0.13 * u);
    }
    if (d === 'chestPockets') {
      g.strokeStyle = 'rgba(0,0,0,0.35)';
      g.lineWidth = 0.022 * u;
      for (const sx of [-1, 1]) {
        g.beginPath();
        const [a, b] = this.px(0.28 * sx, 0.5);
        const [c, e] = this.px(0.66 * sx, 0.42);
        g.moveTo(a, b); g.lineTo(c, e); g.stroke();
      }
    }
    if (d === 'collar') {
      g.strokeStyle = dark;
      g.lineWidth = 0.03 * u;
      polyline(g, [[-0.4, 1.22], [-0.2, 1.12], [0, 1.1], [0.2, 1.12], [0.4, 1.22]].map(([x, y]) => this.px(x, y)));
      g.stroke();
    }
  }
}

// ---------- helpers ----------
// rib / cuff colour: a little darker for light fabrics, a little lighter for very dark ones
function ribShade(hex) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  const l = hsl.l < 0.18 ? hsl.l + 0.06 : hsl.l * 0.86;
  c.setHSL(hsl.h, hsl.s, l);
  return '#' + c.getHexString();
}

function polyline(g, pts, close = false) {
  g.beginPath();
  pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  if (close) g.closePath();
}

function ribLines(g, x, y, w, h, base) {
  g.strokeStyle = isLight(base) ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';
  g.lineWidth = 2;
  for (let i = x; i < x + w; i += 9) {
    g.beginPath(); g.moveTo(i, y); g.lineTo(i, y + h); g.stroke();
  }
}

function shade(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  c.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + amt)));
  return '#' + c.getHexString();
}

function isLight(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255 > 0.55;
}
