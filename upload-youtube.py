#!/usr/bin/env python3
import argparse
import hashlib
import json
import os
import pickle
import subprocess
import sys
import time
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
CLIENT_SECRET = os.path.join(os.path.dirname(__file__), "client_secret.json")
TOKEN_FILE = os.path.join(os.path.dirname(__file__), "youtube_token.pickle")

CATEGORIES = {
    "film": "1", "autos": "2", "music": "10", "pets": "15",
    "sports": "17", "travel": "19", "gaming": "20", "people": "22",
    "comedy": "23", "entertainment": "24", "news": "25", "howto": "26",
    "education": "27", "science": "28", "nonprofit": "29",
}


def get_authenticated_service():
    credentials = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as f:
            credentials = pickle.load(f)

    if not credentials or not credentials.valid:
        if credentials and credentials.expired and credentials.refresh_token:
            credentials.refresh(Request())
        else:
            if not os.path.exists(CLIENT_SECRET):
                print(f"ERROR: {CLIENT_SECRET} not found")
                print("Download it from https://console.cloud.google.com/")
                sys.exit(1)
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRET, SCOPES)
            credentials = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "wb") as f:
            pickle.dump(credentials, f)

    return build("youtube", "v3", credentials=credentials)


def upload_video(youtube, video_path, title, description, tags, category_id, privacy):
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": category_id,
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(video_path, chunksize=-1, resumable=True)
    request = youtube.videos().insert(
        part="snippet,status",
        body=body,
        media_body=media,
    )

    print(f"  Uploading: {title}")
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            pct = int(status.progress() * 100)
            print(f"  Progress: {pct}%", end="\r", flush=True)

    print(f"\n  Done! Video ID: {response['id']}")
    print(f"  URL: https://youtu.be/{response['id']}")
    return response["id"]


def load_groq_key():
    env = os.environ.copy()
    if env.get("GROQ_API_KEY"):
        return env["GROQ_API_KEY"]
    dotenv = os.path.join(os.path.dirname(__file__), ".env")
    try:
        for line in open(dotenv):
            if line.startswith("GROQ_API_KEY="):
                return line.strip().split("=", 1)[1]
    except FileNotFoundError:
        pass
    print("WARNING: GROQ_API_KEY not set. Set it in .env or environment variable.")
    return ""

def generate_meta(name, quote):
    script = os.path.join(os.path.dirname(__file__), "generate-meta.py")
    env = os.environ.copy()
    if not env.get("GROQ_API_KEY"):
        env["GROQ_API_KEY"] = load_groq_key()
    try:
        r = subprocess.run(
            ["python3", script, name, quote],
            capture_output=True, text=True, timeout=15, env=env,
        )
        if r.returncode == 0:
            return json.loads(r.stdout.strip())
    except Exception:
        pass
    return None

AFFILIATE_FILE = os.path.join(os.path.dirname(__file__), "affiliate-links.json")

def append_affiliate_links(name, desc):
    try:
        with open(AFFILIATE_FILE) as f:
            cfg = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return desc
    tag = cfg.get("tag", "")
    domain = cfg.get("domain", "amazon.com")
    msg = cfg.get("default_message", "")
    philosophers = cfg.get("philosophers", {})

    # Find philosopher (case-insensitive partial match)
    found = None
    for key in philosophers:
        if name.lower().strip() == key.lower().strip() or key.lower() in name.lower():
            found = key
            break
    if not found:
        return desc

    books = philosophers[found]
    links = []
    for b in books:
        url = f"https://www.{domain}/dp/{b['asin']}?tag={tag}"
        links.append(f"📖 {b['title']}: {url}")

    if not links:
        return desc

    affiliate_block = f"\n\n{msg}\n" + "\n".join(links)
    return desc + affiliate_block

STATE_FILE = os.path.join(os.path.dirname(__file__), "out", "uploaded-quotes.json")

def load_uploaded():
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def mark_uploaded(quote_id, platform, name, quote):
    state = load_uploaded()
    state.append({"id": quote_id, "platform": platform, "name": name, "quote": quote, "date": time.strftime("%Y-%m-%d %H:%M")})
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)

def is_already_uploaded(quote_id, platform):
    for item in load_uploaded():
        if item["id"] == quote_id and item["platform"] == platform:
            return True
    return False

def main():
    parser = argparse.ArgumentParser(description="Upload reel to YouTube")
    parser.add_argument("video", help="Path to video file")
    parser.add_argument("--title", help="Video title")
    parser.add_argument("--desc", help="Video description")
    parser.add_argument("--name", help="Philosopher name (auto-generate meta via Groq)")
    parser.add_argument("--quote", help="Quote text for Groq generation")
    parser.add_argument("--tags", nargs="+", default=["philosophy", "wisdom"])
    parser.add_argument("--category", default="education",
                        choices=list(CATEGORIES.keys()))
    parser.add_argument("--privacy", default="public",
                        choices=["public", "unlisted", "private"])
    parser.add_argument("--delete", action="store_true", help="Delete video file after successful upload")
    parser.add_argument("--force", action="store_true", help="Upload even if already uploaded")
    args = parser.parse_args()

    if not os.path.exists(args.video):
        print(f"File not found: {args.video}")
        sys.exit(1)

    name = args.name or "Unknown"
    quote = args.quote or name
    quote_id = hashlib.md5(f"{name}:{quote}".encode()).hexdigest()[:12]

    # Check duplicate
    if not args.force and is_already_uploaded(quote_id, "youtube"):
        print(f"  [YouTube] Already uploaded: {name} — {quote[:40]}...")
        return

    title = args.title
    desc = args.desc

    if args.name and (not title or not desc):
        meta = generate_meta(args.name, args.quote or args.name)
        if meta:
            title = title or meta.get("title", "")
            h = meta.get("hashtags", "")
            d = meta.get("description", "")
            desc = desc or f"{d}\n\n{h}" if h else d
            print(f"[Groq] Title: {title}")

    if not title:
        title = os.path.splitext(os.path.basename(args.video))[0]
    if not desc:
        desc = f"{title}\n\n#philosophy #wisdom"

    desc = append_affiliate_links(name, desc)

    print("Authenticating with YouTube...")
    youtube = get_authenticated_service()
    print("Authenticated!\n")

    upload_video(
        youtube, args.video, title, desc,
        args.tags, CATEGORIES[args.category], args.privacy,
    )

    mark_uploaded(quote_id, "youtube", name, quote[:60])

    if args.delete:
        os.remove(args.video)
        print(f"  Deleted: {args.video}")


if __name__ == "__main__":
    main()
