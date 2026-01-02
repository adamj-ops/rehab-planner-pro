import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges and de-dupes tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("handles conditional classes", () => {
    expect(cn("text-sm", false && "hidden", "text-sm")).toBe("text-sm");
  });
});

