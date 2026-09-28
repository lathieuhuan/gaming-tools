import { timeoutPromise } from "ron-utils";

export async function waitForElementById(id: string, timeout: number = 500) {
  const { promise, resolve } = timeoutPromise<HTMLElement | null>(timeout, null);

  const existing = document.getElementById(id);

  if (existing) {
    resolve(existing);
    return promise;
  }

  const observer = new MutationObserver((_, observer) => {
    const element = document.getElementById(id);

    if (element) {
      observer.disconnect();
      resolve(element);
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return promise.finally(() => observer.disconnect());
}
