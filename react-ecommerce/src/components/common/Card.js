import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { styled, alpha } from "@mui/material";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@mui/icons-material/FavoriteOutlined";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

const CustomCard = styled(Card)(({ theme }) => ({
  boxShadow: "none",
  borderRadius: "none",
  "&:hover": {
    backgroundColor: "none",
  },
}));

export default function ProductCard({ id, name, price, image, brand }) {
  return (
    <CustomCard key={id}>
      <CardActionArea>
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
          <CardActions>
            <Tooltip title="wishlist">
              <IconButton>
                <FavoriteBorderOutlinedIcon />
              </IconButton>
            </Tooltip>
          </CardActions>
        </CardContent>
      </CardActionArea>
    </CustomCard>
  );
}
