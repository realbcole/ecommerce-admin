import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
import { Settings } from '@/models/Settings';
import { Product } from '@/models/Product';
import mongoose from 'mongoose';
const stripe = require('stripe')(process.env.STRIPE_SK);

export default async function handler(req, res) {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Update settings
  if (req.method === 'PUT') {
    const { name, value } = req.body;

    // Check if settings already exists
    let settingsDoc = await Settings.findOne({ name });

    // If exists, update
    if (settingsDoc) {
      settingsDoc.value = value;
      await settingsDoc.save();
    }
    // If not, create
    else {
      settingsDoc = await Settings.create({ name, value });
    }

    if (name === 'coupons') {
      const stripeCoupons = await stripe.coupons.list({});
      const existingCouponNames = stripeCoupons.data.map(
        (coupon) => coupon.name
      );

      const couponNamesToDelete = existingCouponNames.filter(
        (name) => !Object.keys(value).includes(name)
      );
      const couponNamesToUpdate = Object.keys(value);

      // Create/Update coupons
      for (const couponName of couponNamesToUpdate) {
        const couponData = value[couponName];
        const existingCoupon = stripeCoupons.data.find(
          (coupon) => coupon.name === couponName
        );

        if (existingCoupon) {
          // Delete the existing coupon
          await stripe.coupons.del(existingCoupon.id);
          console.log(`Deleted coupon ${existingCoupon.name}`);
        }

        const couponParams = {
          name: couponName,
          percent_off: couponData.percentOff,
        };

        if (couponData.amountOff) {
          couponParams.amount_off = couponData.amountOff * 100;
          couponParams.currency = 'usd';
        }

        if (couponData.category) {
          let products = await Product.find({
            $or: [
              {
                'category._id': new mongoose.Types.ObjectId(
                  couponData.category
                ),
              },
              {
                'category.parent': new mongoose.Types.ObjectId(
                  couponData.category
                ),
              },
            ],
          });

          products = products.map((product) => product._id.toString());
          couponParams.applies_to = {
            products: products,
          };
        }

        // If a specific product is provided
        if (couponData.product) {
          couponParams.applies_to = {
            products: [couponData.product],
          };
        }

        if (couponData.all) {
          const products = await Product.find({});
          couponParams.applies_to = {
            products: products,
          };
        }

        const newCoupon = await stripe.coupons.create(couponParams);
        console.log(`Created coupon ${newCoupon.name}`);

        // Create promotional code
        const promoCode = await stripe.promotionCodes.create({
          coupon: newCoupon.id,
          code: couponName,
        });
        console.log(`Created promotional code ${promoCode.id}`);
      }
      // Delete coupons
      for (const couponName of couponNamesToDelete) {
        const existingCoupon = stripeCoupons.data.find(
          (coupon) => coupon.name === couponName
        );
        if (existingCoupon) {
          await stripe.coupons.del(existingCoupon.id);
          console.log(`Deleted coupon ${existingCoupon.name}`);
        }
      }
    }

    res.json(settingsDoc);
  }

  // Get settings
  if (req.method === 'GET') {
    res.json(await Settings.findOne({ name: req.query.name }));
  }
}
