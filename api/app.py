"""
FastAPI backend for PyJHora - Vedic Astrology REST API
Exposes all major PyJHora functions as HTTP endpoints.
Run with: uvicorn app:app --reload --port 8000
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Any
import traceback

from jhora import utils, const
from jhora.panchanga import drik
from jhora.horoscope import main as horoscope_main

app = FastAPI(
    title="PyJHora Vedic Astrology API",
    description="REST API for Vedic Astrology calculations using PyJHora",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────── Shared Request Models ────────────────────────────────────

class BirthData(BaseModel):
    year: int = Field(..., example=1985)
    month: int = Field(..., ge=1, le=12, example=6)
    day: int = Field(..., ge=1, le=31, example=15)
    hour: int = Field(..., ge=0, le=23, example=10)
    minute: int = Field(..., ge=0, le=59, example=30)
    second: float = Field(0.0, ge=0, lt=60)
    place_name: str = Field("", example="Chennai, India")
    latitude: float = Field(..., example=13.0827)
    longitude: float = Field(..., example=80.2707)
    timezone_offset: float = Field(..., example=5.5)
    ayanamsa_mode: str = Field("LAHIRI", example="LAHIRI")
    language: str = Field("en", example="en")

class DateTimeData(BaseModel):
    year: int
    month: int = Field(..., ge=1, le=12)
    day: int = Field(..., ge=1, le=31)
    hour: int = Field(6, ge=0, le=23)
    minute: int = Field(0, ge=0, le=59)
    second: float = Field(0.0)
    place_name: str = ""
    latitude: float
    longitude: float
    timezone_offset: float
    ayanamsa_mode: str = "LAHIRI"
    language: str = "en"

class LocationSearch(BaseModel):
    place_name: str

class MatchData(BaseModel):
    boy: BirthData
    girl: BirthData

class DhasaRequest(BirthData):
    dhasa_type: str = Field("vimsottari", example="vimsottari")
    chart_index: int = Field(0, example=0)

class DivisionalChartRequest(BirthData):
    divisional_chart_factor: int = Field(1, example=9)
    chart_method: int = Field(1, example=1)

class HoroscopeRequest(BirthData):
    chart_index: int = Field(0, example=0)
    chart_method: int = Field(1, example=1)
    divisional_chart_factor: Optional[int] = None
    bhava_madhya_method: int = Field(1, example=1)

# ─────────────────── Helpers ──────────────────────────────────────────────────

def _place(data) -> drik.Place:
    place_name = getattr(data, 'place_name', '')
    return drik.Place(place_name, data.latitude, data.longitude, data.timezone_offset)

def _jd(data) -> float:
    dob = (data.year, data.month, data.day)
    tob = (data.hour, data.minute, int(data.second))
    return utils.julian_day_number(dob, tob)

def _set_ayanamsa(data):
    drik.set_ayanamsa_mode(data.ayanamsa_mode)

def _safe(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}\n{traceback.format_exc()}")

# ─────────────────── Meta endpoints ───────────────────────────────────────────

@app.get("/ayanamsa-modes", tags=["Meta"])
def list_ayanamsa_modes():
    """List all available ayanamsa modes."""
    return {"modes": sorted(const.available_ayanamsa_modes)}

@app.get("/divisional-chart-factors", tags=["Meta"])
def list_divisional_chart_factors():
    """List all supported divisional chart factors (D1, D2 … D144)."""
    return {"factors": const.division_chart_factors}

@app.get("/dhasa-types", tags=["Meta"])
def list_dhasa_types():
    """List all supported dhasa types."""
    return {
        "graha_dhasas": [
            "vimsottari","ashtottari","yogini","tithi_yogini","tithi_ashtottari",
            "yoga_vimsottari","naisargika","karaka","tara","shodasottari",
            "dwadasottari","panchottari","shastihayani","chathuraaseethi_sama",
            "saptharishi_nakshathra","buddhi_gathi","kaala","aayu"
        ],
        "raasi_dhasas": [
            "chara","sthira","shoola","brahma","narayana","kalachakra",
            "navamsa","nirayana","mandooka","trikona","drig","chakra",
            "moola","sudasa","varnada","lagnamsaka","kendradhi_rasi",
            "yogardha","tara_lagna"
        ],
        "annual_dhasas": ["mudda","patyayini"]
    }

@app.post("/search-location", tags=["Meta"])
def search_location(data: LocationSearch):
    """Search for a city and return lat/lon/timezone information."""
    result = _safe(utils.get_location, data.place_name)
    if result is None:
        raise HTTPException(status_code=404, detail="Location not found")
    place, lat, lon, tz = result
    return {"place": place, "latitude": lat, "longitude": lon, "timezone_offset": tz}

@app.get("/languages", tags=["Meta"])
def list_languages():
    return {"languages": [
        {"code": "en", "name": "English"},
        {"code": "hi", "name": "Hindi"},
        {"code": "ta", "name": "Tamil"},
        {"code": "te", "name": "Telugu"},
        {"code": "ka", "name": "Kannada"},
        {"code": "ml", "name": "Malayalam"},
    ]}

# ─────────────────── Panchanga endpoints ──────────────────────────────────────

@app.post("/panchanga", tags=["Panchanga"])
def get_panchanga(data: DateTimeData):
    """
    Get complete daily Panchanga (almanac) for a given date/time/place.
    Returns tithi, nakshatra, yoga, karana, vaara, sunrise, sunset, etc.
    """
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    utils.set_language(data.language)

    def calc():
        res = {}
        res["vaara"] = drik.vaara(jd)
        sr = drik.sunrise(jd, place)
        ss = drik.sunset(jd, place)
        res["sunrise"] = {"time": sr[1], "jd": sr[2]}
        res["sunset"]  = {"time": ss[1], "jd": ss[2]}
        mr = drik.moonrise(jd, place)
        ms_ = drik.moonset(jd, place)
        res["moonrise"] = {"time": mr[1], "jd": mr[2]}
        res["moonset"]  = {"time": ms_[1], "jd": ms_[2]}

        tithi_info = drik.tithi(jd, place)
        res["tithi"] = {
            "number": tithi_info[0], "start": tithi_info[1],  "end": tithi_info[2],
            "fraction": tithi_info[3], "next_number": tithi_info[4],
            "next_start": tithi_info[5], "next_end": tithi_info[6]
        }
        nak_info = drik.nakshatra(jd, place)
        res["nakshatra"] = {
            "number": nak_info[0], "pada": nak_info[1],
            "start": nak_info[2], "end": nak_info[3],
            "next_number": nak_info[4], "next_start": nak_info[5], "next_end": nak_info[6]
        }
        yoga_info = drik.yogam(jd, place)
        res["yoga"] = {
            "number": yoga_info[0], "start": yoga_info[1], "end": yoga_info[2]
        }
        kar_info = drik.karana(jd, place)
        res["karana"] = {
            "number": kar_info[0], "start": kar_info[1], "end": kar_info[2]
        }
        raasi_info = drik.raasi(jd, place)
        res["rasi"] = {"number": raasi_info[0], "end": raasi_info[1]}

        lm = drik.lunar_month(jd, place)
        res["lunar_month"] = {
            "month": lm[0], "is_adhika": lm[1], "is_nija": lm[2]
        }
        lmd = drik.lunar_month_date(jd, place)
        res["lunar_date"] = {
            "month": lmd[0], "day": lmd[1], "vedic_year": lmd[2],
            "is_adhika": lmd[3], "is_nija": lmd[4]
        }
        ey = drik.elapsed_year(jd, lm[0])
        res["elapsed_years"] = {"kali": ey[0], "vikrama": ey[1], "saka": ey[2]}

        res["rahu_kalam"]    = drik.raahu_kaalam(jd, place)
        res["yamaganda"]     = drik.yamaganda_kaalam(jd, place)
        res["gulikai"]       = drik.gulikai_kaalam(jd, place)
        res["abhijit"]       = drik.abhijit_muhurta(jd, place)
        res["durmuhurtam"]   = drik.durmuhurtam(jd, place)
        res["gauri_choghadiya"] = drik.gauri_choghadiya(jd, place)
        return res

    return _safe(calc)

@app.post("/panchanga/tithi", tags=["Panchanga"])
def get_tithi(data: DateTimeData):
    """Get tithi for a given date/time/place."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    t = _safe(drik.tithi, jd, place)
    return {"number": t[0], "start": t[1], "end": t[2], "fraction": t[3],
            "next_number": t[4], "next_start": t[5], "next_end": t[6]}

@app.post("/panchanga/nakshatra", tags=["Panchanga"])
def get_nakshatra(data: DateTimeData):
    """Get nakshatra for a given date/time/place."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    n = _safe(drik.nakshatra, jd, place)
    return {"number": n[0], "pada": n[1], "start": n[2], "end": n[3],
            "next_number": n[4], "next_start": n[5], "next_end": n[6]}

@app.post("/panchanga/yoga", tags=["Panchanga"])
def get_yoga(data: DateTimeData):
    """Get yoga for a given date/time/place."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    y = _safe(drik.yogam, jd, place)
    return {"number": y[0], "start": y[1], "end": y[2]}

@app.post("/panchanga/karana", tags=["Panchanga"])
def get_karana(data: DateTimeData):
    """Get karana for a given date/time/place."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    k = _safe(drik.karana, jd, place)
    return {"number": k[0], "start": k[1], "end": k[2]}

@app.post("/panchanga/sunrise-sunset", tags=["Panchanga"])
def get_sunrise_sunset(data: DateTimeData):
    """Get sunrise/sunset/moonrise/moonset times."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    def calc():
        sr = drik.sunrise(jd, place)
        ss = drik.sunset(jd, place)
        mr = drik.moonrise(jd, place)
        ms_ = drik.moonset(jd, place)
        return {
            "sunrise":  {"decimal": sr[0], "time": sr[1], "jd": sr[2]},
            "sunset":   {"decimal": ss[0], "time": ss[1], "jd": ss[2]},
            "moonrise": {"decimal": mr[0], "time": mr[1], "jd": mr[2]},
            "moonset":  {"decimal": ms_[0], "time": ms_[1], "jd": ms_[2]},
        }
    return _safe(calc)

@app.post("/panchanga/muhurta", tags=["Panchanga"])
def get_muhurta(data: DateTimeData):
    """Get auspicious/inauspicious time periods for the day."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    def calc():
        return {
            "rahu_kalam":       drik.raahu_kaalam(jd, place),
            "yamaganda":        drik.yamaganda_kaalam(jd, place),
            "gulikai":          drik.gulikai_kaalam(jd, place),
            "abhijit":          drik.abhijit_muhurta(jd, place),
            "durmuhurtam":      drik.durmuhurtam(jd, place),
            "gauri_choghadiya": drik.gauri_choghadiya(jd, place),
        }
    return _safe(calc)

@app.post("/panchanga/planet-positions", tags=["Panchanga"])
def get_planet_positions(data: DateTimeData):
    """Get current sidereal positions of all planets."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    def calc():
        planets = drik.dhasavarga(jd, place, divisional_chart_factor=1)
        result = []
        planet_names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus",
                        "Saturn","Rahu","Ketu","Uranus","Neptune","Pluto","Ascendant"]
        for item in planets:
            pid = item[0]
            rasi, lon = item[1][0], item[1][1]
            result.append({
                "planet_id": pid,
                "planet_name": planet_names[pid] if pid < len(planet_names) else str(pid),
                "rasi": rasi,
                "longitude": round(lon, 4)
            })
        retro = drik.planets_in_retrograde(jd, place)
        return {"planets": result, "retrograde": retro}
    return _safe(calc)

@app.post("/panchanga/special-lagnas", tags=["Panchanga"])
def get_special_lagnas(data: BirthData):
    """Get special lagnas: Bhava, Hora, Ghati, Sree, Pranapada, Indu, Bhrigu-Bindhu."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    dob = (data.year, data.month, data.day)
    tob = (data.hour, data.minute, int(data.second))
    def calc():
        return {
            "bhava_lagna":          drik.bhava_lagna(jd, place),
            "hora_lagna":           drik.hora_lagna(jd, place),
            "ghati_lagna":          drik.ghati_lagna(jd, place),
            "sree_lagna":           drik.sree_lagna(jd, place),
            "pranapada_lagna":      drik.pranapada_lagna(jd, place),
            "indu_lagna":           drik.indu_lagna(jd, place),
            "bhrigu_bindhu_lagna":  drik.bhrigu_bindhu_lagna(jd, place),
            "kaala_longitude":      drik.kaala_longitude(dob, tob, place),
            "mrityu_longitude":     drik.mrityu_longitude(dob, tob, place),
            "gulika_longitude":     drik.gulika_longitude(dob, tob, place),
            "maandi_longitude":     drik.maandi_longitude(dob, tob, place),
        }
    return _safe(calc)

# ─────────────────── Horoscope endpoints ──────────────────────────────────────

@app.post("/horoscope/rasi-chart", tags=["Horoscope"])
def get_rasi_chart(data: BirthData):
    """Get Rasi (D1) birth chart planet positions."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import charts
    place = _place(data)
    jd = _jd(data)
    def calc():
        pp = charts.rasi_chart(jd, place)
        planet_names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus",
                        "Saturn","Rahu","Ketu","Uranus","Neptune","Pluto","Ascendant"]
        result = []
        for item in pp:
            pid, (rasi, lon) = item[0], item[1]
            result.append({
                "planet_id": pid,
                "planet_name": planet_names[pid] if pid < len(planet_names) else str(pid),
                "rasi": rasi,
                "longitude": round(lon, 4)
            })
        retro = drik.planets_in_retrograde(jd, place)
        asc = drik.ascendant(jd, place)
        return {
            "planets": result,
            "retrograde": retro,
            "ascendant": {"rasi": asc[0], "longitude": round(asc[1], 4),
                          "nakshatra": asc[2], "pada": asc[3]}
        }
    return _safe(calc)

@app.post("/horoscope/divisional-chart", tags=["Horoscope"])
def get_divisional_chart(data: DivisionalChartRequest):
    """Get any divisional chart (D1 to D144) planet positions."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import charts
    place = _place(data)
    jd = _jd(data)
    def calc():
        pp = charts.divisional_chart(jd, place,
                                     divisional_chart_factor=data.divisional_chart_factor,
                                     chart_method=data.chart_method)
        planet_names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus",
                        "Saturn","Rahu","Ketu","Uranus","Neptune","Pluto","Ascendant"]
        result = []
        for item in pp:
            pid, (rasi, lon) = item[0], item[1]
            result.append({
                "planet_id": pid,
                "planet_name": planet_names[pid] if pid < len(planet_names) else str(pid),
                "rasi": rasi,
                "longitude": round(lon, 4)
            })
        return {"divisional_factor": data.divisional_chart_factor,
                "chart_method": data.chart_method, "planets": result}
    return _safe(calc)

@app.post("/horoscope/bhava-chart", tags=["Horoscope"])
def get_bhava_chart(data: BirthData):
    """Get bhava (house) chart with cusps and planet assignments."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import charts
    place = _place(data)
    jd = _jd(data)
    def calc():
        result = charts.bhava_chart(jd, place)
        return {"bhava_chart": result}
    return _safe(calc)

@app.post("/horoscope/full-info", tags=["Horoscope"])
def get_full_horoscope(data: HoroscopeRequest):
    """Get complete horoscope information including all chart data."""
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    utils.set_language(data.language)
    def calc():
        h = horoscope_main.Horoscope(
            latitude=data.latitude,
            longitude=data.longitude,
            timezone_offset=data.timezone_offset,
            date_in=(data.year, data.month, data.day),
            birth_time=(data.hour, data.minute, int(data.second)),
            language=data.language,
            bhava_madhya_method=data.bhava_madhya_method
        )
        info, chart_arr, asc_house = h.get_horoscope_information_for_chart(
            chart_index=data.chart_index,
            chart_method=data.chart_method,
            divisional_chart_factor=data.divisional_chart_factor
        )
        return {"horoscope_info": info, "chart_array": chart_arr, "asc_house": asc_house}
    return _safe(calc)

@app.post("/horoscope/calendar-info", tags=["Horoscope"])
def get_calendar_info(data: BirthData):
    """Get calendar/panchanga info for the birth date."""
    _set_ayanamsa(data)
    utils.set_language(data.language)
    def calc():
        h = horoscope_main.Horoscope(
            latitude=data.latitude,
            longitude=data.longitude,
            timezone_offset=data.timezone_offset,
            date_in=(data.year, data.month, data.day),
            birth_time=(data.hour, data.minute, int(data.second)),
            language=data.language
        )
        return h.get_calendar_information()
    return _safe(calc)

@app.post("/horoscope/chara-karakas", tags=["Horoscope"])
def get_chara_karakas(data: BirthData):
    """Get Chara Karaka planets (AtmaKaraka, AmatyaKaraka, etc.)."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import house, charts
    place = _place(data)
    jd = _jd(data)
    def calc():
        pp = charts.rasi_chart(jd, place)
        karakas = house.chara_karakas(pp)
        karaka_names = ["AtmaKaraka","AmatyaKaraka","BhratruKaraka","MatruKaraka",
                        "PutraKaraka","GnatiKaraka","DaraKaraka","additional"]
        planet_names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus",
                        "Saturn","Rahu","Ketu","Uranus","Neptune","Pluto"]
        result = []
        for i, pk in enumerate(karakas):
            result.append({
                "karaka": karaka_names[i] if i < len(karaka_names) else f"Karaka-{i}",
                "planet_id": pk,
                "planet_name": planet_names[pk] if pk < len(planet_names) else str(pk)
            })
        return {"chara_karakas": result}
    return _safe(calc)

@app.post("/horoscope/arudhas", tags=["Horoscope"])
def get_arudhas(data: BirthData):
    """Get all bhava arudhas (A1-A12)."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import arudhas, charts
    place = _place(data)
    jd = _jd(data)
    def calc():
        pp = charts.rasi_chart(jd, place)
        ba = arudhas.bhava_arudhas_from_planet_positions(pp)
        sa = arudhas.surya_arudhas_from_planet_positions(pp)
        ca = arudhas.chandra_arudhas_from_planet_positions(pp)
        return {
            "bhava_arudhas":  [{"label": f"A{i+1}", "rasi": v} for i, v in enumerate(ba)],
            "surya_arudhas":  [{"label": f"S{i+1}", "rasi": v} for i, v in enumerate(sa)],
            "chandra_arudhas":[{"label": f"M{i+1}", "rasi": v} for i, v in enumerate(ca)]
        }
    return _safe(calc)

@app.post("/horoscope/ashtakavarga", tags=["Horoscope"])
def get_ashtakavarga(data: BirthData):
    """Get Ashtakavarga (Binna, Samudhaya, Prastara)."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import ashtakavarga, charts
    place = _place(data)
    jd = _jd(data)
    def calc():
        pp = charts.rasi_chart(jd, place)
        h2p = utils.get_house_planet_list_from_planet_positions(pp)
        bav, sav, pav = ashtakavarga.get_ashtaka_varga(h2p)
        return {"binna_ashtaka_varga": bav,
                "samudhaya_ashtaka_varga": sav,
                "prastara_ashtaka_varga": pav}
    return _safe(calc)

@app.post("/horoscope/yoga", tags=["Horoscope"])
def get_yoga(data: BirthData):
    """Get yoga details present in the horoscope."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import yoga
    place = _place(data)
    jd = _jd(data)
    utils.set_language(data.language)
    def calc():
        return yoga.get_yoga_details(jd, place, language=data.language)
    return _safe(calc)

@app.post("/horoscope/raja-yoga", tags=["Horoscope"])
def get_raja_yoga(data: BirthData):
    """Get raja yoga details present in the horoscope."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import raja_yoga
    place = _place(data)
    jd = _jd(data)
    utils.set_language(data.language)
    def calc():
        return raja_yoga.get_raja_yoga_details(jd, place, language=data.language)
    return _safe(calc)

@app.post("/horoscope/dosha", tags=["Horoscope"])
def get_dosha(data: BirthData):
    """Get dosha analysis (Mangal dosha, Kala Sarpa dosha, etc.)."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import dosha, charts
    place = _place(data)
    jd = _jd(data)
    def calc():
        pp = charts.rasi_chart(jd, place)
        h2p = utils.get_house_planet_list_from_planet_positions(pp)
        ks = dosha.kala_sarpa(h2p)
        mg = dosha.manglik(pp)
        return {
            "kala_sarpa": ks,
            "manglik": {
                "is_manglik": mg[0],
                "has_exceptions": mg[1],
                "exception_indices": mg[2] if len(mg) > 2 else []
            }
        }
    return _safe(calc)

@app.post("/horoscope/strength", tags=["Horoscope"])
def get_planetary_strength(data: BirthData):
    """Get Shadbala (six-fold) planetary strength calculations."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import strength, charts
    place = _place(data)
    jd = _jd(data)
    def calc():
        pp = charts.rasi_chart(jd, place)
        result = strength.shadbala(jd, place, pp)
        return {"shadbala": result}
    return _safe(calc)

# ─────────────────── Dhasa endpoints ──────────────────────────────────────────

def _get_dhasa_module(dhasa_type: str):
    """Dynamically import dhasa module by type name."""
    import importlib
    graha = ["vimsottari","ashtottari","yogini","tithi_yogini","tithi_ashtottari",
             "yoga_vimsottari","naisargika","karaka","tara","shodasottari",
             "dwadasottari","panchottari","shastihayani","chathuraaseethi_sama",
             "saptharishi_nakshathra","buddhi_gathi","kaala","aayu"]
    raasi = ["chara","sthira","shoola","brahma","narayana","kalachakra",
             "navamsa","nirayana","mandooka","trikona","drig","chakra",
             "moola","sudasa","varnada","lagnamsaka","kendradhi_rasi",
             "yogardha","tara_lagna"]
    annual = ["mudda","patyayini"]
    if dhasa_type in graha:
        return importlib.import_module(f"jhora.horoscope.dhasa.graha.{dhasa_type}")
    elif dhasa_type in raasi:
        return importlib.import_module(f"jhora.horoscope.dhasa.raasi.{dhasa_type}")
    elif dhasa_type in annual:
        return importlib.import_module(f"jhora.horoscope.dhasa.annual.{dhasa_type}")
    raise HTTPException(status_code=400, detail=f"Unknown dhasa type: {dhasa_type}")

@app.post("/dhasa", tags=["Dhasa"])
def get_dhasa(data: DhasaRequest):
    """
    Get Dhasa-Bhukti periods for any dhasa type.
    Common types: vimsottari, yogini, chara, narayana, etc.
    """
    _set_ayanamsa(data)
    place = _place(data)
    jd = _jd(data)
    dob = (data.year, data.month, data.day)
    tob = (data.hour, data.minute, int(data.second))
    def calc():
        mod = _get_dhasa_module(data.dhasa_type)
        if hasattr(mod, 'get_dhasa_bhukthi_table'):
            result = mod.get_dhasa_bhukthi_table(jd, place)
        elif hasattr(mod, 'get_dhasa_antardhasa_table'):
            result = mod.get_dhasa_antardhasa_table(jd, place)
        else:
            result = mod.vimsottari_dhasa_bhukthi(jd, place) \
                     if hasattr(mod, 'vimsottari_dhasa_bhukthi') else None
        return {"dhasa_type": data.dhasa_type, "periods": result}
    return _safe(calc)

# ─────────────────── Marriage Match endpoints ─────────────────────────────────

@app.post("/match/compatibility", tags=["Match"])
def get_marriage_compatibility(data: MatchData):
    """Get full marriage compatibility (Ashtakoota matching) between boy and girl."""
    from jhora.horoscope.match import compatibility
    def calc():
        utils.set_language(data.boy.language)
        drik.set_ayanamsa_mode(data.boy.ayanamsa_mode)
        boy_place  = _place(data.boy)
        girl_place = _place(data.girl)
        boy_jd   = _jd(data.boy)
        girl_jd  = _jd(data.girl)
        result = compatibility.match_compatibility(boy_jd, boy_place, girl_jd, girl_place,
                                                   language=data.boy.language)
        return result
    return _safe(calc)

# ─────────────────── Transit endpoints ───────────────────────────────────────

@app.post("/transit/current-planets", tags=["Transit"])
def get_current_planet_transits(data: BirthData):
    """Get current planetary positions relative to natal chart."""
    _set_ayanamsa(data)
    from jhora.horoscope.chart import charts
    place = _place(data)
    jd = _jd(data)
    # Current date JD
    from jhora.panchanga import drik as _drik
    import datetime
    now = datetime.datetime.utcnow()
    today_jd = utils.julian_day_number((now.year, now.month, now.day),
                                        (now.hour, now.minute, now.second))
    def calc():
        natal_pp   = charts.rasi_chart(jd, place)
        transit_pp = charts.rasi_chart(today_jd, place)
        planet_names = ["Sun","Moon","Mars","Mercury","Jupiter","Venus",
                        "Saturn","Rahu","Ketu","Uranus","Neptune","Pluto","Ascendant"]
        natal   = [{
            "planet_id": it[0],
            "planet_name": planet_names[it[0]] if it[0] < len(planet_names) else str(it[0]),
            "rasi": it[1][0], "longitude": round(it[1][1], 4)
        } for it in natal_pp]
        transit = [{
            "planet_id": it[0],
            "planet_name": planet_names[it[0]] if it[0] < len(planet_names) else str(it[0]),
            "rasi": it[1][0], "longitude": round(it[1][1], 4)
        } for it in transit_pp]
        return {"natal": natal, "transit": transit,
                "transit_date": now.isoformat()}
    return _safe(calc)

# ─────────────────── Utility endpoints ───────────────────────────────────────

@app.post("/utils/ayanamsa-value", tags=["Utils"])
def get_ayanamsa_value(data: DateTimeData):
    """Get ayanamsa value in degrees for a specific date."""
    _set_ayanamsa(data)
    jd = _jd(data)
    val = _safe(drik.get_ayanamsa_value, jd)
    return {"ayanamsa_mode": data.ayanamsa_mode, "value_degrees": round(val, 6)}

@app.post("/utils/julian-day", tags=["Utils"])
def get_julian_day(data: DateTimeData):
    """Convert calendar date/time to Julian Day Number."""
    jd = utils.julian_day_number(
        (data.year, data.month, data.day),
        (data.hour, data.minute, int(data.second))
    )
    return {"julian_day": jd}

@app.get("/health", tags=["Meta"])
def health():
    return {"status": "ok", "version": "1.0.0"}
