import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withSwal } from 'react-sweetalert2';
import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';

// Settings Page
const SettingsPage = ({ swal }) => {
  const [products, setProducts] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [shopName, setShopName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // On start, load settings
  useEffect(() => {
    setIsLoading(true);
    loadSettings().then(() => setIsLoading(false));
  }, []);

  async function loadSettings() {
    await axios.get('/api/products').then((response) => {
      setProducts(response.data);
    });
    await axios.get(`/api/settings?name=featuredProductId`).then((response) => {
      setFeaturedProduct(response?.data?.value);
    });
    await axios.get(`/api/settings?name=shippingFee`).then((response) => {
      setShippingFee(response?.data?.value);
    });
  }

  async function saveSettings() {
    setIsLoading(true);
    await axios.put('/api/settings', {
      name: 'featuredProductId',
      value: featuredProduct,
    });
    await axios.put('/api/settings', {
      name: 'shippingFee',
      value: shippingFee,
    });
    await axios.put('/api/settings', {
      name: 'shopName',
      value: shopName,
    });
    setIsLoading(false);
    await swal.fire({
      title: 'Settings saved!',
      confirmButtonColor: '#293241',
      icon: 'success',
      iconColor: '#293241',
      background: '#E0FBFC',
    });
  }

  return (
    <Layout>
      <h1>Settings</h1>
      {isLoading ? (
        <Spinner className="mt-12" />
      ) : (
        <>
          <label>Shop Name</label>
          {/* Shop name input */}
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />
          {/* Featured product select */}
          <label className="mt-4">Featured Product</label>
          <select
            className=""
            value={featuredProduct}
            onChange={(e) => setFeaturedProduct(e.target.value)}
          >
            {products.map((product) => (
              <option value={product._id} key={product._id}>
                {product.title}
              </option>
            ))}
          </select>
          {/* Shipping fee input */}
          <label>Shipping fee (USD)</label>
          <input
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
          />
          {/* Save button */}
          <button className="btn-primary" onClick={saveSettings}>
            Save
          </button>
        </>
      )}
    </Layout>
  );
};

export default withSwal(({ swal }) => <SettingsPage swal={swal} />);
