import React from 'react';
import Layout from '../../components/Layout';
import ProductForm from '../../components/ProductForm';

// New Product Page
const NewProduct = () => {
  return (
    <Layout>
      <h1>New Product</h1>
      <ProductForm />
    </Layout>
  );
};

export default NewProduct;
