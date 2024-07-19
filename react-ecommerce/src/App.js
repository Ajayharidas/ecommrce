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
import Wishlist from "./components/wishlist/Wishlist";
import CreateCategory from "./components/admin/category/CreateCategory";
import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import { UseEcoContext } from "./context/EcoContext";

function App() {
  const [user, setUser] = useState([]);
  const [cart, setCart] = useState([]);
  const { postcart } = UseEcoContext();

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
    if (user && user.is_authenticated) {
      if (cart && cart.length > 0) {
        postcart(cart);
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
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/category/create-category" element={<CreateCategory />} />
            </Routes>
          </Grid>
        </Grid>
      </Container>
    </Router>
  );
}

export default App;
