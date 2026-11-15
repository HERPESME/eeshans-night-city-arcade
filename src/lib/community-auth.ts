import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from './firebase-config';

export const communityApp = getApps().some(app => app.name === 'night-city-community')
  ? getApp('night-city-community') : initializeApp(firebaseConfig, 'night-city-community');
export const communityAuth = getAuth(communityApp);
