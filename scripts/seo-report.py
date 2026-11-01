#!/usr/bin/env python3
"""Turn English Search Console CSV exports into a private, evidence-based worklist."""
import argparse
import csv
import io
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / 'analytics-private'


def number(value):
    result = float(str(value).replace(',', '').strip() or '0')
    if not math.isfinite(result) or result < 0:
        raise ValueError('Metrics must be finite, non-negative numbers')
    return result


def read_export(path):
    text = Path(path).read_text(encoding='utf-8-sig')
    reader = csv.DictReader(io.StringIO(text))
    fields = reader.fieldnames or []
    key = next((field for field in ['Top queries', 'Query', 'Top pages', 'Page'] if field in fields), None)
    if not key or not {'Clicks', 'Impressions', 'Position'}.issubset(fields):
        raise ValueError('Use the English Queries.csv or Pages.csv export from Search Console Performance, not a dates/devices export')
    kind = 'Queries' if key in ('Top queries', 'Query') else 'Pages'
    rows = []
    seen = set()
    for row in reader:
        label = (row.get(key) or '').strip()
        if not label:
            continue
        if label in seen:
            raise ValueError('Duplicate row labels: export a single query/page table without extra dimensions')
        seen.add(label)
        clicks, impressions, position = (number(row.get(field, '')) for field in ['Clicks', 'Impressions', 'Position'])
        if clicks > impressions:
            raise ValueError('Clicks exceed impressions; check the input columns')
        rows.append(dict(label=label, clicks=clicks, impressions=impressions, position=position, ctr=100 * clicks / impressions if impressions else 0))
    if not rows:
        raise ValueError('No data rows. Wait for Search Console data rather than inventing results')
    return kind, rows


def escaped(value):
    return str(value).replace('\\', '\\\\').replace('|', '\\|').replace('<', '&lt;').replace('>', '&gt;').replace('\r', ' ').replace('\n', ' ')


def table(rows):
    output = ['| Query or page | Clicks | Impressions | CTR | Avg. position |', '|---|---:|---:|---:|---:|']
    for row in rows:
        output.append(f"| {escaped(row['label'])} | {row['clicks']:,.0f} | {row['impressions']:,.0f} | {row['ctr']:.2f}% | {row['position']:.1f} |")
    return '\n'.join(output)


def report(kind, rows, previous=None, days=28, previous_days=28):
    clicks = sum(row['clicks'] for row in rows)
    impressions = sum(row['impressions'] for row in rows)
    output = [f'# Night City SEO review — {kind}', '', f'Current export: {len(rows)} observed rows over {days} days. This report uses only the supplied data.', '',
              f"Exported-row totals: {clicks:,.0f} clicks, {impressions:,.0f} impressions, {100 * clicks / impressions if impressions else 0:.2f}% CTR.", '',
              'These are exported-row totals, not property totals. Search Console omits some queries and exports may be truncated. Position is an impression-weighted average, not a fixed rank. Compare identical properties, search types, countries/devices and equal date windows where possible.', '',
              '## What is getting clicks', '', table(sorted(rows, key=lambda row: row['clicks'], reverse=True)[:10]), '', '## Suggested next work', '',
              'The thresholds below are triage heuristics, not Google benchmarks or promises of ranking gains. Confirm search intent and the live result before changing content.', '']
    eligible = [row for row in rows if row['impressions'] >= 100]
    snippets = sorted([row for row in eligible if 0 < row['position'] <= 10 and row['ctr'] < 2], key=lambda row: row['impressions'], reverse=True)[:5]
    near = sorted([row for row in eligible if 8 <= row['position'] <= 20], key=lambda row: row['impressions'], reverse=True)[:5]
    working = sorted([row for row in eligible if row['ctr'] >= 5 and 0 < row['position'] <= 10], key=lambda row: row['clicks'], reverse=True)[:5]
    for heading, selected, action in [
        ('Review snippets and intent', snippets, 'Check the actual result for the target country/device. Test an accurate, specific title and description that match the page; assess brand terms and SERP features before assuming the snippet is the cause.'),
        ('Improve pages already gaining visibility', near, 'Open the query’s Pages tab (or the page’s Queries tab) in Search Console. Improve the matching article’s explanation, first-hand evidence and relevant internal links. Keep one canonical URL; do not generate thin pages for every keyword.'),
        ('Build on observed strengths', working, 'Keep the successful page stable. Consider a useful follow-up answering a distinct related question and link it to the original. Confirm readers also engage or contact you in GA4.'),
    ]:
        output.extend([f'### {heading}', '', table(selected) if selected else 'No exported rows meet this review threshold yet.', '', action, ''])
    if previous is not None:
        old = {row['label']: row for row in previous}
        declines = []
        for row in rows:
            before = old.get(row['label'])
            if not before or before['clicks'] < 10 or min(row['impressions'], before['impressions']) < 100:
                continue
            change = (row['clicks'] / days) / (before['clicks'] / previous_days) - 1
            if change <= -.3:
                declines.append((change, row, before))
        output.extend(['## Comparison with previous export', '', f'Compared clicks per day ({days} current days vs {previous_days} previous days), only for rows observed in both exports. Missing rows are unknown, not assumed zero.', ''])
        for change, row, before in sorted(declines, key=lambda item: item[0])[:5]:
            output.append(f"- **{escaped(row['label'])}**: {change:.0%} clicks/day; {before['clicks']:,.0f} → {row['clicks']:,.0f} clicks. Check demand, impressions, position, changes and seasonality before editing.")
        if not declines:
            output.append('No observed row meets the decline threshold (30% fewer clicks/day, previous clicks ≥10 and ≥100 impressions in both windows).')
        output.append('')
    output.extend(['## Next review', '',
                   '1. Choose at most two changes from the evidence above; record the URL, hypothesis and date in the private change log.',
                   '2. Check GA4 organic landing pages, article_engaged, project_click, file_download and generate_lead. Query-level conversions cannot be inferred by joining aggregate queries to visitors.',
                   '3. Review Search Console indexing and Core Web Vitals separately. A sitemap submission does not guarantee indexing.',
                   '4. Compare the next equivalent 28-day window. Keep the export and this report private; never upload them into public/ or a blog.', ''])
    return '\n'.join(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--current', required=True, type=Path)
    parser.add_argument('--previous', type=Path)
    parser.add_argument('--days', type=int, default=28)
    parser.add_argument('--previous-days', type=int, default=28)
    parser.add_argument('--out', type=Path, default=PRIVATE / 'reports' / 'seo-review.md')
    args = parser.parse_args()
    if args.days <= 0 or args.previous_days <= 0:
        parser.error('Window lengths must be positive')
    target = args.out.resolve()
    if not target.is_relative_to(PRIVATE.resolve()):
        parser.error('Save reports inside analytics-private/ so account data cannot be published or committed')
    try:
        kind, current = read_export(args.current)
        previous = None
        if args.previous:
            previous_kind, previous = read_export(args.previous)
            if previous_kind != kind:
                raise ValueError('Compare Queries with Queries or Pages with Pages')
        content = report(kind, current, previous, args.days, args.previous_days)
    except (OSError, ValueError, csv.Error) as error:
        parser.error(str(error))
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding='utf-8')
    print(f'Private SEO review written to {target.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
