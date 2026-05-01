import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import BulkActionBar from "../components/admin/BulkActionBar";

const ACTIONS = [
  { label: "Pasife Al",  onClick: vi.fn() },
  { label: "Toplu Sil",  onClick: vi.fn(), danger: true },
];

// ─────────────────────────────────────────────────────────────────────────────
describe("BulkActionBar", () => {
  test("TC-BAB-01 | count > 0 olduğunda görünmeli", () => {
    render(<BulkActionBar count={3} onClear={vi.fn()} actions={ACTIONS} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("öğe seçildi")).toBeInTheDocument();
  });

  test("TC-BAB-02 | count = 0 olduğunda render edilmemeli", () => {
    render(<BulkActionBar count={0} onClear={vi.fn()} actions={ACTIONS} />);
    expect(screen.queryByText("öğe seçildi")).not.toBeInTheDocument();
  });

  test("TC-BAB-03 | Aksiyon butonları listelenmeli", () => {
    render(<BulkActionBar count={2} onClear={vi.fn()} actions={ACTIONS} />);
    expect(screen.getByText("Pasife Al")).toBeInTheDocument();
    expect(screen.getByText("Toplu Sil")).toBeInTheDocument();
  });

  test("TC-BAB-04 | Aksiyon butonuna tıklamak onClick çağırmalı", () => {
    const onClick = vi.fn();
    render(
      <BulkActionBar count={1} onClear={vi.fn()}
        actions={[{ label: "Test Aksiyon", onClick }]} />
    );
    fireEvent.click(screen.getByText("Test Aksiyon"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("TC-BAB-05 | Danger aksiyon kırmızı renk almalı", () => {
    render(<BulkActionBar count={1} onClear={vi.fn()} actions={ACTIONS} />);
    const dangerBtn = screen.getByText("Toplu Sil");
    expect(dangerBtn.style.background).toBe("rgb(220, 38, 38)");
  });

  test("TC-BAB-06 | Normal aksiyon kırmızı renk ALMAMALI", () => {
    render(<BulkActionBar count={1} onClear={vi.fn()} actions={ACTIONS} />);
    const normalBtn = screen.getByText("Pasife Al");
    expect(normalBtn.style.background).not.toBe("rgb(220, 38, 38)");
  });

  test("TC-BAB-07 | Temizle butonuna tıklamak onClear çağırmalı", () => {
    const onClear = vi.fn();
    render(<BulkActionBar count={2} onClear={onClear} actions={ACTIONS} />);
    fireEvent.click(screen.getByTitle("Seçimi temizle"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  test("TC-BAB-08 | Seçili sayı doğru gösterilmeli", () => {
    render(<BulkActionBar count={7} onClear={vi.fn()} actions={[]} />);
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  test("TC-BAB-09 | actions boş dizi — aksiyon butonu olmamalı", () => {
    render(<BulkActionBar count={1} onClear={vi.fn()} actions={[]} />);
    expect(screen.getByText("öğe seçildi")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Sil|Pasif/i })).not.toBeInTheDocument();
  });
});
