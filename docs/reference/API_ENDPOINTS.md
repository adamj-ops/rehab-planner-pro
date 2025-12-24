# Phase 2A API Endpoints

> **Purpose:** Document all API routes for Phase 2A with request/response examples. Use this as a reference when building frontend features or debugging API issues.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Color Endpoints](#color-endpoints)
4. [Material Endpoints](#material-endpoints)
5. [Moodboard Endpoints](#moodboard-endpoints)
6. [Error Handling](#error-handling)

---

## Overview

### Base URL

```
Development: http://localhost:3000/api
Production:  https://your-domain.com/api
```

### Request Headers

```http
Content-Type: application/json
Cookie: sb-access-token=...; sb-refresh-token=...
```

### Response Format

All endpoints return JSON with consistent structure:

**Success:**
```json
{
  "data": { ... },
  "message": "Success"
}
```

**List Response:**
```json
{
  "data": [ ... ],
  "total": 150,
  "page": 1,
  "limit": 50,
  "hasMore": true
}
```

**Error:**
```json
{
  "error": "Error message",
  "details": "Additional context",
  "code": "ERROR_CODE"
}
```

---

## Authentication

All endpoints require authentication via Supabase session cookies, which are set automatically by the Supabase auth client.

### Verify Auth

```http
GET /api/auth/user
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

---

## Color Endpoints

### List Colors

Browse color library with optional filters.

```http
GET /api/colors
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50, max: 100) |
| `brand` | string | Filter by brand (e.g., "Sherwin Williams") |
| `colorFamily` | string | Filter by family (white, gray, blue, etc.) |
| `lrvMin` | number | Minimum LRV (0-100) |
| `lrvMax` | number | Maximum LRV (0-100) |
| `undertone` | string | Filter by undertone (warm, cool, neutral) |
| `designStyle` | string | Filter by style (modern, farmhouse, etc.) |
| `roomType` | string | Filter by recommended room |
| `popular` | boolean | Only popular colors |
| `search` | string | Search name or code |

**Example Request:**
```bash
curl "http://localhost:3000/api/colors?colorFamily=gray&popular=true&limit=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-1",
      "brand": "Sherwin Williams",
      "colorCode": "SW 7015",
      "colorName": "Repose Gray",
      "hexCode": "#C2BCB0",
      "rgbValues": { "r": 194, "g": 188, "b": 176 },
      "lrv": 58,
      "undertones": ["warm", "neutral"],
      "colorFamily": "gray",
      "finishOptions": ["flat", "eggshell", "satin", "semi-gloss"],
      "recommendedRooms": ["living_room", "bedroom"],
      "designStyles": ["transitional", "contemporary"],
      "popular": true,
      "isActive": true
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "hasMore": true
}
```

---

### Get Single Color

```http
GET /api/colors/{id}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/colors/uuid-1"
```

**Response:**
```json
{
  "id": "uuid-1",
  "brand": "Sherwin Williams",
  "colorCode": "SW 7015",
  "colorName": "Repose Gray",
  "hexCode": "#C2BCB0",
  "rgbValues": { "r": 194, "g": 188, "b": 176 },
  "lrv": 58,
  "undertones": ["warm", "neutral"],
  "colorFamily": "gray",
  "finishOptions": ["flat", "eggshell", "satin", "semi-gloss"],
  "recommendedRooms": ["living_room", "bedroom", "bathroom"],
  "designStyles": ["transitional", "contemporary"],
  "imageUrl": null,
  "popular": true,
  "yearIntroduced": 2014,
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

---

### Get Popular Colors

```http
GET /api/colors/popular
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Number of colors (default: 20) |
| `designStyle` | string | Filter by design style |

**Response:**
```json
{
  "data": [
    { "id": "...", "colorName": "Pure White", ... },
    { "id": "...", "colorName": "Repose Gray", ... }
  ]
}
```

---

### List Project Color Selections

```http
GET /api/projects/{projectId}/colors
```

**Response:**
```json
{
  "data": [
    {
      "id": "selection-uuid",
      "projectId": "project-uuid",
      "roomType": "kitchen",
      "roomName": null,
      "surfaceType": "walls",
      "colorId": "color-uuid",
      "color": {
        "id": "color-uuid",
        "colorName": "Pure White",
        "hexCode": "#F2EEE5"
      },
      "finish": "eggshell",
      "coats": 2,
      "primerNeeded": false,
      "linkedScopeItemId": "scope-uuid",
      "notes": null,
      "isPrimary": true,
      "isApproved": true
    }
  ]
}
```

---

### Create Color Selection

```http
POST /api/color-selections
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "roomType": "kitchen",
  "roomName": null,
  "surfaceType": "walls",
  "colorId": "color-uuid",
  "finish": "eggshell",
  "coats": 2,
  "primerNeeded": false,
  "notes": "Client approved this color",
  "isPrimary": true
}
```

**Response:**
```json
{
  "id": "new-selection-uuid",
  "projectId": "project-uuid",
  "roomType": "kitchen",
  "surfaceType": "walls",
  "colorId": "color-uuid",
  "color": { ... },
  "finish": "eggshell",
  "coats": 2,
  "linkedScopeItemId": "auto-created-scope-uuid",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Update Color Selection

```http
PATCH /api/color-selections/{id}
```

**Request Body:**
```json
{
  "colorId": "different-color-uuid",
  "finish": "satin",
  "isApproved": true
}
```

**Response:**
```json
{
  "id": "selection-uuid",
  "colorId": "different-color-uuid",
  "finish": "satin",
  "isApproved": true,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

---

### Delete Color Selection

```http
DELETE /api/color-selections/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Color selection deleted"
}
```

---

## Material Endpoints

### List Materials

```http
GET /api/materials
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 50) |
| `materialType` | string | countertop, flooring, tile, etc. |
| `brand` | string | Filter by brand |
| `designStyle` | string | Filter by style |
| `roomType` | string | Filter by recommended room |
| `priceMin` | number | Minimum price per unit |
| `priceMax` | number | Maximum price per unit |
| `popular` | boolean | Only popular materials |
| `search` | string | Search product name |

**Example Request:**
```bash
curl "http://localhost:3000/api/materials?materialType=countertop&priceMax=100"
```

**Response:**
```json
{
  "data": [
    {
      "id": "material-uuid",
      "materialType": "countertop",
      "materialCategory": "Quartz",
      "brand": "Caesarstone",
      "productName": "White Attica",
      "modelNumber": "5143",
      "description": "White quartz with subtle veining",
      "colorDescription": "White with gray veins",
      "finish": "Polished",
      "dimensions": "130\" x 65\" slab",
      "thickness": "3cm",
      "avgCostPerUnit": 85.00,
      "unitType": "sqft",
      "typicalLeadTimeDays": 14,
      "imageUrl": "https://...",
      "recommendedFor": ["kitchen", "bathroom"],
      "designStyles": ["modern", "transitional"],
      "popular": true
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 50,
  "hasMore": false
}
```

---

### Get Single Material

```http
GET /api/materials/{id}
```

**Response:**
```json
{
  "id": "material-uuid",
  "materialType": "countertop",
  "brand": "Caesarstone",
  "productName": "White Attica",
  "modelNumber": "5143",
  "description": "Premium quartz surface...",
  "avgCostPerUnit": 85.00,
  "unitType": "sqft",
  "suppliers": [
    {
      "name": "Home Depot",
      "url": "https://homedepot.com/...",
      "price": 89.00,
      "inStock": true
    },
    {
      "name": "Floor & Decor",
      "price": 82.00,
      "inStock": true
    }
  ],
  "imageUrl": "https://...",
  "swatchImageUrl": "https://...",
  "additionalImages": ["https://...", "https://..."]
}
```

---

### Create Material Selection

```http
POST /api/materials/selections
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "roomType": "kitchen",
  "application": "countertops",
  "materialId": "material-uuid",
  "quantity": 32,
  "unitType": "sqft",
  "costPerUnit": 85.00,
  "selectedSupplier": "Floor & Decor",
  "notes": "Includes island and perimeter"
}
```

**Response:**
```json
{
  "id": "selection-uuid",
  "projectId": "project-uuid",
  "roomType": "kitchen",
  "application": "countertops",
  "materialId": "material-uuid",
  "material": { ... },
  "quantity": 32,
  "unitType": "sqft",
  "costPerUnit": 85.00,
  "totalCost": 2720.00,
  "linkedScopeItemId": "auto-created-scope-uuid",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Update Material Selection

```http
PATCH /api/materials/selections/{id}
```

**Request Body:**
```json
{
  "quantity": 35,
  "isApproved": true,
  "orderDate": "2024-02-01"
}
```

---

### Delete Material Selection

```http
DELETE /api/materials/selections/{id}
```

---

## Moodboard Endpoints

### List Project Moodboards

```http
GET /api/moodboards?projectId={projectId}
```

**Response:**
```json
{
  "data": [
    {
      "id": "moodboard-uuid",
      "projectId": "project-uuid",
      "name": "Kitchen Vision",
      "description": "Modern farmhouse kitchen concept",
      "moodboardType": "custom",
      "isPrimary": true,
      "layoutType": "free",
      "canvasWidth": 1275,
      "canvasHeight": 1650,
      "backgroundColor": "#FFFFFF",
      "showGrid": true,
      "gridSize": 20,
      "snapToGrid": true,
      "isPublic": false,
      "viewCount": 0,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 3
}
```

---

### Get Single Moodboard with Elements

```http
GET /api/moodboards/{id}
```

**Response:**
```json
{
  "id": "moodboard-uuid",
  "name": "Kitchen Vision",
  "canvasWidth": 1275,
  "canvasHeight": 1650,
  "backgroundColor": "#FFFFFF",
  "elements": [
    {
      "id": "element-uuid-1",
      "elementType": "color_swatch",
      "positionX": 100,
      "positionY": 100,
      "width": 80,
      "height": 80,
      "rotation": 0,
      "zIndex": 1,
      "opacity": 1,
      "colorId": "color-uuid",
      "color": {
        "colorName": "Pure White",
        "hexCode": "#F2EEE5"
      },
      "showColorName": true,
      "showColorCode": true
    },
    {
      "id": "element-uuid-2",
      "elementType": "text",
      "positionX": 200,
      "positionY": 50,
      "width": 300,
      "height": 50,
      "textContent": "Modern Farmhouse Kitchen",
      "fontFamily": "Inter",
      "fontSize": 24,
      "fontWeight": "bold",
      "textColor": "#1a1a1a"
    },
    {
      "id": "element-uuid-3",
      "elementType": "image",
      "positionX": 100,
      "positionY": 200,
      "width": 400,
      "height": 300,
      "imageUrl": "https://storage.supabase.co/..."
    }
  ]
}
```

---

### Create Moodboard

```http
POST /api/moodboards
```

**Request Body:**
```json
{
  "projectId": "project-uuid",
  "name": "Kitchen Vision",
  "description": "Modern farmhouse concept",
  "layoutType": "free",
  "canvasWidth": 1275,
  "canvasHeight": 1650,
  "backgroundColor": "#FFFFFF"
}
```

**Response:**
```json
{
  "id": "new-moodboard-uuid",
  "projectId": "project-uuid",
  "name": "Kitchen Vision",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### Update Moodboard

```http
PATCH /api/moodboards/{id}
```

**Request Body:**
```json
{
  "name": "Updated Kitchen Vision",
  "backgroundColor": "#F5F5F5",
  "showGrid": false
}
```

---

### Delete Moodboard

```http
DELETE /api/moodboards/{id}
```

---

### Add Moodboard Element

```http
POST /api/moodboards/{id}/elements
```

**Request Body (Color Swatch):**
```json
{
  "elementType": "color_swatch",
  "positionX": 100,
  "positionY": 100,
  "width": 80,
  "height": 80,
  "colorId": "color-uuid",
  "showColorName": true,
  "showColorCode": true
}
```

**Request Body (Text):**
```json
{
  "elementType": "text",
  "positionX": 200,
  "positionY": 50,
  "width": 300,
  "height": 50,
  "textContent": "Kitchen Design",
  "fontFamily": "Inter",
  "fontSize": 24,
  "fontWeight": "bold",
  "textColor": "#1a1a1a"
}
```

**Request Body (Image):**
```json
{
  "elementType": "image",
  "positionX": 100,
  "positionY": 200,
  "width": 400,
  "height": 300,
  "imageUrl": "https://storage.supabase.co/...",
  "imageSource": "upload"
}
```

**Response:**
```json
{
  "id": "new-element-uuid",
  "moodboardId": "moodboard-uuid",
  "elementType": "color_swatch",
  "positionX": 100,
  "positionY": 100,
  "createdAt": "2024-01-15T10:35:00Z"
}
```

---

### Update Moodboard Element

```http
PATCH /api/moodboard-elements/{id}
```

**Request Body:**
```json
{
  "positionX": 150,
  "positionY": 120,
  "width": 100,
  "height": 100,
  "rotation": 15,
  "zIndex": 5
}
```

---

### Delete Moodboard Element

```http
DELETE /api/moodboard-elements/{id}
```

---

### Share Moodboard

```http
POST /api/moodboards/{id}/share
```

**Request Body (Public Link):**
```json
{
  "shareType": "link",
  "passwordProtected": false,
  "expiresAt": "2024-02-15T00:00:00Z"
}
```

**Request Body (Password Protected):**
```json
{
  "shareType": "link",
  "passwordProtected": true,
  "password": "secure123",
  "expiresAt": "2024-02-15T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "share-uuid",
  "shareUrl": "https://your-domain.com/moodboard/abc123xy",
  "shortCode": "abc123xy",
  "expiresAt": "2024-02-15T00:00:00Z",
  "passwordProtected": true
}
```

---

### Export Moodboard

```http
POST /api/moodboards/{id}/export
```

**Request Body:**
```json
{
  "format": "pdf",
  "resolution": "high",
  "includeColorList": true,
  "includeMaterialList": true
}
```

**Response:**
```json
{
  "downloadUrl": "https://storage.supabase.co/.../export.pdf",
  "expiresAt": "2024-01-15T11:30:00Z"
}
```

---

## Error Handling

### Error Response Format

```json
{
  "error": "Human-readable error message",
  "details": "Technical details for debugging",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid request body or parameters |
| 401 | `UNAUTHORIZED` | Not authenticated |
| 403 | `FORBIDDEN` | Not authorized for this resource |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CONFLICT` | Resource already exists |
| 422 | `VALIDATION_ERROR` | Request validation failed |
| 500 | `INTERNAL_ERROR` | Server error |

### Example Error Responses

**Validation Error:**
```json
{
  "error": "Validation failed",
  "details": "colorId must be a valid UUID",
  "code": "VALIDATION_ERROR"
}
```

**Not Found:**
```json
{
  "error": "Color not found",
  "details": "No color with ID 'invalid-uuid' exists",
  "code": "NOT_FOUND"
}
```

**RLS Policy Violation:**
```json
{
  "error": "Access denied",
  "details": "You don't have permission to access this project",
  "code": "FORBIDDEN"
}
```

---

## Rate Limiting

API endpoints are rate limited to prevent abuse:

| Endpoint Type | Limit |
|--------------|-------|
| Read (GET) | 100 requests/minute |
| Write (POST/PATCH/DELETE) | 30 requests/minute |
| Export | 5 requests/minute |

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642089600
```

---

## Related Documentation

- [Component Architecture](../implementation/COMPONENT_ARCHITECTURE.md) - Frontend integration
- [Data Flow Diagrams](../implementation/DATA_FLOW_DIAGRAMS.md) - Request flows
- [Type Definitions](./TYPE_DEFINITIONS_INDEX.md) - TypeScript types
- [Troubleshooting Guide](../testing/TROUBLESHOOTING_GUIDE.md) - Debug API issues

