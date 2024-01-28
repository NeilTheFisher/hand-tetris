import { useEffect, useRef, useState } from "react";
import {
  DrawingUtils,
  FilesetResolver,
  GestureRecognizer,
} from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
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
              "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
            // "https://storage.googleapis.com/mediapipe-tasks/gesture_recognizer/gesture_recognizer.task",
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

        let closedFist = false;
        if (result.gestures[0]) {
          for (const category of result.gestures[0]) {
            if (category.categoryName === "Closed_Fist") {
              closedFist = true;
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

          if (!closedFist) {
            if (indexFingerLandmark) {
              if (indexFingerLandmark.x < 0.3) {
                tetris.current.moveRight(); // camera is flipped
              } else if (indexFingerLandmark.x > 0.7) {
                tetris.current.moveLeft(); // camera is flipped
              } else if (indexFingerLandmark.y < 0.3) {
                tetris.current.rotate();
              }
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
            const drawingUtils = new DrawingUtils(contextRef.current!);

            canvasRef.current!.height = inputVideoRef.current.videoHeight;
            canvasRef.current!.width = inputVideoRef.current.videoWidth;

            drawingUtils.drawConnectors(
              multiHandLandmarks,
              GestureRecognizer.HAND_CONNECTIONS,
              {
                color: isRightHand ? "#00FF00" : "#FF0000",
                lineWidth: 5,
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

  useHands(inputVideoRef, canvasRef, tetris);

  // useEffect(() => {
  //   // split the index finger into 10 parts
  //   if (closedFist) {
  //     tetris.current.moveDown();
  //   } else if (indexFingerLandmark) {
  //     if (indexFingerLandmark.x < 0.3) {
  //       tetris.current.moveRight(); // camera is flipped
  //     } else if (indexFingerLandmark.x > 0.7) {
  //       tetris.current.moveLeft(); // camera is flipped
  //     } else if (indexFingerLandmark.y < 0.3) {
  //       tetris.current.rotate();
  //     }
  //   }
  // }, [indexFingerLandmark, closedFist]);

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
        {/* {indexFingerLandmark && (
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
        )} */}
        <video
          // style={{ opacity: "0", position: "fixed" }}
          autoPlay
          playsInline
          ref={inputVideoRef}
        />
        <canvas ref={canvasRef} />
      </div>
      {/* {!loaded && (
        <div style={{}}>
          <div style={{}}></div>
          <div style={{}}>Loading</div>
        </div>
      )} */}
    </div>
  );
};

export default HandsContainer;
