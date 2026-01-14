# Run Order - Restaurant Management System

A comprehensive restaurant management system featuring POS, menu management, kitchen display, and table management.

## Features

- **Point of Sale (POS)**: Complete sales system with cart and order management
- **Menu Management**: Full category and item management
- **Kitchen Display (KDS)**: Real-time order display for kitchen staff
- **Table Management**: Complete restaurant table management system
- **AI Assistant**: Smart query assistant powered by Google Gemini
- **WebSocket**: Real-time order updates

## Requirements

- Node.js 20+
- PostgreSQL 14+
- npm or yarn

## Installation

### Backend

```bash
cd Run_Order-backend
npm install
```

### Frontend

```bash
cd Run_Order-frontend
npm install
```

## Configuration

### Database Setup

1. Create a PostgreSQL database named `run_order_db`
2. Copy `.env.example` to `.env` in the `Run_Order-backend` folder:

```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=run_order_db
PORT=3000
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
```

### Seed Data

```bash
cd Run_Order-backend
npm run seed
```

## Running the Application

### Development Mode

**Backend:**
```bash
cd Run_Order-backend
npm run start:dev
```
Server runs at: `http://localhost:3000`

**Frontend:**
```bash
cd Run_Order-frontend
npm run dev
```
App runs at: `http://localhost:5173`

### Production Build

**Backend:**
```bash
cd Run_Order-backend
npm run build
npm run start:prod
```

**Frontend:**
```bash
cd Run_Order-frontend
npm run build
npm run preview
```

## Project Structure

```
Run_Order/
├── Run_Order-backend/     # Backend (NestJS)
│   ├── src/
│   │   ├── entities/      # Database entities
│   │   ├── modules/       # Feature modules
│   │   └── database/      # Seed data
│   └── package.json
│
└── Run_Order-frontend/    # Frontend (React + Vite)
    ├── src/
    │   ├── pages/         # Application pages
    │   ├── components/    # Reusable components
    │   ├── store/         # State management
    │   └── config.ts      # Configuration
    └── package.json
```

## Tech Stack

### Backend
- NestJS
- TypeORM
- PostgreSQL
- Socket.IO
- class-validator

### Frontend
- React 19
- TypeScript
- Chakra UI
- Zustand
- React Router
- Axios
- Socket.IO Client

## API Endpoints

### Categories
- `GET /api/v1/categories` - All categories
- `GET /api/v1/categories/active` - Active categories
- `POST /api/v1/categories` - Create category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Items
- `GET /api/v1/items` - All items
- `GET /api/v1/items/available` - Available items
- `POST /api/v1/items` - Create item
- `PATCH /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item

### Tables
- `GET /api/v1/tables` - All tables
- `GET /api/v1/tables/available` - Available tables
- `POST /api/v1/tables` - Create table
- `PATCH /api/v1/tables/:id` - Update table
- `PATCH /api/v1/tables/:id/status` - Update table status

### Orders
- `GET /api/v1/orders` - All orders
- `GET /api/v1/orders/pending` - Pending orders
- `POST /api/v1/orders` - Create order
- `PATCH /api/v1/orders/:id/status` - Update order status

### AI Assistant
- `POST /api/v1/ai/query` - Process natural language query
- `GET /api/v1/ai/insights` - Quick business insights

## License

MIT License
