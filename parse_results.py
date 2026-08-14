import json
with open("frontend/reports/json/results.json") as f:
    data = json.load(f)
for suite in data.get("suites", []):
    for subsuite in suite.get("suites", []):
        for subsubsuite in subsuite.get("suites", []): # Sometimes there is another level
            specs = subsubsuite.get("specs", [])
            for spec in specs:
                if not spec.get("ok", True):
                    for test in spec.get("tests", []):
                        for result in test.get("results", []):
                            if result.get("status") == "failed":
                                print(f"\n--- {spec.get('title')} ---")
                                print(result.get("error", {}).get("message", ""))
        for spec in subsuite.get("specs", []):
            if not spec.get("ok", True):
                for test in spec.get("tests", []):
                    for result in test.get("results", []):
                        if result.get("status") == "failed":
                            print(f"\n--- {spec.get('title')} ---")
                            print(result.get("error", {}).get("message", ""))
