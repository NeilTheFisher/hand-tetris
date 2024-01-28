import { useRef } from "react";
import HandsContainer from "./components/HandsContainer";
import TetrisWrapper, { TetrisApi } from "./components/TetrisWrapper";

export default function App() {
  const tetrisRef = useRef<TetrisApi>(null!);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        gap: "40px",
      }}
    >
      <HandsContainer tetris={tetrisRef} />
      <TetrisWrapper ref={tetrisRef} />
    </div>
  );
}
