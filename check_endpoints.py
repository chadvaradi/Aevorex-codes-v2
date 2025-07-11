import subprocess
endpoints = [
    ("GET", "/api/v1/auth/status"),
    ("POST", "/api/v1/auth/logout"),
    ("GET", "/api/v1/auth/login"),
    ("GET", "/api/v1/auth/callback"),
    ("GET", "/api/v1/ai/models"),
    ("GET", "/api/v1/stock/search"),
    ("GET", "/api/v1/stock/ticker-tape"),
    ("GET", "/api/v1/stock/AAPL/fundamentals"),
    ("GET", "/api/v1/stock/AAPL/chart"),
    ("GET", "/api/v1/stock/AAPL/news"),
    ("GET", "/api/v1/stock/premium/AAPL/summary"),
    ("POST", "/api/v1/stock/chat/AAPL"),
    ("GET", "/api/v1/stock/chat/AAPL/stream"),
    ("GET", "/api/v1/macro/rates/all"),
    ("GET", "/api/v1/macro/ecb/rates"),
    ("GET", "/api/v1/macro/ecb/yield-curve"),
    ("GET", "/api/v1/macro/ecb/historical-yield-curve"),
    ("GET", "/api/v1/macro/bubor"),
    ("GET", "/api/v1/macro/forex/pairs"),
    ("GET", "/api/v1/macro/forex/EURUSD"),
    ("GET", "/api/v1/market/news"),
    ("GET", "/api/v1/health"),
]
results = []
for method, path in endpoints:
    url = f"http://127.0.0.1:8084{path}"
    if method == "GET":
        cmd = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", url]
    else:
        cmd = ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code}", "-X", method, url]
    status = subprocess.check_output(cmd, text=True).strip()
    results.append((method, path, status))

success = [r for r in results if r[2] == '200']
print("Summary:", len(success), "/", len(results), "endpoints returned 200 OK")
for m, p, s in results:
    print(f"{m} {p} => {s}")
