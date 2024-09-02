"use client";

import { signInWithPopup } from "firebase/auth";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth, facebookProvider, googleProvider } from "../../lib/firebase";
import styles from "./SignIn.module.css";

export default function SignIn() {
  const router = useRouter();
  const [error, setError] = useState(null);

  const handleSignIn = async (provider) => {
    try {
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      console.error(`Error signing in`, error);
      setError(`Failed to sign in. Please try again.`);
    }
  };

  return (
    <div className={styles.container}>
      <video autoPlay loop muted className={styles.backgroundVideo}>
        <source src="/videos/SignIn.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={styles.overlay} />
      <header className={styles.header}>
        <h1>DocTelligence</h1>
        <Link href="https://corleoneyang.dev/" className={styles.contactLink}>
          CONTACT ME <span className={styles.arrow}>→</span>
        </Link>
      </header>
      <main className={styles.main}>
        <h2 className={styles.title}>Smart Document Chatbot</h2>
        <p className={styles.description}>
          Our system builds on traditional document management systems by
          integrating advanced artificial intelligence technologies. This allows
          for faster identification of documents and provides actionable
          insights for document management. It also supports interconnectivity
          and visualization across multiple devices.
        </p>
        <div className={styles.buttonContainer}>
          <button
            onClick={() => handleSignIn(googleProvider)}
            className={`${styles.signInButton} ${styles.googleButton}`}
          >
            <Image
              src="/icons/google.png"
              alt="Google"
              width={20}
              height={20}
            />
            Continue with Google
          </button>
          <button
            onClick={() => handleSignIn(facebookProvider)}
            className={`${styles.signInButton} ${styles.facebookButton}`}
          >
            <Image
              src="/icons/facebook.png"
              alt="Facebook"
              width={20}
              height={20}
            />
            Continue with Facebook
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    </div>
  );
}
