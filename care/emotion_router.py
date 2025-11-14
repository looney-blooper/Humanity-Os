from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from transformers import pipeline
from PIL import Image
import base64
import io
from typing import List
import re
import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv

load_dotenv()

# Initialize router
router = APIRouter(prefix="/emotion", tags=["emotion"])

# ---------------- PROMPT FOR OPEN-ENDED QUESTIONS ----------------
QUESTION_PROMPT = """
You are an Emotion-Detection Questionnaire Generator.

Your task:
Create exactly 4 open-ended questions to assess a user's emotional and mental state.
These questions must encourage the user to provide descriptive, natural responses.

Output Requirements:
- Provide all 4 questions in a single response.
- Use a numbered list (1 to 4).
- Each question must be open-ended.

Formatting Rules:
- Do NOT provide answer choices.
- Do NOT add explanations.
- Only output the final list of 4 open-ended questions.

Example (do not reuse):
1. <Open-ended question>
2. <Open-ended question>
3. <Open-ended question>
4. <Open-ended question>
"""

# ---------------- LLM SETUP ----------------
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-pro",
    temperature=0.5
)

care_prompt = ChatPromptTemplate.from_template(QUESTION_PROMPT)
question_chain = care_prompt | llm

# Initialize emotion detection model
print("Loading emotion detection model...")
emotion_classifier = pipeline(
    "image-classification",
    model="dima806/facial_emotions_image_detection",
    device=-1
)
print("Emotion detection model loaded successfully!")


# ---------------- PYDANTIC MODELS ----------------
class QAPair(BaseModel):
    question: str
    answer: str

class EmotionRequest(BaseModel):
    image: str  # Base64 encoded image
    QAs: List[QAPair]

class MoodAssessment(BaseModel):
    overall_mood: str = Field(description="Overall emotional state (e.g., anxious, stressed, happy, depressed, neutral)")
    mood_score: int = Field(description="Mood score from 1-10, where 1 is very negative and 10 is very positive")
    key_concerns: List[str] = Field(description="List of key concerns or issues identified")
    emotional_indicators: List[str] = Field(description="Specific emotional indicators from responses")

class ResponseRecommendation(BaseModel):
    empathetic_message: str = Field(description="Warm, empathetic message addressing the user's state")
    recommendations: List[str] = Field(description="3-5 actionable recommendations or coping strategies")
    resources: List[str] = Field(description="Helpful resources or next steps")
    urgency_level: str = Field(description="low, medium, or high - based on severity of concerns")

class EmotionResponse(BaseModel):
    facial_emotion: str
    facial_confidence: float
    mood_assessment: MoodAssessment
    response: ResponseRecommendation

class QuestionsResponse(BaseModel):
    questions: List[str]

# ---------------- ROUTER ENDPOINTS ----------------

@router.get("/questions", response_model=QuestionsResponse)
async def get_questions():
    """
    Get 4 open-ended questions to assess user's emotional and mental state.
    
    Returns:
        QuestionsResponse: Object containing list of 4 questions
    """
    try:
        response = question_chain.invoke({})
        raw_text = response.content

        # Extract questions from the numbered list
        pattern = r"\d+\.\s*(.+)"
        matches = re.findall(pattern, raw_text)

        # Clean whitespace & limit to 4
        questions = [q.strip() for q in matches][:4]

        if len(questions) < 4:
            raise ValueError("Failed to generate 4 questions")

        return QuestionsResponse(questions=questions)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating questions: {str(e)}"
        )

@router.post("/analyze", response_model=EmotionResponse)
async def analyze_emotion(request: EmotionRequest):
    """
    Analyze emotion from base64 encoded image and assess mental state from Q&A responses.
    
    Args:
        request: EmotionRequest containing base64 image and list of Q&A pairs
    
    Returns:
        EmotionResponse: Comprehensive emotion analysis with recommendations
    """
    try:
        # 1. Decode and process facial emotion
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
        
        # Format facial emotion data
        top_emotion = predictions[0]
        facial_emotion = top_emotion['label']
        facial_confidence = round(top_emotion['score'] * 100, 2)

        # 2. Prepare context for LLM
        qa_text = "\n".join([
            f"Q: {qa.question}\nA: {qa.answer}"
            for qa in request.QAs
        ])
        
        # 3. Create structured prompt for Gemini
        assessment_prompt = f"""You are a compassionate mental health assistant. Analyze the following information about a user:

**Facial Emotion Detected:** {facial_emotion} (confidence: {facial_confidence}%)

**User's Responses to Questions:**
{qa_text}

Based on this information, provide a comprehensive assessment in the following JSON format:

{{
    "mood_assessment": {{
        "overall_mood": "brief description of overall emotional state",
        "mood_score": 1-10 integer score,
        "key_concerns": ["concern1", "concern2", ...],
        "emotional_indicators": ["indicator1", "indicator2", ...]
    }},
    "response": {{
        "empathetic_message": "warm, personalized message",
        "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
        "resources": ["resource1", "resource2"],
        "urgency_level": "low/medium/high"
    }}
}}

Consider:
- Consistency between facial emotion and written responses
- Severity of any concerning statements
- Specific language patterns indicating distress
- Actionable and practical recommendations
- If urgency is high, include crisis resources

Respond ONLY with valid JSON, no other text."""

        # 4. Get structured response from Gemini
        response = llm.invoke(assessment_prompt)
        response_text = response.content.strip()
        
        # Extract JSON from response (handle markdown code blocks)
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        # Parse JSON response
        llm_output = json.loads(response_text)
        
        # 5. Structure final response
        return EmotionResponse(
            facial_emotion=facial_emotion,
            facial_confidence=facial_confidence,
            mood_assessment=MoodAssessment(**llm_output["mood_assessment"]),
            response=ResponseRecommendation(**llm_output["response"])
        )
        
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error parsing LLM response: {str(e)}\nResponse: {response_text if 'response_text' in locals() else 'N/A'}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing request: {str(e)}"
        )