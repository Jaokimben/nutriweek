#!/usr/bin/env python3
"""
Extrait les aliments essentiels de CIQUAL pour réduire la taille
"""

# Liste des ingrédients utilisés dans les recettes
INGREDIENTS_NEEDED = [
    'lentille', 'pois chiche', 'haricot', 'fève',
    'riz', 'quinoa', 'avoine', 'orge', 'boulgour',
    'tomate', 'concombre', 'courgette', 'carotte', 'poivron', 'oignon', 'ail',
    'banane', 'fraise', 'myrtille', 'kiwi', 'fruit rouge',
    'lait', 'yaourt', 'feta',
    'huile', 'olive',
    'noix', 'amande', 'cajou', 'graine',
    'miel', 'citron',
    'épinard', 'brocoli', 'champignon', 'salade', 'radis',
    'persil', 'basilic', 'menthe', 'coriandre',
    'cumin', 'curry', 'curcuma', 'cannelle', 'gingembre',
    'bouillon',
    'pâte', 'pain', 'granola',
    'avocat', 'aubergine'
]

def should_include(food_name):
    """Vérifie si l'aliment doit être inclus"""
    food_lower = food_name.lower()
    return any(ing in food_lower for ing in INGREDIENTS_NEEDED)

print("📊 Extraction des aliments essentiels de CIQUAL...")

with open('public/ciqual.csv', 'r', encoding='utf-8') as f_in:
    lines = f_in.readlines()

# Garder le header
header = lines[0]
data_lines = lines[1:]

print(f"📄 Total lignes CIQUAL: {len(data_lines):,}")

# Extraire les aliments pertinents
included_codes = set()
output_lines = [header]

for line in data_lines:
    parts = line.split(';')
    if len(parts) >= 2:
        alim_code = parts[0]
        food_name = parts[1]
        
        if should_include(food_name):
            included_codes.add(alim_code)
            output_lines.append(line)

print(f"✅ Aliments inclus: {len(included_codes)} codes")
print(f"✅ Lignes extraites: {len(output_lines):,}")

# Sauvegarder
with open('public/ciqual_lite.csv', 'w', encoding='utf-8') as f_out:
    f_out.writelines(output_lines)

print("✅ Fichier ciqual_lite.csv créé !")

# Stats
import os
original_size = os.path.getsize('public/ciqual.csv') / (1024*1024)
lite_size = os.path.getsize('public/ciqual_lite.csv') / (1024*1024)
print(f"📦 Taille originale: {original_size:.2f} MB")
print(f"📦 Taille réduite: {lite_size:.2f} MB")
print(f"📉 Réduction: {((original_size-lite_size)/original_size*100):.1f}%")
