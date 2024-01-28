import { forwardRef, useImperativeHandle, useRef } from "react";
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

  useImperativeHandle(ref, () => ({
    moveRight: debounce(() => {
      iframeRef.current.contentWindow!.document.dispatchEvent(rightKeyEvent);
    }, 0),
    moveLeft: debounce(() => {
      iframeRef.current.contentWindow!.document.dispatchEvent(leftKeyEvent);
    }, 0),
    moveDown: debounce(() => {
      iframeRef.current.contentWindow!.document.dispatchEvent(downKeyEvent);
    }, 0),
    rotate: debounce(() => {
      iframeRef.current.contentWindow!.document.dispatchEvent(upKeyEvent);
    }, 10),
  }));

  return (
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
  );
});

export default TetrisWrapper;
