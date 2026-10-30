# TaskFlow — Student Task Manager

A beginner-friendly full-stack deployment demo: React + Vite frontend, FastAPI backend, PostgreSQL (SQLite fallback for local setup).

## 1. Run the backend locally

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs: http://localhost:8000/docs

By default it uses a local SQLite database. For PostgreSQL, set `DATABASE_URL` before starting the API:

```bash
# Linux/macOS example
export DATABASE_URL='postgresql+psycopg://USER:PASSWORD@HOST:5432/taskflow'
```

## 2. Run the frontend locally

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The frontend defaults to `http://localhost:8000`.

## 3. Deploy backend to EC2

- Launch Ubuntu EC2 and keep SSH (22) restricted to your own IP.
- Install Python, pip and Git; clone this repository.
- Create a virtual environment and install `backend/requirements.txt`.
- Configure `DATABASE_URL` and `FRONTEND_ORIGINS` as environment variables (do not commit secrets).
- Run FastAPI behind Nginx with a systemd service and HTTPS. For a workshop demo, test first with Uvicorn bound to `127.0.0.1:8000` behind Nginx.
- For production, use a domain and TLS certificate. Do not leave port 8000 open to the public.

## 4. Create PostgreSQL on RDS

- Create an RDS PostgreSQL database in the same VPC as EC2.
- Prefer private access (`Public access: No`).
- Add an RDS security-group inbound rule for TCP 5432 with source set to the EC2 security group.
- Set the backend `DATABASE_URL` to `postgresql+psycopg://USER:PASSWORD@RDS_ENDPOINT:5432/taskflow`.
- Store credentials securely (for example, AWS Secrets Manager or protected environment configuration).

## 5. Deploy frontend with Amplify

- Push the repository to GitHub.
- In AWS Amplify, create a new app and connect the repository.
- Set the app root directory to `frontend` if Amplify asks for it.
- Add environment variable `VITE_API_URL` with your backend HTTPS URL, e.g. `https://api.example.com`.
- Deploy. Amplify will build and host the Vite app.
- Update backend `FRONTEND_ORIGINS` to the exact Amplify domain, then restart the backend.

## API endpoints

- `GET /health`
- `GET /tasks`
- `POST /tasks` with `{"title":"Prepare AWS session"}`
- `PATCH /tasks/{id}` with `{"completed":true}`
- `DELETE /tasks/{id}`

## Important security notes

- Never expose RDS directly to the internet.
- Never put database credentials in React/Vite environment variables.
- Use HTTPS for the frontend and API.
- Restrict SSH access and avoid opening database or application ports broadly.
- This starter is for a learning/demo project; add authentication, migrations, rate limiting and stronger operational controls before production use.
