import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { styled, alpha } from "@mui/material";

const CustomCard = styled(Card)(({ theme }) => ({
  boxShadow: "none",
  borderRadius: "none",
  "&:hover": {
    backgroundColor: "none",
  },
}));

export default function ProductCard({ id, name, price, image, description }) {
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
          <Typography gutterBottom variant="subtitle1" component="div">
            {name}
          </Typography>
          <Typography gutterBottom variant="subtitle2" component="div">
            Rs.{price}
          </Typography>
        </CardContent>
      </CardActionArea>
    </CustomCard>
  );
}
