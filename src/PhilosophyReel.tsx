import {
  AbsoluteFill,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { useTypewriter } from "./hooks/useTypewriter";
import type { PhilosophyReelProps } from "./types/types";

const FONT = "Georgia, 'Times New Roman', Times, serif";

export const PhilosophyReel: React.FC<PhilosophyReelProps> = ({
  hook,
  punchline,
  imageUrl,
  typewriterSpeedMs = 120,
  typewriterDelayFrames = 45,
}) => {
  const frame = useCurrentFrame();

  const adjusted = frame - typewriterDelayFrames;
  const typewriterActive = adjusted >= 0;

  const { visible, isComplete, endFrame } = useTypewriter(
    hook,
    typewriterSpeedMs,
    typewriterActive ? adjusted : 0,
  );

  const typewriterEnd = (typewriterActive ? endFrame : 0) + 5;
  const punchlineStart = typewriterDelayFrames + typewriterEnd + 15;
  const punchlineDuration = 25;

  const zoom = interpolate(frame, [0, 450], [1, 1.05], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const hookFade = interpolate(
    frame,
    [typewriterDelayFrames - 5, typewriterDelayFrames + 5],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const punchlineOpacity = interpolate(
    frame,
    [punchlineStart, punchlineStart + punchlineDuration],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const punchlineSlide = interpolate(
    frame,
    [punchlineStart, punchlineStart + punchlineDuration],
    [24, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const pulseComplete = typewriterDelayFrames + endFrame + 10;
  const pulseScale = isComplete
    ? 1 + Math.sin((frame - pulseComplete) * 0.06) * 0.015
    : 1;
  const punchlinePulse = isComplete
    ? 1 + Math.sin((frame - pulseComplete) * 0.06 + 1) * 0.012
    : 1;

  const cursorBlink = Math.sin(frame * 0.15) > 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "50%",
            overflow: "hidden",
          }}
        >
          {imageUrl ? (
            <Img
              src={imageUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : null}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.7) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              boxShadow: "inset 0 0 180px rgba(0,0,0,0.8)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 20,
              right: 28,
              fontFamily: FONT,
              fontSize: 12,
              color: "rgba(255,255,255,0.08)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Sigma Philosophy
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "56px 60px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "10%",
              width: "80%",
              height: 1,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          />

          <div
            style={{
              fontFamily: FONT,
              fontSize: 40,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.4,
              textAlign: "center",
              letterSpacing: "0.01em",
              opacity: hookFade,
              transform: `scale(${pulseScale})`,
            }}
          >
            {visible}
            {!isComplete ? (
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: "0.85em",
                  backgroundColor: cursorBlink ? "#c0a060" : "transparent",
                  marginLeft: 3,
                  verticalAlign: "text-bottom",
                  transition: "background-color 0.1s",
                }}
              />
            ) : null}
          </div>

          <div
            style={{
              fontFamily: FONT,
              fontSize: 34,
              fontWeight: 400,
              color: "#c0a060",
              fontStyle: "italic",
              lineHeight: 1.5,
              textAlign: "center",
              marginTop: 32,
              letterSpacing: "0.01em",
              opacity: punchlineOpacity,
              transform: `translateY(${punchlineSlide}px) scale(${punchlinePulse})`,
            }}
          >
            {punchline}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
