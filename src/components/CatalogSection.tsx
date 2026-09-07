import * as React from "react";
import { Button, makeStyles } from "@fluentui/react-components";
import { Catalog, SelectedItem } from "../types/catalog";
import HierarchicalMultiSelect from "./HierarchicalMultiSelect";
import OtherField from "./OtherField";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  actions: {
    display: "flex",
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
  otherValue: string;
  onOtherChange: (value: string) => void;
}

const CatalogSection: React.FC<CatalogSectionProps> = (props) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <HierarchicalMultiSelect
        data={props.data}
        selected={props.selected}
        onChange={props.onChange}
        searchPlaceholder={props.searchPlaceholder}
        aria-label={props.ariaLabel}
      />
      <OtherField
        value={props.otherValue}
        onChange={props.onOtherChange}
        placeholder="Type a value that is not in the list"
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
