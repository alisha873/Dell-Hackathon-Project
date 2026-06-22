from sqlalchemy.orm import Session
from app.deps import get_db
from app.models.team import Team

db = next(get_db())
teams = db.query(Team).all()
for t in teams:
    print(f"Team {t.team_id}: {t.name}, members: {t.member_ids}")
