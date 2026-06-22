from app.deps import get_db
from app.models.participant import Participant

db = next(get_db())
ps = db.query(Participant).all()
print([p.id for p in ps])
