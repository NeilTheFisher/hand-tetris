import { clamp } from "@mediapipe/drawing_utils";
import {
  DrawingUtils,
  FilesetResolver,
  GestureRecognizer,
} from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import { FlappyBirdGameApi } from "./FlappyBirdGame";
import { TetrisApi } from "./TetrisWrapper";

function useHands(
  inputVideoRef: React.RefObject<HTMLVideoElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  {
    tetris,
    flappyBird,
  }: {
    tetris?: React.RefObject<TetrisApi>;
    flappyBird?: React.RefObject<FlappyBirdGameApi>;
  }
) {
  const [loaded, setLoaded] = useState(false);

  const gestureRecognizerRef = useRef<GestureRecognizer>();

  const contextRef = useRef<CanvasRenderingContext2D>();

  const loadedFlagRef = useRef(false);

  useEffect(() => {
    (async () => {
      if (!inputVideoRef.current || !canvasRef.current) return;

      if (loadedFlagRef.current) return;
      loadedFlagRef.current = true;

      contextRef.current = canvasRef.current.getContext("2d")!;

      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
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
          width: 640,
          height: 480,
          // width: 1280,
          // height: 960,
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
              if (tetris?.current) {
                tetris.current.moveDown();
              }
            }
          }
        }
        // for (const multiHandLandmarks of result.landmarks) {
        if (result.landmarks.length === 0) {
          contextRef.current!.clearRect(
            0,
            0,
            canvasRef.current!.width,
            canvasRef.current!.height
          );

          requestAnimationFrame(getGesture);
          return;
        }
        for (let i = 0; i < result.landmarks.length; i++) {
          const multiHandLandmarks = result.landmarks[i];
          // set index finger
          const indexFingerLandmark = multiHandLandmarks[8];

          if (indexFingerLandmark) {
            const x = clamp(indexFingerLandmark.x, 0, 1);
            const y = clamp(indexFingerLandmark.y, 0, 1);
            if (tetris?.current) {
              if (x < 0.3) {
                tetris.current.moveRight(); // camera is flipped
              } else if (x > 0.7) {
                tetris.current.moveLeft(); // camera is flipped
              } else if (y < 0.3) {
                tetris.current.rotate();
              }
            } else if (flappyBird?.current) {
              if (y < 0.3) {
                flappyBird.current.flapUp();
              } else {
                flappyBird.current.flapDown();
              }
            }
          }

          {
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
                color: "#00FFBB",
                lineWidth: 2,
              }
            );
            drawingUtils.drawLandmarks(multiHandLandmarks, {
              lineWidth: 2,
              color: "#00FFBB",
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

    return () => {
      gestureRecognizerRef.current?.close();
    };
  }, [tetris, flappyBird]);

  return { loaded };
}

const HandsContainer = ({
  tetris,
  flappyBird,
}: {
  tetris?: React.RefObject<TetrisApi>;
  flappyBird?: React.RefObject<FlappyBirdGameApi>;
}) => {
  const inputVideoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);

  const { loaded } = useHands(inputVideoRef, canvasRef, { tetris, flappyBird });

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
          lineHeight: "0",
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
