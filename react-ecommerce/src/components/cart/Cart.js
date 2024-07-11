import React from "react";
import { axiosInstance } from "../axios/axios";
import { UseEcoContext } from "../../context/EcoContext";

export const Cart = () => {
  const { user, cart } = UseEcoContext();

  React.useEffect(() => {
    const postcart = async () => {
      try {
        const response = await axiosInstance.post(`/add_to_cart`, cart);
        if (response) {
          console.log(response.data);
        }
      } catch (error) {
        console.error("Error in updating cart", error);
      }
    };
    if (cart && user && user.is_authenticated) {
      postcart();
    }
  }, [user, cart]);

  console.log(user, cart);
  return (
    <>
      <h1>Cart</h1>
      {/* <div>
        {data.cart && data.cart.length > 0 ? (
          data.cart.map((item) => {
            return <h4>{item.product.name}</h4>;
          })
        ) : (
          <p>Cart is empty</p>
        )}
      </div> */}
    </>
  );
};
