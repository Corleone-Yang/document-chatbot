import { getApps, initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDeVHhg9FzGuYN-Bb3lI2kFbPXucg1qKjc",
  authDomain: "document-chatbot-14218.firebaseapp.com",
  projectId: "document-chatbot-14218",
  storageBucket: "document-chatbot-14218.appspot.com",
  messagingSenderId: "699473636926",
  appId: "1:699473636926:web:19516869c83ad45bc82b6f",
  measurementId: "G-PF002WG0QE",
};

let app, auth, analytics;

if (typeof window !== "undefined" && !getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);

  // Only import and initialize analytics on the client side
  if (typeof window.navigator !== "undefined") {
    import("firebase/analytics").then(({ getAnalytics }) => {
      analytics = getAnalytics(app);
    });
  }
}

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { analytics, app, auth, facebookProvider, googleProvider };
