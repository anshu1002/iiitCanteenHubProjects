
const foodSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 1
        },
        category: {
            type: "string",
            minLength: 1
        },
        price: {
            type: "number",
            exclusiveMinimum: 0
        },
        rating: {
            type: "number",
            minimum: 0,
            maximum: 5
        }
    },
    required: ["name", "category", "price", "rating"],
    additionalProperties: false
};

const foodPatchSchema = {
    ...foodSchema,
    required: [],
    minProperties: 1
};

module.exports = { foodSchema, foodPatchSchema };
