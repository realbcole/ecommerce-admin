const { Schema, models, model } = require('mongoose');

const OrderSchema = new Schema(
  {
    line_items: Object,
    name: String,
    email: String,
    streetAddress: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    paid: Boolean,
  },
  {
    timestamps: true,
  }
);

export const Order = models?.Order || model('Order', OrderSchema);
