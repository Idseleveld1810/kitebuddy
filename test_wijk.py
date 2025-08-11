import json
import math
from geopy.distance import geodesic
import osmnx as ox
from pathlib import Path

with open("spots_top50_nl.json", "r") as f:
    spots = json.load(f)

def angle_between(p1, p2):
    dx = p2[1] - p1[1]
    dy = p2[0] - p1[0]
    angle = math.degrees(math.atan2(dx, dy))
    return (angle + 360) % 360

def ideal_wind_direction(coast_angle):
    return (coast_angle + 90) % 360

def kite_range(ideal):
    min_dir = (ideal - 80 + 360) % 360
    max_dir = (ideal + 80) % 360
    if min_dir > max_dir:
        return [{"min": min_dir, "max": 360}, {"min": 0, "max": max_dir}]
    else:
        return [{"min": min_dir, "max": max_dir}]

def get_nearest_coast_angle(lat, lon, radius_m=2000):
    tags = {'natural': 'coastline'}
    gdf = ox.features_from_point((lat, lon), tags=tags, dist=radius_m)
    coastlines = gdf[gdf.geometry.type == 'LineString']
    if coastlines.empty:
        tags = {'natural': 'water'}
        gdf = ox.features_from_point((lat, lon), tags=tags, dist=radius_m)
        if gdf.empty:
            raise ValueError("Geen kustlijn of waterlichaam gevonden")
        gdf = gdf[gdf.geometry.type == 'Polygon']
        if gdf.empty:
            raise ValueError("Geen polygonale waterkant gevonden")
        coords = list(gdf.geometry.iloc[0].exterior.coords)
    else:
        coords = list(coastlines.geometry.iloc[0].coords)

    min_dist = float('inf')
    nearest_angle = None
    for i in range(len(coords) - 1):
        seg_start = coords[i]
        seg_end = coords[i+1]
        midpoint = ((seg_start[1] + seg_end[1]) / 2, (seg_start[0] + seg_end[0]) / 2)
        dist = geodesic((lat, lon), midpoint).meters
        if dist < min_dist:
            min_dist = dist
            nearest_angle = angle_between(seg_start[::-1], seg_end[::-1])
    return nearest_angle

results = []
for spot in spots:
    lat, lon = spot["latitude"], spot["longitude"]
    try:
        coast_angle = get_nearest_coast_angle(lat, lon)
        ideal = ideal_wind_direction(coast_angle)
        wind_range = kite_range(ideal)
        results.append({
            "id": spot["id"],
            "name": spot["name"],
            "latitude": lat,
            "longitude": lon,
            "province": spot["province"],
            "coast_orientation": round(coast_angle, 1),
            "ideal_wind_direction": round(ideal, 1),
            "wind_direction_range": wind_range
        })
    except Exception as e:
        results.append({
            "id": spot["id"],
            "name": spot["name"],
            "latitude": lat,
            "longitude": lon,
            "province": spot["province"],
            "error": str(e)
        })

with open("spots_with_wind_top50.json", "w") as f:
    json.dump(results, f, indent=2)

print("✅ Klaar. Data opgeslagen in spots_with_wind_top50.json")
