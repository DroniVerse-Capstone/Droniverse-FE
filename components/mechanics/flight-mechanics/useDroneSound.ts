"use client";

import { useRef, useEffect, useCallback } from "react";

/**
 * Synthesizes realistic drone motor sound using Web Audio API.
 * Uses 4 oscillators (one per motor) with intermodulation effects
 * to create the characteristic buzzing drone sound.
 */
export function useDroneSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    masterGain: GainNode | null;
    osc1: OscillatorNode | null;
    osc2: OscillatorNode | null;
    osc3: OscillatorNode | null;
    osc4: OscillatorNode | null;
    noiseGain: GainNode | null;
    noiseSource: AudioBufferSourceNode | null;
    filter: BiquadFilterNode | null;
    lfo: OscillatorNode | null;
    lfoGain: GainNode | null;
  }>({
    masterGain: null,
    osc1: null, osc2: null, osc3: null, osc4: null,
    noiseGain: null, noiseSource: null,
    filter: null, lfo: null, lfoGain: null,
  });
  const startedRef = useRef(false);

  // Build the audio graph once
  const buildGraph = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    // Master gain — controls overall volume
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    nodesRef.current.masterGain = master;

    // Low-pass filter to shape the "motor buzz" character
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.Q.value = 1.5;
    filter.connect(master);
    nodesRef.current.filter = filter;

    // LFO for throttle-dependent pitch modulation (faster at high RPM)
    const lfo = ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 20;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 3;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    nodesRef.current.lfo = lfo;
    nodesRef.current.lfoGain = lfoGain;

    // 4 motor oscillators (quadcopter = 4 props)
    // Each motor has a slightly different base frequency to create
    // the characteristic beating/interference sound of real drones
    const baseFreqs = [145, 152, 149, 155]; // Hz — slightly detuned

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = baseFreqs[i];

      // Per-motor gain
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.08;

      // 2nd harmonic (adds buzz character)
      const harm2 = ctx.createOscillator();
      harm2.type = "square";
      harm2.frequency.value = baseFreqs[i] * 2;
      const harm2Gain = ctx.createGain();
      harm2Gain.gain.value = 0.03;

      osc.connect(gainNode);
      harm2.connect(harm2Gain);
      gainNode.connect(filter);
      harm2Gain.connect(filter);
      osc.start();
      harm2.start();

      switch (i) {
        case 0: nodesRef.current.osc1 = osc; break;
        case 1: nodesRef.current.osc2 = osc; break;
        case 2: nodesRef.current.osc3 = osc; break;
        case 3: nodesRef.current.osc4 = osc; break;
      }
    }

    // Propeller wash noise — white noise through a bandpass filter
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 1200;
    noiseFilter.Q.value = 0.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noiseSource.start();

    nodesRef.current.noiseGain = noiseGain;
    nodesRef.current.noiseSource = noiseSource;
  }, []);

  // Call this to start/resume audio context (must be from user gesture)
  const init = useCallback(() => {
    buildGraph();
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
  }, [buildGraph]);

  // Update motor RPM based on average throttle (0–100)
  const updateThrottle = useCallback((motors: { m1: number; m2: number; m3: number; m4: number }) => {
    if (!audioCtxRef.current || !nodesRef.current.masterGain) return;

    const ctx = audioCtxRef.current;
    const nodes = nodesRef.current;
    const avgThrottle = (motors.m1 + motors.m2 + motors.m3 + motors.m4) / 4;

    // RPM scaling: idle at 12% maps to base freq, 100% maps to 2.8x base freq
    const rpmScale = avgThrottle < 12 ? 0 : (avgThrottle - 12) / 88;
    const targetFreqMult = 1 + rpmScale * 1.8;

    const baseFreqs = [145, 152, 149, 155];
    const oscs = [nodes.osc1, nodes.osc2, nodes.osc3, nodes.osc4];

    const now = ctx.currentTime;
    oscs.forEach((osc, i) => {
      if (!osc) return;
      // Small per-motor frequency variance scales with throttle too
      osc.frequency.setTargetAtTime(baseFreqs[i] * targetFreqMult * (1 + i * 0.008), now, 0.05);
    });

    // Volume: ramp up from silence at idle to full at ~60%, stays at max above
    const volumeScale = Math.max(0, Math.min(1, (avgThrottle - 8) / 40));
    const targetVol = volumeScale * 0.55;
    nodes.masterGain?.gain.setTargetAtTime(targetVol, now, 0.08);

    // Filter cutoff rises with RPM (higher pitch = brighter sound)
    const filterFreq = 300 + rpmScale * 2000;
    nodes.filter?.frequency.setTargetAtTime(filterFreq, now, 0.05);

    // LFO speed increases with RPM (faster "fwap-fwap" at high throttle)
    const lfoFreq = 8 + rpmScale * 40;
    nodes.lfo?.frequency.setTargetAtTime(lfoFreq, now, 0.1);

    // Propeller wash noise — only audible above 30% throttle
    const noiseVol = Math.max(0, (avgThrottle - 30) / 70) * 0.12;
    nodes.noiseGain?.gain.setTargetAtTime(noiseVol, now, 0.1);
  }, []);

  // Fade out and stop
  const stop = useCallback(() => {
    if (!audioCtxRef.current || !nodesRef.current.masterGain) return;
    const ctx = audioCtxRef.current;
    nodesRef.current.masterGain?.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        nodesRef.current.osc1?.stop();
        nodesRef.current.osc2?.stop();
        nodesRef.current.osc3?.stop();
        nodesRef.current.osc4?.stop();
        nodesRef.current.noiseSource?.stop();
        nodesRef.current.lfo?.stop();
        audioCtxRef.current.close();
      }
    };
  }, []);

  return { init, updateThrottle, stop };
}
