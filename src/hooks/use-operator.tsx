import { useEffect, useState, useCallback } from "react";

export const OPERATORS = ["Aivaras", "Paulina"] as const;
export type Operator = (typeof OPERATORS)[number];

const STORAGE_KEY = "admin_active_operator";

const readOperator = (): Operator | null => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && (OPERATORS as readonly string[]).includes(v)) return v as Operator;
    return null;
  } catch {
    return null;
  }
};

export function useOperator() {
  const [operator, setOperatorState] = useState<Operator | null>(() => readOperator());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setOperatorState(readOperator());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setOperator = useCallback((op: Operator) => {
    localStorage.setItem(STORAGE_KEY, op);
    setOperatorState(op);
  }, []);

  const clearOperator = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setOperatorState(null);
  }, []);

  return { operator, setOperator, clearOperator };
}

// Operator-tag helpers for comments
const TAG_REGEX = /^\[([^\]]+)\]\s+/;

export const tagCommentWithOperator = (text: string, op: Operator | null) => {
  if (!op) return text;
  // avoid double-tagging
  if (TAG_REGEX.test(text)) return text;
  return `[${op}] ${text}`;
};

export const parseOperatorTag = (text: string): { operator: string | null; body: string } => {
  const m = text.match(TAG_REGEX);
  if (!m) return { operator: null, body: text };
  return { operator: m[1], body: text.slice(m[0].length) };
};
