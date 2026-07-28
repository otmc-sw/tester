/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Load initial data
const dbPath = path.join(__dirname, 'db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Helper function to save data
const saveData = () => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

// Helper function to generate ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Helper function to validate email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate product
const validateProduct = (product) => {
  if (!product.name || typeof product.name !== 'string') {
    return { valid: false, message: 'Name is required' };
  }
  if (!product.description || typeof product.description !== 'string') {
    return { valid: false, message: 'Description is required' };
  }
  if (product.price === undefined || product.price === null) {
    return { valid: false, message: 'Price is required' };
  }
  if (typeof product.price !== 'number' || product.price < 0) {
    return { valid: false, message: 'Price must be a non-negative number' };
  }
  if (product.stock === undefined || product.stock === null) {
    return { valid: false, message: 'Stock is required' };
  }
  if (typeof product.stock !== 'number' || product.stock < 0) {
    return { valid: false, message: 'Stock must be a non-negative number' };
  }
  if (!product.category || typeof product.category !== 'string') {
    return { valid: false, message: 'Category is required' };
  }
  return { valid: true };
};

// Helper function to validate user
const validateUser = (user) => {
  if (!user.username || typeof user.username !== 'string') {
    return { valid: false, message: 'Username is required' };
  }
  if (!user.email || typeof user.email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }
  if (!isValidEmail(user.email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  if (!user.password || typeof user.password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  return { valid: true };
};

// USERS endpoints
app.get('/users', (req, res) => {
  let users = [...db.users];
  
  // Filter by role
  if (req.query.role) {
    users = users.filter(u => u.role === req.query.role);
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || users.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  res.json(users.slice(start, end));
});

app.get('/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

app.post('/users', (req, res) => {
  const validation = validateUser(req.body);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }
  
  const newUser = {
    id: generateId(),
    ...req.body,
    role: req.body.role || 'user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.users.push(newUser);
  saveData();
  res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  const validation = validateUser(req.body);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }
  
  db.users[index] = {
    ...db.users[index],
    ...req.body,
    id: db.users[index].id,
    updatedAt: new Date().toISOString()
  };
  
  saveData();
  res.json(db.users[index]);
});

app.patch('/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Partial validation - only validate fields being provided
  if (req.body.email && !isValidEmail(req.body.email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  db.users[index] = {
    ...db.users[index],
    ...req.body,
    id: db.users[index].id,
    updatedAt: new Date().toISOString()
  };
  
  saveData();
  res.json(db.users[index]);
});

app.delete('/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  db.users.splice(index, 1);
  saveData();
  res.status(204).send();
});

// PRODUCTS endpoints
app.get('/products', (req, res) => {
  let products = [...db.products];
  
  // Filter by category
  if (req.query.category) {
    products = products.filter(p => p.category === req.query.category);
  }
  
  // Filter by price range
  if (req.query.minPrice) {
    products = products.filter(p => p.price >= parseFloat(req.query.minPrice));
  }
  if (req.query.maxPrice) {
    products = products.filter(p => p.price <= parseFloat(req.query.maxPrice));
  }
  
  // Search by name
  if (req.query.search) {
    products = products.filter(p => 
      p.name.toLowerCase().includes(req.query.search.toLowerCase())
    );
  }
  
  // Filter by active status
  if (req.query.isActive !== undefined) {
    const isActive = req.query.isActive === 'true';
    products = products.filter(p => p.isActive === isActive);
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || products.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  
  res.json(products.slice(start, end));
});

app.get('/products/statistics', (req, res) => {
  const totalProducts = db.products.length;
  const activeProducts = db.products.filter(p => p.isActive).length;
  const totalStock = db.products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const avgPrice = db.products.length > 0 
    ? db.products.reduce((sum, p) => sum + (p.price || 0), 0) / db.products.length 
    : 0;
  
  res.json({
    totalProducts,
    activeProducts,
    inactiveProducts: totalProducts - activeProducts,
    totalStock,
    averagePrice: avgPrice
  });
});

app.get('/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
});

app.post('/products', (req, res) => {
  const validation = validateProduct(req.body);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }
  
  const newProduct = {
    id: generateId(),
    ...req.body,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  db.products.push(newProduct);
  saveData();
  res.status(201).json(newProduct);
});

app.post('/products/bulk/stock', (req, res) => {
  if (!req.body.updates || !Array.isArray(req.body.updates)) {
    return res.status(400).json({ message: 'Updates array is required' });
  }
  
  const results = [];
  
  for (const update of req.body.updates) {
    const index = db.products.findIndex(p => p.id === update.productId);
    if (index !== -1) {
      db.products[index].stock = Math.max(0, (db.products[index].stock || 0) + (update.quantity || 0));
      db.products[index].updatedAt = new Date().toISOString();
      results.push({
        productId: update.productId,
        success: true,
        newStock: db.products[index].stock
      });
    } else {
      results.push({
        productId: update.productId,
        success: false,
        error: 'Product not found'
      });
    }
  }
  
  saveData();
  res.json({ results });
});

app.put('/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  const validation = validateProduct(req.body);
  if (!validation.valid) {
    return res.status(400).json({ message: validation.message });
  }
  
  db.products[index] = {
    ...db.products[index],
    ...req.body,
    id: db.products[index].id,
    updatedAt: new Date().toISOString()
  };
  
  saveData();
  res.json(db.products[index]);
});

app.patch('/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  // Validate price if provided
  if (req.body.price !== undefined && (typeof req.body.price !== 'number' || req.body.price < 0)) {
    return res.status(400).json({ message: 'Price must be a non-negative number' });
  }
  
  // Validate stock if provided
  if (req.body.stock !== undefined && (typeof req.body.stock !== 'number' || req.body.stock < 0)) {
    return res.status(400).json({ message: 'Stock must be a non-negative number' });
  }
  
  db.products[index] = {
    ...db.products[index],
    ...req.body,
    id: db.products[index].id,
    updatedAt: new Date().toISOString()
  };
  
  saveData();
  res.json(db.products[index]);
});

app.delete('/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  db.products.splice(index, 1);
  saveData();
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
