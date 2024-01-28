import { useEffect, useRef, useState } from "react";
import { NormalizedLandmark } from "@mediapipe/hands";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks, lerp } from "@mediapipe/drawing_utils";
import { TetrisApi } from "./TetrisWrapper";

function useHands(inputVideoRef: React.RefObject<HTMLVideoElement>) {
  const [indexFingerLandmark, setIndexFingerLandmark] =
    useState<NormalizedLandmark>();

  const [closedFist, setClosedFist] = useState(false);

  const [loaded, setLoaded] = useState(false);

  const gestureRecognizerRef = useRef<GestureRecognizer>();

  useEffect(() => {
    (async () => {
      if (!inputVideoRef.current) return;

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

      const getGesture = async () => {
        if (!gestureRecognizerRef.current || !inputVideoRef.current) return;

        const result = gestureRecognizerRef.current.recognizeForVideo(
          inputVideoRef.current,
          performance.now()
        );

        if (result.gestures[0]) {
          for (const category of result.gestures[0]) {
            if (category.categoryName === "Closed_Fist") {
              console.log("closed fist");
              setClosedFist(true);
            } else {
              setClosedFist(false);
            }
          }
        }
        for (const multiHandLandmarks of result.landmarks) {
          // set index finger
          const newIndexFingerLandmark = multiHandLandmarks[8];
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
        requestAnimationFrame(getGesture);
      };
      inputVideoRef.current.addEventListener("loadeddata", () => {
        setLoaded(true);
        getGesture();
      });
    })();
  }, []);

  return { indexFingerLandmark, loaded, closedFist };
}

const HandsContainer = ({
  tetris,
}: {
  tetris: React.MutableRefObject<TetrisApi>;
}) => {
  const inputVideoRef = useRef<HTMLVideoElement>(null!);

  const { loaded, indexFingerLandmark, closedFist } = useHands(inputVideoRef);

  const rotationTimeoutRef = useRef<number>();

  useEffect(() => {
    // split the index finger into 10 parts
    if (closedFist) {
      tetris.current.moveDown();
      console.log("moving down");
    } else if (indexFingerLandmark) {
      if (indexFingerLandmark.x < 0.3) {
        tetris.current.moveRight(); // camera is flipped
      } else if (indexFingerLandmark.x > 0.7) {
        tetris.current.moveLeft(); // camera is flipped
      } else if (indexFingerLandmark.y < 0.3) {
        tetris.current.rotate();
      }
    }
  }, [indexFingerLandmark, closedFist]);

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
          // style={{ opacity: "0", position: "fixed" }}
          autoPlay
          playsInline
          ref={inputVideoRef}
        />
        {/* <canvas ref={canvasRef} /> */}
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
