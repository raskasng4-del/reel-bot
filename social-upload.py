#!/usr/bin/env python3
import argparse
import hashlib
import mimetypes
import os
import sys
import requests
import time
import json

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "social_config.json")

# ─── Facebook ─────────────────────────────────────────────
def upload_facebook(page_id, token, video_path, title, desc):
    url = f"https://graph.facebook.com/v22.0/{page_id}/videos"
    print(f"  [Facebook] Uploading...")
    with open(video_path, "rb") as f:
        r = requests.post(url, {
            "access_token": token,
            "title": title,
            "description": desc,
        }, files={"source": f})
    if r.status_code == 200:
        vid = r.json().get("id", "?")
        print(f"  [Facebook] OK -> https://fb.watch/ (id: {vid})")
        return vid
    print(f"  [Facebook] FAILED: {r.text}")
    return None

# ─── Instagram ────────────────────────────────────────────
def upload_instagram(ig_user_id, fb_token, video_path, caption):
    print(f"  [Instagram] Creating media container...")
    url = f"https://graph.facebook.com/v22.0/{ig_user_id}/media"
    r = requests.post(url, {
        "access_token": fb_token,
        "media_type": "VIDEO",
        "video_url": "",  # needs public URL, not local path
        "caption": caption,
    })
    if r.status_code != 200:
        print(f"  [Instagram] FAILED create: {r.text}")
        return None
    creation_id = r.json().get("id")
    if not creation_id:
        return None

    print(f"  [Instagram] Publishing container {creation_id}...")
    time.sleep(5)
    pub_url = f"https://graph.facebook.com/v22.0/{ig_user_id}/media_publish"
    r2 = requests.post(pub_url, {
        "access_token": fb_token,
        "creation_id": creation_id,
    })
    if r2.status_code == 200:
        media_id = r2.json().get("id", "?")
        print(f"  [Instagram] OK -> id: {media_id}")
        return media_id
    print(f"  [Instagram] FAILED publish: {r2.text}")
    return None

# ─── TikTok ───────────────────────────────────────────────
def upload_tiktok(access_token, open_id, video_path, desc):
    print(f"  [TikTok] Uploading...")
    url = "https://open-api.tiktok.com/share/video/upload/"
    with open(video_path, "rb") as f:
        r = requests.post(url, {
            "access_token": access_token,
            "open_id": open_id,
            "description": desc,
        }, files={"video": f})
    if r.status_code == 200:
        data = r.json()
        if data.get("data", {}).get("error_code") == 0:
            print(f"  [TikTok] OK")
            return data["data"].get("share_id")
    print(f"  [TikTok] FAILED: {r.text[:300]}")
    return None

# ─── Config management ────────────────────────────────────
def save_config(config):
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)
    os.chmod(CONFIG_FILE, 0o600)
    print(f"Config saved to {CONFIG_FILE}")

def load_config():
    if not os.path.exists(CONFIG_FILE):
        return {}
    with open(CONFIG_FILE) as f:
        return json.load(f)

def resolve_page_token(user_token, page_id):
    """Exchange a User Access Token for a Page Access Token."""
    r = requests.get("https://graph.facebook.com/v22.0/me/accounts",
                     params={"access_token": user_token})
    for page in r.json().get("data", []):
        if page["id"] == page_id:
            return page["access_token"]
    return None

def setup():
    print("=== Social Upload Setup ===\n")
    config = load_config()

    if input("Configure Facebook? (y/n): ").lower() == "y":
        token = input("  Token (User or Page): ").strip()
        page_id = input("  Page ID: ").strip()
        # Auto-resolve to Page Access Token if needed
        resolved = resolve_page_token(token, page_id)
        if resolved:
            print(f"  Resolved to Page Access Token for page {page_id}")
            token = resolved
        config["facebook"] = {
            "page_id": page_id,
            "token": token,
        }
    if input("Configure Instagram? (y/n): ").lower() == "y":
        config["instagram"] = {
            "ig_user_id": input("  Instagram Business Account ID: ").strip(),
            "fb_token": input("  Facebook Token (with instagram perm): ").strip(),
        }
    if input("Configure TikTok? (y/n): ").lower() == "y":
        config["tiktok"] = {
            "access_token": input("  Access Token: ").strip(),
            "open_id": input("  Open ID: ").strip(),
        }
    save_config(config)
    print("Done!")

# ─── Main ─────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(description="Upload reels to social media")
    parser.add_argument("video", help="Path to video file")
    parser.add_argument("--title", default="")
    parser.add_argument("--desc", default="")
    parser.add_argument("--name", default="", help="Auto-generate meta using Groq for this philosopher")
    parser.add_argument("--quote", default="", help="Quote text for Groq meta generation")
    parser.add_argument("--setup", action="store_true", help="Save API credentials")
    parser.add_argument("--platforms", nargs="+",
                        choices=["facebook", "instagram", "tiktok", "all"],
                        default=["facebook"])
    parser.add_argument("--force", action="store_true", help="Upload even if already uploaded")
    parser.add_argument("--delete", action="store_true", help="Delete video file after successful upload")
    args = parser.parse_args()

    if args.setup:
        setup()
        return

    if not os.path.exists(args.video):
        print(f"File not found: {args.video}")
        sys.exit(1)

    config = load_config()
    if not config:
        print("No config. Run: python3 social-upload.py --setup")
        sys.exit(1)

    platforms = args.platforms if "all" not in args.platforms else list(config.keys())
    title = args.title
    desc = args.desc
    name = args.name

    # ─── Duplicate check ───────────────────────────────────────
    STATE_FILE = os.path.join(os.path.dirname(__file__), "out", "uploaded-quotes.json")

    def load_uploaded():
        try:
            with open(STATE_FILE) as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def mark_uploaded(qid, platform, n, q):
        state = load_uploaded()
        state.append({"id": qid, "platform": platform, "name": n, "quote": q, "date": time.strftime("%Y-%m-%d %H:%M")})
        os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2)

    def is_uploaded(qid, platform):
        for item in load_uploaded():
            if item["id"] == qid and item["platform"] == platform:
                return True
        return False

    quote_text = args.quote or name or ""
    quote_id = hashlib.md5(f"{name}:{quote_text}".encode()).hexdigest()[:12]

    # Auto-generate meta with Groq
    if name and (not args.title or not args.desc):
        import subprocess
        quote = args.quote or name
        script = os.path.join(os.path.dirname(__file__), "generate-meta.py")
        script_dir = os.path.dirname(__file__)
        dotenv = os.path.join(script_dir, ".env")
        env = os.environ.copy()
        if not env.get("GROQ_API_KEY"):
            try:
                for line in open(dotenv):
                    if line.startswith("GROQ_API_KEY="):
                        env["GROQ_API_KEY"] = line.strip().split("=", 1)[1]
            except FileNotFoundError:
                pass
        if not env.get("GROQ_API_KEY"):
            print("WARNING: GROQ_API_KEY not set")
        try:
            r = subprocess.run(
                ["python3", script, name, quote],
                capture_output=True, text=True, timeout=15, env=env,
            )
            if r.returncode == 0:
                meta = json.loads(r.stdout.strip())
                title = title or meta.get("title", title)
                h = meta.get("hashtags", "")
                d = meta.get("description", "")
                desc = f"{d}\n\n{h}" if h else d
                print(f"  [Groq] Title: {title}")
        except Exception as e:
            print(f"  [Groq] Failed: {e}")

    if not title:
        title = "Daily Wisdom"
    if not desc:
        desc = "#philosophy #wisdom"

    uploaded_any = False
    for p in platforms:
        if not args.force and is_uploaded(quote_id, p):
            print(f"  [{p}] Already uploaded: {name} — {quote_text[:40]}...")
            continue
        if p == "facebook" and "facebook" in config:
            fb = config["facebook"]
            if upload_facebook(fb["page_id"], fb["token"], args.video, title, desc):
                mark_uploaded(quote_id, p, name, quote_text[:60])
                uploaded_any = True
        elif p == "instagram" and "instagram" in config:
            ig = config["instagram"]
            if upload_instagram(ig["ig_user_id"], ig["fb_token"], args.video, desc):
                mark_uploaded(quote_id, p, name, quote_text[:60])
                uploaded_any = True
        elif p == "tiktok" and "tiktok" in config:
            tt = config["tiktok"]
            if upload_tiktok(tt["access_token"], tt["open_id"], args.video, desc):
                mark_uploaded(quote_id, p, name, quote_text[:60])
                uploaded_any = True
        else:
            print(f"  [{p}] Not configured. Run --setup")

    if args.delete and uploaded_any:
        os.remove(args.video)
        print(f"  Deleted: {args.video}")

if __name__ == "__main__":
    main()
