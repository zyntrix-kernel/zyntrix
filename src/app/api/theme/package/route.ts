import { NextRequest, NextResponse } from "next/server";
import { buildThemePackage } from "@/lib/m3/kde";
import { normalizeHex, type M3Mode } from "@/lib/m3/theme";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const source = normalizeHex(sp.get("source") ?? "");
  const mode: M3Mode = sp.get("mode") === "light" ? "light" : "dark";

  try {
    const buf = await buildThemePackage(source, mode);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="m3-kubuntu-${source.slice(1)}-${mode}.tar.gz"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("package build failed", err);
    return NextResponse.json(
      { error: "Failed to build theme package" },
      { status: 500 }
    );
  }
}
