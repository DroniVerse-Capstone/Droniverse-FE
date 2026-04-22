/**
 * Quadcopter Flight Mechanics - Educational Lessons
 * Static content, no database, easy to extend for other drone types
 */

export interface MotorConfig {
  position: "FL" | "FR" | "RL" | "RR";
  rotation: "CW" | "CCW"; // Propeller rotation direction
}

export interface LessonStep {
  id: string;
  title: string;
  content: string; // HTML supported
  diagram?: string; // SVG or diagram description
  formula?: string; // Optional formula display
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  icon: string; // Emoji or icon name
  objective: string; // Learning objective
  theory: {
    intro: string;
    steps: LessonStep[];
    formula?: string;
    keyTakeaways: string[];
  };
  experiment: {
    instruction: string;
    successCriteria: string;
  };
  // Which controls to highlight for this lesson
  highlightedControls: ("throttle" | "pitch" | "roll" | "yaw")[];
  // Preset values for this lesson's demo
  demoPreset?: {
    throttle: number;
    pitch: number;
    roll: number;
    yaw: number;
  };
}

export interface DroneConfig {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  motorCount: number;
  motorLayout: MotorConfig[];
  physics: {
    hoverThrust: number;
    maxTilt: number;
    maxSpeed: number;
    weight: number; // kg
    maxAltitude: number;
  };
  lessons: Lesson[];
}

// ─────────────────────────────────────────────────────────────
// QUADCOPTER CONFIGURATION (4 Cánh)
// Motor layout: X-configuration
//    M1(FL,CW)     M2(FR,CCW)
//         \       /
//           drone
//         /       \
//    M3(RL,CCW)    M4(RR,CW)
//
// In X-config: diagonals spin same direction to cancel torque
// ─────────────────────────────────────────────────────────────

export const QUADCOPTER_CONFIG: DroneConfig = {
  id: "quadcopter",
  name: "Quadcopter",
  nameVi: "Máy Bay 4 Cánh",
  description: "Drone 4 cánh quay với cấu hình X - phổ biến nhất hiện nay",
  motorCount: 4,
  motorLayout: [
    { position: "FL", rotation: "CW" }, // Front Left - Clockwise
    { position: "FR", rotation: "CCW" }, // Front Right - Counter-Clockwise
    { position: "RL", rotation: "CCW" }, // Rear Left - Counter-Clockwise
    { position: "RR", rotation: "CW" }, // Rear Right - Clockwise
  ],
  physics: {
    hoverThrust: 42,
    maxTilt: 25,
    maxSpeed: 15,
    weight: 1.5,
    maxAltitude: 120,
  },

  lessons: [
    // ─────────────────────────────────────────────────────────
    // LESSON 1: LỰC NÂNG - HOW LIFT WORKS
    // ─────────────────────────────────────────────────────────
    {
      id: "lift",
      title: "Lực Nâng Là Gì?",
      subtitle: "Drone bay được nhờ đâu?",
      icon: "🚀",
      objective: "Hiểu được nguyên lý tạo lực nâng của cánh quạt",
      theory: {
        intro: `
          <p>Drone có thể bay lên trời nhờ <strong>4 cánh quạt</strong> quay với tốc độ cao.</p>
          <p>Mỗi cánh quạt khi quay sẽ đẩy không khí xuống dưới, và theo <strong>định luật Newton III</strong> 
          (hành động - phản hành động), không khí sẽ đẩy drone lên trên.</p>
        `,
        steps: [
          {
            id: "lift-1",
            title: "Cánh quạt đẩy không khí",
            content: `
              <div class="flex items-center gap-4 my-4">
                <div class="text-4xl">🔄</div>
                <div>
                  <p>Khi cánh quạt quay, nó tạo ra luồng không khí đi <strong>xuống dưới</strong>.</p>
                  <p>Càng quay nhanh → đẩy càng nhiều không khí → lực nâng càng lớn.</p>
                </div>
              </div>
            `,
            diagram: "propeller-airflow",
          },
          {
            id: "lift-2",
            title: "Nguyên lý Action-Reaction",
            content: `
              <div class="flex items-center gap-4 my-4">
                <div class="text-4xl">⚖️</div>
                <div>
                  <p>Theo <strong>Định luật Newton III</strong>:</p>
                  <p class="text-cyan-400 font-bold text-lg my-2">"Mọi lực tác dụng đều có phản lực bằng nhau và ngược chiều"</p>
                  <p>Đẩy không khí xuống → Không khí đẩy drone lên</p>
                </div>
              </div>
            `,
            formula: "Lực nâng = Khối lượng khí × Gia tốc",
          },
          {
            id: "lift-3",
            title: "Cân bằng lực khi Hover",
            content: `
              <div class="bg-black/40 rounded-xl p-4 my-4">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-red-400 font-bold">↓ Trọng lực (Gravity)</span>
                  <span class="text-2xl">⚖️</span>
                  <span class="text-emerald-400 font-bold">↑ Lực nâng (Lift)</span>
                </div>
                <div class="text-center text-white/70 text-sm">
                  Khi <span class="text-emerald-400">Lực nâng = Trọng lực</span> → Drone đứng yên lơ lửng (Hover)
                </div>
              </div>
            `,
          },
        ],
        keyTakeaways: [
          "Cánh quạt quay → đẩy không khí xuống → lực nâng đẩy drone lên",
          "Quay càng nhanh → lực nâng càng lớn",
          "Hover = Lực nâng = Trọng lực",
        ],
      },
      experiment: {
        instruction: "Tăng Throttle (↑) để drone bay lên. Quan sát khi nào drone bắt đầu nâng lên khỏi mặt đất.",
        successCriteria: "Drone đạt độ cao ổn định (không lên xuống liên tục)",
      },
      highlightedControls: ["throttle"],
      demoPreset: {
        throttle: 50,
        pitch: 0,
        roll: 0,
        yaw: 0,
      },
    },

    // ─────────────────────────────────────────────────────────
    // LESSON 2: TORQUE & CÂN BẰNG
    // ─────────────────────────────────────────────────────────
    {
      id: "balance",
      title: "Tại Sao Cần 4 Cánh?",
      subtitle: "Torque và Cân bằng",
      icon: "🔄",
      objective: "Hiểu tại sao drone cần cánh quay ngược chiều để giữ cân bằng",
      theory: {
        intro: `
          <p>Bạn có thắc mắc tại sao drone có <strong>4 cánh quạt</strong> không? Tại sao không dùng 2 hay 3?</p>
          <p>Câu trả lời nằm ở <strong>Torque (Moment xoắn)</strong> - lực làm quay vật thể.</p>
        `,
        steps: [
          {
            id: "balance-1",
            title: "Vấn đề: Cánh quạt quay → Drone quay theo!",
            content: `
              <div class="bg-red-900/20 border border-red-500/30 rounded-xl p-4 my-4">
                <p class="text-red-400 font-bold mb-2">⚠️ Vấn đề nghiêm trọng!</p>
                <p>Khi cánh quạt quay theo chiều kim đồng hồ, nó tạo ra <strong>momen xoắn</strong> 
                làm thân drone quay ngược chiều (ngược kim đồng hồ).</p>
              </div>
              <div class="flex justify-center my-4">
                <div class="text-6xl">↻ ← → ↺</div>
              </div>
              <p class="text-center text-white/60 text-sm">Cánh quay → Thân drone quay!</p>
            `,
          },
          {
            id: "balance-2",
            title: "Giải pháp: Cánh quay ngược chiều",
            content: `
              <div class="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-4 my-4">
                <p class="text-emerald-400 font-bold mb-2">✅ Giải pháp!</p>
                <p>Drone dùng <strong>2 cánh quay thuận</strong> (CW) và <strong>2 cánh quay ngược</strong> (CCW). 
                Các momen xoắn <strong>triệt tiêu nhau</strong>, drone không bị quay.</p>
              </div>
              <div class="grid grid-cols-2 gap-4 my-4">
                <div class="bg-black/40 rounded-lg p-3 text-center">
                  <div class="text-2xl mb-2">M1 ↻ M4</div>
                  <p class="text-cyan-400 text-sm font-bold">Clockwise (Thuận)</p>
                  <p class="text-white/50 text-xs">Tạo momen ↺</p>
                </div>
                <div class="bg-black/40 rounded-lg p-3 text-center">
                  <div class="text-2xl mb-2">M2 ↺ M3</div>
                  <p class="text-orange-400 text-sm font-bold">Counter-Clockwise (Ngược)</p>
                  <p class="text-white/50 text-xs">Tạo momen ↻</p>
                </div>
              </div>
            `,
          },
          {
            id: "balance-3",
            title: "Cấu hình X của Quadcopter",
            content: `
              <div class="flex items-center gap-6 my-4">
                <div class="relative w-32 h-32">
                  <div class="absolute top-0 left-1/2 -translate-x-1/2 text-center">
                    <div class="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">M1</div>
                    <p class="text-xs text-cyan-400 mt-1">FL ↻</p>
                  </div>
                  <div class="absolute top-1/2 right-0 -translate-y-1/2 text-center">
                    <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">M2</div>
                    <p class="text-xs text-orange-400 mt-1">FR ↺</p>
                  </div>
                  <div class="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                    <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">M3</div>
                    <p class="text-xs text-orange-400 mt-1">RL ↺</p>
                  </div>
                  <div class="absolute top-1/2 left-0 -translate-y-1/2 text-center">
                    <div class="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">M4</div>
                    <p class="text-xs text-cyan-400 mt-1">RR ↻</p>
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-4 h-4 bg-white/50 rounded-full"></div>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-white/80 text-sm"><strong>X-Config:</strong></p>
                  <ul class="text-white/60 text-xs space-y-1 mt-2">
                    <li>• M1 (FL) ↻ CW + M4 (RR) ↻ CW</li>
                    <li>• M2 (FR) ↺ CCW + M3 (RL) ↺ CCW</li>
                    <li>• Đường chéo = cùng chiều</li>
                  </ul>
                </div>
              </div>
            `,
          },
        ],
        keyTakeaways: [
          "Mỗi cánh quạt tạo momen xoắn làm drone quay",
          "Drone dùng 2 CW + 2 CCW để triệt tiêu momen",
          "X-config: đường chéo cùng chiều quay",
        ],
      },
      experiment: {
        instruction: "Giữ throttle ở mức ~50 (hover). Quan sát 4 động cơ có mức lực bằng nhau không? Chúng đang triệt tiêu momen.",
        successCriteria: "Drone đứng yên không quay (yaw = 0)",
      },
      highlightedControls: [],
      demoPreset: {
        throttle: 50,
        pitch: 0,
        roll: 0,
        yaw: 0,
      },
    },

    // ─────────────────────────────────────────────────────────
    // LESSON 3: PITCH - TIẾN / LÙI
    // ─────────────────────────────────────────────────────────
    {
      id: "pitch",
      title: "Bay Tiến & Lùi",
      subtitle: "Điều khiển Trục Pitch",
      icon: "⬆️",
      objective: "Hiểu cách drone di chuyển tiến/lùi bằng cách điều khiển động cơ trước/sau",
      theory: {
        intro: `
          <p>Muốn drone <strong>bay về phía trước</strong>, ta cần nghiêng drone về phía trước (pitch down). 
          Lực nâng bị nghiêng về phía trước sẽ đẩy drone đi.</p>
        `,
        steps: [
          {
            id: "pitch-1",
            title: "Muốn bay tới → Nghiêng mũi xuống",
            content: `
              <div class="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4 my-4">
                <p class="text-cyan-400 font-bold mb-2">📐 Nguyên lý Pitch</p>
                <div class="flex items-center justify-center gap-8 my-4">
                  <div class="text-center">
                    <div class="text-4xl mb-2">🔴🔴</div>
                    <p class="text-white/70 text-sm">Động cơ SAU</p>
                    <p class="text-cyan-400 font-bold">Mạnh hơn ↑</p>
                  </div>
                  <div class="text-4xl">→</div>
                  <div class="text-center">
                    <div class="text-4xl mb-2">📍</div>
                    <p class="text-white/70 text-sm">Mũi drone</p>
                    <p class="text-orange-400 font-bold">Chúi xuống ↓</p>
                  </div>
                  <div class="text-4xl">→</div>
                  <div class="text-center">
                    <div class="text-4xl mb-2">🚀</div>
                    <p class="text-white/70 text-sm">Di chuyển</p>
                    <p class="text-emerald-400 font-bold">Tiến tới →</p>
                  </div>
                </div>
              </div>
            `,
          },
          {
            id: "pitch-2",
            title: "Công thức tính Pitch",
            content: `
              <div class="bg-black/40 rounded-xl p-4 my-4 font-mono text-sm">
                <p class="text-cyan-400 mb-2">// Pitch Torque (Moment nghiêng)</p>
                <p class="text-white">
                  <span class="text-emerald-400">Pitch Torque</span> = 
                  (M3 + M4) <span class="text-white/50">-</span> (M1 + M2)
                </p>
                <div class="mt-3 pt-3 border-t border-white/10">
                  <p class="text-white/60 text-xs">
                    <span class="text-orange-400">M3</span> = Rear Left | 
                    <span class="text-orange-400">M4</span> = Rear Right<br/>
                    <span class="text-cyan-400">M1</span> = Front Left | 
                    <span class="text-cyan-400">M2</span> = Front Right
                  </p>
                </div>
              </div>
              <div class="text-center text-white/50 text-xs mt-2">
                M3+M4 (sau) mạnh → Pitch dương → Mũi xuống → Bay tới
              </div>
            `,
          },
          {
            id: "pitch-3",
            title: "Bay Lùi - Ngược lại",
            content: `
              <div class="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 my-4">
                <p class="text-orange-400 font-bold mb-2">📐 Bay Lùi</p>
                <div class="flex items-center justify-center gap-8 my-4">
                  <div class="text-center">
                    <div class="text-4xl mb-2">🔴🔴</div>
                    <p class="text-white/70 text-sm">Động cơ TRƯỚC</p>
                    <p class="text-orange-400 font-bold">Mạnh hơn ↑</p>
                  </div>
                  <div class="text-4xl">→</div>
                  <div class="text-center">
                    <div class="text-4xl mb-2">📍</div>
                    <p class="text-white/70 text-sm">Mũi drone</p>
                    <p class="text-cyan-400 font-bold">Ngóc lên ↑</p>
                  </div>
                  <div class="text-4xl">→</div>
                  <div class="text-center">
                    <div class="text-4xl mb-2">🚀</div>
                    <p class="text-white/70 text-sm">Di chuyển</p>
                    <p class="text-emerald-400 font-bold">Lùi lại ←</p>
                  </div>
                </div>
              </div>
            `,
          },
        ],
        formula: "Pitch Torque = (Rear Motors) - (Front Motors)",
        keyTakeaways: [
          "Tăng động cơ SAU → Mũi chúi xuống → Bay tới",
          "Tăng động cơ TRƯỚC → Mũi ngóc lên → Bay lùi",
          "W = Forward | S = Backward",
        ],
      },
      experiment: {
        instruction: "Nhấn W để drone bay tới. Quan sát: động cơ nào tăng? Drone nghiêng thế nào? Di chuyển hướng nào?",
        successCriteria: "Drone di chuyển về phía trước với góc nghiêng ổn định",
      },
      highlightedControls: ["pitch"],
      demoPreset: {
        throttle: 58,
        pitch: 25,
        roll: 0,
        yaw: 0,
      },
    },

    // ─────────────────────────────────────────────────────────
    // LESSON 4: ROLL - DẠT NGANG
    // ─────────────────────────────────────────────────────────
    {
      id: "roll",
      title: "Dạt Ngang Trái & Phải",
      subtitle: "Điều khiển Trục Roll",
      icon: "↔️",
      objective: "Hiểu cách drone di chuyển ngang bằng cách điều khiển động cơ trái/phải",
      theory: {
        intro: `
          <p>Muốn drone <strong>dạt sang phải</strong>, ta cần nghiêng drone sang phải (roll right). 
          Tương tự pitch nhưng áp dụng cho trục ngang.</p>
        `,
        steps: [
          {
            id: "roll-1",
            title: "Muốn dạt phải → Nghiêng phải",
            content: `
              <div class="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 my-4">
                <p class="text-orange-400 font-bold mb-2">📐 Nguyên lý Roll</p>
                <div class="flex items-center justify-center gap-8 my-4">
                  <div class="text-center">
                    <div class="text-4xl mb-2">🔴<br/>🔴</div>
                    <p class="text-white/70 text-sm">Động cơ TRÁI</p>
                    <p class="text-cyan-400 font-bold">Mạnh hơn ↑</p>
                  </div>
                  <div class="text-4xl">→</div>
                  <div class="text-center">
                    <div class="text-4xl mb-2">📍</div>
                    <p class="text-white/70 text-sm">Drone</p>
                    <p class="text-orange-400 font-bold">Nghiêng phải ↗</p>
                  </div>
                  <div class="text-4xl">→</div>
                  <div class="text-center">
                    <div class="text-4xl mb-2">🚀</div>
                    <p class="text-white/70 text-sm">Di chuyển</p>
                    <p class="text-emerald-400 font-bold">Sang phải →</p>
                  </div>
                </div>
              </div>
            `,
          },
          {
            id: "roll-2",
            title: "Công thức tính Roll",
            content: `
              <div class="bg-black/40 rounded-xl p-4 my-4 font-mono text-sm">
                <p class="text-orange-400 mb-2">// Roll Torque (Moment nghiêng ngang)</p>
                <p class="text-white">
                  <span class="text-emerald-400">Roll Torque</span> = 
                  (M1 + M3) <span class="text-white/50">-</span> (M2 + M4)
                </p>
                <div class="mt-3 pt-3 border-t border-white/10">
                  <p class="text-white/60 text-xs">
                    <span class="text-cyan-400">M1</span> = Front Left | 
                    <span class="text-cyan-400">M3</span> = Rear Left<br/>
                    <span class="text-orange-400">M2</span> = Front Right | 
                    <span class="text-orange-400">M4</span> = Rear Right
                  </p>
                </div>
              </div>
              <div class="text-center text-white/50 text-xs mt-2">
                Trái (M1+M3) mạnh → Roll dương → Nghiêng phải → Dạt phải
              </div>
            `,
          },
          {
            id: "roll-3",
            title: "Dạt trái - Ngược lại",
            content: `
              <div class="bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4 my-4">
                <p class="text-cyan-400 font-bold mb-2">📐 Dạt Trái</p>
                <div class="flex items-center justify-center gap-8 my-4">
                  <div class="text-center">
                    <div class="text-4xl mb-2">🔴<br/>🔴</div>
                    <p class="text-white/70 text-sm">Động cơ PHẢI</p>
                    <p class="text-orange-400 font-bold">Mạnh hơn ↑</p>
                  </div>
                  <div class="text-4xl">→</div>
                  <div class="text-center">
                    <div class="text-4xl mb-2">📍</div>
                    <p class="text-white/70 text-sm">Drone</p>
                    <p class="text-cyan-400 font-bold">Nghiêng trái ↖</p>
                  </div>
                  <div class="text-4xl">→</div>
                  <div class="text-center">
                    <div class="text-4xl mb-2">🚀</div>
                    <p class="text-white/70 text-sm">Di chuyển</p>
                    <p class="text-emerald-400 font-bold">Sang trái ←</p>
                  </div>
                </div>
              </div>
            `,
          },
        ],
        formula: "Roll Torque = (Left Motors) - (Right Motors)",
        keyTakeaways: [
          "Tăng động cơ TRÁI → Nghiêng phải → Dạt phải",
          "Tăng động cơ PHẢI → Nghiêng trái → Dạt trái",
          "A = Left | D = Right",
        ],
      },
      experiment: {
        instruction: "Nhấn D để drone dạt sang phải. Quan sát động cơ bên trái/phải và hướng nghiêng của drone.",
        successCriteria: "Drone di chuyển sang phải ổn định",
      },
      highlightedControls: ["roll"],
      demoPreset: {
        throttle: 55,
        pitch: 0,
        roll: 25,
        yaw: 0,
      },
    },

    // ─────────────────────────────────────────────────────────
    // LESSON 5: YAW - XOAY ĐẦU
    // ─────────────────────────────────────────────────────────
    {
      id: "yaw",
      title: "Xoay Đầu Drone",
      subtitle: "Điều khiển Trục Yaw",
      icon: "🔄",
      objective: "Hiểu cách drone xoay đầu mà không cần di chuyển, nhờ momen xoắn",
      theory: {
        intro: `
          <p><strong>Yaw</strong> là xoay đầu drone (quay trái/phải) mà không thay đổi vị trí. 
          Đây là cách drone <strong>đổi hướng</strong> khi cần.</p>
        `,
        steps: [
          {
            id: "yaw-1",
            title: "Dùng Momen Xoắn để Xoay",
            content: `
              <div class="bg-violet-900/20 border border-violet-500/30 rounded-xl p-4 my-4">
                <p class="text-violet-400 font-bold mb-2">🔄 Nguyên lý Yaw</p>
                <p class="text-white/80 text-sm mb-4">
                  Khi <strong>2 động cơ cùng chiều</strong> mạnh hơn 2 động cơ còn lại, 
                  chúng tạo ra <strong>momen xoắn không cân bằng</strong> → drone xoay!
                </p>
                <div class="flex items-center justify-center gap-4 my-4">
                  <div class="text-center bg-black/40 rounded-lg p-3">
                    <div class="text-2xl mb-1">↻ ↻</div>
                    <p class="text-cyan-400 text-xs font-bold">CW Motors</p>
                    <p class="text-white/60 text-[10px]">M1 + M4</p>
                  </div>
                  <div class="text-2xl">vs</div>
                  <div class="text-center bg-black/40 rounded-lg p-3">
                    <div class="text-2xl mb-1">↺ ↺</div>
                    <p class="text-orange-400 text-xs font-bold">CCW Motors</p>
                    <p class="text-white/60 text-[10px]">M2 + M3</p>
                  </div>
                </div>
              </div>
            `,
          },
          {
            id: "yaw-2",
            title: "Xoay Trái (CCW) - Tăng CW motors",
            content: `
              <div class="flex items-center gap-8 my-4">
                <div class="flex-1 bg-cyan-900/20 border border-cyan-500/30 rounded-xl p-4">
                  <p class="text-cyan-400 font-bold mb-2">↺ Xoay Trái (CCW)</p>
                  <p class="text-white/70 text-sm">
                    Tăng <strong>M1 + M4</strong> (CW)<br/>
                    → Momen CW mạnh hơn<br/>
                    → Drone xoay trái
                  </p>
                  <div class="mt-3 text-center text-4xl">↺</div>
                </div>
                <div class="flex-1 bg-orange-900/20 border border-orange-500/30 rounded-xl p-4">
                  <p class="text-orange-400 font-bold mb-2">↻ Xoay Phải (CW)</p>
                  <p class="text-white/70 text-sm">
                    Tăng <strong>M2 + M3</strong> (CCW)<br/>
                    → Momen CCW mạnh hơn<br/>
                    → Drone xoay phải
                  </p>
                  <div class="mt-3 text-center text-4xl">↻</div>
                </div>
              </div>
            `,
          },
          {
            id: "yaw-3",
            title: "Công thức tính Yaw",
            content: `
              <div class="bg-black/40 rounded-xl p-4 my-4 font-mono text-sm">
                <p class="text-violet-400 mb-2">// Yaw Torque (Moment xoay đầu)</p>
                <p class="text-white">
                  <span class="text-emerald-400">Yaw Torque</span> = 
                  (M1 + M4) <span class="text-white/50">-</span> (M2 + M3)
                </p>
                <div class="mt-3 pt-3 border-t border-white/10 text-white/50 text-xs">
                  CW motors (M1, M4) - CCW motors (M2, M3)
                </div>
              </div>
              <div class="text-center">
                <kbd class="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm mr-2">←</kbd>
                <span class="text-white/60">Xoay Trái</span>
                <kbd class="px-3 py-1 bg-white/10 border border-white/20 rounded text-sm mx-2">→</kbd>
                <span class="text-white/60">Xoay Phải</span>
              </div>
            `,
          },
        ],
        formula: "Yaw Torque = (CW Motors) - (CCW Motors)",
        keyTakeaways: [
          "Tăng động cơ CW (M1+M4) → Xoay trái",
          "Tăng động cơ CCW (M2+M3) → Xoay phải",
          "Yaw không làm drone di chuyển, chỉ xoay đầu",
          "← = Xoay Trái | → = Xoay Phải",
        ],
      },
      experiment: {
        instruction: "Nhấn ← để xoay trái, → để xoay phải. Quan sát drone xoay tại chỗ mà không di chuyển.",
        successCriteria: "Drone xoay đầu 90° mà vẫn giữ vị trí",
      },
      highlightedControls: ["yaw"],
      demoPreset: {
        throttle: 50,
        pitch: 0,
        roll: 0,
        yaw: 30,
      },
    },

    // ─────────────────────────────────────────────────────────
    // LESSON 6: TỔNG HỢP - KẾT HỢP CÁC ĐIỀU KHIỂN
    // ─────────────────────────────────────────────────────────
    {
      id: "combined",
      title: "Kết Hợp Tất Cả",
      subtitle: "Bay theo ý muốn",
      icon: "🎮",
      objective: "Thực hành kết hợp throttle, pitch, roll, yaw để bay tự do",
      theory: {
        intro: `
          <p>Bây giờ bạn đã hiểu tất cả các điều khiển cơ bản! Hãy thực hành <strong>kết hợp chúng</strong> 
          để bay theo ý muốn.</p>
        `,
        steps: [
          {
            id: "combined-1",
            title: "Bảng tổng hợp điều khiển",
            content: `
              <div class="bg-black/40 rounded-xl p-4 my-4">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="text-white/50 text-xs border-b border-white/10">
                      <th class="text-left py-2">Phím</th>
                      <th class="text-left py-2">Hành động</th>
                      <th class="text-left py-2">Động cơ thay đổi</th>
                      <th class="text-left py-2">Kết quả</th>
                    </tr>
                  </thead>
                  <tbody class="text-white/80 text-xs">
                    <tr class="border-b border-white/5">
                      <td class="py-2"><kbd class="px-2 py-0.5 bg-emerald-500/20 rounded">↑↓</kbd></td>
                      <td>Throttle</td>
                      <td>Tất cả</td>
                      <td>Lên / Xuống</td>
                    </tr>
                    <tr class="border-b border-white/5">
                      <td class="py-2"><kbd class="px-2 py-0.5 bg-cyan-500/20 rounded">W</kbd></td>
                      <td>Pitch +</td>
                      <td>Sau ↑, Trước ↓</td>
                      <td>Bay tới</td>
                    </tr>
                    <tr class="border-b border-white/5">
                      <td class="py-2"><kbd class="px-2 py-0.5 bg-cyan-500/20 rounded">S</kbd></td>
                      <td>Pitch -</td>
                      <td>Trước ↑, Sau ↓</td>
                      <td>Bay lùi</td>
                    </tr>
                    <tr class="border-b border-white/5">
                      <td class="py-2"><kbd class="px-2 py-0.5 bg-orange-500/20 rounded">A</kbd></td>
                      <td>Roll -</td>
                      <td>Phải ↑, Trái ↓</td>
                      <td>Dạt trái</td>
                    </tr>
                    <tr class="border-b border-white/5">
                      <td class="py-2"><kbd class="px-2 py-0.5 bg-orange-500/20 rounded">D</kbd></td>
                      <td>Roll +</td>
                      <td>Trái ↑, Phải ↓</td>
                      <td>Dạt phải</td>
                    </tr>
                    <tr>
                      <td class="py-2"><kbd class="px-2 py-0.5 bg-violet-500/20 rounded">←→</kbd></td>
                      <td>Yaw</td>
                      <td>CW vs CCW</td>
                      <td>Xoay đầu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            `,
          },
          {
            id: "combined-2",
            title: "Mẹo bay cho người mới",
            content: `
              <div class="space-y-3 my-4">
                <div class="flex gap-3 items-start">
                  <span class="text-xl">1️⃣</span>
                  <div>
                    <p class="text-white font-bold">Bắt đầu chậm</p>
                    <p class="text-white/60 text-sm">Tăng throttle từ từ, đừng vọt lên ngay</p>
                  </div>
                </div>
                <div class="flex gap-3 items-start">
                  <span class="text-xl">2️⃣</span>
                  <div>
                    <p class="text-white font-bold">Giữ drone đối diện bạn</p>
                    <p class="text-white/60 text-sm">Khi drone quay đầu, điều khiển sẽ bị đảo chiều!</p>
                  </div>
                </div>
                <div class="flex gap-3 items-start">
                  <span class="text-xl">3️⃣</span>
                  <div>
                    <p class="text-white font-bold">Hover trước</p>
                    <p class="text-white/60 text-sm">Thành thạo giữ altitude ổn định trước khi di chuyển</p>
                  </div>
                </div>
                <div class="flex gap-3 items-start">
                  <span class="text-xl">4️⃣</span>
                  <div>
                    <p class="text-white font-bold">Sử dụng Training Mode</p>
                    <p class="text-white/60 text-sm">Giới hạn góc nghiêng để tránh lật drone</p>
                  </div>
                </div>
              </div>
            `,
          },
        ],
        keyTakeaways: [
          "Kết hợp W/A/S/D để bay theo đường thẳng",
          "Throttle + Yaw để xoay tại chỗ",
          "Luôn giữ drone đối diện để điều khiển dễ dàng",
          "Thực hành nhiều để thành thạo!",
        ],
      },
      experiment: {
        instruction: "Thử bay theo hình vuông: Tăng throttle → Bay tới (W) → Xoay (←) → Bay tới → Xoay → ...",
        successCriteria: "Hoàn thành hình vuông và quay về vị trí ban đầu",
      },
      highlightedControls: ["throttle", "pitch", "roll", "yaw"],
    },
  ],
};

// Default export for easy importing
export default QUADCOPTER_CONFIG;
