import json

def remove_dark_mile():
    # pubs.json
    with open('src/data/pubs.json', 'r', encoding='utf-8') as f:
        pubs = json.load(f)
    pubs = [p for p in pubs if p.get('pub') not in ['The Dark Mile', 'Dark Mile']]
    # fix ranks
    pubs = sorted(pubs, key=lambda x: x.get('score', 0), reverse=True)
    for i, p in enumerate(pubs):
        p['rank'] = i + 1
    with open('src/data/pubs.json', 'w', encoding='utf-8') as f:
        json.dump(pubs, f, indent=2)

    # timeline.json
    with open('src/data/timeline.json', 'r', encoding='utf-8') as f:
        timeline = json.load(f)
    timeline = [t for t in timeline if t.get('pub') not in ['The Dark Mile', 'Dark Mile']]
    # fix numbers
    for i, t in enumerate(timeline):
        t['number'] = i + 1
    with open('src/data/timeline.json', 'w', encoding='utf-8') as f:
        json.dump(timeline, f, indent=2)

    # matrix.json
    with open('src/data/matrix.json', 'r', encoding='utf-8') as f:
        matrix = json.load(f)
    
    matrix['pubs'] = [p for p in matrix['pubs'] if p not in ['The Dark Mile', 'Dark Mile']]
    
    for row in matrix['rows']:
        if 'Dark Mile' in row['ratings']:
            del row['ratings']['Dark Mile']
        if 'The Dark Mile' in row['ratings']:
            del row['ratings']['The Dark Mile']
            
    with open('src/data/matrix.json', 'w', encoding='utf-8') as f:
        json.dump(matrix, f, indent=2)

    # members.json
    with open('src/data/members.json', 'r', encoding='utf-8') as f:
        members = json.load(f)
    
    # recalculate totals for members.json
    for member in members:
        # find matching matrix entry
        m_match = next((m for m in matrix['rows'] if m['member'] == member['name']), None)
        if m_match:
            ratings = [v for v in m_match['ratings'].values() if v is not None]
            total_ratings = len(ratings)
            member['totalRatings'] = total_ratings
            if total_ratings > 0:
                member['avgScoreGiven'] = round(sum(ratings) / total_ratings, 2)
            else:
                member['avgScoreGiven'] = 0.0
            
    with open('src/data/members.json', 'w', encoding='utf-8') as f:
        json.dump(members, f, indent=2)

    print("Removed Dark Mile from all backend files successfully")

if __name__ == '__main__':
    remove_dark_mile()
