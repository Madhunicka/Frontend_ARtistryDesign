'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ModelViewer, { ModelViewerHandle } from '../../../components/ModelViewer';
import CameraBackground, { CameraBackgroundHandle } from '../../../components/CameraBackground';
import { API_BASE_URL, STATIC_FILE_URL, FRONTEND_URL } from '../../../utils/config';

interface Product {
    _id: string;
    name: string;
    category: string;
    thumbnailUrl: string;
    modelUrl: string;
}

export default function ProductPage() {
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [showQR, setShowQR] = useState(false);
    const [isSecure, setIsSecure] = useState(true);
    const [arSupported, setArSupported] = useState(true); // Default to true until checked
    const [isARActive, setIsARActive] = useState(false);
    const [isMagicWindow, setIsMagicWindow] = useState(false);
    const [arError, setArError] = useState<string | null>(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
    // Default 180 flip for wall items might help initial placement
    useEffect(() => {
        if (product?.category === 'wall') {
            setRotation({ x: 0, y: 180, z: 0 });
        }
    }, [product]);

    const modelViewerRef = useRef<ModelViewerHandle>(null);
    const cameraRef = useRef<CameraBackgroundHandle>(null);

    useEffect(() => {
        setIsSecure(window.isSecureContext);
        setArError(null); // Clear error on new product load
        if (params.id) {
            fetchProduct(params.id as string);
        }
    }, [params.id]);

    const fetchProduct = async (id: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/products`);
            const found = response.data.find((p: Product) => p._id === id);
            setProduct(found || null);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching product:', error);
            setLoading(false);
        }
    };

    const updateRotation = (axis: 'x' | 'y' | 'z', delta: number) => {
        setRotation(prev => ({
            ...prev,
            [axis]: (prev[axis] + delta) % 360
        }));
    };

    const handleCapture = async () => {
        if (isMagicWindow && cameraRef.current && modelViewerRef.current) {
            try {
                // Composite Capture Logic
                const videoEl = cameraRef.current.getVideoElement();
                const modelViewerEl = document.querySelector('model-viewer') as any; // Access DOM element directly to get canvas if possible, or use catch

                if (!videoEl || !modelViewerEl) return;

                const canvas = document.createElement('canvas');
                canvas.width = videoEl.videoWidth;
                canvas.height = videoEl.videoHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                // 1. Draw Video
                ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

                // 2. Draw Model
                // We need to get the model as an image. toBlob gives us a blob.
                const blob = await modelViewerEl.toBlob({ mimeType: 'image/png' });
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => {
                    // Draw image centered or scaled to fit? 
                    // model-viewer capture is usually the size of the viewer.
                    // We need to map the viewer size to the video size.
                    // For simplicity, let's draw it full cover or contain.
                    // Actually, model-viewer toBlob captures exactly what's rendered. 
                    // If the viewer is fullscreen effectively (in magic window), we draw it full screen.

                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // 3. Download
                    const link = document.createElement('a');
                    link.download = `ar-capture-${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();

                    URL.revokeObjectURL(url);
                };
                img.src = url;

            } catch (e) {
                console.error("Magic capture failed:", e);
                alert("Capture failed.");
            }
        } else if (modelViewerRef.current) {
            try {
                await modelViewerRef.current.capturePhoto();
            } catch (e) {
                console.error("Could not capture photo:", e);
                alert("Could not capture photo.");
            }
        }
    };

    const handleARClick = async () => {
        setArError(null);
        if (window.innerWidth > 768) {
            // Desktop: Show QR Code
            setShowQR(true);
        } else {
            // Mobile: Trigger AR directly
            if (modelViewerRef.current) {
                try {
                    await modelViewerRef.current.activateAR();
                } catch (e: any) {
                    console.error("Could not activate AR:", e);
                    setArError(e.message || "Could not launch AR session.");
                    // Fallback to Magic Window if AR fails hard
                    setIsMagicWindow(true);
                }
            } else {
                console.warn("Model Viewer ref is null");
                setArError("Internal Error: AR Component not ready.");
            }
        }
    };

    const handleLoadError = (event: any) => {
        console.error("Model failed to load:", event);
        const detail = event.detail;
        let msg = "Failed to load 3D model.";
        if (detail && detail.type === 'loadfailure') {
            msg = "Model file could not be loaded or is invalid.";
        }
        setArError(msg);
    };

    // ... (loading and error checks remain same)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F8FB]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A47A3]"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F8FB]">
                <h1 className="text-2xl font-bold text-[#1E1E1E] mb-4">Product not found</h1>
                <Link href="/" className="text-[#4A47A3] hover:underline font-medium">
                    Back to Collection
                </Link>
            </div>
        );
    }

    const placement = product.category === 'wall' ? 'wall' : 'floor';
    const productUrl = `${FRONTEND_URL}/product/${product._id}`;

    return (
        <main className="min-h-screen bg-[#1C1B29] flex flex-col relative overflow-hidden">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent">
                <a href="/" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </a>
                <span className="px-4 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase border border-white/10">
                    {placement === 'wall' ? 'Wall Placement' : 'Floor Placement'}
                </span>
            </header>

            {/* AR Viewer Area */}
            <div className="flex-1 relative w-full h-full">
                {isMagicWindow && <CameraBackground ref={cameraRef} />}

                <div className="absolute inset-0 z-10">
                    <ModelViewer
                        key={product._id}
                        ref={modelViewerRef}
                        src={`${STATIC_FILE_URL}${product.modelUrl}`}
                        poster={`${STATIC_FILE_URL}${product.thumbnailUrl}`}
                        alt={`3D model of ${product.name}`}
                        placement={placement}
                        orientation={placement === 'wall' ? `${rotation.x}deg ${rotation.y}deg ${rotation.z}deg` : undefined}
                        arScale="auto"
                        // Remove 'scene-viewer' to prevent Play Store redirect on unsupported Androids.
                        // This forces a failure if WebXR isn't available, triggering our Magic Window fallback.
                        arModes="webxr quick-look"
                        style={{
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            backgroundColor: 'transparent',
                            '--poster-color': 'transparent'
                        } as React.CSSProperties}
                        onARCapability={(capable) => setArSupported(capable)}
                        onARStatus={(status) => {
                            // status can be 'not-presenting', 'session-started', 'object-placed', etc.
                            setIsARActive(status === 'session-started' || status === 'object-placed');
                        }}
                        onError={handleLoadError}
                    >
                        {/* In-Viewer Controls */}
                        {/* In-Viewer Controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col gap-2 bg-black/60 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                            {/* Rotate 90 shortcut for perpendicular fix */}
                            <div className="flex justify-center mb-1 gap-2">
                                {/* Show capture if NOT using WebXR AR (so show in 3D mode AND Magic Window) */}
                                {!isARActive && (
                                    <button onClick={handleCapture} className="bg-white/20 p-2 rounded-full text-white hover:bg-white/40 transition-colors" title="Capture Photo">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                )}
                                <button onClick={() => updateRotation('y', 90)} className="bg-[#4A47A3] px-3 py-1 rounded-full text-white text-xs font-bold hover:bg-[#3d3a8a] flex items-center">
                                    Rotate 90°
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase">Turn</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => updateRotation('y', -45)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">↺</button>
                                        <button onClick={() => updateRotation('y', 45)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">↻</button>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase">Tilt</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => updateRotation('x', -45)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">▼</button>
                                        <button onClick={() => updateRotation('x', 45)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">▲</button>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-bold text-gray-300 uppercase">Spin</span>
                                    <div className="flex gap-1">
                                        <button onClick={() => updateRotation('z', -45)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">↶</button>
                                        <button onClick={() => updateRotation('z', 45)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 transition-colors">↷</button>
                                    </div>
                                </div>
                            </div>

                            {isMagicWindow && (
                                <button onClick={() => setIsMagicWindow(false)} className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors font-bold border border-red-500/30 rounded px-2 py-1">
                                    Exit Magic Window
                                </button>
                            )}

                            <button onClick={() => setRotation({ x: 0, y: 180, z: 0 })} className="mt-2 text-xs text-gray-400 hover:text-white transition-colors">
                                Reset Orientation
                            </button>
                        </div>
                    </ModelViewer>
                </div>

                {/* Overlay Instructions */}
                <div className="absolute bottom-32 left-0 right-0 text-center pointer-events-none z-10 flex flex-col items-center gap-2">
                    {!isSecure && (
                        <div className="bg-red-500/80 text-white px-4 py-2 rounded-lg backdrop-blur-md text-xs font-bold border border-white/20 shadow-lg max-w-xs">
                            ⚠️ AR Controls require HTTPS. Controls hidden in insecure mode.
                        </div>
                    )}
                    {isMagicWindow && (
                        <div className="bg-blue-500/80 text-white px-4 py-2 rounded-lg backdrop-blur-md text-xs font-bold border border-white/20 shadow-lg max-w-xs">
                            Magic Window Mode Active
                        </div>
                    )}
                    <div className="inline-block bg-black/60 text-white px-6 py-3 rounded-full backdrop-blur-md text-sm font-medium border border-white/10 shadow-lg">
                        {placement === 'wall' ? 'Point camera at a vertical surface' : 'Point camera at a flat floor surface'}
                    </div>
                    {arError && (
                        <div className="bg-red-600/90 text-white px-6 py-3 rounded-xl backdrop-blur-md text-sm font-bold border border-white/20 shadow-xl max-w-sm mt-2 animate-pulse">
                            Error: {arError}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-8 z-20">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-[#FFB26B] font-bold text-xs uppercase tracking-wider mb-2">{product.category}</p>
                            <h1 className="text-3xl font-bold text-[#1E1E1E]">{product.name}</h1>
                        </div>
                        <div className="flex flex-col gap-2">
                            {/* Controls moved to AR view */}
                        </div>
                    </div>

                    <button
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-3 transition-all transform ${arSupported
                            ? 'bg-[#4A47A3] text-white hover:bg-[#3d3a8a] hover:shadow-xl hover:-translate-y-1'
                            : 'bg-teal-600 text-white hover:bg-teal-700 hover:shadow-xl hover:-translate-y-1'
                            }`}
                        onClick={arSupported ? handleARClick : () => setIsMagicWindow(true)}
                    >
                        {arSupported ? (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                                </svg>
                                View in AR Space
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                View in Magic Window (No AR)
                            </>
                        )}
                    </button>

                    {arSupported && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setIsMagicWindow(true)}
                                className="text-xs text-[#6F6F6F] underline hover:text-[#4A47A3] transition-colors"
                            >
                                Having trouble with AR? Try Magic Window
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setShowQR(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <h3 className="text-xl font-bold text-[#1E1E1E] mb-2">Experience in AR</h3>
                        <p className="text-[#6F6F6F] mb-6 text-sm">
                            Scan this QR code with your mobile device to view this item in your space.
                        </p>

                        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-inner inline-block mb-4">
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(productUrl)}`}
                                alt="Product QR Code"
                                className="w-48 h-48"
                            />
                        </div>

                        <p className="text-xs text-gray-400">
                            Ensure your mobile device is connected to the same Wi-Fi network.
                        </p>
                    </div>
                </div>
            )}
        </main>
    );
}
