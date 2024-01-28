// // // import { useRef } from "react";
// // // import HandsContainer from "./components/HandsContainer";
// // // import TetrisWrapper, { TetrisApi } from "./components/TetrisWrapper";

// // // export default function App() {
// // //   const tetrisRef = useRef<TetrisApi>(null!);

// // //   return (
// // //     <div
// // //       style={{
// // //         display: "flex",
// // //         alignItems: "center",
// // //         justifyContent: "center",
// // //         height: "100vh",
// // //         width: "100vw",
// // //         gap: "40px",
// // //       }}
// // //     >
// // //       <HandsContainer tetris={tetrisRef} />
// // //       <TetrisWrapper ref={tetrisRef} />
// // //     </div>
// // //   );
// // // }
// // import { useRef, useState } from "react";
// // import HandsContainer from "./components/HandsContainer";
// // import TetrisWrapper, { TetrisApi } from "./components/TetrisWrapper";
// // import FlappyBirdGame from "./components/FlappyBirdGame"; // Import FlappyBirdGame

// // export default function App() {
// //   const tetrisRef = useRef<TetrisApi>(null!);
// //   const [currentGame, setCurrentGame] = useState<"Tetris" | "FlappyBird">("Tetris"); // Game state

// //   return (
// //     <div
// //       style={{
// //         display: "flex",
// //         flexDirection: "column", // Changed to column for better layout control
// //         alignItems: "center",
// //         justifyContent: "center",
// //         height: "100vh",
// //         width: "100vw",
// //       }}
// //     >
// //       <div>
// //         <button onClick={() => setCurrentGame("Tetris")}>Play Tetris</button>
// //         <button onClick={() => setCurrentGame("FlappyBird")}>Play Flappy Bird</button>
// //       </div>
// //       {currentGame === "Tetris" && (
// //         <>
// //           <HandsContainer tetris={tetrisRef} />
// //           <TetrisWrapper ref={tetrisRef} />
// //         </>
// //       )}
// //       {currentGame === "FlappyBird" && <FlappyBirdGame />}
// //     </div>
// //   );
// // }
// import { useRef, useState } from "react";
// import HandsContainer from "./components/HandsContainer";
// import TetrisWrapper, { TetrisApi } from "./components/TetrisWrapper";
// import FlappyBirdGame from "./components/FlappyBirdGame"; // Import FlappyBirdGame
// import ShooterGame from './components/shooter';

// const App = () => {
//   const [currentGame, setCurrentGame] = useState('Tetris');

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
//       <button onClick={() => setCurrentGame('Tetris')}>Tetris</button>
//       <button onClick={() => setCurrentGame('FlappyBird')}>Flappy Bird</button>
//       <button onClick={() => setCurrentGame('ShooterGame')}>Shooter Game</button>

//       {currentGame === 'Tetris' && <TetrisWrapper />}
//       {currentGame === 'FlappyBird' && <FlappyBirdGame />}
//       {currentGame === 'ShooterGame' && <ShooterGame />}
//     </div>
//   );
// };

// export default App;


import { useRef, useState } from "react";
import HandsContainer from "./components/HandsContainer";
import TetrisWrapper, { TetrisApi } from "./components/TetrisWrapper";
import FlappyBirdGame from "./components/FlappyBirdGame"; // Import FlappyBirdGame
import ShooterGame from './components/shooter';

const App = () => {
  const tetrisRef = useRef<TetrisApi>(null!);
  const [currentGame, setCurrentGame] = useState<"Tetris" | "FlappyBird" | "ShooterGame">("Tetris"); // Added ShooterGame to the game state type

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column", // Maintain column layout for better control
        alignItems: "center", // Center-align items to fix the issue of content being too far left
        justifyContent: "center", // Vertically center the content in the viewport
        height: "100vh", // Use 100% of the viewport height
        width: "100vw", // Use 100% of the viewport width
        gap: "20px", // Adjust the gap between buttons and the game component as needed
      }}
    >
      <div>
        <button onClick={() => setCurrentGame("Tetris")}>Play Tetris</button>
        <button onClick={() => setCurrentGame("FlappyBird")}>Play Flappy Bird</button>
        <button onClick={() => setCurrentGame("ShooterGame")}>Shooter Game</button>
      </div>
      {currentGame === "Tetris" && (
        <>
          <HandsContainer tetris={tetrisRef} />
          <TetrisWrapper ref={tetrisRef} />
        </>
      )}
      {currentGame === "FlappyBird" && <FlappyBirdGame />}
      {currentGame === "ShooterGame" && <ShooterGame />}
    </div>
  );
};

export default App;
