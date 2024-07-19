import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Typography from "@mui/material/Typography";
import Checkbox from "@mui/material/Checkbox";

export default function FilterList({
  genders,
  categories,
  brands,
  sizes,
  fetchproducts,
}) {
  const [checkedCategories, setCheckedCategories] = React.useState([]);
  const [checkedBrands, setCheckedBrands] = React.useState([]);
  const [checkedSizes, setCheckedSizes] = React.useState([]);
  const [checkedGenders, setCheckedGenders] = React.useState([]);
  const [filterObjs, setFilterObjs] = React.useState([]);

  const handleToggle = (value, item) => () => {
    if (item === "genders") {
      const currentGenderIndex = checkedGenders.indexOf(value);
      const newCheckedGenders = [...checkedGenders];
      if (currentGenderIndex === -1) {
        newCheckedGenders.push(value);
      } else {
        newCheckedGenders.splice(currentGenderIndex, 1);
      }
      setCheckedGenders(newCheckedGenders);
    } else if (item === "categories") {
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
    fetchproducts({
      checkedGenders,
      checkedCategories,
      checkedBrands,
      checkedSizes,
    });
  }, [checkedGenders, checkedCategories, checkedBrands, checkedSizes]);

  React.useEffect(() => {
    const filterdata = [
      { items: genders, name: "genders", id: 0 },
      { items: categories, name: "categories", id: 1 },
      { items: brands, name: "brands", id: 2 },
      { items: sizes, name: "sizes", id: 3 },
    ].filter((value) => {
      return value.items && value.items.length > 0;
    });
    setFilterObjs(filterdata);
  }, [categories]);

  // console.log(checkedBrands);
  // console.log(checkedCategories);
  // console.log(checkedSizes);
  console.log(filterObjs);
  return filterObjs && filterObjs.length > 0 ? (
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
                        item.name === "genders"
                          ? checkedGenders.indexOf(value.id) !== -1
                          : item.name === "categories"
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
  ) : null;
}
