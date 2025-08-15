// WooCommerce REST API v3 TypeScript Definitions
// Based on: https://woocommerce.github.io/woocommerce-rest-api-docs/?shell#products

export interface WooCommerceMetaData {
  id: number;
  key: string;
  value: string | number | boolean | object;
}

export interface WooCommerceImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
}

export interface WooCommerceDimensions {
  length: string;
  width: string;
  height: string;
}

export interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
}

export interface WooCommerceTag {
  id: number;
  name: string;
  slug: string;
}

export interface WooCommerceAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface WooCommerceDefaultAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooCommerceDownload {
  id: string;
  name: string;
  file: string;
}

export type ProductStatus = 'draft' | 'pending' | 'private' | 'publish';
export type ProductType = 'simple' | 'grouped' | 'external' | 'variable';
export type CatalogVisibility = 'visible' | 'catalog' | 'search' | 'hidden';
export type TaxStatus = 'taxable' | 'shipping' | 'none';
export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';
export type BackorderStatus = 'no' | 'notify' | 'yes';

export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: ProductType;
  status: ProductStatus;
  featured: boolean;
  catalog_visibility: CatalogVisibility;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  price_html: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: WooCommerceDownload[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: TaxStatus;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: StockStatus;
  backorders: BackorderStatus;
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: WooCommerceDimensions;
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: WooCommerceCategory[];
  tags: WooCommerceTag[];
  images: WooCommerceImage[];
  attributes: WooCommerceAttribute[];
  default_attributes: WooCommerceDefaultAttribute[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  meta_data: WooCommerceMetaData[];
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

export interface WooCommerceVariationAttribute {
  id: number;
  name: string;
  option: string;
}

export interface WooCommerceProductVariation extends Omit<WooCommerceProduct, 'variations' | 'grouped_products' | 'categories' | 'tags' | 'attributes'> {
  parent_id: number;
  attributes: WooCommerceVariationAttribute[];
}

// Product Category
export interface WooCommerceProductCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: 'default' | 'products' | 'subcategories' | 'both';
  image: WooCommerceImage | null;
  menu_order: number;
  count: number;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

// Product Tag
export interface WooCommerceProductTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

// Product Attribute
export interface WooCommerceProductAttribute {
  id: number;
  name: string;
  slug: string;
  type: 'select';
  order_by: 'menu_order' | 'name' | 'name_num' | 'id';
  has_archives: boolean;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

// Product Attribute Term
export interface WooCommerceProductAttributeTerm {
  id: number;
  name: string;
  slug: string;
  description: string;
  menu_order: number;
  count: number;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}

// Product Review
export interface WooCommerceProductReview {
  id: number;
  date_created: string;
  date_created_gmt: string;
  product_id: number;
  status: 'approved' | 'hold' | 'spam' | 'unspam' | 'trash' | 'untrash';
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  reviewer_avatar_urls: {
    [key: string]: string;
  };
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    up: Array<{ href: string }>;
  };
}

// API Query Parameters
export interface WooCommerceProductsQueryParams {
  context?: 'view' | 'edit';
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  before?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'id' | 'include' | 'title' | 'slug' | 'price' | 'popularity' | 'rating' | 'menu_order';
  parent?: number[];
  parent_exclude?: number[];
  slug?: string;
  status?: ProductStatus | ProductStatus[];
  type?: ProductType | ProductType[];
  sku?: string;
  featured?: boolean;
  category?: string;
  tag?: string;
  shipping_class?: string;
  attribute?: string;
  attribute_term?: string;
  tax_class?: string;
  on_sale?: boolean;
  min_price?: string;
  max_price?: string;
  stock_status?: StockStatus | StockStatus[];
}

export interface WooCommerceCategoriesQueryParams {
  context?: 'view' | 'edit';
  page?: number;
  per_page?: number;
  search?: string;
  exclude?: number[];
  include?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
  hide_empty?: boolean;
  parent?: number;
  product?: number;
  slug?: string;
}

export interface WooCommerceTagsQueryParams {
  context?: 'view' | 'edit';
  page?: number;
  per_page?: number;
  search?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
  hide_empty?: boolean;
  product?: number;
  slug?: string;
}

// API Response wrapper
export interface WooCommerceApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: any;
}

// Batch operations
export interface WooCommerceBatchRequest<T> {
  create?: Partial<T>[];
  update?: Partial<T>[];
  delete?: number[];
}

export interface WooCommerceBatchResponse<T> {
  create: T[];
  update: T[];
  delete: T[];
}

// Error response
export interface WooCommerceError {
  code: string;
  message: string;
  data: {
    status: number;
    params?: string[];
    details?: any;
  };
}

// Main API client interface
export interface WooCommerceRestApi {
  get(endpoint: string, params?: any): Promise<WooCommerceApiResponse<any>>;
  post(endpoint: string, data: any): Promise<WooCommerceApiResponse<any>>;
  put(endpoint: string, data: any): Promise<WooCommerceApiResponse<any>>;
  delete(endpoint: string, params?: any): Promise<WooCommerceApiResponse<any>>;
  options(endpoint: string): Promise<WooCommerceApiResponse<any>>;
}
