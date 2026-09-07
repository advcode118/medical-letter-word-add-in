/* global window, HTMLTextAreaElement */

import * as React from "react";
import { useRef } from "react";
import { Button, Field, Text, Textarea, makeStyles, tokens } from "@fluentui/react-components";
import { Workspace } from "../types/workspace";
import { createDefaultLetterTemplate, listTemplateTokens } from "../word/letterTemplate";

const useStyles = makeStyles({
  stack: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  hint: {
    color: tokens.colorNeutralForeground3,
  },
  tokens: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
  },
  textarea: {
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase200,
    lineHeight: tokens.lineHeightBase200,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
});

export interface TemplateEditorProps {
  workspace: Workspace;
  onChange: (letterTemplate: string) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = (props) => {
  const styles = useStyles();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const tokens = listTemplateTokens(props.workspace);

  const insertToken = (token: string) => {
    const current = props.workspace.letterTemplate;
    const el = textareaRef.current;
    const start = el?.selectionStart ?? current.length;
    const end = el?.selectionEnd ?? current.length;
    const next = `${current.slice(0, start)}${token}${current.slice(end)}`;
    props.onChange(next);
    window.setTimeout(() => {
      if (!el) {
        return;
      }
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const restoreDefault = () => {
    if (
      !window.confirm(
        "Replace your letter template with the default layout for the current sections? Your lists are not changed."
      )
    ) {
      return;
    }
    props.onChange(createDefaultLetterTemplate(props.workspace.sections));
  };

  return (
    <div className={styles.stack}>
      <Field hint="Inserted into a blank Word document. Use **bold** for headings. Blank lines start a new paragraph.">
        <Textarea
          textarea={{ ref: textareaRef, className: styles.textarea }}
          value={props.workspace.letterTemplate}
          onChange={(_event, data) => props.onChange(data.value)}
          resize="vertical"
          rows={16}
        />
      </Field>
      <Text size={200} className={styles.hint}>
        Click a placeholder to insert it at the cursor.
      </Text>
      <div className={styles.tokens}>
        {tokens.map((item) => (
          <Button
            key={item.token}
            appearance="outline"
            size="small"
            title={item.label}
            onClick={() => insertToken(item.token)}
          >
            {item.token}
          </Button>
        ))}
      </div>
      <div className={styles.actions}>
        <Button appearance="subtle" size="small" onClick={restoreDefault}>
          Restore default template
        </Button>
      </div>
    </div>
  );
};

export default TemplateEditor;
