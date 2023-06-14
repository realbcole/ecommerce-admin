import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withSwal } from 'react-sweetalert2';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';
import {
  CategoriesPageProps,
  CategoryFormProps,
  CategoryWithParentType,
  Property,
} from '../types';

// Categories Page
const CategoriesPage: React.FC<CategoriesPageProps> = ({ swal }) => {
  const [name, setName] = useState<string>('');
  const [categories, setCategories] = useState<CategoryWithParentType[]>([]);
  const [productCount, setProductCount] = useState<{
    _id: string;
    productCount: number;
  }>({ _id: '', productCount: 0 });
  const [parentCategory, setParentCategory] = useState<string>('');
  const [editedCategory, setEditedCategory] =
    useState<CategoryWithParentType>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // On start, load categories
  useEffect(() => {
    fetchCategories().then(() => setLoading(false));
  }, []);

  async function fetchCategories() {
    setLoading(true);
    let categoriesData = [];
    try {
      const result = await axios.get('/api/categories');
      categoriesData = result.data;
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error while fetching categories', err);
    }

    // Map categories to an array of promises
    const productCountPromises = categoriesData.map((category) =>
      axios.get(`/api/products?category=${category._id}`)
    );

    // Use Promise.all to wait for all requests
    let productCountResponses = [];
    try {
      productCountResponses = await Promise.all(productCountPromises);
    } catch (err) {
      console.error('Error while fetching product counts', err);
    }

    // Now you can safely set productCount state
    const newProductCount: {
      _id: string;
      productCount: number;
    } = { _id: '', productCount: 0 };
    productCountResponses.forEach((response, index) => {
      newProductCount[categoriesData[index]._id] = response.data.length;
    });
    setProductCount(newProductCount);
    console.log({ newProductCount });
    setLoading(false);
  }

  async function saveCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data: CategoryFormProps = {
      name,
      parentCategory,
      properties: properties.map((property) => ({
        name: property.name,
        values: property.values.split(','),
      })),
    };
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put(`/api/categories`, data);
      setEditedCategory(null);
    } else {
      await axios.post('/api/categories', data);
    }
    setName('');
    setParentCategory('');
    setProperties([]);
    fetchCategories();
  }

  async function editCategory(category: CategoryWithParentType) {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map(({ name, values }) => ({
        name,
        values: values.join(','),
      }))
    );
  }

  async function deleteCategory(category: CategoryWithParentType) {
    swal
      .fire({
        title: 'Are you sure?',
        text: `Do you want to delete ${category.name}?`,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Yes, Delete!',
        reverseButtons: true,
        background: '#E0FBFC',
        confirmButtonColor: '#293241',
        iconColor: '#293241',
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = category;
          await axios.delete(`/api/categories?_id=${_id}`);
          fetchCategories();
        }
      });
  }

  async function addProperty() {
    setProperties((prev) => {
      return [...prev, { name: '', values: '' }];
    });
  }

  async function handlePropertyNameChange(index: number, newName: string) {
    setProperties((prev) => {
      const properties: Property[] = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  async function handlePropertyValuesChange(index: number, newValues: string) {
    setProperties((prev) => {
      const properties: Property[] = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  async function removeProperty(indexToRemove: number) {
    setProperties((prev) => {
      return [...prev].filter((property, index) => {
        return index !== indexToRemove;
      });
    });
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit ${editedCategory.name} Category`
          : 'Create New Category'}
      </label>
      {/* Category input */}
      <form onSubmit={saveCategory} className="flex gap-1 flex-col">
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Category Name"
            onChange={(e) => setName(e.target.value)}
            value={name}
          />
          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          >
            <option value="">No parent category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option value={category._id} key={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        {/* Properties input */}
        <div className="mb-4">
          <label className="block">Properties</label>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div className="flex gap-1 mb-2" key={index}>
                <input
                  type="text"
                  value={property.name}
                  onChange={(e) =>
                    handlePropertyNameChange(index, e.target.value)
                  }
                  placeholder="Property Name (ex: Color)"
                  className="mb-0"
                />
                <input
                  type="text"
                  value={property.values}
                  onChange={(e) =>
                    handlePropertyValuesChange(index, e.target.value)
                  }
                  placeholder="Values, comma separated"
                  className="mb-0"
                />
                <button
                  onClick={() => removeProperty(index)}
                  type="button"
                  className="btn-default"
                >
                  Remove
                </button>
              </div>
            ))}
          {name ? (
            <button
              type="button"
              onClick={addProperty}
              className="btn-default text-sm mb-2"
            >
              Add New Property
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="btn-default text-sm mb-2 cursor-not-allowed"
            >
              Add New Property
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              onClick={() => {
                setEditedCategory(null);
                setName('');
                setParentCategory('');
                setProperties([]);
              }}
              className="btn-default"
            >
              Cancel
            </button>
          )}
          {/* Save button */}
          <button className="btn-primary py-1" type="submit">
            Save
          </button>
        </div>
      </form>
      {/* Categories table */}
      {loading ? (
        <Spinner className="mt-16" />
      ) : (
        <>
          {!editedCategory && (
            <table className="basic mt-4">
              <thead>
                <tr className="text-center">
                  <td>Category Name</td>
                  <td>Parent Category</td>
                  <td>Products</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {categories.length > 0 &&
                  categories.map((category) => (
                    <tr
                      key={category._id}
                      className="border border-primaryDark text-center"
                    >
                      <td>{category.name}</td>
                      <td>{category?.parent?.name}</td>
                      <td>{productCount[category._id] || 0}</td>
                      <td className="flex justify-end">
                        <button
                          onClick={() => editCategory(category)}
                          className="btn-primary mr-1 flex items-center"
                        >
                          <EditIcon />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(category)}
                          className="btn-primary flex items-center"
                        >
                          <DeleteIcon />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </Layout>
  );
};

export default withSwal(CategoriesPage);
