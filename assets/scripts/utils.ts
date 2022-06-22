export const onDocumentReady = (callback: () => void) => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  }
};
