import { mongooseConnect } from '../../lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
import { Settings } from '../../models/Settings';
import { Product } from '../../models/Product';
import mongoose from 'mongoose';
import { NextApiHandler } from 'next';
import {
  CouponType,
  ExistingCouponType,
  ProductType,
  SettingsType,
} from '../../types';
import Stripe from 'stripe';
const stripe = require('stripe')(process.env.STRIPE_SK);

const handler: NextApiHandler = async (req, res) => {
  await mongooseConnect();
  await isAdminRequest(req, res);

  // Update settings
  if (req.method === 'PUT') {
    const { name, value } = req.body;

    // Check if settings already exists
    let settingsDoc: SettingsType = await Settings.findOne({ name });

    // If exists, update
    if (settingsDoc) {
      settingsDoc.value = value;
      settingsDoc.save();
    }
    // If not, create
    else {
      settingsDoc = await Settings.create({ name, value });
    }

    // If coupons, create/update coupons in stripe
    if (name === 'coupons') {
      // Fetch all coupons from stripe
      const stripeCoupons: { data: { name: string }[] } =
        await stripe.coupons.list({});
      const existingCouponNames = stripeCoupons.data.map(
        (coupon: Stripe.Coupon) => coupon.name
      );

      // Find coupons to delete and update
      const couponNamesToDelete: string[] = existingCouponNames.filter(
        (name: string) => !Object.keys(value).includes(name)
      );
      const couponNamesToUpdate: string[] = Object.keys(value);

      // Create/Update coupons
      for (const couponName of couponNamesToUpdate) {
        // If coupon is already in stripe, fetch it
        const couponData: CouponType = value[couponName];
        const existingCoupon: ExistingCouponType = stripeCoupons.data.find(
          (coupon: ExistingCouponType) => coupon.name === couponData.code
        );

        // If coupon is already in stripe, delete it
        if (existingCoupon) {
          // Delete the existing coupon
          await stripe.coupons.del(existingCoupon.id);
          console.log(`Deleted coupon ${existingCoupon.name}`);
        }

        // Create the new coupon
        const couponParams: Stripe.CouponCreateParams = {
          name: couponData.code,
          percent_off: couponData.percentOff,
        };

        // If amount off is provided
        if (couponData.amountOff) {
          couponParams.amount_off = couponData.amountOff * 100;
          couponParams.currency = 'usd';
        }

        // Check if coupon is valid for all products, a specific product, or a specific category
        const applyTo: string = couponData.applyTo;

        // If all products are included
        if (applyTo === 'all') {
          // Find all products
          const products: ProductType[] = await Product.find({});
          // Add the products to the applies_to parameter
          couponParams.applies_to = {
            products: products.map((product: ProductType) =>
              product._id.toString()
            ),
          };
        }

        // If a specific product is included
        if (applyTo === 'product') {
          // Add the product to the applies_to parameter
          couponParams.applies_to = {
            products: [couponData.product],
          };
        }

        // If a specific category is included
        if (applyTo === 'category') {
          // Find all products in the category
          let products: ProductType[] = await Product.find({
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

          // Add the products to the applies_to parameter
          couponParams.applies_to = {
            products: products.map((product) => product._id.toString()),
          };
        }

        // Create the coupon
        const newCoupon: Stripe.Coupon = await stripe.coupons.create(
          couponParams
        );
        console.log(`Created coupon ${newCoupon.name}`);

        // Create promotional code
        const promoCode: Stripe.PromotionCode =
          await stripe.promotionCodes.create({
            coupon: newCoupon.id,
            code: couponData.code,
          });
        console.log(`Created promotional code ${promoCode.id}`);
      }
      // Delete coupons
      for (const couponName of couponNamesToDelete) {
        // If coupon is already in stripe, fetch it
        const existingCoupon: ExistingCouponType = stripeCoupons.data.find(
          (coupon: ExistingCouponType) => coupon.name === couponName
        );
        // If coupon is already in stripe, delete it
        if (existingCoupon) {
          try {
            await stripe.coupons.del(existingCoupon.id);
            console.log(`Deleted coupon ${existingCoupon.name}`);
          } catch (err) {
            console.log(`${existingCoupon.name} does not exist in stripe.`);
          }
        }
      }
    }

    res.json(settingsDoc);
  }

  // Get settings
  if (req.method === 'GET') {
    // If coupons, return an array of coupons
    if (req.query.name === 'coupons') {
      const settings: SettingsType = await Settings.findOne({
        name: req.query.name,
      });
      const coupons: string[] = Object.values(
        settings?.value || { coupons: {} }
      );
      res.json(coupons);
    }
    // Else, return the settings by name
    else {
      res.json(await Settings.findOne({ name: req.query.name }));
    }
  }
};

export default handler;
