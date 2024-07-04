import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";

export default function FilterList({
  categories,
  brands,
  sizes,
  fetchproducts,
}) {
  const [checkedCategories, setCheckedCategories] = React.useState([]);
  const [checkedBrands, setCheckedBrands] = React.useState([]);
  const [checkedSizes, setCheckedSizes] = React.useState([]);
  const [filterObjs, setFilterObjs] = React.useState([]);

  const handleToggle = (value, item) => () => {
    if (item === "categories") {
      const currentCategoryIndex = checkedCategories.indexOf(value);
      const newCheckedCategories = [...checkedCategories];
      if (currentCategoryIndex === -1) {
        newCheckedCategories.push(value);
      } else {
        newCheckedCategories.splice(currentCategoryIndex, 1);
      }
      setCheckedCategories(newCheckedCategories);
    } else if (item === "brands") {
      const currentBrandIndex = checkedBrands.indexOf(value);
      const newCheckedBrands = [...checkedBrands];
      if (currentBrandIndex === -1) {
        newCheckedBrands.push(value);
      } else {
        newCheckedBrands.splice(currentBrandIndex, 1);
      }
      setCheckedBrands(newCheckedBrands);
    } else {
      const currentSizeIndex = checkedSizes.indexOf(value);
      const newCheckedSizes = [...checkedSizes];
      if (currentSizeIndex === -1) {
        newCheckedSizes.push(value);
      } else {
        newCheckedSizes.splice(currentSizeIndex, 1);
      }
      setCheckedSizes(newCheckedSizes);
    }
  };

  React.useEffect(() => {
    fetchproducts({ checkedCategories, checkedBrands, checkedSizes });
  }, [checkedCategories, checkedBrands, checkedSizes]);

  React.useEffect(() => {
    if (categories && categories.length > 0) {
      setFilterObjs([
        { items: categories, name: "categories", id: 0 },
        { items: brands, name: "brands", id: 1 },
        { items: sizes, name: "sizes", id: 2 },
      ]);
    } else {
      setFilterObjs([
        { items: brands, name: "brands", id: 0 },
        { items: sizes, name: "sizes", id: 1 },
      ]);
    }
  }, [categories]);

  console.log(checkedBrands);
  console.log(checkedCategories);
  console.log(checkedSizes);
  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        position: "relative",
        overflow: "auto",
        maxHeight: 350,
        "& ul": { padding: 0 },
        scrollbarWidth: "none",
        borderRight: "0.5px solid #80808040",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        "-ms-overflow-style": "none", // IE and Edge
        "scrollbar-width": "none", // Firefox
      }}
      subheader={<li />}
    >
      {filterObjs.map((item) => (
        <li key={item.id}>
          <ul style={{ padding: "20px 0" }}>
            <ListSubheader>
              <Typography variant="subtitle2" textTransform={"uppercase"}>
                {item.name}
              </Typography>
            </ListSubheader>
            {item.items.map((value) => {
              const labelId = `checkbox-list-secondary-label-${value.id}`;
              return (
                <ListItem
                  key={value.id}
                  secondaryAction={
                    <Checkbox
                      edge="end"
                      onChange={handleToggle(value.id, item.name)}
                      checked={
                        item.name === "categories"
                          ? checkedCategories.indexOf(value.id) !== -1
                          : item.name === "brands"
                          ? checkedBrands.indexOf(value.id) !== -1
                          : checkedSizes.indexOf(value.id) !== -1
                      }
                      inputProps={{ "aria-labelledby": labelId }}
                    />
                  }
                  disablePadding
                >
                  <ListItemButton>
                    <ListItemText
                      id={labelId}
                      primary={value.name}
                      primaryTypographyProps={{ fontSize: "12px" }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </ul>
        </li>
      ))}
    </List>
  );
}
