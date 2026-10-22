#!/usr/bin/env python3
"""Reconstruit data/data.js (lu par le site) à partir des fichiers JSON du dossier data/.

Usage : python3 tools/build_data.py
"""
import json, glob, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
D = os.path.join(ROOT, 'data')

matchs = []
for f in sorted(glob.glob(os.path.join(D, 'matchs', '*.json'))):
    doc = json.load(open(f, encoding='utf-8'))
    mid = os.path.splitext(os.path.basename(f))[0]
    data = doc.pop('data')
    matchs.append({'id': mid, **doc, 'payload': json.dumps(data, ensure_ascii=False, separators=(',', ':'))})

def load(name, default):
    p = os.path.join(D, name)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else default

seed = {
    'matchs': matchs,
    'effectif': load('effectif.json', {'joueurs': []}),
    'minutes': load('minutes.json', {'minutes': {}}),
    'logos': load('logos.json', {}),
}
with open(os.path.join(D, 'data.js'), 'w', encoding='utf-8') as out:
    out.write('/* Généré par tools/build_data.py, ne pas modifier à la main */\n')
    out.write('window.__SEED = ' + json.dumps(seed, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(f'data/data.js : {len(matchs)} matchs, {len(seed["effectif"]["joueurs"])} joueurs')
