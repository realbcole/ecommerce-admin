import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Spinner from './Spinner';
import { ReactSortable } from 'react-sortablejs';

const ProductForm = ({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: existingProperties,
}) => {
  const [title, setTitle] = React.useState(existingTitle || '');
  const [description, setDescription] = React.useState(
    existingDescription || ''
  );
  const [images, setImages] = useState(existingImages || []);
  const [price, setPrice] = useState(existingPrice || '');
  const [goToProducts, setGoToProducts] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(
    existingCategory || { name: 'uncategorized' }
  );
  const [productProperties, setProductProperties] = useState(
    existingProperties || {}
  );

  const router = useRouter();

  useEffect(() => {
    axios.get('/api/categories').then((result) => {
      setCategories(result.data);
    });
  }, []);

  const saveProduct = async (e) => {
    e.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
    };
    if (_id) {
      //update
      await axios.put('/api/products', { ...data, _id });
    } else {
      //create
      await axios.post('/api/products', data);
    }
    setGoToProducts(true);
  };

  if (goToProducts) {
    router.push('/products');
  }

  const uploadImages = async (e) => {
    const files = e.target?.files;
    if (!files?.length) return;
    setIsUploading(true);
    const formData = new FormData();
    for (const file of files) {
      formData.append('file', file);
    }
    const res = await axios.post('/api/upload', formData);
    setImages((oldImages) => {
      return [...oldImages, ...res.data.links];
    });
    setIsUploading(false);
  };

  const updateImagesOrder = (newImages) => {
    setImages(newImages);
  };

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let selectedCategory = categories.find(({ _id }) => _id === category._id);
    if (selectedCategory?.properties) {
      propertiesToFill.push(...selectedCategory?.properties);
      while (selectedCategory?.parent?._id) {
        const parentCategory = categories.find(
          ({ _id }) => _id === selectedCategory?.parent?._id
        );
        propertiesToFill.push(...parentCategory.properties);
        selectedCategory = parentCategory;
      }
    }
  }

  const setProductProps = (propName, value) => {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      console.log(newProductProps);
      return newProductProps;
    });
  };

  return (
    <form onSubmit={saveProduct} className="flex flex-col">
      <label>Product Name</label>
      <input
        type="text"
        placeholder="Product Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded-lg mb-2 w-full"
      />
      <label>Category</label>
      <select
        value={category?._id}
        onChange={(e) =>
          setCategory(categories.find(({ _id }) => _id === e.target.value))
        }
      >
        <option value="uncategorized">Uncategorized</option>
        {categories.length > 0 &&
          categories.map((category) => (
            <option value={category._id} key={category._id}>
              {category.name}
            </option>
          ))}
      </select>
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((property) => (
          <div className="flex gap-1" key={property._id}>
            <div>
              {property.name[0].toUpperCase() + property.name.substring(1)}
            </div>
            <select
              value={productProperties[property.name] || ''}
              onChange={(e) => setProductProps(property.name, e.target.value)}
            >
              <option value=""></option>
              {property.values.map((value) => (
                <option value={value} key={value}>
                  {value[0].toUpperCase() + value.substring(1)}
                </option>
              ))}
            </select>
          </div>
        ))}
      <label>Photos</label>
      <div className="flex flex-wrap gap-2 items-center">
        <ReactSortable
          list={images}
          setList={updateImagesOrder}
          className="flex flex-wrap gap-1 items-center"
        >
          {!!images?.length &&
            images.map((link) => (
              <div key={link} className="w-32 h-fit mt-2 mb-4">
                <img src={link} alt="Product Image" className="rounded-lg" />
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="w-32 h-32 flex items-center justify-center rounded-lg">
            <Spinner className="mx-auto" />
          </div>
        )}
        <label className="w-32 h-32 flex items-center justify-center rounded-lg bg-extraDetails cursor-pointer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Upload</div>
          <input type="file" className="hidden" onChange={uploadImages} />
        </label>
      </div>
      <label>Description</label>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <label>Price (in USD)</label>
      <input
        type="text"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
};

export default ProductForm;
