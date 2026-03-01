const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const drinkSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
drinkSchema.plugin(toJSON);
drinkSchema.plugin(paginate);

/**
 * @typedef Drink
 */
const Drink = mongoose.model('Drink', drinkSchema);

module.exports = Drink;
