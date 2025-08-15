declare module "process" {
  global {
    namespace NodeJS {
      interface ProcessEnv {
        WOOCOMMERCE_CONSUMER_KEY: string;
        WOOCOMMERCE_CONSUMER_SECRET: string;
        WOOCOMMERCE_URL: string;
      }
    }
  }
}