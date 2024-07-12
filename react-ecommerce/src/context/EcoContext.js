import React, {
  useEffect,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { axiosInstance } from "../components/axios/axios";

const EcoContext = createContext({
  updateUser: () => {},
  updateCart: () => {},
});

export const EcoProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [cart, setCart] = useState([]);

  // const postcart = async () => {
  //   const response = await axiosInstance.post("/add_to_cart", cart);
  //   if (response) {
  //     console.log(response.data);
  //   }
  // };

  // useEffect(() => {
  //   const userdata = localStorage.getItem("user");
  //   const localdata = localStorage.getItem("cart");
  //   console.log(userdata,localdata)

  //   if (userdata) {
  //     setUser(JSON.parse(userdata));
  //   }
  //   if (localdata) {
  //     setCart(JSON.parse(localdata));
  //   }
  // }, []);

  // useEffect(() => {
  //   if (user && user.is_authenticated) {
  //     postcart();
  //   }
  // }, [cart]);

  return (
    <EcoContext.Provider value={{ setUser, user, cart }}>
      {children}
    </EcoContext.Provider>
  );
};

export const UseEcoContext = () => useContext(EcoContext);
