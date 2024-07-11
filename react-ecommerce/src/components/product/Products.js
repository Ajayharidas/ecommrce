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
  console.log(products);

  const fetchproducts = async (options) => {
    try {
      await axiosInstance
        .get(`/product/filter/`, {
          params: {
            category: categoryid,
            subcategories: options.checkedCategories,
            brands: options.checkedBrands,
            sizes: options.checkedSizes,
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
            filters
          </Typography>
          <FilterList
            categories={categories}
            brands={brands}
            sizes={sizes}
            fetchproducts={fetchproducts}
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
            {products && products.length > 0 ? (
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
