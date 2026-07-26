import path from "node:path";
import readXlsxFile from "read-excel-file/node";

import { normalizeBedcaWorkbookRows } from "../src/features/foods/bedca";

const sourcePath = process.argv[2];

if (!sourcePath) {
  throw new Error("Usage: corepack pnpm bedca:inspect <path-to-bedca.xlsx>");
}

async function main() {
  const workbookRows = await readXlsxFile(path.resolve(sourcePath as string));
  const rows = normalizeBedcaWorkbookRows(workbookRows as unknown);
  const headers = rows[0] ?? [];

  console.log(
    JSON.stringify(
      {
        source: sourcePath,
        rows: rows.length,
        columns: headers.length,
        headers,
        preview: rows.slice(1, 6)
      },
      null,
      2
    )
  );
}

void main();
