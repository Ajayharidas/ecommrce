import React, { useEffect, useState } from "react";
import { axiosInstance } from "../axios/axios";

function Wishlist() {
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    const localuser = JSON.parse(localStorage.getItem("user"));
    if (localuser) {
      setUser(localuser);
    }
  }, []);

  useEffect(() => {
    if (user && user.is_authenticated) {
      const data = JSON.parse(document.getElementById("data")?.textContent);
      if (data) {
        setWishlist(data);
      }
    }
  }, [user]);

  const handleRemove = async (wishlistid) => {
    try {
      const response = await axiosInstance.delete(
        `delete_wishlist_item/${wishlistid}`
      );
      if (response.status === 200) {
        console.log(response.data.message);
        setWishlist(JSON.parse(response.data.wishlist));
      }
    } catch (error) {
      console.error("Error deleting wishlist item...", error);
    }
  };

  console.log(user, wishlist);
  return (
    <>
      <h1>wishlist</h1>
      <div>
        {user && user.is_authenticated ? (
          wishlist && wishlist.length > 0 ? (
            wishlist.map((item) => {
              return (
                <div key={item.id}>
                  <h4>{item.product.name}</h4>
                  <p>{item.product.price}</p>
                  <button
                    onClick={() => handleRemove(item.id)}
                  >
                    remove
                  </button>
                </div>
              );
            })
          ) : (
            <p>wishlist is empty</p>
          )
        ) : (
          <p>please log in to see wishlist</p>
        )}
      </div>
    </>
  );
}

export default Wishlist;
