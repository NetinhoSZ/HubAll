import sys
from pathlib import Path

import yt_dlp

QUALITY_FORMATS = {
    "best": "bestvideo+bestaudio/best",
    "1080p": "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
    "720p": "bestvideo[height<=720]+bestaudio/best[height<=720]",
    "audio": "bestaudio/best",
}


COOKIES_FILE = Path(__file__).parent / "cookies.txt"
PORTABLE_NODE = Path(__file__).parent / "portable-node" / "node.exe"
POT_PROVIDER_HOME = Path(__file__).parent / "pot-provider" / "server"


def build_opts(quality: str, output_dir: Path, job_id: str) -> dict:
    opts = {
        "format": QUALITY_FORMATS.get(quality, QUALITY_FORMATS["best"]),
        "outtmpl": str(output_dir / f"{job_id}.%(ext)s"),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
    }

    if COOKIES_FILE.is_file():
        opts["cookiefile"] = str(COOKIES_FILE)

    if PORTABLE_NODE.is_file():
        opts["js_runtimes"] = {"node": {"path": str(PORTABLE_NODE)}}
        opts["remote_components"] = {"ejs:github"}

    if POT_PROVIDER_HOME.is_dir():
        opts["extractor_args"] = {"youtubepot-bgutilscript": {"server_home": [str(POT_PROVIDER_HOME)]}}

    if quality == "audio":
        opts["postprocessors"] = [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3"}
        ]

    return opts


def main() -> int:
    if len(sys.argv) != 5:
        print("uso: download_video.py <url> <qualidade> <dir_saida> <job_id>", file=sys.stderr)
        return 1

    url, quality, output_dir_arg, job_id = sys.argv[1:5]

    if not url.startswith(("http://", "https://")):
        print("url invalida", file=sys.stderr)
        return 1

    output_dir = Path(output_dir_arg)
    output_dir.mkdir(parents=True, exist_ok=True)

    ydl_opts = build_opts(quality, output_dir, job_id)

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
