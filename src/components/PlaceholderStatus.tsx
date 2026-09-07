import * as React from "react";
import { makeStyles, Text, tokens } from "@fluentui/react-components";
import { PlaceholderDetection } from "../word/documentService";

const useStyles = makeStyles({
  list: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginTop: "8px",
  },
  found: {
    color: tokens.colorPaletteGreenForeground1,
  },
  missing: {
    color: tokens.colorPaletteYellowForeground1,
  },
});

export interface PlaceholderStatusProps {
  detections: PlaceholderDetection[] | null;
}

const PlaceholderStatus: React.FC<PlaceholderStatusProps> = (props) => {
  const styles = useStyles();

  if (!props.detections) {
    return null;
  }

  return (
    <div className={styles.list} aria-live="polite">
      {props.detections.map((item) =>
        item.found ? (
          <Text key={item.token} className={styles.found} size={200}>
            Found {item.token}
            {item.count > 1 ? ` (${item.count})` : ""}
          </Text>
        ) : (
          <Text key={item.token} className={styles.missing} size={200}>
            {item.token} not found in document
          </Text>
        )
      )}
    </div>
  );
};

export default PlaceholderStatus;
