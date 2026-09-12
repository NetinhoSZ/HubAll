import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

_session = new_session("u2net")


def main() -> int:
    if len(sys.argv) != 3:
        print("uso: remove_bg.py <entrada> <saida.png>", file=sys.stderr)
        return 1

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    if not input_path.is_file():
        print(f"arquivo de entrada nao encontrado: {input_path}", file=sys.stderr)
        return 1

    input_image = Image.open(input_path)
    output_image = remove(input_image, session=_session)
    output_image.save(output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
