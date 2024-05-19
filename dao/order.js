const Order = require('../models/order');
const userDao = require('./user');

module.exports = {};

module.exports.createOrder = async (userId, items, total) => {
    const newOrder = new Order({
        userId: userId,
        items: items,
        total: total
    })
    try {
        const savedOrder = await newOrder.save();
        return savedOrder;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports.getAllOrders = async () => {
    try {
        const foundOrders = await Order.find().lean();
        return foundOrders || [];
    } catch (error) {
        console.error('Could not retrieve orders:', error);
        throw error; // Throw the error for handling in the caller function
    }
}

module.exports.getAllOrdersForUserId = async (userId) => {
    try {
        const foundOrders = await Order.find({ userId: userId }).lean();
        return foundOrders || null;
    } catch (error) {
        console.error('Could not retrieve orders:', error);
        throw error; // Throw the error for handling in the caller function
    }
};


module.exports.getOrderById = async (id) => {
    const foundOrder = await Order.findOne({ _id: id }).populate('items').lean();
    return foundOrder || null;
}

module.exports.getUserForOrder = async (orderId) => {
    try {
        // get the order
        const order = await Order.findOne({ _id: orderId }).lean();

        //check if order exists
        if (!order) {
            return null;
        }

        // Fetch the user associated with the order
        const user = await userDao.getUserById(order.userId);

        return user;
    } catch (error) {
        console.error('Error fetching user for order: ', error);
        throw error;
    }
}