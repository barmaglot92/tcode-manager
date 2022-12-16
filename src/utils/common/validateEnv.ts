import * as Joi from 'joi';
import { CommonConfig } from 'src/types/CommonConfig';

export const validateConfig = (value: CommonConfig) => {
  const s3ConfigSchema = Joi.object({
    creds: Joi.object({
      AWS_REGION: Joi.string().allow(null, ''),
      AWS_USER_KEY: Joi.string().required(),
      AWS_USER_SECRET_KEY: Joi.string().required(),
    }).required(),
    bucket: Joi.string().required(),
    endpoint: Joi.string().required(),
  });

  const schema = Joi.object({
    s3: Joi.object({
      source: s3ConfigSchema.required(),
      result: Joi.array().items(s3ConfigSchema).required(),
    }).required(),
  }).required();

  return schema.validate(value);
};
