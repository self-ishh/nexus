import { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import styles from "../styles/home.module.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "../contexts/AuthContext";

function HomeComponent() {
  let navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [error, setError] = useState(false);

  const { addToUserHistory } = useContext(AuthContext);

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) {
      setError(true);
      return;
    }

    setError(false);
    await addToUserHistory(meetingCode);
    navigate(`/${meetingCode}`);
  };

  return (
    <>
      <div className={styles.navBar}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h2>Nexus</h2>
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => {
              navigate("/history");
            }}
          >
            <RestoreIcon />
          </IconButton>

          <span
            onClick={() => {
              navigate("/history");
            }}
            style={{ cursor: "pointer", marginRight: "10px" }}
          >
            <p>History</p>
          </span>

          <Button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/auth");
            }}
            style={{ marginTop: "6px" }}
          >
            <p>Logout</p>
          </Button>
        </div>
      </div>

      <div className={styles.meetContainer}>
        <div className={styles.leftPanel}>
          <div>
            <h2>Seamless meetings. Zero distance. Pure connection.</h2>

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <TextField
                onChange={(e) => setMeetingCode(e.target.value)}
                id="outlined-basic"
                label="Meeting Code"
                variant="outlined"
                error={error}
                helperText={error ? "Meeting code is required" : ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleJoinVideoCall();
                  }
                }}
              />
              <Button onClick={handleJoinVideoCall} variant="contained">
                Join
              </Button>
            </div>
          </div>
        </div>
        <div className={styles.rightPanel}>
          <img srcSet="/logo3.png" alt="" />
        </div>
      </div>
    </>
  );
}

export default withAuth(HomeComponent);
