import 'react';

declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                src?: string;
                poster?: string;
                alt?: string;
                ar?: boolean | string;
                'ar-modes'?: string;
                'ar-scale'?: string;
                'ar-placement'?: string;
                'camera-controls'?: boolean | string;
                'auto-rotate'?: boolean | string;
                'shadow-intensity'?: string | number;
                orientation?: string;
                ref?: any;
                style?: React.CSSProperties | any;
                onLoad?: (e: any) => void;
                onError?: (e: any) => void;
                [key: string]: any;
            };
        }
    }
}
