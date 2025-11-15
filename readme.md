# Humanity OS

Humanity OS is a comprehensive web platform designed to enhance human well-being and environmental consciousness. It integrates features for mental health assessment, environmental impact tracking, and real-time data visualization to provide a holistic approach to personal and planetary health.

## ✨ Key Features

- **🧠 AI-Powered Mental Health Assessment**: A "Care" feature that uses a combination of facial emotion recognition and natural language processing (via Google's Gemini) to analyze a user's emotional state and provide empathetic feedback and recommendations.
- **💨 Carbon Footprint Calculator**: Allows users to calculate and track their environmental impact.
- **🗺️ Real-time Data Maps**: Interactive maps for visualizing data related to water resources and fire incidents.
- **農業 Farm & Event Management**: Features for managing agricultural data and community events.
- **🔐 User Authentication**: Secure user registration and login system using JWT.

## 🛠️ Tech Stack

| Category              | Technology                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| **Frontend**          | [React](https://reactjs.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [DaisyUI](https://daisyui.com/), [Zustand](https://zustand-demo.pmnd.rs/), [React Router](https://reactrouter.com/), [Leaflet](https://leafletjs.com/) |
| **Backend (Node.js)** | [Express.js](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), [Mongoose](https://mongoosejs.com/), [JWT](https://jwt.io/), [Bcrypt.js](https://github.com/kelektiv/node.bcrypt.js)      |
| **AI Service (Python)** | [FastAPI](https://fastapi.tiangolo.com/), [LangChain](https://www.langchain.com/), [Google Gemini](https://deepmind.google/technologies/gemini/), [Hugging Face Transformers](https://huggingface.co/transformers) |

## 📂 Project Structure

The project is organized into three main directories:

- **/frontend**: Contains the React-based user interface.
- **/backend**: The core Node.js and Express.js API that handles users, environmental data, events, and more.
- **/care**: A Python-based microservice using FastAPI to handle the AI/ML-powered mental health assessments.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.9 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) instance (local or cloud)

### 1. Backend (Node.js) Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file and add your environment variables
# (e.g., MONGO_URI, JWT_SECRET)
# You can rename the existing .env file if it exists
mv .env .env.example
touch .env

# Start the development server
npm run dev
```

### 2. AI Service (Python) Setup

```bash
# Navigate to the root directory
cd ..

# Create a virtual environment
python -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create a .env file in the root directory for the Google API Key
# GOOGLE_API_KEY=your_api_key

# Start the FastAPI server
uvicorn main:app --reload
```

### 3. Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Once all services are running:
- The **Frontend** will be accessible at `http://localhost:5173` (or another port specified by Vite).
- The **Node.js Backend** will be running at `http://localhost:8080` (or as configured).
- The **Python AI Service** will be running at `http://localhost:8000`.

## 📄 API Endpoints

The application runs two separate APIs:

- **Node.js API**: Handles CRUD operations for `Users`, `Farm`, `Events`, `Carbon`, `Water`, and `Fire`. Refer to the `/backend/routes` directory for detailed endpoints.
- **Python FastAPI**: Provides the mental health assessment services.
  - `GET /emotion/questions`: Generates 4 open-ended questions.
  - `POST /emotion/analyze`: Analyzes user's image and text responses.
  - `GET /docs`: Interactive API documentation.