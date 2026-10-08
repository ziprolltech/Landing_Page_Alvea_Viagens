import type { SoundFiles } from '@/lib/experiencias/sound-engine'

/* ALVEA JOURNEY — recordings that replace synthesised sound.

   Empty by default: every sound of the experience is generated in the browser
   (see src/lib/experiencias/sound-engine.ts), so the page ships no audio
   files.

   To use a recording for an environment, put the file in its folder under
   public/audio/experiencias/ and list it here. The engine loads it only after
   the visitor switches the sound on, makes its loop seamless, and plays it
   under the same scroll-driven control (level, open/enclosed, presence) as the
   synthesised version it replaces. The small live events of that environment
   (footsteps, luggage, waves against the hull) are then left to the recording.

     terminal  the airport hall            '/audio/experiencias/airport/terminal.mp3'
     cabin     inside the aircraft         '/audio/experiencias/takeoff/cabin.mp3'
     engine    turbines at steady power    '/audio/experiencias/takeoff/engines.mp3'
     wind      airflow                     '/audio/experiencias/flight/wind.mp3'
     air       high-altitude atmosphere    '/audio/experiencias/sky/air.mp3'
     ocean     open sea, from a distance   '/audio/experiencias/ocean/open-sea.mp3'
     hull      water against a ship's side '/audio/experiencias/cruise/hull-wash.mp3'
     pad       a slow tonal bed in D       '/audio/experiencias/process/pad.mp3'

   What each file should contain is specified in docs/experiencias-sound.md.
   Only local files: no external URLs. */

export const SOUND_FILES: SoundFiles = {}
