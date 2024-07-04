import React, {
  Children,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const EcoContext = createContext({
  updateUser: () => {},
});

export const EcoProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const getUser = useMemo(
    () => ({
      updateUser: (data) => {
        setUser(data);
      },
    }),
    [user]
  );
  return (
    <EcoContext.Provider value={{ getUser, user }}>
      {children}
    </EcoContext.Provider>
  );
};

export const UseEcoContext = () => useContext(EcoContext);
