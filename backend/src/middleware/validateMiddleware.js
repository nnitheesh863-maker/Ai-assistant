export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
      return res.status(400).json({
        success: false,
        error: `Validation error: ${errorMsg}`
      });
    }
    req.validatedBody = result.data;
    next();
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request payload format'
    });
  }
};
