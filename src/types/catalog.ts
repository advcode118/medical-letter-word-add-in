export interface CatalogItem {
  id: string;
  name: string;
  /** Optional IDs of entries in standardText.json. Not inserted automatically. */
  standardText?: string[];
  /** Paragraph body used by standard-text items. */
  text?: string;
}

export interface CatalogCategory {
  id: string;
  name: string;
  items: CatalogItem[];
}

export interface Catalog {
  categories: CatalogCategory[];
}

export interface SelectedItem {
  id: string;
  name: string;
}
