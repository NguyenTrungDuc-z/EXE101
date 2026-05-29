# ViecNhanh Platform

Bo code duoc tach lai tu dau thanh 2 phan ro rang:

- `backend/`: API, model MongoDB, seed data, route admin/user
- `frontend/`: giao dien React cho admin va user

## Cau truc

```text
backend/
  mongo-seed/
  src/
frontend/
  src/
```

## MongoDB collections

- `users`
- `employerprofiles`
- `candidateprofiles`
- `categories`
- `jobposts`
- `applications`
- `orders`
- `payments`
- `complaints`
- `operationtasks`

## Muc tieu MVP

- Admin:
  - dashboard van hanh
  - quan ly bai dang
  - quan ly nha tuyen dung
  - quan ly ung vien
  - hang doi nghiep vu va khiu nai
- User:
  - trang tong quan
  - danh sach viec
  - danh sach ung tuyen va don
  - form dang viec

## Chay local

1. Cai dependencies:

```bash
npm install
npm --workspace backend install
npm --workspace frontend install
```

2. Tao file `backend/.env`:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/viecnhanh
CLIENT_ORIGIN=http://localhost:5173
```

3. Import seed MongoDB tu `backend/mongo-seed/`.

4. Chay backend va frontend:

```bash
npm run dev:backend
npm run dev:frontend
```

## Ghi chu

- Code chinh nam trong `backend/` va `frontend/`.
- API duoc tach ro route `auth`, `admin` va `user`.

## API split

### Admin API

- `GET /api/admin/overview`
- `GET /api/admin/jobs`
- `GET /api/admin/employers`
- `GET /api/admin/candidates`
- `GET /api/admin/operations`

### User API

- `POST /api/auth/login`
- `GET /api/user/home`
- `GET /api/user/jobs`
- `GET /api/user/jobs/:jobCode`
- `GET /api/user/applications`
- `GET /api/user/orders`
- `POST /api/user/jobs`
- `POST /api/user/applications`

## Frontend split

### User routes

- `/`
- `/about`
- `/help`
- `/user/jobs`
- `/user/workspace`
- `/booking`
- `/partner`

### Admin routes

- `/admin`
- `/admin/jobs`
- `/admin/employers`
- `/admin/candidates`
- `/admin/operationsss`
