import React from "react";
import { axiosInstance } from "../axios/axios";

export const Cart = () => {
  const [cart, setCart] = React.useState([]);
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    if (user && user.is_authenticated) {
      const jsondata = document.getElementById("data")?.textContent;

      if (jsondata) {
        console.log(jsondata);
        const parsedata = JSON.parse(jsondata);
        setCart(parsedata);
      }
    }
  }, [user]);

  React.useEffect(() => {
    const jsonuser = JSON.parse(localStorage.getItem("user"));
    if (jsonuser) {
      setUser(jsonuser);
    }
  }, []);

  return (
    <>
      <h1>Cart</h1>
      <div>
        {cart && cart.length > 0 ? (
          cart.map((item) => {
            return (
              <div>
                <h4 key={item.id}>{item.name}</h4>
                <select name="sizes" id="sizes">
                  {item.sizes.sizes.map((size) => {
                    return item.sizes.selectedsize.id === size.id ? (
                      <option value={size.id} key={size.id} selected>
                        {size.name}
                      </option>
                    ) : (
                      <option value={size.id} key={size.id}>
                        {size.name}
                      </option>
                    );
                  })}
                </select>
                <span>
                  <button>-</button>
                  {/* add ref */}
                  <input type="number" value={item.quantity}/>
                  <button>+</button>
                </span>
              </div>
            );
          })
        ) : (
          <p>Cart is empty</p>
        )}
      </div>
    </>
  );
};
