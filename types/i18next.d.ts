import 'i18next';
import common from '../locales/en/common.json';
import auth from '../locales/en/auth.json';
import listings from '../locales/en/listings.json';
import contact from '../locales/en/contact.json';
import about from '../locales/en/about.json';
import dashboard from '../locales/en/dashboard.json';
import filters from '../locales/en/filters.json';
import propertyForm from '../locales/en/property-form.json';
import propertyDetails from '../locales/en/property-details.json';
// import notifications from '../locales/en/notifications.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      auth: typeof auth;
      listings: typeof listings;
      contact: typeof contact;
      about: typeof about;
      dashboard: typeof dashboard;
      filters: typeof filters;
      "property-form": typeof propertyForm;
      "property-details": typeof propertyDetails;
      // notifications: typeof notifications;
    };
  }
}
