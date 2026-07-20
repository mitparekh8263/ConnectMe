\# ConnectMe



A scalable MERN stack blogging application containerized with Docker, orchestrated using Kubernetes, and deployed on AWS.



\## Project Structure

\- \*\*/backend\*\*: Express \& Node.js server with MongoDB routing.

\- \*\*/frontend\*\*: Client-side application interface.



\## Local Setup Instructions



\### 1. Environment Variables

Create a `.env` file inside your `/backend` folder and add your required configurations (e.g., `PORT`, `MONGO\_URI`).



\### 2. Install and Run Locally

Navigate into both folders separately to install dependencies and spin up your application servers:



```bash

\# Setup Backend

cd backend

npm install

npm start



\# Setup Frontend

cd ../frontend

npm install

npm run dev

```



