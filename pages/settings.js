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

  // Load settings
  async function loadSettings() {
    // Get products
    await axios.get('/api/products').then((response) => {
      setProducts(response.data);
    });
    // Get featured product setting
    await axios.get(`/api/settings?name=featuredProductId`).then((response) => {
      setFeaturedProduct(response?.data?.value);
    });
    // Get shipping fee setting
    await axios.get(`/api/settings?name=shippingFee`).then((response) => {
      setShippingFee(response?.data?.value);
    });
    // Get shop name setting
    await axios.get(`/api/settings?name=shopName`).then((response) => {
      setShopName(response?.data?.value);
    });
    // Get coupons setting
    await axios.get(`/api/settings?name=coupons`).then((response) => {
      const couponsArray = response?.data?.value || [];
      const coupons = {};
      const couponTypes = {};
      const couponApplyTo = {};
      const couponProduct = {};
      const couponCategory = {};
      // Convert coupons array to object
      for (const coupon of couponsArray) {
        const type = Object.keys(coupon.details)[0];
        coupons[coupon.code] = {
          type,
          applyTo: coupon.applyTo || 'all',
          product: coupon.product || '',
          category: coupon.category || '',
          details: coupon.details,
          id: coupon.id,
        };
        couponTypes[coupon.code] = type;
        couponApplyTo[coupon.code] = coupon.applyTo || 'all';
        couponProduct[coupon.code] = coupon.product || '';
        couponCategory[coupon.code] = coupon.category || '';
      }
      // Update state
      setCoupons(coupons);
      setCouponTypes(couponTypes);
      setCouponApplyTo(couponApplyTo);
      setCouponProduct(couponProduct);
      setCouponCategory(couponCategory);
    });
    // Get categories
    await axios.get(`/api/categories`).then((response) => {
      setCategories(response.data);
    });
  }

  // Save settings
  async function saveSettings() {
    // Format coupon data
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
      acc[couponName].code = coupons[couponName].code;

      return acc;
    }, {});
    // Validate coupons
    for (let couponID in processedCoupons) {
      let coupon = coupons[couponID];
      if (!coupon.code) {
        await swal.fire({
          title: 'Missing fields!',
          text: 'Please provide a code for every coupon.',
          icon: 'error',
          confirmButtonColor: '#293241',
          iconColor: '#293241',
          background: '#E0FBFC',
        });
        return;
      }
      if (!coupon.amountOff && !coupon.percentOff) {
        await swal.fire({
          title: 'Missing fields!',
          text: 'Please provide either amount or percentage for the coupon.',
          icon: 'error',
          confirmButtonColor: '#293241',
          iconColor: '#293241',
          background: '#E0FBFC',
        });
        return;
      }
    }
    // Save settings
    setIsLoading(true);
    // Save featured product setting
    await axios.put('/api/settings', {
      name: 'featuredProductId',
      value: featuredProduct,
    });
    // Save shipping fee setting
    await axios.put('/api/settings', {
      name: 'shippingFee',
      value: shippingFee,
    });
    // Save shop name setting
    await axios.put('/api/settings', {
      name: 'shopName',
      value: shopName,
    });
    // Save coupons setting
    await axios.put('/api/settings', {
      name: 'coupons',
      value: processedCoupons,
    });
    setIsLoading(false);
    // Show success message
    await swal.fire({
      title: 'Settings saved!',
      confirmButtonColor: '#293241',
      icon: 'success',
      iconColor: '#293241',
      background: '#E0FBFC',
    });
  }

  // Add coupon
  function addCoupon() {
    // Create new coupon with unique ID
    const newCouponID = `COUPON${Date.now()}`;
    setCoupons((prev) => ({
      ...prev,
      [newCouponID]: {
        code: `newCoupon${Date.now()}`,
        type: '',
        applyTo: 'all',
        product: '',
        category: '',
        details: {},
        id: newCouponID,
      },
    }));
    // Set default values for coupon types
    setCouponTypes((prev) => ({ ...prev, [newCouponID]: '' }));
    setCouponApplyTo((prev) => ({ ...prev, [newCouponID]: 'all' }));
    setCouponProduct((prev) => ({ ...prev, [newCouponID]: '' }));
    setCouponCategory((prev) => ({ ...prev, [newCouponID]: '' }));
  }

  // Handle coupon data change
  function handleCouponChange(couponID, newValues) {
    setCoupons((prev) => {
      let updatedCoupon = { ...prev[couponID], ...newValues };
      return { ...prev, [couponID]: updatedCoupon };
    });
  }

  // Remove coupon
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
      <p className="text-primaryDark/50 text-sm">
        <span className="text-secondary">*</span> indicates a required field.
      </p>
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
          <label className="mt-4">
            Featured Product<span className="text-secondary">*</span>
          </label>
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
          {/* Coupons */}
          <div className="">
            <label>Coupons (Please add one at a time)</label>
            {coupons &&
              typeof coupons === 'object' &&
              Object.keys(coupons).map((couponName) => (
                <div key={couponName}>
                  <Coupon
                    coupon={coupons[couponName]}
                    couponName={couponName}
                    removeCoupon={removeCoupon}
                    handleCouponChange={handleCouponChange}
                    couponApplyTo={couponApplyTo}
                    setCouponApplyTo={setCouponApplyTo}
                    couponProduct={couponProduct}
                    setCouponProduct={setCouponProduct}
                    couponCategory={couponCategory}
                    setCouponCategory={setCouponCategory}
                    couponTypes={couponTypes}
                    setCouponTypes={setCouponTypes}
                    products={products}
                    categories={categories}
                  />
                </div>
              ))}
            <button className="btn-primary block" onClick={addCoupon}>
              Add Coupon
            </button>
          </div>
          {/* Shipping fee input */}
          <label>
            Shipping fee (USD)<span className="text-secondary">*</span>
          </label>
          <input
            type="number"
            value={shippingFee}
            onChange={(e) => setShippingFee(e.target.value)}
          />
          {/* Save button */}
          <button className="btn-primary mt-2" onClick={saveSettings}>
            Save
          </button>
        </>
      )}
    </Layout>
  );
};

// Coupon component
const Coupon = ({
  coupon,
  couponName,
  removeCoupon,
  handleCouponChange,
  couponApplyTo,
  setCouponApplyTo,
  couponProduct,
  setCouponProduct,
  couponCategory,
  setCouponCategory,
  couponTypes,
  setCouponTypes,
  products,
  categories,
}) => {
  const labelStyle = 'whitespace-nowrap text-secondaryBg';
  return (
    <div className="max-w-md bg-primaryDark rounded-md p-2 mb-2">
      <h2 className="uppercase flex items-center text-xl m-0 text-secondaryBg">
        Coupon
        <div className="py-2 px-1">
          {/* Delete coupon button */}
          <button
            onClick={() => removeCoupon(couponName)}
            className="text-secondaryBg flex items-center text-sm bg-secondary rounded-full py-1 px-2"
          >
            <DeleteIcon /> Delete
          </button>
        </div>
      </h2>
      <div className="flex gap-2">
        {/* Coupon code input */}
        <label className={labelStyle}>
          Code<span className="text-secondary">*</span>
        </label>
        <input
          type="text"
          value={coupon.code.toUpperCase()}
          onChange={(e) =>
            handleCouponChange(coupon.id, {
              code: e.target.value.toUpperCase(),
            })
          }
        />
      </div>
      <div className="flex gap-2">
        {/* Coupon apply to select */}
        <label className={labelStyle}>Apply To</label>
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
      {/* Coupon apply to product or category select */}
      {couponApplyTo[couponName] === 'product' && (
        <div className="flex gap-2">
          <label className={labelStyle}>
            Product<span className="text-secondary">*</span>
          </label>
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
          <label className={labelStyle}>
            Category<span className="text-secondary">*</span>
          </label>
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
      {/* Coupon type select */}
      <div className="flex gap-2">
        <label className={labelStyle}>
          Coupon Type<span className="text-secondary">*</span>
        </label>
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
      {/* Coupon amount off or percent off input */}
      {couponTypes[couponName] && couponTypes[couponName] != '' && (
        <>
          {couponTypes[couponName] === 'amountOff' ? (
            <div className="flex gap-2">
              <label className={labelStyle}>
                Amount Off (USD)
                <span className="text-secondary">*</span>
              </label>
              <input
                type="number"
                value={coupon.amountOff || 0}
                onChange={(e) =>
                  handleCouponChange(couponName, {
                    amountOff: e.target.value,
                  })
                }
              />
            </div>
          ) : (
            <div className="flex gap-2">
              <label className={labelStyle}>
                Percent Off (%)
                <span className="text-secondary">*</span>
              </label>
              <input
                type="number"
                value={coupon.percentOff || 0}
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
  );
};

export default withSwal(({ swal }) => <SettingsPage swal={swal} />);
