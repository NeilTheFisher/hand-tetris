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
  const [indexFingerLandmark, setIndexFingerLandmark] =
    useState<NormalizedLandmark>();

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
            console.log(category.categoryName);
            // if (category.categoryName === "Closed_Fist") {
            // }
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
          // style={{ opacity: "0", position: "fixed" }}
          autoPlay
          playsInline
          ref={(elem) => {
            inputVideoRef.current = elem!;
          }}
        />
        {/* <canvas ref={canvasRef} /> */}
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
