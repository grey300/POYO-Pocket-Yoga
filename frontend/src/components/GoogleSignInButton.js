import React, { useEffect, useRef } from 'react';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

// Loads Google Identity Services once and renders the official
// "Sign in with Google" button. `onCredential` receives the ID token
// (a JWT) which the backend verifies at POST /api/auth/google.
export default function GoogleSignInButton({ onCredential, onError }) {
    const divRef = useRef(null);

    useEffect(() => {
        if (!CLIENT_ID || CLIENT_ID === 'your_google_oauth_client_id') {
            return; // not configured — component renders the fallback notice below
        }

        const render = () => {
            if (!window.google || !divRef.current) return;
            window.google.accounts.id.initialize({
                client_id: CLIENT_ID,
                callback: (response) => {
                    if (response?.credential) onCredential(response.credential);
                    else if (onError) onError('No credential returned from Google');
                },
            });
            window.google.accounts.id.renderButton(divRef.current, {
                theme: 'outline',
                size: 'large',
                width: 320,
                text: 'continue_with',
            });
        };

        const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
        if (existing && window.google) {
            render();
            return;
        }

        const script = document.createElement('script');
        script.src = GSI_SRC;
        script.async = true;
        script.defer = true;
        script.onload = render;
        script.onerror = () => onError && onError('Failed to load Google Sign-In');
        document.body.appendChild(script);
    }, [onCredential, onError]);

    if (!CLIENT_ID || CLIENT_ID === 'your_google_oauth_client_id') {
        return (
            <p className="text-xs text-gray-400 text-center">
                Google sign-in not configured.
            </p>
        );
    }

    return <div ref={divRef} className="flex justify-center" />;
}
