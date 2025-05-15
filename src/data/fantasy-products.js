import {
  addProduct,
  productsCollection,
  getDocs,
  deleteDoc,
  doc,
  db,
} from "../boot/firebase";

// Fantasy product data
const fantasyProducts = [
  // Potions category
  {
    name: "Зелье исцеления",
    category: "Зелья",
    price: 50,
    image: "/images/potion.svg",
    description:
      "Восстанавливает 100 единиц здоровья. Имеет приятный травяной аромат.",
    inStock: true,
    featured: true,
  },
  {
    name: "Эликсир силы",
    category: "Зелья",
    price: 120,
    image: "/images/potion.svg",
    description:
      "Увеличивает силу на 25% на 1 час. Горький на вкус, но эффективный.",
    inStock: true,
    featured: false,
  },
  {
    name: "Зелье невидимости",
    category: "Зелья",
    price: 200,
    image: "/images/potion.svg",
    description:
      "Делает вас невидимым на 30 минут. Прозрачная жидкость без запаха.",
    inStock: true,
    featured: true,
  },
  {
    name: "Противоядие",
    category: "Зелья",
    price: 75,
    image: "/images/potion.svg",
    description:
      "Нейтрализует любой яд. Обязательно иметь при исследовании подземелий.",
    inStock: true,
    featured: false,
  },

  // Weapons category
  {
    name: "Меч драконоборца",
    category: "Оружие",
    price: 1500,
    image: "/images/weapon.svg",
    description:
      "Легендарный меч, наносящий двойной урон драконам. Выкован из редкой стали.",
    inStock: true,
    featured: true,
  },
  {
    name: "Эльфийский лук",
    category: "Оружие",
    price: 950,
    image: "/images/weapon.svg",
    description:
      "Изящный лук, созданный эльфийскими мастерами. Обеспечивает высокую точность.",
    inStock: true,
    featured: false,
  },
  {
    name: "Боевой топор гномов",
    category: "Оружие",
    price: 1200,
    image: "/images/weapon.svg",
    description:
      "Тяжёлый топор с рунами силы. Идеален для раскалывания щитов противника.",
    inStock: true,
    featured: true,
  },
  {
    name: "Посох огня",
    category: "Оружие",
    price: 1800,
    image: "/images/weapon.svg",
    description:
      "Магический посох, позволяющий метать огненные шары. Создан древними магами.",
    inStock: true,
    featured: false,
  },

  // Armor category
  {
    name: "Митриловый нагрудник",
    category: "Доспехи",
    price: 2500,
    image: "/images/armor.svg",
    description:
      "Лёгкий, но непробиваемый нагрудник из редкого металла митрил. Выдерживает большинство атак.",
    inStock: true,
    featured: true,
  },
  {
    name: "Шлем паладина",
    category: "Доспехи",
    price: 850,
    image: "/images/armor.svg",
    description:
      "Укреплённый шлем со священными символами. Даёт дополнительную защиту от тёмной магии.",
    inStock: true,
    featured: false,
  },
  {
    name: "Эльфийские сапоги",
    category: "Доспехи",
    price: 700,
    image: "/images/armor.svg",
    description:
      "Лёгкие сапоги, позволяющие бесшумно передвигаться. Удобные для долгих путешествий.",
    inStock: true,
    featured: false,
  },
  {
    name: "Щит горного короля",
    category: "Доспехи",
    price: 1800,
    image: "/images/armor.svg",
    description:
      "Массивный щит с гербом горного королевства. Обеспечивает превосходную защиту.",
    inStock: true,
    featured: true,
  },

  // Books category
  {
    name: "Книга заклинаний",
    category: "Книги",
    price: 350,
    image: "/images/book.svg",
    description:
      "Древний гримуар с различными магическими заклинаниями. Подходит для начинающих магов.",
    inStock: true,
    featured: true,
  },
  {
    name: "История драконов",
    category: "Книги",
    price: 120,
    image: "/images/book.svg",
    description:
      "Подробный справочник о различных видах драконов, их повадках и слабостях.",
    inStock: true,
    featured: false,
  },
  {
    name: "Травник алхимика",
    category: "Книги",
    price: 180,
    image: "/images/book.svg",
    description:
      "Иллюстрированная книга о волшебных травах и их применении в зельеварении.",
    inStock: true,
    featured: false,
  },
  {
    name: "Руны и символы",
    category: "Книги",
    price: 250,
    image: "/images/book.svg",
    description:
      "Справочник по древним магическим рунам с инструкциями по их активации и использованию.",
    inStock: true,
    featured: true,
  },
];

// Function to clear all existing products
export const clearProducts = async () => {
  try {
    const snapshot = await getDocs(productsCollection);
    const batch = [];

    snapshot.docs.forEach((document) => {
      batch.push(deleteDoc(doc(db, "products", document.id)));
    });

    await Promise.all(batch);
    console.log("All products cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing products:", error);
    return false;
  }
};

// Function to add all fantasy products
export const addFantasyProducts = async () => {
  try {
    const batch = [];

    for (const product of fantasyProducts) {
      batch.push(addProduct(product));
    }

    await Promise.all(batch);
    console.log("Fantasy products added successfully");
    return true;
  } catch (error) {
    console.error("Error adding fantasy products:", error);
    return false;
  }
};

// Function to reset products (clear and add new ones)
export const resetWithFantasyProducts = async () => {
  const cleared = await clearProducts();
  if (cleared) {
    return await addFantasyProducts();
  }
  return false;
};

export default fantasyProducts;
