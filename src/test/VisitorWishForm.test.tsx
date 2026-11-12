import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { VisitorWishForm } from "@/components/VisitorWishForm";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("Name"), {
    target: { value: "Aye Aye" },
  });
  fireEvent.change(screen.getByLabelText("Employee ID"), {
    target: { value: "EMP-1024" },
  });
  fireEvent.change(screen.getByLabelText("Office Location"), {
    target: { value: "CDC" },
  });
  fireEvent.change(screen.getByLabelText("Your festival wish"), {
    target: { value: "May everyone shine bright tonight" },
  });
}

describe("VisitorWishForm required fields and lantern launch", () => {
  it("requires a name, employee ID, office location, and wish before submitting", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<VisitorWishForm onSubmit={onSubmit} onSuccess={vi.fn()} />);

    const form = document.querySelector("form");
    if (!form) throw new Error("Visitor wish form was not rendered.");
    expect(screen.getByLabelText("Name")).toBeRequired();
    expect(screen.getByLabelText("Employee ID")).toBeRequired();
    expect(screen.getByLabelText("Office Location")).toBeRequired();
    expect(screen.getByLabelText("Your festival wish")).toBeRequired();

    fireEvent.submit(form);

    expect(await screen.findByRole("alert")).toHaveTextContent("Please enter your name.");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits all required details, including the employee ID", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<VisitorWishForm onSubmit={onSubmit} onSuccess={vi.fn()} />);
    fillRequiredFields();

    const form = document.querySelector("form");
    if (!form) throw new Error("Visitor wish form was not rendered.");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Aye Aye",
        employeeId: "EMP-1024",
        officeLocation: "CDC",
        message: "May everyone shine bright tonight",
      });
    });
  });

  it("launches a lantern from the submit button after a successful save", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    render(<VisitorWishForm onSubmit={onSubmit} onSuccess={onSuccess} />);
    fillRequiredFields();
    vi.spyOn(HTMLButtonElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 100,
      y: 200,
      width: 300,
      height: 60,
      top: 200,
      right: 400,
      bottom: 260,
      left: 100,
      toJSON: () => ({}),
    });

    const form = document.querySelector("form");
    if (!form) throw new Error("Visitor wish form was not rendered.");
    fireEvent.submit(form);

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    const lantern = document.body.querySelector(".wish-launch-lantern");
    expect(lantern).toHaveStyle({ left: "250px", top: "230px" });
  });

  it("does not launch a lantern when saving fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Save failed."));
    render(<VisitorWishForm onSubmit={onSubmit} onSuccess={vi.fn()} />);
    fillRequiredFields();

    const form = document.querySelector("form");
    if (!form) throw new Error("Visitor wish form was not rendered.");
    fireEvent.submit(form);

    expect(await screen.findByRole("alert")).toHaveTextContent("Save failed.");
    expect(document.body.querySelector(".wish-launch-lantern")).not.toBeInTheDocument();
  });
});
