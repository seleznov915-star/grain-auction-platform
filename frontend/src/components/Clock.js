import { useEffect, useState } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      background: "red",
      color: "#fff",
      fontSize: "20px",
      textAlign: "center",
      padding: "12px",
      zIndex: 9999,
      position: "relative"
    }}>
      TEST CLOCK — {time.toLocaleTimeString()}
    </div>
  );
}
