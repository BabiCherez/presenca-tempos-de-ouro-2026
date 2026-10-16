import * as THREE from "three";

// Texturas procedurais (estáticas) para a prova da rota A. Ruído determinístico.

const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const tex = (c: HTMLCanvasElement, repeat: [number, number], srgb = false) => {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
};

const cv = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d") as CanvasRenderingContext2D] as const;
};

/** Trama de algodão (luva): relevo de ponto de malha fino + irregularidade. */
export const cottonKnit = (repeat: [number, number] = [6, 6]) => {
  const [c, g] = cv(256, 256);
  const r = rand(21);
  g.fillStyle = "#7a7a7a";
  g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 4)
    for (let x = 0; x < 256; x += 4) {
      const v = 120 + r() * 70;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.beginPath();
      g.ellipse(x + 2, y + 2, 1.7, 2.2, (y / 4) % 2 ? 0.5 : -0.5, 0, Math.PI * 2);
      g.fill();
    }
  // fiapos
  g.strokeStyle = "rgba(255,255,255,0.25)";
  for (let k = 0; k < 80; k++) {
    g.lineWidth = 0.6;
    g.beginPath();
    const x = r() * 256;
    const y = r() * 256;
    g.moveTo(x, y);
    g.lineTo(x + (r() - 0.5) * 14, y + (r() - 0.5) * 14);
    g.stroke();
  }
  return tex(c, repeat);
};

/** Sarja de lã (uniforme): diagonais finas + variação de fio. */
export const woolTwill = (repeat: [number, number] = [8, 8]) => {
  const [c, g] = cv(256, 256);
  const r = rand(33);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 256, 256);
  for (let k = -256; k < 512; k += 3) {
    const v = 95 + r() * 80;
    g.strokeStyle = `rgb(${v},${v},${v})`;
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k + 256, 256);
    g.stroke();
  }
  // felpa
  for (let k = 0; k < 2500; k++) {
    const v = 60 + r() * 140;
    g.fillStyle = `rgba(${v},${v},${v},0.35)`;
    g.fillRect(r() * 256, r() * 256, 1, 1);
  }
  return tex(c, repeat);
};

/** Cor da lã: azul-marinho com variação sutil (sem ficar chapado). */
export const woolColor = (repeat: [number, number] = [3, 3]) => {
  const [c, g] = cv(256, 256);
  const r = rand(44);
  g.fillStyle = "#0c1638";
  g.fillRect(0, 0, 256, 256);
  for (let k = 0; k < 4000; k++) {
    const d = (r() - 0.5) * 16;
    g.fillStyle = `rgba(${12 + d},${22 + d},${56 + d},0.5)`;
    g.fillRect(r() * 256, r() * 256, 2, 2);
  }
  return tex(c, repeat, true);
};

/** Fibra de papel (relevo) para o convite. */
export const paperFiber = (repeat: [number, number] = [2, 2]) => {
  const [c, g] = cv(512, 512);
  const r = rand(55);
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 9000; k++) {
    const v = 100 + r() * 60;
    g.fillStyle = `rgba(${v},${v},${v},0.5)`;
    g.fillRect(r() * 512, r() * 512, 1 + r() * 2, 1);
  }
  g.strokeStyle = "rgba(170,170,170,0.35)";
  for (let k = 0; k < 400; k++) {
    g.lineWidth = 0.6;
    g.beginPath();
    const x = r() * 512;
    const y = r() * 512;
    g.moveTo(x, y);
    g.quadraticCurveTo(x + (r() - 0.5) * 20, y + (r() - 0.5) * 20, x + (r() - 0.5) * 30, y + (r() - 0.5) * 30);
    g.stroke();
  }
  return tex(c, repeat);
};

/** Assoalho de tábuas de madeira escura com veios (cor + relevo). */
export const woodFloor = (repeat: [number, number] = [2, 2]) => {
  const [c, g] = cv(1024, 1024);
  const [cb, gb] = cv(1024, 1024);
  const r = rand(66);
  const boardH = 128;
  for (let i = 0; i < 1024 / boardH; i++) {
    const base = 46 + r() * 16;
    const off = r() * 1024;
    for (let x = 0; x < 1024; x += 2) {
      for (let y = 0; y < boardH; y += 2) {
        const w1 = Math.sin((x + off) * 0.006 + Math.sin(y * 0.05 + i * 1.7) * 3.1 + Math.sin(x * 0.0021 + i) * 4);
        const w2 = Math.sin((x + off) * 0.031 + y * 0.11) * 0.25;
        const n = (w1 * 0.75 + w2) * 0.5 + 0.5 + (r() - 0.5) * 0.08;
        const v = base * (0.84 + n * 0.22);
        g.fillStyle = `rgb(${v + 14},${v * 0.72},${v * 0.48})`;
        g.fillRect(x, i * boardH + y, 2, 2);
        const b = 110 + n * 50;
        gb.fillStyle = `rgb(${b},${b},${b})`;
        gb.fillRect(x, i * boardH + y, 2, 2);
      }
    }
    // juntas
    g.fillStyle = "rgba(0,0,0,0.75)";
    g.fillRect(0, i * boardH, 1024, 3);
    gb.fillStyle = "#202020";
    gb.fillRect(0, i * boardH, 1024, 3);
    const cut = r() * 1024;
    g.fillRect(cut, i * boardH, 3, boardH);
    gb.fillRect(cut, i * boardH, 3, boardH);
  }
  return { map: tex(c, repeat, true), bump: tex(cb, repeat) };
};

/** Reboco/papel de parede com manchas e leve desgaste (multiplica a cor). */
export const wallGrime = (repeat: [number, number] = [1, 1]) => {
  const [c, g] = cv(512, 512);
  const r = rand(77);
  g.fillStyle = "#d8d8d8";
  g.fillRect(0, 0, 512, 512);
  for (let k = 0; k < 140; k++) {
    const x = r() * 512;
    const y = r() * 512;
    const rad = 10 + r() * 60;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad);
    gr.addColorStop(0, `rgba(120,110,95,${0.08 + r() * 0.1})`);
    gr.addColorStop(1, "rgba(120,110,95,0)");
    g.fillStyle = gr;
    g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
  }
  return tex(c, repeat);
};

/**
 * Ambiente de reflexo quente e escuro (para metais e foil): um "corredor" com faixas de luz âmbar.
 * Evita o reflexo branco de estúdio que deixava o azul-marinho lavado.
 */
export const warmEnvScene = () => {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#07060a");
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(10, 6, 10),
    new THREE.MeshBasicMaterial({ color: "#0d0b10", side: THREE.BackSide }),
  );
  scene.add(box);
  const panel = (w: number, h: number, color: string, intensity: number, pos: [number, number, number], rotY = 0) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    m.position.set(...pos);
    m.rotation.y = rotY;
    scene.add(m);
  };
  panel(3, 0.6, "#ffcf8a", 6, [0, 2.9, 0]); // luminária do teto
  panel(0.4, 0.8, "#ffb45e", 4, [-4.9, 1.2, -2], Math.PI / 2); // arandela
  panel(0.4, 0.8, "#ffb45e", 4, [4.9, 1.2, -2], -Math.PI / 2);
  panel(6, 0.2, "#ffd9a0", 1.5, [0, 0.1, -4.9]); // fresta
  panel(2, 2, "#1d2a55", 0.6, [0, 1.5, 4.9]); // azul nas sombras
  return scene;
};
