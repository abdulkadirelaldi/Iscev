const CorporateContent = require('../../models/CorporateContent.model');

const ALLOWED_SECTIONS = ['heroStats', 'values', 'milestones', 'globalStats', 'regions', 'certs'];

const createError = (message, statusCode, code) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
};

const getContent = async () => {
  return CorporateContent.getInstance();
};

const updateSection = async (sectionKey, items) => {
  if (!ALLOWED_SECTIONS.includes(sectionKey)) {
    throw createError(
      `Geçersiz bölüm anahtarı. İzin verilenler: ${ALLOWED_SECTIONS.join(', ')}`,
      400,
      'VALIDATION_ERROR'
    );
  }

  if (!Array.isArray(items)) {
    throw createError('items bir dizi olmalıdır.', 400, 'VALIDATION_ERROR');
  }

  const doc = await CorporateContent.getInstance();
  doc[sectionKey] = items;
  doc.markModified(sectionKey);
  await doc.save();
  return doc;
};

module.exports = { getContent, updateSection };
