import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  text = 'continue_with',
}: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID')) {
    return (
      <div className="rounded-xl border border-black/10 bg-stone-50 px-4 py-3 text-center text-xs text-black/50">
        Google Sign-In: set <code className="font-mono">VITE_GOOGLE_CLIENT_ID</code> in{" "}
        <code className="font-mono">.env</code>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <GoogleLogin
        onSuccess={(res: CredentialResponse) => {
          if (res.credential) onSuccess(res.credential);
        }}
        onError={() => onError?.()}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        width="100%"
      />
    </div>
  );
}
