import { describe, expect, it } from "vitest";
import { createLanternCsv } from "@/lib/lantern-export";

describe("moderation CSV export", () => {
  it("exports all statuses with emails, quotes, Burmese text and formula protection", () => {
    const csv = createLanternCsv([
      {
        id: "one",
        name: "=formula",
        email: "aye@coca-cola.com.mm",
        officeLocation: "HB",
        message: 'ပျော်ရွှင်ပါစေ, "friends"\nTogether',
        status: "pending",
        createdAt: "2026-11-10T00:00:00Z",
      },
    ]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain(
      '"Employee Name","Email","Plant","Message","Status","Created On"',
    );
    expect(csv).toContain('"\'=formula"');
    expect(csv).toContain('"ပျော်ရွှင်ပါစေ, ""friends""\nTogether"');
    expect(csv).toContain('"pending"');
    expect(csv).toContain("aye@coca-cola.com.mm");
  });
});
