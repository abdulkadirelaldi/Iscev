import "@testing-library/jest-dom";
import { vi } from "vitest";

// framer-motion animasyonlarını testlerde sıfırla
vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }) => children,
    motion: new Proxy(
      {},
      {
        get: (_, tag) =>
          ({ children, initial: _i, animate: _a, exit: _e, transition: _t, whileHover: _wh, whileTap: _wt, ...rest }) => {
            const React = require("react");
            return React.createElement(tag, rest, children);
          },
      }
    ),
  };
});
