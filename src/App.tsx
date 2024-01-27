import { useEffect, useRef, useState } from "react";
import { Results, Hands, HAND_CONNECTIONS, VERSION } from "@mediapipe/hands";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";

const HandsContainer = () => {
  const [loaded, setLoaded] = useState(false);

  const inputVideoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const video = inputVideoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    contextRef.current = canvas.getContext("2d");

    const sendToMediaPipe = async () => {
      await hands.send({ image: video });
      requestAnimationFrame(sendToMediaPipe);
    };

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          height: 1280,
          width: 720,
        },
      });
      video.srcObject = stream;
      sendToMediaPipe();
    })();

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands@${VERSION}/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    const loadedDataHandler = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
    video.addEventListener("loadeddata", loadedDataHandler);
    return () => {
      video?.removeEventListener("loadeddata", loadedDataHandler);
    };
  }, []);

  const onResults = (results: Results) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;

    if (!canvas || !context) return;

    setLoaded(true);

    context.save();

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    if (results.multiHandLandmarks && results.multiHandedness) {
      for (let i = 0; i < results.multiHandLandmarks.length; i++) {
        const classification = results.multiHandedness[i];
        const isRightHand = classification.label === "Right";
        const landmarks = results.multiHandLandmarks[i];
        drawConnectors(context, landmarks, HAND_CONNECTIONS, {
          color: isRightHand ? "#00FF00" : "#FF0000",
        });
        drawLandmarks(context, landmarks, {
          color: isRightHand ? "#00FF00" : "#FF0000",
          fillColor: isRightHand ? "#FF0000" : "#00FF00",
          radius: (data) => lerp(data.from!.z!, -0.15, 0.1, 10, 1),
        });
      }
    }

    context.restore();
  };

  return (
    <div style={{}}>
      <video
        style={{ opacity: "0", position: "fixed" }}
        autoPlay
        ref={inputVideoRef}
      />
      <canvas ref={canvasRef} />
      {!loaded && (
        <div style={{}}>
          <div style={{}}></div>
          <div style={{}}>Loading</div>
        </div>
      )}
    </div>
  );
};

export default HandsContainer;
