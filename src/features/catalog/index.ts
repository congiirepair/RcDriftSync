export {
  catalogBrands,
  catalogBrandsByCategory,
  catalogDisplayName,
  catalogOptionDescription,
  catalogOptionLabel,
  createUserCatalogItem,
  deleteUserCatalogItem,
  exportProductCatalog,
  filterProductCatalog,
  generateSimplifiedName,
  getProductCatalog,
  importProductCatalog,
  loadProductSuggestions,
  loadUserCatalogItems,
  saveProductSuggestions,
  submitProductSuggestion,
  updateProductSuggestionStatus,
  upsertUserCatalogItem,
  validateCatalogImport
} from "../../services/productCatalog";
export { productCatalogCategories } from "../../data/productCatalog";
export type { ProductCatalogCategory, ProductCatalogItem, ProductCatalogVariant } from "../../data/productCatalog";
