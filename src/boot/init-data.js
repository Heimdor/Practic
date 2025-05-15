import { getDocs, addProduct, productsCollection } from "./firebase";
import fantasyProducts from "../data/fantasy-products";

// Проверка наличия товаров и добавление при необходимости
export const checkAndInitializeProducts = async () => {
  try {
    // Получаем текущие товары
    const snapshot = await getDocs(productsCollection);

    // Если товаров нет, добавляем фэнтези товары
    if (snapshot.empty) {
      console.log("Товары отсутствуют, добавляем фэнтези товары...");

      const batch = [];
      for (const product of fantasyProducts) {
        batch.push(addProduct(product));
      }

      await Promise.all(batch);
      console.log("Фэнтези товары успешно добавлены!");
      return true;
    } else {
      console.log("Товары уже существуют, инициализация не требуется");
      return false;
    }
  } catch (error) {
    console.error("Ошибка при инициализации данных:", error);
    return false;
  }
};

export default async ({ app }) => {
  // Инициализируем данные при загрузке приложения
  await checkAndInitializeProducts();
};
