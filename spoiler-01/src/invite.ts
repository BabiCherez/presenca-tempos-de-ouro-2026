import * as THREE from "three";
import { DECO, ENVELOPE_WORD, SCRIPT } from "./theme";

/**
 * Convite estilo Gatsby / Art Déco, desenhado em código.
 * Um mesmo desenho gera 4 mapas: cor, metal (onde é foil dourado), rugosidade e relevo.
 * Assim o dourado se comporta como hot stamping metálico e reflete a luz quando a câmera se move.
 */
export const INVITE_W = 1800;
export const INVITE_H = 1200;

type Mode = "color" | "metal" | "rough" | "bump";

const NAVY_A = "#0a1645";
const NAVY_B = "#050c2b";

const draw = (g: CanvasRenderingContext2D, mode: Mode) => {
  const W = INVITE_W;
  const H = INVITE_H;
  const gold = (y0: number, y1: number) => {
    if (mode === "metal") return "#ffffff";
    if (mode === "rough") return "#2a2a2a"; // foil: pouco rugoso
    if (mode === "bump") return "#ffffff"; // foil levemente em relevo
    const gr = g.createLinearGradient(0, y0, W, y1);
    gr.addColorStop(0, "#f3d98b");
    gr.addColorStop(0.35, "#c9a13b");
    gr.addColorStop(0.6, "#f0d27e");
    gr.addColorStop(1, "#a07a22");
    return gr;
  };

  // ---------------- papel
  if (mode === "color") {
    const bg = g.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, NAVY_A);
    bg.addColorStop(1, NAVY_B);
    g.fillStyle = bg;
    g.fillRect(0, 0, W, H);
    // trama de papel de linho
    g.globalAlpha = 0.05;
    g.strokeStyle = "#ffffff";
    for (let i = 0; i < W; i += 4) {
      g.beginPath();
      g.moveTo(i, 0);
      g.lineTo(i, H);
      g.stroke();
    }
    for (let j = 0; j < H; j += 4) {
      g.beginPath();
      g.moveTo(0, j);
      g.lineTo(W, j);
      g.stroke();
    }
    g.globalAlpha = 1;
  } else {
    g.fillStyle = mode === "rough" ? "#d0d0d0" : "#000000";
    g.fillRect(0, 0, W, H);
    if (mode === "bump") {
      g.globalAlpha = 0.15;
      g.strokeStyle = "#555";
      for (let i = 0; i < W; i += 4) {
        g.beginPath();
        g.moveTo(i, 0);
        g.lineTo(i, H);
        g.stroke();
      }
      g.globalAlpha = 1;
    }
  }

  const stroke = (w: number) => {
    g.strokeStyle = gold(0, H);
    g.lineWidth = w;
  };
  const fill = () => {
    g.fillStyle = gold(0, H);
  };

  // ---------------- moldura externa com cantos em degrau (zigurate)
  const frame = (inset: number, step: number, w: number) => {
    const x0 = inset;
    const y0 = inset;
    const x1 = W - inset;
    const y1 = H - inset;
    g.beginPath();
    g.moveTo(x0 + step * 2, y0);
    g.lineTo(x1 - step * 2, y0);
    g.lineTo(x1 - step * 2, y0 + step);
    g.lineTo(x1 - step, y0 + step);
    g.lineTo(x1 - step, y0 + step * 2);
    g.lineTo(x1, y0 + step * 2);
    g.lineTo(x1, y1 - step * 2);
    g.lineTo(x1 - step, y1 - step * 2);
    g.lineTo(x1 - step, y1 - step);
    g.lineTo(x1 - step * 2, y1 - step);
    g.lineTo(x1 - step * 2, y1);
    g.lineTo(x0 + step * 2, y1);
    g.lineTo(x0 + step * 2, y1 - step);
    g.lineTo(x0 + step, y1 - step);
    g.lineTo(x0 + step, y1 - step * 2);
    g.lineTo(x0, y1 - step * 2);
    g.lineTo(x0, y0 + step * 2);
    g.lineTo(x0 + step, y0 + step * 2);
    g.lineTo(x0 + step, y0 + step);
    g.lineTo(x0 + step * 2, y0 + step);
    g.closePath();
    stroke(w);
    g.stroke();
  };
  frame(34, 30, 9);
  frame(62, 22, 2.5);
  frame(80, 16, 1.5);

  // ---------------- leques nos cantos internos
  const fan = (cx: number, cy: number, r: number, a0: number, a1: number, rays: number, w: number) => {
    stroke(w);
    for (let k = 0; k <= rays; k++) {
      const a = a0 + ((a1 - a0) * k) / rays;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      g.stroke();
    }
    g.beginPath();
    g.arc(cx, cy, r, a0, a1);
    g.stroke();
    g.beginPath();
    g.arc(cx, cy, r * 0.62, a0, a1);
    g.stroke();
  };
  const ci = 110;
  fan(ci, ci, 120, 0, Math.PI / 2, 9, 2);
  fan(W - ci, ci, 120, Math.PI / 2, Math.PI, 9, 2);
  fan(W - ci, H - ci, 120, Math.PI, 1.5 * Math.PI, 9, 2);
  fan(ci, H - ci, 120, 1.5 * Math.PI, 2 * Math.PI, 9, 2);

  // ---------------- faixas laterais com losangos e linhas verticais
  for (const sx of [190, W - 190]) {
    stroke(2);
    for (const dx of [-26, -14, 14, 26]) {
      g.beginPath();
      g.moveTo(sx + dx, 260);
      g.lineTo(sx + dx, H - 260);
      g.stroke();
    }
    for (let y = 300; y < H - 280; y += 90) {
      g.beginPath();
      g.moveTo(sx, y - 26);
      g.lineTo(sx + 12, y);
      g.lineTo(sx, y + 26);
      g.lineTo(sx - 12, y);
      g.closePath();
      fill();
      g.fill();
    }
  }

  // ---------------- raios de sol atrás do cartucho
  const cx = W / 2;
  const cy = H / 2 + 20;
  stroke(2);
  g.save();
  g.beginPath();
  g.rect(260, 100, W - 520, H - 200);
  g.clip();
  for (let k = 0; k < 44; k++) {
    const a = (k / 44) * Math.PI * 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * 330, cy + Math.sin(a) * 250);
    g.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 700);
    g.globalAlpha = mode === "color" ? 0.45 : 0.6;
    g.stroke();
  }
  g.globalAlpha = 1;
  g.restore();

  // ---------------- cartucho central (moldura Gatsby com cantos côncavos)
  const cart = (hw: number, hh: number, r: number) => {
    g.beginPath();
    g.moveTo(cx - hw + r, cy - hh);
    // topo com arco central elevado
    g.lineTo(cx - 120, cy - hh);
    g.quadraticCurveTo(cx, cy - hh - 70, cx + 120, cy - hh);
    g.lineTo(cx + hw - r, cy - hh);
    g.arc(cx + hw, cy - hh, r, Math.PI, Math.PI / 2, true);
    g.lineTo(cx + hw, cy + hh - r);
    g.arc(cx + hw, cy + hh, r, 1.5 * Math.PI, Math.PI, true);
    g.lineTo(cx + 120, cy + hh);
    g.quadraticCurveTo(cx, cy + hh + 70, cx - 120, cy + hh);
    g.lineTo(cx - hw + r, cy + hh);
    g.arc(cx - hw, cy + hh, r, 0, -Math.PI / 2, true);
    g.lineTo(cx - hw, cy - hh + r);
    g.arc(cx - hw, cy - hh, r, Math.PI / 2, 0, true);
    g.closePath();
  };
  // fundo do cartucho (cobre os raios)
  cart(470, 290, 46);
  if (mode === "color") {
    const bg = g.createRadialGradient(cx, cy, 40, cx, cy, 520);
    bg.addColorStop(0, "#132a73");
    bg.addColorStop(1, NAVY_B);
    g.fillStyle = bg;
  } else {
    g.fillStyle = mode === "rough" ? "#d0d0d0" : "#000000";
  }
  g.fill();
  stroke(7);
  g.stroke();
  cart(448, 268, 38);
  stroke(2);
  g.stroke();

  // ---------------- textos
  g.textAlign = "center";
  g.textBaseline = "middle";
  fill();
  g.font = `400 46px "${DECO}"`;
  const spaced = (s: string, x: number, y: number, track: number) => {
    const chars = [...s];
    const widths = chars.map((ch) => g.measureText(ch).width);
    const total = widths.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
    let px = x - total / 2;
    chars.forEach((ch, i) => {
      g.fillText(ch, px + widths[i] / 2, y);
      px += widths[i] + track;
    });
  };
  spaced("Nº 0512", cx, cy - 175, 14);
  // palavra principal em cursiva dourada
  g.font = `400 280px "${SCRIPT}"`;
  if (mode === "color") {
    // leve sombra/gravação
    g.fillStyle = "rgba(0,0,0,0.45)";
    g.fillText(ENVELOPE_WORD, cx + 4, cy + 4);
  }
  fill();
  g.fillText(ENVELOPE_WORD, cx, cy - 10);
  // divisor com leque
  stroke(2.5);
  g.beginPath();
  g.moveTo(cx - 300, cy + 140);
  g.lineTo(cx - 46, cy + 140);
  g.moveTo(cx + 46, cy + 140);
  g.lineTo(cx + 300, cy + 140);
  g.stroke();
  fan(cx, cy + 146, 40, Math.PI, 2 * Math.PI, 8, 2.5);
  g.font = `400 34px "${DECO}"`;
  fill();
  spaced("PESSOAL E INTRANSFERÍVEL", cx, cy + 205, 9);

  // losango inferior e superior
  for (const yy of [64, H - 64]) {
    g.beginPath();
    g.moveTo(cx, yy - 18);
    g.lineTo(cx + 30, yy);
    g.lineTo(cx, yy + 18);
    g.lineTo(cx - 30, yy);
    g.closePath();
    fill();
    g.fill();
  }
};

const mk = (mode: Mode, srgb: boolean) => {
  const c = document.createElement("canvas");
  c.width = INVITE_W;
  c.height = INVITE_H;
  draw(c.getContext("2d") as CanvasRenderingContext2D, mode);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 16;
  return t;
};

export const inviteMaps = () => ({
  map: mk("color", true),
  metalnessMap: mk("metal", false),
  roughnessMap: mk("rough", false),
  bumpMap: mk("bump", false),
});

/** Lacre de cera: contorno irregular extrudado, com leque gravado em relevo. */
export const sealGeometry = (r = 0.032) => {
  const shape = new THREE.Shape();
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rr = r * (1 + 0.07 * Math.sin(a * 5) + 0.04 * Math.sin(a * 11 + 1.3));
    const x = Math.cos(a) * rr;
    const y = Math.sin(a) * rr;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.0025, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.004, bevelSegments: 4, curveSegments: 48 });
  // UV planar para o relevo
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = pos.getX(i) / (r * 2.4) + 0.5;
    uv[i * 2 + 1] = pos.getY(i) / (r * 2.4) + 0.5;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
};

export const sealBump = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d") as CanvasRenderingContext2D;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#202020";
  g.lineWidth = 14;
  g.beginPath();
  g.arc(256, 256, 160, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 10;
  for (let k = 0; k <= 8; k++) {
    const a = Math.PI + (k * Math.PI) / 8;
    g.beginPath();
    g.moveTo(256, 300);
    g.lineTo(256 + Math.cos(a) * 120, 300 + Math.sin(a) * 120);
    g.stroke();
  }
  g.beginPath();
  g.arc(256, 300, 120, Math.PI, 2 * Math.PI);
  g.stroke();
  return new THREE.CanvasTexture(c);
};
