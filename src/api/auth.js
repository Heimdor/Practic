import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "../boot/firebase";

/**
 * Register a new user
 *
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data (name, phone, etc.)
 * @returns {Promise<Object>} Created user info
 */
export const registerUser = async (email, password, userData = {}) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Create user profile document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      ...userData,
      role: "customer", // Default role
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      uid: user.uid,
      email: user.email,
      ...userData,
    };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

/**
 * Login user with email and password
 *
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User info
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Get user profile data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));

    // Update last login timestamp
    await updateDoc(doc(db, "users", user.uid), {
      lastLoginAt: serverTimestamp(),
    });

    // Return combined data
    if (userDoc.exists()) {
      return {
        uid: user.uid,
        email: user.email,
        ...userDoc.data(),
      };
    } else {
      return {
        uid: user.uid,
        email: user.email,
      };
    }
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

/**
 * Logout current user
 *
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

/**
 * Get current authenticated user (or null if not authenticated)
 *
 * @returns {Promise<Object|null>} Current user or null
 */
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();
        if (user) {
          // Get user profile data from Firestore
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              resolve({
                uid: user.uid,
                email: user.email,
                ...userDoc.data(),
              });
            } else {
              resolve({
                uid: user.uid,
                email: user.email,
              });
            }
          } catch (error) {
            console.error("Error getting user profile:", error);
            resolve({
              uid: user.uid,
              email: user.email,
            });
          }
        } else {
          resolve(null);
        }
      },
      (error) => {
        console.error("Auth state error:", error);
        reject(error);
      }
    );
  });
};

/**
 * Update user profile
 *
 * @param {string} uid - User ID
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, "users", uid);

    const updateData = {
      ...userData,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(userRef, updateData);

    // Get updated user data
    const userDoc = await getDoc(userRef);

    return {
      uid,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error(`Error updating user profile for UID ${uid}:`, error);
    throw error;
  }
};
