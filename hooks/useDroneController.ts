
import { useRef, useEffect, useCallback } from "react";
import { DroneController, type DroneState } from "@/lib/simulator/droneSimulator";

type UseDroneControllerProps = {
  initialState: DroneState;
  onDroneStateChange: (state: DroneState) => void;
  onStatusChange: (status: string) => void;
  worldConfig?: { width: number; height: number; padding: number };
};

export function useDroneController({
  initialState,
  onDroneStateChange,
  onStatusChange,
  worldConfig,
}: UseDroneControllerProps) {
  const controllerRef = useRef<DroneController | null>(null);
  const callbacksRef = useRef({ onDroneStateChange, onStatusChange });
  // console.log(callbacksRef)
  // console.log(controllerRef)
  useEffect(() => {
    callbacksRef.current = { onDroneStateChange, onStatusChange };
  }, [onDroneStateChange, onStatusChange]);

  if (!controllerRef.current) {
    controllerRef.current = new DroneController(initialState, worldConfig);
    controllerRef.current.setCallbacks(
      (state) => callbacksRef.current.onDroneStateChange(state),
      (status, reason) => {
        if (status === "running") callbacksRef.current.onStatusChange("running");
        else if (status === "completed" || status === "goal_reached") callbacksRef.current.onStatusChange("finished");
        else if (status === "failed") callbacksRef.current.onStatusChange(reason === "collision" ? "crashed" : "failed");
        else callbacksRef.current.onStatusChange("ready");
      }
    );
  }

  return controllerRef.current;
}
