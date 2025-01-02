import { useState, useRef } from 'react';
import Webcam from 'react-webcam';

export const useCamera = () => {
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const capturePhoto = () => {
    return webcamRef.current?.getScreenshot();
  };

  return {
    showCamera,
    setShowCamera,
    webcamRef,
    capturePhoto
  };
};