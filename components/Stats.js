import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import { subHours } from 'date-fns';

const Tile = ({ title, stat, dollars = false }) => {
  return (
    <div className="shadow-md p-4">
      <h3 className="text-grayPreset uppercase font-bold text-xs text-center">
        {title}
      </h3>
      <div className="text-3xl text-center p-2 text-primary font-bold">
        {dollars && '$'}
        {stat}
      </div>
    </div>
  );
};

const Stats = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    axios.get('/api/orders').then((res) => {
      setOrders(res.data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center mt-24">
        <Spinner />
      </div>
    );
  }

  const ordersToday = orders?.filter(
    (order) => new Date(order.createdAt) > subHours(new Date(), 24)
  );

  const ordersWeek = orders?.filter(
    (order) => new Date(order.createdAt) > subHours(new Date(), 24 * 7)
  );

  const ordersMonth = orders?.filter(
    (order) => new Date(order.createdAt) > subHours(new Date(), 24 * 30)
  );

  const ordersYear = orders?.filter(
    (order) => new Date(order.createdAt) > subHours(new Date(), 24 * 365)
  );

  function ordersTotal(orders) {
    let total = 0;
    orders.forEach((order) => {
      const { line_items } = order;
      line_items.forEach((item) => {
        const lineTotal = (item.quantity * item.price_data.unit_amount) / 100;
        total += lineTotal;
      });
    });
    return new Intl.NumberFormat('en-US').format(total);
  }

  return (
    <div>
      <h2>Orders</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Tile title="Today" stat={ordersToday.length} />
        <Tile title="This Week" stat={ordersWeek.length} />
        <Tile title="This Month" stat={ordersMonth.length} />
        <Tile title="This Year" stat={ordersYear.length} />
      </div>
      <h2>Revenue</h2>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Tile title="Today" stat={ordersTotal(ordersToday)} dollars />
        <Tile title="This Week" stat={ordersTotal(ordersWeek)} dollars />
        <Tile title="This Month" stat={ordersTotal(ordersMonth)} dollars />
        <Tile title="This Year" stat={ordersTotal(ordersYear)} dollars />
      </div>
    </div>
  );
};

export default Stats;
