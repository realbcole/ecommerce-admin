import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import Spinner from '../components/Spinner';

// Orders Page
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // On start, get all orders
  useEffect(() => {
    setLoading(true);
    loadOrders().then(() => setLoading(false));
  }, []);

  async function loadOrders() {
    let orders;
    await axios.get('/api/orders').then((response) => {
      orders = response.data;
    });
    for (const order of orders) {
      const productIds = order.line_items.map(
        (item) => item.price_data.product
      );
      let products;
      await axios.get(`/api/products?ids=${productIds}`).then((response) => {
        products = response.data;
      });
      const productsMap = {};
      for (const product of products) {
        productsMap[product._id] = product;
      }

      let subTotal = 0;
      for (const line of order.line_items) {
        const price = line.price_data.unit_amount / 100;
        subTotal += price * line.quantity;
      }

      order.subTotal = subTotal;

      order.line_items = order.line_items.map((item) => {
        return {
          ...item,
          price_data: {
            ...item.price_data,
            product_data: {
              name: productsMap[item.price_data.product.toString()]?.title,
            },
          },
        };
      });
    }
    setOrders(orders);
    setLoading(false);
  }

  return (
    <Layout>
      <h1>Orders</h1>
      {loading ? (
        <Spinner className="mt-16" />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.length > 0 &&
            orders.map((order) => (
              <div
                key={order._id}
                className="bg-secondaryBg rounded-md p-4 text-primaryDark max-w-lg text-sm md:text-md"
              >
                <time className="font-bold">
                  {new Date(order.createdAt).toLocaleString()}
                </time>
                <div className="flex justify-between flex-wrap">
                  <div className="flex flex-col justify-between">
                    <div>
                      <p>{order.name}</p>
                      <p>{order.email}</p>
                      <p>{order.streetAddress}</p>
                      <p>
                        {order.city} {order.state} {order.zipCode}
                      </p>
                      <p>{order.country}</p>
                    </div>
                    <p
                      className={`${
                        order.paid ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {order.paid ? 'Paid' : 'Not Paid'}
                    </p>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <div>
                      {order.line_items.map((line) => (
                        <div
                          key={line.price_data.product_data?.name}
                          className="text-right"
                        >
                          {line.price_data.product_data?.name} x {line.quantity}
                        </div>
                      ))}
                    </div>
                    <p className="font-bold">TOTAL ${order.subTotal}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </Layout>
  );
};

export default OrdersPage;

{
  /* <table className="basic">
<thead>
  <tr>
    <th>Date</th>
    <th>Paid</th>
    <th>Recipient</th>
    <th>Products</th>
  </tr>
</thead>
<tbody>
  {orders.length > 0 &&
    orders.map((order) => (
      <tr
        key={order._id}
        className="text-center border border-primaryDark"
      >
        <td>{new Date(order.createdAt).toLocaleString()}</td>
        <td>{order.paid ? 'YES' : 'NO'}</td>
        <td>
          {order.name} {order.email} <br /> {order.city}{' '}
          {order.zipCode} {order.country}
          <br />
          {order.streetAddress}
        </td>
        <td>
          {order.line_items.map((line) => (
            <div key={line.price_data.product_data?.name}>
              {line.price_data.product_data?.name} x{line.quantity}
              <br />
            </div>
          ))}
          <p>TOTAL: ${order.subTotal}</p>
        </td>
      </tr>
    ))}
</tbody>
</table> */
}
