import type { Lantern } from "@/lib/lanterns";

function csvCell(value: string) {
  const safe = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function createLanternCsv(lanterns: Lantern[]) {
  const rows = [
    ["Employee Name", "Email", "Plant", "Message", "Status", "Created On"],
    ...lanterns.map((wish) => [
      wish.name,
      wish.email ?? "",
      wish.officeLocation,
      wish.message,
      wish.status,
      wish.createdAt,
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadLanternCsv(lanterns: Lantern[]) {
  const url = URL.createObjectURL(
    new Blob([createLanternCsv(lanterns)], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "share-the-light-wishes.csv";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
