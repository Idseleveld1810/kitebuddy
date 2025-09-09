import { useState } from "react";

export default function TestIsland() {
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>It works 🎉 Count: {n}</button>;
}
