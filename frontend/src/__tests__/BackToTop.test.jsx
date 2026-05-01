import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import BackToTop from "../components/common/BackToTop";

// ─────────────────────────────────────────────────────────────────────────────
describe("BackToTop", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { writable: true, value: 0 });
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("TC-BT-01 | scrollY < 400 iken buton görünmemeli", () => {
    render(<BackToTop />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  test("TC-BT-02 | scrollY >= 400 iken buton görünmeli", () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, value: 401 });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  test("TC-BT-03 | Butona tıklamak window.scrollTo çağırmalı", () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, value: 500 });
      fireEvent.scroll(window);
    });
    fireEvent.click(screen.getByRole("button"));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  test("TC-BT-04 | Scroll geri 0'a döndüğünde buton gizlenmeli", () => {
    render(<BackToTop />);
    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, value: 500 });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole("button")).toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, "scrollY", { writable: true, value: 0 });
      fireEvent.scroll(window);
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
