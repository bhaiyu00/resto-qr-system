import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Camera, CheckCircle2, QrCode, AlertCircle, Sparkles } from 'lucide-react';
import jsQR from 'jsqr';
import { soundManager } from '../../utils/soundManager.ts';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableScanned?: (detected: string) => void;
}

const AVAILABLE_TEST_TABLES = [
  { tableNumber: 'Table 01', token: 'tok-tbl-01-a8f9', location: 'Window Bay', capacity: 2 },
  { tableNumber: 'Table 02', token: 'tok-tbl-02-c4d1', location: 'Garden Patio', capacity: 4 },
  { tableNumber: 'Table 03', token: 'tok-tbl-03-e7a2', location: 'Main Dining', capacity: 4 },
  { tableNumber: 'Table 04', token: 'tok-tbl-04-f9b8', location: 'Corner Booth', capacity: 6 },
  { tableNumber: 'Table 05', token: 'tok-tbl-05-3e2c', location: 'Espresso Bar', capacity: 2 },
  { tableNumber: 'Table 06', token: 'tok-tbl-06-8d1a', location: 'Terrace View', capacity: 4 },
  { tableNumber: 'Table 07', token: 'tok-tbl-07-5b4e', location: 'Courtyard', capacity: 4 },
  { tableNumber: 'Table 08', token: 'tok-tbl-08-9f0d', location: 'Mezzanine', capacity: 8 },
];

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onTableScanned }) => {
  const navigate = useNavigate();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [availableTables, setAvailableTables] = useState(AVAILABLE_TEST_TABLES);
  const [scanMode, setScanMode] = useState<'camera' | 'simulate'>('simulate');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<{ table: string; token: string } | null>(null);

  // Fetch live tables from server
  useEffect(() => {
    if (isOpen) {
      fetch('/api/public/tables/cozybite-cafe')
        .then(res => res.json())
        .then(data => {
          if (data.tables && data.tables.length > 0) {
            setAvailableTables(data.tables);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Stop camera stream helper
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  }, []);

  // Handle successful detection of token
  const handleSuccessToken = useCallback(
    (token: string, tableName?: string) => {
      stopCamera();
      soundManager.playQRScanBeep();

      const matched = AVAILABLE_TEST_TABLES.find(
        t => t.token === token || t.tableNumber.toLowerCase() === tableName?.toLowerCase()
      );

      const tableDisplay = matched ? matched.tableNumber : tableName || 'Table Identified';
      const finalToken = matched ? matched.token : token;

      setScannedResult({
        table: tableDisplay,
        token: finalToken,
      });

      if (onTableScanned) {
        onTableScanned(tableDisplay);
      }

      // Navigate to the table route after short animation
      setTimeout(() => {
        onClose();
        setScannedResult(null);
        navigate(`/menu/cozybite-cafe/table/${finalToken}`);
      }, 900);
    },
    [navigate, onClose, onTableScanned, stopCamera]
  );

  // Parse raw text or URL to extract token
  const parseTokenFromRaw = (data: string): string | null => {
    // Check if data contains /table/:token
    const matchTableUrl = data.match(/\/table\/([a-zA-Z0-9_-]+)/);
    if (matchTableUrl && matchTableUrl[1]) {
      return matchTableUrl[1];
    }
    // Check if raw token format
    if (data.startsWith('tok-tbl-')) {
      return data;
    }
    // Check if simple table number (e.g. "Table 06" or "6")
    const matchTblNum = data.match(/(?:table\s*|tbl\s*#?)0?(\d+)/i);
    if (matchTblNum) {
      const num = parseInt(matchTblNum[1], 10);
      const formatted = `Table ${num < 10 ? '0' + num : num}`;
      const found = AVAILABLE_TEST_TABLES.find(t => t.tableNumber.toLowerCase() === formatted.toLowerCase());
      if (found) return found.token;
    }
    return null;
  };

  // Frame processing loop with jsQR
  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const detectedToken = parseTokenFromRaw(code.data);
          if (detectedToken) {
            handleSuccessToken(detectedToken);
            return;
          }
        }
      } catch (err) {
        console.warn('QR frame analysis:', err);
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick);
  }, [handleSuccessToken]);

  // Start Camera
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);
    setIsScanning(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play().catch(e => console.warn('Video play:', e));
      }
      animationFrameRef.current = requestAnimationFrame(tick);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow camera access in browser settings or choose a table below.'
          : 'Could not activate camera. Please select a table from the test simulation list.'
      );
      setScanMode('simulate');
      setIsScanning(false);
    }
  }, [stopCamera, tick]);

  useEffect(() => {
    if (isOpen && scanMode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, scanMode, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#E8DFD5] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#E8DFD5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#FAF2EB] text-[#C85A32] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-display font-bold text-base text-[#34241B]">Scan Table QR Standee</h3>
              <p className="text-[11px] text-[#8D6E5C]">Automatic contactless dining detection</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-[#EFE9E1] text-[#6A4D3B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs (2 Modes: Simulated Standees & Live Camera) */}
        <div className="grid grid-cols-2 p-1.5 mx-4 mt-3 bg-[#EFE9E1] rounded-2xl text-xs font-semibold text-[#6A4D3B]">
          <button
            onClick={() => setScanMode('simulate')}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              scanMode === 'simulate' ? 'bg-white text-[#C85A32] shadow-xs' : 'hover:text-[#34241B]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Table Standees</span>
          </button>
          <button
            onClick={() => setScanMode('camera')}
            className={`py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              scanMode === 'camera' ? 'bg-white text-[#C85A32] shadow-xs' : 'hover:text-[#34241B]'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1">
          {scannedResult ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-display font-bold text-lg text-[#34241B]">
                {scannedResult.table} Detected!
              </h4>
              <p className="text-xs text-[#8D6E5C]">
                Loading verified café food menu with automatic table seating...
              </p>
            </div>
          ) : scanMode === 'camera' ? (
            <div className="space-y-3">
              <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-[#C85A32] shadow-inner flex items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />

                {/* Reticle Overlay */}
                <div className="absolute inset-8 border-2 border-white/80 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-full h-0.5 bg-[#C85A32] shadow-sm animate-pulse" />
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center text-white space-y-2">
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                    <p className="text-xs text-rose-200">{cameraError}</p>
                    <button
                      onClick={() => setScanMode('simulate')}
                      className="px-3 py-1.5 rounded-xl bg-[#C85A32] text-xs font-semibold"
                    >
                      Use Test Table Standees
                    </button>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-[#8D6E5C]">
                Align table QR standee inside the box to connect.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-2.5 rounded-xl bg-white border border-[#E8DFD5] text-xs text-[#6A4D3B]">
                <span className="font-semibold text-[#34241B] block mb-0.5">
                  Instant Table Standee Detection
                </span>
                Tap any table below to test automatic table recognition from its unique QR code:
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-0.5">
                {availableTables.map(table => (
                  <button
                    key={table.token}
                    onClick={() => handleSuccessToken(table.token, table.tableNumber)}
                    className="p-3 rounded-xl border border-[#E8DFD5] bg-white hover:border-[#C85A32] hover:bg-[#FAF2EB] text-left transition-all active:scale-95 group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-[#34241B] group-hover:text-[#C85A32]">
                        {table.tableNumber}
                      </span>
                      <span className="text-[10px] text-[#C85A32] font-semibold bg-[#FAF2EB] px-1.5 py-0.2 rounded">
                        Scan ⚡
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8D6E5C] block">
                      {table.location} · {table.capacity}p
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-[#E8DFD5] flex items-center justify-between text-xs text-[#8D6E5C]">
          <span>CozyBite Unique Token Protocol</span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-[#6A4D3B] hover:text-[#C85A32] font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
