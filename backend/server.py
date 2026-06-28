"""
Pulse — Multi-Platform Social Media Growth Manager
Backend: FastAPI + MongoDB + Claude Sonnet 4.5 (via Emergent LLM Key)
"""
from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, Request, Response, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import io
import json
import logging
import asyncio
import uuid
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
import httpx
import pandas as pd
from pypdf import PdfReader

from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# DB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY', '')

app = FastAPI(title="Pulse Growth API")
api_router = APIRouter(prefix="/api")

# ---------------- Models ----------------
class User(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    account_name: str
    niche: str
    audience: str
    goals: str
    content_style: str = ""
    posting_capacity: str = ""
    offers_or_products: str = ""
    inspiration_accounts: str = ""
    constraints: str = ""

class Project(ProjectCreate):
    project_id: str
    user_id: str
    created_at: datetime

# ---------------- Auth helpers ----------------
async def get_current_user(request: Request) -> User:
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")

    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user_doc)


# ---------------- Auth endpoints ----------------
@api_router.post("/auth/session")
async def auth_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    async with httpx.AsyncClient(timeout=15.0) as http:
        r = await http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id},
        )
        if r.status_code != 200:
            raise HTTPException(status_code=401, detail="Auth failed")
        data = r.json()

    email = data["email"]
    existing = await db.users.find_one({"email": email}, {"_id": 0})
    if existing:
        user_id = existing["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {"name": data["name"], "picture": data.get("picture")}}
        )
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data["name"],
            "picture": data.get("picture"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    session_token = data["session_token"]
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )

    user_doc = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    return {"user": user_doc, "session_token": session_token}


@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user.model_dump()


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_many({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"ok": True}


# ---------------- Projects ----------------
@api_router.post("/projects")
async def create_project(payload: ProjectCreate, user: User = Depends(get_current_user)):
    project_id = f"proj_{uuid.uuid4().hex[:12]}"
    doc = {
        "project_id": project_id,
        "user_id": user.user_id,
        **payload.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.projects.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/projects")
async def list_projects(user: User = Depends(get_current_user)):
    cursor = db.projects.find({"user_id": user.user_id}, {"_id": 0}).sort("created_at", -1)
    return await cursor.to_list(100)


@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, user: User = Depends(get_current_user)):
    proj = await db.projects.find_one({"project_id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Not found")
    return proj


@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user: User = Depends(get_current_user)):
    await db.projects.delete_one({"project_id": project_id, "user_id": user.user_id})
    await db.uploads.delete_many({"project_id": project_id})
    await db.reports.delete_many({"project_id": project_id})
    return {"ok": True}


# ---------------- File parsing ----------------
SUPPORTED_PLATFORMS = ["instagram", "twitter", "linkedin", "youtube", "tiktok"]


def _parse_csv(content: bytes) -> Dict[str, Any]:
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception:
        try:
            df = pd.read_csv(io.BytesIO(content), encoding="latin-1")
        except Exception as e:
            return {"error": str(e), "rows": 0}
    return _summarize_df(df)


def _parse_excel(content: bytes) -> Dict[str, Any]:
    try:
        sheets = pd.read_excel(io.BytesIO(content), sheet_name=None)
    except Exception as e:
        return {"error": str(e), "rows": 0}
    summary = {"sheets": {}, "rows": 0}
    for name, df in sheets.items():
        s = _summarize_df(df)
        summary["sheets"][name] = s
        summary["rows"] += s.get("rows", 0)
    return summary


def _summarize_df(df: pd.DataFrame) -> Dict[str, Any]:
    df = df.dropna(how="all")
    if df.empty:
        return {"rows": 0, "columns": [], "preview": [], "numeric_summary": {}}
    cols = [str(c) for c in df.columns]
    preview = df.head(20).fillna("").astype(str).to_dict(orient="records")
    numeric = {}
    for c in df.columns:
        if pd.api.types.is_numeric_dtype(df[c]):
            try:
                numeric[str(c)] = {
                    "sum": float(df[c].sum()),
                    "mean": float(df[c].mean()),
                    "max": float(df[c].max()),
                    "min": float(df[c].min()),
                    "count": int(df[c].count()),
                }
            except Exception:
                pass
    # detect date column
    date_col = None
    for c in df.columns:
        if "date" in str(c).lower() or "day" in str(c).lower() or "time" in str(c).lower():
            date_col = str(c)
            break
    timeseries = []
    if date_col:
        try:
            tmp = df.copy()
            tmp[date_col] = pd.to_datetime(tmp[date_col], errors="coerce")
            tmp = tmp.dropna(subset=[date_col]).sort_values(date_col)
            for _, row in tmp.head(60).iterrows():
                point = {"date": row[date_col].strftime("%Y-%m-%d")}
                for c in df.columns:
                    if c == date_col:
                        continue
                    val = row[c]
                    if pd.api.types.is_numeric_dtype(df[c]) and pd.notna(val):
                        point[str(c)] = float(val)
                timeseries.append(point)
        except Exception:
            pass
    return {
        "rows": int(len(df)),
        "columns": cols,
        "preview": preview,
        "numeric_summary": numeric,
        "timeseries": timeseries,
        "date_column": date_col,
    }


def _parse_pdf(content: bytes) -> Dict[str, Any]:
    try:
        reader = PdfReader(io.BytesIO(content))
        text = "\n".join((p.extract_text() or "") for p in reader.pages)
        return {"rows": len(reader.pages), "text": text[:8000], "columns": ["text"]}
    except Exception as e:
        return {"error": str(e), "rows": 0}


@api_router.post("/projects/{project_id}/uploads")
async def upload_file(
    project_id: str,
    platform: str = Form(...),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
):
    proj = await db.projects.find_one({"project_id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    if platform.lower() not in SUPPORTED_PLATFORMS:
        raise HTTPException(status_code=400, detail="Unsupported platform")

    content = await file.read()
    fname = file.filename or "upload"
    ext = fname.lower().rsplit(".", 1)[-1]
    if ext == "csv":
        parsed = _parse_csv(content)
    elif ext in ("xlsx", "xls"):
        parsed = _parse_excel(content)
    elif ext == "pdf":
        parsed = _parse_pdf(content)
    else:
        raise HTTPException(status_code=400, detail="Only CSV, XLSX, or PDF supported")

    upload_id = f"upl_{uuid.uuid4().hex[:12]}"
    doc = {
        "upload_id": upload_id,
        "project_id": project_id,
        "user_id": user.user_id,
        "platform": platform.lower(),
        "filename": fname,
        "size": len(content),
        "parsed": parsed,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.uploads.insert_one(doc)
    return {k: v for k, v in doc.items() if k != "_id"}


@api_router.get("/projects/{project_id}/uploads")
async def list_uploads(project_id: str, user: User = Depends(get_current_user)):
    cursor = db.uploads.find(
        {"project_id": project_id, "user_id": user.user_id},
        {"_id": 0, "parsed.preview": 0}
    ).sort("created_at", -1)
    return await cursor.to_list(200)


@api_router.delete("/uploads/{upload_id}")
async def delete_upload(upload_id: str, user: User = Depends(get_current_user)):
    await db.uploads.delete_one({"upload_id": upload_id, "user_id": user.user_id})
    return {"ok": True}


# ---------------- Multi-Agent System ----------------
AGENTS = [
    {
        "key": "audience_analyst",
        "name": "Audience Analyst",
        "role": "Read the raw metrics and surface what audience behavior they reveal — when people engage, what content keeps them watching, where attention drops off.",
    },
    {
        "key": "content_strategist",
        "name": "Content Strategist",
        "role": "Translate the audience signals into a content strategy: pillars, formats, hooks, and posting cadence tailored to the creator's niche and goals.",
    },
    {
        "key": "engagement_coach",
        "name": "Engagement Coach",
        "role": "Give specific, behavior-changing tactics to lift saves, shares, comments and DMs. Focus on call-to-action craft and community building.",
    },
    {
        "key": "competitor_insight",
        "name": "Competitor Insight",
        "role": "Compare the creator's posture to inspiration accounts and the broader niche. Find positioning gaps and opportunities.",
    },
    {
        "key": "action_planner",
        "name": "Action Planner",
        "role": "Synthesize all prior agent outputs into a concrete 30-day plan: weekly themes, specific post ideas, and a daily checklist.",
    },
]


def _profile_context(p: dict) -> str:
    return (
        f"Account: {p.get('account_name','')}\n"
        f"Niche: {p.get('niche','')}\n"
        f"Audience: {p.get('audience','')}\n"
        f"Goals: {p.get('goals','')}\n"
        f"Content style: {p.get('content_style','')}\n"
        f"Posting capacity: {p.get('posting_capacity','')}\n"
        f"Offers/Products: {p.get('offers_or_products','')}\n"
        f"Inspiration: {p.get('inspiration_accounts','')}\n"
        f"Constraints: {p.get('constraints','')}\n"
    )


def _uploads_context(uploads: list) -> str:
    parts = []
    for u in uploads:
        parsed = u.get("parsed", {})
        platform = u.get("platform")
        parts.append(f"\n=== Platform: {platform.upper()} | File: {u.get('filename')} ===")
        if "sheets" in parsed:
            for sn, s in parsed["sheets"].items():
                parts.append(f"Sheet: {sn} | rows={s.get('rows')} | cols={s.get('columns')}")
                if s.get("numeric_summary"):
                    parts.append(f"Numeric summary: {json.dumps(s['numeric_summary'])[:1500]}")
                if s.get("timeseries"):
                    parts.append(f"Time series sample: {json.dumps(s['timeseries'][:10])[:1500]}")
        else:
            parts.append(f"rows={parsed.get('rows')} cols={parsed.get('columns')}")
            if parsed.get("numeric_summary"):
                parts.append(f"Numeric summary: {json.dumps(parsed['numeric_summary'])[:1500]}")
            if parsed.get("timeseries"):
                parts.append(f"Time series sample: {json.dumps(parsed['timeseries'][:10])[:1500]}")
            if parsed.get("text"):
                parts.append(f"Text extract: {parsed['text'][:1500]}")
    return "\n".join(parts)


async def _run_agent(session_id: str, agent: dict, system_prompt: str, user_prompt: str) -> str:
    last_err = None
    for attempt in range(3):
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"{session_id}_{agent['key']}_{attempt}",
                system_message=system_prompt,
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")
            msg = UserMessage(text=user_prompt)
            resp = await chat.send_message(msg)
            text = resp if isinstance(resp, str) else str(resp)
            if text and not text.startswith("Failed to generate"):
                return text
            last_err = text or "empty response"
        except Exception as e:
            last_err = str(e)
        await asyncio.sleep(1.5 * (attempt + 1))
    raise RuntimeError(last_err or "agent failed after retries")


def _agent_system_prompt(agent: dict) -> str:
    return (
        f"You are the {agent['name']} on a multi-agent growth team for content creators. "
        f"Your role: {agent['role']}\n\n"
        "Be concrete and specific. Use creator-friendly language (no jargon). "
        "Cite numbers from the data when they support your point. Keep it tight — no filler, no hedging. "
        "Format your response in markdown with clear short sections."
    )


def _build_final_plan_prompt(profile_ctx: str, uploads_ctx: str, prior: dict) -> str:
    return (
        "PROFILE:\n" + profile_ctx + "\n\nDATA SUMMARY:\n" + uploads_ctx +
        "\n\nPRIOR AGENT OUTPUTS:\n"
        f"--- AUDIENCE ANALYST ---\n{prior.get('audience_analyst','')}\n"
        f"--- CONTENT STRATEGIST ---\n{prior.get('content_strategist','')}\n"
        f"--- ENGAGEMENT COACH ---\n{prior.get('engagement_coach','')}\n"
        f"--- COMPETITOR INSIGHT ---\n{prior.get('competitor_insight','')}\n\n"
        "TASK: Produce the FINAL 30-day action plan as STRICT JSON with this shape:\n"
        "{\n"
        '  "north_star": {"metric": "string", "current": "string", "target": "string", "why": "string"},\n'
        '  "weekly_themes": [{"week": 1, "theme": "string", "focus": "string"}, ...4 items],\n'
        '  "content_ideas": [{"title": "string", "platform": "string", "format": "string", "hook": "string", "cta": "string"}, ...8 items],\n'
        '  "posting_schedule": [{"day": "Mon", "platform": "string", "format": "string", "time": "string"}, ...],\n'
        '  "daily_checklist": ["string", ...6 items],\n'
        '  "key_risks": ["string", ...3 items]\n'
        "}\n"
        "Respond with ONLY the JSON, no markdown fences."
    )


@api_router.post("/projects/{project_id}/analyze")
async def analyze(project_id: str, user: User = Depends(get_current_user)):
    proj = await db.projects.find_one({"project_id": project_id, "user_id": user.user_id}, {"_id": 0})
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    uploads = await db.uploads.find(
        {"project_id": project_id, "user_id": user.user_id}, {"_id": 0}
    ).to_list(100)
    if not uploads:
        raise HTTPException(status_code=400, detail="Upload at least one platform export first")

    report_id = f"rpt_{uuid.uuid4().hex[:12]}"
    await db.reports.insert_one({
        "report_id": report_id,
        "project_id": project_id,
        "user_id": user.user_id,
        "status": "running",
        "logs": [],
        "agent_outputs": {},
        "final_plan": None,
        "platforms": list({u["platform"] for u in uploads}),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    profile_ctx = _profile_context(proj)
    uploads_ctx = _uploads_context(uploads)

    async def push_log(text: str):
        await db.reports.update_one(
            {"report_id": report_id},
            {"$push": {"logs": {"t": datetime.now(timezone.utc).isoformat(), "msg": text}}},
        )

    async def runner():
        try:
            outputs = {}
            await push_log("[boot] Pulse multi-agent system initialized")
            await push_log(f"[boot] Platforms detected: {', '.join(sorted({u['platform'] for u in uploads}))}")
            await push_log(f"[boot] Records ingested: {sum(u.get('parsed',{}).get('rows',0) for u in uploads)}")

            for agent in AGENTS[:-1]:  # first 4 agents
                await push_log(f"[{agent['key']}] ▶ booting agent: {agent['name']}")
                user_prompt = (
                    "CREATOR PROFILE:\n" + profile_ctx +
                    "\n\nUPLOADED DATA SUMMARY:\n" + uploads_ctx +
                    ("\n\nPRIOR ANALYSIS:\n" + json.dumps(outputs)[:3000] if outputs else "")
                )
                try:
                    out = await _run_agent(report_id, agent, _agent_system_prompt(agent), user_prompt)
                except Exception as e:
                    out = f"(agent error: {e})"
                outputs[agent["key"]] = out
                await db.reports.update_one(
                    {"report_id": report_id},
                    {"$set": {f"agent_outputs.{agent['key']}": out}},
                )
                preview = (out[:120] + "…") if len(out) > 120 else out
                await push_log(f"[{agent['key']}] ✓ done — {preview}")

            # final planner — JSON
            planner = AGENTS[-1]
            await push_log(f"[{planner['key']}] ▶ synthesizing 30-day action plan")
            sys_p = _agent_system_prompt(planner) + "\nReturn STRICT JSON only."
            user_p = _build_final_plan_prompt(profile_ctx, uploads_ctx, outputs)
            raw = await _run_agent(report_id, planner, sys_p, user_p)
            outputs[planner["key"]] = raw
            await db.reports.update_one(
                {"report_id": report_id},
                {"$set": {f"agent_outputs.{planner['key']}": raw}},
            )
            # try parse JSON
            plan_json = None
            try:
                stripped = raw.strip()
                if stripped.startswith("```"):
                    stripped = stripped.strip("`")
                    if stripped.lower().startswith("json"):
                        stripped = stripped[4:].strip()
                start = stripped.find("{")
                end = stripped.rfind("}")
                if start >= 0 and end > start:
                    plan_json = json.loads(stripped[start:end+1])
            except Exception as e:
                await push_log(f"[action_planner] ⚠ JSON parse fallback: {e}")

            await db.reports.update_one(
                {"report_id": report_id},
                {"$set": {
                    "final_plan": plan_json,
                    "status": "complete",
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                }},
            )
            await push_log("[done] Growth plan ready")
        except Exception as e:
            await db.reports.update_one(
                {"report_id": report_id},
                {"$set": {"status": "failed", "error": str(e)}},
            )
            await push_log(f"[error] {e}")

    asyncio.create_task(runner())
    return {"report_id": report_id, "status": "running"}


@api_router.get("/reports/{report_id}")
async def get_report(report_id: str, user: User = Depends(get_current_user)):
    rpt = await db.reports.find_one(
        {"report_id": report_id, "user_id": user.user_id}, {"_id": 0}
    )
    if not rpt:
        raise HTTPException(status_code=404, detail="Not found")
    return rpt


@api_router.get("/projects/{project_id}/reports")
async def list_reports(project_id: str, user: User = Depends(get_current_user)):
    cursor = db.reports.find(
        {"project_id": project_id, "user_id": user.user_id},
        {"_id": 0, "logs": 0}
    ).sort("created_at", -1)
    return await cursor.to_list(50)


# ---------------- Share links ----------------
@api_router.post("/reports/{report_id}/share")
async def create_share(report_id: str, request: Request, user: User = Depends(get_current_user)):
    rpt = await db.reports.find_one({"report_id": report_id, "user_id": user.user_id}, {"_id": 0})
    if not rpt:
        raise HTTPException(status_code=404, detail="Report not found")
    body = {}
    try:
        body = await request.json()
    except Exception:
        pass
    expires_in_days = int(body.get("expires_in_days") or 0)
    token = uuid.uuid4().hex[:20]
    expires_at = (datetime.now(timezone.utc) + timedelta(days=expires_in_days)).isoformat() if expires_in_days > 0 else None
    await db.report_shares.delete_many({"report_id": report_id})
    await db.report_shares.insert_one({
        "share_token": token,
        "report_id": report_id,
        "project_id": rpt["project_id"],
        "user_id": user.user_id,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return {"share_token": token, "expires_at": expires_at}


@api_router.get("/reports/{report_id}/share")
async def get_share(report_id: str, user: User = Depends(get_current_user)):
    s = await db.report_shares.find_one({"report_id": report_id, "user_id": user.user_id}, {"_id": 0})
    return s or {}


@api_router.delete("/reports/{report_id}/share")
async def delete_share(report_id: str, user: User = Depends(get_current_user)):
    await db.report_shares.delete_many({"report_id": report_id, "user_id": user.user_id})
    return {"ok": True}


@api_router.get("/public/share/{token}")
async def public_share(token: str):
    share = await db.report_shares.find_one({"share_token": token}, {"_id": 0})
    if not share:
        raise HTTPException(status_code=404, detail="Invalid or expired link")
    if share.get("expires_at"):
        exp = datetime.fromisoformat(share["expires_at"])
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < datetime.now(timezone.utc):
            raise HTTPException(status_code=410, detail="Link expired")
    rpt = await db.reports.find_one({"report_id": share["report_id"]}, {"_id": 0, "logs": 0})
    if not rpt:
        raise HTTPException(status_code=404, detail="Report missing")
    proj = await db.projects.find_one({"project_id": share["project_id"]}, {"_id": 0})
    # charts
    uploads = await db.uploads.find({"project_id": share["project_id"]}, {"_id": 0}).to_list(100)
    platforms = {}
    for u in uploads:
        plat = u["platform"]
        parsed = u.get("parsed", {})
        platforms.setdefault(plat, {"timeseries": [], "metrics": {}, "files": []})
        platforms[plat]["files"].append(u.get("filename"))
        sheets_iter = parsed.get("sheets", {}).items() if "sheets" in parsed else [(u.get("filename","data"), parsed)]
        for sn, s in sheets_iter:
            for k, v in (s.get("numeric_summary") or {}).items():
                key = f"{sn}:{k}" if "sheets" in parsed else k
                platforms[plat]["metrics"][key] = v
            if s.get("timeseries"):
                platforms[plat]["timeseries"].extend(s["timeseries"])
    return {
        "report": rpt,
        "project": {"account_name": proj.get("account_name"), "niche": proj.get("niche")} if proj else {},
        "charts": {"platforms": platforms},
        "expires_at": share.get("expires_at"),
    }


@api_router.get("/projects/{project_id}/charts")
async def project_charts(project_id: str, user: User = Depends(get_current_user)):
    """Aggregate uploaded data into chart-ready series."""
    uploads = await db.uploads.find(
        {"project_id": project_id, "user_id": user.user_id}, {"_id": 0}
    ).to_list(100)

    platforms = {}
    for u in uploads:
        plat = u["platform"]
        parsed = u.get("parsed", {})
        platforms.setdefault(plat, {"timeseries": [], "metrics": {}, "files": []})
        platforms[plat]["files"].append(u.get("filename"))

        sheets_iter = parsed.get("sheets", {}).items() if "sheets" in parsed else [(u.get("filename","data"), parsed)]
        for sn, s in sheets_iter:
            for k, v in (s.get("numeric_summary") or {}).items():
                key = f"{sn}:{k}" if "sheets" in parsed else k
                platforms[plat]["metrics"][key] = v
            if s.get("timeseries"):
                platforms[plat]["timeseries"].extend(s["timeseries"])
    return {"platforms": platforms}


@api_router.get("/")
async def root():
    return {"app": "pulse", "ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
