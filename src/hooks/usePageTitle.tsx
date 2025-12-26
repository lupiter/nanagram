import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface PageTitleContextValue {
  title: PageTitleState;
  setTitle: (title: PageTitleState) => void;
}

type PageTitleState = {
    title: string;
    subtitle?: string;
}

const PageTitleContext = createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: ReactNode }) {
  const [title, setTitleState] = useState<PageTitleState>({ title: "" });

  const setTitle = useCallback((newTitle: PageTitleState) => {
    setTitleState(newTitle);
  }, []);

  return (
    <PageTitleContext.Provider value={{ title, setTitle }}>
      {children}
    </PageTitleContext.Provider>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (!context) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }
  return context;
}

