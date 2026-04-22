export interface WebSimulator {
  webSimulatorID: string;
  droneID: string;
  titleVN: string;
  titleEN: string;
  type: "PHYSIC";
  objectivesVN: string;
  objectivesEN: string;
  code: string;
  estimatedTime: number;
  createAt: string;
  updateAt: string;
}

export interface WebSimulatorResponse {
  data: WebSimulator[];
  isSuccess: boolean;
  message: string;
}
