const Item = require('../models/item');

module.exports = {};

module.exports.createItem = async (title, price) => {
    const newItem = new Item({
        title: title,
        price: price
    })
    try {
        const savedItem = await newItem.save();
        return savedItem;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

module.exports.updateItemById = async (id, title, price) => {
    try {
        const item = await Item.findOne({ _id: id });
        
        if (!item) {
            throw new Error("Item not found!");
        }

        // update the item
        item.title = title;
        item.price = price;

        // save the item
        const updatedItem = await item.save();
        
        return updatedItem;
    } catch (error) {
        console.log(error);
        throw error;
    }
    
}

module.exports.getAllItems = async () => {
    const foundItems = await Item.find().lean();
    return foundItems || [];
}

module.exports.getItemById = async (id) => {
    const foundItem = await Item.findOne({ _id: id }).lean();
    return foundItem || null;
}