import { Mastra } from "@mastra/core";
import { loafWorkflow } from "./workflows/loaf-workflow";

export const mastra = new Mastra({
  workflows: { loafWorkflow },
});
