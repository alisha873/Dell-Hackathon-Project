from typing import Dict
from sqlalchemy.orm import Session
from app.models.team import Team
from app.models.participant import Participant
from app.models.evaluation import Evaluation
from app.services.ai.core.llm import call_json_async

async def ask_organizer_chatbot(question: str, db: Session) -> Dict[str, str]:
    """Retrieves context about teams and evaluations and generates an answer using an LLM."""
    
    # Gather high-level stats
    total_teams = db.query(Team).count()
    total_participants = db.query(Participant).count()
    total_evals = db.query(Evaluation).count()
    
    # Gather team specifics (limit to prevent token overflow)
    teams = db.query(Team).limit(10).all()
    team_context = []
    for t in teams:
        members = len(t.member_ids) if t.member_ids else 0
        team_context.append(f"Team '{t.name}' (ID: {t.team_id}): {members} members, Coverage: {t.coverage_score}%")
    
    # Gather evaluation specifics
    evals = db.query(Evaluation).order_by(Evaluation.created_at.desc()).limit(10).all()
    eval_context = []
    for e in evals:
        eval_context.append(f"Eval for idea '{e.idea_id}': Score {e.score}, Feedback: {e.feedback}")

    context = f"""
OVERALL HACKATHON STATS:
- Total Teams: {total_teams}
- Total Participants: {total_participants}
- Total Evaluations: {total_evals}

TEAMS SUMMARY (up to 10):
{chr(10).join(team_context)}

RECENT EVALUATIONS (up to 10):
{chr(10).join(eval_context)}
"""

    prompt = f"""
You are an AI Copilot for a Hackathon Organizer. Answer the organizer's question based ONLY on the provided database context.
If the information is not in the context, clearly state that you don't have enough data to answer.

Context:
{context}

Question: {question}

Return a strictly valid JSON object with the following keys:
- "answer": A direct, helpful response to the organizer's question.
- "confidence": A score from 0.0 to 1.0 indicating how confident you are in the answer based on the context.
"""

    return await call_json_async(prompt)
