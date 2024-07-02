import React, {
  Children,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const EcoContext = createContext({
  updateCategories: () => {},
});

export const EcoProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  const getCategories = useMemo(
    () => ({
      updateCategories: (cats) => {
        setCategories(cats);
      },
    }),
    [categories]
  );
  return (
    <EcoContext.Provider value={{ getCategories, categories }}>
      {children}
    </EcoContext.Provider>
  );
};

export const UseModeContext = () => useContext(EcoContext);
