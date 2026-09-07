import { Catalog, CatalogCategory, CatalogItem, SelectedItem } from "../types/catalog";

export function joinSelectedNames(items: SelectedItem[]): string {
  return items.map((item) => item.name).join("; ");
}

export function getCategoryCheckState(
  category: CatalogCategory,
  selectedIds: Set<string>
): boolean | "mixed" {
  if (category.items.length === 0) {
    return false;
  }

  let selectedCount = 0;
  for (const item of category.items) {
    if (selectedIds.has(item.id)) {
      selectedCount += 1;
    }
  }

  if (selectedCount === 0) {
    return false;
  }
  if (selectedCount === category.items.length) {
    return true;
  }
  return "mixed";
}

export function filterCatalog(catalog: Catalog, query: string): CatalogCategory[] {
  const normalised = query.trim().toLowerCase();
  if (!normalised) {
    return catalog.categories;
  }

  return catalog.categories
    .map((category) => {
      const categoryMatches = category.name.toLowerCase().includes(normalised);
      const items = categoryMatches
        ? category.items
        : category.items.filter((item) => item.name.toLowerCase().includes(normalised));
      return { ...category, items };
    })
    .filter((category) => category.items.length > 0);
}

export function findStandardTextItems(catalog: Catalog, ids: string[]): CatalogItem[] {
  if (ids.length === 0) {
    return [];
  }

  const wanted = new Set(ids);
  const found: CatalogItem[] = [];
  const seen = new Set<string>();

  for (const category of catalog.categories) {
    for (const item of category.items) {
      if (wanted.has(item.id) && !seen.has(item.id)) {
        found.push(item);
        seen.add(item.id);
      }
    }
  }

  return found;
}

export function getSuggestedStandardText(
  selected: SelectedItem[],
  diagnosisCatalog: Catalog,
  standardTextCatalog: Catalog
): CatalogItem[] {
  const selectedIds = new Set(selected.map((item) => item.id));
  const linkedIds: string[] = [];

  for (const category of diagnosisCatalog.categories) {
    for (const item of category.items) {
      if (selectedIds.has(item.id) && item.standardText) {
        linkedIds.push(...item.standardText);
      }
    }
  }

  return findStandardTextItems(standardTextCatalog, linkedIds);
}

export function setCategorySelection(
  category: CatalogCategory,
  select: boolean,
  selected: SelectedItem[]
): SelectedItem[] {
  const categoryIds = new Set(category.items.map((item) => item.id));
  const withoutCategory = selected.filter((item) => !categoryIds.has(item.id));
  if (!select) {
    return withoutCategory;
  }

  const additions = category.items.map((item) => ({ id: item.id, name: item.name }));
  return [...withoutCategory, ...additions];
}

export function toggleSelectedItem(item: CatalogItem, selected: SelectedItem[]): SelectedItem[] {
  const exists = selected.some((entry) => entry.id === item.id);
  if (exists) {
    return selected.filter((entry) => entry.id !== item.id);
  }
  return [...selected, { id: item.id, name: item.name }];
}
