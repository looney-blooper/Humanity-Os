#!/usr/bin/env python3
"""
water_quality_check.py

- Query US Water Quality Portal near a lat/lon
- Interpret a few common parameters vs thresholds
- Find nearby "clean" water sources from a GeoJSON (if provided)
"""

import requests
import math
import json
from datetime import datetime, timedelta

# ---------------------------
# Config / thresholds (edit to match local regulatory values)
# units: mg/L for chemical, CFU/100mL for bacteria where applicable
THRESHOLDS = {
    "Nitrate (as N)": 10.0,        # example: 10 mg/L (as nitrate-nitrogen) - adjust as needed
    "Nitrate": 10.0,
    "Nitrite": 1.0,
    "Lead": 0.01,                  # 0.01 mg/L ~ 10 µg/L
    "Arsenic": 0.01,
    "E. coli": 0,                  # presence means not safe; many labs report as CFU/100mL
    "Total Coliform": 0
}

# Map common parameter names (from WQP) to keys used above (best-effort)
PARAM_NAME_MAP = {
    "Nitrate as N": "Nitrate (as N)",
    "Nitrate": "Nitrate",
    "Nitrite": "Nitrite",
    "Lead": "Lead",
    "Arsenic": "Arsenic",
    "E. coli": "E. coli",
    "Escherichia coli": "E. coli",
    "Total coliforms": "Total Coliform",
    "Total Coliform": "Total Coliform"
}

# ---------------------------
# Utility: haversine distance (km)
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2*R*math.asin(math.sqrt(a))

# ---------------------------
# Query Water Quality Portal (WQP) - US public service
def query_wqp(lat, lon, within_km=10, start_date=None):
    """
    Query the Water Quality Portal Results endpoint for samples near lat/lon.
    Returns JSON (list of result records) or None.
    """
    base = "https://www.waterqualitydata.us/data/Result/search"
    params = {
        "latitude": lat,
        "longitude": lon,
        "within_km": within_km,
        "mimeType": "json"
    }
    if start_date:
        params["startDateLo"] = start_date  # e.g., "2023-01-01"
    try:
        resp = requests.get(base, params=params, timeout=20)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        print("WQP query failed:", e)
        return None

# ---------------------------
# Interpret results vs thresholds
def interpret_results(results, lookback_days=365):
    """
    results: JSON list from WQP
    Returns a dict summarizing parameters and whether they exceed thresholds.
    """
    cutoff = datetime.utcnow() - timedelta(days=lookback_days)
    summary = {}  # param_name -> list of (value, unit, date, site)
    if not results:
        return summary

    for rec in results:
        try:
            param = rec.get("CharacteristicName") or rec.get("CharacteristicName") or rec.get("Characteristic")
            if not param:
                continue
            # Normalize common names
            param_norm = PARAM_NAME_MAP.get(param, param)
            # value and units
            val = rec.get("ResultMeasureValue")
            unit = rec.get("ResultMeasure/MeasureUnitCode") or rec.get("MeasureUnitCode") or rec.get("ResultMeasure.MeasureUnitCode")
            # date
            date_str = rec.get("ActivityStartDate") or rec.get("ResultDate")
            if date_str:
                try:
                    date_obj = datetime.fromisoformat(date_str)
                except Exception:
                    # fallback parse
                    date_obj = datetime.strptime(date_str.split("T")[0], "%Y-%m-%d")
            else:
                date_obj = None
            # skip very old data if needed
            if date_obj and date_obj < cutoff:
                continue
            # site info
            site = rec.get("MonitoringLocationName") or rec.get("Organization") or rec.get("MonitoringLocationIdentifier")
            # store
            if val is not None:
                try:
                    valf = float(val)
                except:
                    # some results are strings like "<1", skip or parse
                    if isinstance(val, str) and val.strip().startswith("<"):
                        try:
                            valf = float(val.strip().lstrip("<"))
                        except:
                            continue
                    else:
                        continue
                summary.setdefault(param_norm, []).append({
                    "value": valf,
                    "unit": unit,
                    "date": date_obj.isoformat() if date_obj else None,
                    "site": site,
                    "raw_param": param
                })
        except Exception:
            continue

    # Evaluate thresholds
    evaluated = {}
    for p, entries in summary.items():
        max_val = max(e["value"] for e in entries)
        threshold = THRESHOLDS.get(p)
        status = "Unknown"
        if threshold is not None:
            status = "Safe" if max_val <= threshold else "Unsafe"
        evaluated[p] = {
            "entries": entries,
            "max_value": max_val,
            "threshold": threshold,
            "status": status
        }
    return evaluated

# ---------------------------
# Find nearest clean water sources from a GeoJSON file.
# GeoJSON should have Feature.properties.test_results = dict of parameter->value (latest)
def find_nearest_clean_sources(lat, lon, geojson_path=None, max_distance_km=10, max_results=5):
    """
    Find nearby 'clean' water sources from a GeoJSON file or sample data.
    Returns a list of dicts: {distance_km, name, lat, lon, tests}
    """
    # If no geojson provided, create some sample sources (demo)
    if not geojson_path:
        sample = [
            {"name": "Community Well A", "lat": lat + 0.03, "lon": lon + 0.02,
             "tests": {"Nitrate": 3.0, "Lead": 0.0, "E. coli": 0}},
            {"name": "Town Tap B", "lat": lat + 0.08, "lon": lon - 0.01,
             "tests": {"Nitrate": 12.0, "Lead": 0.005, "E. coli": 5}},
            {"name": "Spring C", "lat": lat - 0.02, "lon": lon + 0.04,
             "tests": {"Nitrate": 1.5, "Lead": 0.0, "E. coli": 0}},
        ]
        features = sample
    else:
        with open(geojson_path, "r", encoding="utf-8") as f:
            gj = json.load(f)
        features = []
        for feat in gj.get("features", []):
            props = feat.get("properties", {}) or {}
            geom = feat.get("geometry", {}) or {}
            coords = geom.get("coordinates")
            if not coords or len(coords) < 2:
                continue
            lon2, lat2 = coords[0], coords[1]
            tests = props.get("tests") or props.get("last_test_results") or props.get("test_results") or {}
            features.append({
                "name": props.get("name") or props.get("id") or "unknown",
                "lat": lat2,
                "lon": lon2,
                "tests": tests
            })

    if not features:
        return []

    # compute distance and filter by thresholds
    clean_candidates = []
    for f in features:
        # ensure lat/lon present
        if "lat" not in f or "lon" not in f:
            continue
        dist = haversine_km(lat, lon, f["lat"], f["lon"])
        if dist > max_distance_km:
            continue
        # check tests against thresholds
        ok = True
        reason = []
        for param, val in (f.get("tests") or {}).items():
            normalized = PARAM_NAME_MAP.get(param, param)
            thr = THRESHOLDS.get(normalized)
            try:
                valf = float(val)
            except Exception:
                ok = False
                reason.append(f"{param}: unknown value")
                continue
            if thr is not None and valf > thr:
                ok = False
                reason.append(f"{param}={valf} > {thr}")
        if ok:
            # store (distance, feature_dict)
            clean_candidates.append((dist, f))

    # sort by distance
    clean_candidates.sort(key=lambda tup: tup[0])

    # return up to max_results, unpack properly (c is the feature dict)
    results = []
    for d, c in clean_candidates[:max_results]:
        # ensure expected keys
        result = {
            "distance_km": round(d, 3),
            "name": c.get("name", "unknown"),
            "lat": c.get("lat"),
            "lon": c.get("lon"),
            "tests": c.get("tests", {})
        }
        results.append(result)

    return results

# ---------------------------
# Main demonstration CLI
def main():
    print("Water Quality Check (demo)")
    lat = input("Enter latitude (e.g. 40.7128): ").strip()
    lon = input("Enter longitude (e.g. -74.0060): ").strip()
    try:
        latf = float(lat); lonf = float(lon)
    except:
        print("Invalid coordinates")
        return

    # Step 1: Query recent results within 10 km, last 365 days
    print("\nQuerying Water Quality Portal (US) for nearby results...")
    raw = query_wqp(latf, lonf, within_km=10, start_date=(datetime.utcnow() - timedelta(days=365)).date().isoformat())
    if not raw:
        print("No data returned from WQP or request failed. If you are outside the US, replace WQP with your local API.")
    else:
        evaluated = interpret_results(raw, lookback_days=365)
        if not evaluated:
            print("No recent parameter measurements found within the lookback period.")
        else:
            print("\nSummary of detected parameters (max value in last year):")
            for p, v in evaluated.items():
                thr = v["threshold"]
                print(f"- {p}: max={v['max_value']} {('unit unknown' if v['entries'][0]['unit'] is None else v['entries'][0]['unit'])} | threshold={thr} | status={v['status']}")
                # print details of latest few entries
                for e in sorted(v["entries"], key=lambda x: x["date"] or "", reverse=True)[:3]:
                    print(f"   • {e['date']} @ {e['site']}: {e['value']} {e['unit']}")

    # Step 2: Find nearby "clean" water sources from local GeoJSON (demo)
    print("\nSearching for nearby 'clean' water sources (demo/local dataset)...")
    # If you have a GeoJSON file of water sources with test results, set geojson_path to its filepath
    geojson_path = None  # e.g., "clean_water_sources.geojson"
    clean = find_nearest_clean_sources(latf, lonf, geojson_path=geojson_path, max_distance_km=10)
    if not clean:
        print("No clean sources found within radius. Provide a GeoJSON of local water sources to search.")
    else:
        print("\nNearby clean sources:")
        for c in clean:
            print(f"- {c['name']} ({c['distance_km']} km) at {c['lat']:.5f},{c['lon']:.5f} — tests: {c['tests']}")

    print("\nDONE. Notes: thresholds are illustrative. For non-US regions, use a local water-quality API or dataset (CPCB, state portals, Bhuvan for India) and provide a GeoJSON of water sources with latest test results.")

if __name__ == "__main__":
    main()
