import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { withSwal } from 'react-sweetalert2';
import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';
import DeleteIcon from '@/components/icons/DeleteIcon';

// Settings Page
const SettingsPage = ({ swal }) => {
  const [products, setProducts] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [shopName, setShopName] = useState('');
  const [coupons, setCoupons] = useState({});
  const [couponTypes, setCouponTypes] = useState({});
  const [couponApplyTo, setCouponApplyTo] = useState({});
  const [couponProduct, setCouponProduct] = useState({});
  const [couponCategory, setCouponCategory] = useState({});
  const [categories, setCategories] = useState([]);
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
    await axios.get(`/api/settings?name=shopName`).then((response) => {
      setShopName(response?.data?.value);
    });
    await axios.get(`/api/settings?name=coupons`).then((response) => {
      const coupons = response?.data?.value;
      setCoupons(coupons);
      const couponTypes = {};
      for (const coupon in coupons) {
        if (coupons.hasOwnProperty(coupon)) {
          const type = Object.keys(coupons[coupon])[0];
          couponTypes[coupon] = type;
        }
      }
      setCouponTypes(couponTypes);
    });
    await axios.get(`/api/categories`).then((response) => {
      setCategories(response.data);
    });
  }

  async function saveSettings() {
    setIsLoading(true);
    const processedCoupons = Object.keys(coupons).reduce((acc, couponName) => {
      const couponType = couponTypes[couponName];
      acc[couponName] = {
        [couponType]: coupons[couponName][couponType],
      };

      // Add currency when coupon type is amountOff
      if (couponType === 'amountOff') {
        acc[couponName].currency = 'usd';
      }

      acc[couponName].applyTo = couponApplyTo[couponName] || null;
      acc[couponName].product = couponProduct[couponName] || null;
      acc[couponName].category = couponCategory[couponName] || null;

      return acc;
    }, {});

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
    await axios.put('/api/settings', {
      name: 'coupons',
      value: processedCoupons,
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

  function addCoupon() {
    setCoupons((prev) => {
      let newCoupon = `newCoupon${Date.now()}`;
      return { ...prev, [newCoupon]: {} };
    });
    setCouponTypes((prev) => {
      let newCoupon = `newCoupon${Object.keys(prev)?.length || 1}`;
      return { ...prev, [newCoupon]: '' };
    });
    setCouponApplyTo((prev) => {
      let newCoupon = `newCoupon${Date.now()}`;
      return { ...prev, [newCoupon]: 'all' };
    });
    setCouponProduct((prev) => {
      let newCoupon = `newCoupon${Date.now()}`;
      return { ...prev, [newCoupon]: '' };
    });
    setCouponCategory((prev) => {
      let newCoupon = `newCoupon${Date.now()}`;
      return { ...prev, [newCoupon]: '' };
    });
  }

  function handleCouponChange(couponName, newValues) {
    setCoupons((prev) => {
      let updatedCoupon = { ...prev[couponName], ...newValues };
      return { ...prev, [couponName]: updatedCoupon };
    });
  }

  function handleCouponNameChange(oldName, newName) {
    setCoupons((prev) => {
      // Create a new object to avoid mutating the state directly
      const newCoupons = { ...prev };

      // Create new coupon with new name
      newCoupons[newName] = newCoupons[oldName];

      // Delete old coupon
      delete newCoupons[oldName];

      return newCoupons;
    });
    setCouponTypes((prev) => {
      const newCouponTypes = { ...prev };
      newCouponTypes[newName] = newCouponTypes[oldName];
      delete newCouponTypes[oldName];
      return newCouponTypes;
    });
  }

  function removeCoupon(couponName) {
    setCoupons((prev) => {
      const coupons = { ...prev };
      delete coupons[couponName];
      return coupons;
    });
    setCouponTypes((prev) => {
      const newCouponTypes = { ...prev };
      delete newCouponTypes[couponName];
      return newCouponTypes;
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
          {/* Coupons */}
          <div className="">
            <label>Coupons</label>
            <button className="btn-default block" onClick={addCoupon}>
              Add Coupon
            </button>
            {coupons &&
              typeof coupons === 'object' &&
              Object.keys(coupons).map((couponName, index) => (
                <div key={index}>
                  <h2 className="uppercase flex items-center text-xl mb-2">
                    Coupon
                    <div className="py-2 px-1">
                      <button
                        onClick={() => removeCoupon(couponName)}
                        className="text-secondaryBg flex items-center text-sm bg-secondary rounded-full py-1 px-2"
                      >
                        <DeleteIcon /> Delete
                      </button>
                    </div>
                  </h2>
                  <div className="flex gap-2">
                    <label>Code</label>
                    <input
                      type="text"
                      value={couponName.toUpperCase()}
                      onChange={(e) =>
                        handleCouponNameChange(
                          couponName,
                          e.target.value.toUpperCase()
                        )
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <label className="whitespace-nowrap">Apply To</label>
                    <select
                      value={couponApplyTo[couponName] || 'all'}
                      onChange={(e) => {
                        setCouponApplyTo((prev) => {
                          const newCouponApplyTo = { ...prev };
                          newCouponApplyTo[couponName] = e.target.value;
                          return newCouponApplyTo;
                        });
                      }}
                    >
                      <option value="all">All Products</option>
                      <option value="product">Product</option>
                      <option value="category">Category</option>
                    </select>
                  </div>
                  {couponApplyTo[couponName] === 'product' && (
                    <div className="flex gap-2">
                      <label className="whitespace-nowrap">Product</label>
                      <select
                        value={couponProduct[couponName] || ''}
                        onChange={(e) => {
                          setCouponProduct((prev) => {
                            const newCouponProduct = { ...prev };
                            newCouponProduct[couponName] = e.target.value;
                            return newCouponProduct;
                          });
                        }}
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option value={product._id} key={product._id}>
                            {product.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {couponApplyTo[couponName] === 'category' && (
                    <div className="flex gap-2">
                      <label className="whitespace-nowrap">Category</label>
                      <select
                        value={couponCategory[couponName] || ''}
                        onChange={(e) => {
                          setCouponCategory((prev) => {
                            const newCouponCategory = { ...prev };
                            newCouponCategory[couponName] = e.target.value;
                            return newCouponCategory;
                          });
                        }}
                      >
                        <option value="">Select Category</option>
                        {categories.map((category) => (
                          <option value={category._id} key={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <label className="whitespace-nowrap">Coupon Type</label>
                    <select
                      value={couponTypes[couponName] || ''}
                      onChange={(e) => {
                        setCouponTypes((prev) => {
                          const newCouponTypes = { ...prev };
                          newCouponTypes[couponName] = e.target.value;
                          return newCouponTypes;
                        });
                      }}
                    >
                      <option value="">Select Coupon Type</option>
                      <option value="percentOff">Percent Off</option>
                      <option value="amountOff">Amount Off</option>
                    </select>
                  </div>
                  {couponTypes[couponName] && couponTypes[couponName] != '' && (
                    <>
                      {couponTypes[couponName] === 'amountOff' ? (
                        <div className="flex gap-2">
                          <label className="whitespace-nowrap">
                            Amount Off (USD)
                          </label>
                          <input
                            type="number"
                            value={coupons[couponName].amountOff}
                            onChange={(e) =>
                              handleCouponChange(couponName, {
                                amountOff: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <label className="whitespace-nowrap">
                            Percent Off (%)
                          </label>
                          <input
                            type="number"
                            value={coupons[couponName].percentOff}
                            onChange={(e) =>
                              handleCouponChange(couponName, {
                                percentOff: e.target.value,
                              })
                            }
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
          </div>
          {/* Save button */}
          <button className="btn-primary mt-2" onClick={saveSettings}>
            Save
          </button>
        </>
      )}
    </Layout>
  );
};

export default withSwal(({ swal }) => <SettingsPage swal={swal} />);
