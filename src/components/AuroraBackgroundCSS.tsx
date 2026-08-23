// src/components/AuroraBackgroundCSS.tsx
//
// Alternativa ao shader WebGL/GLSL de AuroraBackgroundShader.tsx: 4 frames
// reais capturados do próprio shader por tema (public/aurora-static/
// {dark,light}-{0..3}.webp), alternados em crossfade só com CSS —
// compositing de opacity, sem recalcular pixel nenhum por frame.

const FRAME_COUNT = 4;
const CYCLE_SECONDS = 16;
const SLOT_SECONDS = CYCLE_SECONDS / FRAME_COUNT;
// Pico da onda triangular de aurora-crossfade (globals.css) fica em 25% do
// ciclo — usado pra calcular o delay do frame 0, pra ele nascer no pico em
// vez de no meio de uma transição.
const PEAK_FRACTION = 0.25;

function frameDelay(index: number) {
  const seconds = PEAK_FRACTION * CYCLE_SECONDS + index * SLOT_SECONDS;
  return `-${seconds.toFixed(2)}s`;
}

function AuroraFrames({ theme }: { theme: "dark" | "light" }) {
  return (
    <div className={`aurora-static-group aurora-static-group--${theme} absolute inset-0`}>
      {Array.from({ length: FRAME_COUNT }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- fundo decorativo full-bleed, sem dimensões fixas
        <img
          key={i}
          src={`/aurora-static/${theme}-${i}.webp`}
          alt=""
          className="aurora-static-frame absolute inset-0 h-full w-full"
          style={{ ["--frame-delay" as string]: frameDelay(i) }}
        />
      ))}
    </div>
  );
}

export function AuroraBackgroundCSS() {
  return (
    <>
      {/* bg-[--aurora-sky], não bg-bg: durante o crossfade, dois frames
          ficam parcialmente transparentes ao mesmo tempo — compositing de
          opacity em CSS é sequencial (cada camada por cima do resultado da
          de baixo), então no meio da transição a cor deste container
          "vaza" através dos dois frames com ~25% de peso, mesmo a soma das
          opacidades sendo exatamente 1. --bg é quase preto no escuro (perto
          do próprio céu da aurora, imperceptível) mas branco puro no claro
          — vazava como um clareamento nítido. --aurora-sky é a cor real do
          céu por trás da aurora em ambos os temas, então o vazamento passa
          a se misturar com a cena em vez de destoar. */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--aurora-sky)]" aria-hidden="true">
        <AuroraFrames theme="dark" />
        <AuroraFrames theme="light" />
      </div>
      {/* Véu de contraste — mesma classe/regra .aurora-veil de globals.css usada pelo shader. */}
      <div className="aurora-veil pointer-events-none fixed inset-y-0 -z-[9]" aria-hidden="true" />
    </>
  );
}
