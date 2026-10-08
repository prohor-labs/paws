import json
import subprocess
import os
import re

def process_questions():
    with open('/tmp/fass_15_16_p2.json', 'r') as f:
        questions = json.load(f)

    results = []
    chunk_size = 5
    
    for i in range(0, len(questions), chunk_size):
        chunk = questions[i:i+chunk_size]
        
        prompt = f"""
You are an expert educator and exam content specialist. Generate bespoke pedagogical explanations and distractor rationale for the following BUP FASS 15-16 questions.
        
For each question, produce a JSON object matching EXACTLY this structure:
{{
  "index": <the integer index from the input>,
  "explanation": "pedagogical explanation followed by \\n\\n- (A) <Option text>: <specific reason why incorrect>\\n- (B) ...",
  "chapter": "Chapter Name",
  "topic": "Topic Name"
}}

Output a single valid JSON array containing these objects. DO NOT output any other text before or after the JSON array. DO NOT wrap the output in markdown ```json blocks. Just output the raw JSON array.

CRITICAL RULES:
1. Universal Text Formatting & LaTeX Standards:
- Zero Raw HTML: strip tags, no <p>, <div>, etc.
- Standard MathJax/KaTeX delimiters: inline $...$, display $$...$$. NO \( \), \[ \], or [imath].
- Word-for-Word Fidelity: Never alter original option text in distractor labels.
2. Explanation Architecture & Distractor Analysis:
- NO artificial headers like **ব্যাখ্যা:**, **সঠিক উত্তর (A):**, or **শর্টকাট:**.
- Flow naturally across paragraphs.
- Distractor rationale: for every incorrect option, provide `- (Key) Text: specific reason`.
- Distractors must give the REAL, specific linguistic, grammatical, historical, or mathematical reason why it is wrong. Absolutely NEVER use generic boilerplate like "Contextually or grammatically inaccurate".
- Ensure pure Bengali without any foreign/Devanagari characters.

Questions:
{json.dumps(chunk, ensure_ascii=False, indent=2)}
"""
        
        print(f"Processing chunk {i//chunk_size + 1}...")
        
        cmd = ['/root/.local/bin/agy', '--print', prompt]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        output = result.stdout.strip()
        
        # Try to parse the JSON output
        try:
            # Extract JSON array using regex if necessary
            match = re.search(r'\[.*\]', output, re.DOTALL)
            if match:
                output = match.group(0)
            
            chunk_results = json.loads(output)
            results.extend(chunk_results)
            print(f"Chunk {i//chunk_size + 1} successful.")
        except Exception as e:
            print(f"Failed to parse chunk {i//chunk_size + 1}: {e}")
            print("Raw Output:")
            print(output)
            # Depending on strictness, we might want to fail the whole process
            # But let's continue to get as much as possible, or we could exit.
            continue
            
    with open('/tmp/bespoke_fass_15_16_p2.json', 'w') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("Done. Wrote to /tmp/bespoke_fass_15_16_p2.json")

if __name__ == "__main__":
    process_questions()
