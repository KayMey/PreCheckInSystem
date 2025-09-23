\# Pre-Check-In System



\- Backend (NodeExpress + Supabase + Clickatell) `backend`

\- Frontend (Vite + React) `frontend`



\## Local dev

1\. Backend

&nbsp;  - Create `backend.env` with SUPABASE\_URL, SUPABASE\_KEY, CLICKATELL\_API\_KEY, FRONTEND\_URL

&nbsp;  - `cd backend`

&nbsp;  - `npm install`

&nbsp;  - `npm start`  (serves at httplocalhost4000)



2\. Frontend

&nbsp;  - Create `frontend.env` with `VITE\_API\_URL=httplocalhost4000`

&nbsp;  - `cd frontend`

&nbsp;  - `npm install`

&nbsp;  - `npm run dev`  (serves at httplocalhost5173)



