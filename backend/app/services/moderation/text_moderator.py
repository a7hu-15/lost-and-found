import re
import unicodedata
from abc import ABC, abstractmethod
from typing import Tuple

class TextModerationProvider(ABC):
    @abstractmethod
    def moderate_text(self, text: str) -> Tuple[bool, str]:
        """
        Returns (is_flagged, masked_text)
        """
        pass

# Basic local dictionary covering English, Hindi, Haryanvi
PROFANITY_DICT = {
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick',
    'pussy', 'motherfucker', 'whore', 'slut',
    'chutiya', 'chutiye', 'madarchod', 'bhenchod', 'bhosdike', 'bhosdi',
    'gandu', 'harami', 'kutta', 'kamina', 'randi', 'suar', 'gaandu',
    'lodu', 'laura', 'lund', 'jhaat', 'chuut', 'chut',
    'bawli', 'buchi', 'khasam'
}

# Romanized mapping common obfuscations
ROMANIZED_MAP = {
    '@': 'a',
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '$': 's',
    '5': 's',
    '8': 'b',
    'v': 'u' # sometimes bhenchod -> bhenchod
}

class LocalProfanityModerator(TextModerationProvider):
    def moderate_text(self, text: str) -> Tuple[bool, str]:
        if not text:
            return False, text
            
        original_text = text
        
        # Step 1: Lowercase
        normalized = text.lower()
        
        # Step 2: Unicode normalization (NFKD removes accents/diacritics in many cases)
        normalized = unicodedata.normalize('NFKD', normalized).encode('ASCII', 'ignore').decode('utf-8')
        
        # Step 3 & 4: Normalize punctuation and map Romanized variants
        # First, apply the mapping to letters/numbers that are often substituted
        mapped_chars = []
        for char in normalized:
            if char in ROMANIZED_MAP:
                mapped_chars.append(ROMANIZED_MAP[char])
            else:
                mapped_chars.append(char)
        normalized = "".join(mapped_chars)
        
        # Remove punctuation entirely for the check
        # But we need to be careful: if we remove punctuation, "f.u.c.k" becomes "fuck"
        no_punct = re.sub(r'[^a-z0-9\s]', '', normalized)
        
        # We also collapse repeated characters e.g. fuuuck -> fuck
        collapsed = re.sub(r'(.)\1+', r'\1', no_punct)
        
        # Now we tokenize and check
        words_no_punct = set(no_punct.split())
        words_collapsed = set(collapsed.split())
        
        is_flagged = False
        
        # Step 5: Profanity dictionary lookup
        if not PROFANITY_DICT.isdisjoint(words_no_punct) or not PROFANITY_DICT.isdisjoint(words_collapsed):
            is_flagged = True
            
        # Step 6: Mask/Flag
        # If flagged, we mask the original text simply by replacing offending words, 
        # but since obfuscations are tricky to reverse-map exactly to original indices,
        # we do a basic regex on the original text for the obvious ones, and if it was 
        # caught by the deep normalization, we might just flag it without full masking,
        # or we do our best. The prompt says "mask / flag".
        # We will do a simple regex mask on original text for exact/near matches.
        masked_text = original_text
        if is_flagged:
            # Create a regex from the profanity dict
            pattern = re.compile(r'\b(' + '|'.join(PROFANITY_DICT) + r')\b', re.IGNORECASE)
            masked_text = pattern.sub(lambda m: '*' * len(m.group(0)), original_text)
            
            # If the deep check caught something the regex didn't, we can't easily mask it
            # without destroying the text structure. So we rely on the flag status for moderation.
            
        return is_flagged, masked_text

def get_text_moderator() -> TextModerationProvider:
    return LocalProfanityModerator()
