from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import json
import re

load_dotenv()

# ---------------- PROMPT FOR OPEN-ENDED QUESTIONS ----------------
prompt = """
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
    model="gemini-2.5-flash",
    temperature=0.5
)

care_prompt = ChatPromptTemplate.from_template(prompt)
chain = care_prompt | llm

# ---------------- RUN THE MODEL ----------------
response = chain.invoke({})
raw_text = response.content

#print("Raw AI Output:\n", raw_text)

# -----------------------------------------------------------
# STEP 1 — Extract questions from the numbered list
# -----------------------------------------------------------
pattern = r"\d+\.\s*(.+)"
matches = re.findall(pattern, raw_text)

# Clean whitespace & limit to 4
questions = [q.strip() for q in matches][:4]

# ---------------- CREATE CLEAN JSON ----------------
questions_json = {
    "questions": questions
}

