import { createContext, useContext, useEffect, useMemo, useRef } from "react";

type Handler = () => void;

type ShortcutConfigs = Partial<Record<string, Handler[]>>;

type KeyboardShortcutsControl = {
  register: (key: string, handler: Handler) => () => void;
  batchRegister: (configs: Record<string, Handler>) => () => void;
};

const KeyboardShortcutsContext = createContext<KeyboardShortcutsControl | null>(null);

function hasAnyHandler(configs: ShortcutConfigs) {
  for (const key in configs) {
    if (configs[key]?.length) return true;
  }
  return false;
}

export function KeyboardShortcutsProvider(props: { children: React.ReactNode }) {
  const shortcutConfigs = useRef<ShortcutConfigs>({});
  const keydownHandler = useRef<(e: KeyboardEvent) => void>();

  const control = useMemo<KeyboardShortcutsControl>(() => {
    const addHandler = (key: string, handler: Handler) => {
      shortcutConfigs.current[key] = (shortcutConfigs.current[key] || []).concat(handler);
    };

    const removeHandler = (key: string, handler: Handler) => {
      shortcutConfigs.current[key] = shortcutConfigs.current[key]?.filter((cb) => cb !== handler);
    };

    const updateKeydownHandler = () => {
      if (keydownHandler.current) {
        document.removeEventListener("keydown", keydownHandler.current);
      }

      if (hasAnyHandler(shortcutConfigs.current)) {
        keydownHandler.current = (e) => {
          const activeTag = document.activeElement?.tagName;
          const outTags: Array<string | undefined> = ["INPUT", "TEXTAREA"];

          if (!outTags.includes(activeTag)) {
            const handlers = shortcutConfigs.current[e.key] ?? [];
            console.log(e.key, handlers.length);

            handlers[handlers.length - 1]?.();
          }
        };

        document.addEventListener("keydown", keydownHandler.current);
      } else {
        keydownHandler.current = undefined;
      }
    };

    return {
      register: (key, handler) => {
        addHandler(key, handler);
        updateKeydownHandler();

        return () => {
          removeHandler(key, handler);
          updateKeydownHandler();
        };
      },
      batchRegister: (configs) => {
        for (const key in configs) {
          addHandler(key, configs[key]);
        }
        updateKeydownHandler();

        return () => {
          for (const key in configs) {
            removeHandler(key, configs[key]);
          }
          updateKeydownHandler();
        };
      },
    };
  }, []);

  return <KeyboardShortcutsContext.Provider value={control}>{props.children}</KeyboardShortcutsContext.Provider>;
}

export function useKeyboardShortcut(key: string, handler: Handler): KeyboardShortcutsControl;
export function useKeyboardShortcut(configs: Record<string, Handler>): KeyboardShortcutsControl;
export function useKeyboardShortcut(): KeyboardShortcutsControl;
export function useKeyboardShortcut(
  first?: string | Record<string, Handler>,
  handler?: Handler
): KeyboardShortcutsControl {
  const control = useContext(KeyboardShortcutsContext);

  if (!control) {
    throw new Error("useKeyboardShortcut must be used inside KeyboardShortcutsProvider");
  }

  useEffect(() => {
    if (typeof first === "string") {
      if (handler) {
        return control.register(first, handler);
      }
    } else if (first) {
      return control.batchRegister(first);
    }
  }, []);

  return control;
}
