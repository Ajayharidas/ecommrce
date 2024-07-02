import logo from "./logo.svg";
import "./App.css";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import Header from "./components/common/Header";
import Home from "./components/home/Home";
import Products from "./components/product/Products";
import React, { useState, useEffect } from "react";

function App() {
  return (
    <Router>
      <div className="container-fluid">
        <Header />
        <Routes>
          <Route path="/home" Component={Home} />
          <Route path="/product/products/:categoryid" Component={Products} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
