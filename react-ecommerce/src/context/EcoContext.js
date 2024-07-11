import React, {
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const EcoContext = createContext({
  updateUser: () => {},
  updateCart: () => {},
});

export const EcoProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);

  // const getUser = useMemo(
  //   () => ({
  //     updateUser: (data) => {
  //       localStorage.setItem("user", JSON.stringify(data));
  //     },
  //   }),
  //   []
  // );

  useEffect(() => {
    const userdata = localStorage.getItem("user");
    const localdata = localStorage.getItem("cart");

    if (userdata) {
      setUser(JSON.parse(userdata));
    }
    if (localdata) {
      setCart(JSON.parse(localdata));
    }
  }, []);

  // const getCart = useMemo(
  //   () => ({
  //     updateCart: (data) => {
  //       setCart(data);
  //     },
  //   }),
  //   [cart]
  // );

  return (
    <EcoContext.Provider value={{ setUser, user, cart }}>
      {children}
    </EcoContext.Provider>
  );
};

export const UseEcoContext = () => useContext(EcoContext);
