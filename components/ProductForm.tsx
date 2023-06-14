import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { NextRouter, useRouter } from 'next/router';
import { ReactSortable } from 'react-sortablejs';
import axios from 'axios';
import Image from 'next/image';
import Spinner from './Spinner';
import UploadIcon from './icons/UploadIcon';
import DeleteIcon from './icons/DeleteIcon';
import {
  CategoryType,
  CategoryWithParentType,
  ProductFormProps,
  PropertyType,
} from '../types';
import Link from 'next/link';

// Product Form component
// For creating and editing products
const ProductForm: React.FC<ProductFormProps> = ({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: existingProperties,
  hidden: existingHidden,
}) => {
  const [title, setTitle] = React.useState<string>(existingTitle || '');
  const [description, setDescription] = React.useState<string>(
    existingDescription || ''
  );
  const [images, setImages] = useState<{ id: string; src: string }[]>(
    existingImages?.map((src, index) => ({ id: `${index}`, src })) || []
  );
  const [price, setPrice] = useState<string>(existingPrice || '');
  const [categories, setCategories] = useState<CategoryWithParentType[]>([]);
  const [category, setCategory] = useState<CategoryWithParentType>(
    existingCategory || { name: 'uncategorized' }
  );
  const [productProperties, setProductProperties] = useState<PropertyType>(
    existingProperties || { name: '', values: [] }
  );
  const [hidden, setHidden] = useState<boolean>(existingHidden || false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean>(false);

  const router: NextRouter = useRouter();

  // On start, fetch all categories
  useEffect(() => {
    axios.get('/api/categories').then((result) => {
      setCategories(result.data);
    });
  }, []);

  useEffect(() => {
    // Form is valid if it has a title, price, and at least one image
    if (title && price && images.length > 0) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [title, price, images]);

  async function saveProduct(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isValid) {
      const processedImages = images.map((image) => image.src);
      const data = {
        title,
        description,
        price,
        images: processedImages,
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
  }

  async function uploadImages(e: ChangeEvent<HTMLInputElement>) {
    const files: FileList | null = e.target.files;
    if (!files?.length) return;
    setIsUploading(true);
    const formData: FormData = new FormData();
    for (const file of files) {
      formData.append('file', file);
    }
    const res: { data: { links: [] } } = await axios.post(
      '/api/upload',
      formData
    );
    setImages((oldImages) => {
      return [
        ...oldImages,
        ...res.data.links.map((src, index) => ({
          id: `${oldImages.length + index}`,
          src,
        })),
      ];
    });
    setIsUploading(false);
  }

  function updateImagesOrder(newImages: { id: string; src: string }[]) {
    setImages(newImages);
  }

  function deleteImage(id: string) {
    setImages((oldImages) => {
      return oldImages.filter((image) => image.id !== id);
    });
  }

  function setProductProps(propName: string, value: string) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  // Get all properties for this product
  const properties: PropertyType[] = [];
  if (categories.length > 0 && category) {
    let selectedCategory: CategoryWithParentType = categories.find(
      ({ _id }) => _id === category._id
    );
    if (selectedCategory?.properties) {
      properties.push(...selectedCategory?.properties);
      while (selectedCategory?.parent?._id) {
        const parentCategory: CategoryWithParentType = categories.find(
          ({ _id }) => _id === selectedCategory?.parent?._id
        );
        properties.push(...parentCategory.properties);
        selectedCategory = parentCategory;
      }
    }
  }

  return (
    <form onSubmit={saveProduct} className="flex flex-col">
      <p className="text-primaryDark/50 text-sm">
        <span className="text-secondary">*</span> indicates a required field.
      </p>
      {/* Product Name */}
      <label>
        <span className="text-secondary">*</span>Product Name
      </label>
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
      <label>
        <span className="text-secondary">*</span>Photos
      </label>
      <div className="flex flex-wrap gap-2 items-center">
        <ReactSortable
          list={images}
          setList={updateImagesOrder}
          className="flex flex-wrap gap-1 items-center"
        >
          {images?.length &&
            images.map(({ id, src }) => (
              <div
                key={id}
                className="w-32 h-32 bg-secondaryBg relative rounded-lg flex justify-center items-center"
              >
                <button
                  className="absolute text-secondary top-2 right-2 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    deleteImage(id);
                  }}
                >
                  <DeleteIcon />
                </button>
                <div className="w-[100px] h-[100px] relative">
                  <Image
                    src={src}
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
      <label>
        <span className="text-secondary">*</span>Price (in USD)
      </label>
      <input
        type="text"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      {/* Visibility */}
      <label>
        <span className="text-secondary">*</span>Visiblity
      </label>
      <select
        value={hidden ? 'true' : 'false'}
        onChange={(e) => setHidden(e.target.value === 'true')}
      >
        <option value={'false'}>Shown</option>
        <option value={'true'}>Hidden</option>
      </select>
      {!isValid && (
        <p className="text-secondary font-semibold">Missing required fields.</p>
      )}
      {/* Save/Cancel Buttons */}
      <div className="flex flex-wrap gap-1">
        <button type="submit" className="btn-primary w-24">
          Save
        </button>
        <Link href="/products" className="btn-default text-center w-24">
          Cancel
        </Link>
      </div>
    </form>
  );
};

export default ProductForm;
