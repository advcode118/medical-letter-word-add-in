import * as React from "react";
import { Button, makeStyles, Text, tokens } from "@fluentui/react-components";
import { Catalog, CatalogItem } from "../types/catalog";
import OtherField from "./OtherField";

const useStyles = makeStyles({
  category: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginBottom: "12px",
  },
  heading: {
    fontWeight: tokens.fontWeightSemibold,
  },
  buttons: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "4px",
  },
  suggested: {
    marginTop: "12px",
    marginBottom: "12px",
    padding: "8px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  hint: {
    color: tokens.colorNeutralForeground3,
    marginBottom: "6px",
  },
});

export interface StandardTextPanelProps {
  catalog?: Catalog;
  suggested?: CatalogItem[];
  onInsert: (text: string) => void;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
}

const StandardTextPanel: React.FC<StandardTextPanelProps> = (props) => {
  const styles = useStyles();

  return (
    <div>
      {props.suggested && props.suggested.length > 0 ? (
        <div className={styles.suggested}>
          <Text className={styles.heading} size={200}>
            Suggested text
          </Text>
          <Text className={styles.hint} size={200} block>
            Linked to the selected diagnoses. Insert only if you choose to.
          </Text>
          <div className={styles.buttons}>
            {props.suggested.map((item) => (
              <Button
                key={`suggested-${item.id}`}
                appearance="outline"
                size="small"
                onClick={() => item.text && props.onInsert(item.text)}
                disabled={!item.text}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {(props.catalog?.categories ?? []).map((category) => (
        <div key={category.id} className={styles.category}>
          <Text className={styles.heading} size={200}>
            {category.name}
          </Text>
          <div className={styles.buttons}>
            {category.items.map((item) => (
              <Button
                key={item.id}
                appearance="subtle"
                size="small"
                onClick={() => item.text && props.onInsert(item.text)}
                disabled={!item.text}
              >
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      ))}

      {props.onOtherChange ? (
        <>
          <OtherField
            value={props.otherValue ?? ""}
            onChange={props.onOtherChange}
            placeholder="Type a paragraph that is not in the list"
          />
          <div className={styles.buttons}>
            <Button
              appearance="primary"
              size="small"
              onClick={() => props.onInsert((props.otherValue ?? "").trim())}
              disabled={!(props.otherValue ?? "").trim()}
            >
              Insert other text
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default StandardTextPanel;
