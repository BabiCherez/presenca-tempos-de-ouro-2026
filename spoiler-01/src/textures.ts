import * as THREE from "three";
import { AMBER, CHAMPAGNE, ENVELOPE_WORD, GOLD, GOLD_LIGHT, NAVY, ROOM_NUMBER, SANS, SCRIPT, DECO } from "./theme";

// Texturas procedurais estáticas (desenhadas uma vez em canvas). Nada aqui anima sozinho.

const canvas = (w: number, h: number) => {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return [c, c.getContext("2d") as CanvasRenderingContext2D] as const;
};

const finish = (c: HTMLCanvasElement, repeat: [number, number] = [1, 1]) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  return t;
};

// Pseudo-aleatório determinístico
const rand = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

/** Piso xadrez de mármore preto e creme (2x2 ladrilhos por tile de textura). */
export const marbleChecker = (repeat: [number, number]) => {
  const [c, g] = canvas(1024, 1024);
  const r = rand(7);
  for (let i = 0; i < 2; i++)
    for (let j = 0; j < 2; j++) {
      const dark = (i + j) % 2 === 0;
      g.fillStyle = dark ? "#0d0d10" : "#e9e1cf";
      g.fillRect(i * 512, j * 512, 512, 512);
      // veios
      g.strokeStyle = dark ? "rgba(255,255,255,0.06)" : "rgba(90,70,40,0.13)";
      for (let k = 0; k < 7; k++) {
        g.lineWidth = 1 + r() * 2;
        g.beginPath();
        let x = i * 512 + r() * 512;
        let y = j * 512;
        g.moveTo(x, y);
        for (let s = 0; s < 8; s++) {
          x += (r() - 0.5) * 120;
          y += 64;
          g.lineTo(Math.min(Math.max(x, i * 512), i * 512 + 512), y);
        }
        g.stroke();
      }
      g.strokeStyle = "rgba(0,0,0,0.5)";
      g.lineWidth = 3;
      g.strokeRect(i * 512, j * 512, 512, 512);
    }
  return finish(c, repeat);
};

/** Papel de parede Art Déco: leques dourados finos sobre azul-marinho profundo. */
export const decoWallpaper = (repeat: [number, number]) => {
  const [c, g] = canvas(512, 512);
  g.fillStyle = "#0a1433";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "rgba(201,161,59,0.55)";
  g.lineWidth = 2;
  const fan = (cx: number, cy: number, r: number) => {
    g.beginPath();
    g.arc(cx, cy, r, Math.PI, 2 * Math.PI);
    g.stroke();
    for (let k = 1; k < 8; k++) {
      const a = Math.PI + (k * Math.PI) / 8;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      g.stroke();
    }
    g.beginPath();
    g.arc(cx, cy, r * 0.55, Math.PI, 2 * Math.PI);
    g.stroke();
  };
  for (let row = 0; row < 5; row++)
    for (let col = -1; col < 4; col++) {
      const off = row % 2 ? 64 : 0;
      fan(col * 128 + off + 64, row * 128 + 128, 64);
    }
  return finish(c, repeat);
};

/** Lambri de madeira escura com frisos dourados. */
export const darkWood = (repeat: [number, number]) => {
  const [c, g] = canvas(512, 512);
  const grad = g.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0, "#1c120c");
  grad.addColorStop(0.5, "#24170e");
  grad.addColorStop(1, "#1a110b");
  g.fillStyle = grad;
  g.fillRect(0, 0, 512, 512);
  const r = rand(3);
  g.strokeStyle = "rgba(0,0,0,0.35)";
  for (let k = 0; k < 60; k++) {
    g.lineWidth = r() * 2;
    const y = r() * 512;
    g.beginPath();
    g.moveTo(0, y);
    g.bezierCurveTo(170, y + (r() - 0.5) * 20, 340, y + (r() - 0.5) * 20, 512, y);
    g.stroke();
  }
  return finish(c, repeat);
};

/** Parquet escuro (piso do quarto). */
export const parquet = (repeat: [number, number]) => {
  const [c, g] = canvas(512, 512);
  const r = rand(11);
  for (let i = 0; i < 8; i++) {
    const shade = 28 + Math.floor(r() * 14);
    g.fillStyle = `rgb(${shade + 10},${shade},${shade - 8})`;
    g.fillRect(0, i * 64, 512, 64);
    g.fillStyle = "rgba(0,0,0,0.6)";
    g.fillRect(0, i * 64, 512, 2);
    const cut = r() * 512;
    g.fillRect(cut, i * 64, 2, 64);
  }
  return finish(c, repeat);
};

/** Placa da porta com o número do quarto. */
export const numberPlate = () => {
  const [c, g] = canvas(512, 256);
  g.fillStyle = "#0a0a0c";
  g.fillRect(0, 0, 512, 256);
  g.strokeStyle = GOLD;
  g.lineWidth = 8;
  g.strokeRect(14, 14, 484, 228);
  g.lineWidth = 2;
  g.strokeRect(30, 30, 452, 196);
  g.fillStyle = GOLD_LIGHT;
  g.font = `400 170px "${DECO}"`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(ROOM_NUMBER, 256, 138);
  return finish(c);
};

/** Frente do envelope: azul-marinho, borda dourada Art Déco, "Convite" em cursiva dourada. */
export const envelopeFront = () => {
  const W = 1600;
  const H = 1100;
  const [c, g] = canvas(W, H);
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0e1f5c");
  bg.addColorStop(1, NAVY);
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // papel: leve textura
  const r = rand(5);
  for (let k = 0; k < 4000; k++) {
    g.fillStyle = `rgba(255,255,255,${r() * 0.03})`;
    g.fillRect(r() * W, r() * H, 2, 2);
  }
  // bordas douradas
  g.strokeStyle = GOLD;
  g.lineWidth = 10;
  g.strokeRect(40, 40, W - 80, H - 80);
  g.lineWidth = 3;
  g.strokeRect(70, 70, W - 140, H - 140);
  // cantos Art Déco (leques)
  const corner = (x: number, y: number, a0: number) => {
    for (let k = 0; k <= 6; k++) {
      const a = a0 + (k * Math.PI) / 12;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.cos(a) * 110, y + Math.sin(a) * 110);
      g.stroke();
    }
    g.beginPath();
    g.arc(x, y, 110, a0, a0 + Math.PI / 2);
    g.stroke();
  };
  g.lineWidth = 3;
  corner(70, 70, 0);
  corner(W - 70, 70, Math.PI / 2);
  corner(W - 70, H - 70, Math.PI);
  corner(70, H - 70, (3 * Math.PI) / 2);
  // palavra
  const grad = g.createLinearGradient(0, H * 0.35, 0, H * 0.65);
  grad.addColorStop(0, GOLD_LIGHT);
  grad.addColorStop(0.5, GOLD);
  grad.addColorStop(1, "#9c7a26");
  g.fillStyle = grad;
  g.font = `400 300px "${SCRIPT}"`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(ENVELOPE_WORD, W / 2, H / 2 - 20);
  // fio com leque central
  g.strokeStyle = GOLD;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(W / 2 - 360, H * 0.74);
  g.lineTo(W / 2 - 50, H * 0.74);
  g.moveTo(W / 2 + 50, H * 0.74);
  g.lineTo(W / 2 + 360, H * 0.74);
  g.stroke();
  for (let k = 0; k <= 6; k++) {
    const a = Math.PI + (k * Math.PI) / 6;
    g.beginPath();
    g.moveTo(W / 2, H * 0.74 + 6);
    g.lineTo(W / 2 + Math.cos(a) * 40, H * 0.74 + 6 + Math.sin(a) * 40);
    g.stroke();
  }
  return finish(c);
};

/** Selo de cera dourado com leque gravado. */
export const sealTexture = () => {
  const [c, g] = canvas(512, 512);
  const rad = g.createRadialGradient(220, 200, 20, 256, 256, 256);
  rad.addColorStop(0, "#f2d488");
  rad.addColorStop(0.55, GOLD);
  rad.addColorStop(1, "#6e5317");
  g.fillStyle = rad;
  g.beginPath();
  g.arc(256, 256, 250, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = "rgba(60,40,8,0.8)";
  g.lineWidth = 10;
  g.beginPath();
  g.arc(256, 256, 190, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 8;
  for (let k = 0; k <= 6; k++) {
    const a = Math.PI + (k * Math.PI) / 6;
    g.beginPath();
    g.moveTo(256, 300);
    g.lineTo(256 + Math.cos(a) * 130, 300 + Math.sin(a) * 130);
    g.stroke();
  }
  return finish(c);
};

export const warmGlow = () => {
  const [c, g] = canvas(256, 256);
  const rad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  rad.addColorStop(0, "rgba(255,230,170,1)");
  rad.addColorStop(0.35, "rgba(232,163,61,0.55)");
  rad.addColorStop(1, "rgba(232,163,61,0)");
  g.fillStyle = rad;
  g.fillRect(0, 0, 256, 256);
  return finish(c);
};

export { AMBER, CHAMPAGNE, SANS };
