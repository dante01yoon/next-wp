import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import type {
  WooCommerceProduct,
  WooCommerceProductVariation,
  WooCommerceProductCategory,
  WooCommerceProductTag,
  WooCommerceProductReview,
  WooCommerceProductsQueryParams,
  WooCommerceCategoriesQueryParams,
  WooCommerceTagsQueryParams,
  WooCommerceApiResponse,
  WooCommerceBatchRequest,
  WooCommerceBatchResponse,
} from './woocommerce-types';

const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL || "http://example.com",
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || "",
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || "",
  version: "wc/v3"
});

// Products API
export async function getProducts(params?: WooCommerceProductsQueryParams): Promise<WooCommerceProduct[]> {
  const response = await api.get("products", params);
  return response.data;
}

export async function getProduct(id: number): Promise<WooCommerceProduct> {
  const response = await api.get(`products/${id}`);
  return response.data;
}

export async function createProduct(productData: Partial<WooCommerceProduct>): Promise<WooCommerceProduct> {
  const response = await api.post("products", productData);
  return response.data;
}

export async function updateProduct(id: number, productData: Partial<WooCommerceProduct>): Promise<WooCommerceProduct> {
  const response = await api.put(`products/${id}`, productData);
  return response.data;
}

export async function deleteProduct(id: number, force: boolean = false): Promise<WooCommerceProduct> {
  const response = await api.delete(`products/${id}`, { force });
  return response.data;
}

export async function batchUpdateProducts(batch: WooCommerceBatchRequest<WooCommerceProduct>): Promise<WooCommerceBatchResponse<WooCommerceProduct>> {
  const response = await api.post("products/batch", batch);
  return response.data;
}

// Product Variations API
export async function getProductVariations(productId: number): Promise<WooCommerceProductVariation[]> {
  const response = await api.get(`products/${productId}/variations`);
  return response.data;
}

export async function getProductVariation(productId: number, variationId: number): Promise<WooCommerceProductVariation> {
  const response = await api.get(`products/${productId}/variations/${variationId}`);
  return response.data;
}

export async function createProductVariation(productId: number, variationData: Partial<WooCommerceProductVariation>): Promise<WooCommerceProductVariation> {
  const response = await api.post(`products/${productId}/variations`, variationData);
  return response.data;
}

export async function updateProductVariation(productId: number, variationId: number, variationData: Partial<WooCommerceProductVariation>): Promise<WooCommerceProductVariation> {
  const response = await api.put(`products/${productId}/variations/${variationId}`, variationData);
  return response.data;
}

export async function deleteProductVariation(productId: number, variationId: number, force: boolean = false): Promise<WooCommerceProductVariation> {
  const response = await api.delete(`products/${productId}/variations/${variationId}`, { force });
  return response.data;
}

// Product Categories API
export async function getProductCategories(params?: WooCommerceCategoriesQueryParams): Promise<WooCommerceProductCategory[]> {
  const response = await api.get("products/categories", params);
  return response.data;
}

export async function getProductCategory(id: number): Promise<WooCommerceProductCategory> {
  const response = await api.get(`products/categories/${id}`);
  return response.data;
}

export async function createProductCategory(categoryData: Partial<WooCommerceProductCategory>): Promise<WooCommerceProductCategory> {
  const response = await api.post("products/categories", categoryData);
  return response.data;
}

export async function updateProductCategory(id: number, categoryData: Partial<WooCommerceProductCategory>): Promise<WooCommerceProductCategory> {
  const response = await api.put(`products/categories/${id}`, categoryData);
  return response.data;
}

export async function deleteProductCategory(id: number, force: boolean = false): Promise<WooCommerceProductCategory> {
  const response = await api.delete(`products/categories/${id}`, { force });
  return response.data;
}

// Product Tags API
export async function getProductTags(params?: WooCommerceTagsQueryParams): Promise<WooCommerceProductTag[]> {
  const response = await api.get("products/tags", params);
  return response.data;
}

export async function getProductTag(id: number): Promise<WooCommerceProductTag> {
  const response = await api.get(`products/tags/${id}`);
  return response.data;
}

export async function createProductTag(tagData: Partial<WooCommerceProductTag>): Promise<WooCommerceProductTag> {
  const response = await api.post("products/tags", tagData);
  return response.data;
}

export async function updateProductTag(id: number, tagData: Partial<WooCommerceProductTag>): Promise<WooCommerceProductTag> {
  const response = await api.put(`products/tags/${id}`, tagData);
  return response.data;
}

export async function deleteProductTag(id: number, force: boolean = false): Promise<WooCommerceProductTag> {
  const response = await api.delete(`products/tags/${id}`, { force });
  return response.data;
}

// Product Reviews API
export async function getProductReviews(params?: { product?: number; page?: number; per_page?: number }): Promise<WooCommerceProductReview[]> {
  const response = await api.get("products/reviews", params);
  return response.data;
}

export async function getProductReview(id: number): Promise<WooCommerceProductReview> {
  const response = await api.get(`products/reviews/${id}`);
  return response.data;
}

export async function createProductReview(reviewData: Partial<WooCommerceProductReview>): Promise<WooCommerceProductReview> {
  const response = await api.post("products/reviews", reviewData);
  return response.data;
}

export async function updateProductReview(id: number, reviewData: Partial<WooCommerceProductReview>): Promise<WooCommerceProductReview> {
  const response = await api.put(`products/reviews/${id}`, reviewData);
  return response.data;
}

export async function deleteProductReview(id: number, force: boolean = false): Promise<WooCommerceProductReview> {
  const response = await api.delete(`products/reviews/${id}`, { force });
  return response.data;
}

// Search and Filter Functions
export async function searchProducts(searchTerm: string, params?: Omit<WooCommerceProductsQueryParams, 'search'>): Promise<WooCommerceProduct[]> {
  return getProducts({ ...params, search: searchTerm });
}

export async function getProductsBySku(sku: string): Promise<WooCommerceProduct[]> {
  return getProducts({ sku });
}

export async function getProductsByCategory(categoryId: number | string, params?: Omit<WooCommerceProductsQueryParams, 'category'>): Promise<WooCommerceProduct[]> {
  return getProducts({ ...params, category: categoryId.toString() });
}

export async function getProductsByTag(tagId: number | string, params?: Omit<WooCommerceProductsQueryParams, 'tag'>): Promise<WooCommerceProduct[]> {
  return getProducts({ ...params, tag: tagId.toString() });
}

export async function getFeaturedProducts(params?: Omit<WooCommerceProductsQueryParams, 'featured'>): Promise<WooCommerceProduct[]> {
  return getProducts({ ...params, featured: true });
}

export async function getOnSaleProducts(params?: Omit<WooCommerceProductsQueryParams, 'on_sale'>): Promise<WooCommerceProduct[]> {
  return getProducts({ ...params, on_sale: true });
}

// Utility Functions
export async function getProductStock(id: number): Promise<{ stock_quantity: number | null; stock_status: string }> {
  const product = await getProduct(id);
  return {
    stock_quantity: product.stock_quantity,
    stock_status: product.stock_status
  };
}

export async function updateProductStock(id: number, stockQuantity: number): Promise<WooCommerceProduct> {
  return updateProduct(id, {
    manage_stock: true,
    stock_quantity: stockQuantity,
    stock_status: stockQuantity > 0 ? 'instock' : 'outofstock'
  });
}

export default api;