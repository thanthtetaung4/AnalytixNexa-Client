import { useContext } from "react";

import { WorkspaceContext } from "./WorkspaceProvider";

/** The signed-in user's datasets, analyses and the actions that change them. */
const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === null) {
    throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  }
  return context;
};

export default useWorkspace;
