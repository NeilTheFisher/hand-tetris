import { useEffect, useRef, useState } from "react";
import {
  Results,
  Hands,
  HAND_CONNECTIONS,
  VERSION,
  NormalizedLandmark,
} from "@mediapipe/hands";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";

function useHands(
  inputVideoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  contextRef: React.MutableRefObject<CanvasRenderingContext2D | null>
) {
  // const indexFingerRef = useRef<NormalizedLandmark>();
  const [indexFingerLandmark, setIndexFingerLandmark] =
    useState<NormalizedLandmark>();

  const [loaded, setLoaded] = useState(false);

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
          // const isRightHand = classification.label === "Right";
          const landmarks = results.multiHandLandmarks[i];

          // set index finger
          // indexFingerRef.current = landmarks[8];
          const newIndexFingerLandmark = landmarks[8];
          if (
            newIndexFingerLandmark.x > 1 ||
            newIndexFingerLandmark.x < 0 ||
            newIndexFingerLandmark.y > 1 ||
            newIndexFingerLandmark.y < 0
          ) {
            setIndexFingerLandmark(undefined);
            break;
          }

          setIndexFingerLandmark(newIndexFingerLandmark);

          // drawConnectors(context, landmarks, HAND_CONNECTIONS, {
          //   color: isRightHand ? "#00FF00" : "#FF0000",
          // });
          // drawLandmarks(context, landmarks, {
          //   color: isRightHand ? "#00FF00" : "#FF0000",
          //   fillColor: isRightHand ? "#FF0000" : "#00FF00",
          //   radius: (data) => lerp(data.from!.z!, -0.15, 0.1, 10, 1),
          // });
        }
      }

      context.restore();
    };

    hands.onResults(onResults);

    const loadedDataHandler = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
    video.addEventListener("loadeddata", loadedDataHandler);

    return () => {
      video?.removeEventListener("loadeddata", loadedDataHandler);

      hands.close();
    };
  }, [inputVideoRef.current, canvasRef.current, contextRef.current, setLoaded]);

  return { indexFingerLandmark, loaded };
}

const HandsContainer = () => {
  const inputVideoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  const { loaded, indexFingerLandmark } = useHands(
    inputVideoRef,
    canvasRef,
    contextRef
  );

  // useEffect(() => {
  //   console.log(indexFingerLandmark);
  // }, [indexFingerLandmark]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        {indexFingerLandmark && (
          <div
            style={{
              position: "absolute",
              top: indexFingerLandmark.y * 100 + "%",
              left: indexFingerLandmark.x * 100 + "%",
              width: "20px",
              height: "20px",
              background: "yellow",
              outline: "2px solid black",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>
        )}
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
    </div>
  );
};

export default HandsContainer;
