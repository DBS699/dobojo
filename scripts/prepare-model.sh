#!/usr/bin/env bash
# 3D-Scan für die Website aufbereiten (Scaniverse/Polycam-Export → web-taugliches GLB)
#
#   ./scripts/prepare-model.sh models-inbox/vase.glb            → public/assets/models/vase.glb
#   ./scripts/prepare-model.sh models-inbox/vase.glb blaue-vase → public/assets/models/blaue-vase.glb
#   npm run model -- models-inbox/vase.glb
#
# Komprimiert Mesh (Draco) + Texturen (WebP, max 2048px) — aus 50–300 MB Roh-Scan
# werden typischerweise 2–10 MB. Danach den ausgegebenen Pfad im CMS unter
# «Keramik & Skulpturen → 3D-Modell» eintragen (oder Datei dort hochladen).
set -euo pipefail
cd "$(dirname "$0")/.."

IN="${1:?Aufruf: prepare-model.sh <scan.glb> [ausgabename]}"
NAME="${2:-$(basename "${IN%.*}")}"
NAME="$(echo "$NAME" | tr '[:upper:] ' '[:lower:]-' | tr -cd 'a-z0-9-')"
OUT="public/assets/models/${NAME}.glb"

echo "→ Optimiere $IN …"
npx gltf-transform optimize "$IN" "$OUT" \
  --compress draco \
  --texture-compress webp \
  --texture-size 2048

echo ""
echo "✓ Fertig: $OUT ($(du -h "$OUT" | cut -f1 | tr -d ' '))"
echo "  Im CMS eintragen als: /assets/models/${NAME}.glb"
echo "  Oder committen:  git add '$OUT' && git commit -m 'Add 3D model ${NAME}' && git push"
