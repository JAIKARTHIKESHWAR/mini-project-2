import sys
import json
import numpy as np
from collections import Counter
import re

class FragranceAnalyzer:
    def __init__(self):
        # Define fragrance note categories
        self.categories = {
            'floral': ['rose', 'jasmine', 'lily', 'lavender', 'lily of the valley', 'magnolia', 'geranium', 'ylang-ylang', 'champaca', 'orange blossom', 'neroli', 'honeysuckle'],
            'woody': ['sandalwood', 'cedar', 'patchouli', 'vetiver', 'oakmoss', 'pine', 'cypress', 'hinoki', 'rosewood', 'amber', 'oud', 'agarwood'],
            'citrus': ['lemon', 'bergamot', 'orange', 'grapefruit', 'mandarin', 'lime', 'yuzu', 'tangerine', 'pink grapefruit'],
            'fresh': ['marine', 'mint', 'green tea', 'rain', 'aquatic', 'ozone', 'sea salt', 'watermelon', 'cucumber'],
            'spicy': ['cinnamon', 'pepper', 'cardamom', 'ginger', 'nutmeg', 'clove', 'cumin', 'saffron', 'pink pepper', 'black pepper', 'sichuan pepper'],
            'sweet': ['vanilla', 'caramel', 'honey', 'chocolate', 'toffee', 'sugar', 'prune', 'cognac', 'beeswax'],
            'oriental': ['incense', 'frankincense', 'myrrh', 'benzoin', 'labdanum', 'opoponax'],
            'leather': ['leather', 'suede', 'tobacco', 'hay', 'castoreum', 'civet'],
            'green': ['grass', 'leaves', 'moss', 'galbanum', 'green tea', 'violet leaf'],
            'powdery': ['iris', 'violet', 'heliotrope', 'almond', 'powder']
        }
        
        # Season associations
        self.seasons = {
            'spring': ['floral', 'green', 'fresh'],
            'summer': ['citrus', 'fresh', 'aquatic'],
            'fall': ['woody', 'spicy', 'oriental'],
            'winter': ['oriental', 'sweet', 'leather']
        }
        
        # Occasion associations
        self.occasions = {
            'work': ['citrus', 'fresh', 'powdery'],
            'casual': ['citrus', 'fresh', 'floral'],
            'date': ['floral', 'sweet', 'oriental'],
            'evening': ['oriental', 'leather', 'woody'],
            'formal': ['woody', 'powdery', 'oriental'],
            'sport': ['citrus', 'fresh', 'aquatic']
        }

    def analyze_notes(self, notes):
        """Analyze fragrance notes and return comprehensive analysis"""
        if not notes or len(notes) == 0:
            return self._empty_analysis()
        
        # Normalize notes
        normalized_notes = [note.lower().strip() for note in notes]
        
        # Categorize notes
        category_counts = self._categorize_notes(normalized_notes)
        
        # Calculate balance
        balance = self._calculate_balance(category_counts)
        
        # Determine seasonality
        seasonality = self._determine_seasonality(category_counts)
        
        # Determine occasion
        occasion = self._determine_occasion(category_counts)
        
        # Calculate intensity
        intensity = self._calculate_intensity(normalized_notes)
        
        # Estimate longevity
        longevity = self._estimate_longevity(normalized_notes)
        
        # Generate mood and personality
        mood = self._determine_mood(category_counts)
        personality = self._determine_personality(category_counts)
        
        # Generate suggestions
        suggestions = self._generate_suggestions(category_counts, normalized_notes)
        
        # Calculate compatibility score
        compatibility_score = self._calculate_compatibility_score(category_counts)
        
        return {
            'prediction': f"{intensity} {seasonality} fragrance perfect for {occasion}",
            'analysis': {
                'balance': balance,
                'seasonality': seasonality,
                'occasion': occasion,
                'intensity': intensity,
                'longevity': longevity,
                'mood': mood,
                'personality': personality,
                'compatibility_score': compatibility_score
            },
            'suggestions': suggestions,
            'category_breakdown': category_counts
        }

    def _categorize_notes(self, notes):
        """Categorize notes into fragrance families"""
        category_counts = {category: 0 for category in self.categories.keys()}
        
        for note in notes:
            for category, category_notes in self.categories.items():
                if any(cat_note in note for cat_note in category_notes):
                    category_counts[category] += 1
                    break
        
        return category_counts

    def _calculate_balance(self, category_counts):
        """Calculate balance between different note categories"""
        total_notes = sum(category_counts.values())
        if total_notes == 0:
            return {category: 0 for category in self.categories.keys()}
        
        balance = {}
        for category, count in category_counts.items():
            balance[category] = round((count / total_notes) * 100, 1)
        
        return balance

    def _determine_seasonality(self, category_counts):
        """Determine the best season for this fragrance"""
        season_scores = {}
        
        for season, preferred_categories in self.seasons.items():
            score = 0
            for category in preferred_categories:
                if category in category_counts:
                    score += category_counts[category]
            season_scores[season] = score
        
        if not season_scores or max(season_scores.values()) == 0:
            return 'All Season'
        
        return max(season_scores, key=season_scores.get)

    def _determine_occasion(self, category_counts):
        """Determine the best occasion for this fragrance"""
        occasion_scores = {}
        
        for occasion, preferred_categories in self.occasions.items():
            score = 0
            for category in preferred_categories:
                if category in category_counts:
                    score += category_counts[category]
            occasion_scores[occasion] = score
        
        if not occasion_scores or max(occasion_scores.values()) == 0:
            return 'Casual'
        
        return max(occasion_scores, key=occasion_scores.get)

    def _calculate_intensity(self, notes):
        """Calculate fragrance intensity based on notes"""
        intense_notes = ['oud', 'leather', 'patchouli', 'amber', 'incense', 'tobacco', 'castoreum', 'civet']
        intense_count = sum(1 for note in notes if any(intense in note for intense in intense_notes))
        
        if intense_count >= 3:
            return 'Strong'
        elif intense_count >= 1:
            return 'Moderate'
        else:
            return 'Light'

    def _estimate_longevity(self, notes):
        """Estimate fragrance longevity based on base notes"""
        base_notes = ['sandalwood', 'amber', 'musk', 'vanilla', 'patchouli', 'oud', 'agarwood', 'benzoin', 'labdanum']
        base_count = sum(1 for note in notes if any(base in note for base in base_notes))
        
        if base_count >= 3:
            return '8+ hours'
        elif base_count >= 2:
            return '6-8 hours'
        elif base_count >= 1:
            return '4-6 hours'
        else:
            return '2-4 hours'

    def _determine_mood(self, category_counts):
        """Determine the mood of the fragrance"""
        if category_counts.get('floral', 0) > 0:
            return 'Romantic and elegant'
        elif category_counts.get('citrus', 0) > 0:
            return 'Fresh and energetic'
        elif category_counts.get('woody', 0) > 0:
            return 'Warm and sophisticated'
        elif category_counts.get('oriental', 0) > 0:
            return 'Mysterious and sensual'
        elif category_counts.get('fresh', 0) > 0:
            return 'Clean and uplifting'
        else:
            return 'Complex and intriguing'

    def _determine_personality(self, category_counts):
        """Determine the personality type this fragrance suits"""
        dominant_categories = [cat for cat, count in category_counts.items() if count > 0]
        
        if 'floral' in dominant_categories:
            return 'Romantic and feminine'
        elif 'woody' in dominant_categories:
            return 'Confident and mature'
        elif 'citrus' in dominant_categories:
            return 'Youthful and energetic'
        elif 'oriental' in dominant_categories:
            return 'Mysterious and sophisticated'
        elif 'fresh' in dominant_categories:
            return 'Clean and approachable'
        else:
            return 'Unique and individualistic'

    def _generate_suggestions(self, category_counts, notes):
        """Generate improvement suggestions"""
        suggestions = []
        
        # Check for balance
        total_notes = sum(category_counts.values())
        if total_notes < 3:
            suggestions.append("Consider adding more notes for complexity")
        
        # Check for base notes
        base_categories = ['woody', 'oriental', 'sweet']
        has_base = any(category_counts.get(cat, 0) > 0 for cat in base_categories)
        if not has_base:
            suggestions.append("Add base notes like vanilla, sandalwood, or amber for longevity")
        
        # Check for top notes
        top_categories = ['citrus', 'fresh']
        has_top = any(category_counts.get(cat, 0) > 0 for cat in top_categories)
        if not has_top:
            suggestions.append("Consider adding citrus or fresh notes for an uplifting opening")
        
        # Check for middle notes
        middle_categories = ['floral', 'spicy']
        has_middle = any(category_counts.get(cat, 0) > 0 for cat in middle_categories)
        if not has_middle:
            suggestions.append("Floral or spicy notes would add heart to this composition")
        
        if not suggestions:
            suggestions.append("This is a well-balanced blend! Ready for testing.")
        
        return suggestions

    def _calculate_compatibility_score(self, category_counts):
        """Calculate a compatibility score (0-100)"""
        total_notes = sum(category_counts.values())
        if total_notes == 0:
            return 0
        
        # Score based on note diversity
        diversity_score = min(len([cat for cat, count in category_counts.items() if count > 0]) * 20, 60)
        
        # Score based on balance
        max_category = max(category_counts.values()) if category_counts.values() else 0
        balance_score = 40 if max_category <= total_notes * 0.6 else 20
        
        return min(diversity_score + balance_score, 100)

    def _empty_analysis(self):
        """Return empty analysis for invalid input"""
        return {
            'prediction': 'Please provide fragrance notes for analysis',
            'analysis': {
                'balance': {category: 0 for category in self.categories.keys()},
                'seasonality': 'All Season',
                'occasion': 'Casual',
                'intensity': 'Light',
                'longevity': '2-4 hours',
                'mood': 'Neutral',
                'personality': 'Versatile',
                'compatibility_score': 0
            },
            'suggestions': ['Add fragrance notes to get personalized analysis'],
            'category_breakdown': {category: 0 for category in self.categories.keys()}
        }

def analyze_fragrance(notes):
    """Main function to analyze fragrance notes"""
    analyzer = FragranceAnalyzer()
    return analyzer.analyze_notes(notes)

if __name__ == "__main__":
    try:
        notes = json.loads(sys.argv[1])
        result = analyze_fragrance(notes)
        print(json.dumps(result, indent=2))
    except Exception as e:
        error_result = {
            'prediction': 'Analysis failed',
            'analysis': {
                'balance': {},
                'seasonality': 'Unknown',
                'occasion': 'Unknown',
                'intensity': 'Unknown',
                'longevity': 'Unknown',
                'mood': 'Unknown',
                'personality': 'Unknown',
                'compatibility_score': 0
            },
            'suggestions': ['Please check your input and try again'],
            'error': str(e)
        }
        print(json.dumps(error_result, indent=2))
