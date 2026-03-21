/**
 * 🎵 OMNIAUDIO SYSTEM - Game-Changing Audio Notification Manager
 * Complete audio ecosystem for P2P dating app with Web Audio API
 * Extracted and enhanced from external realtime-location-tracker
 */

import { useCallback, useEffect, useRef } from 'react'

export type AudioConfig =  {
  volume: number
  enabled: boolean
  vibrate: boolean
  customSounds: Record<string, string>
}

export type AudioClip =  {
  name: string
  url?: string
  volume?: number
  loop?: boolean
}

class OmniAudioManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private config: AudioConfig = {
    volume: 0.7,
    enabled: true,
    vibrate: true,
    customSounds: {}
  }

  constructor() {
    this.initializeAudioContext()
    this.loadDefaultSounds()
  }

  private initializeAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
  }

  private async loadDefaultSounds() {
    // Create synthetic audio using Web Audio API since we don't have actual audio files
    const defaultClips: AudioClip[] = [
      { name: 'ping', volume: 0.8 },
      { name: 'sos', volume: 1.0 },
      { name: 'call-ring', volume: 0.9, loop: true },
      { name: 'message-sent', volume: 0.6 },
      { name: 'location-update', volume: 0.5 },
      { name: 'user-online', volume: 0.7 },
      { name: 'match-found', volume: 0.9 },
      { name: 'call-connecting', volume: 0.6 },
      { name: 'call-connected', volume: 0.7 },
      { name: 'call-disconnected', volume: 0.5 }
    ]

    for (const clip of defaultClips) {
      await this.generateSyntheticAudio(clip)
    }
  }

  private async generateSyntheticAudio(clip: AudioClip) {
    if (!this.audioContext) return

    const sampleRate = this.audioContext.sampleRate
    const duration = this.getDurationForSound(clip.name)
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate)
    const data = buffer.getChannelData(0)

    // Generate different waveforms for different sounds
    this.generateWaveform(data, clip.name, sampleRate)

    this.sounds.set(clip.name, buffer)
  }

  private getDurationForSound(name: string): number {
    const durations: Record<string, number> = {
      'ping': 0.1,
      'sos': 0.8,
      'call-ring': 0.6,
      'message-sent': 0.2,
      'location-update': 0.15,
      'user-online': 0.3,
      'match-found': 0.5,
      'call-connecting': 0.4,
      'call-connected': 0.3,
      'call-disconnected': 0.25
    }
    return durations[name] || 0.2
  }

  private generateWaveform(data: Float32Array, soundType: string, sampleRate: number) {
    const duration = data.length / sampleRate

    switch (soundType) {
      case 'ping':
        // Sharp ping sound
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 20) * 0.5
        }
        break

      case 'sos':
        // Emergency alert - alternating high/low tones
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          const freq = (i % (sampleRate / 4)) < (sampleRate / 8) ? 1200 : 600
          data[i] = Math.sin(2 * Math.PI * freq * t) * 0.7
        }
        break

      case 'call-ring':
        // Phone ring pattern
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          const ringPattern = (i % (sampleRate / 2)) < (sampleRate / 4) ? 1 : 0
          data[i] = ringPattern * Math.sin(2 * Math.PI * 440 * t) * 0.6
        }
        break

      case 'message-sent':
        // Soft whoosh sound
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          data[i] = (Math.random() - 0.5) * 0.1 * Math.exp(-t * 10)
        }
        break

      case 'location-update':
        // Gentle chirp
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          data[i] = Math.sin(2 * Math.PI * 600 * t + Math.sin(2 * Math.PI * 100 * t)) * Math.exp(-t * 15) * 0.4
        }
        break

      case 'user-online':
        // Ascending tone
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          const freq = 400 + (400 * t / duration)
          data[i] = Math.sin(2 * Math.PI * freq * t) * 0.5
        }
        break

      case 'match-found':
        // Celebration sound
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          data[i] = (Math.sin(2 * Math.PI * 523 * t) + Math.sin(2 * Math.PI * 659 * t) * 0.5) * 0.6
        }
        break

      case 'call-connecting':
        // Connecting beeps
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          const beep = (i % (sampleRate / 3)) < (sampleRate / 6) ? 1 : 0
          data[i] = beep * Math.sin(2 * Math.PI * 300 * t) * 0.4
        }
        break

      case 'call-connected':
        // Soft connection sound
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 8) * 0.5
        }
        break

      case 'call-disconnected':
        // Descending tone
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          const freq = 800 - (400 * t / duration)
          data[i] = Math.sin(2 * Math.PI * freq * t) * 0.4
        }
        break

      default:
        // Default sine wave
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate
          data[i] = Math.sin(2 * Math.PI * 440 * t) * 0.5
        }
    }
  }

  async playSound(soundName: string, options: { volume?: number; loop?: boolean } = {}) {
    if (!this.config.enabled || !this.audioContext) return

    const buffer = this.sounds.get(soundName)
    if (!buffer) return

    // Resume audio context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()

    source.buffer = buffer
    source.loop = options.loop || false

    // Set volume
    const volume = options.volume !== undefined ? options.volume : this.config.volume
    gainNode.gain.value = volume

    // Connect nodes
    source.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    // Start playback
    source.start()

    // Vibrate if enabled and supported
    if (this.config.vibrate && navigator.vibrate) {
      this.vibrateForSound(soundName)
    }

    return source
  }

  private vibrateForSound(soundName: string) {
    const patterns: Record<string, number[]> = {
      'ping': [50],
      'sos': [200, 100, 200, 100, 200],
      'call-ring': [100, 50, 100],
      'message-sent': [30],
      'location-update': [20],
      'user-online': [40],
      'match-found': [100, 50, 100],
      'call-connecting': [50, 50, 50],
      'call-connected': [80],
      'call-disconnected': [60]
    }

    const pattern = patterns[soundName]
    if (pattern) {
      navigator.vibrate(pattern)
    }
  }

  stopSound(source: AudioBufferSourceNode) {
    try {
      source.stop()
    } catch (error) {
      // Source already stopped
    }
  }

  updateConfig(config: Partial<AudioConfig>) {
    this.config = { ...this.config, ...config }
  }

  getConfig(): AudioConfig {
    return { ...this.config }
  }

  // Game-changing feature: Spatial audio for P2P proximity
  async playSpatialSound(soundName: string, userPosition: { x: number; y: number }, listenerPosition: { x: number; y: number }) {
    if (!this.audioContext) return

    const buffer = this.sounds.get(soundName)
    if (!buffer) return

    const source = this.audioContext.createBufferSource()
    const gainNode = this.audioContext.createGain()
    const pannerNode = this.audioContext.createStereoPanner()

    source.buffer = buffer

    // Calculate panning based on position
    const dx = userPosition.x - listenerPosition.x
    const distance = Math.sqrt(dx * dx)
    const maxDistance = 1000 // 1000px max distance
    const pan = Math.max(-1, Math.min(1, dx / maxDistance))

    // Set spatial parameters
    pannerNode.pan.value = pan
    gainNode.gain.value = Math.max(0, 1 - distance / maxDistance) * this.config.volume

    // Connect nodes
    source.connect(pannerNode)
    pannerNode.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    source.start()
    return source
  }

  // Game-changing feature: Audio context management for battery optimization
  suspendAudioContext() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend()
    }
  }

  resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }
}

// Global audio manager instance
export const audioManager = new OmniAudioManager()

// React hook for audio system
export function useOmniAudio() {
  const audioSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map())

  const playSound = useCallback(async (soundName: string, options?: { volume?: number; loop?: boolean }) => {
    const source = await audioManager.playSound(soundName, options)
    if (source) {
      audioSourcesRef.current.set(soundName, source)
    }
    return source
  }, [])

  const stopSound = useCallback((soundName: string) => {
    const source = audioSourcesRef.current.get(soundName)
    if (source) {
      audioManager.stopSound(source)
      audioSourcesRef.current.delete(soundName)
    }
  }, [])

  const playSpatialSound = useCallback(async (soundName: string, userPosition: { x: number; y: number }, listenerPosition: { x: number; y: number }) => {
    return await audioManager.playSpatialSound(soundName, userPosition, listenerPosition)
  }, [])

  const updateConfig = useCallback((config: Partial<AudioConfig>) => {
    audioManager.updateConfig(config)
  }, [])

  const getConfig = useCallback(() => {
    return audioManager.getConfig()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioSourcesRef.current.forEach(source => {
        try {
          source.stop()
        } catch (error) {
          // Source already stopped
        }
      })
      audioSourcesRef.current.clear()
    }
  }, [])

  return {
    playSound,
    stopSound,
    playSpatialSound,
    updateConfig,
    getConfig,
    // Game-changing convenience methods
    notifyMessage: () => playSound('message-sent'),
    notifyPing: () => playSound('ping'),
    notifySOS: () => playSound('sos'),
    notifyCallRing: () => playSound('call-ring', { loop: true }),
    notifyCallConnected: () => playSound('call-connected'),
    notifyMatchFound: () => playSound('match-found'),
    notifyUserOnline: () => playSound('user-online'),
    notifyLocationUpdate: () => playSound('location-update'),
    stopCallRing: () => stopSound('call-ring'),
    suspendForBattery: () => audioManager.suspendAudioContext(),
    resumeForActivity: () => audioManager.resumeAudioContext()
  }
}
