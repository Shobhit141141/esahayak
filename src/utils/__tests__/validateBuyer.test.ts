import { leadFormSchema } from "../leadFormSchema";

describe("leadFormSchema validation", () => {
  it("should pass for valid buyer", () => {
    const result = leadFormSchema.safeParse({
      fullName: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      city: "Chandigarh",
      propertyType: "Apartment",
      bhk: "TWO",
      purpose: "Buy",
      budgetMin: 5000000,
      budgetMax: 8000000,
      timeline: "ZERO_TO_THREE_M",
      source: "Website",
      notes: "Nice apartment",
      tags: ["premium", "urgent"],
      status: "New",
    });
    expect(result.success).toBe(true);
  });

  it("should fail for negative budget", () => {
    const result = leadFormSchema.safeParse({
      fullName: "John Doe",
      budgetMin: -1000,
    });
    expect(result.success).toBe(false);
  });
});
