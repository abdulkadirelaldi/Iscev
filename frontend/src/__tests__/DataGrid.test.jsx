import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import DataGrid from "../components/admin/DataGrid";

const COLUMNS = [
  { key: "name",   header: "Ad"    },
  { key: "status", header: "Durum" },
];

const DATA = [
  { _id: "1", name: "Ürün A", status: "Aktif"  },
  { _id: "2", name: "Ürün B", status: "Pasif"  },
  { _id: "3", name: "Ürün C", status: "Aktif"  },
];

// ─────────────────────────────────────────────────────────────────────────────
describe("DataGrid — temel render", () => {
  test("TC-DG-01 | Sütun başlıkları görünmeli", () => {
    render(<DataGrid columns={COLUMNS} data={DATA} />);
    expect(screen.getByText("Ad")).toBeInTheDocument();
    expect(screen.getByText("Durum")).toBeInTheDocument();
  });

  test("TC-DG-02 | Tüm satır verileri render edilmeli", () => {
    render(<DataGrid columns={COLUMNS} data={DATA} />);
    expect(screen.getByText("Ürün A")).toBeInTheDocument();
    expect(screen.getByText("Ürün B")).toBeInTheDocument();
    expect(screen.getByText("Ürün C")).toBeInTheDocument();
  });

  test("TC-DG-03 | Yükleniyor skeleton gösterilmeli", () => {
    const { container } = render(<DataGrid columns={COLUMNS} data={[]} isLoading={true} />);
    const pulseEls = container.querySelectorAll(".animate-pulse");
    expect(pulseEls.length).toBeGreaterThan(0);
  });

  test("TC-DG-04 | Boş veri empty state göstermeli", () => {
    render(<DataGrid columns={COLUMNS} data={[]} emptyText="Kayıt bulunamadı" />);
    expect(screen.getByText("Kayıt bulunamadı")).toBeInTheDocument();
  });

  test("TC-DG-05 | render fonksiyonlu sütun çalışmalı", () => {
    const cols = [...COLUMNS, {
      key: "action",
      header: "İşlem",
      render: (row) => <button>{`Düzenle-${row._id}`}</button>,
    }];
    render(<DataGrid columns={cols} data={DATA} />);
    expect(screen.getByText("Düzenle-1")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe("DataGrid — selectable mod", () => {
  test("TC-DG-06 | Checkbox sütunu eklenmeli", () => {
    render(
      <DataGrid
        columns={COLUMNS} data={DATA}
        selectable selected={[]} onSelectRow={vi.fn()} onSelectAll={vi.fn()}
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    // Başlık checkbox'ı + 3 satır = 4
    expect(checkboxes).toHaveLength(4);
  });

  test("TC-DG-07 | Satır checkbox'ına tıklamak onSelectRow çağırmalı", () => {
    const onSelectRow = vi.fn();
    render(
      <DataGrid
        columns={COLUMNS} data={DATA}
        selectable selected={[]} onSelectRow={onSelectRow} onSelectAll={vi.fn()}
      />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]); // ilk satır checkboxu (index 0 = header)
    expect(onSelectRow).toHaveBeenCalledWith("1", true);
  });

  test("TC-DG-08 | Tümünü seç — onSelectAll tüm ID'lerle çağırılmalı", () => {
    const onSelectAll = vi.fn();
    render(
      <DataGrid
        columns={COLUMNS} data={DATA}
        selectable selected={[]} onSelectRow={vi.fn()} onSelectAll={onSelectAll}
      />
    );
    const headerCheckbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(headerCheckbox);
    expect(onSelectAll).toHaveBeenCalledWith(["1", "2", "3"]);
  });

  test("TC-DG-09 | Tümü seçiliyken tıklamak boş dizi ile çağırmalı", () => {
    const onSelectAll = vi.fn();
    render(
      <DataGrid
        columns={COLUMNS} data={DATA}
        selectable selected={["1", "2", "3"]} onSelectRow={vi.fn()} onSelectAll={onSelectAll}
      />
    );
    const headerCheckbox = screen.getAllByRole("checkbox")[0];
    fireEvent.click(headerCheckbox);
    expect(onSelectAll).toHaveBeenCalledWith([]);
  });

  test("TC-DG-10 | Seçili satır farklı arka plan rengine sahip olmalı", () => {
    const { container } = render(
      <DataGrid
        columns={COLUMNS} data={DATA}
        selectable selected={["1"]} onSelectRow={vi.fn()} onSelectAll={vi.fn()}
      />
    );
    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0].style.background).toBeTruthy();
    expect(rows[1].style.background).toBe("");
  });

  test("TC-DG-11 | rowKey fonksiyon olarak geçilmeli", () => {
    const onSelectRow = vi.fn();
    render(
      <DataGrid
        columns={COLUMNS}
        data={DATA}
        rowKey={(row) => row._id}
        selectable selected={[]}
        onSelectRow={onSelectRow} onSelectAll={vi.fn()}
      />
    );
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    expect(onSelectRow).toHaveBeenCalledWith("1", true);
  });
});
