// components/Clock.js
import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div style={{
      textAlign: "center",
      fontSize: "1.5rem",
      fontWeight: "bold",
      padding: "10px",
      backgroundColor: "#f0f0f0",
      borderBottom: "1px solid #ccc"
    }}>
      {formatTime(time)}
    </div>
  );
}
