/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { test } from '@playwright/test';
import { defineAPIs, createTestCases } from '../../src/index.js';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types.js';
import config from '../config.js';
import { GetTestProductId } from '../utils/prepare.js';

const productId = GetTestProductId();

const suite = defineAPIs([
  {
    title: "List all products",
    GET: "/products",
    response: Product,
    status: 200
  },

  {
    title: "List all products (single status array)",
    GET: "/products",
    response: Product,
    status: [200]
  },

  {
    title: "List all products (multiple statuses)",
    GET: "/products",
    response: Product,
    status: [200, 201]
  },

  {
    title: "List with pagination",
    GET: "/products?page=1&limit=20",
    response: Product,
    status: 200
  },

  {
    title: "Filter by category",
    GET: "/products?category=electronics",
    response: Product,
    status: 200
  },

  {
    title: "Filter by price range",
    GET: "/products?minPrice=100&maxPrice=1000",
    response: Product,
    status: 200
  },

  {
    title: "Search by name",
    GET: "/products?search=laptop",
    response: Product,
    status: 200
  },

  {
    title: "Get active products only",
    GET: "/products?isActive=true",
    response: Product,
    status: 200
  },

  {
    title: "Create new product",
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

  {
    title: "Create with negative price",
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
    title: "Create with missing required fields",
    POST: "/products",
    request: {
      name: "Incomplete Product"
    } as CreateProductRequest,
    status: 400
  },

  {
    title: "Create with zero stock",
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

  {
    title: "Get by ID",
    GET: `/products/${productId}`,
    response: Product,
    status: 200
  },

  {
    title: "Get non-existent product",
    GET: "/products/99999",
    status: 404
  },

  {
    title: "Full update",
    PUT: `/products/${productId}`,
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

  {
    title: "Partial update - Price only",
    PATCH: `/products/${productId}`,
    request: {
      price: 1099.99
    } as UpdateProductRequest,
    response: Product,
    status: 200
  },

  {
    title: "Partial update - Stock only",
    PATCH: `/products/${productId}`,
    request: {
      stock: 40
    } as UpdateProductRequest,
    response: Product,
    status: 200
  },

  {
    title: "Deactivate product",
    PATCH: `/products/${productId}`,
    request: {
      isActive: false
    } as UpdateProductRequest,
    response: Product,
    status: 200
  },

  {
    title: "Delete non-existent product",
    DELETE: "/products/99999",
    status: 404
  },

  {
    title: "Bulk stock update",
    POST: "/products/bulk/stock",
    request: {
      updates: [
        { productId: "1", quantity: 10 },
        { productId: "3", quantity: -5 }
      ]
    },
    status: 200
  },

  {
    title: "Get statistics",
    GET: "/products/statistics",
    status: 200
  }
], config);

test.describe('Products', () => {
  const { testCases } = createTestCases(suite);
  for (const tc of testCases) {
    test(tc.title, async ({ request }) => {
      await tc.execute(request);
    });
  }
});