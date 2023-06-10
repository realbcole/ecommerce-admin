import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';

// Orders Page
const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // On start, get all orders
  useEffect(() => {
    setLoading(true);
    axios.get('/api/orders').then((response) => {
      setOrders(response.data);
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <h1>Orders</h1>
      {loading ? (
        <Spinner className="mt-16" />
      ) : (
        <table className="basic">
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
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
};

export default OrdersPage;
