import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withSwal } from 'react-sweetalert2';

const SettingsPage = ({ swal }) => {
  const [products, setProducts] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [shopName, setShopName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      icon: 'success',
    });
  }

  return (
    <Layout>
      <h1>Settings</h1>
      {isLoading ? (
        <div className="mt-12 flex justify-center items-center">
          <Spinner />
        </div>
      ) : (
        <>
          <label>Shop Name</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
          />
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
          <label>Shipping fee (USD)</label>
          <input
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
          />
          <button className="btn-primary" onClick={saveSettings}>
            Save
          </button>
        </>
      )}
    </Layout>
  );
};

export default withSwal(({ swal }) => <SettingsPage swal={swal} />);
