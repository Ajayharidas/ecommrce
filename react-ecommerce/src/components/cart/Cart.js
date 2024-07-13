import React from "react";
import { axiosInstance } from "../axios/axios";

const reducer = (state, action) => {
  switch (action.type) {
    case "init":
      return action.payload;
    case "set":
      return state.map((item) =>
        item.id === action.id ? { ...item, quantity: action.quantity } : item
      );
    case "add":
      return state.map((item) =>
        item.id === action.id ? { ...item, quantity: item.quantity + 1 } : item
      );
    case "sub":
      return state.map((item) =>
        item.id === action.id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
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
        console.log(jsondata);
        const parsedata = JSON.parse(jsondata);
        setCart(parsedata);
        const initialdata = parsedata.map((item) => ({
          id: `${item.product.id}-${item.selectedsize}`,
          quantity: item.quantity,
        }));
        dispatch({ type: "init", payload: initialdata });
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
      dispatch({ type: "init", payload: initialdata });
    }
  }, []);

  console.log(cart);
  // console.log(inputRef);
  // console.log(quantity);

  return (
    <>
      <h1>Cart</h1>
      <div>
        {cart && cart.length > 0 ? (
          cart.map((item, index) => {
            const uniqueId = `${item.product.id}-${item.selectedsize}`;
            const quantityItem = quantity.find((q) => q.id === uniqueId);
            const currentQuantity = quantityItem ? quantityItem.quantity : 1;
            return (
              <div>
                <h4 key={item.product.id}>{item.product.name}</h4>
                <select name="sizes" id="sizes">
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
                  <button
                    onClick={() => dispatch({ type: "sub", id: uniqueId })}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={currentQuantity}
                    ref={(e) => (inputRef.current[index] = e)}
                    onChange={(e) =>
                      dispatch({
                        type: "set",
                        id: item.product.id,
                        quantity: parseInt(e.target.value, 10),
                      })
                    }
                  />
                  <button
                    onClick={() => dispatch({ type: "add", id: uniqueId })}
                  >
                    +
                  </button>
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
