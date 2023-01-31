import { I18n } from 'i18n';

import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const i18n = new I18n({

  locales: ['ar', 'en', 'es', 'fr', 'ha', 'hi', 'zn'],

  defaultLocale: 'en',

  directory: path.join(__dirname, '../', 'locales'),

});

export default i18n;
