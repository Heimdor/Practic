import { resetWithFantasyProducts } from "../data/fantasy-products";

export default async () => {
  console.log("Сбрасываем базу данных и добавляем фэнтези товары...");

  try {
    const result = await resetWithFantasyProducts();

    if (result) {
      console.log("База данных успешно сброшена и заполнена фэнтези товарами");
    } else {
      console.error("Не удалось сбросить базу данных");
    }
  } catch (error) {
    console.error("Ошибка при сбросе базы данных:", error);
  }
};
