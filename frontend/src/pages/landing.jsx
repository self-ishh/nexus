import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import styles from "../styles/landing.module.css";

export default function LandingPage() {
  const router = useNavigate();
  return (
    <div className={styles.landingPageContainer}>
      <nav>
        <div className={styles.navHeader}>
          <h2>Nexus</h2>
        </div>
        <div className={styles.navList}>
          <p
            onClick={() => {
              router("/rhuiuhr");
            }}
          >
            Join as Guest
          </p>
          <p
            onClick={() => {
              router("/auth");
            }}
          >
            Sign Up
          </p>

          <div role="button">
            <p onClick={() => router("/auth")}>Login</p>
          </div>
        </div>
      </nav>

      <div className={styles.landingMainContainer}>
        <div>
          <h1>
            Stay in sync. Stay in
            <span style={{ color: "#ab27f7ff" }}> Nexus.</span>
          </h1>
          <p>Distance ends where Nexus begins.</p>
          <div role="button">
            <Link to={"/auth"}>Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png" alt="Meeting" />
        </div>
      </div>
    </div>
  );
}
