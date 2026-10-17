import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

/**
 * GLB loading pipeline for the film's real, high-detail models.
 *
 * Design notes:
 *  - Models are fetched once and cached as raw ArrayBuffers. Parse creates
 *    fresh geometries/materials each time, so the cache survives engine
 *    dispose/rebuild cycles (HMR, StrictMode remounts) without resurrecting
 *    disposed GPU resources.
 *  - DRACO decoding uses a LOCAL decoder served from /public/models/draco —
 *    no third-party CDN dependency at runtime.
 *  - Every failure path resolves to `null`; callers must degrade gracefully
 *    (the procedural world stands on its own without any real model).
 */

const buffers = new Map<string, Promise<ArrayBuffer | null>>();
let draco: DRACOLoader | null = null;

function dracoLoader(): DRACOLoader {
  if (!draco) {
    draco = new DRACOLoader();
    draco.setDecoderPath("/models/draco/");
    draco.preload();
  }
  return draco;
}

function fetchBuffer(url: string): Promise<ArrayBuffer | null> {
  return fetch(url)
    .then((r) => (r.ok ? r.arrayBuffer() : null))
    .catch(() => null);
}

/** Load + parse a GLB. Never throws — resolves null on any failure. */
export function loadGLB(url: string): Promise<GLTF | null> {
  let buf = buffers.get(url);
  if (!buf) {
    buf = fetchBuffer(url);
    buffers.set(url, buf);
  }
  return buf
    .then((data) => {
      if (!data) return null;
      return new Promise<GLTF>((resolve, reject) => {
        new GLTFLoader().setDRACOLoader(dracoLoader()).parse(data, "", resolve, reject);
      }).catch(() => null);
    })
    .catch(() => null);
}

/** Release the decoder machinery (safe to call between engine rebuilds). */
export function disposeGltfPipeline(): void {
  draco?.dispose();
  draco = null;
}
