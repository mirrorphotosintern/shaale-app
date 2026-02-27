import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuthSafe";
import { getCustomerInfo, presentPaywall } from "../services/purchases";

export function useSubscription() {
  const { isSignedIn } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const info = await getCustomerInfo();
      setIsPro(info ? info.entitlements.active["Shaale Pro"]?.isActive === true : false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [isSignedIn, refresh]);

  return { isPro, isLoading, presentPaywall, refresh };
}
