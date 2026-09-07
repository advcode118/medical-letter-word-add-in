import * as React from "react";
import { useMemo, useState } from "react";
import { Button, Checkbox, Input, makeStyles, tokens } from "@fluentui/react-components";
import { ChevronDownRegular, ChevronRightRegular, SearchRegular } from "@fluentui/react-icons";
import { Catalog, CatalogCategory, SelectedItem } from "../types/catalog";
import {
  filterCatalog,
  getCategoryCheckState,
  setCategorySelection,
  toggleSelectedItem,
} from "../utils/catalog";
import SelectedChips from "./SelectedChips";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  tree: {
    maxHeight: "240px",
    overflowY: "auto",
    padding: "4px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  categoryRow: {
    display: "flex",
    alignItems: "center",
    gap: "2px",
    minHeight: "28px",
  },
  itemRow: {
    display: "flex",
    alignItems: "center",
    minHeight: "26px",
    paddingLeft: "28px",
  },
  chevron: {
    minWidth: "24px",
    height: "24px",
    padding: "0",
  },
  empty: {
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
    padding: "8px",
  },
});

export interface HierarchicalMultiSelectProps {
  data: Catalog;
  selected: SelectedItem[];
  onChange: (selected: SelectedItem[]) => void;
  searchPlaceholder?: string;
  "aria-label"?: string;
}

const HierarchicalMultiSelect: React.FC<HierarchicalMultiSelectProps> = (props) => {
  const styles = useStyles();
  const [query, setQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const selectedIds = useMemo(
    () => new Set(props.selected.map((item) => item.id)),
    [props.selected]
  );

  const visibleCategories = useMemo(
    () => filterCatalog(props.data, query),
    [props.data, query]
  );

  const searching = query.trim().length > 0;

  const isExpanded = (categoryId: string) => searching || expandedIds.has(categoryId);

  const toggleExpanded = (categoryId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const onCategoryCheck = (category: CatalogCategory, checked: boolean | "mixed") => {
    const select = checked === true;
    props.onChange(setCategorySelection(category, select, props.selected));
  };

  return (
    <div className={styles.root} role="group" aria-label={props["aria-label"] ?? "Item selector"}>
      <SelectedChips
        items={props.selected}
        onRemove={(id) => props.onChange(props.selected.filter((item) => item.id !== id))}
        onClearAll={() => props.onChange([])}
      />
      <Input
        type="search"
        appearance="outline"
        placeholder={props.searchPlaceholder ?? "Search..."}
        value={query}
        onChange={(_event, data) => setQuery(data.value)}
        contentBefore={<SearchRegular />}
        aria-label={props.searchPlaceholder ?? "Search"}
      />
      <div className={styles.tree}>
        {visibleCategories.length === 0 ? (
          <div className={styles.empty}>No matching items</div>
        ) : (
          visibleCategories.map((category) => {
            const expanded = isExpanded(category.id);
            const panelId = `category-panel-${category.id}`;
            const checkState = getCategoryCheckState(category, selectedIds);

            return (
              <div key={category.id}>
                <div className={styles.categoryRow}>
                  <Button
                    className={styles.chevron}
                    appearance="transparent"
                    size="small"
                    icon={expanded ? <ChevronDownRegular /> : <ChevronRightRegular />}
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    aria-label={`${expanded ? "Collapse" : "Expand"} ${category.name}`}
                    onClick={() => toggleExpanded(category.id)}
                  />
                  <Checkbox
                    checked={checkState}
                    label={category.name}
                    onChange={(_event, data) => onCategoryCheck(category, data.checked)}
                  />
                </div>
                {expanded ? (
                  <div id={panelId} role="group" aria-label={category.name}>
                    {category.items.map((item) => (
                      <div key={item.id} className={styles.itemRow}>
                        <Checkbox
                          checked={selectedIds.has(item.id)}
                          label={item.name}
                          onChange={() => props.onChange(toggleSelectedItem(item, props.selected))}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HierarchicalMultiSelect;
