from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from care.emotion_router import router as emotion_router

# Create FastAPI app
app = FastAPI(
    title="Mental Health Assessment API",
    description="API for emotion detection and mental health assessment",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(emotion_router)

# Root endpoint
@app.get("/")
async def root():
    """
    Root endpoint providing API information
    """
    return {
        "status": "running",
        "service": "Mental Health Assessment API",
        "version": "1.0.0",
        "endpoints": {
            "root": "/",
            "docs": "/docs",
            "emotion_questions": "/emotion/questions",
            "emotion_analysis": "/emotion/analyze"
        }
    }

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)