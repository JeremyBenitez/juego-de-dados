const STOCK_STORAGE_KEY = "tio_ammi_stock_v1";
const PREMIO_UNICO = "TIO AMMI";
const STOCK_INICIAL = 5;

export function obtenerStock(): Record<string, number> {
  const saved = localStorage.getItem(STOCK_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Record<string, number>;
      if (typeof parsed[PREMIO_UNICO] === "number") {
        return { [PREMIO_UNICO]: Math.max(0, parsed[PREMIO_UNICO]) };
      }
    } catch {
      // Si el almacenamiento está corrupto, se reinicia abajo
    }
  }
  const initial = { [PREMIO_UNICO]: STOCK_INICIAL };
  localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function obtenerPremioDisponible(): string | null {
  const stock = obtenerStock();
  return stock[PREMIO_UNICO] > 0 ? PREMIO_UNICO : null;
}

export function descontarPremio(nombrePremio = PREMIO_UNICO): boolean {
  const stock = obtenerStock();
  const key = nombrePremio in stock ? nombrePremio : PREMIO_UNICO;
  if ((stock[key] ?? 0) <= 0) return false;

  const updated = { [PREMIO_UNICO]: stock[key] - 1 };
  localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(updated));
  return true;
}

export function reiniciarStockEvento(): void {
  localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify({ [PREMIO_UNICO]: STOCK_INICIAL }));
}