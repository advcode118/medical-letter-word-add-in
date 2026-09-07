/* global File */

import { useEffect, useState } from "react";
import { Workspace } from "../types/workspace";
import { createDefaultWorkspace } from "./defaultWorkspace";
import { downloadWorkspace, loadWorkspace, parseWorkspace, saveWorkspace } from "./workspaceStore";

export function useWorkspace() {
  const [workspace, setWorkspace] = useState<Workspace>(loadWorkspace);

  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  const resetDefaults = () => {
    setWorkspace(createDefaultWorkspace());
  };

  const exportLibrary = () => {
    downloadWorkspace(workspace);
  };

  const importLibrary = async (file: File): Promise<string | null> => {
    try {
      const text = await file.text();
      const parsed = parseWorkspace(JSON.parse(text));
      if (!parsed) {
        return "That file is not a valid Medical Letter library.";
      }
      setWorkspace(parsed);
      return null;
    } catch {
      return "Could not read that file.";
    }
  };

  return { workspace, setWorkspace, resetDefaults, exportLibrary, importLibrary };
}
