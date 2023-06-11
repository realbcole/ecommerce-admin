import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ReactSortable } from 'react-sortablejs';
import axios from 'axios';
import Image from 'next/image';
import Spinner from './Spinner';
import UploadIcon from './icons/UploadIcon';
import DeleteIcon from './icons/DeleteIcon';

// Product Form component
// For creating and editing products
const ProductForm = ({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: existingProperties,
  hidden: existingHidden,
}) => {
  const [title, setTitle] = React.useState(existingTitle || '');
  const [description, setDescription] = React.useState(
    existingDescription || ''
  );
  const [images, setImages] = useState(existingImages || []);
  const [price, setPrice] = useState(existingPrice || '');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(
    existingCategory || { name: 'uncategorized' }
  );
  const [productProperties, setProductProperties] = useState(
    existingProperties || {}
  );
  const [hidden, setHidden] = useState(existingHidden || false);
  const [isUploading, setIsUploading] = useState(false);

  const router = useRouter();

  // On start, fetch all categories
  useEffect(() => {
    axios.get('/api/categories').then((result) => {
      setCategories(result.data);
    });
  }, []);

  async function saveProduct(e) {
    e.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
      hidden,
    };
    if (_id) {
      //update product
      await axios.put('/api/products', { ...data, _id });
    } else {
      //create product
      await axios.post('/api/products', data);
    }
    router.push('/products');
  }

  async function uploadImages(e) {
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
  }

  function updateImagesOrder(newImages) {
    setImages(newImages);
  }

  function deleteImage(link) {
    setImages((oldImages) => {
      return oldImages.filter((image) => image !== link);
    });
  }

  function setProductProps(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      console.log(newProductProps);
      return newProductProps;
    });
  }

  // Get all properties for this product
  const properties = [];
  if (categories.length > 0 && category) {
    let selectedCategory = categories.find(({ _id }) => _id === category._id);
    if (selectedCategory?.properties) {
      properties.push(...selectedCategory?.properties);
      while (selectedCategory?.parent?._id) {
        const parentCategory = categories.find(
          ({ _id }) => _id === selectedCategory?.parent?._id
        );
        properties.push(...parentCategory.properties);
        selectedCategory = parentCategory;
      }
    }
  }

  return (
    <form onSubmit={saveProduct} className="flex flex-col">
      {/* Product Name */}
      <label>Product Name</label>
      <input
        type="text"
        placeholder="Product Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded-lg mb-2 w-full"
      />
      {/* Category */}
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
      {/* Properties */}
      <div>
        <label>Properties</label>
        {properties.length > 0 &&
          properties.map((property) => (
            <div
              className="flex gap-1 text-primaryDark my-1"
              key={property.name}
            >
              <p className="whitespace-nowrap">
                {property.name[0].toUpperCase() + property.name.substring(1)}
              </p>
              <select
                value={productProperties[property.name] || ''}
                onChange={(e) => setProductProps(property.name, e.target.value)}
                className="m-0"
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
      </div>
      {/* Photos */}
      <label>Photos</label>
      <div className="flex flex-wrap gap-2 items-center">
        <ReactSortable
          list={images}
          setList={updateImagesOrder}
          className="flex flex-wrap gap-1 items-center"
        >
          {images?.length &&
            images.map((link) => (
              <div
                key={link}
                className="w-32 h-32 bg-secondaryBg relative rounded-lg flex justify-center items-center"
              >
                <button
                  className="absolute text-secondary top-2 right-2 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteImage(link);
                  }}
                >
                  <DeleteIcon />
                </button>
                <div key={link} className="w-[100px] h-[100px] relative">
                  <Image
                    src={link.toString()}
                    alt="Product Image"
                    fill
                    style={{
                      objectFit: 'contain',
                    }}
                    sizes="100px"
                    priority
                  />
                </div>
              </div>
            ))}
        </ReactSortable>
        {isUploading && (
          <div className="w-32 h-32 flex items-center justify-center rounded-lg">
            <Spinner className="mx-auto" />
          </div>
        )}
        <label className="w-32 h-32 flex items-center justify-center rounded-lg bg-secondaryBg cursor-pointer">
          <UploadIcon />
          <div>Upload</div>
          <input type="file" className="hidden" onChange={uploadImages} />
        </label>
      </div>
      {/* Description */}
      <label>Description</label>
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      {/* Price */}
      <label>Price (in USD)</label>
      <input
        type="text"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      {/* Visibility */}
      <label>Visiblity</label>
      <select value={hidden} onChange={(e) => setHidden(e.target.value)}>
        <option value={false}>Shown</option>
        <option value={true}>Hidden</option>
      </select>
      {/* Save Button */}
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
};

export default ProductForm;
