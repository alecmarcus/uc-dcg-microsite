export const onDocumentReady = (callback: () => void) => {
  if (document.readyState !== "loading") {
    callback();
  } else {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  }
};

// export const getFocusables = (container: HTMLElement) => {
//   const focusables = ["button", "[href]", "[tabindex]"];
//   const focusablesQuery = focusables.map(e => `${e}:not([tabindex="-1"])`).join(", ");
//   const elements = Array.from(container.querySelectorAll(focusablesQuery));

//   // Prevent selecting hidden elements
//   return elements.filter(el => (el as HTMLElement).offsetParent !== null);
// };

// export const throttle = (callback: () => void, limit: number) => {
//   let wait = false;
//   return function () {
//     if (!wait) {
//       callback();
//       wait = true;
//       setTimeout(function () {
//         wait = false;
//       }, limit);
//     }
//   };
// };
