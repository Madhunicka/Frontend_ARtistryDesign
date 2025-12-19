import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

export interface CameraBackgroundHandle {
    getVideoElement: () => HTMLVideoElement | null;
}

const CameraBackground = forwardRef<CameraBackgroundHandle, {}>((props, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useImperativeHandle(ref, () => ({
        getVideoElement: () => videoRef.current
    }));

    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                const constraints = {
                    video: {
                        facingMode: "environment", // Use back camera
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: false
                };

                stream = await navigator.mediaDevices.getUserMedia(constraints);

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().catch(e => console.error("Play error:", e));
                    };
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Camera permission is required for Magic Window mode.");
            }
        };

        startCamera();

        return () => {
            // Cleanup stream
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <video
                ref={videoRef}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full object-cover"
                playsInline // Critical for iOS
                muted
                autoPlay
            />
        </div>
    );
});

CameraBackground.displayName = 'CameraBackground';

export default CameraBackground;
