import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { createApprovedLanternWorkbook } from "@/lib/lantern-export";
import type { Lantern } from "@/lib/lanterns";

describe("approved wish Excel export", () => {
  it("exports approved submitters with requested columns and excludes other statuses", () => {
    const records: Lantern[] = [
      {
        id: "approved",
        name: "Aye Aye",
        employeeId: "EMP-1024",
        message: "ပျော်ရွှင်ပါစေ",
        officeLocation: "CDC",
        status: "approved",
        createdAt: "2026-11-10T00:00:00.000Z",
      },
      {
        id: "pending",
        name: "Su Su",
        employeeId: "EMP-2048",
        message: "Pending wish",
        officeLocation: "HTY",
        status: "pending",
        createdAt: "2026-11-10T00:01:00.000Z",
      },
      {
        id: "old-approved",
        name: "Legacy record",
        message: "Older wish",
        officeLocation: "HmweBe",
        status: "approved",
        createdAt: "2026-11-10T00:02:00.000Z",
      },
    ];

    const archive = unzipSync(createApprovedLanternWorkbook(records));
    const worksheet = archive["xl/worksheets/sheet1.xml"];
    if (!worksheet) throw new Error("Approved Wishes worksheet was not created.");
    const xml = strFromU8(worksheet);

    expect(xml).toContain("Name");
    expect(xml).toContain("Employee ID");
    expect(xml).toContain("Office Location");
    expect(xml).toContain("Wish");
    expect(xml).toContain("Aye Aye");
    expect(xml).toContain("EMP-1024");
    expect(xml).toContain("CDC");
    expect(xml).toContain("ပျော်ရွှင်ပါစေ");
    expect(xml).toContain("Legacy record");
    expect(xml).not.toContain("Pending wish");
    expect(xml).not.toContain("EMP-2048");
  });
});
