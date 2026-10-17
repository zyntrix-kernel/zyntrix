"use client";

import { useEffect, useRef } from "react";
import { FilmEngine, webglAvailable } from "@/lib/cinema/engine";
import type { M3Mode } from "@/lib/m3/theme";

/**
 * Client-only mount for the persistent WebGL canvas. Owns no layout — the
 * canvas is a fixed backdrop; the film's scroll track and overlays live in
 * FilmSection. All hot-path values flow through refs; React renders only on
 * capability changes.
 */

export interface FilmCanvasProps {
  source: string;
  mode: M3Mode;
  progressRef: React.MutableRefObject<number>;
  reducedMotion: boolean;
  onEngine: (engine: FilmEngine | null) => void;
  onUnavailable: () => void;
  onChapter: (chapter: number) => void;
}

export default function FilmCanvas({
  source,
  mode,
  progressRef,
  reducedMotion,
  onEngine,
  onUnavailable,
  onChapter,
}: FilmCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FilmEngine | null>(null);

  /* mount once — one renderer for the whole journey */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion) return;
    if (!webglAvailable()) {
      onUnavailable();
      return;
    }
    let engine: FilmEngine | null = null;
    try {
      engine = new FilmEngine(canvas, {
        source,
        mode,
        reducedMotion,
        onChapter,
      });
    } catch {
      onUnavailable();
      return;
    }
    engine.setProgress(progressRef.current);
    engine.start();
    engineRef.current = engine;
    /* debug/verification handle (harmless in prod) */
    (window as unknown as { __film: FilmEngine }).__film = engine;
    onEngine(engine);
    return () => {
      onEngine(null);
      engineRef.current = null;
      engine?.dispose();
    };
  }, []);

  /* theme sync */
  useEffect(() => {
    engineRef.current?.setTheme(source, mode);
  }, [source, mode]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-0 h-full w-full"
    />
  );
}
