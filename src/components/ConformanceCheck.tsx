"use client";

import { useState } from "react";

type ConformanceCheckProps = {
  title: string;
  instruction: string;
  expected: string;
};

export default function ConformanceCheck({ title, instruction, expected }: ConformanceCheckProps) {
  const [checked, setChecked] = useState(false);

  return <article className="conformance-check" data-status={checked ? "pass" : "pending"}>
    <header>
      <h3>{title}</h3>
      <span>{checked ? "Pass" : "Pending"}</span>
    </header>
    <p><strong>Try:</strong> {instruction}</p>
    <p><strong>Expected:</strong> {expected}</p>
    <label><input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} /> I verified this behavior</label>
  </article>;
}
