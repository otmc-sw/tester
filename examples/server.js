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
const dbPath = path.join(__dirname, 'data', 'data.json');
const templatePath = path.join(__dirname, 'db.template.json');

// Ensure data directory exists and copy template if needed
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(templatePath, dbPath);
}

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

// Helper function to send success response
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

// Helper function to send error response
const sendError = (res, message, statusCode = 400, error = null) => {
  res.status(statusCode).json({ success: false, message, error });
};

// Reset database endpoint
app.post('/reset-db', (req, res) => {
  try {
    const templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    db = templateData;
    saveData();
    sendSuccess(res, { message: 'Database reset successfully' }, 'Database reset');
  } catch (error) {
    sendError(res, 'Failed to reset database', 500, error);
  }
});

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
  
  sendSuccess(res, users.slice(start, end), 'Users retrieved successfully');
});

app.get('/users/:id', (req, res) => {
  const user = db.users.find(u => u.id === req.params.id);
  if (!user) {
    return sendError(res, 'User not found', 404);
  }
  sendSuccess(res, user, 'User retrieved successfully');
});

app.post('/users', (req, res) => {
  const validation = validateUser(req.body);
  if (!validation.valid) {
    return sendError(res, validation.message, 400);
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
  sendSuccess(res, newUser, 'User created successfully', 201);
});

app.put('/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return sendError(res, 'User not found', 404);
  }
  
  const validation = validateUser(req.body);
  if (!validation.valid) {
    return sendError(res, validation.message, 400);
  }
  
  db.users[index] = {
    ...db.users[index],
    ...req.body,
    id: db.users[index].id,
    updatedAt: new Date().toISOString()
  };
  
  saveData();
  sendSuccess(res, db.users[index], 'User updated successfully');
});

app.patch('/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return sendError(res, 'User not found', 404);
  }
  
  // Partial validation - only validate fields being provided
  if (req.body.email && !isValidEmail(req.body.email)) {
    return sendError(res, 'Invalid email format', 400);
  }
  
  db.users[index] = {
    ...db.users[index],
    ...req.body,
    id: db.users[index].id,
    updatedAt: new Date().toISOString()
  };
  
  saveData();
  sendSuccess(res, db.users[index], 'User updated successfully');
});

app.delete('/users/:id', (req, res) => {
  const index = db.users.findIndex(u => u.id === req.params.id);
  if (index === -1) {
    return sendError(res, 'User not found', 404);
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
  
  sendSuccess(res, products.slice(start, end), 'Products retrieved successfully');
});

app.get('/products/statistics', (req, res) => {
  const totalProducts = db.products.length;
  const activeProducts = db.products.filter(p => p.isActive).length;
  const totalStock = db.products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const avgPrice = db.products.length > 0 
    ? db.products.reduce((sum, p) => sum + (p.price || 0), 0) / db.products.length 
    : 0;
  
  sendSuccess(res, {
    totalProducts,
    activeProducts,
    inactiveProducts: totalProducts - activeProducts,
    totalStock,
    averagePrice: avgPrice
  }, 'Product statistics retrieved successfully');
});

app.get('/products/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) {
    return sendError(res, 'Product not found', 404);
  }
  sendSuccess(res, product, 'Product retrieved successfully');
});

app.post('/products', (req, res) => {
  const validation = validateProduct(req.body);
  if (!validation.valid) {
    return sendError(res, validation.message, 400);
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
  sendSuccess(res, newProduct, 'Product created successfully', 201);
});

app.post('/products/bulk/stock', (req, res) => {
  if (!req.body.updates || !Array.isArray(req.body.updates)) {
    return sendError(res, 'Updates array is required', 400);
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
  sendSuccess(res, { results }, 'Bulk stock update completed successfully');
});

app.put('/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return sendError(res, 'Product not found', 404);
  }
  
  const validation = validateProduct(req.body);
  if (!validation.valid) {
    return sendError(res, validation.message, 400);
  }
  
  db.products[index] = {
    ...db.products[index],
    ...req.body,
    id: db.products[index].id,
    updatedAt: new Date().toISOString()
  };
  
  saveData();
  sendSuccess(res, db.products[index], 'Product updated successfully');
});

app.patch('/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return sendError(res, 'Product not found', 404);
  }
  
  // Validate price if provided
  if (req.body.price !== undefined && (typeof req.body.price !== 'number' || req.body.price < 0)) {
    return sendError(res, 'Price must be a non-negative number', 400);
  }
  
  // Validate stock if provided
  if (req.body.stock !== undefined && (typeof req.body.stock !== 'number' || req.body.stock < 0)) {
    return sendError(res, 'Stock must be a non-negative number', 400);
  }
  
  db.products[index] = {
    ...db.products[index],
    ...req.body,
    id: db.products[index].id,
    updatedAt: new Date().toISOString()
  };
  
  saveData();
  sendSuccess(res, db.products[index], 'Product updated successfully');
});

app.delete('/products/:id', (req, res) => {
  const index = db.products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return sendError(res, 'Product not found', 404);
  }
  
  db.products.splice(index, 1);
  saveData();
  res.status(204).send();
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
});
