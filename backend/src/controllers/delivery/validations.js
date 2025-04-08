import Joi from 'joi';

const SDCValidationSchema = Joi.object({
  product_id: Joi.string().required(),
  sdc: Joi.string().required()
});

export default {
  SDCValidationSchema
}; 