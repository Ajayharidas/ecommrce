import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import { styled, alpha } from "@mui/material";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { axiosInstance } from "../axios/axios";
import { useNavigate } from "react-router-dom";

const CustomCard = styled(Card)(({ theme }) => ({
  boxShadow: "none",
  borderRadius: "0!important",
  border: "1px solid #80808063",
  "&:hover": {
    backgroundColor: "none",
  },
}));

export default function ProductCard({ id, slug, name, price, image, brand }) {
  const [user, setUser] = React.useState({});

  React.useEffect(() => {
    const localuserdata = JSON.parse(localStorage.getItem("user"));
    if (localuserdata) {
      setUser(localuserdata);
    }
  }, []);

  const handleWishlist = async (event, id) => {
    event.stopPropagation();
    try {
      if (user && user.is_authenticated) {
        const response = await axiosInstance.post(`/add_to_wishlist`, {
          product: id,
        });
        if (response) {
          console.log(response.data.message);
        }
      } else {
        alert("You need to logged in to perform this action....");
        window.location.href = `/accounts/login/`;
      }
    } catch (error) {
      console.error("Error adding item to wishlist...", error);
    }
  };
  return (
    <CustomCard
      key={id}
      onClick={() => {
        window.location.href = `/product/product/${brand}/${slug}`;
      }}
    >
      <CardMedia
        component="img"
        height="140"
        image={`/media/${image}`}
        alt={name}
        sx={{ objectFit: "contain" }}
      />
      <CardContent>
        <Typography
          gutterBottom
          variant="subtitle1"
          sx={{ fontWeight: "bold" }}
          component="div"
        >
          {brand}
        </Typography>
        <Typography gutterBottom variant="subtitle1" component="div">
          {name}
        </Typography>
        <Typography gutterBottom variant="subtitle2" component="div">
          Rs.{price}
        </Typography>
        <CardActions onClick={(e) => handleWishlist(e, id)}>
          <Tooltip title="wishlist">
            <IconButton>
              <FavoriteBorderOutlinedIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      </CardContent>
    </CustomCard>
  );
}
