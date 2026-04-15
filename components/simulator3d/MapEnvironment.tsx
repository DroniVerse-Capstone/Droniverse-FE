import { Environment, Stars, Sky } from "@react-three/drei";

export function MapEnvironment({ theme }: { theme?: "default" | "space" | "sunset" | "daylight" }) {
  if (theme === "space") {
    return (
      <>
        <color attach="background" args={["#050510"]} />
        <Stars radius={400} depth={200} count={3000} factor={15} saturation={0} fade speed={3} />
        <Environment preset="apartment" blur={0.8} />
        <ambientLight intensity={0.2} />
      </>
    );
  }
  if (theme === "sunset") {
    return (
      <>
        <Sky
          sunPosition={[100, 10, 100]}
          turbidity={10}
          rayleigh={1}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[50, 50, 50]}
          intensity={1.5}
          color="#291e50ff"
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
      </>
    );
  }
  if (theme === "daylight") {
    return (
      <>
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="apartment" blur={0.8} />
        <ambientLight intensity={0.8} />
      </>
    );
  }
  return (
    <>
      <color attach="background" args={["#071427"]} />
      <Environment preset="apartment" blur={0.8} />
    </>
  );
}
