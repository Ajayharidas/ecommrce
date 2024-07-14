import React from "react";
import { axiosInstance } from "../axios/axios";

const updateqty = async (data) => {
  console.log(data.quantity, data.user, data.product, data.size, data.cart);
  try {
    if (data.user && data.user.is_authenticated) {
      const response = await axiosInstance.post(`/update_qty`, {
        product: data.product,
        size: data.size,
        quantity: data.quantity,
      });
      if (response) {
        console.log(response.data.message);
      }
    } else {
      const updatedcart = data.cart.map((item) => {
        return item.product.id === data.product &&
          item.selectedsize === data.size
          ? { ...item, quantity: data.quantity }
          : item;
      });
      if (updatedcart && updatedcart.length > 0) {
        console.log(updatedcart);
        localStorage.setItem("cart", JSON.stringify(updatedcart));
      }
    }
  } catch (error) {
    console.error("Error updating quantity...", error);
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      return action.payload;
    case "SET_QTY":
      const updatestate = state.map((item) => {
        if (item.id === action.id) {
          updateqty(action.data);
          return { ...item, quantity: action.data.quantity };
        }
        return item;
      });
      return updatestate;
    default:
      throw new Error(`Unknown action type : ${action.type}`);
  }
};

export const Cart = () => {
  const [cart, setCart] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [quantity, dispatch] = React.useReducer(reducer, []);
  const inputRef = React.useRef([]);

  React.useEffect(() => {
    if (user && user.is_authenticated) {
      const jsondata = document.getElementById("data")?.textContent;

      if (jsondata) {
        const parsedata = JSON.parse(jsondata);
        setCart(parsedata);
        const initialdata = parsedata.map((item) => ({
          id: `${item.product.id}-${item.selectedsize}`,
          quantity: item.quantity,
        }));
        dispatch({ type: "INIT", payload: initialdata });
      }
    }
  }, [user]);

  React.useEffect(() => {
    const jsonuser = JSON.parse(localStorage.getItem("user"));
    const jsoncart = JSON.parse(localStorage.getItem("cart"));
    if (jsonuser) {
      setUser(jsonuser);
    }
    if (jsoncart) {
      setCart(jsoncart);
      const initialdata = jsoncart.map((item) => ({
        id: `${item.product.id}-${item.selectedsize}`,
        quantity: item.quantity,
      }));
      dispatch({ type: "INIT", payload: initialdata });
    }
  }, []);

  const findmax = (sizes, selsize) => {
    const size = sizes.find((size) => selsize === size.id);
    return size ? size.stock : 10;
  };

  return (
    <>
      <h1>Cart</h1>
      <div>
        {cart && cart.length > 0 ? (
          cart.map((item, index) => {
            const uniqueId = `${item.product.id}-${item.selectedsize}`;
            const quantityItem = quantity.find((q) => q.id === uniqueId);
            const currentQuantity = quantityItem ? quantityItem.quantity : 1;
            const maxQuantity = findmax(item.product.sizes, item.selectedsize);
            return (
              <div>
                <h4 key={uniqueId}>{item.product.name}</h4>
                <select name="sizes" className="sizes">
                  {item.product.sizes.map((size) => {
                    return item.selectedsize === size.id ? (
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
                  <input
                    type="number"
                    value={currentQuantity}
                    ref={(e) => (inputRef.current[index] = e)}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_QTY",
                        id: uniqueId,
                        data: {
                          quantity: parseInt(e.target.value, 10),
                          user: user,
                          cart: cart,
                          product: item.product.id,
                          size: item.selectedsize,
                        },
                      })
                    }
                    className="cart-qty-input"
                    name={`${uniqueId}`}
                    min={1}
                    max={maxQuantity}
                  />
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
