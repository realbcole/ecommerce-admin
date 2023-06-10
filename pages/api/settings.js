import { mongooseConnect } from '@/lib/mongoose';
import { isAdminRequest } from './auth/[...nextauth]';
import { Settings } from '@/models/Settings';
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

      const couponNamesToCreate = Object.keys(value).filter(
        (name) => !existingCouponNames.includes(name)
      );
      const couponNamesToDelete = existingCouponNames.filter(
        (name) => !Object.keys(value).includes(name)
      );
      const couponNamesToUpdate = Object.keys(value).filter((name) =>
        existingCouponNames.includes(name)
      );

      // Create new coupons
      for (const couponName of couponNamesToCreate) {
        const couponData = value[couponName];
        let newCoupon;
        if (couponData.percentOff) {
          newCoupon = await stripe.coupons.create({
            name: couponName,
            percent_off: couponData.percentOff,
          });
        } else if (couponData.amountOff) {
          newCoupon = await stripe.coupons.create({
            name: couponName,
            amount_off: couponData.amountOff * 100,
            currency: 'usd',
          });
        }
        console.log(`Created coupon ${newCoupon.name}`);

        // Create promotional code
        const promoCode = await stripe.promotionCodes.create({
          coupon: newCoupon.id,
          code: couponName,
        });
        console.log(`Created promo code ${promoCode.code}`);
      }

      // Update existing coupons
      for (const couponName of couponNamesToUpdate) {
        const couponData = value[couponName];
        const existingCoupon = stripeCoupons.data.find(
          (coupon) => coupon.name === couponName
        );
        if (existingCoupon) {
          // Delete the existing coupon
          await stripe.coupons.del(existingCoupon.id);
          console.log(`Deleted coupon ${existingCoupon.name}`);
          // Create new coupon with updated data
          let newCoupon;
          if (couponData.percentOff) {
            newCoupon = await stripe.coupons.create({
              name: couponName,
              percent_off: couponData.percentOff,
            });
          } else if (couponData.amountOff) {
            newCoupon = await stripe.coupons.create({
              name: couponName,
              amount_off: couponData.amountOff * 100,
              currency: 'usd',
            });
          }
          console.log(`Created coupon ${newCoupon.name}`);

          // Create promotional code
          const promoCode = await stripe.promotionCodes.create({
            coupon: newCoupon.id,
            code: couponName,
          });
          console.log(`Created promotional code ${promoCode.id}`);
        }
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
