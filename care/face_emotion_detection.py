from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
from PIL import Image
import base64
import io

app = FastAPI(title="Emotion Detection API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize emotion detection model
print("Loading emotion detection model...")
emotion_classifier = pipeline(
    "image-classification",
    model="dima806/facial_emotions_image_detection",
    device=-1
)
print("Model loaded successfully!")


class ImageRequest(BaseModel):
    image: str  # Base64 encoded image
    


class EmotionResponse(BaseModel):
    emotion: str
    confidence: float
    all_predictions: list


@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "Emotion Detection API",
        "version": "1.0.0"
    }


@app.post("/predict", response_model=EmotionResponse)
async def predict_emotion(request: ImageRequest):
    """
    Predict emotion from base64 encoded image
    
    Request body:
    {
        "image": "base64_encoded_image_string"
    }
    
    Response:
    {
        "emotion": "happy",
        "confidence": 95.23,
        "all_predictions": [...]
    }
    """
    try:
        # Decode base64 image
        image_data = request.image
        
        # Remove data URI prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        image_bytes = base64.b64decode(image_data)
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Get predictions
        predictions = emotion_classifier(image)
        
        # Format response
        top_emotion = predictions[0]
        
        return {
            "emotion": top_emotion['label'],
            "confidence": round(top_emotion['score'] * 100, 2),
            "all_predictions": [
                {
                    "emotion": pred['label'],
                    "confidence": round(pred['score'] * 100, 2)
                }
                for pred in predictions
            ]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing image: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)