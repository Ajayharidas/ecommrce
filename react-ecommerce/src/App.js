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

function App() {
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
