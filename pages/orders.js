import Layout from '@/components/Layout';
import Spinner from '@/components/Spinner';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <div className="flex items-center justify-center mt-16">
          <Spinner />
        </div>
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
                <tr key={order._id} className="text-center">
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
