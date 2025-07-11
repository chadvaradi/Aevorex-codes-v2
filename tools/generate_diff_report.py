import json
import pandas as pd

# Load static data from TSV
static_df = pd.read_csv('docs/ENDPOINT_MATRIX_STATIC_v24.tsv', sep='\t', comment='#')
static_df.rename(columns={'File:Line': 'file_line', 'Method': 'method', 'Path': 'path'}, inplace=True)
static_df['path'] = static_df['path'].str.strip()
static_endpoints = set(zip(static_df['method'], static_df['path']))

# Load dynamic data from JSON
with open('docs/ENDPOINT_MATRIX_AUTO_v24.json', 'r') as f:
    dynamic_data = json.load(f)

dynamic_endpoints = set()
for route in dynamic_data:
    for method in route['methods']:
        dynamic_endpoints.add((method, route['path']))

# Load frontend usage data from TSV
fe_usage_df = pd.read_csv('docs/FE_USAGE_MATRIX_v24.tsv', sep='\t')
# A simple heuristic to determine method. Could be improved.
fe_usage_df['Method'] = fe_usage_df['Endpoint Called'].apply(lambda x: 'POST' if 'stream' in x else 'GET')
fe_usage_df['Path'] = fe_usage_df['Endpoint Called']
fe_endpoints = set(zip(fe_usage_df['Method'], fe_usage_df['Path']))


# --- Analysis ---
unmatched_static = static_endpoints - dynamic_endpoints
unmatched_dynamic = dynamic_endpoints - static_endpoints
not_used_by_fe = dynamic_endpoints - fe_endpoints
called_by_fe_not_in_dynamic = fe_endpoints - dynamic_endpoints

# --- Generate Report ---
with open('docs/ENDPOINT_DIFF_v24.md', 'w') as f:
    f.write('# Endpoint Matrix Difference Report v24\n\n')
    f.write('This report compares static analysis, dynamic runtime analysis, and frontend usage.\n\n')

    f.write('## ⚠️ Endpoints in Static Analysis but NOT in Runtime\n')
    f.write('These endpoints are defined in the code but are not being served by the running application. This could be due to router prefixes, disabled routers, or other logic in `main.py`.\n\n')
    if unmatched_static:
        for method, path in sorted(list(unmatched_static)):
            f.write(f'- `{method} {path}`\n')
    else:
        f.write('✅ All static endpoints are present in the running application.\n')
    f.write('\n')

    f.write('## 🚀 Endpoints in Runtime but NOT in Static Analysis\n')
    f.write('These endpoints are being served but were not found by the static `grep` analysis. This usually indicates dynamically generated routes.\n\n')
    if unmatched_dynamic:
        for method, path in sorted(list(unmatched_dynamic)):
            f.write(f'- `{method} {path}`\n')
    else:
        f.write('✅ No extra dynamic endpoints found.\n')
    f.write('\n')

    f.write('## 👻 Endpoints Served but NOT Used by Frontend\n')
    f.write('These endpoints are live but no corresponding `fetch` or `axios` call was found in the frontend code.\n\n')
    if not_used_by_fe:
        for method, path in sorted(list(not_used_by_fe)):
            f.write(f'- `{method} {path}`\n')
    else:
        f.write('✅ All served endpoints are used by the frontend.\n')
    f.write('\n')

    f.write('## 📞 Frontend Calls with NO Backend Endpoint\n')
    f.write('The frontend is trying to call these endpoints, but they do not exist in the running application.\n\n')
    if called_by_fe_not_in_dynamic:
        for method, path in sorted(list(called_by_fe_not_in_dynamic)):
            f.write(f'- `{method} {path}`\n')
    else:
        f.write('✅ All frontend calls have a corresponding backend endpoint.\n')
    f.write('\n')

print('Generated docs/ENDPOINT_DIFF_v24.md') 