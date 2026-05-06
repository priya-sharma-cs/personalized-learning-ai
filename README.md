# 🎓 Personalized Learning AI

> An AI-powered student performance prediction and personalized learning recommendation system that detects knowledge gaps and supports early academic intervention.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![XGBoost](https://img.shields.io/badge/XGBoost-ML%20Model-orange)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📌 About the Project

This project is an **AI-powered learning platform** that uses machine learning techniques to detect knowledge gaps in students based on their performance and learning patterns. The system provides **personalized learning recommendations** to support early academic intervention and improve learning outcomes.

The platform combines a modern React frontend with a powerful FastAPI backend, powered by an **XGBoost classification model** and enhanced with **Generative AI explanations via the Groq API**.

---

## ✨ Features

### 🎨 Frontend
- 📊 **Student Dashboard** — Overview of all students with risk status and performance summary
- 📝 **Risk Prediction Form** — Input student data and get instant AI-powered risk predictions
- 💡 **Learning Recommendations Display** — Personalized learning paths shown clearly per student
- 📈 **Charts & Analytics** — Visual graphs for attendance, scores, and performance trends

### ⚙️ Backend & AI
- 🤖 **XGBoost Prediction Model** — High-accuracy student performance classification
- 🔍 **Student Risk Detection** — Identifies at-risk students using ML-based analysis
- 🧠 **AI-Powered Explanations** — GenAI recommendations using Grok API
- ⚡ **Real-time Predictions** — Instant results via `/predict` REST API endpoint
- 🔗 **Full-Stack Integration** — Seamless React frontend + FastAPI backend with CORS

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool & Dev Server |
| JavaScript (ES6+) | Core Language |
| ESLint | Code Quality |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | REST API Framework |
| Uvicorn | ASGI Server |
| XGBoost | ML Classification Model |
| Scikit-learn | Data Preprocessing |
| Pandas | Data Manipulation |
| Joblib | Model Serialization |
| Groq API | GenAI Explanations |

---

## 📁 Project Structure

```
personalized-learning-ai/
├── frontend/          # React + Vite frontend application
│   ├── src/           # Components, pages, charts
│   └── public/        # Static assets
├── backend/           # FastAPI backend server
│   └── api.py        # API routes and prediction logic
├── model/             # Trained XGBoost model files
├── dataset/           # Student performance datasets
├── notebook/          # Jupyter notebooks for EDA & training
├── src/               # Shared source files
├── public/            # Public assets
├── index.html         # Entry HTML
├── package.json       # Frontend dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

---

### 🔧 Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn pandas scikit-learn xgboost joblib

# Run the server
python -m uvicorn api:app --reload
```

Backend runs at: `http://localhost:8000`

---

### 🎨 Frontend Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `https://personalized-learning-ai-ten.vercel.app`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/predict` | Predict student risk level |

### Example Request

```json
POST /predict
{
  "student_id": "S101",
  "attendance": 75,
  "assignment_score": 60,
  "exam_score": 55,
  "participation": 40
}
```

### Example Response

```json
{
  "risk_level": "High Risk",
  "confidence": 0.87,
  "recommendations": [
    "Schedule one-on-one tutoring sessions",
    "Focus on core concept revision",
    "Increase assignment submission frequency"
  ],
  "ai_explanation": "Based on attendance and performance patterns..."
}
```

---

## 🤖 ML Model Details

- **Algorithm:** XGBoost Classifier (upgraded from Random Forest)
- **Training Data:** Student performance dataset with attendance, scores & participation
- **Features:** Attendance rate, assignment scores, exam scores, participation level
- **Output:** Risk classification (Low / Medium / High) + personalized recommendations
- **GenAI Layer:** Grok API generates human-readable explanations for each prediction

---

###  Features
- REST API built with FastAPI
- Integrated Machine Learning model (XGBoost)
- Real-time prediction via `/predict` endpoint
- CORS enabled for frontend integration

## 📈 Model Updates (Latest)

- ✅ Upgraded from Random Forest → **XGBoost** (better accuracy)
- ✅ Added **GenAI explanation** feature using Grok API
- ✅ Updated dataset for improved training results
- ✅ Trained model saved in `/model` folder
- ✅ CORS enabled for seamless frontend integration

---

## 👩‍💻  Contributions

> We worked across the **entire project stack** — from data to deployment-ready UI.

### 🎨 Frontend (React + Vite)
- Built the complete **Student Dashboard** with risk status cards
- Developed the **Risk Prediction Form** with real-time API integration
- Created **Learning Recommendations Display** to show personalized suggestions
- Implemented **Charts & Analytics** for visual performance insights
- Connected frontend seamlessly with FastAPI backend

### 🤖 ML Model
- Upgraded model from Random Forest → **XGBoost** for improved accuracy
- Added **Grok API integration** for GenAI-powered explanations
- Preprocessed and cleaned dataset for better training results

### ⚙️ Backend (FastAPI)
- Built REST API with **FastAPI + Uvicorn**
- Developed `/predict` endpoint for real-time student risk prediction
- Integrated trained XGBoost model using **Joblib**
- Enabled **CORS** for frontend-backend communication

### 📊 Dataset & Notebooks
- Performed **Exploratory Data Analysis (EDA)** in Jupyter notebooks
- Prepared and updated training dataset
- Documented model training and evaluation process

---

## 👥 Team

| Member | Role |
|--------|------|
| Priya Sharma | Full Stack-Backend, Notebooks |
| Madhav | Frontend UI & Backend Integration |
|Riya | ML Models & Notebook|

---

## 🙌 Acknowledgements

- [FastAPI](https://fastapi.tiangolo.com/) — blazing fast API framework
- [XGBoost](https://xgboost.readthedocs.io/) — powerful gradient boosting model
- [Vite](https://vite.dev/) — lightning fast frontend build tool
- [Grok API](https://x.ai/) — AI-powered explanations

---

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">Made with ❤️ by the Personalized Learning AI Team</p>






