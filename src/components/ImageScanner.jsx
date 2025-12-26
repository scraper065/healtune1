import React, { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

const ImageScanner = ({ onImageCapture, isAnalyzing }) => {
  const [preview, setPreview] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error('Kamera hatası:', error);
      alert('Kamera açılamadı. Galeriden seçin.');
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    if (cameraRef.current?.srcObject) {
      cameraRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!cameraRef.current || !canvasRef.current) return;

    const context = canvasRef.current.getContext('2d');
    const video = cameraRef.current;

    canvasRef.current.width = video.videoWidth;
    canvasRef.current.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvasRef.current.toBlob(blob => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        stopCamera();
        onImageCapture(e.target.result);
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.95);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
      onImageCapture(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {preview ? (
        <div className="space-y-4">
          <div className="relative rounded-3xl overflow-hidden border-2 border-teal-500/50">
            <img
              src={preview}
              alt="Ürün"
              className="w-full h-auto object-cover"
            />
            {!isAnalyzing && (
              <button
                onClick={clearPreview}
                className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 rounded-full text-white transition"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 text-teal-400">
              <div className="animate-spin">⏳</div>
              <span>AI analiz ediliyor...</span>
            </div>
          )}

          {!isAnalyzing && (
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Yeni Çek
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-semibold transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Upload size={20} />
                Galeri
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {showCamera ? (
            <div className="space-y-4">
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 border-2 border-teal-500/30">
                <video
                  ref={cameraRef}
                  autoPlay
                  playsInline
                  className="w-full h-auto"
                />
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-lg transition transform hover:scale-105"
                >
                  📸 Fotoğraf Çek
                </button>
                <button
                  onClick={stopCamera}
                  className="px-6 py-4 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-2xl font-semibold transition"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-3xl border-2 border-dashed border-teal-500/30 p-12 bg-slate-800/50 text-center space-y-4">
                <div className="text-6xl">📸</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Ürün Fotoğrafı Çek</h3>
                  <p className="text-slate-400">
                    Gıda ürününün barkod, etiket veya yanları görülecek şekilde fotoğrafını çekin
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={startCamera}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Camera size={24} />
                  Kameradan Çek
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Upload size={24} />
                  Galeriden Seç
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageScanner;
