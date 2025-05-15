// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  increment,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAhdU-bR9m0sNW3JtPmb-4SHQZLyW45EVo",
  authDomain: "mytodo-39458.firebaseapp.com",
  projectId: "mytodo-39458",
  storageBucket: "mytodo-39458.appspot.com", // Fixed storage bucket URL
  messagingSenderId: "281126768289",
  appId: "1:281126768289:web:2141ceddf6e8b5027deae0",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(firebaseApp);

// Initialize Firebase Authentication
const auth = getAuth(firebaseApp);

// Export the boot file
export default ({ app }) => {
  // Делаем Firebase и Firestore доступными глобально
  app.config.globalProperties.$firebase = firebaseApp;
  app.config.globalProperties.$db = db;
  app.config.globalProperties.$auth = auth;
};

// Экспортируем Firebase и Firestore для использования в компонентах
export {
  firebaseApp,
  db,
  auth,
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  increment,
  setDoc,
  writeBatch,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};

// Помощник для соблюдения лимитов бесплатного плана
const applyQueryLimit = (q) => {
  // Добавляем лимит на количество получаемых документов для экономии запросов Firestore
  return query(q, limit(20));
};

// Функции для работы с коллекцией продуктов
export const productsCollection = collection(db, "products");

// Получить все продукты (с лимитом)
export const getProducts = async () => {
  const q = applyQueryLimit(query(productsCollection));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Добавить продукт
export const addProduct = async (product) => {
  return await addDoc(productsCollection, product);
};

// Обновить продукт
export const updateProduct = async (id, product) => {
  const productRef = doc(db, "products", id);
  return await updateDoc(productRef, product);
};

// Удалить продукт
export const deleteProduct = async (id) => {
  const productRef = doc(db, "products", id);
  return await deleteDoc(productRef);
};

// Функции для работы с заказами
export const ordersCollection = collection(db, "orders");

// Добавить новый заказ
export const createOrder = async (orderData) => {
  // Добавляем временную метку создания заказа
  const orderWithTimestamp = {
    ...orderData,
    createdAt: serverTimestamp(),
    status: "новый", // Начальный статус заказа
  };
  return await addDoc(ordersCollection, orderWithTimestamp);
};

// Получить все заказы (с лимитом)
export const getOrders = async () => {
  const q = applyQueryLimit(query(ordersCollection));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Обновить статус заказа
export const updateOrderStatus = async (orderId, status, cancelReason) => {
  const orderRef = doc(db, "orders", orderId);
  const updateData = {
    status,
    updatedAt: serverTimestamp(),
  };

  // Если указана причина отмены и статус "отменен", добавляем ее в документ
  if (cancelReason && status === "отменен") {
    updateData.cancelReason = cancelReason;
  }

  return await updateDoc(orderRef, updateData);
};

// Функции для аутентификации пользователей
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("Ошибка входа:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Ошибка выхода:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      (error) => {
        reject(error);
      }
    );
  });
};
