import Joi from 'joi';

const ReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().min(5).required(),
  product_id: Joi.string().required(),
});

export default ReviewSchema;
