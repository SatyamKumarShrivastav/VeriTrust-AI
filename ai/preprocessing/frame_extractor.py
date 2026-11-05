"""
VeriTrust AI — AI Frame Preprocessing Service
Extracts video frames, validates dimensions, detects bounding facial boxes using OpenCV,
and normalizes frame tensors for model inference.
"""
import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class VideoPreprocessor:
    def __init__(self, target_size: Tuple[int, int] = (224, 224)):
        self.target_size = target_size
        # Load OpenCV default Haar cascade for face localization
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )

    def extract_keyframes(
        self,
        video_path: str,
        sample_interval: int = 10,
        max_frames: int = 30,
    ) -> List[Dict[str, Any]]:
        """
        Extract spaced video frames using OpenCV chunking.
        Returns a list of dicts with frame index, timestamp, raw image, and cropped face.
        """
        path = Path(video_path)
        if not path.exists():
            raise FileNotFoundError(f"Video file not found at: {video_path}")

        cap = cv2.VideoCapture(str(path))
        if not cap.isOpened():
            raise ValueError(f"Cannot decode video stream: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        frames = []
        frame_idx = 0
        extracted = 0

        while cap.isOpened() and extracted < max_frames:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_interval == 0:
                timestamp_ms = int((frame_idx / fps) * 1000)

                # Convert to grayscale for face detection
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=4, minSize=(30, 30)
                )

                face_crop = None
                face_detected = False
                if len(faces) > 0:
                    x, y, w, h = faces[0]
                    face_crop = frame[y : y + h, x : x + w]
                    face_crop = cv2.resize(face_crop, self.target_size)
                    face_detected = True
                else:
                    face_crop = cv2.resize(frame, self.target_size)

                # Normalize to [0, 1] range float32
                normalized_tensor = face_crop.astype(np.float32) / 255.0

                frames.append({
                    "frame_index": frame_idx,
                    "timestamp_ms": timestamp_ms,
                    "face_detected": face_detected,
                    "normalized_tensor": normalized_tensor,
                })
                extracted += 1

            frame_idx += 1

        cap.release()
        return frames

