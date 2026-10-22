#!/usr/bin/env python3
"""Découpe un data.js exporté depuis le site (bouton « Exporter les données »)
en fichiers JSON lisibles dans data/ (matchs/, effectif.json, minutes.json, logos.json).

Usage : python3 tools/split_data.py chemin/vers/data.js
Ensuite : python3 tools/build_data.py  (pour régénérer data/data.js proprement)
"""
import json, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
D = os.path.join(ROOT, 'data')
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(D, 'data.js')
txt = open(src, encoding='utf-8').read()
seed = json.loads(re.search(r'window\.__SEED\s*=\s*(\{.*\})\s*;?\s*$', txt, re.S).group(1))
os.makedirs(os.path.join(D, 'matchs'), exist_ok=True)
for m in seed.get('matchs', []):
    mid = m.pop('id'); data = json.loads(m.pop('payload'))
    json.dump({**m, 'data': data}, open(os.path.join(D, 'matchs', mid + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(seed.get('effectif', {'joueurs': []}), open(os.path.join(D, 'effectif.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(seed.get('minutes', {'minutes': {}}), open(os.path.join(D, 'minutes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(seed.get('logos', {}), open(os.path.join(D, 'logos.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(f"{len(seed.get('matchs', []))} matchs écrits dans data/matchs/")
