import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { mergeRefs } from "react-merge-refs";
import { debounce } from "../utils/debounce";

const upKeyEvent = new KeyboardEvent("keydown", {
  key: "ArrowUp",
  code: "ArrowUp",
  keyCode: 38,
  which: 38,
  shiftKey: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
});

const downKeyEvent = new KeyboardEvent("keydown", {
  key: "ArrowDown",
  code: "ArrowDown",
  keyCode: 40,
  which: 40,
  shiftKey: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
});

const leftKeyEvent = new KeyboardEvent("keydown", {
  key: "ArrowLeft",
  code: "ArrowLeft",
  keyCode: 37,
  which: 37,
  shiftKey: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
});

const rightKeyEvent = new KeyboardEvent("keydown", {
  key: "ArrowRight",
  code: "ArrowRight",
  keyCode: 39,
  which: 39,
  shiftKey: false,
  ctrlKey: false,
  altKey: false,
  metaKey: false,
});

export type TetrisApi = {
  moveRight: () => void;
  moveLeft: () => void;
  moveDown: () => void;
  rotate: () => void;
};

const TetrisWrapper = forwardRef<TetrisApi>((_props, ref) => {
  const iframeRef = useRef<HTMLIFrameElement>(null!);
  const iframeRef2 = useRef<HTMLIFrameElement>(null);

  const wsRef = useRef<WebSocket>();

  const handleRef = useRef<TetrisApi>(null!);
  useImperativeHandle(mergeRefs([ref, handleRef]), () => ({
    moveRight: debounce(() => {
      wsRef.current?.send("moveRight");
      iframeRef.current.contentWindow!.document.dispatchEvent(rightKeyEvent);
    }, 0),
    moveLeft: debounce(() => {
      wsRef.current?.send("moveLeft");
      iframeRef.current.contentWindow!.document.dispatchEvent(leftKeyEvent);
    }, 0),
    moveDown: debounce(() => {
      wsRef.current?.send("moveDown");
      iframeRef.current.contentWindow!.document.dispatchEvent(downKeyEvent);
    }, 0),
    rotate: debounce(() => {
      wsRef.current?.send("rotate");
      iframeRef.current.contentWindow!.document.dispatchEvent(upKeyEvent);
    }, 10),
  }));

  const [multiplayer, setMultiplayer] = useState(false);

  const flag = useRef(false);
  useEffect(() => {
    if (flag.current) return;
    flag.current = true;

    (async () => {
      // connect to websocket
      // const ws = new WebSocket(location.origin.replace(/^http/, "ws") + "/ws");
      // const ws = new WebSocket("ws://localhost:3000/ws/1?asdf=1234");
      const url = new URL(window.location.href);
      // url.host = "localhost:3000";
      // url.protocol = url.protocol.replace("http", "ws");
      const room = url.searchParams.get("room");
      if (!room) return;

      const ws = new WebSocket(`ws://localhost:3000/ws/${room}`);
      wsRef.current = ws;
      ws.onopen = () => {
        console.log("connected");
        ws.send("hello!");
      };
      ws.onmessage = (e) => {
        const handlerName = e.data as keyof TetrisApi;
        switch (handlerName) {
          case "moveDown":
            iframeRef2.current?.contentWindow!.document.dispatchEvent(
              downKeyEvent
            );
            break;
          case "moveLeft":
            iframeRef2.current?.contentWindow!.document.dispatchEvent(
              leftKeyEvent
            );
            break;
          case "moveRight":
            iframeRef2.current?.contentWindow!.document.dispatchEvent(
              rightKeyEvent
            );
            break;
          case "rotate":
            iframeRef2.current?.contentWindow!.document.dispatchEvent(
              upKeyEvent
            );
            break;
          default:
            if (e.data === "newPlayer") {
              setMultiplayer(true);
              return;
            }
            console.log("unknown handler", handlerName);
            break;
        }
      };
    })();
  }, []);

  return !multiplayer ? (
    <>
      <iframe
        ref={iframeRef}
        title="tetris"
        allowFullScreen={false}
        src="/tetris/tetris.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "transparent",
        }}
      ></iframe>
    </>
  ) : (
    <>
      <iframe
        ref={iframeRef}
        title="tetris"
        allowFullScreen={false}
        src="/tetris/tetris.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "transparent",
        }}
      ></iframe>
      <iframe
        ref={iframeRef2}
        title="tetris"
        allowFullScreen={false}
        src="/tetris/tetris.html"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "transparent",
        }}
      ></iframe>
    </>
  );
});

export default TetrisWrapper;
