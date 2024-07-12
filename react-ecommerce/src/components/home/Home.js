import React, { useState, useEffect, useLayoutEffect } from "react";
import Link from "@mui/material/Link";
import { UseEcoContext } from "../../context/EcoContext";

const Home = () => {
  const [categories, setCategories] = useState([]);

  useLayoutEffect(() => {
    const jsondata = document.getElementById("data")?.textContent;

    if (jsondata) {
      try {
        const parsedata = JSON.parse(jsondata);
        console.log(parsedata);
        setCategories(parsedata.homedata);
        localStorage.setItem("user", JSON.stringify(parsedata.sessiondata));
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    } else {
      console.warn("No data found in the element with id 'data'");
    }
  }, []);
  console.log(categories);
  return (
    <>
      {categories.length > 0 ? (
        categories.map((category) => (
          <Link
            key={category.id}
            href={`/product/products/${category.id}`}
            underline="hover"
            textTransform={"uppercase"}
            variant="caption"
            sx={{ mx: 2 }}
          >
            {category.name}
          </Link>
        ))
      ) : (
        <p>no categories</p>
      )}
    </>
  );
};
export default Home;
