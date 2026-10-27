#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repo_dir="$(cd "$script_dir/../.." && pwd)"
work_dir="$(mktemp -d)"
trap 'rm -rf "$work_dir"' EXIT

ffmpeg_common=(-hide_banner -loglevel warning -y)
video_common=(-r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -movflags +faststart)

render_svg() {
  local name="$1"
  local duration="$2"
  local fade_out
  fade_out="$(awk "BEGIN {print $duration-0.45}")"
  ffmpeg "${ffmpeg_common[@]}" -loop 1 -i "$script_dir/source/$name.svg" -t "$duration" \
    -vf "scale=1920:1080:flags=lanczos,fade=t=in:st=0:d=0.45,fade=t=out:st=$fade_out:d=0.45" \
    "${video_common[@]}" "$work_dir/$name.mp4"
}

render_mobile_scene() {
  local file="$1"
  local output="$2"
  local duration="$3"
  local step="$4"
  local title="$5"
  local subtitle_one="$6"
  local subtitle_two="$7"
  local fade_out
  fade_out="$(awk "BEGIN {print $duration-0.45}")"
  ffmpeg "${ffmpeg_common[@]}" \
    -f lavfi -i "color=c=0x10261c:s=1920x1080:r=30" \
    -loop 1 -i "$repo_dir/docs/assets/screenshots/$file.png" -t "$duration" \
    -filter_complex "[1:v]scale=-2:930:flags=lanczos,format=rgba[phone];[0:v]drawbox=x=1085:y=45:w=486:h=990:color=0x06110b@0.38:t=fill,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='$step':x=150:y=178:fontsize=29:fontcolor=0x8fc8a1,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='$title':x=150:y=255:fontsize=62:fontcolor=white,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='$subtitle_one':x=154:y=382:fontsize=30:fontcolor=0xd8eadf,drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='$subtitle_two':x=154:y=432:fontsize=30:fontcolor=0xd8eadf[canvas];[canvas][phone]overlay=x=1328-overlay_w/2:y=75:format=auto,fade=t=in:st=0:d=0.45,fade=t=out:st=$fade_out:d=0.45" \
    "${video_common[@]}" "$work_dir/$output.mp4"
}

render_svg intro 5
render_mobile_scene catalog catalog 7 "01  DISCOVER" "Explore the catalog" "Search, filter and compare" "real Open Library titles."
render_mobile_scene reservation reservation 7 "02  INSPECT" "Open book details" "Review the cover, author," "subjects and availability."
render_mobile_scene borrow-confirmation borrow-confirmation 7 "03  BORROW" "Confirm the loan" "A clear checkpoint protects" "the circulation action."
render_mobile_scene borrowed borrowed 7 "04  TRACK" "Start reading" "The loan begins in To Read" "with a 21-day due date."
render_mobile_scene my-library my-library 7 "05  ORGANIZE" "Your active loans" "Due dates and progress stay" "together in My Library."
render_mobile_scene reading-completed reading-completed 7 "06  COMPLETE" "Finish the book" "Mark it Completed before" "starting the return flow."
render_mobile_scene return-confirmation return-confirmation 7 "07  RETURN" "Return with confidence" "The final confirmation keeps" "the action intentional."
render_mobile_scene loan-history loan-history 7 "08  HISTORY" "Keep the record" "Returned books remain visible" "in your borrowing history."
render_mobile_scene reserved reserved 7 "09  RESERVE" "Save unavailable books" "Reserve a title and receive" "an availability notification."
render_svg outro 5

printf "file '%s'\n" \
  "$work_dir/intro.mp4" "$work_dir/catalog.mp4" "$work_dir/reservation.mp4" \
  "$work_dir/borrow-confirmation.mp4" "$work_dir/borrowed.mp4" "$work_dir/my-library.mp4" \
  "$work_dir/reading-completed.mp4" "$work_dir/return-confirmation.mp4" \
  "$work_dir/loan-history.mp4" "$work_dir/reserved.mp4" "$work_dir/outro.mp4" \
  > "$work_dir/concat.txt"

ffmpeg "${ffmpeg_common[@]}" -f concat -safe 0 -i "$work_dir/concat.txt" -c copy "$script_dir/savia-demo.mp4"
ffmpeg "${ffmpeg_common[@]}" -ss 00:00:25 -i "$script_dir/savia-demo.mp4" -frames:v 1 "$repo_dir/docs/assets/video-thumbnail.png"
ffmpeg "${ffmpeg_common[@]}" -i "$script_dir/savia-demo.mp4" \
  -vf "fps=3,scale=720:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 "$repo_dir/docs/assets/video-preview.gif"

echo "Rendered $script_dir/savia-demo.mp4"
