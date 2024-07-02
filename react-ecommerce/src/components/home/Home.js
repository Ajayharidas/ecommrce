import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UseModeContext } from "../../context/EcoContext";

const Home = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const jsondata = document.getElementById("data").textContent;
    console.log(jsondata);
    try {
      const parsedata = JSON.parse(jsondata);
      setCategories(parsedata);
    } catch (error) {
      console.log("Error parsing JSON : ", error);
    }
  }, []);
  console.log(categories);
  return (
    <div className="row">
      {categories ? (
        categories.map((category) =>
          !category.parent ? (
            <a key={category.id} href={`/product/products/${category.id}`}>
              {category.name}
            </a>
          ) : null
        )
      ) : (
        <p>no categories</p>
      )}
    </div>
  );
};
export default Home;
