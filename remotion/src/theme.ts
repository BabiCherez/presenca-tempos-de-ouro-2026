import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Paleta do pacote de produção (p. 5)
export const NAVY = "#0B1A4F";
export const GOLD = "#C9A13B";
export const CHAMPAGNE = "#F1E9D6";
export const BLACK = "#0A0A0C";
export const AMBER = "#E8A33D";

// Fontes OFL (Poiret One = Art Déco do título; Josefin Sans = datas e cartelas)
export const DECO = "Poiret One";
export const SANS = "Josefin Sans";

loadFont({ family: DECO, url: staticFile("fonts/PoiretOne.woff"), weight: "400" });
loadFont({ family: SANS, url: staticFile("fonts/JosefinSans-300.woff"), weight: "300" });
loadFont({ family: SANS, url: staticFile("fonts/JosefinSans-400.woff"), weight: "400" });
loadFont({ family: SANS, url: staticFile("fonts/JosefinSans-600.woff"), weight: "600" });
