/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { test } from '@playwright/test';
import { defineAPIs, run } from '../../src/index.js';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types.js';
import config from '../config.js';

const suite = defineAPIs([
  // GET - List all products
  {
    title: "Products - List all products",
    GET: "/products",
    response: Product,
    status: 200
  },

  // GET - List products with pagination
  {
    title: "Products - List with pagination",
    GET: "/products?page=1&limit=20",
    response: Product,
    status: 200
  },

  // GET - Filter products by category
  {
    title: "Products - Filter by category",
    GET: "/products?category=electronics",
    response: Product,
    status: 200
  },

  // GET - Filter products by price range
  {
    title: "Products - Filter by price range",
    GET: "/products?minPrice=100&maxPrice=1000",
    response: Product,
    status: 200
  },

  // GET - Search products by name
  {
    title: "Products - Search by name",
    GET: "/products?search=laptop",
    response: Product,
    status: 200
  },

  // GET - Get active products only
  {
    title: "Products - Get active products only",
    GET: "/products?isActive=true",
    response: Product,
    status: 200
  },

  // POST - Create new product
  {
    title: "Products - Create new product",
    POST: "/products",
    request: {
      name: "Laptop Pro 15",
      description: "High-performance laptop with 16GB RAM",
      price: 1299.99,
      stock: 50,
      category: "electronics"
    } as CreateProductRequest,
    response: Product,
    status: 201
  },

  // POST - Create product with invalid data
  {
    title: "Products - Create with negative price",
    POST: "/products",
    request: {
      name: "Invalid Product",
      description: "Product with negative price",
      price: -100,
      stock: 10,
      category: "electronics"
    } as CreateProductRequest,
    status: 400
  },

  {
    title: "Products - Create with missing required fields",
    POST: "/products",
    request: {
      name: "Incomplete Product"
    } as CreateProductRequest,
    status: 400
  },

  {
    title: "Products - Create with zero stock",
    POST: "/products",
    request: {
      name: "Out of Stock Product",
      description: "Product with zero stock",
      price: 99.99,
      stock: 0,
      category: "electronics"
    } as CreateProductRequest,
    status: 201
  },

  // GET - Get product by ID
  {
    title: "Products - Get by ID",
    GET: "/products/1",
    response: Product,
    status: 200
  },

  {
    title: "Products - Get non-existent product",
    GET: "/products/99999",
    status: 404
  },

  // PUT - Update product completely
  {
    title: "Products - Full update",
    PUT: "/products/1",
    request: {
      name: "Updated Laptop Pro 15",
      description: "Updated description with better specs",
      price: 1199.99,
      stock: 45,
      category: "electronics",
      isActive: true
    } as UpdateProductRequest,
    response: Product,
    status: 200
  },

  // PATCH - Update product partially
  {
    title: "Products - Partial update - Price only",
    PATCH: "/products/1",
    request: {
      price: 1099.99
    } as UpdateProductRequest,
    response: Product,
    status: 200
  },

  {
    title: "Products - Partial update - Stock only",
    PATCH: "/products/1",
    request: {
      stock: 40
    } as UpdateProductRequest,
    response: Product,
    status: 200
  },

  {
    title: "Products - Deactivate product",
    PATCH: "/products/1",
    request: {
      isActive: false
    } as UpdateProductRequest,
    response: Product,
    status: 200
  },

  // DELETE - Delete product
  {
    title: "Products - Delete product",
    DELETE: "/products/1",
    status: 204
  },

  {
    title: "Products - Delete non-existent product",
    DELETE: "/products/99999",
    status: 404
  },

  // POST - Bulk update stock
  {
    title: "Products - Bulk stock update",
    POST: "/products/bulk/stock",
    request: {
      updates: [
        { productId: "1", quantity: 10 },
        { productId: "3", quantity: -5 }
      ]
    },
    status: 200
  },

  // GET - Get product statistics
  {
    title: "Products - Get statistics",
    GET: "/products/statistics",
    status: 200
  }
], config);

run(suite, test);
