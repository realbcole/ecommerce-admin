import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import ProductForm from '../../../components/ProductForm';
import Spinner from '../../../components/Spinner';

// Edit Product Page
const EditProductPage = () => {
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const { id } = router.query;

  // When the id changes, fetch the product info
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/api/products?id=${id}`).then((response) => {
      setProductInfo(response.data);
      setLoading(false);
    });
  }, [id]);

  return (
    <Layout>
      <h1>Edit Product</h1>
      {loading ? (
        <Spinner className="mt-16" />
      ) : (
        <ProductForm {...productInfo} />
      )}
    </Layout>
  );
};

export default EditProductPage;
