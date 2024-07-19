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
  const [genders, setGenders] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [brands, setBrands] = useState([]);

  // Function to fetch initial data
  const fetchInitialData = () => {
    const jsonData = document.getElementById("data")?.textContent;
    if (jsonData) {
      try {
        const parsedData = JSON.parse(jsonData);
        setProducts(parsedData.products);
        setCategories(parsedData.filters.categories);
        setBrands(parsedData.filters.brands);
        setSizes(parsedData.filters.sizes);
        setGenders(parsedData.filters.genders);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    } else {
      console.warn("No data found in the element with id 'data'");
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Function to fetch products based on filters
  const fetchProducts = async (options) => {
    try {
      const response = await axiosInstance.get(`/product/filter/`, {
        params: {
          category: categoryid,
          genders: options.checkedGenders,
          subcategories: options.checkedCategories,
          brands: options.checkedBrands,
          sizes: options.checkedSizes,
        },
      });
      setProducts(response.data);
    } catch (error) {
      console.error("Error filtering products: ", error);
    }
  };

  return (
    <>
      <Grid container spacing={2} sx={{ py: "60px" }}>
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
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: "bold" }}
            component={"div"}
            textTransform={"uppercase"}
          >
            Filters
          </Typography>
          <FilterList
            genders={genders}
            categories={categories}
            brands={brands}
            sizes={sizes}
            fetchproducts={fetchProducts}
          />
        </Grid>
        <Grid item xl={9} lg={9} md={9} sm={12} xs={12}>
          <Grid
            container
            justifyContent={"flex-start"}
            alignItems={"center"}
            spacing={3}
            px={4}
          >
            {products.length > 0 ? (
              products.map((product) => (
                <Grid item xl={3} lg={3} md={3} sm={3} xs={4} key={product.id}>
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    image={
                      product.images && product.images.length > 0
                        ? product.images[0].name
                        : ""
                    }
                    brand={product.brand.name}
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
