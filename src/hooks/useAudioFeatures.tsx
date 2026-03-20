/**
 * Audio Communication Features
 * Voice messages and audio interactions
 */

import { useState, useRef, useCallback } from 'react'

export interface AudioMessage {
  id: string
  url: string
  duration: number
  waveform: number[]
  timestamp: number
  isPlaying: boolean
}

export interface VoiceNote {
  id: string
  content: string
  audioUrl?: string
  duration?: number
  isVoiceMessage: boolean
  timestamp: number
}

export function useAudioFeatures() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioMessages, setAudioMessages] = useState<AudioMessage[]>([])
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        
        // Generate simple waveform
        const waveform = generateWaveform(audioBlob)
        
        const audioMessage: AudioMessage = {
          id: Date.now().toString(),
          url: audioUrl,
          duration: recordingTime,
          waveform,
          timestamp: Date.now(),
          isPlaying: false
        }

        setAudioMessages(prev => [...prev, audioMessage])
        setIsRecording(false)
        setRecordingTime(0)

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Failed to start recording:', error)
      setIsRecording(false)
    }
  }, [recordingTime])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  // Play audio message
  const playAudio = useCallback((messageId: string) => {
    const message = audioMessages.find(m => m.id === messageId)
    if (!message) return

    const audio = new Audio(message.url)
    
    audio.onplay = () => {
      setIsPlaying(messageId)
      setAudioMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isPlaying: true } : m
      ))
    }

    audio.onended = () => {
      setIsPlaying(null)
      setAudioMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, isPlaying: false } : m
      ))
    }

    audio.play()
  }, [audioMessages])

  // Stop audio
  const stopAudio = useCallback((messageId: string) => {
    setAudioMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, isPlaying: false } : m
    ))
    setIsPlaying(null)
  }, [])

  // Delete audio message
  const deleteAudio = useCallback((messageId: string) => {
    setAudioMessages(prev => {
      const message = prev.find(m => m.id === messageId)
      if (message) {
        URL.revokeObjectURL(message.url)
      }
      return prev.filter(m => m.id !== messageId)
    })
  }, [])

  // Create voice note
  const createVoiceNote = useCallback((content: string, audioUrl?: string, duration?: number) => {
    const voiceNote: VoiceNote = {
      id: Date.now().toString(),
      content,
      audioUrl,
      duration,
      isVoiceMessage: !!audioUrl,
      timestamp: Date.now()
    }

    setVoiceNotes(prev => [...prev, voiceNote])
    return voiceNote
  }, [])

  // Generate simple waveform
  const generateWaveform = (audioBlob: Blob): number[] => {
    // In production, use Web Audio API to analyze audio
    // For now, generate random waveform
    const length = 50
    return Array.from({ length }, () => Math.random())
  }

  // Cleanup
  const cleanup = useCallback(() => {
    audioMessages.forEach(message => {
      URL.revokeObjectURL(message.url)
    })
    setAudioMessages([])
    setVoiceNotes([])
  }, [])

  return {
    // State
    isRecording,
    audioMessages,
    voiceNotes,
    isPlaying,
    recordingTime,

    // Actions
    startRecording,
    stopRecording,
    playAudio,
    stopAudio,
    deleteAudio,
    createVoiceNote,
    cleanup
  }
}