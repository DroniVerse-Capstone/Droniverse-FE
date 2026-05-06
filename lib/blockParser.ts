/**
 * Converts the generated Blockly script (string format) into the 
 * JSON format required by the ESP32 drone system.
 */
export const parseScriptToJSON = (script: string, droneId: string) => {
  const lines = script.trim().split('\n');
  const commands: any[] = [];

  lines.forEach(line => {
    if (!line.trim()) return;

    const [fullCmd, ...args] = line.trim().split(' ');
    const cmd = fullCmd.split('|')[0]; // Remove blockId

    switch (cmd) {
      case 'TAKEOFF':
        commands.push({ name: 'CAT_CANH', type: 'takeoff', duration: 0, power: 0 });
        break;

      case 'LAND':
      case 'EMERGENCY_STOP':
        commands.push({ name: 'HA_CANH', type: 'land', duration: 0, power: 0 });
        break;

      case 'GO': {
        const direction = args[0].toLowerCase();
        const duration = Number(args[1]);
        const power = Number(args[2]);

        let dirMap = '';
        if (direction === 'forward') dirMap = 'TIEN';
        else if (direction === 'backward') dirMap = 'LUI';
        else if (direction === 'left') dirMap = 'SANG_TRAI';
        else if (direction === 'right') dirMap = 'SANG_PHAI';
        else if (direction === 'up') dirMap = 'LEN_CAO';
        else if (direction === 'down') dirMap = 'XUONG_THAP';

        if (dirMap) {
          commands.push({
            name: 'DI_CHUYEN',
            type: 'move',
            direction: dirMap,
            duration: duration,
            power: power
          });
        }
        break;
      }

      case 'TURN': {
        const direction = args[0].toLowerCase();
        const duration = Number(args[1]);
        const power = Number(args[2]);

        commands.push({
          name: 'QUAY',
          type: 'rotate',
          direction: direction === 'left' ? 'TRAI' : 'PHAI',
          duration: duration,
          power: power
        });
        break;
      }

      case 'DELAY': {
        const duration = Number(args[0]);
        commands.push({ name: 'TAM_DUNG', type: 'delay', duration: duration, power: 0 });
        break;
      }

      case 'TURN_DEG': {
        const direction = args[0].toLowerCase();
        // Since the new API only supports duration, we will simulate degrees with duration (approximate)
        // 90 degrees at 40% power might be ~1 second.
        const degrees = Number(args[1]);
        const duration = degrees / 90.0;
        commands.push({ 
          name: 'QUAY', 
          type: 'rotate', 
          direction: direction === 'left' ? 'TRAI' : 'PHAI', 
          duration: Number(duration.toFixed(1)), 
          power: 40 
        });
        break;
      }

      case 'THROTTLE': {
        const power = Number(args[0]);
        const duration = Number(args[1]);
        commands.push({ 
          name: 'DI_CHUYEN', 
          type: 'move', 
          direction: power >= 0 ? 'LEN_CAO' : 'XUONG_THAP', 
          duration: duration, 
          power: Math.abs(power) 
        });
        break;
      }

      case 'PITCH': {
        const direction = args[0].toLowerCase(); // backward or forward
        const power = Number(args[1]);
        const duration = Number(args[2]);
        commands.push({ 
          name: 'DI_CHUYEN', 
          type: 'move', 
          direction: direction === 'backward' ? 'LUI' : 'TIEN', 
          duration: duration, 
          power: Math.abs(power) 
        });
        break;
      }

      case 'ROLL': {
        const direction = args[0].toLowerCase(); // left or right
        const power = Number(args[1]);
        const duration = Number(args[2]);
        commands.push({ 
          name: 'DI_CHUYEN', 
          type: 'move', 
          direction: direction === 'left' ? 'SANG_TRAI' : 'SANG_PHAI', 
          duration: duration, 
          power: Math.abs(power) 
        });
        break;
      }

      case 'YAW': {
        const direction = args[0].toLowerCase(); // left or right
        const power = Number(args[1]);
        const duration = Number(args[2]);
        commands.push({ 
          name: 'QUAY', 
          type: 'rotate', 
          direction: direction === 'left' ? 'TRAI' : 'PHAI', 
          duration: duration, 
          power: Math.abs(power) 
        });
        break;
      }

      default:
        console.warn(`[Parser] Unknown command: ${cmd}`);
    }
  });

  return {
    droneId: droneId,
    commands: commands
  };
};
