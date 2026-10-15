import ZAI from "z-ai-web-dev-sdk";
import fs from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "public", "wallpapers");

const WALLPAPERS: { file: string; prompt: string }[] = [
  {
    file: "m3-wallpaper-light.png",
    prompt:
      "Abstract Material You wallpaper, Google Material 3 style, soft warm ivory cream background with large smooth organic rounded blob shapes in muted lavender purple, dusty sage green and warm peach tones, subtle paper grain texture, gentle soft gradients, minimalist flat aesthetic, very calm and clean, no text, no logos",
  },
  {
    file: "m3-wallpaper-dark.png",
    prompt:
      "Abstract Material You wallpaper, Google Material 3 dark mode style, deep charcoal near-black background with large smooth organic rounded blob shapes in muted deep lavender, dark plum purple and dark olive green tones, subtle grain texture, gentle moody gradients, minimalist flat aesthetic, clean and calm, no text, no logos",
  },
  {
    file: "m3-wallpaper-bloom.png",
    prompt:
      "Abstract Material 3 dynamic color wallpaper, flowing smooth gradient waves and rounded blobs of violet purple, dusty rose pink and soft amber peach melting together on a soft off-white background, Material You aesthetic, soft shadows, ultra minimalist, smooth matte finish, no text, no logos",
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const zai = await ZAI.create();
  const failed: string[] = [];

  // Sequential + long backoff to respect the image API rate limit
  for (const { file, prompt } of WALLPAPERS) {
    if (fs.existsSync(path.join(OUT_DIR, file))) {
      console.log(`SKIP ${file} (already exists)`);
      continue;
    }
    let ok = false;
    for (let attempt = 1; attempt <= 6 && !ok; attempt++) {
      try {
        const res = await zai.images.generations.create({
          prompt,
          size: "1344x768",
        });
        const b64 = res.data[0]?.base64;
        if (!b64) throw new Error("empty base64");
        fs.writeFileSync(path.join(OUT_DIR, file), Buffer.from(b64, "base64"));
        console.log(`OK ${file} (${fs.statSync(path.join(OUT_DIR, file)).size} bytes)`);
        ok = true;
      } catch (err) {
        console.error(`attempt ${attempt} failed for ${file}:`, (err as Error).message);
        if (attempt < 6) await new Promise((r) => setTimeout(r, 45000 * attempt));
      }
    }
    if (!ok) failed.push(file);
  }

  if (failed.length > 0) {
    console.error("FAILED:", failed.join(", "));
    process.exit(1);
  }
  console.log("ALL_WALLPAPERS_DONE");
}

main();
