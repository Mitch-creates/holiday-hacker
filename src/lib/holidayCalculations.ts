/**
 * Re-exports the PTO optimizer engine. Implementation lives in `optimizerEngine.ts`.
 */
export type { StrategyType, BreakKind } from "./optimizerEngine";
export { calculateOptimizedHolidayPeriods } from "./optimizerEngine";
