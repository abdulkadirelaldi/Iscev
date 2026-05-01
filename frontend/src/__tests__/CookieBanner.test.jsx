import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CookieBanner from "../components/common/CookieBanner";

const STORAGE_KEY = "iscev_cookie_consent";

const renderBanner = () =>
  render(
    <MemoryRouter>
      <CookieBanner />
    </MemoryRouter>
  );

// ─────────────────────────────────────────────────────────────────────────────
describe("CookieBanner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("TC-CB-01 | localStorage boşken banner görünmeli", async () => {
    renderBanner();
    // useEffect sonrası visible=true bekliyoruz
    await waitFor(() =>
      expect(screen.getByText("Çerezler ve Kişisel Veriler")).toBeInTheDocument()
    );
  });

  test("TC-CB-02 | localStorage 'accepted' ise banner görünmemeli", () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    renderBanner();
    expect(screen.queryByText("Çerezler ve Kişisel Veriler")).not.toBeInTheDocument();
  });

  test("TC-CB-03 | localStorage 'declined' ise banner görünmemeli", () => {
    localStorage.setItem(STORAGE_KEY, "declined");
    renderBanner();
    expect(screen.queryByText("Çerezler ve Kişisel Veriler")).not.toBeInTheDocument();
  });

  test("TC-CB-04 | Kabul Et butonu localStorage'a 'accepted' yazmalı", async () => {
    renderBanner();
    await waitFor(() => screen.getByRole("button", { name: "Kabul Et" }));
    fireEvent.click(screen.getByRole("button", { name: "Kabul Et" }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("accepted");
  });

  test("TC-CB-05 | Reddet butonu localStorage'a 'declined' yazmalı", async () => {
    renderBanner();
    await waitFor(() => screen.getByRole("button", { name: "Reddet" }));
    fireEvent.click(screen.getByRole("button", { name: "Reddet" }));
    expect(localStorage.getItem(STORAGE_KEY)).toBe("declined");
  });

  test("TC-CB-06 | Kabul Et — banner kapanmalı", async () => {
    renderBanner();
    await waitFor(() => screen.getByRole("button", { name: "Kabul Et" }));
    fireEvent.click(screen.getByRole("button", { name: "Kabul Et" }));
    await waitFor(() =>
      expect(screen.queryByText("Çerezler ve Kişisel Veriler")).not.toBeInTheDocument()
    );
  });

  test("TC-CB-07 | Reddet — banner kapanmalı", async () => {
    renderBanner();
    await waitFor(() => screen.getByRole("button", { name: "Reddet" }));
    fireEvent.click(screen.getByRole("button", { name: "Reddet" }));
    await waitFor(() =>
      expect(screen.queryByText("Çerezler ve Kişisel Veriler")).not.toBeInTheDocument()
    );
  });

  test("TC-CB-08 | KVKK bağlantısı render edilmeli", async () => {
    renderBanner();
    await waitFor(() => screen.getByRole("link", { name: "KVKK Aydınlatma Metnimizi" }));
    const link = screen.getByRole("link", { name: "KVKK Aydınlatma Metnimizi" });
    expect(link).toHaveAttribute("href", "/kvkk");
  });
});
