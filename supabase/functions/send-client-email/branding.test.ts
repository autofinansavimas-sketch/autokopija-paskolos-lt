import { test, expect } from "bun:test";
import { resolveEmailBrand } from "./branding";

test("AutoKopers selection uses the AutoKopers sender address", () => {
  expect(resolveEmailBrand("autokopers")?.from).toBe("AutoKopers <info@autokopers.lt>");
});
test("existing requests keep the AutoPaskolos sender", () => {
  expect(resolveEmailBrand(undefined)?.from).toBe("AutoPaskolos <info@autopaskolos.lt>");
});
test("an arbitrary sender cannot be provided", () => {
  expect(resolveEmailBrand("attacker@example.com")).toBeNull();
});