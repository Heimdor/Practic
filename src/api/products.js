import {
  db,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "../boot/firebase";

// Collection reference
const productsCollection = collection(db, "products");

/**
 * Get all products with optional filtering
 *
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of items to fetch
 * @param {string} options.orderByField - Field to order by
 * @param {string} options.orderDirection - Order direction ('asc' or 'desc')
 * @param {Object} options.filters - Key-value pairs for filtering
 * @returns {Promise<Array>} Array of product objects
 */
export const getProducts = async (options = {}) => {
  try {
    // Start with base query
    let q = productsCollection;

    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([field, value]) => {
        q = query(q, where(field, "==", value));
      });
    }

    // Apply ordering if provided
    if (options.orderByField) {
      const direction = options.orderDirection || "asc";
      q = query(q, orderBy(options.orderByField, direction));
    }

    // Apply limit if provided
    if (options.limit) {
      q = query(q, limit(options.limit));
    } else {
      // Default limit to prevent excessive reads
      q = query(q, limit(20));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

/**
 * Get a single product by ID
 *
 * @param {string} id - Product ID
 * @returns {Promise<Object|null>} Product object or null if not found
 */
export const getProductById = async (id) => {
  try {
    const productRef = doc(db, "products", id);
    const productDoc = await getDoc(productRef);

    if (productDoc.exists()) {
      return {
        id: productDoc.id,
        ...productDoc.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new product
 *
 * @param {Object} productData - Product data
 * @returns {Promise<Object>} Created product reference
 */
export const createProduct = async (productData) => {
  try {
    const enrichedData = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(productsCollection, enrichedData);
    return {
      id: docRef.id,
      ...enrichedData,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

/**
 * Update an existing product
 *
 * @param {string} id - Product ID
 * @param {Object} productData - Updated product data
 * @returns {Promise<void>}
 */
export const updateProduct = async (id, productData) => {
  try {
    const productRef = doc(db, "products", id);

    const updateData = {
      ...productData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(productRef, updateData);
    return { id, ...updateData };
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 *
 * @param {string} id - Product ID
 * @returns {Promise<void>}
 */
export const deleteProduct = async (id) => {
  try {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
    return { id };
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};
