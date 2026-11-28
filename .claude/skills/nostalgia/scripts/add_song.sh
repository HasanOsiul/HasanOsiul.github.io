#!/usr/bin/env bash
# Adds your song under the mango video.
#   - the song's chorus line ("We're only getting older, baby") lands exactly on the bite + eyes closing
#   - everything before that plays at 50% volume, then rises smoothly to 100%
#   - the soft SFX already in the video stay on top
#
# usage: ./add_song.sh mango_2015_v2.mp4 night_changes.mp3 <chorus_seconds_in_song> [out.mp4]
#   <chorus_seconds_in_song> = the time (in the song file) where "We're only getting older, baby" starts,
#   e.g. 47.5  -> open the song in any player and note the second it starts.
set -euo pipefail
VIDEO="$1"; SONG="$2"; CHORUS_IN_SONG="$3"; OUT="${4:-mango_with_song.mp4}"
CUE=29.833          # second in the video where he bites and closes his eyes
RAMP=0.6            # seconds of volume rise into the chorus
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
OFF=$(python3 -c "print(round($CUE-$CHORUS_IN_SONG,3))")
if python3 -c "import sys; sys.exit(0 if $OFF>=0 else 1)"; then
  PLACE="adelay=$(python3 -c "print(int($OFF*1000))"):all=1"
else
  PLACE="atrim=start=$(python3 -c "print(-$OFF)"),asetpts=PTS-STARTPTS"
fi
FO=$(python3 -c "print(round($DUR-2.5,3))")
ffmpeg -y -i "$VIDEO" -i "$SONG" -filter_complex "\
[1:a]$PLACE,volume='if(lt(t,$CUE-$RAMP),0.5,if(lt(t,$CUE),0.5+0.5*(t-($CUE-$RAMP))/$RAMP,1))':eval=frame,afade=t=out:st=$FO:d=2.5[song];\
[0:a][song]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 256k -t "$DUR" "$OUT"
echo "wrote $OUT"
