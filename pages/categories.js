import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withSwal } from 'react-sweetalert2';
import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';
import EditIcon from '@/components/icons/EditIcon';
import DeleteIcon from '@/components/icons/DeleteIcon';

// Categories Page
const CategoriesPage = ({ swal }) => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [parentCategory, setParentCategory] = useState('');
  const [editedCategory, setEditedCategory] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // On start, load categories
  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    await axios.get('/api/categories').then((result) => {
      setCategories(result.data);
      setLoading(false);
    });
  }

  async function saveCategory(e) {
    e.preventDefault();
    const data = {
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

  async function editCategory(category) {
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

  async function deleteCategory(category) {
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

  async function handlePropertyNameChange(index, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }
  async function handlePropertyValuesChange(index, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  async function removeProperty(indexToRemove) {
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
          <button
            type="button"
            onClick={addProperty}
            className="btn-default text-sm mb-2"
          >
            Add New Property
          </button>
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

export default withSwal(({ swal }, ref) => <CategoriesPage swal={swal} />);
