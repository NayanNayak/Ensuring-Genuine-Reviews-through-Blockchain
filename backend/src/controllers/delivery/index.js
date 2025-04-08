import Delivery from '../../models/delivery';
import Order from '../../models/order';
import User from '../../models/user';
import Boom from 'boom';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Helper function to generate a unique Standard Delivery Code (SDC)
const generateSDC = () => {
  // Generate a random 8-character alphanumeric code
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

// Helper function to send email with SDC
const sendSDCEmail = async (email, sdc, productDetails) => {
  try {
    // Create a test account if no real email service is configured
    // In production, you would use your actual email service credentials
    const testAccount = await nodemailer.createTestAccount();

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true' || false,
      auth: {
        user: process.env.EMAIL_USER || testAccount.user,
        pass: process.env.EMAIL_PASS || testAccount.pass,
      },
    });

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"E-commerce Store" <noreply@ecommerce.com>',
      to: email,
      subject: 'Your Standard Delivery Code (SDC)',
      text: `Your order has been delivered! Your Standard Delivery Code (SDC) is: ${sdc}. Use this code when submitting a review for the product.`,
      html: `
        <h1>Your Order Has Been Delivered!</h1>
        <p>Your Standard Delivery Code (SDC) is: <strong>${sdc}</strong></p>
        <p>Use this code when submitting a review for the product.</p>
        <p>Product: ${productDetails}</p>
        <p>Thank you for shopping with us!</p>
      `,
    });

    console.log('Message sent: %s', info.messageId);
    // Preview URL only works with ethereal email
    if (testAccount.user === transporter.options.auth.user) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Mark an order as delivered and generate SDC
const MarkAsDelivered = async (req, res, next) => {
  const { order_id } = req.params;

  try {
    // Check if the order has already been delivered
    const existingDeliveries = await Delivery.find({
      order: order_id,
      delivery_status: 'Delivered'
    });

    if (existingDeliveries.length > 0) {
      return res.status(400).json({
        message: 'This order has already been marked as delivered',
        deliveries: existingDeliveries
      });
    }

    // Find the order
    const order = await Order.findById(order_id).populate('user').populate('items');
    
    if (!order) {
      return next(Boom.notFound('Order not found'));
    }

    // Get user email
    const user = await User.findById(order.user);
    
    if (!user) {
      return next(Boom.notFound('User not found'));
    }

    // Process each item in the order
    const deliveryPromises = order.items.map(async (productId) => {
      // Check if this product already has a delivery record for this order
      const existingDelivery = await Delivery.findOne({
        order: order._id,
        product: productId
      });

      if (existingDelivery) {
        // Update the existing delivery record
        existingDelivery.delivery_status = 'Delivered';
        
        // Generate a unique SDC if it doesn't have one
        if (!existingDelivery.standard_delivery_code) {
          existingDelivery.standard_delivery_code = generateSDC();
        }
        
        const updatedDelivery = await existingDelivery.save();
        
        // Send email notification with SDC
        await sendSDCEmail(user.email, updatedDelivery.standard_delivery_code, `Product ID: ${productId}`);
        
        return updatedDelivery;
      } else {
        // Generate a unique delivery ID
        const delivery_id = 'DEL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        // Generate a unique SDC
        const sdc = generateSDC();

        // Create a new delivery record
        const delivery = new Delivery({
          user: order.user,
          email: user.email,
          product: productId,
          order: order._id,
          delivery_id,
          standard_delivery_code: sdc,
          delivery_status: 'Delivered'
        });

        // Save the delivery record
        const savedDelivery = await delivery.save();

        // Send email notification with SDC
        await sendSDCEmail(user.email, sdc, `Product ID: ${productId}`);

        return savedDelivery;
      }
    });

    // Wait for all deliveries to be processed
    const deliveries = await Promise.all(deliveryPromises);

    res.json({
      message: 'Order marked as delivered and SDC generated successfully',
      deliveries
    });
  } catch (error) {
    next(error);
  }
};

// Verify SDC before allowing review submission
const VerifySDC = async (req, res, next) => {
  const { user_id } = req.payload;
  const { product_id, sdc } = req.body;

  try {
    // Check if there's a valid delivery with the provided SDC for this user and product
    const delivery = await Delivery.findOne({
      user: user_id,
      product: product_id,
      standard_delivery_code: sdc,
      delivery_status: 'Delivered'
    });

    if (!delivery) {
      return next(Boom.unauthorized('You are not authorized to review this product. Invalid SDC.'));
    }

    // If valid, attach a verification flag to the request for the next middleware
    req.sdcVerified = true;
    next();
  } catch (error) {
    next(error);
  }
};

// Get user's deliveries
const GetUserDeliveries = async (req, res, next) => {
  const { user_id } = req.payload;

  try {
    // Find all deliveries for this user
    const deliveries = await Delivery.find({ user: user_id })
      .populate('product')
      .populate('order')
      .sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (error) {
    next(error);
  }
};

export default {
  MarkAsDelivered,
  VerifySDC,
  GetUserDeliveries
}; 