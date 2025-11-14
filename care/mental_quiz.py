from langchain_google_genai import GoogleGenAI
from langgraph import Graph, Node, Edge

model = GoogleGenAI(model_name="gemini-pro", temperature=0.5)

prompt = """"""