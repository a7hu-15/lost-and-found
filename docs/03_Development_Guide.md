# Document 3: Development & Implementation Guide

## 🛠️ Codebase Structure

```
lost & found/
├── backend/
│   ├── app/
│   │   ├── api/v1/ (auth, lost_items, found_items, search, matches, claims, track, admin, analytics)
│   │   ├── core/ (config)
│   │   ├── database/ (base, session)
│   │   ├── matching/ (engine)
│   │   ├── models/ (user, lost_item, found_item, match, claim, audit)
│   │   ├── notifications/ (service)
│   │   ├── schemas/ (pydantic schemas)
│   │   └── security/ (passwords, jwt, dependencies)
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Footer, ItemCard, SimilarityMeter, StatsCard)
│   │   ├── pages/ (Home, ReportLost, ReportFound, Search, TrackReport, HowItWorks, Matches, Claims, AdminDashboard)
│   │   ├── services/ (api client)
│   │   └── styles/ (globals.css - Vercel/Linear design system)
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── tsconfig.json
└── docs/
```

---

## 🧠 Intelligent Matching Engine Logic
Located in `backend/app/matching/engine.py`:

```python
def calculate_item_similarity(lost: LostItem, found: FoundItem):
    # Category Exact Match (30%)
    category_score = 30.0 if lost.category.lower() == found.category.lower() else 0.0
    
    # Brand Match (15%)
    brand_score = 15.0 if lost.brand and found.brand and lost.brand.lower() == found.brand.lower() else 5.0
    
    # Color Match (15%)
    color_score = 15.0 if lost.color and found.color and lost.color.lower() == found.color.lower() else 5.0
    
    # Location Match (15%)
    location_score = 15.0 if lost.location.lower() == found.location.lower() else 5.0
    
    # Date Proximity (15%)
    days_diff = abs((lost.lost_date - found.found_date).days)
    date_score = 15.0 if days_diff == 0 else (12.0 if days_diff <= 2 else 5.0)
    
    # Description Token Overlap (10%)
    words_lost = set(lost.description.lower().split())
    words_found = set(found.description.lower().split())
    intersection = words_lost.intersection(words_found)
    desc_score = min(10.0, len(intersection) * 2.0)

    total_score = category_score + brand_score + color_score + location_score + date_score + desc_score
    return total_score
```

---

## 📩 Notification Dispatch Workflow
Located in `backend/app/notifications/service.py`:
- `send_report_confirmation_email`: Sends Report ID & private tracking URL upon submission.
- `send_match_alert_email`: Sends match confidence alert when score $\ge 50\%$.
- `send_claim_approved_email`: Sends pickup instructions (*"Collect from Security Desk Gate 1 with Student ID"*) when Security Staff approves claim.
