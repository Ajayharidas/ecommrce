import React, { useEffect, useState } from "react";
import { axiosInstance } from "../../axios/axios";

export default function CreateCategory() {
  const [categories, setCategories] = useState([]);
  const initialFormData = Object.freeze({
    category: null,
    parent: null,
  });
  const [formData, setFormData] = useState(initialFormData);
  useEffect(() => {
    try {
      const jsondata = document.getElementById("data")?.textContent;
      if (jsondata) {
        setCategories(JSON.parse(jsondata));
      }
    } catch (error) {
      console.error("Error in fetching data....", error);
    }
  }, []);
  console.log(formData);

  const handleChange = (event) => {
    setFormData((prevdata) => ({
      ...prevdata,
      [event.target.name]:
        event.target.value === "" ? null : event.target.value,
    }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post("/category/create", formData);
      if (response) {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error("Error creating new category...", error);
    }
  };

  return (
    <>
      <div>
        <form>
          <input
            type="text"
            placeholder="category name"
            value={formData.category}
            name="category"
            onChange={(e) => handleChange(e)}
          />
          <select
            name="parent"
            onChange={(e) => handleChange(e)}
            value={formData.parent}
          >
            <option value={""} selected>
              ----------------
            </option>
            {categories && categories.length > 0
              ? categories.map((category) => {
                  return <option value={category.id}>{category.name}</option>;
                })
              : null}
          </select>
          <button onClick={(e) => handleClick(e)}>save</button>
        </form>
      </div>
    </>
  );
}
