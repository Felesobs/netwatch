import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { UsageRing } from "@/components/ui/usage-ring";

describe("UsageRing", () => {
  it("renders an accessible label with the rounded percentage", () => {
    render(<UsageRing percent={67.4} />);
    expect(screen.getByRole("img", { name: "67% of monthly quota used" })).toBeInTheDocument();
  });

  it("clamps the visual progress at 100% without erroring above that", () => {
    render(<UsageRing percent={140} />);
    expect(screen.getByRole("img", { name: "140% of monthly quota used" })).toBeInTheDocument();
  });

  it("renders children inside the ring", () => {
    render(
      <UsageRing percent={50}>
        <span>50%</span>
      </UsageRing>,
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
