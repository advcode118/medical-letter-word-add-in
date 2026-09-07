export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function toPlaceholder(name: string): string {
  const token = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return `{{${token || "CUSTOM"}}}`;
}

export function emptyCatalog() {
  return { categories: [] };
}
