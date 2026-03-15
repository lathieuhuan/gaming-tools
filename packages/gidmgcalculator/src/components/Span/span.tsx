export function markGreen(children: React.ReactNode, b?: "bold", cls = "") {
  return <span className={`text-bonus${b ? " font-bold" : ""} ${cls}`}>{children}</span>;
}

export function markYellow(children: React.ReactNode, b?: "bold", cls = "") {
  return <span className={`text-primary-1${b ? " font-bold" : ""} ${cls}`}>{children}</span>;
}

export function markDim(children: React.ReactNode, b?: "bold", cls = "") {
  return <span className={`text-light-hint${b ? " font-bold" : ""} ${cls}`}>{children}</span>;
}
