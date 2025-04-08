import User from '../../models/user';
import Order from '../../models/order';
import Delivery from '../../models/delivery';
import Boom from 'boom';
import OrderSchema from './validations';

const Create = async (req, res, next) => {
  const input = req.body;
  input.items = input.items ? JSON.parse(input.items) : null;
  const { error } = OrderSchema.validate(input);

  if (error) {
    return next(Boom.badRequest(error.details[0].message));
  }

  const { user_id } = req.payload;

  try {
    const order = new Order({
      user: user_id,
      adress: input.address,
      items: input.items,
    });

    const savedData = await order.save();

    res.json(savedData);
  } catch (e) {
    next(e);
  }
};

const List = async (req, res, next) => {
  try {
    // Get all orders
    const orders = await Order.find({})
      .populate('user', '-password -__v')
      .populate('items');

    // For each order, check if it has been delivered
    const ordersWithDeliveryStatus = await Promise.all(
      orders.map(async (order) => {
        // Check if any delivery exists for this order with status "Delivered"
        const deliveries = await Delivery.find({
          order: order._id,
          delivery_status: 'Delivered'
        });

        // If there are any deliveries with status "Delivered", mark the order as delivered
        const orderObj = order.toObject();
        orderObj.deliveryStatus = deliveries.length > 0 ? 'Delivered' : 'Pending';
        
        return orderObj;
      })
    );

    res.json(ordersWithDeliveryStatus);
  } catch (e) {
    next(e);
  }
};

const GetMyOrders = async (req, res, next) => {
  const { user_id } = req.payload;

  try {
    // Get user's orders
    const orders = await Order.find({ user: user_id })
      .populate('items');

    // For each order, check if it has been delivered
    const ordersWithDeliveryStatus = await Promise.all(
      orders.map(async (order) => {
        // Check if any delivery exists for this order with status "Delivered"
        const deliveries = await Delivery.find({
          order: order._id,
          user: user_id,
          delivery_status: 'Delivered'
        });

        // If there are any deliveries with status "Delivered", mark the order as delivered
        const orderObj = order.toObject();
        orderObj.deliveryStatus = deliveries.length > 0 ? 'Delivered' : 'Pending';
        
        // Include the SDCs for this order
        orderObj.deliveries = deliveries;
        
        return orderObj;
      })
    );

    res.json(ordersWithDeliveryStatus);
  } catch (e) {
    next(e);
  }
};

export default {
  Create,
  List,
  GetMyOrders,
};
