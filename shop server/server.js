const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());                    // для application/json
app.use(bodyParser.urlencoded({ extended: true }))


// Временное хранилище (in-memory). В продакшене замените на MongoDB / PostgreSQL
let products = [
  { id: 1, name: "iPhone 15", price: 89999, category: "Смартфоны", description: "Флагман от Apple" },
  { id: 2, name: "Samsung Galaxy S24", price: 74999, category: "Смартфоны", description: "Android флагман" },
  { id: 3, name: "MacBook Air M3", price: 129999, category: "Ноутбуки", description: "Лёгкий и мощный" },
  { id: 4, name: "Asus ROG Zephyrus", price: 189999, category: "Ноутбуки", description: "Игровой ноутбук с мощной графикой" },
  { id: 5, name: "iPad Pro 11", price: 94999, category: "Планшеты", description: "Экран Liquid Retina и чип M2" },
  { id: 6, name: "Xiaomi Pad 6", price: 34999, category: "Планшеты", description: "Отличный баланс цены и производительности" },
  { id: 7, name: "Apple Watch Series 9", price: 44999, category: "Умные часы", description: "Следит за здоровьем и активностью" },
  { id: 8, name: "Samsung Galaxy Watch 6", price: 29999, category: "Умные часы", description: "Классический дизайн и Wear OS" },
  { id: 9, name: "Sony WH-1000XM5", price: 39999, category: "Наушники", description: "Лучшее активное шумоподавление" },
  { id: 10, name: "AirPods Pro 2", price: 24999, category: "Наушники", description: "Компактные беспроводные наушники" },
  { id: 11, name: "PlayStation 5 Slim", price: 59999, category: "Игровые консоли", description: "Игровая приставка нового поколения" },
  { id: 12, name: "Nintendo Switch OLED", price: 31999, category: "Игровые консоли", description: "Портативные игры с ярким экраном" },
  { id: 13, name: "LG OLED C3 55", price: 149999, category: "Телевизоры", description: "Идеальный черный цвет и контраст" },
  { id: 14, name: "Xiaomi TV A2 43", price: 27999, category: "Телевизоры", description: "Доступный Smart TV на Android" },
  { id: 15, name: "Canon EOS R50", price: 79999, category: "Фотоаппараты", description: "Беззеркальная камера для блогов" },
  { id: 16, name: "GoPro HERO12", price: 42999, category: "Фотоаппараты", description: "Экшн-камера со сверхпрочной стабилизацией" },
  { id: 17, name: "Dyson V15 Detect", price: 79999, category: "Бытовая техника", description: "Беспроводной пылесос с лазерной подсветкой" },
  { id: 18, name: "Philips Essential Airfryer", price: 12999, category: "Бытовая техника", description: "Мультипечь для здоровой еды" },
  { id: 19, name: "Logitech MX Master 3S", price: 11999, category: "Периферия", description: "Эргономичная беспроводная мышь" },
  { id: 20, name: "Keychron K2 V2", price: 9999, category: "Периферия", description: "Механическая клавиатура для работы" }
];


// Генерация ID
const generateId = () => Math.max(0, ...products.map(p => p.id)) + 1;

// ==================== CRUD + ПОИСК ====================

// GET /products — все товары + поиск
app.get('/products', (req, res) => {
  const { search, category, minPrice, maxPrice } = req.query;

  let filtered = [...products];

  // Поиск по названию и описанию
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.description && p.description.toLowerCase().includes(s))
    );
  }

  // Фильтр по категории
  if (category) {
    filtered = filtered.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  // Фильтр по цене
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= Number(maxPrice));
  }

  res.json({
    success: true,
    count: filtered.length,
    products: filtered
  });
});

// GET /products/:id — один товар
app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Товар не найден' });
  }

  res.json({ success: true, product });
});

// POST /products — создание
app.post('/products', (req, res) => {
  const { name, price, category, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, message: 'Необходимо указать name и price' });
  }

  const newProduct = {
    id: generateId(),
    name,
    price: Number(price),
    category: category || 'Без категории',
    description: description || ''
  };

  products.push(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

// PUT /products/:id — полное обновление
app.put('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Товар не найден' });
  }

  products[index] = {
    ...products[index],
    ...req.body,
    id: products[index].id // id не меняем
  };

  res.json({ success: true, product: products[index] });
});

// PATCH /products/:id — частичное обновление
app.patch('/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Товар не найден' });
  }

  products[index] = { ...products[index], ...req.body };
  res.json({ success: true, product: products[index] });
});

// ==================== МАССОВОЕ УДАЛЕНИЕ ====================

// DELETE /products/bulk — удаление нескольких товаров по массиву id
app.delete('/products/bulk', (req, res) => {
  console.log('body')

const { ids } = req.body;
console.log(req.body)
console.log(ids)

if (!ids || !Array.isArray(ids) || ids.length === 0) {
  return res.status(400).json({
    success: false,
    message: 'Необходимо передать массив ids: { "ids": [1, 2, 3] }'
  });
}

// Преобразуем в числа и убираем невалидные
const idSet = new Set(
  ids.map(id => parseInt(id)).filter(id => !isNaN(id))
);

if (idSet.size === 0) {
  return res.status(400).json({
    success: false,
    message: 'Не найдено валидных ID для удаления'
  });
}

const deleted = [];

// Удаляем с конца, чтобы не ломать индексы
for (let i = products.length - 1; i >= 0; i--) {
  if (idSet.has(products[i].id)) {
    deleted.push(products.splice(i, 1)[0]);
  }
}

res.json({
  success: true,
  message: `Успешно удалено ${deleted.length} из ${idSet.size} товаров`,
  deletedCount: deleted.length,
  deletedProducts: deleted
});
});


// DELETE /products/:id — удаление
app.delete('/products/:id', (req, res) => {
  console.log(req.params.id)
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Товар не найден' });
  }

  const deleted = products.splice(index, 1);
  res.json({ success: true, message: 'Товар удалён', product: deleted[0] });
});


// ==================== Запуск сервера ====================

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
  console.log('📦 CRUD + поиск товаров готовы!');
});