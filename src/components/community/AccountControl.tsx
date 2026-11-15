import { useEffect, useState, type FormEvent } from 'react';
import { LogIn, LogOut, Mail, UserRound } from 'lucide-react';
import { useCommunity } from './CommunityProvider';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import './community.css';

function message(error: unknown) {
  const code = (error as { code?: string }).code;
  switch (code) {
    case 'auth/popup-closed-by-user': return 'Sign-in cancelled. You can try again whenever you are ready.';
    case 'auth/popup-blocked': return 'Allow pop-ups for this site to use Google sign-in.';
    case 'auth/too-many-requests': return 'Too many attempts. Please wait a little and try again.';
    case 'auth/network-request-failed': return 'Connection interrupted. Please check your network.';
    case 'auth/weak-password': return 'Choose a stronger password with at least 8 characters.';
    case 'auth/operation-not-allowed': return 'This sign-in method is awaiting activation. Please try the other method.';
    case 'auth/unauthorized-domain': return 'Sign-in is awaiting activation for this website address.';
    default: return 'Unable to sign in. Check your details or reset your password.';
  }
}

export default function AccountControl() {
  const { user, loginOpen, setLoginOpen, openLogin, authError } = useCommunity();
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => { setPhotoFailed(false); }, [user?.photoURL]);
  useEffect(() => { if (user?.emailVerified) setLoginOpen(false); }, [user, setLoginOpen]);
  const run = async (action: () => Promise<void>) => {
    setBusy(true); setFeedback('');
    try { await action(); } catch (error) { setFeedback(message(error)); } finally { setBusy(false); }
  };
  const google = () => run(async () => {
    const [{ communityAuth }, sdk] = await Promise.all([import('@/lib/community-auth'), import('firebase/auth')]);
    await sdk.signInWithPopup(communityAuth, new sdk.GoogleAuthProvider());
    setLoginOpen(false);
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get('email') || '').trim();
    const password = String(values.get('password') || '');
    void run(async () => {
      const [{ communityAuth }, sdk] = await Promise.all([import('@/lib/community-auth'), import('firebase/auth')]);
      if (mode === 'reset') {
        await sdk.sendPasswordResetEmail(communityAuth, email);
        setFeedback('If an account exists, a reset link will arrive in your inbox.');
      } else if (mode === 'signup') {
        const credential = await sdk.createUserWithEmailAndPassword(communityAuth, email, password);
        await sdk.updateProfile(credential.user, { displayName: String(values.get('name') || '').trim().slice(0, 40) || 'Reader' });
        await sdk.sendEmailVerification(credential.user);
        setFeedback('Account created. Check your inbox to verify your email before posting or voting.');
      } else {
        await sdk.signInWithEmailAndPassword(communityAuth, email, password);
        setLoginOpen(false);
      }
    });
  };
  const verify = () => run(async () => {
    const [{ communityAuth }, sdk] = await Promise.all([import('@/lib/community-auth'), import('firebase/auth')]);
    if (!communityAuth.currentUser) return;
    await sdk.reload(communityAuth.currentUser);
    await sdk.getIdToken(communityAuth.currentUser, true);
    if (communityAuth.currentUser.emailVerified) { window.location.reload(); return; }
    await sdk.sendEmailVerification(communityAuth.currentUser);
    setFeedback('Verification email sent. Open the link, then choose Check verification.');
  });
  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild><button type="button" className="community-account" aria-label={user ? 'Your account' : 'Reader account'}>
        {user?.photoURL && !photoFailed ? <img src={user.photoURL} alt="" width={28} height={28} referrerPolicy="no-referrer" onError={() => setPhotoFailed(true)} /> : <span className="community-pixel-avatar" aria-hidden="true" />}
      </button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={12} className="community-menu">
        <DropdownMenuLabel>{user ? user.displayName || 'Reader' : 'YOUR READER SPACE'}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user ? <><DropdownMenuItem onSelect={openLogin}><UserRound size={15} />{user.emailVerified ? 'Account' : 'Verify email'}</DropdownMenuItem><DropdownMenuItem onSelect={() => void run(async () => {
          const [{ communityAuth }, sdk] = await Promise.all([import('@/lib/community-auth'), import('firebase/auth')]); await sdk.signOut(communityAuth);
        })}><LogOut size={15} />Sign out</DropdownMenuItem></> : <DropdownMenuItem onSelect={() => { setMode('signin'); setFeedback(''); openLogin(); }}><LogIn size={15} />Sign in / Create account</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
    <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
      <DialogContent className="community-dialog">
        <span className="community-kicker">NIGHT CITY / READERS</span>
        <DialogTitle>{user ? 'You’re part of the conversation.' : mode === 'signup' ? 'Make yourself at home.' : mode === 'reset' ? 'Get back into your account.' : 'A little more than a reader.'}</DialogTitle>
        <DialogDescription>{user ? 'Verified readers can vote, leave a thought and reply to the community.' : 'Keep exploring the journal. Join to vote, discuss ideas and share what you’ve learned.'}</DialogDescription>
        {user ? <>
          <p className="community-account-name">{user.displayName || 'Reader'} · {user.emailVerified ? 'Email verified' : 'Email verification pending'}</p>
          {!user.emailVerified && <button className="community-primary" disabled={busy} onClick={verify}>{busy ? 'Checking…' : 'Check verification / Resend email'}</button>}
          <button className="community-secondary" onClick={() => setLoginOpen(false)}>Back to reading</button>
        </> : <>
          <button type="button" className="community-google" disabled={busy} onClick={google}><span aria-hidden="true">G</span>Continue with Google</button>
          <div className="community-divider"><span>or use your email</span></div>
          <form onSubmit={submit} className="community-auth-form">
            {mode === 'signup' && <label>Display name<input name="name" required maxLength={40} autoComplete="nickname" placeholder="How should we call you?" /></label>}
            <label>Email<input name="email" type="email" required autoComplete="email" placeholder="you@example.com" /></label>
            {mode !== 'reset' && <label>Password<input name="password" type="password" required minLength={mode === 'signup' ? 8 : undefined} maxLength={128} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} /></label>}
            <button type="submit" disabled={busy} className="community-primary"><Mail size={15} />{busy ? 'Connecting…' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Sign in with email'}</button>
          </form>
          <div className="community-auth-links"><button onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setFeedback(''); }}>{mode === 'signup' ? 'Already a reader? Sign in' : 'New here? Create an account'}</button><button onClick={() => { setMode(mode === 'reset' ? 'signin' : 'reset'); setFeedback(''); }}>{mode === 'reset' ? 'Back to sign in' : 'Forgot password?'}</button></div>
          <p className="community-privacy">Your email stays private. Your display name and comments are public. Google and Firebase handle sign-in.</p>
        </>}
        {(feedback || authError) && <p className="community-feedback" role="status">{feedback || authError}</p>}
      </DialogContent>
    </Dialog>
  </>;
}
