import json
import sys
from pathlib import Path

def validate():
    paths = [
        'client/public/data/flight_data.json',
        'client/public/data/transport.json'
    ]
    
    has_error = False
    
    for relative_path in paths:
        path = Path(relative_path).resolve()
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            if not isinstance(data, (list, dict)) or len(data) == 0:
                print(f"❌ {path.name} — empty or invalid format")
                has_error = True
            else:
                print(f"✅ {path.name} — {len(data)} records")
                
        except Exception as e:
            print(f"❌ {path.name} — failed to parse: {e}")
            has_error = True

    if has_error:
        sys.exit(1)

if __name__ == '__main__':
    validate()
