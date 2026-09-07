import * as React from "react";
import { Button, makeStyles } from "@fluentui/react-components";
import { Catalog, SelectedItem } from "../types/catalog";
import HierarchicalMultiSelect from "./HierarchicalMultiSelect";

const useStyles = makeStyles({
  actions: {
    display: "flex",
    marginTop: "8px",
  },
});

export interface CatalogSectionProps {
  data: Catalog;
  selected: SelectedItem[];
  onChange: (selected: SelectedItem[]) => void;
  searchPlaceholder: string;
  insertLabel: string;
  onInsert: () => void;
  insertDisabled?: boolean;
  ariaLabel: string;
}

const CatalogSection: React.FC<CatalogSectionProps> = (props) => {
  const styles = useStyles();

  return (
    <div>
      <HierarchicalMultiSelect
        data={props.data}
        selected={props.selected}
        onChange={props.onChange}
        searchPlaceholder={props.searchPlaceholder}
        aria-label={props.ariaLabel}
      />
      <div className={styles.actions}>
        <Button appearance="primary" size="small" onClick={props.onInsert} disabled={props.insertDisabled}>
          {props.insertLabel}
        </Button>
      </div>
    </div>
  );
};

export default CatalogSection;
