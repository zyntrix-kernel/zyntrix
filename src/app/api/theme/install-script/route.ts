import { NextRequest, NextResponse } from "next/server";
import { installScript } from "@/lib/m3/kde";
import { normalizeHex, type M3Mode } from "@/lib/m3/theme";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const source = normalizeHex(sp.get("source") ?? "");
  const mode: M3Mode = sp.get("mode") === "light" ? "light" : "dark";

  const content = installScript(source, mode);
  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/x-shellscript; charset=utf-8",
      "Content-Disposition": 'attachment; filename="install.sh"',
      "Cache-Control": "no-store",
    },
  });
}
