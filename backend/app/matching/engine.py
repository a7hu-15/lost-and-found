import math
from datetime import date
from typing import Dict, Any, Tuple
from app.models.lost_item import LostItem
from app.models.found_item import FoundItem

def calculate_item_similarity(lost: LostItem, found: FoundItem) -> Tuple[float, Dict[str, Any]]:
    """
    Weighted intelligent matching algorithm comparing lost and found items.
    
    Weights:
    - Category: 30%
    - Brand: 15%
    - Color: 15%
    - Location: 15%
    - Date Proximity: 15%
    - Description Text Overlap: 10%
    """
    score_breakdown = {}
    
    # 1. Category (30%)
    if lost.category.lower().strip() == found.category.lower().strip():
        category_score = 30.0
    else:
        category_score = 0.0
    score_breakdown["category"] = category_score

    # 2. Brand (15%)
    if lost.brand and found.brand:
        b1, b2 = lost.brand.lower().strip(), found.brand.lower().strip()
        if b1 == b2:
            brand_score = 15.0
        elif b1 in b2 or b2 in b1:
            brand_score = 10.0
        else:
            brand_score = 0.0
    elif not lost.brand and not found.brand:
        brand_score = 10.0  # neutral match
    else:
        brand_score = 5.0
    score_breakdown["brand"] = brand_score

    # 3. Color (15%)
    if lost.color and found.color:
        c1, c2 = lost.color.lower().strip(), found.color.lower().strip()
        if c1 == c2:
            color_score = 15.0
        elif c1 in c2 or c2 in c1:
            color_score = 10.0
        else:
            color_score = 0.0
    elif not lost.color and not found.color:
        color_score = 10.0
    else:
        color_score = 5.0
    score_breakdown["color"] = color_score

    # 4. Location (15%)
    loc1, loc2 = lost.location.lower().strip(), found.location.lower().strip()
    if loc1 == loc2:
        location_score = 15.0
    elif loc1 in loc2 or loc2 in loc1 or any(w in loc2 for w in loc1.split() if len(w) > 3):
        location_score = 11.0
    else:
        location_score = 3.0
    score_breakdown["location"] = location_score

    # 5. Date Proximity (15%)
    days_diff = abs((lost.lost_date - found.found_date).days)
    if days_diff == 0:
        date_score = 15.0
    elif days_diff <= 2:
        date_score = 12.0
    elif days_diff <= 7:
        date_score = 8.0
    elif days_diff <= 14:
        date_score = 4.0
    else:
        date_score = 0.0
    score_breakdown["date"] = date_score

    # 6. Description Token Overlap (10%)
    words_lost = set(w.lower() for w in lost.description.split() if len(w) > 2)
    words_found = set(w.lower() for w in found.description.split() if len(w) > 2)
    if words_lost and words_found:
        intersection = words_lost.intersection(words_found)
        union = words_lost.union(words_found)
        jaccard = len(intersection) / len(union) if union else 0.0
        desc_score = min(10.0, round(jaccard * 20.0, 1))
    else:
        desc_score = 5.0
    score_breakdown["description"] = desc_score

    total_score = round(category_score + brand_score + color_score + location_score + date_score + desc_score, 1)
    return total_score, score_breakdown
