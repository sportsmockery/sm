# Datalab Supabase Data Issues - January 23, 2026

## Overview
The test.sportsmockery.com site pulls from Supabase (DataLabs), but pages show inaccurate/incomplete data (e.g., wrong records, "0 games", "Not Found", fictional players). This report explains why Supabase can't find correct data and recommendations.

## Key Discrepancies
- **Bears**: Supabase shows combined 12-7; missing preseason, wrong dates (Week 1 Sep 9 vs Sep 8). Expected: Regular 11-6, Post 1-1 (from ESPN). Missing fields: season_type, tv, time.
- **Bulls**: Supabase 39-43 (old); "0 games". Expected: 22-22 ongoing (ESPN/NBA.com). Missing: as_of date filter, current games.
- **Cubs**: Supabase 98-76; "0 games". Expected: 92-70 regular, post WC/NLDS (MLB). Missing: postseason data.
- **White Sox**: Supabase 61-106; "0 games". Expected: 60-102 (MLB). Missing: trade updates (Robert Jr. out, Acuña in).
- **Blackhawks**: Supabase 44-95-6; "0 games". Expected: 20-22-7 (NHL). Missing: current standings.

## Why Supabase Can't Find It
1. **Missing/Unseeded Data**: 2025/2026 seasons not fully inserted (e.g., no postseason entries, wrong season strings like '2025' vs '2025-26').
2. **Schema Issues**: No 'season_type' field for regular/post/pre. No 'status' for active/futures. Slug mismatches for players (e.g., Bedard #8 vs #98).
3. **Query Filters**: No handling for ongoing seasons (add 'as_of' timestamp). Old data not archived.
4. **Incomplete Rosters**: Extra players (81 vs 53 for Bears); fictional (Jarrett). Missing bios/photos/contracts.
5. **Load Errors**: "No Players Found" likely due to slug/query mismatch.

## Recommendations for DataLabs
- Seed full 2025/2026 data from ESPN/NBA/MLB/NHL APIs.
- Add fields: season_type, tv, time, status (active/futures).
- Normalize player slugs/numbers.
- Run migration for postseason separation.
- Test queries with console logs for mismatches.

Fixes applied in frontend; data population needed in Supabase.
