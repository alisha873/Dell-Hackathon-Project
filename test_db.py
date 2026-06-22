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
    print(f"\nParticipant: {p['name']} (ID: {p['id']}, Team ID: {p.get('team_id')})")
    team_id = p.get("team_id")
    if team_id:
        t_res = requests.get(f"{api_base}/teams/{team_id}")
        if t_res.ok:
            team = t_res.json()
            print(f"  Team: {team['name']}")
            print(f"  Member IDs in team: {team.get('member_ids')}")
        else:
            print(f"  Team {team_id} fetch failed: {t_res.status_code}")
