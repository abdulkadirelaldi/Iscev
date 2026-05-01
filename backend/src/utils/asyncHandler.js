/**
 * Express async hata yakalama sarmalayıcısı.
 * Controller'larda try/catch yazmaya gerek kalmadan async hataları
 * global error handler'a iletir.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
