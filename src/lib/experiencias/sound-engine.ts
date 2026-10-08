import type { Cue, Mix } from './sound-score'

/* ALVEA JOURNEY — the sound engine, second version (Web Audio API, no library).

   What changed from the first version
   ───────────────────────────────────
   The first engine had one sound per idea (a turbine, a wave, a room). This one
   builds places. Every environment is several layers at different distances:

     near   dry, detailed, slightly to one side      what happens next to you
     mid    some room on it                          the space you are in
     far    mostly reverb, dulled by distance        what the space is inside of

   and three things act on the whole picture at once:

     open   one filter over everything: enclosed and muffled … wide open. It is
            what makes the cabin a cabin, the inside of a cloud close, and the
            sky after it wide.
     level  overall presence, used for held breaths before something arrives.
     life   small events that never repeat the same way — a few footsteps, a
            suitcase rolling past, a wave against the hull, a gust. They are
            scheduled at random while their environment is present, and they
            are the reason nothing sounds like a loop.

   Where the sound comes from
   ──────────────────────────
   Everything is synthesised: shaped noise, a few oscillators, two generated
   reverbs. No audio files are shipped. Any environment can be replaced by a
   recording through SOUND_FILES (src/data/experiencias-audio.ts); the engine
   loads it, makes its loop seamless and plays it under the same control.

   Lifecycle
   ─────────
   Nothing exists until `start()` — which must be called from a user gesture
   (browser autoplay policy). `setEnabled(false)` fades out and suspends the
   context; `dispose()` stops every source, the event scheduler, and closes
   the context. */

export type FileLayer = 'air' | 'pad' | 'terminal' | 'cabin' | 'engine' | 'wind' | 'ocean' | 'hull'
export type SoundFiles = Partial<Record<FileLayer, string>>

/* How fast levels glide to their targets (time constant, seconds). About three
   times this is the length of a cross-fade: ~1.2 s. */
const GLIDE = 0.4
const MASTER_LEVEL = 0.9
const FADE_IN = 0.45     // time constant → about 1.4 s to full
const FADE_OUT = 0.16    // time constant → about 0.5 s to silence

type Bed = 'air' | 'pad' | 'sub' | 'terminal' | 'cabin' | 'engine' | 'ground' | 'wind' | 'ocean' | 'hull'

/* Loudness of each environment at score level 1, relative to the others. */
const TRIM: Record<Bed, number> = {
  air: 0.42, pad: 0.2, sub: 0.34, terminal: 0.6, cabin: 0.5, engine: 0.6, ground: 0.5, wind: 0.36, ocean: 0.6, hull: 0.55,
}

/* How much of each environment goes to which reverb (the rest stays dry) */
const ROOM: Partial<Record<Bed, ['hall' | 'space', number]>> = {
  air: ['space', 0.35], pad: ['space', 0.6], terminal: ['hall', 0.55], wind: ['space', 0.15], ocean: ['space', 0.25],
}

type Ctor = typeof AudioContext

function contextConstructor(): Ctor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { AudioContext?: Ctor; webkitAudioContext?: Ctor }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

export function soundSupported(): boolean {
  return contextConstructor() !== null
}

const rand = (from: number, to: number) => from + Math.random() * (to - from)
const clamp = (value: number) => Math.max(0, Math.min(1, value))

export class JourneySoundEngine {
  private ctx: AudioContext
  private bus: GainNode            // everything arrives here
  private tone: BiquadFilterNode   // "open": enclosed … wide
  private hush: GainNode           // "level": overall presence
  private master: GainNode         // on / off fade
  private analyser: AnalyserNode
  private hall: ConvolverNode      // a very large indoor space
  private space: ConvolverNode     // open distance
  private sources: AudioScheduledSourceNode[] = []
  private nodes: AudioNode[] = []
  private beds = {} as Record<Bed, GainNode>
  private white: AudioBuffer
  private pink: AudioBuffer
  private brown: AudioBuffer
  private enabled = false
  private started = false
  private disposed = false
  private suspendTimer: ReturnType<typeof setTimeout> | null = null
  private lifeTimer: ReturnType<typeof setInterval> | null = null
  private lastCue = 0
  private mix: Mix | null = null
  private due: Record<string, number> = {}

  /* scroll-driven parameters other than levels */
  private engineBand!: BiquadFilterNode
  private engineBody!: BiquadFilterNode
  private engineGround!: GainNode
  private engineAir!: GainNode
  private whine: OscillatorNode[] = []
  private growl!: OscillatorNode
  private tremor!: OscillatorNode
  private joints!: OscillatorNode
  private padVoices: OscillatorNode[] = []
  private fileRate: AudioParam | null = null

  constructor(private files: SoundFiles = {}) {
    const AudioCtor = contextConstructor()
    if (!AudioCtor) throw new Error('Web Audio API not available')
    this.ctx = new AudioCtor({ latencyHint: 'playback' })
    const ctx = this.ctx

    /* bus → open/enclosed → presence → on/off → limiter → meter → speakers */
    this.bus = this.gain(1)
    this.tone = this.filter('lowpass', 18000, 0.5)
    this.hush = this.gain(1)
    this.master = this.gain(0)
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -14
    limiter.knee.value = 14
    limiter.ratio.value = 5
    limiter.attack.value = 0.01
    limiter.release.value = 0.35
    this.analyser = ctx.createAnalyser()
    this.analyser.fftSize = 2048
    this.bus.connect(this.tone).connect(this.hush).connect(this.master).connect(limiter).connect(this.analyser).connect(ctx.destination)
    this.nodes.push(limiter, this.analyser)

    this.white = this.noise('white', 5)
    this.pink = this.noise('pink', 7)
    this.brown = this.noise('brown', 6)

    /* two rooms: a huge, dark hall and an open, lighter distance */
    this.hall = ctx.createConvolver()
    this.hall.buffer = this.impulse(4.2, 2.4, 2600)
    this.space = ctx.createConvolver()
    this.space.buffer = this.impulse(2.6, 3.2, 5200)
    this.hall.connect(this.gain(0.7)).connect(this.bus)
    this.space.connect(this.gain(0.6)).connect(this.bus)
    this.nodes.push(this.hall, this.space)

    for (const bed of Object.keys(TRIM) as Bed[]) {
      const level = this.gain(0)
      const room = ROOM[bed]
      if (room) {
        const [which, amount] = room
        level.connect(this.gain(1 - amount * 0.5)).connect(this.bus)
        level.connect(this.gain(amount)).connect(which === 'hall' ? this.hall : this.space)
      } else {
        level.connect(this.bus)
      }
      this.beds[bed] = level
    }

    this.buildAir()
    this.buildPad()
    this.buildSub()
    this.buildTerminal()
    this.buildCabin()
    this.buildEngine()
    this.buildGround()
    this.buildWind()
    this.buildOcean()
    this.buildHull()
  }

  /* ── public ─────────────────────────────────────────────────────────────── */

  /* Call from a click/tap/key handler. */
  async start(): Promise<void> {
    if (this.disposed) return
    if (!this.started) {
      this.started = true
      for (const source of this.sources) source.start()
      this.loadFiles()
    }
    await this.setEnabled(true)
  }

  async setEnabled(on: boolean): Promise<void> {
    if (this.disposed) return
    this.enabled = on
    const now = this.ctx.currentTime
    if (this.suspendTimer) { clearTimeout(this.suspendTimer); this.suspendTimer = null }
    if (on) {
      if (this.ctx.state !== 'running') await this.ctx.resume().catch(() => undefined)
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setTargetAtTime(MASTER_LEVEL, this.ctx.currentTime, FADE_IN)
      this.live(true)
    } else {
      this.live(false)
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setTargetAtTime(0, now, FADE_OUT)
      /* once it has faded, stop the audio clock altogether */
      this.suspendTimer = setTimeout(() => {
        if (!this.enabled && !this.disposed) this.ctx.suspend().catch(() => undefined)
      }, 900)
    }
  }

  /* Tab hidden / shown: silence at once, come back only if it was on. */
  hold(hidden: boolean): void {
    if (this.disposed || !this.enabled) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    if (hidden) {
      this.live(false)
      this.master.gain.setTargetAtTime(0, now, 0.05)
      this.suspendTimer = setTimeout(() => { if (!this.disposed) this.ctx.suspend().catch(() => undefined) }, 300)
    } else {
      if (this.suspendTimer) { clearTimeout(this.suspendTimer); this.suspendTimer = null }
      this.ctx.resume().catch(() => undefined)
      this.master.gain.setTargetAtTime(MASTER_LEVEL, this.ctx.currentTime, FADE_IN)
      this.live(true)
    }
  }

  /* Glide everything to the mix the score asks for. `snap` is used when the
     sound is switched on mid-scene: values are set at once (the master fade
     does the easing), so the visitor hears the right place immediately. */
  apply(mix: Mix, snap = false): void {
    if (this.disposed) return
    this.mix = mix
    const now = this.ctx.currentTime
    const to = (param: AudioParam, value: number, glide = GLIDE) => {
      if (snap) { param.cancelScheduledValues(now); param.setValueAtTime(value, now) }
      else param.setTargetAtTime(value, now, glide)
    }
    for (const bed of Object.keys(TRIM) as Bed[]) to(this.beds[bed].gain, clamp(mix[bed]) * TRIM[bed])

    /* enclosed … open: 650 Hz → 19 kHz, exponentially; and overall presence */
    to(this.tone.frequency, 650 * Math.pow(19000 / 650, clamp(mix.open)), 0.3)
    to(this.hush.gain, clamp(mix.level), 0.22)

    /* turbines: speed … */
    const rpm = clamp(mix.rpm)
    to(this.engineBand.frequency, 380 + rpm * 2100)
    to(this.engineBody.frequency, 80 + rpm * 140)
    const base = 120 + rpm * 580
    this.whine.forEach((voice, i) => to(voice.frequency, base * (i === 0 ? 1 : 1.503)))
    to(this.growl.frequency, 52 + rpm * 58)
    if (this.fileRate) to(this.fileRate, 0.75 + rpm * 0.4)
    /* … and character: heard from the runway, or from the air */
    const flight = clamp(mix.flight)
    to(this.engineGround.gain, 1 - flight * 0.78)
    to(this.engineAir.gain, 0.5 + flight * 0.75)

    /* the roll: faster wheels, quicker joints */
    to(this.tremor.frequency, 7 + rpm * 15)
    to(this.joints.frequency, 1.4 + rpm * 9)

    /* the pad rises by up to a whole tone */
    for (const voice of this.padVoices) to(voice.detune, clamp(mix.lift) * 200)
  }

  cue(cue: Cue, backwards = false): void {
    if (this.disposed || !this.enabled || this.ctx.state !== 'running') return
    const now = this.ctx.currentTime
    if (now - this.lastCue < 0.25) return // never a flurry
    this.lastCue = now
    const gain = cue.gain * (backwards ? 0.5 : 1)
    if (cue.kind === 'whoosh') this.whoosh(gain, backwards)
    else if (cue.kind === 'swell') this.swell([cue.note ?? 220], gain * 0.045, 1.5, 3.2)
    else if (cue.kind === 'release') this.release(gain)
    else if (cue.kind === 'bloom') this.bloom(gain)
    else if (cue.kind === 'payoff') {
      /* the pieces falling into place: root, fifth, octave, third — entering one after another */
      ;[146.83, 220, 293.66, 369.99].forEach((note, i) => this.swell([note], gain * 0.036, 1.6, 5, i * 0.16))
      this.airSweep(0.5, 2.6, 500, 2600, 900, 0)
    }
  }

  /* Output level right now (0 … 1): RMS and peak of the last ~40 ms. */
  meter(): { rms: number; peak: number; state: AudioContextState } {
    const data = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(data)
    let sum = 0
    let peak = 0
    for (const sample of data) { sum += sample * sample; peak = Math.max(peak, Math.abs(sample)) }
    return { rms: Math.sqrt(sum / data.length), peak, state: this.ctx.state }
  }

  /* Current value of every environment and of the two global parameters, for checks. */
  snapshot(): Record<string, number> {
    const out: Record<string, number> = {
      master: +this.master.gain.value.toFixed(3),
      level: +this.hush.gain.value.toFixed(2),
      open: +(Math.log(this.tone.frequency.value / 650) / Math.log(19000 / 650)).toFixed(2),
    }
    for (const bed of Object.keys(TRIM) as Bed[]) out[bed] = +(this.beds[bed].gain.value / TRIM[bed]).toFixed(3)
    return out
  }

  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.enabled = false
    this.live(false)
    if (this.suspendTimer) clearTimeout(this.suspendTimer)
    for (const source of this.sources) {
      try { source.stop() } catch { /* never started */ }
      source.disconnect()
    }
    for (const node of this.nodes) node.disconnect()
    this.sources = []
    this.nodes = []
    this.ctx.close().catch(() => undefined)
  }

  /* ── building blocks ────────────────────────────────────────────────────── */

  private gain(value: number): GainNode {
    const node = this.ctx.createGain()
    node.gain.value = value
    this.nodes.push(node)
    return node
  }

  private filter(type: BiquadFilterType, frequency: number, q = 0.7): BiquadFilterNode {
    const node = this.ctx.createBiquadFilter()
    node.type = type
    node.frequency.value = frequency
    node.Q.value = q
    this.nodes.push(node)
    return node
  }

  private panner(position: number): AudioNode {
    if (typeof this.ctx.createStereoPanner !== 'function') return this.gain(1)
    const node = this.ctx.createStereoPanner()
    node.pan.value = position
    this.nodes.push(node)
    return node
  }

  private loop(buffer: AudioBuffer, rate = 1): AudioBufferSourceNode {
    const node = this.ctx.createBufferSource()
    node.buffer = buffer
    node.loop = true
    node.playbackRate.value = rate
    this.sources.push(node)
    return node
  }

  private osc(type: OscillatorType, frequency: number): OscillatorNode {
    const node = this.ctx.createOscillator()
    node.type = type
    node.frequency.value = frequency
    this.sources.push(node)
    return node
  }

  /* Slow movement added to a parameter: several sines whose periods never line
     up, so the result does not audibly repeat. `rates` in Hz. */
  private drift(target: AudioParam, depth: number, rates: number[]): void {
    for (const rate of rates) {
      const lfo = this.osc('sine', rate)
      lfo.connect(this.gain(depth / rates.length)).connect(target)
    }
  }

  /* Stereo noise. Looping noise has no audible seam; the three colours use
     different lengths so they never line up with one another either. */
  private noise(kind: 'white' | 'pink' | 'brown', seconds: number): AudioBuffer {
    const length = Math.floor(this.ctx.sampleRate * seconds)
    const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate)
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0
      for (let i = 0; i < length; i++) {
        const w = Math.random() * 2 - 1
        if (kind === 'white') data[i] = w
        else if (kind === 'pink') {
          b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852
          b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898
          data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
          b6 = w * 0.115926
        } else { last = (last + 0.02 * w) / 1.02; data[i] = last * 3.5 }
      }
      if (kind !== 'white') {
        /* bring both ends to zero so the loop point is silent too */
        const fade = Math.floor(this.ctx.sampleRate * 0.05)
        for (let i = 0; i < fade; i++) {
          const t = i / fade
          data[i] *= t
          data[length - 1 - i] *= t
        }
      }
    }
    return buffer
  }

  /* A room, as decaying noise: `seconds` long, `curve` shapes the decay, and a
     one-pole low-pass at `damping` Hz makes the tail darker than the start. */
  private impulse(seconds: number, curve: number, damping: number): AudioBuffer {
    const length = Math.floor(this.ctx.sampleRate * seconds)
    const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate)
    const k = Math.exp((-2 * Math.PI * damping) / this.ctx.sampleRate)
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      let smooth = 0
      for (let i = 0; i < length; i++) {
        smooth = smooth * k + (Math.random() * 2 - 1) * (1 - k)
        data[i] = smooth * Math.pow(1 - i / length, curve) * 3
      }
    }
    return buffer
  }

  /* ── environments ───────────────────────────────────────────────────────── */

  /* Air: height. Wide, dark, never quite still. */
  private buildAir(): void {
    if (this.files.air) return
    const breath = this.gain(1)
    this.loop(this.pink, 1).connect(this.filter('highpass', 180)).connect(this.filter('bandpass', 700, 0.45))
      .connect(this.filter('lowpass', 2600)).connect(breath).connect(this.beds.air)
    this.drift(breath.gain, 0.3, [0.041, 0.067, 0.11])
    /* a thin upper layer that comes and goes, like air at altitude */
    const thin = this.gain(0.12)
    this.loop(this.white, 0.9).connect(this.filter('bandpass', 3400, 0.7)).connect(thin).connect(this.beds.air)
    this.drift(thin.gain, 0.1, [0.031, 0.083])
  }

  /* The pad: five soft voices on D and A, each breathing at its own pace, with
     a faint octave above that only appears now and then. Part of the air. */
  private buildPad(): void {
    if (this.files.pad) return
    const warm = this.filter('lowpass', 1200)
    warm.connect(this.beds.pad)
    const voices: [OscillatorType, number, number, number][] = [
      ['sine', 73.42, 0.24, 0.05],
      ['sine', 110.0, 0.3, 0.037],
      ['triangle', 146.83 * 1.0023, 0.3, 0.061],
      ['sine', 220.0 * 0.9985, 0.2, 0.029],
      ['sine', 293.66 * 1.0012, 0.1, 0.043],
      ['sine', 440.0 * 1.0008, 0.035, 0.019],
    ]
    for (const [type, frequency, level, rate] of voices) {
      const voice = this.osc(type, frequency)
      const amount = this.gain(level)
      voice.connect(amount).connect(warm)
      this.drift(amount.gain, level * 0.9, [rate, rate * 1.618])
      this.padVoices.push(voice)
    }
  }

  /* Weight: two low tones a few hertz apart, so it slowly swells — felt, not heard */
  private buildSub(): void {
    const body = this.gain(0.6)
    for (const [frequency, level] of [[46, 0.5], [49.5, 0.4], [92.4, 0.14]] as const) {
      this.osc('sine', frequency).connect(this.gain(level)).connect(body)
    }
    body.connect(this.beds.sub)
    this.drift(body.gain, 0.25, [0.06, 0.097])
  }

  /* The terminal, as a place:
       far   the hall itself — tone and reverb — and machinery
       mid   people, as two crowds on either side (no words in them)
       near  footsteps and luggage, added by `life()` */
  private buildTerminal(): void {
    if (this.files.terminal) return
    const out = this.beds.terminal
    this.loop(this.pink, 1.1).connect(this.filter('bandpass', 340, 0.4)).connect(this.gain(0.36)).connect(out)

    /* ventilation and escalators: a steady presence you stop noticing */
    const machines = this.gain(0.05)
    this.osc('sine', 120).connect(machines)
    this.osc('sine', 179.6).connect(this.gain(0.5)).connect(machines)
    machines.connect(out)
    this.loop(this.white, 0.83).connect(this.filter('bandpass', 4200, 0.8)).connect(this.gain(0.012)).connect(out)

    /* two crowds: formant bands moving at syllable rate, different on each side */
    const crowd = (pan: number, rate: number, formants: [number, number][], syllables: number[]) => {
      const voice = this.gain(0.1)
      const source = this.loop(this.pink, rate)
      for (const [frequency, q] of formants) source.connect(this.filter('bandpass', frequency, q)).connect(voice)
      this.drift(voice.gain, 0.085, syllables)
      voice.connect(this.filter('lowpass', 1700)).connect(this.panner(pan)).connect(out)
    }
    crowd(-0.55, 0.71, [[430, 2.2], [980, 3], [1750, 3.4]], [3.1, 4.7, 0.21])
    crowd(0.5, 0.93, [[520, 2.4], [1180, 3.2], [2100, 3.6]], [2.6, 5.3, 0.13])
  }

  /* The cabin: enclosed air, the body of the fuselage, the systems behind the panels */
  private buildCabin(): void {
    if (this.files.cabin) return
    const out = this.beds.cabin
    this.loop(this.brown, 0.9).connect(this.filter('lowpass', 230)).connect(this.gain(0.55)).connect(out)
    /* the shell resonates */
    const shell = this.loop(this.pink, 0.77)
    for (const frequency of [96, 188, 312]) shell.connect(this.filter('bandpass', frequency, 9)).connect(this.gain(0.5)).connect(out)
    /* air vents */
    const vents = this.gain(0.035)
    this.loop(this.white, 1.13).connect(this.filter('bandpass', 2300, 0.6)).connect(vents).connect(out)
    this.drift(vents.gain, 0.012, [0.09, 0.17])
    /* systems: a high, steady tone at the edge of hearing */
    this.osc('sine', 397).connect(this.gain(0.006)).connect(out)
  }

  /* Turbines, in two groups so their character can change:
       ground  roar, body, growl      what you hear standing on a runway
       air     rush and whine         what you hear in flight */
  private buildEngine(): void {
    this.engineBand = this.filter('bandpass', 600, 1.2)
    this.engineBody = this.filter('lowpass', 100)
    this.engineGround = this.gain(1)
    this.engineAir = this.gain(0.5)
    this.growl = this.osc('sawtooth', 60)
    if (this.files.engine) return
    const out = this.beds.engine
    this.engineGround.connect(out)
    this.engineAir.connect(out)
    this.engineAir.connect(this.gain(0.2)).connect(this.space)

    this.loop(this.brown, 0.8).connect(this.engineBody).connect(this.gain(0.34)).connect(this.engineGround)
    this.loop(this.brown, 1.3).connect(this.filter('bandpass', 260, 0.8)).connect(this.gain(0.42)).connect(this.engineGround)
    this.growl.connect(this.filter('lowpass', 380)).connect(this.gain(0.05)).connect(this.engineGround)

    const rush = this.gain(0.46)
    this.loop(this.white, 1.07).connect(this.engineBand).connect(rush).connect(this.engineAir)
    this.drift(rush.gain, 0.06, [0.7, 1.13])
    const soften = this.filter('lowpass', 1500)
    for (const ratio of [1, 1.503]) {
      const voice = this.osc('sawtooth', 150 * ratio)
      voice.connect(soften)
      this.whine.push(voice)
    }
    soften.connect(this.gain(0.026)).connect(this.engineAir)
  }

  /* The roll: low rumble with a tremor that quickens with speed, and the
     regular soft thud of the joints in the runway going by */
  private buildGround(): void {
    const out = this.beds.ground
    const shake = this.gain(0.8)
    this.loop(this.brown, 0.7).connect(this.filter('lowpass', 95)).connect(shake).connect(out)
    this.tremor = this.osc('sine', 8)
    this.tremor.connect(this.gain(0.16)).connect(shake.gain)

    const tyres = this.gain(0.2)
    this.loop(this.pink, 1.21).connect(this.filter('bandpass', 520, 0.7)).connect(tyres).connect(out)
    this.drift(tyres.gain, 0.05, [0.9, 1.7])

    /* joints: a pulse train shaped out of a sine */
    this.joints = this.osc('sine', 2)
    const shaper = this.ctx.createWaveShaper()
    const curve = new Float32Array(1024)
    for (let i = 0; i < curve.length; i++) curve[i] = Math.pow(Math.max(0, (i / (curve.length - 1)) * 2 - 1), 12)
    shaper.curve = curve
    this.nodes.push(shaper)
    const thud = this.gain(0)
    this.joints.connect(shaper).connect(this.gain(0.5)).connect(thud.gain)
    this.loop(this.brown, 1.05).connect(this.filter('lowpass', 150)).connect(thud).connect(out)
  }

  /* Wind: three bands that move independently — low body, the rush, and a
     thin whistle at the top */
  private buildWind(): void {
    if (this.files.wind) return
    const out = this.beds.wind
    const band = (buffer: AudioBuffer, rate: number, frequency: number, q: number, level: number, pan: number, rates: number[]) => {
      const filter = this.filter('bandpass', frequency, q)
      const gust = this.gain(level)
      this.loop(buffer, rate).connect(filter).connect(gust).connect(this.panner(pan)).connect(out)
      this.drift(filter.frequency, frequency * 0.3, rates)
      this.drift(gust.gain, level * 0.5, rates.map((r) => r * 1.37))
    }
    band(this.pink, 0.93, 380, 0.7, 0.7, -0.25, [0.083, 0.19])
    band(this.white, 1.0, 950, 0.9, 0.5, 0.2, [0.13, 0.31])
    band(this.white, 0.81, 2700, 1.4, 0.1, 0.05, [0.071, 0.23])
  }

  /* The sea, away from the ship:
       far   a wide, low wash that is simply always there
       mid   the swell — three periods that never coincide — and its foam */
  private buildOcean(): void {
    if (this.files.ocean) return
    const out = this.beds.ocean
    this.loop(this.pink, 0.88).connect(this.filter('highpass', 90)).connect(this.filter('lowpass', 520)).connect(this.gain(0.5)).connect(out)

    const body = this.filter('lowpass', 1000)
    const swell = this.gain(0.42)
    this.loop(this.pink, 1).connect(this.filter('highpass', 140)).connect(body).connect(swell).connect(out)
    this.drift(swell.gain, 0.46, [0.11, 0.073, 0.19])
    this.drift(body.frequency, 420, [0.11, 0.047])

    const foam = this.gain(0.035)
    this.loop(this.white, 0.87).connect(this.filter('highpass', 2600)).connect(this.filter('lowpass', 7000)).connect(foam).connect(out)
    this.drift(foam.gain, 0.034, [0.11, 0.27])
  }

  /* The ship, up close: the wake hissing along the side, and the hull itself.
     The waves that break against it are added by `life()`. */
  private buildHull(): void {
    if (this.files.hull) return
    const out = this.beds.hull
    const wake = this.gain(0.07)
    this.loop(this.white, 1.17).connect(this.filter('bandpass', 2100, 0.6)).connect(wake).connect(this.panner(0.3)).connect(out)
    this.drift(wake.gain, 0.05, [0.37, 0.61, 1.9])
    const run = this.gain(0.12)
    this.loop(this.pink, 1.09).connect(this.filter('bandpass', 620, 0.6)).connect(run).connect(this.panner(-0.2)).connect(out)
    this.drift(run.gain, 0.06, [0.29, 0.43])
    /* the engines, somewhere far below the deck */
    const deck = this.gain(0.3)
    this.osc('sine', 38).connect(deck)
    this.osc('sine', 57.3).connect(this.gain(0.5)).connect(deck)
    deck.connect(out)
    this.drift(deck.gain, 0.08, [5.3, 0.13])
  }

  /* ── life: small events that never happen twice the same way ─────────────── */

  private live(on: boolean): void {
    if (this.lifeTimer) { clearInterval(this.lifeTimer); this.lifeTimer = null }
    if (on && !this.disposed) this.lifeTimer = setInterval(() => this.life(), 250)
  }

  private life(): void {
    const mix = this.mix
    if (!mix || this.ctx.state !== 'running') return
    const now = this.ctx.currentTime
    const every = (name: string, present: boolean, wait: [number, number], first: [number, number], play: () => void) => {
      if (!present) { delete this.due[name]; return }
      if (this.due[name] === undefined) { this.due[name] = now + rand(first[0], first[1]); return }
      if (now >= this.due[name]) { this.due[name] = now + rand(wait[0], wait[1]); play() }
    }
    const inTerminal = mix.terminal > 0.3 && !this.files.terminal
    every('steps', inTerminal, [2.5, 7], [0.6, 2.5], () => this.footsteps())
    every('luggage', inTerminal, [8, 17], [3, 7], () => this.luggage())
    every('address', inTerminal, [20, 36], [4, 9], () => this.address())
    const aboard = mix.hull > 0.3 && !this.files.hull
    every('wave', aboard, [2.6, 6.2], [0.4, 1.6], () => this.wave())
    every('groan', aboard, [24, 46], [9, 20], () => this.groan())
    every('gust', mix.wind + mix.air > 0.3 && mix.hull < 0.3 && mix.engine < 0.3, [7, 15], [3, 8], () => this.gust())
  }

  /* A burst of shaped noise with its own envelope; everything it creates is
     released when it ends. Returns the node to connect onwards. */
  private burst(buffer: AudioBuffer, start: number, length: number, shape: (level: AudioParam, at: number) => void, filters: BiquadFilterNode[], pan = 0, panTo?: number): AudioNode {
    const ctx = this.ctx
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const level = ctx.createGain()
    level.gain.setValueAtTime(0, start)
    shape(level.gain, start)
    let node: AudioNode = source
    for (const filter of filters) { node.connect(filter); node = filter }
    node.connect(level)
    const chain: AudioNode[] = [...filters, level]
    let out: AudioNode = level
    if (typeof ctx.createStereoPanner === 'function') {
      const panner = ctx.createStereoPanner()
      panner.pan.setValueAtTime(pan, start)
      if (panTo !== undefined) panner.pan.linearRampToValueAtTime(panTo, start + length)
      level.connect(panner)
      chain.push(panner)
      out = panner
    }
    source.onended = () => { source.disconnect(); for (const item of chain) item.disconnect() }
    source.start(start, Math.random() * (buffer.duration - 0.5))
    source.stop(start + length + 0.1)
    return out
  }

  private band(type: BiquadFilterType, frequency: number, q = 0.7): BiquadFilterNode {
    const node = this.ctx.createBiquadFilter()
    node.type = type
    node.frequency.value = frequency
    node.Q.value = q
    return node
  }

  /* Someone walks by: a handful of steps at their own pace, somewhere in the hall */
  private footsteps(): void {
    const now = this.ctx.currentTime
    const distance = Math.random()                 // 0 = close, 1 = across the hall
    const pace = rand(0.46, 0.62)
    const pan = rand(-0.7, 0.7)
    const drift = rand(-0.25, 0.25)
    const count = Math.floor(rand(4, 9))
    const loudness = 0.11 * (1 - distance * 0.7)
    for (let i = 0; i < count; i++) {
      const at = now + 0.05 + i * pace + rand(-0.02, 0.02)
      const strength = loudness * rand(0.75, 1) * Math.sin((Math.PI * (i + 0.6)) / (count + 0.2)) // arrives, passes, leaves
      const heel = this.burst(this.brown, at, 0.09, (level, t) => {
        level.linearRampToValueAtTime(strength, t + 0.006)
        level.exponentialRampToValueAtTime(0.0001, t + 0.085)
      }, [this.band('bandpass', rand(170, 240), 1.2)], pan + (drift * i) / count)
      const sole = this.burst(this.white, at + 0.012, 0.05, (level, t) => {
        level.linearRampToValueAtTime(strength * 0.22, t + 0.003)
        level.exponentialRampToValueAtTime(0.0001, t + 0.04)
      }, [this.band('bandpass', rand(1500, 2300), 1.4), this.band('lowpass', 4200 - distance * 2600)], pan + (drift * i) / count)
      for (const node of [heel, sole]) node.connect(this.beds.terminal)
    }
  }

  /* A suitcase rolls past: wheels on a hard floor, crossing from one side to the other */
  private luggage(): void {
    const now = this.ctx.currentTime
    const length = rand(2.6, 4.6)
    const from = Math.random() < 0.5 ? -0.8 : 0.8
    const rumble = this.burst(this.pink, now, length, (level, t) => {
      level.linearRampToValueAtTime(0.05, t + length * 0.45)
      level.linearRampToValueAtTime(0, t + length)
    }, [this.band('bandpass', rand(380, 520), 0.9), this.band('lowpass', 1500)], from, -from)
    /* the wheels flutter over the tiles */
    const flutter = this.ctx.createGain()
    flutter.gain.value = 0.6
    const wobble = this.ctx.createOscillator()
    wobble.frequency.value = rand(22, 33)
    const depth = this.ctx.createGain()
    depth.gain.value = 0.4
    wobble.connect(depth).connect(flutter.gain)
    wobble.onended = () => { wobble.disconnect(); depth.disconnect(); flutter.disconnect() }
    wobble.start(now)
    wobble.stop(now + length + 0.2)
    rumble.connect(flutter).connect(this.beds.terminal)
  }

  /* A public address, far away: two soft notes, then a voice with no words in
     it — only its rhythm — lost in the reverb of the hall */
  private address(): void {
    const ctx = this.ctx
    const now = ctx.currentTime
    ;[[659.25, 0], [523.25, 0.55]].forEach(([note, delay]) => {
      const voice = ctx.createOscillator()
      voice.frequency.value = note
      const level = ctx.createGain()
      const begin = now + delay
      level.gain.setValueAtTime(0, begin)
      level.gain.linearRampToValueAtTime(0.02, begin + 0.03)
      level.gain.setTargetAtTime(0, begin + 0.03, 0.45)
      voice.connect(level).connect(this.hall)
      voice.onended = () => { voice.disconnect(); level.disconnect() }
      voice.start(begin)
      voice.stop(begin + 2.6)
    })
    const begin = now + 1.7
    const length = rand(2.2, 3.6)
    const speech = this.burst(this.pink, begin, length, (level, t) => {
      /* syllables: irregular pulses */
      let at = t
      while (at < t + length - 0.2) {
        const syllable = rand(0.11, 0.24)
        level.linearRampToValueAtTime(rand(0.03, 0.06), at + syllable * 0.35)
        level.linearRampToValueAtTime(rand(0, 0.012), at + syllable)
        at += syllable + (Math.random() < 0.18 ? rand(0.15, 0.4) : 0)
      }
      level.linearRampToValueAtTime(0, t + length)
    }, [this.band('bandpass', rand(520, 700), 1.6), this.band('lowpass', 1300)], rand(-0.3, 0.3))
    speech.connect(this.hall)
  }

  /* A wave meets the hull: it rises, breaks along the side and hisses away */
  private wave(): void {
    const now = this.ctx.currentTime
    const size = rand(0.5, 1)
    const side = rand(-0.7, 0.7)
    const rise = rand(0.5, 1.1)
    const fall = rand(1.6, 2.8)
    const sweep = this.band('bandpass', 1500, 0.7)
    sweep.frequency.setValueAtTime(rand(1200, 1700), now)
    sweep.frequency.exponentialRampToValueAtTime(rand(420, 620), now + rise + fall)
    const body = this.burst(this.pink, now, rise + fall, (level, t) => {
      level.linearRampToValueAtTime(0.15 * size, t + rise)
      level.setTargetAtTime(0, t + rise, fall / 3.2)
    }, [sweep], side, side * 0.5)
    const spray = this.burst(this.white, now + rise * 0.7, fall + 0.8, (level, t) => {
      level.linearRampToValueAtTime(0.045 * size, t + 0.35)
      level.setTargetAtTime(0, t + 0.35, fall / 2.6)
    }, [this.band('highpass', 3000), this.band('lowpass', 8000)], side * 0.8, side * 0.3)
    /* the weight of it against the steel */
    const thump = this.burst(this.brown, now + rise * 0.85, 0.7, (level, t) => {
      level.linearRampToValueAtTime(0.09 * size, t + 0.05)
      level.exponentialRampToValueAtTime(0.0001, t + 0.6)
    }, [this.band('lowpass', 120)], side * 0.5)
    for (const node of [body, spray, thump]) node.connect(this.beds.hull)
    body.connect(this.space)
  }

  /* The ship's structure working, far off and low */
  private groan(): void {
    const ctx = this.ctx
    const now = ctx.currentTime
    const length = rand(1.6, 2.6)
    const from = rand(70, 96)
    const voice = ctx.createOscillator()
    voice.type = 'triangle'
    voice.frequency.setValueAtTime(from, now)
    voice.frequency.linearRampToValueAtTime(from * rand(0.9, 0.96), now + length)
    const level = ctx.createGain()
    level.gain.setValueAtTime(0, now)
    level.gain.linearRampToValueAtTime(0.02, now + length * 0.4)
    level.gain.linearRampToValueAtTime(0, now + length)
    const soft = this.band('lowpass', 260)
    voice.connect(soft).connect(level).connect(this.beds.hull)
    voice.onended = () => { voice.disconnect(); soft.disconnect(); level.disconnect() }
    voice.start(now)
    voice.stop(now + length + 0.1)
  }

  /* A gust: the air leans in from one side and lets go */
  private gust(): void {
    const now = this.ctx.currentTime
    const length = rand(2.6, 4.8)
    const from = rand(-0.6, 0.6)
    const sweep = this.band('bandpass', 700, 0.8)
    sweep.frequency.setValueAtTime(rand(450, 650), now)
    sweep.frequency.linearRampToValueAtTime(rand(900, 1400), now + length * 0.5)
    sweep.frequency.linearRampToValueAtTime(rand(450, 650), now + length)
    const gust = this.burst(this.pink, now, length, (level, t) => {
      level.linearRampToValueAtTime(rand(0.1, 0.18), t + length * 0.5)
      level.linearRampToValueAtTime(0, t + length)
    }, [sweep], from, -from * 0.6)
    gust.connect(this.beds.wind)
  }

  /* ── cues ───────────────────────────────────────────────────────────────── */

  /* Air passing: a band of noise that sweeps and crosses the stereo field */
  private airSweep(gain: number, length: number, from: number, peak: number, to: number, pan: number, panTo = -pan): void {
    const now = this.ctx.currentTime
    const sweep = this.band('bandpass', from, 1)
    sweep.frequency.setValueAtTime(from, now)
    sweep.frequency.exponentialRampToValueAtTime(peak, now + length * 0.5)
    sweep.frequency.exponentialRampToValueAtTime(to, now + length)
    const out = this.burst(this.pink, now, length, (level, t) => {
      level.linearRampToValueAtTime(0.3 * gain, t + length * 0.45)
      level.linearRampToValueAtTime(0, t + length)
    }, [sweep], pan, panTo)
    out.connect(this.bus)
    out.connect(this.space)
  }

  private whoosh(gain: number, backwards: boolean): void {
    if (backwards) this.airSweep(gain, 1.6, 1500, 900, 320, 0.4)
    else this.airSweep(gain, 1.7, 320, 1700, 520, -0.4)
  }

  /* The wheels leave the runway: the air rises and a low fifth opens under it */
  private release(gain: number): void {
    this.airSweep(gain * 0.9, 2.8, 260, 1300, 2400, 0, 0)
    this.swell([73.42, 110, 146.83], gain * 0.05, 0.9, 3.4)
  }

  /* The sky opens: high air arriving from both sides and a bright, distant tone */
  private bloom(gain: number): void {
    this.airSweep(gain * 0.6, 3.2, 1200, 3200, 2200, -0.6, 0.6)
    this.swell([293.66, 440], gain * 0.03, 1.8, 4.2)
  }

  private swell(notes: number[], peak: number, attack: number, release: number, delay = 0): void {
    const ctx = this.ctx
    const now = ctx.currentTime + delay
    const end = now + attack + release
    const level = ctx.createGain()
    level.gain.setValueAtTime(0, now)
    level.gain.linearRampToValueAtTime(peak, now + attack)
    level.gain.setTargetAtTime(0, now + attack, release / 4)
    const warm = this.band('lowpass', 1500)
    const far = ctx.createGain()
    far.gain.value = 0.45
    level.connect(warm)
    warm.connect(far).connect(this.bus)
    warm.connect(this.space)
    notes.forEach((note, i) => {
      const voice = ctx.createOscillator()
      voice.type = i === 0 ? 'sine' : 'triangle'
      voice.frequency.value = note
      voice.detune.value = i * 3
      const share = ctx.createGain()
      share.gain.value = 1 / (1 + i * 0.6)
      voice.connect(share).connect(level)
      voice.onended = () => {
        voice.disconnect()
        share.disconnect()
        if (i === 0) { level.disconnect(); warm.disconnect(); far.disconnect() }
      }
      voice.start(now)
      voice.stop(end + 0.1)
    })
  }

  /* ── recordings in place of synthesis ───────────────────────────────────── */

  private loadFiles(): void {
    for (const [layer, url] of Object.entries(this.files) as [FileLayer, string][]) {
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`${response.status}`)
          return response.arrayBuffer()
        })
        .then((bytes) => this.ctx.decodeAudioData(bytes))
        .then((decoded) => {
          if (this.disposed) return
          const source = this.ctx.createBufferSource()
          source.buffer = this.seamless(decoded)
          source.loop = true
          source.connect(this.beds[layer])
          source.start()
          this.sources.push(source)
          if (layer === 'engine') this.fileRate = source.playbackRate
        })
        .catch((error) => {
          console.warn(`[ALVEA JOURNEY] sound file for "${layer}" could not be used (${url}):`, error)
        })
    }
  }

  /* Make a recording loop without a seam: its last stretch is cross-faded
     (equal power) into its first, and the loop is shortened by that stretch. */
  private seamless(buffer: AudioBuffer): AudioBuffer {
    const fade = Math.min(Math.floor(buffer.sampleRate * 2), Math.floor(buffer.length / 4))
    const length = buffer.length - fade
    const out = this.ctx.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate)
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const input = buffer.getChannelData(channel)
      const data = out.getChannelData(channel)
      data.set(input.subarray(0, length))
      for (let i = 0; i < fade; i++) {
        const t = i / fade
        data[i] = input[i] * Math.sin((t * Math.PI) / 2) + input[length + i] * Math.cos((t * Math.PI) / 2)
      }
    }
    return out
  }
}
