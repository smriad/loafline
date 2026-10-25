import { Mastra } from "@mastra/core";
import { loafWorkflow } from "./workflows/loaf-workflow";
import { getMastraStorage } from "./storage";

export const mastra = new Mastra({
  workflows: { loafWorkflow },
  storage: getMastraStorage(),
});
