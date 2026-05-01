const { ZodError } = require('zod');

/**
 * Dinamik Zod Validasyon Middleware'i
 *
 * Kullanım:
 *   router.post('/login', validate(adminLoginSchema), authController.login);
 *
 * @param {import('zod').ZodSchema} schema - Doğrulama için kullanılacak Zod şeması
 * @returns Express middleware fonksiyonu
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors
      .map((e) => e.message)
      .join(' | ');

    return res.status(400).json({
      success: false,
      error: 'VALIDATION_ERROR',
      message,
    });
  }

  // Şema tarafından parse edilen (trim, coerce, toLowerCase uygulanmış) veriyi yerleştir
  req.body = result.data;
  return next();
};

module.exports = { validate };
