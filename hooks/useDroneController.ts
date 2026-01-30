
import { useRef, useEffect, useCallback } from "react";
import { DroneController, type DroneState } from "@/lib/simulator/droneSimulator";

type UseDroneControllerProps = {
  initialState: DroneState;
  onDroneStateChange: (state: DroneState) => void;
  onStatusChange: (status: string) => void;
};

export function useDroneController({
  initialState,
  onDroneStateChange,
  onStatusChange,
}: UseDroneControllerProps) {
  const controllerRef = useRef<DroneController | null>(null);
  const callbacksRef = useRef({ onDroneStateChange, onStatusChange });
  // console.log(callbacksRef)
  // console.log(controllerRef)
  useEffect(() => {
    callbacksRef.current = { onDroneStateChange, onStatusChange };
  }, [onDroneStateChange, onStatusChange]);

  if (!controllerRef.current) {
    controllerRef.current = new DroneController(initialState);
    controllerRef.current.setCallbacks(
      (state) => callbacksRef.current.onDroneStateChange(state),
      (status) => {
        if (status === "running") callbacksRef.current.onStatusChange("Đang chạy…");
        else if (status === "completed") callbacksRef.current.onStatusChange("Hoàn thành");
        else if (status === "goal_reached") callbacksRef.current.onStatusChange("Đã tới đích");
        else callbacksRef.current.onStatusChange("Sẵn sàng");
      }
    );
  }

  return controllerRef.current;
}
