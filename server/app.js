import 'dotenv/config';
import cors from 'cors';
import crypto from 'crypto';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'server', 'data');
const uploadsDir = path.join(rootDir, 'public', 'uploads');
const dbPath = path.join(dataDir, 'db.json');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const useSupabase = Boolean(supabaseUrl && supabaseServiceRoleKey);
const supabase = useSupabase
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    })
  : null;

const adminIds = (process.env.ADMIN_IDS || process.env.VITE_ADMIN_IDS || '')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter(Boolean);

fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

const fallbackDb = {
  categories: [
    { id: 'sweets', name: { uz: 'Shirinliklar', ru: 'Сладости' } },
    { id: 'toys', name: { uz: 'O‘yinchoqlar', ru: 'Игрушки' } },
  ],
  products: [
    {
      id: 'emerald-truffles',
      name: { uz: 'Emerald truffle to‘plami', ru: 'Набор Emerald Truffle' },
      description: {
        uz: 'Pista, qora shokolad va oltin bezakli premium qo‘lbola truffle.',
        ru: 'Премиальные ручные трюфели с фисташкой, тёмным шоколадом и золотым декором.',
      },
      price: 89000,
      image: '/assets/products/emerald-truffles.svg',
      category: 'sweets',
      stock: 18,
      discount: 10,
    },
    {
      id: 'gift-box-deluxe',
      name: { uz: 'Deluxe sovg‘a qutisi', ru: 'Подарочный набор Deluxe' },
      description: {
        uz: 'Bayram uchun karamel, draje va yumshoq marshmallow aralashmasi.',
        ru: 'Праздничный набор с карамелью, драже и нежным маршмеллоу.',
      },
      price: 129000,
      image: '/assets/products/gift-box.svg',
      category: 'sweets',
      stock: 9,
      discount: 12,
    },
    {
      id: 'caramel-cupcakes',
      name: { uz: 'Karamelli mini desertlar', ru: 'Карамельные мини-десерты' },
      description: {
        uz: 'Sovg‘a uchun qulay, yumshoq krem va karamel notali dessert set.',
        ru: 'Нежный сет десертов с кремом и карамельными нотами.',
      },
      price: 76000,
      image: '/assets/products/caramel-cupcakes.svg',
      category: 'sweets',
      stock: 14,
    },
    {
      id: 'bunny-plush',
      name: { uz: 'Velvet quyoncha', ru: 'Плюшевый зайчик Velvet' },
      description: {
        uz: 'Yumshoq premium matodan tikilgan, sovg‘abop quyoncha o‘yinchoq.',
        ru: 'Подарочный плюшевый зайчик из мягкой премиальной ткани.',
      },
      price: 149000,
      image: '/assets/products/bunny-plush.svg',
      category: 'toys',
      stock: 6,
    },
    {
      id: 'wooden-bear',
      name: { uz: 'Wood Bear dekor o‘yinchog‘i', ru: 'Игрушка Wood Bear' },
      description: {
        uz: 'Tabiiy ranglarda, bolalar xonasi uchun nafis ayiqcha.',
        ru: 'Элегантный мишка в натуральных оттенках для детской комнаты.',
      },
      price: 119000,
      image: '/assets/products/wooden-bear.svg',
      category: 'toys',
      stock: 8,
    },
    {
      id: 'star-rattle',
      name: { uz: 'Golden Star rattle', ru: 'Погремушка Golden Star' },
      description: {
        uz: 'Minimal uslubdagi, yengil va xavfsiz premium rattle.',
        ru: 'Лёгкая и безопасная премиальная погремушка в минималистичном стиле.',
      },
      price: 68000,
      image: '/assets/products/star-rattle.svg',
      category: 'toys',
      stock: 12,
      discount: 8,
    },
  ],
  orders: [],
};

const readDb = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(fallbackDb, null, 2));
    return structuredClone(fallbackDb);
  }

  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch {
    fs.writeFileSync(dbPath, JSON.stringify(fallbackDb, null, 2));
    return structuredClone(fallbackDb);
  }
};

const writeDb = (db) => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

const shouldFallbackToLocal = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('schema cache') ||
    message.includes('could not find the table') ||
    message.includes('relation') ||
    message.includes('does not exist')
  );
};

const normalizeProductRow = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  price: row.price,
  image: row.image,
  category: row.category,
  stock: row.stock,
  discount: row.discount ?? undefined,
});

const normalizeCategoryRow = (row) => ({
  id: row.id,
  name: row.name,
});

const getStoreData = async () => {
  if (!supabase) {
    const db = readDb();
    return { categories: db.categories, products: db.products };
  }

  const [{ data: categories, error: categoriesError }, { data: products, error: productsError }] =
    await Promise.all([
      supabase.from('categories').select('*').order('id', { ascending: true }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
    ]);

  if (categoriesError) throw categoriesError;
  if (productsError) throw productsError;

  return {
    categories: (categories || []).map(normalizeCategoryRow),
    products: (products || []).map(normalizeProductRow),
  };
};

const createOrderRecord = async (payload) => {
  if (!supabase) {
    const db = readDb();
    const order = {
      id: crypto.randomUUID(),
      ...payload,
      createdAt: payload.createdAt || new Date().toISOString(),
    };
    db.orders.unshift(order);
    writeDb(db);
    return order.id;
  }

  const order = {
    customer: payload.customer,
    checkout: payload.checkout,
    items: payload.items,
    total: payload.total,
    brand: payload.brand,
    created_at: payload.createdAt || new Date().toISOString(),
  };

  const { data, error } = await supabase.from('orders').insert(order).select('id').single();
  if (error) {
    if (shouldFallbackToLocal(error)) {
      const db = readDb();
      const localOrder = {
        id: crypto.randomUUID(),
        ...payload,
        createdAt: payload.createdAt || new Date().toISOString(),
      };
      db.orders.unshift(localOrder);
      writeDb(db);
      return localOrder.id;
    }
    throw error;
  }
  return data.id;
};

const parseInitData = (raw) => {
  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
};

const verifyTelegramInitData = (raw) => {
  const token = process.env.BOT_TOKEN;
  if (!token || !raw) return false;

  const data = parseInitData(raw);
  const hash = data.hash;
  if (!hash) return false;
  delete data.hash;

  const dataCheckString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');

  const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
  const computedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return computedHash === hash;
};

const getRequester = (req) => {
  const userId = Number(req.header('x-telegram-user-id'));
  const initData = req.header('x-telegram-init-data') || '';
  return {
    userId: Number.isFinite(userId) ? userId : null,
    initData,
  };
};

const requireAdmin = (req, res, next) => {
  const { userId, initData } = getRequester(req);
  const initDataValid = verifyTelegramInitData(initData);
  const allowedById = userId && adminIds.includes(userId);

  if (initData && !initDataValid) {
    return res.status(401).json({ message: 'Invalid Telegram init data.' });
  }

  if (!allowedById) {
    return res.status(403).json({ message: 'Admin access denied.' });
  }

  return next();
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname) || '.png';
      cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use('/uploads', express.static(uploadsDir));
app.use('/assets', express.static(path.join(publicDir, 'assets')));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/store', (_req, res) => {
  getStoreData()
    .then((store) => res.json(store))
    .catch((error) => {
      if (shouldFallbackToLocal(error)) {
        const db = readDb();
        res.json({ categories: db.categories, products: db.products });
        return;
      }
      res.status(500).json({ message: error.message || 'Failed to load store.' });
    });
});

app.get('/api/admin/orders', requireAdmin, (_req, res) => {
  if (!supabase) {
    const db = readDb();
    res.json({ orders: db.orders });
    return;
  }

  supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .then(({ data, error }) => {
      if (error) {
        res.status(500).json({ message: error.message || 'Failed to load orders.' });
        return;
      }
      res.json({ orders: data || [] });
    });
});

app.post('/api/orders', (req, res) => {
  const payload = req.body;

  createOrderRecord(payload)
    .then((orderId) => res.status(201).json({ ok: true, orderId }))
    .catch((error) => {
      res.status(500).json({ message: error.message || 'Failed to create order.' });
    });
});

app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  return res.status(201).json({
    url: `/uploads/${req.file.filename}`,
  });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const product = req.body;
  if (!supabase) {
    const db = readDb();
    db.products.unshift(product);
    writeDb(db);
    res.status(201).json({ product });
    return;
  }

  supabase
    .from('products')
    .insert({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      stock: product.stock,
      discount: product.discount ?? null,
    })
    .select('*')
    .single()
    .then(({ data, error }) => {
      if (error) {
        if (shouldFallbackToLocal(error)) {
          const db = readDb();
          db.products.unshift(product);
          writeDb(db);
          res.status(201).json({ product });
          return;
        }
        res.status(500).json({ message: error.message || 'Failed to create product.' });
        return;
      }
      res.status(201).json({ product: normalizeProductRow(data) });
    });
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!supabase) {
    const db = readDb();
    db.products = db.products.map((product) => (product.id === id ? req.body : product));
    writeDb(db);
    res.json({ product: req.body });
    return;
  }

  supabase
    .from('products')
    .update({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      category: req.body.category,
      stock: req.body.stock,
      discount: req.body.discount ?? null,
    })
    .eq('id', id)
    .select('*')
    .single()
    .then(({ data, error }) => {
      if (error) {
        if (shouldFallbackToLocal(error)) {
          const db = readDb();
          db.products = db.products.map((product) => (product.id === id ? req.body : product));
          writeDb(db);
          res.json({ product: req.body });
          return;
        }
        res.status(500).json({ message: error.message || 'Failed to update product.' });
        return;
      }
      res.json({ product: normalizeProductRow(data) });
    });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!supabase) {
    const db = readDb();
    db.products = db.products.filter((product) => product.id !== id);
    writeDb(db);
    res.json({ ok: true });
    return;
  }

  supabase
    .from('products')
    .delete()
    .eq('id', id)
    .then(({ error }) => {
      if (error) {
        if (shouldFallbackToLocal(error)) {
          const db = readDb();
          db.products = db.products.filter((product) => product.id !== id);
          writeDb(db);
          res.json({ ok: true });
          return;
        }
        res.status(500).json({ message: error.message || 'Failed to delete product.' });
        return;
      }
      res.json({ ok: true });
    });
});

app.post('/api/admin/categories', requireAdmin, (req, res) => {
  if (!supabase) {
    const db = readDb();
    db.categories.push(req.body);
    writeDb(db);
    res.status(201).json({ category: req.body });
    return;
  }

  supabase
    .from('categories')
    .insert({
      id: req.body.id,
      name: req.body.name,
    })
    .select('*')
    .single()
    .then(({ data, error }) => {
      if (error) {
        if (shouldFallbackToLocal(error)) {
          const db = readDb();
          db.categories.push(req.body);
          writeDb(db);
          res.status(201).json({ category: req.body });
          return;
        }
        res.status(500).json({ message: error.message || 'Failed to create category.' });
        return;
      }
      res.status(201).json({ category: normalizeCategoryRow(data) });
    });
});

app.delete('/api/admin/categories/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  if (!supabase) {
    const db = readDb();
    db.categories = db.categories.filter((category) => category.id !== id);
    db.products = db.products.filter((product) => product.category !== id);
    writeDb(db);
    res.json({ ok: true });
    return;
  }

  supabase
    .from('products')
    .delete()
    .eq('category', id)
    .then(({ error: productError }) => {
      if (productError) {
        if (shouldFallbackToLocal(productError)) {
          const db = readDb();
          db.categories = db.categories.filter((category) => category.id !== id);
          db.products = db.products.filter((product) => product.category !== id);
          writeDb(db);
          res.json({ ok: true });
          return null;
        }
        res.status(500).json({ message: productError.message || 'Failed to delete category products.' });
        return null;
      }
      return supabase.from('categories').delete().eq('id', id);
    })
    .then((result) => {
      if (!result) return;
      if (result.error) {
        res.status(500).json({ message: result.error.message || 'Failed to delete category.' });
        return;
      }
      res.json({ ok: true });
    });
});

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}
