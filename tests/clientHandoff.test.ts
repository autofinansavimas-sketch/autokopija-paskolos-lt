import { describe, expect, test } from "bun:test";
import { createClientHandoff } from "../src/lib/clientHandoff";

describe("client handoff", () => {
  test("assigns a callback to Paulina with an audit comment", () => {
    const result = createClientHandoff("Paulina");
    expect(result.patch.assigned_to).toBe("Paulina");
    expect(result.patch.next_action).toBe("Perskambinti – kolegai neatsiliepė");
    expect(result.comment).toContain("Perduota: Paulina.");
  });
  test("assigns a callback to Aivaras without changing the client stage", () => {
    const result = createClientHandoff("Aivaras");
    expect(result.patch.assigned_to).toBe("Aivaras");
    expect(result.patch).not.toHaveProperty("status");
    expect(result.comment).toContain("Perduota: Aivaras.");
  });
});