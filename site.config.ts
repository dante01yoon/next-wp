type SiteConfig = {
  site_domain: string;
  site_name: string;
  site_description: string;
};

export const siteConfig: SiteConfig = {
  site_name: process.env.NEXT_SITE_NAME || "default-site-name",
  site_description: process.env.NEXT_SITE_DESCRIPTION || "default description",
  site_domain: process.env.SITE_DOMAIN || "https://default-domain.com",
};
