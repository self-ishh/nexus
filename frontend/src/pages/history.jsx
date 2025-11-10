import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import HomeIcon from "@mui/icons-material/Home";
import { IconButton, Box } from "@mui/material";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);
  const routeTo = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch {
        setError("Failed to fetch meeting history");
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #f3f0f8 0%, #e7d8f5 100%)",
        color: "#222",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Home Button */}
      <IconButton
        onClick={() => routeTo("/home")}
        sx={{
          position: "absolute",
          top: "1rem",
          left: "1rem",
          color: "#7737a1",
          backgroundColor: "rgba(119,55,161,0.08)",
          "&:hover": {
            backgroundColor: "rgba(119,55,161,0.15)",
          },
        }}
      >
        <HomeIcon />
      </IconButton>

      {/* Scrollable Content */}
      <Box
        sx={{
          overflowY: "auto",
          height: "100%",
          padding: "5rem 2rem 2rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : meetings.length === 0 ? (
          <Typography variant="h6" textAlign="center">
            No meeting history found.
          </Typography>
        ) : (
          meetings.map((e, i) => (
            <Card
              key={i}
              variant="outlined"
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(119,55,161,0.25)",
                color: "#222",
                borderRadius: "0.75rem",
                padding: "0.75rem",
                minHeight: "120px",
                display: "flex",
                alignItems: "center",
                boxShadow: "0 6px 18px rgba(119,55,161,0.1)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 8px 22px rgba(119,55,161,0.2)",
                },
              }}
            >
              <CardContent sx={{ width: "100%" }}>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 600,
                    mb: 0.5,
                    color: "#4a2c70",
                  }}
                >
                  Meeting Code: {e.meetingCode}
                </Typography>
                <Typography sx={{ mb: 1, color: "#5b5b5b" }}>
                  Date: {formatDate(e.date)}
                </Typography>
                <Typography sx={{ color: "#7b7b7b" }}>Host: You</Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}
