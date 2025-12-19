'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

interface ModelViewerProps {
    src: string;
    poster?: string;
    alt: string;
    ar?: boolean;
    arModes?: string;
    cameraControls?: boolean;
    autoRotate?: boolean;
    style?: React.CSSProperties;
    placement?: 'floor' | 'wall';
    orientation?: string;
    arScale?: string;
    children?: React.ReactNode;
    onARCapability?: (capable: boolean) => void;
    onARStatus?: (status: string) => void;
    onError?: (error: any) => void;
}

export interface ModelViewerHandle {
    activateAR: () => Promise<void>;
    capturePhoto: () => Promise<void>;
}

const ModelViewer = forwardRef<ModelViewerHandle, ModelViewerProps>(({
    src,
    poster,
    alt,
    ar = true,
    arModes = 'webxr scene-viewer quick-look',
    cameraControls = true,
    autoRotate = false,
    style = { width: '100%', height: '500px' },
    placement = 'floor',
    orientation,
    arScale = 'auto',

    children,
    onARCapability,
    onARStatus,
    onError,
}, ref) => {
    const internalRef = useRef<HTMLElement>(null);

    useImperativeHandle(ref, () => ({
        activateAR: async () => {
            if (internalRef.current) {
                try {
                    // Attempt to call activateAR directly without waiting, to preserve user gesture
                    // @ts-ignore
                    if (typeof internalRef.current.activateAR === 'function') {
                        // @ts-ignore
                        internalRef.current.activateAR();
                    } else {
                        console.error("activateAR method not found. Element might not be upgraded yet.");
                        // Fallback: only wait if absolutely necessary (though this might lose gesture)
                        await customElements.whenDefined('model-viewer');
                        // @ts-ignore
                        if (typeof internalRef.current.activateAR === 'function') {
                            // @ts-ignore
                            internalRef.current.activateAR();
                        } else {
                            throw new Error("AR not supported or element not ready");
                        }
                    }
                } catch (error) {
                    console.error("Error activating AR:", error);
                    throw error; // Propagate error to page
                }
            }
        },
        capturePhoto: async () => {
            if (internalRef.current) {
                try {
                    // @ts-ignore
                    const blob = await internalRef.current.toBlob({ mimeType: 'image/png' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `model-capture-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                } catch (error) {
                    console.error("Error capturing photo:", error);
                }
            }
        }
    }));

    useEffect(() => {
        // Dynamic import to avoid SSR issues with web components
        import('@google/model-viewer');

        const currentRef = internalRef.current;
        if (currentRef && onARStatus) {
            const handleARStatus = (event: any) => {
                onARStatus(event.detail.status);
            };
            // @ts-ignore
            currentRef.addEventListener('ar-status', handleARStatus);

            return () => {
                // @ts-ignore
                currentRef.removeEventListener('ar-status', handleARStatus);
            };
        }
    }, [onARStatus]);

    return (
        <div className="w-full h-full relative">
            {/* @ts-ignore */}
            <model-viewer
                ref={internalRef}
                src={src}
                poster={poster}
                alt={alt}
                ar={ar ? "" : undefined}
                ar-modes={arModes}
                camera-controls={cameraControls ? "" : undefined}
                auto-rotate={autoRotate ? "" : undefined}
                ar-placement={placement}
                ar-scale={arScale}
                orientation={orientation}
                style={style}
                shadow-intensity="1"
                onLoad={(e: any) => {
                    const modelViewer = e.target as any;
                    // Auto-scale to ~1m
                    const { x, y, z } = modelViewer.getDimensions();
                    const maxDim = Math.max(x, y, z);
                    if (maxDim > 0) {
                        const scaleFactor = 1 / maxDim;
                        // Only scale if significantly different from 1
                        if (scaleFactor < 0.5 || scaleFactor > 2) {
                            modelViewer.scale = `${scaleFactor} ${scaleFactor} ${scaleFactor}`;
                        }
                    }

                    if (onARCapability) {
                        onARCapability(modelViewer.canActivateAR);
                    }
                }}
                onError={(e: any) => {
                    console.error("Model Viewer Error Internal:", e);
                    if (onError) onError(e);
                }}
            >
                {children}
                {/* @ts-ignore */}
            </model-viewer>
        </div>
    );
});

ModelViewer.displayName = 'ModelViewer';

export default ModelViewer;
