import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export const useNavigationGuard = ({ enabled }) => {

  useEffect(() => {
  if (enabled) return;

  const pushGuard = () => {
    window.history.pushState(
      { guard: true },
      "",
      window.location.href
    );
  };

  pushGuard();

  const handlePopState = () => {
    pushGuard();
    toast.error("You cannot leave the interview until it is submitted.");
  };

  window.addEventListener("popstate", handlePopState);

  return () => {
    window.removeEventListener("popstate", handlePopState);
  };
}, [enabled]);
};