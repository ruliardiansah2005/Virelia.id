import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera,
  X,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Stethoscope,
  MapPin,
  Image as ImageIcon
} from "lucide-react";

export default function ScanTest() {
  const navigate = useNavigate();

  const [stage, setStage] = useState<"camera" | "processing" | "result">("camera");
  const [hasCameraError, setHasCameraError] = useState(false);
  const [cameraAttempt, setCameraAttempt] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraCaptureRef = useRef<HTMLInputElement>(null);

  const lang = (
    localStorage.getItem("lang") || "ID"
  ).toLowerCase() as "en" | "id";

  const t = {
    en: {
      scanner: "AI SCANNER",
      sandboxWarning: "Camera unavailable. Please allow camera access.",
      placeTest: "Place the DIP TEST inside the frame",
      processingTitle: "AI Analysis",
      processingDesc: "Processing image and detecting lines...",
      scanResult: "Demo Scan Result",
      negative: "Example Result",
      negativeDesc: "This is a demonstration only, not a medical test result.",
      confidence: "Scan Status",
      demo: "DEMO",
      recommendation: "Important Information",
      recommendationDesc: "This application is demonstrating its interface. It cannot diagnose HPV or replace a laboratory test or professional medical assessment.",
      consult: "Consult Doctor",
      hospital: "Find Hospital",
      save: "Save Result to History",
      retry: "Try Again"
    },
    id: {
      scanner: "PEMINDAI AI",
      sandboxWarning: "Kamera tidak tersedia. Izinkan akses kamera melalui browser.",
      placeTest: "Tempatkan ALAT TES di dalam bingkai",
      processingTitle: "Analisis AI",
      processingDesc: "Memproses gambar dan mendeteksi garis...",
      scanResult: "Hasil Simulasi Pemindaian",
      negative: "Contoh Hasil",
      negativeDesc: "Ini hanya demonstrasi, bukan hasil pemeriksaan medis.",
      confidence: "Status Pemindaian",
      demo: "DEMO",
      recommendation: "Informasi Penting",
      recommendationDesc: "Aplikasi ini hanya mendemonstrasikan antarmuka. Aplikasi belum dapat mendiagnosis HPV dan tidak menggantikan pemeriksaan laboratorium atau penilaian tenaga medis.",
      consult: "Konsultasi Dokter",
      hospital: "Cari Rumah Sakit",
      save: "Simpan Hasil ke Riwayat",
      retry: "Coba Lagi"
    }
  };

  const currentT = t[lang] || t.id;

  // ==========================================
  // CAMERA INITIALIZATION
  // ==========================================

  useEffect(() => {
    if (stage !== "camera") return;

    let cancelled = false;
    let activeStream: MediaStream | null = null;

    const initCamera = async () => {
      try {
        setHasCameraError(false);

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            "Camera API tidak tersedia. Gunakan HTTPS."
          );
        }

        // Prioritaskan kamera belakang
        try {
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: false
          });
        } catch (backCameraError) {
          console.warn(
            "Kamera belakang gagal, mencoba kamera default:",
            backCameraError
          );

          // Fallback kamera
          activeStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
        }

        if (cancelled) {
          activeStream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = activeStream;

        const video = videoRef.current;

        if (!video) {
          throw new Error("Elemen video tidak ditemukan.");
        }

        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;

        // Pasang listener sebelum memberikan stream
        const metadataReady = new Promise<void>((resolve, reject) => {
          if (video.readyState >= 1) {
            resolve();
            return;
          }

          video.onloadedmetadata = () => resolve();
          video.onerror = () => reject(
            new Error("Gagal memuat video kamera.")
          );
        });

        video.srcObject = activeStream;

        await metadataReady;

        if (cancelled) return;

        await video.play();

        if (!cancelled) {
          setHasCameraError(false);
        }

      } catch (error) {
        console.error("Camera initialization error:", error);

        if (activeStream) {
          activeStream.getTracks().forEach(track => track.stop());
        }

        if (!cancelled) {
          streamRef.current = null;
          setHasCameraError(true);
        }
      }
    };

    initCamera();

    return () => {
      cancelled = true;

      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }

      if (streamRef.current === activeStream) {
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
      }
    };
  }, [stage, cameraAttempt]);

  // ==========================================
  // PROCESSING SIMULATION
  // ==========================================

  useEffect(() => {
    if (stage !== "processing") return;

    const timer = window.setTimeout(() => {
      setStage("result");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [stage]);

  // ==========================================
  // START SCAN
  // ==========================================

  const startScan = () => {
    if (hasCameraError) {
      cameraCaptureRef.current?.click();
      return;
    }

    setStage("processing");
  };

  // ==========================================
  // RETRY CAMERA
  // ==========================================

  const retryCamera = () => {
    setHasCameraError(false);
    setCameraAttempt(prev => prev + 1);
  };

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      setStage("processing");
    }

    e.target.value = "";
  };

  // ==========================================
  // FULL SCREEN MAIN CONTAINER
  // ==========================================

  return (
    <div className="fixed inset-0 z-[9999] w-screen h-[100dvh] bg-black overflow-hidden">

      <AnimatePresence mode="wait">

        {/* ==================================
            CAMERA SCREEN
        ================================== */}

        {stage === "camera" && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full bg-black overflow-hidden"
          >

            {/* CAMERA BACKGROUND */}

            <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">

              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* CAMERA ERROR */}

              {hasCameraError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950 p-6">

                  <div className="text-center text-white max-w-sm">

                    <Camera
                      size={48}
                      className="mx-auto mb-5 text-pink-400"
                    />

                    <h2 className="text-xl font-bold mb-3">
                      Kamera Tidak Dapat Diakses
                    </h2>

                    <p className="text-sm text-gray-300 leading-relaxed">
                      {currentT.sandboxWarning}
                    </p>

                    <button
                      onClick={retryCamera}
                      className="mt-6 px-6 py-3 bg-[#D94F8A] text-white rounded-xl font-bold hover:bg-pink-600 transition-colors"
                    >
                      {currentT.retry}
                    </button>

                  </div>
                </div>
              )}

              {/* DETECTION FRAME */}

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">

                <div className="w-72 h-40 sm:w-80 sm:h-48 md:w-96 md:h-56 border-2 border-dashed border-white/60 rounded-3xl relative">

                  {/* TOP LEFT */}

                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#D94F8A] rounded-tl-2xl -mt-[2px] -ml-[2px]" />

                  {/* TOP RIGHT */}

                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#D94F8A] rounded-tr-2xl -mt-[2px] -mr-[2px]" />

                  {/* BOTTOM LEFT */}

                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#D94F8A] rounded-bl-2xl -mb-[2px] -ml-[2px]" />

                  {/* BOTTOM RIGHT */}

                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#D94F8A] rounded-br-2xl -mb-[2px] -mr-[2px]" />

                  {/* CENTER ICON */}

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/40">
                    <Camera size={32} />
                  </div>

                </div>

              </div>

              {/* INSTRUCTION */}

              <div className="absolute bottom-36 md:bottom-44 left-0 right-0 text-center z-10 px-4 pointer-events-none">

                <p className="text-white text-sm md:text-base font-medium bg-black/60 inline-block px-6 py-3 rounded-full backdrop-blur-md border border-white/10 shadow-lg uppercase">
                  {currentT.placeTest}
                </p>

              </div>

            </div>

            {/* HEADER */}

            <div className="absolute top-0 left-0 right-0 pt-[max(1.5rem,env(safe-area-inset-top))] px-6 z-30 flex justify-between items-center">

              <button
                onClick={() => navigate("/app")}
                className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full text-white text-sm font-bold tracking-widest border border-white/10 uppercase">
                {currentT.scanner}
              </div>

              <div className="w-12" />

            </div>

            {/* BOTTOM CONTROLS */}

            <div className="absolute bottom-0 left-0 w-full h-48 md:h-56 pb-[max(2rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black via-black/90 to-transparent flex items-end justify-center z-30">

              <div className="flex items-center gap-6 md:gap-10">

                {/* GALLERY */}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-colors shadow-lg"
                >
                  <ImageIcon size={24} />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* NATIVE CAMERA FALLBACK */}

                <input
                  type="file"
                  ref={cameraCaptureRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {/* SHUTTER */}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startScan}
                  disabled={hasCameraError}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#F7A8C4] p-1.5 bg-black/20 backdrop-blur-sm shadow-[0_0_30px_rgba(247,168,196,0.3)] disabled:opacity-40"
                >

                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center" />

                </motion.button>

                {/* SPACER */}

                <div className="w-14 h-14" />

              </div>

            </div>

          </motion.div>
        )}

        {/* ==================================
            PROCESSING SCREEN
        ================================== */}

        {stage === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-900"
          >

            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-40 h-40 rounded-full border-t-4 border-r-4 border-l-4 border-[#D94F8A] border-b-4 border-transparent flex items-center justify-center relative"
            >

              <motion.div
                animate={{ rotate: -360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="w-24 h-24 rounded-full border-t-4 border-[#F7A8C4] border-l-4 border-r-4 border-b-4 border-transparent border-dashed"
              />

            </motion.div>

            <h3 className="text-white font-extrabold text-2xl md:text-3xl mt-10 tracking-wide">
              {currentT.processingTitle}
            </h3>

            <p className="text-gray-400 mt-3 text-base md:text-lg font-medium">
              {currentT.processingDesc}
            </p>

          </motion.div>
        )}

        {/* ==================================
            RESULT SCREEN
        ================================== */}

        {stage === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute inset-0 w-full h-full bg-[#F5F5F7] flex flex-col overflow-hidden"
          >

            {/* TOP BORDER */}

            <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />

            {/* HEADER */}

            <div className="pt-[max(1.5rem,env(safe-area-inset-top))] px-6 pb-6 flex justify-between items-center border-b border-gray-200/50 bg-white/50 backdrop-blur-md">

              <button
                onClick={() => navigate("/app")}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="font-extrabold text-xl text-gray-900">
                {currentT.scanResult}
              </h2>

              <div className="w-12" />

            </div>

            {/* CONTENT */}

            <div className="flex-1 overflow-y-auto pb-10 flex flex-col items-center p-6 md:p-10">

              <div className="w-full max-w-2xl flex flex-col gap-6 md:gap-8">

                {/* RESULT CARD */}

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 relative overflow-hidden text-center flex flex-col items-center">

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      delay: 0.2
                    }}
                    className="w-24 h-24 md:w-32 md:h-32 bg-green-50 rounded-full flex items-center justify-center mb-6 text-green-500 shadow-inner"
                  >
                    <CheckCircle size={48} className="md:w-16 md:h-16" />
                  </motion.div>

                  <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-2">
                    {currentT.negative}
                  </h1>

                  <p className="text-gray-500 text-base md:text-lg font-medium mb-8">
                    {currentT.negativeDesc}
                  </p>

                  <div className="w-full bg-gray-50 rounded-2xl p-5 md:p-6 flex justify-between items-center border border-gray-100">

                    <span className="text-gray-600 font-bold text-sm md:text-base">
                      {currentT.confidence}
                    </span>

                    <span className="text-pink-500 font-extrabold text-xl md:text-2xl">
                      {currentT.demo}
                    </span>

                  </div>

                </div>

                {/* RECOMMENDATION */}

                <div>

                  <h3 className="font-bold text-gray-900 mb-4 ml-2 text-lg">
                    {currentT.recommendation}
                  </h3>

                  <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex gap-5 md:gap-6 items-start">

                    <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-[#D94F8A]">
                      <AlertTriangle size={28} />
                    </div>

                    <div>
                      <p className="text-base md:text-lg text-gray-700 leading-relaxed font-medium">
                        {currentT.recommendationDesc}
                      </p>
                    </div>

                  </div>

                </div>

                {/* ACTION BUTTONS */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                  <motion.button
                    whileHover={{ y: -2 }}
                    onClick={() => navigate("/app/consult")}
                    className="w-full py-5 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 shadow-sm flex justify-between items-center px-6 hover:bg-gray-50 transition-all"
                  >

                    <div className="flex items-center gap-4">

                      <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
                        <Stethoscope size={24} />
                      </div>

                      <span className="text-base">
                        {currentT.consult}
                      </span>

                    </div>

                    <ChevronRight size={20} className="text-gray-400" />

                  </motion.button>

                  <motion.button
                    whileHover={{ y: -2 }}
                    onClick={() => navigate("/app/consult")}
                    className="w-full py-5 bg-white border border-gray-200 rounded-2xl font-bold text-gray-700 shadow-sm flex justify-between items-center px-6 hover:bg-gray-50 transition-all"
                  >

                    <div className="flex items-center gap-4">

                      <div className="p-2 bg-purple-50 rounded-xl text-purple-500">
                        <MapPin size={24} />
                      </div>

                      <span className="text-base">
                        {currentT.hospital}
                      </span>

                    </div>

                    <ChevronRight size={20} className="text-gray-400" />

                  </motion.button>

                </div>

                {/* SAVE RESULT */}

                <div className="mt-8">

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/app/history")}
                    className="w-full py-5 text-lg bg-gradient-to-r from-[#F7A8C4] to-[#D94F8A] text-white rounded-2xl font-bold shadow-lg shadow-pink-200/50 hover:shadow-xl transition-all"
                  >
                    {currentT.save}
                  </motion.button>

                </div>

              </div>

            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
