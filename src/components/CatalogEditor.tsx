/* global window */

import * as React from "react";
import { useState } from "react";
import { Button, Field, Input, Textarea, Text, makeStyles, tokens } from "@fluentui/react-components";
import { Catalog, CatalogCategory, CatalogItem } from "../types/catalog";
import { createId } from "../utils/ids";

const useStyles = makeStyles({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  category: {
    padding: "8px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  row: {
    display: "flex",
    gap: "6px",
    alignItems: "flex-end",
  },
  grow: {
    flexGrow: 1,
  },
  item: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    paddingLeft: "4px",
    borderLeft: `2px solid ${tokens.colorNeutralStroke2}`,
  },
});

export interface CatalogEditorProps {
  catalog: Catalog;
  onChange: (catalog: Catalog) => void;
  itemMode: "simple" | "text";
}

const CatalogEditor: React.FC<CatalogEditorProps> = (props) => {
  const styles = useStyles();
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});

  const updateCategories = (categories: CatalogCategory[]) => {
    props.onChange({ categories });
  };

  const addCategory = () => {
    const name = newCategoryName.trim();
    if (!name) {
      return;
    }
    updateCategories([
      ...props.catalog.categories,
      { id: createId("category"), name, items: [] },
    ]);
    setNewCategoryName("");
  };

  const renameCategory = (categoryId: string, name: string) => {
    updateCategories(
      props.catalog.categories.map((category) =>
        category.id === categoryId ? { ...category, name } : category
      )
    );
  };

  const deleteCategory = (categoryId: string) => {
    if (!window.confirm("Delete this group and its items?")) {
      return;
    }
    updateCategories(props.catalog.categories.filter((category) => category.id !== categoryId));
  };

  const addItem = (category: CatalogCategory) => {
    const name = (newItemName[category.id] ?? "").trim();
    if (!name) {
      return;
    }
    const item: CatalogItem = {
      id: createId("item"),
      name,
      ...(props.itemMode === "text" ? { text: "" } : {}),
    };
    updateCategories(
      props.catalog.categories.map((entry) =>
        entry.id === category.id ? { ...entry, items: [...entry.items, item] } : entry
      )
    );
    setNewItemName((current) => ({ ...current, [category.id]: "" }));
  };

  const updateItem = (categoryId: string, itemId: string, patch: Partial<CatalogItem>) => {
    updateCategories(
      props.catalog.categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
            }
          : category
      )
    );
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    updateCategories(
      props.catalog.categories.map((category) =>
        category.id === categoryId
          ? { ...category, items: category.items.filter((item) => item.id !== itemId) }
          : category
      )
    );
  };

  return (
    <div className={styles.stack}>
      <div className={styles.row}>
        <Field className={styles.grow} label="New group">
          <Input
            value={newCategoryName}
            onChange={(_event, data) => setNewCategoryName(data.value)}
            placeholder="e.g. Respiratory"
          />
        </Field>
        <Button appearance="secondary" size="small" onClick={addCategory}>
          Add group
        </Button>
      </div>

      {props.catalog.categories.length === 0 ? (
        <Text size={200}>No groups yet. Add a group, then add items inside it.</Text>
      ) : null}

      {props.catalog.categories.map((category) => (
        <div key={category.id} className={styles.category}>
          <div className={styles.row}>
            <Field className={styles.grow} label="Group name">
              <Input value={category.name} onChange={(_event, data) => renameCategory(category.id, data.value)} />
            </Field>
            <Button appearance="subtle" size="small" onClick={() => deleteCategory(category.id)}>
              Delete group
            </Button>
          </div>

          {category.items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.row}>
                <Field className={styles.grow} label={props.itemMode === "text" ? "Block name" : "Item name"}>
                  <Input
                    value={item.name}
                    onChange={(_event, data) => updateItem(category.id, item.id, { name: data.value })}
                  />
                </Field>
                <Button appearance="subtle" size="small" onClick={() => deleteItem(category.id, item.id)}>
                  Delete
                </Button>
              </div>
              {props.itemMode === "text" ? (
                <Field label="Reusable text">
                  <Textarea
                    value={item.text ?? ""}
                    onChange={(_event, data) => updateItem(category.id, item.id, { text: data.value })}
                    resize="vertical"
                    rows={3}
                  />
                </Field>
              ) : null}
            </div>
          ))}

          <div className={styles.row}>
            <Field className={styles.grow} label={props.itemMode === "text" ? "New text block" : "New item"}>
              <Input
                value={newItemName[category.id] ?? ""}
                onChange={(_event, data) =>
                  setNewItemName((current) => ({ ...current, [category.id]: data.value }))
                }
                placeholder={props.itemMode === "text" ? "e.g. Inhaler advice" : "e.g. Asthma"}
              />
            </Field>
            <Button appearance="secondary" size="small" onClick={() => addItem(category)}>
              Add
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CatalogEditor;
