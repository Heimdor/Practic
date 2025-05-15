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
const ordersCollection = collection(db, "orders");

/**
 * Get all orders with optional filtering
 *
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of items to fetch
 * @param {string} options.orderByField - Field to order by (default: 'createdAt')
 * @param {string} options.orderDirection - Order direction ('asc' or 'desc', default: 'desc')
 * @param {Object} options.filters - Key-value pairs for filtering
 * @returns {Promise<Array>} Array of order objects
 */
export const getOrders = async (options = {}) => {
  try {
    // Start with base query
    let q = ordersCollection;

    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([field, value]) => {
        q = query(q, where(field, "==", value));
      });
    }

    // Apply ordering (default to createdAt descending for newest first)
    const orderByField = options.orderByField || "createdAt";
    const direction = options.orderDirection || "desc";
    q = query(q, orderBy(orderByField, direction));

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
    console.error("Error fetching orders:", error);
    throw error;
  }
};

/**
 * Get a single order by ID
 *
 * @param {string} id - Order ID
 * @returns {Promise<Object|null>} Order object or null if not found
 */
export const getOrderById = async (id) => {
  try {
    const orderRef = doc(db, "orders", id);
    const orderDoc = await getDoc(orderRef);

    if (orderDoc.exists()) {
      return {
        id: orderDoc.id,
        ...orderDoc.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching order with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new order
 *
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order reference
 */
export const createOrder = async (orderData) => {
  try {
    const enrichedData = {
      ...orderData,
      status: orderData.status || "новый",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(ordersCollection, enrichedData);
    return {
      id: docRef.id,
      ...enrichedData,
    };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

/**
 * Update an order's status
 *
 * @param {string} id - Order ID
 * @param {string} status - New status
 * @param {string} [cancelReason] - Reason for cancellation (if status is 'отменен')
 * @returns {Promise<Object>} Updated order data
 */
export const updateOrderStatus = async (id, status, cancelReason = null) => {
  try {
    const orderRef = doc(db, "orders", id);

    const updateData = {
      status,
      updatedAt: serverTimestamp(),
    };

    // If provided and status is 'отменен', add cancel reason
    if (cancelReason && status === "отменен") {
      updateData.cancelReason = cancelReason;
    }

    await updateDoc(orderRef, updateData);
    return { id, ...updateData };
  } catch (error) {
    console.error(`Error updating order status for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Update order details
 *
 * @param {string} id - Order ID
 * @param {Object} orderData - Updated order data
 * @returns {Promise<Object>} Updated order data
 */
export const updateOrder = async (id, orderData) => {
  try {
    const orderRef = doc(db, "orders", id);

    const updateData = {
      ...orderData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(orderRef, updateData);
    return { id, ...updateData };
  } catch (error) {
    console.error(`Error updating order with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an order (typically used for admin purposes)
 *
 * @param {string} id - Order ID
 * @returns {Promise<Object>} Deleted order ID
 */
export const deleteOrder = async (id) => {
  try {
    const orderRef = doc(db, "orders", id);
    await deleteDoc(orderRef);
    return { id };
  } catch (error) {
    console.error(`Error deleting order with ID ${id}:`, error);
    throw error;
  }
};
