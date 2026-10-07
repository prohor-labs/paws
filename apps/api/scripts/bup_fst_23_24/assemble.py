# -*- coding: utf-8 -*-
import json
import sys
from scripts.bup_fst_23_24.part1 import part1
from scripts.bup_fst_23_24.part2 import part2
from scripts.bup_fst_23_24.part3 import part3
from scripts.bup_fst_23_24.part4 import part4
from scripts.bup_fst_23_24.part5 import part5
from scripts.bup_fst_23_24.part6 import part6
from scripts.bup_fst_23_24.part7 import part7
from scripts.bup_fst_23_24.part8 import part8

all_questions = part1 + part2 + part3 + part4 + part5 + part6 + part7 + part8

raw_path = "/tmp/raw_E4cJR0gK-yUa7_yR.json"
try:
    with open(raw_path, "r", encoding="utf-8") as f:
        raw_list = json.load(f)
        raw_map = {rq["index"]: rq for rq in raw_list}
        for q in all_questions:
            rq = raw_map.get(q["index"])
            if rq and "sources" in rq:
                q["sources"] = rq["sources"]
except Exception as e:
    print(f"Warning: could not load raw sources: {e}")

out_path = "/tmp/processed_E4cJR0gK-yUa7_yR.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

print(f"Successfully assembled {len(all_questions)} questions with sources into {out_path}")
