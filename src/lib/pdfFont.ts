import type jsPDF from "jspdf";

// Loads DejaVuSans (full Lithuanian diacritics support) once and registers
// it with every jsPDF instance. jsPDF's default Helvetica uses WinAnsi which
// breaks ą, č, ę, ė, į, š, ų, ū, ž — switching to a TTF Unicode font fixes it.

let regularB64: string | null = null;
let boldB64: string | null = null;
let loading: Promise<void> | null = null;

const REGULAR_URL =
  "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans.ttf";
const BOLD_URL =
  "https://cdn.jsdelivr.net/npm/dejavu-fonts-ttf@2.37.3/ttf/DejaVuSans-Bold.ttf";

async function fetchAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Nepavyko užkrauti šrifto: ${url}`);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + chunk)) as unknown as number[]
    );
  }
  return btoa(bin);
}

async function load() {
  if (regularB64 && boldB64) return;
  if (!loading) {
    loading = (async () => {
      const [r, b] = await Promise.all([
        fetchAsBase64(REGULAR_URL),
        fetchAsBase64(BOLD_URL),
      ]);
      regularB64 = r;
      boldB64 = b;
    })();
  }
  await loading;
}

export const PDF_FONT = "DejaVuSans";

export async function applyLtFont(doc: jsPDF): Promise<void> {
  await load();
  doc.addFileToVFS("DejaVuSans.ttf", regularB64!);
  doc.addFont("DejaVuSans.ttf", PDF_FONT, "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", boldB64!);
  doc.addFont("DejaVuSans-Bold.ttf", PDF_FONT, "bold");
  doc.setFont(PDF_FONT, "normal");
}
