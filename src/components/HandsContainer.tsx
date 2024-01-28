import { useEffect, useRef, useState } from "react";
import {
  DrawingUtils,
  FilesetResolver,
  GestureRecognizer,
} from "@mediapipe/tasks-vision";
import { TetrisApi } from "./TetrisWrapper";

function useHands(
  inputVideoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  tetris: React.MutableRefObject<TetrisApi>
) {
  const [loaded, setLoaded] = useState(false);

  const gestureRecognizerRef = useRef<GestureRecognizer>();

  const contextRef = useRef<CanvasRenderingContext2D>();

  useEffect(() => {
    (async () => {
      if (!inputVideoRef.current || !canvasRef.current) return;

      contextRef.current = canvasRef.current.getContext("2d")!;

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
            modelAssetPath:
              // "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
              "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
        }
      );

      const stream = await window.navigator.mediaDevices.getUserMedia({
        video: {
          height: 1280,
          width: 720,
        },
      });
      inputVideoRef.current.srcObject = stream;

      const drawingUtils = new DrawingUtils(contextRef.current);

      const getGesture = () => {
        if (
          !gestureRecognizerRef.current ||
          !inputVideoRef.current ||
          !inputVideoRef.current.videoWidth
        ) {
          requestAnimationFrame(getGesture);
          return;
        }

        const result = gestureRecognizerRef.current.recognizeForVideo(
          inputVideoRef.current,
          performance.now()
        );

        if (result.gestures[0]) {
          for (const category of result.gestures[0]) {
            if (category.categoryName === "Closed_Fist") {
              tetris.current.moveDown();
            }
          }
        }
        // for (const multiHandLandmarks of result.landmarks) {
        for (let i = 0; i < result.landmarks.length; i++) {
          const multiHandLandmarks = result.landmarks[i];
          // set index finger
          const indexFingerLandmark = multiHandLandmarks[8];
          if (
            indexFingerLandmark.x > 1 ||
            indexFingerLandmark.x < 0 ||
            indexFingerLandmark.y > 1 ||
            indexFingerLandmark.y < 0
          ) {
            break;
          }

          if (indexFingerLandmark) {
            if (indexFingerLandmark.x < 0.3) {
              tetris.current.moveRight(); // camera is flipped
            } else if (indexFingerLandmark.x > 0.7) {
              tetris.current.moveLeft(); // camera is flipped
            } else if (indexFingerLandmark.y < 0.3) {
              tetris.current.rotate();
            }
          }

          {
            const isRightHand = i === 0;

            contextRef.current!.save();
            contextRef.current!.clearRect(
              0,
              0,
              canvasRef.current!.width,
              canvasRef.current!.height
            );

            canvasRef.current!.height = inputVideoRef.current.videoHeight;
            canvasRef.current!.width = inputVideoRef.current.videoWidth;

            drawingUtils.drawConnectors(
              multiHandLandmarks,
              GestureRecognizer.HAND_CONNECTIONS,
              {
                color: isRightHand ? "#00FF00" : "#FF0000",
                lineWidth: 2,
              }
            );
            drawingUtils.drawLandmarks(multiHandLandmarks, {
              lineWidth: 2,
              color: isRightHand ? "#00FF00" : "#FF0000",
              // fillColor: isRightHand ? "#FF0000" : "#00FF00",
              // radius: (data) => lerp(data.from!.z!, -0.15, 0.1, 10, 1),
            });

            contextRef.current!.restore();
          }
        }
        requestAnimationFrame(getGesture);
      };
      inputVideoRef.current.addEventListener("loadeddata", () => {
        setLoaded(true);
        getGesture();
      });
    })();
  }, []);

  return { loaded };
}

const HandsContainer = ({
  tetris,
}: {
  tetris: React.MutableRefObject<TetrisApi>;
}) => {
  const inputVideoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const { loaded } = useHands(inputVideoRef, canvasRef, tetris);

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
          transform: "scaleX(-1)",
        }}
      >
        <video autoPlay playsInline ref={inputVideoRef} />
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", top: "0", left: "0" }}
        />
      </div>
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
