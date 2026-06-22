import requests

api_base = "http://localhost:8000"

# Fetch all participants
res = requests.get(f"{api_base}/participants/")
if not res.ok:
    print("Failed to get participants")
    exit(1)

participants = res.json()
print(f"Total participants: {len(participants)}")

for p in participants:
    if p.get("team_id"):
        team_id = p["team_id"]
        print(f"Participant {p['id']} has team {team_id}")
        t_res = requests.get(f"{api_base}/teams/{team_id}")
        print(f"Team fetch status: {t_res.status_code}")
        if t_res.ok:
            team = t_res.json()
            print(f"Team member_ids: {team.get('member_ids')}")
            for mid in team.get('member_ids', []):
                m_res = requests.get(f"{api_base}/participants/{mid}")
                print(f"  Fetch member {mid}: {m_res.status_code}")
