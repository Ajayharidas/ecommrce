import "./App.css";
import {
  Route,
  Routes,
  BrowserRouter as Router,
  Navigate,
} from "react-router-dom";
import Header from "./components/common/Header";
import Home from "./components/home/Home";
import Products from "./components/product/Products";
import Product from "./components/product/Product";
import { Cart } from "./components/cart/Cart";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { axiosInstance } from "./components/axios/axios";

function App() {
  const [user, setUser] = React.useState([]);
  const [cart, setCart] = React.useState([]);

  useEffect(() => {
    const jsonuser = JSON.parse(localStorage.getItem("user"));
    const jsoncart = JSON.parse(localStorage.getItem("cart"));
    if (jsonuser) {
      setUser(jsonuser);
    }
    if (jsoncart) {
      setCart(jsoncart);
    }
  }, []);

  useEffect(() => {
    const postcart = async () => {
      const response = await axiosInstance.post("/add_to_cart", cart);
      if (response) {
        console.log(response.data);
        if (response.status === 201) {
          localStorage.removeItem("cart");
        }
      }
    };

    console.log(user, cart);
    if (user && user.is_authenticated) {
      if (cart && cart.length > 0) {
        postcart();
      }
    }
  }, [cart]);
  return (
    <Router>
      <Container maxWidth="xl" disableGutters>
        <Grid
          container
          justifyContent={"center"}
          alignItems={"center"}
          spacing={2}
        >
          <Grid item xs={12} xl={12}>
            <Header />
          </Grid>
          <Grid item xs={12} xl={12}>
            <Routes>
              <Route path="/" element={<Navigate to={"/home"} />} />
              <Route path="/home" element={<Home />} />
              <Route
                path="/product/products/:categoryid"
                element={<Products />}
              />
              <Route
                path="/product/product/:brand/:slug"
                element={<Product />}
              />
              <Route path="/cart" element={<Cart />} />
            </Routes>
          </Grid>
        </Grid>
      </Container>
    </Router>
  );
}

export default App;
