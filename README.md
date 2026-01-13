# ZATCA E-Invoice System

## Installation

**Server:**
```bash
cd server
npm install
node crtserver.js
```

**Client:**
```bash
cd client/Invoice
npm install
npm run dev
```

## Project Structure

```
zatca-e-invoice/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── crtserver.js
│
└── client/Invoice/
    └── src/
        ├── components/
        └── App.jsx
```

## Environment Variables

Create `.env` file in the **server** folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zatca-invoice
JWT_SECRET=your_secret_key_here
```

**Required values:**
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT authentication
