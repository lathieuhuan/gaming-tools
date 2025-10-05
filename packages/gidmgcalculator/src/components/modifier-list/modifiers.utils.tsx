export function renderModifiers(modifiers: (JSX.Element | null)[], type: "buffs" | "debuffs", mutable?: boolean) {
  return modifiers.some((modifier) => modifier !== null) ? (
    <div className={`pt-2 ${mutable ? "space-y-3" : "space-y-2"}`}>{modifiers}</div>
  ) : (
    <p className="pt-6 pb-4 text-center text-light-hint">No {type} found</p>
  );
}
