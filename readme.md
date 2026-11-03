# The Attic --- Backend API Documentation

**Project:** The Attic --- Furniture E-commerce Platform\
**API Version:** v1\
**Backend:** Node.js, Express.js, MongoDB, Mongoose\
**API Testing:** Insomnia

> **Documentation note:** This document combines routes and behavior
> discussed during development with the Insomnia screenshot. Some paths
> and request fields must be verified against the current Express route
> files before treating this as the final API contract.
> Implemented/discussed APIs are separated from planned customization
> APIs.

------------------------------------------------------------------------

## 1. Base Configuration

**Local Base URL**

``` text
http://localhost:5000/api/v1
```

**Common Headers**

``` http
Content-Type: application/json
Authorization: Bearer <ACCESS_TOKEN>
```

Authentication is required for protected endpoints.

## 2. Standard API Response

All API responses follow this structure.

**Success**

``` json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

**Error**

``` json
{
  "success": false,
  "message": "Something went wrong",
  "data": null
}
```

### Common HTTP Status Codes

  Status   Meaning
  -------- ------------------------------------------
  200      Request successful
  201      Resource created
  400      Invalid request
  401      Authentication required or invalid token
  403      Insufficient permissions
  404      Resource not found
  409      Resource conflict
  500      Internal server error

------------------------------------------------------------------------

## 3. Authentication APIs

Base path: `/auth` (**confirm the actual route mount in Express**).

Authentication APIs manage customer registration, login and email OTP
verification.

### 3.1 Register User

**POST** `/auth/register`

Creates a new customer account.

Request:

``` json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

The exact request fields must match the implemented registration
controller.

### 3.2 Login

**POST** `/auth/login`

Authenticates a user and returns an access token.

Request:

``` json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

Expected response:

``` json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {},
    "accessToken": "<JWT_TOKEN>"
  }
}
```

### 3.3 Verify Email OTP

**POST** `/auth/verify-email`

Verifies the user's email using OTP.

Request:

``` json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### 3.4 Resend Email OTP

**POST** `/auth/resend-otp`

Requests a new email verification OTP.

Request:

``` json
{
  "email": "john@example.com"
}
```

------------------------------------------------------------------------

## 4. Product APIs

Base path: `/products`

Products represent the furniture available in The Attic catalogue.

### 4.1 Create Product

**POST** `/products`

Creates a new product. Requires admin authentication.

Request:

``` json
{
  "name": "Premium Solid Sheesham Wood Dining Table",
  "slug": "premium-solid-sheesham-wood-dining-table",
  "sku": "ATT-DT-001",
  "description": "Handcrafted solid Sheesham wood dining table.",
  "shortDescription": "Premium dining table for modern homes.",
  "category": "672a12345678901234567890",
  "roomType": ["dining-room"],
  "woodType": "sheesham",
  "defaultFinish": "natural",
  "dimensions": {
    "width": 200,
    "height": 75,
    "depth": 90,
    "unit": "cm"
  },
  "weight": {
    "value": 45,
    "unit": "kg"
  },
  "basePrice": 25000,
  "salePrice": 23000,
  "images": [],
  "images360": [],
  "customizationEnabled": true,
  "specifications": [],
  "features": [],
  "warranty": {
    "duration": 2,
    "unit": "years",
    "description": "2 years manufacturing warranty"
  },
  "status": "published",
  "isFeatured": false,
  "seo": {
    "title": "Solid Sheesham Wood Dining Table",
    "description": "Buy handcrafted Sheesham dining tables.",
    "keywords": ["Sheesham dining table", "wooden furniture"]
  }
}
```

The backend derives `createdBy` from the authenticated user's JWT. Do
not send `createdBy` from the client.

### 4.2 Get All Products

**GET** `/products`

Fetches catalogue products.

Example:

``` http
GET /products?page=1&limit=10
```

Supported filters depend on the product controller:

-   `page`
-   `limit`
-   `search`
-   `category`
-   `woodType`
-   `minPrice`
-   `maxPrice`

Public catalogue results should only contain published products.

### 4.3 Get Product by ID

**GET** `/products/:productId`

Fetches a product using its MongoDB ObjectId.

### 4.4 Get Product by Slug

**GET** `/products/slug/:slug`

Fetches a product using its SEO-friendly slug.

Example:

``` http
GET /products/slug/premium-solid-sheesham-wood-dining-table
```

### 4.5 Update Product

**PATCH** `/products/admin/:productId`

Updates an existing product. Requires admin authentication.

### 4.6 Delete Product

**DELETE** `/products/admin/:productId`

Removes or archives a product according to the implemented service.

------------------------------------------------------------------------

## 5. Cart APIs

Base path shown in the Insomnia workspace: `/carts`.

> **Route discrepancy to verify:** Earlier implementation discussions
> used `/cart` (singular), while the Insomnia screenshot shows `/carts`
> (plural). Use the path actually mounted in Express consistently across
> the backend, Insomnia and frontend.

Cart functionality currently supports existing catalogue products.

Every cart belongs to an authenticated user. The backend gets `userId`
from `req.user.id`, not from the request body.

### Cart Data Structure

``` json
{
  "_id": "6ae9a6792f16690c59e9d5f8",
  "userId": "6ae8892553b9ced5bdf94560",
  "items": [
    {
      "_id": "6ae9a6792f16690c59e9d5f9",
      "productId": {
        "_id": "6ae98b951d539a23ae245390",
        "name": "Premium Solid Sheesham Wood Dining Table",
        "sku": "ATT-DT-001",
        "basePrice": 25000,
        "salePrice": 23000
      },
      "quantity": 2,
      "priceAtAdd": 23000
    }
  ]
}
```

### 5.1 Get User Cart

**GET** `/carts`

Fetches the authenticated user's cart.

Headers:

``` http
Authorization: Bearer <ACCESS_TOKEN>
```

### 5.2 Add Existing Product to Cart

**POST** `/carts/items`

Adds a catalogue product to the cart.

Request:

``` json
{
  "productId": "6ae98b951d539a23ae245390",
  "quantity": 2
}
```

Behavior:

-   Checks whether the product exists and is published.
-   Creates a cart if the user does not have one.
-   Adds the product if it is not already present.
-   Increases the existing item's quantity if the same product is
    already present.
-   Stores `priceAtAdd` as a reference price.

### 5.3 Update Cart Item Quantity

**PATCH** `/carts/items/:itemId`

Sets the item's quantity to a specified value.

Request:

``` json
{
  "quantity": 5
}
```

Important: `itemId` refers to the `_id` inside the cart's `items` array,
not the product's `_id`.

### 5.4 Increase Cart Item Quantity

**PATCH** `/carts/items/:itemId/increase`

Increases the quantity by one.

No request body required.

Example:

``` http
PATCH /carts/items/6ae9a6792f16690c59e9d5f9/increase
```

Behavior:

``` text
Current quantity: 2
New quantity: 3
```

Uses MongoDB `$inc` to increment the quantity.

### 5.5 Decrease Cart Item Quantity

**PATCH** `/carts/items/:itemId/decrease`

Decreases the quantity by one.

No request body required.

Behavior:

``` text
Current quantity: 3
New quantity: 2
```

Minimum quantity is 1. The operation must not decrease quantity below 1.

### 5.6 Remove Cart Item

**DELETE** `/carts/items/:itemId`

Removes one item from the cart.

### 5.7 Clear Cart

**DELETE** `/carts`

Removes all items from the authenticated user's cart.

------------------------------------------------------------------------

## 6. Customized Product APIs --- Planned

Customized products are not separate catalogue products. They are
configurations based on existing products.

The planned flow is:

1.  Customer opens a product.
2.  Backend returns available customization options.
3.  Customer selects dimensions, wood, finish, metal and other supported
    options.
4.  Backend validates the configuration.
5.  Backend calculates an estimated or approved price.
6.  Customer adds the customized configuration to the cart.

### Planned endpoints

  ----------------------------------------------------------------------------------------------
  Method                  Endpoint                                       Purpose
  ----------------------- ---------------------------------------------- -----------------------
  GET                     `/products/:productId/customization-options`   Fetch customization
                                                                         options

  POST                    `/products/:productId/customization/quote`     Validate selections and
                                                                         calculate price

  POST                    `/carts/customized-items`                      Add customized product
                                                                         to cart
  ----------------------------------------------------------------------------------------------

These endpoints are proposed, not confirmed as implemented.

### Example customized cart item

``` json
{
  "productId": "6ae98b951d539a23ae245390",
  "itemType": "customized",
  "quantity": 1,
  "configuration": {
    "width": 200,
    "height": 75,
    "depth": 90,
    "woodType": "sheesham",
    "woodFinish": "walnut",
    "metalFinish": "black"
  }
}
```

The backend must calculate the price. A client-submitted price must
never be trusted.

------------------------------------------------------------------------

## 7. Authentication and Authorization

Protected endpoints require a JWT access token.

Example:

``` http
Authorization: Bearer <ACCESS_TOKEN>
```

### Middleware responsibilities

**authenticate**

-   Reads the bearer token.
-   Verifies the JWT.
-   Extracts user ID and role.
-   Attaches the authenticated user to `req.user`.

**authorize**

-   Checks whether the authenticated user's role is permitted.
-   Rejects unauthorized requests with HTTP 403.

Admin product operations require:

``` js
authenticate,
authorize("admin")
```

------------------------------------------------------------------------

## 8. Important Implementation Rules

1.  Never trust `userId` submitted by the frontend.
2.  Never trust product prices submitted by the frontend.
3.  Use cart item `_id` for quantity changes and removal.
4.  Use product `_id` when adding a product to the cart.
5.  Validate ObjectIds before querying MongoDB.
6.  Check product publication status before adding it to the cart.
7.  Validate inventory before allowing checkout.
8.  Recalculate prices during checkout.
9.  Save a permanent configuration snapshot in the order when an order
    is placed.
10. Use database unique indexes to enforce unique product SKUs and
    slugs.

------------------------------------------------------------------------

## 9. Current API Coverage

  -----------------------------------------------------------------------
  Module                  API                     Status
  ----------------------- ----------------------- -----------------------
  Authentication          Register, Login, Verify Present in Insomnia
                          OTP, Resend OTP         

  Products                Create, Read, Update,   Implemented/discussed
                          Delete                  

  Cart                    Get cart                Implemented/discussed

  Cart                    Add existing product    Implemented/discussed

  Cart                    Update quantity         Implemented/discussed

  Cart                    Increase quantity       Implemented/discussed

  Cart                    Decrease quantity       Implemented/discussed

  Cart                    Remove item             Implemented/discussed

  Cart                    Clear cart              Implemented/discussed

  Customization           Fetch options           Planned

  Customization           Price quote             Planned

  Customization           Add customized item     Planned
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 10. Items to Verify Before Publishing This API Contract

1.  Confirm whether the cart base path is `/cart` or `/carts`.
2.  Confirm the actual add-to-cart route; the Insomnia sidebar appears
    to show a product-ID-based route, while the discussed implementation
    uses `/carts/items`.
3.  Confirm the authentication route mount and exact registration
    request fields.
4.  Confirm whether admin product routes are mounted under
    `/products/admin` or `/admin/products`.
5.  Confirm the exact query parameters supported by the current product
    controller.
