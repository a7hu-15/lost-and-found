import re
from abc import ABC, abstractmethod
from typing import Tuple

class TextModerationProvider(ABC):
    @abstractmethod
    def moderate_text(self, text: str) -> Tuple[bool, str]:
        """
        Returns (is_flagged, masked_text)
        """
        pass

# Basic local dictionary covering English, Hindi, Haryanvi and common obfuscations
PROFANITY_DICT = [
    r'fuck', r'shit', r'bitch', r'asshole', r'bastard', r'cunt', r'dick',
    r'pussy', r'motherfucker', r'whore', r'slut',
    r'chutiya', r'chutiye', r'madarchod', r'bhenchod', r'bhosdike', r'bhosdi',
    r'gandu', r'harami', r'kutta', r'kamina', r'randi', r'suar', r'gaandu',
    r'lodu', r'laura', r'lund', r'jhaat', r'chuut', r'chut',
    # Common obfuscations
    r'fck', r'f\*ck', r'sh\*t', r'b\*tch', r'a\$\$', r'b\@stard',
    r'chutiy@', r'bhench\*d', r'm@darchod', r'g@ndu',
    # Haryanvi basics
    r'bawli', r'buchi', r'khasam'
]

# Create a regex pattern to match these words as whole words
PROFANITY_PATTERN = re.compile(
    r'\b(' + '|'.join(PROFANITY_DICT) + r')\b',
    re.IGNORECASE | re.UNICODE
)

# For embedded exact matches of severe words
SEVERE_PATTERN = re.compile(
    r'(' + '|'.join(PROFANITY_DICT[:15]) + r')', # just top ones
    re.IGNORECASE | re.UNICODE
)

class LocalProfanityModerator(TextModerationProvider):
    def moderate_text(self, text: str) -> Tuple[bool, str]:
        if not text:
            return False, text
            
        original_text = text
        is_flagged = False
        
        # 1. Normalize somewhat: we could remove repeated characters like 'fuuuuck' but simple regex is fine for now
        # We will just replace matched words with asterisks
        def repl(match):
            nonlocal is_flagged
            is_flagged = True
            word = match.group(0)
            return '*' * len(word)
            
        masked_text = PROFANITY_PATTERN.sub(repl, original_text)
        
        # 2. Check for severe substrings that might bypass word boundaries
        if not is_flagged:
            for severe_match in SEVERE_PATTERN.finditer(original_text):
                is_flagged = True
                break
                
        return is_flagged, masked_text

def get_text_moderator() -> TextModerationProvider:
    return LocalProfanityModerator()
