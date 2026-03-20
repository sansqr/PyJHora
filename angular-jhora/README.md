# JHora Angular UI

A full Angular 17 frontend for the **PyJHora** Vedic Astrology library, backed by a **FastAPI** REST API.

---

## Architecture

```
e:\HB\
├── api/
│   ├── app.py           ← FastAPI backend (all PyJHora endpoints)
│   └── requirements.txt
└── angular-jhora/       ← Angular 17 SPA frontend
    └── src/app/
        ├── app.component.ts          ← Root (sidenav layout)
        ├── app.routes.ts             ← Lazy-loaded routes
        ├── app.config.ts             ← provideRouter / provideHttpClient
        ├── models/
        │   └── jhora.models.ts       ← TypeScript interfaces + label arrays
        ├── services/
        │   └── jhora-api.service.ts  ← HttpClient wrapper for every endpoint
        ├── shared/
        │   ├── birth-data-form/      ← Reusable birth-data form with city lookup
        │   └── vedic-chart/          ← South-Indian chart grid component
        ├── panchanga/                ← Daily almanac page
        ├── horoscope/                ← D1–D144 charts + arudhas + special lagnas
        ├── dhasa-bhukti/             ← All 37+ dhasa types
        ├── analysis/                 ← Yogas, Raja Yoga, Dosha, Ashtakavarga, Shadbala, Transit
        ├── match/                    ← Ashtakoota marriage compatibility
        └── muhurta/                  ← Rahu Kalam, Yamaganda, Abhijit, Choghadiya
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | ≥ 3.8 |
| Node.js | ≥ 18 |
| Angular CLI | ≥ 17 |

---

## 1 – Start the FastAPI Backend


```powershell
cd e:\HB

# Install API dependencies
pip install -r api/requirements.txt

# Install PyJHora package (editable)
pip install -e src/

# Run the server
uvicorn api.app:app --reload --port 8000
```

Interactive API docs: **http://localhost:8000/docs**

---

## 2 – Start the Angular Frontend

```powershell
cd e:\HB\angular-jhora

npm install
ng serve          # → http://localhost:4200
```

---

## UI Pages & Mapped API Endpoints

| Page | Route | API Endpoints |
|------|-------|---------------|
| **Panchanga** | `/panchanga` | `POST /panchanga`, `/panchanga/tithi`, `/panchanga/nakshatra`, `/panchanga/yoga`, `/panchanga/karana`, `/panchanga/sunrise-sunset`, `/panchanga/muhurta` |
| **Horoscope** | `/horoscope` | `POST /horoscope/rasi-chart`, `/horoscope/divisional-chart`, `/horoscope/bhava-chart`, `/horoscope/chara-karakas`, `/horoscope/arudhas`, `/panchanga/special-lagnas` |
| **Dhasa-Bhukti** | `/dhasa` | `POST /dhasa` (all 37 dhasa types) |
| **Analysis** | `/analysis` | `POST /horoscope/yoga`, `/raja-yoga`, `/dosha`, `/ashtakavarga`, `/strength`, `/transit/current-planets` |
| **Muhurta** | `/muhurta` | `POST /panchanga/muhurta` |
| **Match** | `/match` | `POST /match/compatibility` |

---

## Key Design Decisions

- **Standalone components** — no `NgModule` boilerplate (Angular 17).
- **Lazy loading** — each page is a lazy-loaded route for fast initial load.
- **Angular Material** — `indigo-pink` theme; all components from `@angular/material`.
- **South-Indian Vedic chart** — `VedicChartComponent` renders a 4×4 grid with fixed rasi positions; retrograde planets shown in parentheses.
- **BirthDataFormComponent** — reusable form used across all pages; city lookup calls `POST /search-location` (OpenStreetMap via geopy).
- **Error handling** — every API call shows `error.detail` from FastAPI's `HTTPException`.

---

## Adding More Dhasa Types

All 37 dhasa modules are already wired in the backend `_get_dhasa_module()` helper. The frontend lists them in `dhasa-bhukti.component.ts`. No additional work needed.

## Production Build

```powershell
cd e:\HB\angular-jhora
ng build --configuration production
# Output: dist/angular-jhora/
```
