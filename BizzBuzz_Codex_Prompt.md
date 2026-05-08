# BizzBuzz — Full Codex Prompt: Make Fully Functional & Deploy

## Project Overview

This is a full-stack e-commerce web app called **BizzBuzz** with the following tech stack:
- **Frontend**: React 18 + Vite + React Router + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: MySQL 8+
- **Email**: Nodemailer (Gmail SMTP)

The project currently has a working skeleton but several components are stubs, the backend has security issues, images are not rendering on the homepage, and the app is not ready for production/deployment.

---

## Repository Structure

```
BizzBuzz/
├── backend/
│   ├── app.js
│   ├── db.js
│   ├── db.sql
│   ├── insert.sql
│   ├── package.json
│   ├── controllers/
│   │   ├── userController.js
│   │   ├── productController.js
│   │   ├── cartController.js
│   │   ├── cartProductJunctionController.js
│   │   ├── reviewsController.js
│   │   └── complaintController.js
│   └── routes/
│       ├── userRoutes.js
│       ├── productRoutes.js
│       ├── cartRoutes.js
│       ├── cartProductJunctionRoutes.js
│       ├── reviewsRoutes.js
│       └── complaintRoutes.js
└── frontend/BizzBuzz/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── context/AuthContext.jsx
        ├── routes/RoutingPage.jsx
        └── component/
            ├── Header/Header.jsx
            ├── Homepage/Homepage.jsx
            ├── Auth/Login.jsx
            ├── Auth/Signup.jsx
            ├── Profile/Profile.jsx
            ├── Cart/Cart.jsx
            ├── Cart/Checkout.jsx
            ├── AddProduct/AddProduct.jsx
            ├── AddProduct/EditProduct.jsx
            ├── AddProduct/EditProductForm.jsx
            ├── Admin/Admin.jsx
            └── Complaint/Complaint.jsx
```

---

## Current Bugs & Missing Features — Fix ALL of These

### 1. CRITICAL: Product images not showing on Homepage

**Problem**: `productController.js → getAllProducts()` returns raw MySQL BLOB buffers. The `Homepage.jsx` tries to use `product.PICTURE` directly as an `<img src>` but it's just binary data.

**Fix**: In `getAllProducts()`, convert the PICTURE buffer to a base64 data URL before sending the response, exactly like `getProductsBySeller()` already does:

```js
const products = results.map(product => ({
  ...product,
  PICTURE: product.PICTURE
    ? `data:image/jpeg;base64,${product.PICTURE.toString('base64')}`
    : null
}));
res.json(products);
```

Apply the same fix to `getProductById()` as well.

---

### 2. CRITICAL: Database connection — replace `createConnection` with `createPool`

**Problem**: `db.js` uses `mysql.createConnection()` which drops after idle timeout. This causes "Cannot enqueue Query after fatal error" crashes.

**Fix**: Rewrite `db.js` to use a pool AND promise-based API:

```js
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'BIZZBUZZ',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
```

Update all controllers that call `db.query()` — replace callback-style `db.query(sql, vals, (err, results) => {...})` with promise-style `const [results] = await pool.promise().query(sql, vals)` and wrap each controller function with `async/await` + try/catch. This makes the code cleaner and eliminates nested callbacks.

---

### 3. CRITICAL: Environment variables — remove all hardcoded secrets

**Problem**: `db.js` has hardcoded DB credentials. `cartController.js` has a hardcoded Gmail address and App Password in plain text. This is a security risk.

**Fix**:
1. Create `backend/.env`:
   ```
   PORT=3080
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=BIZZBUZZ
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```
2. Install dotenv: `npm install dotenv`
3. Add `require('dotenv').config();` at the very top of `app.js`
4. Replace all hardcoded values in `db.js` and `cartController.js` with `process.env.VARIABLE_NAME`
5. Add `.env` to `.gitignore`

---

### 4. CRITICAL: Password hashing — never store plain text passwords

**Problem**: `userController.js → signUpUser()` stores passwords directly in the database. `signInUser()` compares plain text. This is a severe security vulnerability.

**Fix**:
1. Install bcrypt: `npm install bcrypt`
2. In `signUpUser()`, hash the password before INSERT:
   ```js
   const bcrypt = require('bcrypt');
   const hashedPassword = await bcrypt.hash(password, 10);
   // Use hashedPassword in the INSERT query instead of password
   ```
3. In `signInUser()`, fetch the user by email only, then compare:
   ```js
   // SELECT * FROM USER WHERE EMAIL = ?
   // Then: const match = await bcrypt.compare(password, results[0].PASSWORD);
   // If match → success, else → 401
   ```

---

### 5. CRITICAL: Admin.jsx is a stub — build a full Admin Dashboard

**Problem**: `Admin.jsx` only returns `<div>Hello Admin</div>`. This is completely non-functional.

**Fix**: Build a full Admin Dashboard with these tabs/sections:

**a) Users Management**
- Fetch all users from `GET /users` and display in a table: Name, Email, Phone, User Type
- Add a "Delete" button per row that calls `DELETE /users/:id`

**b) All Products**
- Fetch all products from `GET /products` and display in a table: Name, Price, Quantity, Seller ID
- Show product thumbnail if available

**c) Complaints Management**
- Fetch all complaints from `GET /complaints`
- For each complaint, display the question, the buyer's name/ID, and an answer field
- Add a "Submit Answer" button that calls `POST /complaints/answer` with `{ complaintId, answer, adminId }`

**d) All Orders / Carts**
- Fetch all carts from `GET /carts` and display in a table: Cart ID, Buyer ID, Checkout Date

The dashboard should be protected — if `localStorage.getItem('userType')` is not `'Admin'`, redirect to `/`.

---

### 6. CRITICAL: Complaint.jsx is a stub — build the full Complaint UI

**Problem**: `Complaint.jsx` only returns `<div>No complaint yet</div>`.

**Fix**: Build a full Complaint page with two views:

**If user is a Buyer:**
- A form with a textarea for submitting a new complaint (Question field)
- On submit, call `POST /complaints` with `{ question, buyerId }`
- Below the form, list the user's own complaints: `GET /complaints/buyer/:buyerId`
- Show each complaint's Question and the Answer (if answered by admin, show it; otherwise show "Awaiting response")

**If user is a Seller:**
- Just show their complaints list using the buyer view (sellers are also buyers in this system)

---

### 7. Backend: Missing complaint routes and controller functions

**Problem**: `complaintController.js` only has `getAllComplaints`. Routes for creating complaints and answering them are missing.

**Fix**: Add these functions to `complaintController.js`:

```js
// Create a new complaint
const createComplaint = async (req, res) => {
  const { question, buyerId } = req.body;
  const [result] = await pool.promise().query(
    'INSERT INTO COMPLAINT (QUESTION, BUYER_ID) VALUES (?, ?)',
    [question, buyerId]
  );
  res.status(201).json({ message: 'Complaint submitted.', complaintId: result.insertId });
};

// Get complaints by buyer
const getComplaintsByBuyer = async (req, res) => {
  const { buyerId } = req.params;
  const [results] = await pool.promise().query(
    'SELECT * FROM COMPLAINT WHERE BUYER_ID = ?',
    [buyerId]
  );
  res.json(results);
};

// Admin answers a complaint
const answerComplaint = async (req, res) => {
  const { complaintId, answer, adminId } = req.body;
  await pool.promise().query(
    'UPDATE COMPLAINT SET ANSWER = ?, ADMIN_ID = ? WHERE COMPLAINT_ID = ?',
    [answer, adminId, complaintId]
  );
  res.status(200).json({ message: 'Complaint answered.' });
};
```

Add matching routes to `complaintRoutes.js`:
```js
router.get('/complaints', complaintController.getAllComplaints);
router.post('/complaints', complaintController.createComplaint);
router.get('/complaints/buyer/:buyerId', complaintController.getComplaintsByBuyer);
router.post('/complaints/answer', complaintController.answerComplaint);
```

---

### 8. Backend: Missing review routes and controller functions

**Problem**: `reviewsController.js` only has `getAllReviews`. Users cannot submit reviews.

**Fix**: Add these functions to `reviewsController.js`:

```js
// Get reviews for a specific product
const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;
  const [results] = await pool.promise().query(
    `SELECT R.*, U.NAME as BUYER_NAME 
     FROM REVIEWS R JOIN USER U ON R.BUYER_ID = U.USER_ID 
     WHERE R.PRODUCT_ID = ?`,
    [productId]
  );
  res.json(results);
};

// Submit a review
const createReview = async (req, res) => {
  const { starRating, reviewText, buyerId, productId } = req.body;
  const reviewDate = new Date().toISOString().split('T')[0];
  await pool.promise().query(
    'INSERT INTO REVIEWS (REVIEW_DATE, STAR_RATING, REVIEW_TEXT, BUYER_ID, PRODUCT_ID) VALUES (?, ?, ?, ?, ?)',
    [reviewDate, starRating, reviewText, buyerId, productId]
  );
  res.status(201).json({ message: 'Review submitted.' });
};

// Delete a review
const deleteReview = async (req, res) => {
  const { id } = req.params;
  await pool.promise().query('DELETE FROM REVIEWS WHERE REVIEW_ID = ?', [id]);
  res.status(200).json({ message: 'Review deleted.' });
};
```

Add matching routes to `reviewsRoutes.js`:
```js
router.get('/reviews', reviewsController.getAllReviews);
router.get('/reviews/product/:productId', reviewsController.getReviewsByProduct);
router.post('/reviews', reviewsController.createReview);
router.delete('/reviews/:id', reviewsController.deleteReview);
```

Update `Homepage.jsx` to show reviews per product: when a user clicks on a product card, show a modal or expand section with that product's reviews fetched from `GET /reviews/product/:productId`. Also show a form for logged-in buyers to submit a review (star rating 1–5 + text).

---

### 9. Backend: Add delete product endpoint

**Problem**: `productController.js` has no `deleteProduct` function. Sellers cannot delete their products.

**Fix**: Add to `productController.js`:
```js
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  await pool.promise().query('DELETE FROM PRODUCT WHERE PRODUCT_ID = ?', [id]);
  res.status(200).json({ message: 'Product deleted.' });
};
```

Add to `productRoutes.js`:
```js
router.delete('/products/:id', productController.deleteProduct);
```

Update `EditProduct.jsx` to show a "Delete" button per product that calls this endpoint, then refreshes the list.

---

### 10. Frontend: Fix the URL typo on the Complaint route

**Problem**: In `App.jsx`, the complaint route is `path: "/compalint"` (typo). In `Header.jsx`, the navigation also uses `/compalint`.

**Fix**: Change both to `/complaint` (correct spelling) consistently in both `App.jsx` and `Header.jsx`.

---

### 11. Frontend: Configure Vite proxy for API calls

**Problem**: All API calls are hardcoded to `http://localhost:3080`. In production, this will break.

**Fix**: Update `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

Then update ALL `fetch()` calls in frontend components to use relative paths starting with `/api/` instead of `http://localhost:3080/`. For example:
- `fetch('http://localhost:3080/products')` → `fetch('/api/products')`
- `fetch('http://localhost:3080/signin')` → `fetch('/api/signin')`
- etc.

Do this for every component: Homepage.jsx, Cart.jsx, Login.jsx, Signup.jsx, Profile.jsx, AddProduct.jsx, EditProduct.jsx, EditProductForm.jsx, Admin.jsx, Complaint.jsx.

---

### 12. Backend: Restrict CORS for production

**Problem**: `app.use(cors())` allows all origins. In production, only your frontend domain should be allowed.

**Fix**:
```js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

Add `FRONTEND_URL=https://your-deployed-frontend-url.com` to `.env`.

---

### 13. Frontend: Add loading states and error boundaries

**Problem**: No loading indicators exist. If the backend is slow, users see blank screens.

**Fix**: In every component that fetches data (Homepage, Cart, Profile, Admin, EditProduct), add:
- A `loading` state initialized to `true`
- Show a spinner/loading message while `loading === true`
- Set `loading = false` in the `.finally()` of each fetch
- Show a user-friendly error message if the fetch fails

Example pattern:
```jsx
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/api/products')
    .then(res => res.json())
    .then(data => setProducts(data))
    .catch(() => setError('Failed to load products. Please try again.'))
    .finally(() => setLoading(false));
}, []);

if (loading) return <div className="text-center p-8">Loading...</div>;
if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
```

---

### 14. Backend: Add basic input validation

**Problem**: No validation on any endpoint. Malformed requests will cause 500 errors or DB corruption.

**Fix**: Add validation at the start of each controller function. At minimum:

- `signUpUser`: require email, password, name, user_type. Validate email format. Require password length >= 8.
- `signInUser`: require email and password.
- `insertProduct`: require name, price (must be positive number), quantity (must be positive integer).
- `createReview`: require starRating between 1–5, productId, buyerId.
- `createComplaint`: require question is not empty, buyerId.
- `checkout`: require buyerId and non-empty products array.

Return `400 Bad Request` with a descriptive message for invalid input.

---

### 15. Checkout: Reduce product inventory on purchase

**Problem**: When a user checks out, the `AVAILABLE` quantity in the PRODUCT table is not decremented. Sellers can be oversold.

**Fix**: Inside the `checkout` function in `cartController.js`, after successfully inserting into `CART_PRODUCT_JUNCTION`, add an UPDATE for each product:

```js
for (const item of products) {
  await pool.promise().query(
    'UPDATE PRODUCT SET AVAILABLE = AVAILABLE - ? WHERE PRODUCT_ID = ? AND AVAILABLE >= ?',
    [item.quantity, item.productId, item.quantity]
  );
}
```

If `affectedRows === 0` for any product, roll back the transaction and return a 400 error indicating that the item is out of stock.

---

## Deployment Instructions

### Backend Deployment — Render.com (free tier)

1. Create a `render.yaml` in the `backend/` folder:
   ```yaml
   services:
     - type: web
       name: bizzbuzz-backend
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: DB_HOST
           value: YOUR_DB_HOST
         - key: DB_USER
           value: YOUR_DB_USER
         - key: DB_PASSWORD
           value: YOUR_DB_PASSWORD
         - key: DB_NAME
           value: BIZZBUZZ
         - key: EMAIL_USER
           value: YOUR_GMAIL
         - key: EMAIL_PASS
           value: YOUR_GMAIL_APP_PASSWORD
         - key: FRONTEND_URL
           value: https://your-frontend.vercel.app
   ```
2. Make sure `package.json` has `"start": "node app.js"` (it already does).
3. Push `backend/` to a GitHub repo (separate from frontend if needed, or use a monorepo).
4. Connect to Render → New Web Service → Select the repo → set root directory to `backend/`.

### Database — PlanetScale or Render MySQL

**Option A: Render MySQL (easiest)**
- In Render dashboard → New → MySQL
- Copy the connection string details (host, user, password, database name) into environment variables on your backend service.
- Run `db.sql` to create the schema: in Render's MySQL dashboard, open the shell and paste the contents of `db.sql`.

**Option B: PlanetScale (free tier)**
- Create account at planetscale.com → New database → `bizzbuzz`
- In the database settings, go to Branches → main → Connect → choose Node.js
- Copy the connection string and set it as `DATABASE_URL` env var, or split into individual `DB_*` variables.
- Run the SQL schema via PlanetScale's web console.
- Note: PlanetScale does not support foreign key constraints by default. You may need to remove the `FOREIGN KEY` lines from `db.sql` or enable them in settings.

### Frontend Deployment — Vercel (free tier)

1. Create `frontend/BizzBuzz/.env.production`:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
2. Update all API calls in the frontend to use `import.meta.env.VITE_API_URL` as the base URL instead of `/api/` (since Vite proxy only works in local dev). Create a helper file `src/api.js`:
   ```js
   const BASE_URL = import.meta.env.VITE_API_URL || '';
   export const apiUrl = (path) => `${BASE_URL}${path}`;
   ```
   Then in all components use `fetch(apiUrl('/products'))` instead of `fetch('/api/products')`.
3. Push `frontend/BizzBuzz/` to GitHub.
4. Go to vercel.com → New Project → Import the frontend repo.
5. Set the root directory to `frontend/BizzBuzz` (or wherever `package.json` is).
6. Set environment variable in Vercel dashboard: `VITE_API_URL = https://your-backend.onrender.com`
7. Vercel will auto-detect Vite and set `npm run build` as the build command and `dist` as the output directory.

### Final Checklist Before Going Live

- [ ] `.env` is in `.gitignore` and never committed
- [ ] All passwords are hashed with bcrypt in the DB
- [ ] CORS `FRONTEND_URL` env var is set to the Vercel URL
- [ ] `VITE_API_URL` is set to the Render backend URL in Vercel
- [ ] The database schema (`db.sql`) has been run on the production DB
- [ ] Test signup, login, add product, add to cart, checkout flow end-to-end
- [ ] Test that a receipt email is received after checkout
- [ ] Test that Admin dashboard loads and shows users/complaints
- [ ] Test submitting and answering a complaint

---

## Summary of All Tasks (in priority order)

1. Fix `getAllProducts` and `getProductById` to convert PICTURE BLOB to base64
2. Replace `createConnection` with `createPool` in `db.js`, use async/await in all controllers
3. Add `.env` support with `dotenv`, remove all hardcoded secrets
4. Add `bcrypt` password hashing to signup/signin
5. Build full `Admin.jsx` dashboard (users, products, complaints, orders)
6. Build full `Complaint.jsx` (submit form + list own complaints)
7. Add missing complaint controller functions + routes (create, getByBuyer, answer)
8. Add missing reviews controller functions + routes (getByProduct, create, delete)
9. Add delete product endpoint and button in EditProduct.jsx
10. Fix `/compalint` typo → `/complaint` in App.jsx and Header.jsx
11. Configure Vite proxy for local dev and `VITE_API_URL` for production
12. Restrict CORS to the frontend URL
13. Add loading states and error handling to all data-fetching components
14. Add input validation to all backend endpoints
15. Decrement `AVAILABLE` inventory on checkout
16. Deploy backend to Render, database to Render MySQL or PlanetScale, frontend to Vercel
