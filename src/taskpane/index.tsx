import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

/* global document, Office, module, require, HTMLElement, window */

const title = "Medical Letter";

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

let rendered = false;

function renderApp() {
  if (rendered) {
    return;
  }
  rendered = true;
  root?.render(
    <FluentProvider theme={webLightTheme} style={{ height: "100%" }}>
      <App title={title} />
    </FluentProvider>
  );
}

Office.onReady(() => {
  renderApp();
});

window.setTimeout(() => {
  renderApp();
}, 1500);

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    root?.render(
      <FluentProvider theme={webLightTheme} style={{ height: "100%" }}>
        <NextApp title={title} />
      </FluentProvider>
    );
  });
}
