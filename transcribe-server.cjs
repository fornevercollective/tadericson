#!/usr/bin/env node
/**
 * transcribe-server.cjs
 * Local companion for tadericson-site Live Lens captions.
 * Receives audio chunks (webm) from the browser via POST,
 * writes temp file, calls the local whisper engine via python script,
 * returns JSON { text, engine, latencyMs }.
 *
 * Run alongside the Vite dev server:
 *   node transcribe-server.cjs
 *
 * Then in the app, when Live Lens (camera) is active, it will POST chunks
 * and display live transcription/captions + buffer info.
 *
 * Uses the wisper (whisper.cpp via local-grok-audio.py) models in ~/models/audio/whisper
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const PORT = 8765;
const WHISPER_PY = path.join(os.homedir(), 'models', 'audio', 'local-grok-audio.py');
const TMP_DIR = os.tmpdir();

const server = http.createServer((req, res) => {
  // CORS for Vite dev server (localhost:5173 etc)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && (req.url === '/transcribe-chunk' || req.url === '/transcribe')) {
    const chunks = [];
    const start = Date.now();

    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const audioBuffer = Buffer.concat(chunks);
      if (audioBuffer.length < 2000) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text: '', engine: 'skip', latencyMs: Date.now() - start }));
        return;
      }

      const tmpFile = path.join(TMP_DIR, `tadericson-live-${Date.now()}-${Math.random().toString(36).slice(2)}.webm`);
      fs.writeFileSync(tmpFile, audioBuffer);

      // Call the wisper engine via the provided python wrapper.
      // It will auto-detect best available model (prefers large turbo if present, falls to base.en).
      const py = spawn('python3', [
        WHISPER_PY,
        'transcribe',
        tmpFile,
        '--model', 'base.en',   // fast for live; change to large-v3-turbo if you have the q5/q8
        '--lang', 'en'
      ], { stdio: ['ignore', 'pipe', 'pipe'] });

      let stdout = '';
      let stderr = '';

      py.stdout.on('data', (d) => { stdout += d.toString(); });
      py.stderr.on('data', (d) => { stderr += d.toString(); });

      py.on('close', (code) => {
        // cleanup temp immediately
        try { fs.unlinkSync(tmpFile); } catch {}

        let text = '';
        let engine = 'whisper-local';

        try {
          // The python prints a JSON object (from transcribe_whisper)
          const parsed = JSON.parse(stdout.trim());
          text = (parsed.text || '').trim();
          engine = parsed.engine || 'whisper-local';
        } catch (e) {
          // fallback: take last non-empty line if not json
          const lines = stdout.trim().split('\n').filter(Boolean);
          text = lines[lines.length - 1] || '';
        }

        const latencyMs = Date.now() - start;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          text,
          engine,
          latencyMs,
          chunkBytes: audioBuffer.length,
          success: code === 0 && !!text
        }));

        if (stderr && !text) {
          console.error('[transcribe-server] stderr:', stderr.slice(0, 300));
        }
      });

      py.on('error', (err) => {
        try { fs.unlinkSync(tmpFile); } catch {}
        console.error('[transcribe-server] spawn error', err);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ text: '', engine: 'error', latencyMs: Date.now() - start, error: String(err) }));
      });
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'not found' }));
});

server.listen(PORT, () => {
  console.log(`[transcribe-server] listening on http://localhost:${PORT}`);
  console.log(`[transcribe-server] using wisper wrapper: ${WHISPER_PY}`);
  console.log(`[transcribe-server] ready for chunks from tadericson-site Live Lens`);
});

process.on('SIGINT', () => {
  console.log('\n[transcribe-server] shutting down');
  server.close(() => process.exit(0));
});