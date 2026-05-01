import { createContext, useContext, useState, useEffect } from "react";
import { getSettings } from "../api/settings.api";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    getSettings()
      .then((res) => {
        const info = res?.data?.contactInfo ?? res?.contactInfo ?? null;
        if (info) setContactInfo(info);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SettingsContext.Provider value={{ contactInfo, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
