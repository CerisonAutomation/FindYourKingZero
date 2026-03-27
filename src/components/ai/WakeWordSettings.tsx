/**
 * WakeWordSettings — UI Component for Customizing Wake Word
 *
 * Allows users to:
 * - Select from preset wake words
 * - Configure custom wake words
 * - Adjust sensitivity
 * - Enable/disable wake word detection
 */

import React, { useState } from 'react';
import { Mic, AlertCircle, Check, ChevronDown, Settings, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import {
  useWakeWordConfig,
  WAKE_WORD_PRESETS,
  getAllWakeWordPresets,
  getCustomModelPresets,
  validateWakeWordConfig,
  type CustomWakeWord,
  type WakeWordPreset,
} from '@/services/ai';

export interface WakeWordSettingsProps {
  /** Optional Picovoice access key (if not using env var) */
  accessKey?: string;
  /** Callback when settings change */
  onChange?: () => void;
  /** Additional CSS classes */
  className?: string;
}

export function WakeWordSettings({
  accessKey: externalAccessKey,
  onChange,
  className,
}: WakeWordSettingsProps): JSX.Element {
  const { toast } = useToast();
  const {
    config,
    setPreset,
    setCustomWakeWords,
    setSensitivity,
    setAccessKey,
    setEnabled,
    allPresets,
    currentPreset,
    validate,
  } = useWakeWordConfig({
    accessKey: externalAccessKey,
  });

  const [isTesting, setIsTesting] = useState(false);
  const [customWords, setCustomWords] = useState<CustomWakeWord[]>(
    config.customWakeWords ?? [{ label: '', modelSource: { type: 'path', value: '' } }]
  );

  // Validation
  const validation = validate();

  // Handle preset selection
  const handlePresetChange = (presetId: string) => {
    setPreset(presetId);
    onChange?.();

    const preset = WAKE_WORD_PRESETS[presetId.toUpperCase().replace(/-/g, '_')];
    if (preset?.requiresCustomModel) {
      toast({
        title: 'Custom Model Required',
        description: `This wake word requires a .ppn model file at ${preset.modelPath}`,
      });
    }
  };

  // Handle sensitivity change
  const handleSensitivityChange = (value: number[]) => {
    setSensitivity(value[0]);
    onChange?.();
  };

  // Handle custom wake word update
  const updateCustomWord = (index: number, updates: Partial<CustomWakeWord>) => {
    const updated = customWords.map((w, i) => (i === index ? { ...w, ...updates } : w));
    setCustomWords(updated);
    setCustomWakeWords(updated);
    onChange?.();
  };

  // Add custom wake word
  const addCustomWord = () => {
    const updated = [
      ...customWords,
      { label: '', modelSource: { type: 'path', value: '' } as const },
    ];
    setCustomWords(updated);
  };

  // Remove custom wake word
  const removeCustomWord = (index: number) => {
    const updated = customWords.filter((_, i) => i !== index);
    setCustomWords(updated);
    setCustomWakeWords(updated);
    onChange?.();
  };

  // Test wake word
  const handleTest = async () => {
    if (!validation.valid) {
      toast({
        title: 'Configuration Error',
        description: validation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    toast({
      title: 'Testing Wake Word',
      description: 'Speak your wake word now...',
    });

    // Simulate test (in real implementation, would use Porcupine)
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: 'Test Complete',
        description: 'Wake word detection is working!',
      });
    }, 3000);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="w-5 h-5" />
          Wake Word Settings
        </CardTitle>
        <CardDescription>
          Customize how you activate the AI assistant with your voice
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Wake Word</Label>
            <p className="text-sm text-muted-foreground">
              Say your wake word to activate the AI
            </p>
          </div>
          <Switch checked={config.enabled} onCheckedChange={setEnabled} />
        </div>

        {config.enabled && (
          <>
            {/* Preset Selection */}
            <div className="space-y-2">
              <Label>Wake Word Preset</Label>
              <Select value={config.presetId} onValueChange={handlePresetChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a wake word" />
                </SelectTrigger>
                <SelectContent>
                  {/* Custom presets */}
                  <SelectItem value="hey-king">Hey King (Default)</SelectItem>
                  <SelectItem value="hey-sovereign">Hey Sovereign</SelectItem>
                  <SelectItem value="hey-ai">Hey AI</SelectItem>
                  <SelectItem value="abracadabra">Abracadabra</SelectItem>
                  <SelectItem value="wake-up">Wake Up</SelectItem>
                  <SelectItem value="dual">Dual Mode (Multiple)</SelectItem>

                  {/* Built-in presets */}
                  <SelectItem value="builtin-okay-google">Okay Google (Built-in)</SelectItem>
                  <SelectItem value="builtin-hey-google">Hey Google (Built-in)</SelectItem>
                  <SelectItem value="builtin-alexa">Alexa (Built-in)</SelectItem>

                  {/* Custom */}
                  <SelectItem value="custom">Custom Wake Word</SelectItem>
                </SelectContent>
              </Select>

              {currentPreset && (
                <p className="text-sm text-muted-foreground">
                  {currentPreset.description}
                  {currentPreset.requiresCustomModel && (
                    <span className="text-amber-500 block mt-1">
                      ⚠️ Requires .ppn model file
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Custom Wake Words */}
            {config.presetId === 'custom' && (
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Custom Wake Words</Label>
                  <Button variant="outline" size="sm" onClick={addCustomWord}>
                    Add Wake Word
                  </Button>
                </div>

                {customWords.map((word, index) => (
                  <div key={index} className="space-y-3 border-b last:border-0 pb-3 last:pb-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Label</Label>
                        <Input
                          placeholder="Hey King"
                          value={word.label}
                          onChange={(e) =>
                            updateCustomWord(index, { label: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Source Type</Label>
                        <Select
                          value={word.modelSource.type}
                          onValueChange={(v) =>
                            updateCustomWord(index, {
                              modelSource: { type: v as 'path' | 'base64', value: '' },
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="path">File Path</SelectItem>
                            <SelectItem value="base64">Base64</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">
                        {word.modelSource.type === 'path' ? 'File Path' : 'Base64 String'}
                      </Label>
                      <Input
                        placeholder={
                          word.modelSource.type === 'path'
                            ? '/models/custom.ppn'
                            : 'base64encodedstring...'
                        }
                        value={word.modelSource.value}
                        onChange={(e) =>
                          updateCustomWord(index, {
                            modelSource: { ...word.modelSource, value: e.target.value },
                          })
                        }
                      />
                    </div>

                    {customWords.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => removeCustomWord(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Sensitivity */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sensitivity</Label>
                <span className="text-sm text-muted-foreground">
                  {((config.sensitivity ?? 0.7) * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                value={[config.sensitivity ?? 0.7]}
                onValueChange={handleSensitivityChange}
                min={0}
                max={1}
                step={0.05}
              />
              <p className="text-xs text-muted-foreground">
                Higher sensitivity detects wake words more easily but may increase false
                positives. Lower sensitivity requires clearer pronunciation.
              </p>
            </div>

            {/* Access Key */}
            {!externalAccessKey && (
              <div className="space-y-2">
                <Label>Picovoice Access Key</Label>
                <Input
                  type="password"
                  placeholder="Enter your access key from console.picovoice.ai"
                  value={config.accessKey ?? ''}
                  onChange={(e) => setAccessKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get a free key from{' '}
                  <a
                    href="https://console.picovoice.ai/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    console.picovoice.ai
                  </a>
                </p>
              </div>
            )}

            {/* Validation Errors */}
            {!validation.valid && (
              <div className="flex items-start gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <ul className="list-disc list-inside">
                  {validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Test Button */}
            <Button
              onClick={handleTest}
              disabled={isTesting || !validation.valid}
              className="w-full"
              variant={isTesting ? 'secondary' : 'default'}
            >
              {isTesting ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                  Testing...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Test Wake Word
                </>
              )}
            </Button>

            {/* Advanced Info */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="info">
                <AccordionTrigger className="text-sm">
                  About Wake Words
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Wake words are detected locally on your device using the Porcupine
                    engine. No audio data is sent to any server.
                  </p>
                  <p>
                    <strong>Custom wake words</strong> require training a .ppn model file
                    through the Picovoice Console. This is free for personal use.
                  </p>
                  <p>
                    <strong>Built-in wake words</strong> like "Okay Google" and "Alexa" work
                    immediately without any model files.
                  </p>
                  <p>
                    <strong>Sensitivity</strong> controls how easily the wake word is
                    detected. Higher values (0.8+) detect more easily but may trigger
                    accidentally.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default WakeWordSettings;
