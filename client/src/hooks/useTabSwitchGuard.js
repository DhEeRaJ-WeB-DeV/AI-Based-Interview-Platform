import { useEffect, useRef } from "react";

export const useTabSwitchGuard = ({
  enabled = true,
  onViolation,
}) => {
  const lastViolationAtRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleViolation = (reason) => {
      const now = Date.now();

      // visibilitychange + blur can fire for the same tab switch
      if (now - lastViolationAtRef.current < 500) {
        return;
      }

      lastViolationAtRef.current = now;

      onViolation?.(reason);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleViolation("tab-switch");
      }
    };

    const handleWindowBlur = () => {
      setTimeout(() => {
        if (document.visibilityState === "hidden") {
          handleViolation("window-blur");
        }
      }, 100);
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "blur",
      handleWindowBlur
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "blur",
        handleWindowBlur
      );
    };
  }, [enabled, onViolation]);
};