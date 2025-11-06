# API Contracts - Grain Sales Website

## Mock Data Location
- Frontend mock data: `/app/frontend/src/mock.js`
- Mock functions: `mockSubmitOrder`, `mockSubmitContact`

## Backend Implementation Plan

### 1. Database Models

#### Order Model
```python
{
  "id": str (UUID),
  "grain_type": str,
  "grain_id": str,
  "quality": str,
  "quantity": float,
  "customer_name": str,
  "customer_phone": str,
  "customer_email": str,
  "comment": str (optional),
  "created_at": datetime
}
```

#### Contact Model
```python
{
  "id": str (UUID),
  "name": str,
  "email": str,
  "phone": str,
  "message": str,
  "created_at": datetime
}
```

#### Grain Model (for catalog management)
```python
{
  "id": str,
  "name_ua": str,
  "name_en": str,
  "quality": str (premium/standard),
  "moisture": str,
  "protein": str,
  "gluten": str,
  "nature": str,
  "image": str (URL),
  "active": bool
}
```

### 2. API Endpoints

#### GET /api/grains
- Returns: List of all active grains
- Response: `[{id, name_ua, name_en, quality, moisture, protein, gluten, nature, image}]`

#### POST /api/orders
- Request Body: `{grain_type, grain_id, quality, quantity, customer_name, customer_phone, customer_email, comment?}`
- Response: `{success: true, order_id: str, message: str}`
- Validation: All required fields, email format, phone format

#### POST /api/contacts
- Request Body: `{name, email, phone, message}`
- Response: `{success: true, message: str}`
- Validation: All required fields, email format

### 3. Frontend Integration Changes

#### Replace in `/app/frontend/src/pages/Catalog.js`
- Remove import of `mockGrainData`
- Add API call to fetch grains from `/api/grains`
- Use `useEffect` to load data on mount

#### Replace in `/app/frontend/src/components/OrderModal.js`
- Remove import of `mockSubmitOrder`
- Replace with axios POST to `/api/orders`

#### Replace in `/app/frontend/src/pages/Contact.js`
- Remove import of `mockSubmitContact`
- Replace with axios POST to `/api/contacts`

### 4. Data Seeding
- Populate grains collection with initial data from mock.js on first run
- Create seed script or migration

### 5. Error Handling
- Backend: Proper error responses with status codes
- Frontend: Display error toasts using sonner
- Validation errors: 400 Bad Request
- Server errors: 500 Internal Server Error
