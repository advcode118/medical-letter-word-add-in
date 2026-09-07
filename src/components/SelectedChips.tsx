import * as React from "react";
import { Button, makeStyles, tokens } from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import { SelectedItem } from "../types/catalog";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "8px",
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    alignItems: "center",
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    gap: "2px",
    maxWidth: "100%",
    paddingLeft: "8px",
    paddingRight: "2px",
    minHeight: "24px",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },
  chipLabel: {
    overflowX: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "140px",
  },
  more: {
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase200,
  },
  dismiss: {
    minWidth: "20px",
    height: "20px",
    padding: "0",
  },
});

export interface SelectedChipsProps {
  items: SelectedItem[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
  maxVisible?: number;
}

const SelectedChips: React.FC<SelectedChipsProps> = (props) => {
  const styles = useStyles();
  const maxVisible = props.maxVisible ?? 3;

  if (props.items.length === 0) {
    return null;
  }

  const visible = props.items.slice(0, maxVisible);
  const remaining = props.items.length - visible.length;

  return (
    <div className={styles.root}>
      <div className={styles.row} role="list" aria-label="Selected items">
        {visible.map((item) => (
          <span key={item.id} className={styles.chip} role="listitem">
            <span className={styles.chipLabel}>{item.name}</span>
            <Button
              className={styles.dismiss}
              appearance="transparent"
              size="small"
              icon={<DismissRegular />}
              aria-label={`Remove ${item.name}`}
              onClick={() => props.onRemove(item.id)}
            />
          </span>
        ))}
        {remaining > 0 ? <span className={styles.more}>+{remaining} more</span> : null}
      </div>
      <Button appearance="subtle" size="small" onClick={props.onClearAll}>
        Clear all
      </Button>
    </div>
  );
};

export default SelectedChips;
