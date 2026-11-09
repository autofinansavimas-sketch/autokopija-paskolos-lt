import { expect, test } from "bun:test";
import { canShowExitOffer } from "../src/lib/exitOffer";

const eligible = { top: 0, consent: true, shown: false, dialogOpen: false, finePointer: true };
test("shows when leaving through the top", () => {
  expect(canShowExitOffer(eligible)).toBe(true);
  expect(canShowExitOffer({ ...eligible, top: 30 })).toBe(false);
});
test("never bypasses cookie consent", () => {
  expect(canShowExitOffer({ ...eligible, consent: false })).toBe(false);
});
test("shows once per visit and never over another dialog", () => {
  expect(canShowExitOffer({ ...eligible, shown: true })).toBe(false);
  expect(canShowExitOffer({ ...eligible, dialogOpen: true })).toBe(false);
});
test("does not trigger on touch devices", () => {
  expect(canShowExitOffer({ ...eligible, finePointer: false })).toBe(false);
});