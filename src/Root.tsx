import React from "react";
import { Composition } from "remotion";
import { PhilosophyReel } from "./PhilosophyReel";
import { defaultProps, type PhilosophyReelProps } from "./types/types";

export const Root: React.FC = () => {
  return (
    <Composition<any, PhilosophyReelProps>
      id="PhilosophyReel"
      component={PhilosophyReel}
      durationInFrames={450}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
  );
};
