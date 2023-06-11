import { Product } from '@/models/Product';
import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
const stripe = require('stripe')(process.env.STRIPE_SK);

export default async function handler(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Add product
  if (req.method === 'POST') {
    const { title, description, price, images, category, properties } =
      req.body;

    // Create the product in database
    const productDoc = await Product.create({
      title,
      description,
      price,
      images,
      category,
      properties,
      stripePriceId: '',
    });

    // Create the product in Stripe
    const product = await stripe.products.create({
      name: title,
      id: productDoc._id.toString(),
    });

    // Always verify if the product is created successfully before creating a price
    if (product && product.id) {
      const stripePrice = await stripe.prices.create({
        unit_amount: price * 100, // Price needs to be in cents
        currency: 'usd',
        product: product.id,
      });

      // update productDoc with stripe product and price id
      productDoc.stripePriceId = stripePrice.id;
      await productDoc.save();

      res.json(productDoc);
    } else {
      // Return an error message if the product is not created successfully
      res.status(500).json({ error: 'Failed to create product in Stripe.' });
    }
  }

  // Update product
  if (req.method === 'PUT') {
    const { title, description, price, images, category, properties, _id } =
      req.body;

    // Fetch the product from the database
    let productDoc = await Product.findOne({ _id });

    // Fetch the product from Stripe
    let stripeProduct;
    try {
      if (productDoc.stripeProductId) {
        // add this line
        stripeProduct = await stripe.products.retrieve(
          productDoc.stripeProductId
        );
      }
    } catch (e) {
      console.log(e);
    }

    // Check if the product exists in Stripe
    if (!stripeProduct) {
      try {
        // Try to retrieve the product from Stripe
        stripeProduct = await stripe.products.retrieve(
          productDoc._id.toString()
        );
      } catch (e) {
        console.log(e);
      }

      // If the product doesn't exist, create the product on Stripe
      if (!stripeProduct) {
        try {
          stripeProduct = await stripe.products.create({
            name: title,
            id: productDoc._id.toString(),
          });

          productDoc.stripeProductId = stripeProduct.id;
          await productDoc.save();
        } catch (e) {
          console.log(e);
          res.status(500).json({ error: e.message });
          return;
        }
      }
    }

    // Check if the price has changed
    if (productDoc.price !== price) {
      // Create a new price in Stripe
      const newStripePrice = await stripe.prices.create({
        unit_amount: price * 100, // Price needs to be in cents
        currency: 'usd',
        product: stripeProduct.id,
      });

      // Update stripePriceId in database
      productDoc.stripePriceId = newStripePrice.id;
      await productDoc.save();
    }

    // Check if the title has changed
    if (productDoc.title !== title) {
      // Update the product in Stripe
      const updatedStripeProduct = await stripe.products.update(
        stripeProduct.id,
        {
          name: title,
        }
      );
    }

    await Product.updateOne(
      { _id },
      { title, description, price, images, category, properties }
    );

    res.json(true);
  }

  // Get products
  if (req.method === 'GET') {
    // If id is provided, get product by id
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    }
    // Else, get all products
    else {
      res.json(await Product.find());
    }
  }

  // Delete product
  if (req.method === 'DELETE') {
    // Fetch the product from the database
    const productDoc = await Product.findOne({ _id: req.query.id });

    // Delete the product from Stripe
    // Cannot delete products on stripe if it has prices, so set product to inactive instead
    await stripe.products.update(productDoc._id.toString(), { active: false });

    // Delete the product from the database
    await Product.deleteOne({ _id: req.query.id });

    res.json(true);
  }
}
