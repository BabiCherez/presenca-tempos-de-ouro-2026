import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Paleta Tempos de Ouro
export const NAVY = "#0B1A4F";
export const NAVY_DEEP = "#070F2E";
export const GOLD = "#C9A13B";
export const GOLD_LIGHT = "#E6C774";
export const CHAMPAGNE = "#F1E9D6";
export const BLACK = "#0A0A0C";
export const AMBER = "#E8A33D";

export const DECO = "Poiret One";
export const SANS = "Josefin Sans";
export const SCRIPT = "Pinyon Script";

export const fontsReady = Promise.all([
  loadFont({ family: DECO, url: staticFile("fonts/PoiretOne.woff"), weight: "400" }),
  loadFont({ family: SANS, url: staticFile("fonts/JosefinSans-300.woff"), weight: "300" }),
  loadFont({ family: SANS, url: staticFile("fonts/JosefinSans-400.woff"), weight: "400" }),
  loadFont({ family: SANS, url: staticFile("fonts/JosefinSans-600.woff"), weight: "600" }),
  loadFont({ family: SCRIPT, url: staticFile("fonts/PinyonScript.woff"), weight: "400" }),
]);

// Textos editáveis do spoiler
export const ROOM_NUMBER = "512"; // pista: 05/12
export const ENVELOPE_WORD = "Convite";
export const END_TITLE = "EM BREVE";
export const END_DATE = "29.10"; // PROVISÓRIO — data da próxima revelação, a confirmar
