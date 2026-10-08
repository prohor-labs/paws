import json
import subprocess
import os
import re

def process_missing():
    with open('/tmp/fass_15_16_p2.json', 'r') as f:
        questions = json.load(f)

    with open('/tmp/bespoke_fass_15_16_p2.json', 'r') as f:
        existing = json.load(f)
        
    existing_indices = {q['index'] for q in existing}
    
    missing_questions = [q for q in questions if q['i'] not in existing_indices]
    
    print(f"Missing {len(missing_questions)} questions: {[q['i'] for q in missing_questions]}")
    
    for q in missing_questions:
        prompt = f"""
You are an expert educator and exam content specialist. Generate bespoke pedagogical explanations and distractor rationale for the following BUP FASS 15-16 question.
        
Produce a single JSON object matching EXACTLY this structure:
{{
  "index": <the integer index from the input>,
  "explanation": "pedagogical explanation followed by \\n\\n- (A) <Option text>: <specific reason why incorrect>\\n- (B) ...",
  "chapter": "Chapter Name",
  "topic": "Topic Name"
}}

Output ONLY the raw JSON object. DO NOT output any other text. DO NOT wrap the output in markdown ```json blocks.

CRITICAL RULES:
1. Universal Text Formatting & LaTeX Standards:
- Zero Raw HTML: strip tags, no <p>, <div>, etc.
- Standard MathJax/KaTeX delimiters: inline $...$, display $$...$$. NO \( \), \[ \], or [imath].
- Word-for-Word Fidelity: Never alter original option text in distractor labels.
2. Explanation Architecture & Distractor Analysis:
- NO artificial headers like **ব্যাখ্যা:**, **সঠিক উত্তর (A):**, or **শর্টকাট:**.
- Flow naturally across paragraphs.
- Distractor rationale: for every incorrect option, provide `- (Key) Text: specific reason`.
- Distractors must give the REAL, specific linguistic, grammatical, historical, or mathematical reason why it is wrong. Absolutely NEVER use generic boilerplate like "Contextually or grammatically inaccurate" or "এটি অপ্রাসঙ্গিক বা তাত্ত্বিকভাবে ভুল বিকল্প হওয়ায় সঠিক উত্তর নয়".
- Ensure pure Bengali without any foreign/Devanagari characters.

Question:
{json.dumps(q, ensure_ascii=False, indent=2)}
"""
        print(f"Processing question {q['i']}...")
        cmd = ['/root/.local/bin/agy', '--print', prompt]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        output = result.stdout.strip()
        
        try:
            match = re.search(r'\{.*\}', output, re.DOTALL)
            if match:
                output = match.group(0)
            
            parsed = json.loads(output)
            existing.append(parsed)
            print(f"Success for {q['i']}")
        except Exception as e:
            print(f"Failed for {q['i']}: {e}")
            print(output)
            
    # Sort and save
    existing.sort(key=lambda x: x['index'])
    with open('/tmp/bespoke_fass_15_16_p2.json', 'w') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)
    print("Done. Wrote to /tmp/bespoke_fass_15_16_p2.json")

if __name__ == "__main__":
    process_missing()
