import React, { useEffect, useState } from "react";
import { axiosInstance } from "../axios/axios";
import { useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ProductCard from "../common/Card";
import FilterList from "../common/List";

const Products = () => {
  const { categoryid } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [brands, setBrands] = useState([]);

  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);

  useEffect(() => {
    const jsonData = document.getElementById("data")?.textContent;
    if (jsonData) {
      try {
        const parseData = JSON.parse(jsonData);
        setProducts(parseData.products);
        setCategories(parseData.filters.categories);
        setBrands(parseData.filters.brands);
        setSizes(parseData.filters.sizes);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    } else {
      console.warn("No data found in the element with id 'data'");
    }
  }, []);

  const handleCategoryChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSubcategories((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };
  const handleBrandChange = (event) => {
    const { value, checked } = event.target;
    setSelectedBrands((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };
  const handleSizeChange = (event) => {
    const { value, checked } = event.target;
    setSelectedSizes((prev) =>
      checked ? [...prev, value] : prev.filter((id) => id !== value)
    );
  };
  console.log(products);

  const fetchproducts = async (options) => {
    try {
      await axiosInstance
        .get(`/product/filter/`, {
          params: {
            category: categoryid,
            subcategories: options.subcategories,
            brands: options.brands,
            sizes: options.sizes,
          },
        })
        .then((response) => setProducts(response.data))
        .catch((error) => console.error("Error filtering products : ", error));
    } catch (error) {
      console.error("Error filtering products : ", error);
    }
  };

  return (
    <>
      <Grid container spacing={2} sx={{ py: "30px" }}>
        <Grid
          item
          xl={3}
          lg={3}
          md={3}
          sm={3}
          xs={3}
          sx={{
            display: {
              xl: "block",
              lg: "block",
              md: "block",
              sm: "none",
              xs: "none",
            },
            p: "0px 20px 0px 30px!important",
          }}
        >
          <p>Filter</p>
          <FilterList categories={categories} brands={brands} sizes={sizes} />
          <ul>
            {categories ? (
              categories.map((category) => (
                <li key={category.id}>
                  <input
                    type="checkbox"
                    className="category"
                    value={category.id}
                    onChange={handleCategoryChange}
                  />
                  {category.name}
                </li>
              ))
            ) : (
              <p>No categories available</p>
            )}
          </ul>
          <ul>
            {brands ? (
              brands.map((brand) => (
                <li key={brand.id}>
                  <input
                    type="checkbox"
                    className="brand"
                    value={brand.id}
                    onChange={handleBrandChange}
                  />
                  {brand.name}
                </li>
              ))
            ) : (
              <p>No brands available</p>
            )}
          </ul>
          <ul>
            {sizes ? (
              sizes.map((size) => (
                <li key={size.id}>
                  <input
                    type="checkbox"
                    className="size"
                    value={size.id}
                    onChange={handleSizeChange}
                  />
                  {size.name}
                </li>
              ))
            ) : (
              <p>No sizes available</p>
            )}
          </ul>
          <button
            type="button"
            onClick={() =>
              fetchproducts({
                subcategories: selectedSubcategories,
                brands: selectedBrands,
                sizes: selectedSizes,
              })
            }
          >
            Apply
          </button>
        </Grid>
        <Grid
          item
          xl={9}
          lg={9}
          md={9}
          sm={12}
          xs={12}
          sx={{ pr: "30px!important" }}
        >
          <Grid
            container
            justifyContent={"flex-start"}
            alignItems={"center"}
            spacing={3}
          >
            {products && products.length > 0 ? (
              products.map((product) => (
                <Grid item xl={3} lg={3} md={3} sm={3} xs={4} key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={
                      product.images && product.images.length > 0
                        ? product.images[0].name
                        : ""
                    }
                    description={product.description}
                  />
                </Grid>
              ))
            ) : (
              <Grid item xl={true}>
                <Typography>Result not found</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default Products;
