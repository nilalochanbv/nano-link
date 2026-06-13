import { BadRequestError } from '../utils/errors.js';

const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    // Assign validated values back to request to prevent un-sanitized access
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    
    next();
  } catch (err) {
    if (err.errors) {
      const errorMsg = err.errors
        .map((e) => `${e.path.slice(1).join('.')}: ${e.message}`)
        .join(', ');
      
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: err.errors.map(e => ({
          field: e.path.slice(1).join('.'),
          message: e.message
        }))
      });
    }
    next(err);
  }
};

export default validate;
