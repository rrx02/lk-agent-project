diff --git a/linkedin-contact-tracker/scripts/build-extension.sh b/linkedin-profile-hook-analyzer/scripts/build-extension.sh
similarity index 66%
rename from linkedin-contact-tracker/scripts/build-extension.sh
rename to linkedin-profile-hook-analyzer/scripts/build-extension.sh
index 310f3c17de490f8e385f40b250e66900829239a6..3cf5877777897e6a1a8e8e7c2c20a6fdc2d53122 100755
--- a/linkedin-contact-tracker/scripts/build-extension.sh
+++ b/linkedin-profile-hook-analyzer/scripts/build-extension.sh
@@ -1,27 +1,27 @@
 #!/usr/bin/env bash
 set -euo pipefail
 
 ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
 DIST_DIR="$ROOT_DIR/dist"
 MANIFEST="$ROOT_DIR/manifest.json"
 
 VERSION="$(python - "$MANIFEST" <<'PY'
 import json
 import sys
 from pathlib import Path
 manifest = json.loads(Path(sys.argv[1]).read_text())
 print(manifest['version'])
 PY
 )"
 
-OUT_FILE="$DIST_DIR/linkedin-contact-tracker-v${VERSION}.zip"
+OUT_FILE="$DIST_DIR/linkedin-profile-hook-analyzer-v${VERSION}.zip"
 
 mkdir -p "$DIST_DIR"
 rm -f "$OUT_FILE"
 
 (
   cd "$ROOT_DIR"
-  zip -r "$OUT_FILE" manifest.json popup.html popup.css popup.js README.md scripts/build-extension.sh -x "*/.DS_Store"
+  zip -r "$OUT_FILE" manifest.json content.js popup.html popup.css popup.js README.md PROJECT_FILES.md scripts/build-extension.sh -x "*/.DS_Store"
 )
 
 echo "Created: $OUT_FILE"
