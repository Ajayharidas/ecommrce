import React from "react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import CardMedia from "@mui/material/CardMedia";
import { axiosInstance } from "../axios/axios";
import { Typography, Tooltip, Button } from "@mui/material";

const Product = () => {
  const [product, setProduct] = React.useState(null);
  const [selectedImage, setSelectedImage] = React.useState(null);
  const sizeRef = React.useRef([]);
  const [newproduct, setNewproduct] = React.useState([]);
  const [go, setGo] = React.useState(false);

  React.useEffect(() => {
    const jsondata = document.getElementById("data")?.textContent;
    if (jsondata) {
      try {
        const parsedata = JSON.parse(jsondata);
        setProduct(parsedata);
        setSelectedImage(parsedata.images[0].path);
      } catch (error) {
        console.error("Error in fetching product data : ", error);
      }
    }
  }, []);

  const handleToCart = () => {
    console.log(newproduct);
    // const postcart = async () => {
    //   try {
    //     const response = await axiosInstance.post(`/add_to_cart`, {
    //       product: newproduct[0].product.id,
    //       size: newproduct[0].size,
    //     });
    //     if (response.status === 201) {
    //       console.log(response.data, response.status);
    //       setGo(true);
    //     }
    //   } catch (error) {
    //     console.error("Error updating cart product...", error);
    //   }
    // };

    if (newproduct.length > 0) {
      const localcartdata = JSON.parse(localStorage.getItem("cart"));

      if (localcartdata) {
        localStorage.setItem(
          "cart",
          JSON.stringify([...newproduct, ...localcartdata])
        );
      } else {
        localStorage.setItem("cart", JSON.stringify(newproduct));
      }
      // if (user && user.is_authenticated) {
      //   postcart();
      // }
    }
  };

  const handleSize = (product, size) => {
    console.log(product, size);
    setNewproduct([{ product: product, size: size }]);
    const localcartdata = JSON.parse(localStorage.getItem("cart"));
    if (localcartdata) {
      const exists = localcartdata.some((item) => {
        return item.product.id === product.id && item.size === size;
      });
      if (exists) {
        setGo(true);
        alert("You already have this item in the cart...");
      } else {
        setGo(false);
      }
    }

    sizeRef.current.forEach((element, index) => {
      if (element) {
        element.style.backgroundColor =
          index === size ? "rgb(25, 118, 210)" : "transparent";
        element.style.color = index === size ? "white" : "black";
      }
    });
  };

  return (
    <>
      {product ? (
        <Grid
          container
          sx={{ py: "60px", height: "40%" }}
          flexDirection={"row"}
          spacing={4}
        >
          <Grid
            item
            xl={6}
            sx={{
              maxWidth: {
                xl: "50%",
                lg: "50%",
                md: "50%",
                sm: "50%",
                xs: "100%",
              },
            }}
          >
            <Grid container sx={{ width: "100%", p: 0, m: 0 }}>
              <Grid
                item
                xl={10}
                lg={10}
                md={10}
                sm={10}
                xs={10}
                sx={{ width: "80%" }}
              >
                <CardMedia
                  component="img"
                  image={`/media/${selectedImage}`}
                  alt="Image 1"
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Grid>
              <Grid
                item
                xl={2}
                lg={2}
                md={2}
                sm={2}
                xs={2}
                sx={{
                  maxWidth: "20%",
                }}
              >
                {product.images.map((image) => {
                  return (
                    <CardMedia
                      key={image.id}
                      component="img"
                      image={`/media/${image.path}`}
                      alt="Image 1"
                      sx={{
                        width: "100%",
                        objectFit: "contain",
                        borderBottom: "0.25px solid grey",
                        opacity: selectedImage === image.path ? 0.6 : 1,
                      }}
                      onClick={() => setSelectedImage(image.path)}
                    />
                  );
                })}
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xl={6}
            lg={6}
            md={6}
            sm={6}
            xs={6}
            sx={{
              maxWidth: {
                xl: "50%",
                lg: "50%",
                md: "50%",
                sm: "50%",
                xs: "100%",
              },
            }}
          >
            <Grid container sx={{ width: "100%", p: 0, m: 0 }}>
              <Grid
                item
                xl={12}
                lg={12}
                md={12}
                sm={12}
                xs={12}
                px={{ xl: 26, xs: 10 }}
              >
                <Typography variant="h4">Sizes</Typography>
              </Grid>
              <Grid
                item
                xl={12}
                lg={12}
                md={12}
                sm={12}
                xs={12}
                display={"flex"}
                sx={{ width: "100%" }}
                px={{ xl: 25, xs: 10 }}
                justifyContent={"space-evenly"}
              >
                {product.sizes.map((size) => {
                  return (
                    <Tooltip
                      disableFocusListener
                      disableTouchListener
                      title={
                        size.stock > 0 ? `${size.stock} left` : "out of stock"
                      }
                    >
                      <Box
                        sx={{
                          border: "0.25px solid rgb(128 128 128)",
                          borderRadius: "15%",
                          padding: "2% 3%",
                          opacity: size.stock > 0 ? 1 : 0.4,
                        }}
                        ref={(e) => (sizeRef.current[size.id] = e)}
                        onClick={() =>
                          size.stock > 0 && handleSize(product, size.id)
                        }
                        onMouseEnter={(e) =>
                          size.stock > 0
                            ? (e.currentTarget.style.cursor = "pointer")
                            : (e.currentTarget.style.cursor = "not-allowed")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.cursor = "default")
                        }
                      >
                        <Typography variant="caption" key={size.id}>
                          {size.name}
                        </Typography>
                      </Box>
                    </Tooltip>
                  );
                })}
              </Grid>
              <Grid
                item
                xl={12}
                lg={12}
                md={12}
                sm={12}
                xs={12}
                display={"flex"}
                sx={{ width: "100%" }}
                px={{ xl: 25, xs: 10 }}
              >
                {go ? (
                  <Button>Go to cart</Button>
                ) : (
                  <Button onClick={handleToCart}>Add to cart</Button>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      ) : (
        <Grid
          container
          sx={{ py: "60px", height: "40%" }}
          flexDirection={"row"}
        >
          <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Typography variant="h4">Result not found.....</Typography>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default Product;
