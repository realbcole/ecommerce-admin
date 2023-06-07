import Layout from '@/components/Layout';
import ProductForm from '@/components/ProductForm';
import Spinner from '@/components/Spinner';
import axios from 'axios';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const EditProductPage = () => {
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const { id } = router.query;

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
        <div className="flex items-center justify-center mt-16">
          <Spinner />
        </div>
      ) : (
        <ProductForm {...productInfo} />
      )}
    </Layout>
  );
};

export default EditProductPage;
