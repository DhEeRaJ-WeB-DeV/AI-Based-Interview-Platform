import { useEffect, useRef } from "react";

export const useTabSwitchGuard = ({ enabled = true, onViolation }) => {
  const handledRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const handleViolation = (reason) => {
      if (handledRef.current) {
        return;
      }

      handledRef.current = true;
      onViolation?.(reason);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleViolation("tab-switch");
      }
    };

    const handleWindowBlur = () => {
      window.setTimeout(() => {
        if (document.visibilityState === "hidden") {
          handleViolation("window-blur");
        }
      }, 100);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [enabled, onViolation]);
};
