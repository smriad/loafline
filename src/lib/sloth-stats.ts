import { listLoafs } from "./mongodb";
import { lazyPayoffMinutes } from "./lazy-payoff";
import type { DeferLabel, SlothStats } from "./types";

export async function computeSlothStats(limit = 40): Promise<SlothStats> {
  const items = await listLoafs(limit);
  const byLabel: Record<DeferLabel, number> = { loaf: 0, this_week: 0, today: 0 };
  let minutesSavedTotal = 0;

  for (const item of items) {
    byLabel[item.verdict.label] += 1;
    minutesSavedTotal += item.lazyPayoffMinutes ?? lazyPayoffMinutes(item);
  }

  const total = items.length;
  const loafRate = total ? byLabel.loaf / total : 0;

  return { total, byLabel, minutesSavedTotal, loafRate };
}
