const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'İSÇEV API',
      version:     '1.0.0',
      description: 'İSÇEV Arıtma ve Çevre Teknolojileri — RESTful API Dokümantasyonu',
      contact: {
        name:  'İSÇEV Teknik Ekip',
        email: 'info@iscev.com.tr',
      },
    },
    servers: [
      {
        url:         'http://localhost:5001/api/v1',
        description: 'Geliştirme Sunucusu',
      },
      {
        url:         'https://api.iscev.com.tr/api/v1',
        description: 'Prodüksiyon Sunucusu',
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in:   'cookie',
          name: 'iscev_token',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error:   { type: 'string',  example: 'VALIDATION_ERROR' },
            message: { type: 'string',  example: 'Alan zorunludur.' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            total:       { type: 'integer' },
            page:        { type: 'integer' },
            limit:       { type: 'integer' },
            totalPages:  { type: 'integer' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth',          description: 'Kimlik doğrulama işlemleri' },
      { name: 'Products',      description: 'Ürün yönetimi' },
      { name: 'Services',      description: 'Hizmet yönetimi' },
      { name: 'Categories',    description: 'Kategori yönetimi' },
      { name: 'Blogs',         description: 'Blog yönetimi' },
      { name: 'Catalogs',      description: 'Katalog yönetimi' },
      { name: 'References',    description: 'Referans yönetimi' },
      { name: 'MapLocations',  description: 'Harita pin yönetimi' },
      { name: 'Contact',       description: 'İletişim formu & mesajlar' },
      { name: 'Corporate',     description: 'Kurumsal içerik yönetimi' },
      { name: 'SiteSettings',  description: 'Site ayarları' },
      { name: 'Stats',         description: 'İstatistik verileri' },
      { name: 'Health',        description: 'Sistem durumu' },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
