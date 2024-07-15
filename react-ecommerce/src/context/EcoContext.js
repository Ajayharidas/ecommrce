import React, {
  createContext,
  useContext,
} from "react";
import { axiosInstance } from "../components/axios/axios";

const EcoContext = createContext();

export const EcoProvider = ({ children }) => {
  const postcart = async (data) => {
    try {
      const response = await axiosInstance.post("/add_to_cart", data);
      if (response) {
        if (response.status === 201 || response.status === 200) {
          console.log(response.data.message);
          localStorage.removeItem("cart");
        }
      }
    } catch (error) {
      console.error("Error updating cart ...", error);
    }
  };
  return (
    <EcoContext.Provider value={{ postcart }}>{children}</EcoContext.Provider>
  );
};

export const UseEcoContext = () => useContext(EcoContext);
