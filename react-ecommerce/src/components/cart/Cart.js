import React from "react";
import { axiosInstance } from "../axios/axios";

const updateqty = async (data) => {
  try {
    if (data.user && data.user.is_authenticated) {
      const response = await axiosInstance.post(`/update_qty`, {
        product: data.product,
        size: data.size,
        quantity: data.quantity,
      });
      if (response) {
        console.log(response.data.message);
        console.log(response.data.cart);
        return JSON.parse(response.data.cart);
      }
    } else {
      const updatedcart = data.cart.map((item) => {
        return item.product.id === data.product &&
          item.selectedsize === data.size
          ? { ...item, quantity: data.quantity }
          : item;
      });
      return updatedcart;
    }
  } catch (error) {
    console.error("Error updating quantity...", error);
  }
};

const updatesize = async (data) => {
  try {
    if (data.user && data.user.is_authenticated) {
      if (data.cartid) {
        const response = await axiosInstance.post(`/update_size`, {
          cart: data.cartid,
          size: data.selectedsize,
          product: data.product,
        });
        if (response) {
          console.log(response.data.message);
          console.log(response.data.cart);
          return JSON.parse(response.data.cart);
        }
      }
    } else {
      const updatedcart = data.cart.map((item) => {
        return item.product.id === data.product &&
          item.selectedsize === data.size
          ? {
              ...item,
              quantity:
                item.quantity > data.maxqty
                  ? data.maxqty
                  : item.quantity,
              selectedsize: data.selectedsize,
            }
          : item;
      });
      return updatedcart;
    }
  } catch (error) {
    console.error("Error updating size....", error);
  }
};

const removecartitem = async (data) => {
  try {
    if (data.user && data.user.is_authenticated) {
      const response = await axiosInstance.delete(
        `/delete_cart_item/${data.cartid}`
      );
      if (response) {
        console.log(response.data.message);
        console.log(response.data.cart);
        return JSON.parse(response.data.cart);
      }
    } else {
      const updatedcart = data.cart.filter(
        (item) =>
          item.product.id !== data.product && item.selectedsize !== data.size
      );
      return updatedcart;
    }
  } catch (error) {
    console.error("Error removing item....", error);
  }
};

const reducer = (state, action) => {
  switch (action.type) {
    case "INIT":
      return action.payload;
    case "SET_QTY":
      return state.map((item) => {
        return item.id === action.id
          ? { ...item, quantity: action.data.quantity }
          : item;
      });
    case "SET_SIZE":
      return state.map((item) => {
        return item.id === action.id
          ? {
              id: `${action.data.product}-${action.data.selectedsize}`,
              quantity:
                item.quantity > action.data.maxqty
                  ? action.data.maxqty
                  : item.quantity,
              size: action.data.selectedsize,
            }
          : item;
      });
    case "REMOVE":
      return state.filter((item) => action.id === item.id);
    default:
      throw new Error(`Unknown action type : ${action.type}`);
  }
};

export const Cart = () => {
  const [cart, setCart] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [updatablecart, dispatch] = React.useReducer(reducer, []);

  React.useEffect(() => {
    if (user && user.is_authenticated) {
      const jsondata = document.getElementById("data")?.textContent;

      if (jsondata) {
        const parsedata = JSON.parse(jsondata);
        setCart(parsedata);
        const initialdata = parsedata.map((item) => ({
          id: `${item.product.id}-${item.selectedsize}`,
          quantity: item.quantity,
          size: item.selectedsize,
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
        size: item.selectedsize,
      }));
      dispatch({ type: "INIT", payload: initialdata });
    }
  }, []);

  const findmax = (sizes, selsize) => {
    const size = sizes.find((size) => selsize === size.id);
    return size ? size.stock : 10;
  };

  const handleSetQty = async (id, data) => {
    dispatch({ type: "SET_QTY", id, data });
    const response = await updateqty(data);
    if (user && user.is_authenticated) {
      setCart(response);
    } else {
      setCart(response);
      localStorage.setItem("cart", JSON.stringify(response));
    }
  };

  const handleSetSize = async (id, data) => {
    dispatch({ type: "SET_SIZE", id, data });
    const response = await updatesize(data);
    if (user && user.is_authenticated) {
      setCart(response);
    } else {
      setCart(response);
      localStorage.setItem("cart", JSON.stringify(response));
    }
  };

  const handleRemove = async (id, data) => {
    dispatch({ type: "REMOVE", id });
    const response = await removecartitem(data);
    if (user && user.is_authenticated) {
      setCart(response);
    } else {
      setCart(response);
      localStorage.setItem("cart", JSON.stringify(response));
    }
  };

  return (
    <>
      <h1>Cart</h1>
      <div>
        {cart && cart.length > 0 ? (
          cart.map((item, index) => {
            const uniqueId = `${item.product.id}-${item.selectedsize}`;
            const updatablecartItem = updatablecart.find(
              (q) => q.id === uniqueId
            );
            const currentQuantity = updatablecartItem
              ? updatablecartItem.quantity
              : item.quantity;
            const currentSize = updatablecartItem
              ? updatablecartItem.size
              : item.selectedsize;
            const maxQuantity = findmax(item.product.sizes, currentSize);

            return (
              <div key={uniqueId}>
                <h4>{item.product.name}</h4>
                <select
                  name="sizes"
                  className="sizes"
                  value={currentSize}
                  onChange={(e) =>
                    handleSetSize(uniqueId, {
                      selectedsize: parseInt(e.target.value, 10),
                      user: user,
                      cart: cart,
                      cartid: item.id ? item.id : null,
                      product: item.product.id,
                      size: currentSize,
                      maxqty: findmax(
                        item.product.sizes,
                        parseInt(e.target.value, 10)
                      ),
                    })
                  }
                >
                  {item.product.sizes.map((size) => {
                    return (
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
                    onChange={(e) =>
                      handleSetQty(uniqueId, {
                        quantity: parseInt(e.target.value, 10),
                        user: user,
                        cart: cart,
                        product: item.product.id,
                        size: currentSize,
                      })
                    }
                    className="cart-qty-input"
                    name={`${uniqueId}`}
                    min={1}
                    max={maxQuantity}
                  />
                </span>
                <button
                  onClick={(e) =>
                    handleRemove(uniqueId, {
                      user: user,
                      cart: cart,
                      cartid: item.id ? item.id : null,
                      product: item.product.id,
                      size: currentSize,
                    })
                  }
                >
                  remove
                </button>
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
