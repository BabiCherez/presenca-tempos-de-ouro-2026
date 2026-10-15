// GERADO por tools/export_remotion.py a partir de tools/shots.py — edições no Studio são sobrescritas ao regenerar.
import { Audio } from "@remotion/media";
import { TransitionSeries } from "@remotion/transitions";
import type React from "react";
import { AbsoluteFill, staticFile, useVideoConfig } from "remotion";
import { Hud } from "./Hud";
import { LightOverlay } from "./LightOverlay";
import { Shot } from "./Shot";
import { Signature } from "./Signature";
import { TitleCard } from "./TitleCard";
import { BLACK } from "./theme";

type TrailerProps = {
  readonly showHud: boolean;
  readonly logo: string;
};

export const Trailer: React.FC<TrailerProps> = ({ showHud, logo }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <TransitionSeries name="Planos">
        <TransitionSeries.Sequence name="1.1 · Som de projetor; a luz do projetor pisca três ve" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 1.1" premountFor={fps} clip="clips/TDO_1.1.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="1.2 · Cidade Art Déco ao entardecer, bondes, letreiros" durationInFrames={144} premountFor={fps}>
          <Shot name="Clipe 1.2" premountFor={fps} clip="clips/TDO_1.2.mp4" past={true} verticalPan={true} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="1.3 · Pedestres de fedora e vestidos de franja; carro " durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 1.3" premountFor={fps} clip="clips/TDO_1.3.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="1.4 · P2 caminha, tira o envelope da bolsa" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 1.4" premountFor={fps} clip="clips/TDO_1.4.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="1.5 · Envelope nas mãos de P2; foco vai do selo de cer" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 1.5" premountFor={fps} clip="clips/TDO_1.5.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="1.6 · P2 toca a campainha; a porta abre e P1 (look 1) " durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 1.6" premountFor={fps} clip="clips/TDO_1.6.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="1.7 · Na penteadeira, P1 rompe o lacre; a cera estala" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 1.7" premountFor={fps} clip="clips/TDO_1.7.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="1.8 · P1 retira o convite; a câmera fecha no texto; no" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 1.8" premountFor={fps} clip="clips/TDO_1.8.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.1 · Mãos de P1 tiram o vestido preto e dourado do ca" durationInFrames={36} premountFor={fps}>
          <Shot name="Clipe 2.1" premountFor={fps} clip="clips/TDO_2.1.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.2 · Colar de pérolas fechado na nuca de P1" durationInFrames={36} premountFor={fps}>
          <Shot name="Clipe 2.2" premountFor={fps} clip="clips/TDO_2.2.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.3 · P1 passa batom vermelho" durationInFrames={36} premountFor={fps}>
          <Shot name="Clipe 2.3" premountFor={fps} clip="clips/TDO_2.3.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.4 · P4 fecha a abotoadura dourada" durationInFrames={36} premountFor={fps}>
          <Shot name="Clipe 2.4" premountFor={fps} clip="clips/TDO_2.4.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.5 · Relógio de bolso dourado se fecha com clique" durationInFrames={36} premountFor={fps}>
          <Shot name="Clipe 2.5" premountFor={fps} clip="clips/TDO_2.5.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.6 · Sapatos de salto caminham no mármore preto e bra" durationInFrames={36} premountFor={fps}>
          <Shot name="Clipe 2.6" premountFor={fps} clip="clips/TDO_2.6.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.7 · P1 (look 2) ergue o leque com o verso champagne," durationInFrames={96} premountFor={fps}>
          <Shot name="Clipe 2.7" premountFor={fps} clip="clips/TDO_2.7.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.8 · Mão enluvada gira o cronograma; a janela para em" durationInFrames={96} premountFor={fps}>
          <Shot name="Clipe 2.8" premountFor={fps} clip="clips/TDO_2.8.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="2.9 · P1 guarda o convite na clutch; lá fora, P3 segur" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 2.9" premountFor={fps} clip="clips/TDO_2.9.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="3.1 · P1 entra no carro; P3 fecha a porta" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 3.1" premountFor={fps} clip="clips/TDO_3.1.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="3.2 · Carro percorre avenida com postes dourados; luze" durationInFrames={96} premountFor={fps}>
          <Shot name="Clipe 3.2" premountFor={fps} clip="clips/TDO_3.2.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="3.3 · Carro faz a curva; o farol aponta para a lente" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 3.3" premountFor={fps} clip="clips/TDO_3.3.mp4" past={true} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="3.4 · Carro estaciona no tapete vermelho do Espaço Woo" durationInFrames={96} premountFor={fps}>
          <Shot name="Clipe 3.4" premountFor={fps} clip="clips/TDO_3.4.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="3.5 · P1 passa entre os postes dourados; saxofonista t" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 3.5" premountFor={fps} clip="clips/TDO_3.5.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="3.6 · Portas de vidro se abrem e a luz dourada a envol" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 3.6" premountFor={fps} clip="clips/TDO_3.6.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="3.7 · Salão principal: lustres de cristal, pista com g" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 3.7" premountFor={fps} clip="clips/TDO_3.7.mp4" past={false} verticalPan={true} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="3.8 · Os dois pavimentos, mesas com plumas brancas, co" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 3.8" premountFor={fps} clip="clips/TDO_3.8.mp4" past={false} verticalPan={true} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.1 · P1 caminha no tapete azul até o painel instagram" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 4.1" premountFor={fps} clip="clips/TDO_4.1.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.2 · P1 e P4 posam e riem; o flash dispara" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 4.2" premountFor={fps} clip="clips/TDO_4.2.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.3 · P7 pousa o copo no balcão de mármore; foco revel" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 4.3" premountFor={fps} clip="clips/TDO_4.3.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.4 · Mão coloca a miniatura e o charuto de chocolate " durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 4.4" premountFor={fps} clip="clips/TDO_4.4.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.5 · P7 agita a coqueteleira, gelo cai em câmera lent" durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 4.5" premountFor={fps} clip="clips/TDO_4.5.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.6 · P7 entrega uma taça coupe a P1, que agradece com" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 4.6" premountFor={fps} clip="clips/TDO_4.6.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.7 · Luzes baixam; spot no palco; P5 abre um envelope" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 4.7" premountFor={fps} clip="clips/TDO_4.7.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.8 · Troféu revelado, reflexos âmbar no aço, bobinas " durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 4.8" premountFor={fps} clip="clips/TDO_4.8.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.9 · P5 entrega o troféu a um homenageado de costas; " durationInFrames={72} premountFor={fps}>
          <Shot name="Clipe 4.9" premountFor={fps} clip="clips/TDO_4.9.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.10 · P5 vira o voucher para a plateia" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 4.10" premountFor={fps} clip="clips/TDO_4.10.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="4.11 · Convidada (não P1) leva as mãos à boca; amigos a" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 4.11" premountFor={fps} clip="clips/TDO_4.11.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="5.1 · Salão cheio; as luzes apagam de trás para frente" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 5.1" premountFor={fps} clip="clips/TDO_5.1.mp4" past={false} verticalPan={true} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="5.2 · Batida grave; spot acende a cortina de veludo; s" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 5.2" premountFor={fps} clip="clips/TDO_5.2.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="5.3 · Microfone vintage em primeiro plano; guitarra, b" durationInFrames={96} premountFor={fps}>
          <Shot name="Clipe 5.3" premountFor={fps} clip="clips/TDO_5.3.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="5.4 · Contagem; a fresta da cortina começa a abrir" durationInFrames={48} premountFor={fps}>
          <Shot name="Clipe 5.4" premountFor={fps} clip="clips/TDO_5.4.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="5.5 · Silhueta do vocalista com microfone, banda ao fu" durationInFrames={36} premountFor={fps}>
          <Shot name="Clipe 5.5" premountFor={fps} clip="clips/TDO_5.5.mp4" past={false} verticalPan={false} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="5.6 · Três frases (tipografia animada)" durationInFrames={108} premountFor={fps}>
          <TitleCard name="Cartela 1" from={0} durationInFrames={38} premountFor={fps}>
            E QUANDO VOCÊ ACHAR QUE A NOITE NÃO PODE FICAR MELHOR…
          </TitleCard>
          <TitleCard name="Cartela 2" from={38} durationInFrames={34} premountFor={fps}>
            O MELHOR AINDA ESTARÁ POR VIR.
          </TitleCard>
          <TitleCard name="Cartela 3" from={72} durationInFrames={36} premountFor={fps}>
            UMA ATRAÇÃO SURPRESA ESPERA POR VOCÊ.
          </TitleCard>
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="6.1 · Moldura Art Déco se desenha em linhas douradas; " durationInFrames={168} premountFor={fps}>
          <Signature name="Assinatura" premountFor={fps} logo={logo} dateLine="11 DE DEZEMBRO · 19H" placeLine="ESPAÇO WOOD — SÃO PAULO" />
        </TransitionSeries.Sequence>
        <TransitionSeries.Sequence name="6.2 · Projetor desacelera e para" durationInFrames={24} premountFor={fps}>
          <AbsoluteFill style={{ backgroundColor: BLACK }} />
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* Transições motivadas (p. 21) */}
      <LightOverlay name="1.1→1.2 fade-in com flicker" from={72} durationInFrames={12} premountFor={fps} mode="flicker-in" />
      <LightOverlay name="2.7→2.8 leque cobre a lente" from={884} durationInFrames={4} premountFor={fps} mode="fan" />
      <LightOverlay name="3.3→3.4 flare para branco" from={1268} durationInFrames={8} premountFor={fps} mode="flare" />
      <LightOverlay name="3.6→3.7 estouro de luz" from={1482} durationInFrames={6} premountFor={fps} mode="burst" />
      <LightOverlay name="4.2→4.3 flash fotográfico" from={1750} durationInFrames={2} premountFor={fps} mode="flash" />
      <LightOverlay name="5.4→5.5 luz explode" from={2538} durationInFrames={6} premountFor={fps} mode="burst" />

      {/* Trilha e efeitos (guias — trocar pelos arquivos licenciados) */}
      <Audio name="Trilha" src={staticFile("audio/trilha.wav")} premountFor={fps} />
      <Audio name="Efeitos" src={staticFile("audio/sfx.wav")} premountFor={fps} />

      {/* Narração — uma faixa por fala (trocar pelas tomadas gravadas) */}
      <Audio name="vo01 · Há momentos / que passam pelo TEMPO... /" src={staticFile("audio/vo/vo01.wav")} from={96} premountFor={fps} />
      <Audio name="vo02 · E há momentos / que se tornam ETERNOS." src={staticFile("audio/vo/vo02.wav")} from={228} premountFor={fps} />
      <Audio name="vo03 · Este ano, / a história nos reserva / um " src={staticFile("audio/vo/vo03.wav")} from={492} premountFor={fps} />
      <Audio name="vo04 · Cada detalhe foi pensado / para transfor" src={staticFile("audio/vo/vo04.wav")} from={876} premountFor={fps} />
      <Audio name="vo05 · Uma noite em que o PASSADO / encontra o " src={staticFile("audio/vo/vo05.wav")} from={1464} premountFor={fps} />
      <Audio name="vo06 · E cada conquista / merece ser CELEBRADA." src={staticFile("audio/vo/vo06.wav")} from={1548} premountFor={fps} />
      <Audio name="vo07 · Porque grandes histórias / são construíd" src={staticFile("audio/vo/vo07.wav")} from={2088} premountFor={fps} />
      <Audio name="vo08 · Três... / dois... / um..." src={staticFile("audio/vo/vo08.wav")} from={2496} premountFor={fps} />
      <Audio name="vo09a · Presença. / Tempos de Ouro." src={staticFile("audio/vo/vo09a.wav")} from={2695} premountFor={fps} />
      <Audio name="vo09b · Algumas noites não foram feitas para ser" src={staticFile("audio/vo/vo09b.wav")} from={2755} premountFor={fps} />

      {showHud ? <Hud /> : null}
    </AbsoluteFill>
  );
};
