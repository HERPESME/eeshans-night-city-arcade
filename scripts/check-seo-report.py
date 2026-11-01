import importlib.util
import tempfile
import subprocess
import sys
from pathlib import Path

spec = importlib.util.spec_from_file_location('seo_report', Path(__file__).with_name('seo-report.py'))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

# Synthetic test fixtures, never presented as site performance.
with tempfile.TemporaryDirectory() as directory:
    current = Path(directory) / 'Queries.csv'
    current.write_text('\ufeffTop queries,Clicks,Impressions,CTR,Position\n"figma, mcp",2,"1,000",0.2%,9\nweb development,12,200,6%,6\nnew topic,1,10,10%,20\n', encoding='utf-8')
    kind, rows = module.read_export(current)
    assert kind == 'Queries' and rows[0]['label'] == 'figma, mcp'
    assert rows[0]['impressions'] == 1000 and rows[0]['ctr'] == .2
    before = [dict(label='figma, mcp', clicks=20, impressions=1000, ctr=2, position=8)]
    result = module.report(kind, rows, before)
    assert '-90%' in result
    assert 'Missing rows are unknown' in result
    assert 'web development' in result and 'not property totals' in result
    assert module.escaped('a|b<c>') == 'a\\|b&lt;c&gt;'
    current.write_text('Date,Clicks,Impressions,Position\n2026-01-01,1,5,1\n')
    try:
        module.read_export(current)
        raise AssertionError('Unsupported CSV must fail')
    except ValueError:
        pass
    for invalid in ['nan', 'inf', '-1']:
        try:
            module.number(invalid)
            raise AssertionError('Invalid metrics must fail')
        except ValueError:
            pass
    command = [sys.executable, str(Path(__file__).with_name('seo-report.py')), '--current', str(current), '--out', str(module.ROOT / 'public' / 'private-report.md')]
    rejected = subprocess.run(command, capture_output=True, text=True)
    assert rejected.returncode != 0 and 'inside analytics-private/' in rejected.stderr
    assert not (module.ROOT / 'public' / 'private-report.md').exists()
print('PASS quoted/BOM CSV, numeric validation, observed comparisons, actionable thresholds and privacy caveats')
