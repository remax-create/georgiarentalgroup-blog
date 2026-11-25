// Serves Georgia Rental Group PDFs stored in Buildium so they OPEN in the browser.
// /docs/<name>.pdf            -> opens in a browser tab (View)
// /docs/<name>.pdf?download=1 -> saves the file (Download)
// To add a document: upload it to Buildium (public), copy its fileId, add a line below.
const DOCS: Record<string, { id: number; file: string }> = {
  "owners-manual": { id: 7067824, file: "Georgia-Rental-Group-Owners-Manual-2026.pdf" },
  "sample-rent-analysis": { id: 7203898, file: "Georgia-Rental-Group-Sample-Rent-Analysis.pdf" },
  "pre-application-checklist": { id: 4825362, file: "Georgia-Rental-Group-Pre-Application-Checklist.pdf" },
  "move-in-checklist": { id: 7068714, file: "Georgia-Rental-Group-Move-In-Checklist.pdf" },
  "move-out-checklist": { id: 7069524, file: "Georgia-Rental-Group-Move-Out-Checklist.pdf" },
};

export default async (req: Request) => {
  const url = new URL(req.url);
  const slug = url.pathname.replace(/^\/docs\//, "").replace(/\.pdf$/i, "").replace(/\/$/, "");
  // Any other public Buildium file: /docs/file/<fileId>.pdf (used by cards the site adds automatically)
  const m = slug.match(/^file\/(\d{4,10})$/);
  const doc = DOCS[slug] || (m ? { id: Number(m[1]), file: `Georgia-Rental-Group-${m[1]}.pdf` } : undefined);
  if (!doc) return new Response("Document not found", { status: 404 });
  const src = await fetch(
    `https://georgiarentalgroup2.managebuilding.com/Resident/api/public/files/download?fileId=${doc.id}`,
  );
  if (!src.ok || !src.body) return new Response("Document is temporarily unavailable", { status: 502 });
  const dl = url.searchParams.has("download");
  const type = src.headers.get("content-type") || "application/pdf";
  if (m && !/pdf/i.test(type)) return new Response("Not a PDF", { status: 404 });
  return new Response(src.body, {
    headers: {
      "content-type": type,
      "content-disposition": `${dl ? "attachment" : "inline"}; filename="${doc.file}"`,
      "cache-control": "public, max-age=300",
      "netlify-cdn-cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
};

export const config = { path: "/docs/*" };
