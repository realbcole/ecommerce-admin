import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { withSwal } from 'react-sweetalert2';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';

// Products Page
const ProductsPage = ({ swal }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // On start, load products
  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    axios.get('/api/products').then((reponse) => {
      setProducts(reponse.data);
      setLoading(false);
    });
  }

  function deleteProduct(product) {
    swal
      .fire({
        title: 'Are you sure?',
        text: `Do you want to delete ${product.title}?`,
        showCancelButton: true,
        cancelButtonText: 'Cancel',
        confirmButtonText: 'Yes, Delete!',
        background: '#E0FBFC',
        confirmButtonColor: '#293241',
        iconColor: '#293241',
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const { _id } = product;
          await axios.delete(`/api/products?id=${_id}`);
          fetchProducts();
        }
      });
  }

  return (
    <Layout>
      <Link href={'/products/new'} className="btn-primary">
        Add New Product
      </Link>
      {loading ? (
        <Spinner className="mt-16" />
      ) : (
        <table className="basic mt-4 border border-primaryDark">
          <thead>
            <tr className="text-center">
              <td>Product name</td>
              <td>Category</td>
              <td>Visibility</td>
              <td></td>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border border-primaryDark text-center"
              >
                <td className="">{product.title}</td>
                <td>{product?.category?.name}</td>
                <td>{product.hidden ? 'Hidden' : 'Shown'}</td>
                <td className="flex justify-center flex-wrap gap-1">
                  <Link
                    className="btn-primary flex items-center"
                    href={`/products/edit/${product._id}`}
                  >
                    <EditIcon />
                    Edit
                  </Link>
                  <button
                    className="btn-primary flex items-center"
                    onClick={() => deleteProduct(product)}
                  >
                    <DeleteIcon />
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default withSwal(({ swal }) => <ProductsPage swal={swal} />);
