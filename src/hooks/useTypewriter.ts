import { useCurrentFrame, useVideoConfig } from "remotion";

export function useTypewriter(
  text: string,
  speedMs: number = 60,
  startFrame: number = 0,
): { visible: string; isComplete: boolean; endFrame: number } {
  const { fps } = useVideoConfig();

  const charsPerFrame = (1000 / speedMs) / fps;
  const totalFrames = Math.ceil(text.length / charsPerFrame);
  const visibleCount = Math.min(Math.floor(startFrame * charsPerFrame), text.length);

  return {
    visible: text.slice(0, visibleCount),
    isComplete: visibleCount >= text.length,
    endFrame: totalFrames,
  };
}
