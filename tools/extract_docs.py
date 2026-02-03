import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SERVER_PY = ROOT / "backend" / "server.py"
OUT_JSON = ROOT / "docs_extract.json"


def main() -> None:
    text = SERVER_PY.read_text(encoding="utf-8")

    endpoint_re = re.compile(
        r"^\s*@api_router\.(get|post|put|patch|delete)\(\s*['\"]([^'\"]+)['\"]",
        re.M,
    )
    endpoints = [
        {"method": method.upper(), "path": "/api" + path}
        for method, path in endpoint_re.findall(text)
    ]

    app_re = re.compile(
        r"^\s*@app\.(get|post|put|patch|delete)\(\s*['\"]([^'\"]+)['\"]",
        re.M,
    )
    app_endpoints = [
        {"method": method.upper(), "path": path} for method, path in app_re.findall(text)
    ]

    models = re.findall(r"^\s*class\s+(\w+)\(BaseModel\)\s*:", text, re.M)

    defs = re.findall(r"^(async\s+def|def)\s+(\w+)\s*\(", text, re.M)
    function_names: list[str] = []
    seen: set[str] = set()
    for _, name in defs:
        if name not in seen:
            seen.add(name)
            function_names.append(name)

    counts = Counter((e["method"], e["path"]) for e in endpoints)
    duplicate_endpoints = [
        {"method": method, "path": path, "count": count}
        for (method, path), count in counts.items()
        if count > 1
    ]

    summary = {
        "endpoint_count": len(endpoints),
        "app_endpoint_count": len(app_endpoints),
        "model_count": len(models),
        "function_count": len(function_names),
        "duplicate_endpoints": sorted(
            duplicate_endpoints, key=lambda x: (x["path"], x["method"])
        ),
    }

    payload = {
        "summary": summary,
        "endpoints": endpoints,
        "app_endpoints": app_endpoints,
        "models": models,
        "functions": function_names,
    }

    OUT_JSON.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {OUT_JSON}")


if __name__ == "__main__":
    main()
