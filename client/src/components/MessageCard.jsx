
import { useRef, useState } from "react";
import { API_BASE, getToken } from "../api.js";

export default function MessageCard({ message, onSelect }) {
  const serviceMessage = message.sender === "Telegram";
  const outgoing = message.sender === "Telegram Support Bot";

  const swipeRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const dragStarted = useRef(false);

  const time = new Date(message.date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
  const [openingMedia, setOpeningMedia] = useState(false);

const handleOpenMedia = async () => {
  if (!message.fileId) return;

  // Open tab immediately so browser popup block na kare
  const newWindow = window.open("", "_blank");

  if (!newWindow) {
    console.error("Popup blocked by browser");
    return;
  }

  try {
    setOpeningMedia(true);

    const response = await fetch(
      `${API_BASE}/telegram/media/${encodeURIComponent(message.fileId)}`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to open media (${response.status})`);
    }

    const blob = await response.blob();

    const fileName = message.fileName || "";
    const extension = fileName.split(".").pop().toLowerCase();

    const mimeTypes = {
      pdf: "application/pdf",

      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",

      mp4: "video/mp4",
      webm: "video/webm",
      mov: "video/quicktime",

      mp3: "audio/mpeg",
      wav: "audio/wav",

      txt: "text/plain",
    };

    const mimeType =
      mimeTypes[extension] ||
      blob.type ||
      "application/octet-stream";

    const typedBlob = new Blob([blob], {
      type: mimeType,
    });

    const url = URL.createObjectURL(typedBlob);

    newWindow.location.href = url;

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);

  } catch (error) {
    console.error("Media open failed:", error);
    newWindow.close();
  } finally {
    setOpeningMedia(false);
  }
};
  const handlePointerDown = (e) => {
    startX.current = e.clientX;
    currentX.current = e.clientX;
    isDragging.current = true;
    dragStarted.current = false;

    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!isDragging.current || !swipeRef.current) return;

    currentX.current = e.clientX;

    const diff = currentX.current - startX.current;

    // Only react to left movement
    if (diff < -5) {
      dragStarted.current = true;

      const moveX = Math.max(diff, -90);

      swipeRef.current.style.transition = "none";
      swipeRef.current.style.transform = `translateX(${moveX}px)`;
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging.current || !swipeRef.current) return;

    const diff = currentX.current - startX.current;

    // Only a real left drag can select the message
    if (dragStarted.current && diff <= -35) {
      onSelect();
    }

    isDragging.current = false;
    dragStarted.current = false;

    // Smooth return
    swipeRef.current.style.transition = "transform 180ms ease";
    swipeRef.current.style.transform = "translateX(0)";

    startX.current = 0;
    currentX.current = 0;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerCancel = (e) => {
    if (!swipeRef.current) return;

    isDragging.current = false;
    dragStarted.current = false;

    swipeRef.current.style.transition = "transform 180ms ease";
    swipeRef.current.style.transform = "translateX(0)";

    startX.current = 0;
    currentX.current = 0;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <div
  className={`message-row ${serviceMessage? "service": outgoing?"outgoing": "incoming"}`}>
      <div className="message-content">

        <div className="message-sender">
          ~{message.sender}
        </div>

        <div
          className="message-swipe-area"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div ref={swipeRef} className="message-bubble">
           {message.mediaType === "document" ? (
    <div className="media-message" onPointerDown={(e) => e.stopPropagation()}onPointerUp={(e) => e.stopPropagation()}onClick={(e) => {e.stopPropagation(); handleOpenMedia();}}>
    <div className="media-icon">📎</div>

    <div className="media-info">
      <div className="media-name">
        {message.fileName || "File"}
      </div>

      <div className="media-label">
        Document
      </div>
    </div>
  </div>
) : (
  <span className="message-text">
    {message.text}
  </span>
)}

            <span className="message-time">
              {time}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}