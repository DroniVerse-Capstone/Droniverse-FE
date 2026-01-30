export type Locale = "vi" | "en";

export const LOCALE: Locale = "vi";

export const translations = {
    vi: {
        toolbar: {
            title: "SANDBOX DRONE",
            run: "Chạy",
            debug: "Debug",
            reset: "Đặt lại",
            settings: "Cài đặt",
            backToHome: "Trang chủ",
        },
        status: {
            ready: "Sẵn sàng",
            running: "Đang chạy…",
            finished: "Hoàn thành",
            idle: "Chờ lệnh",
        },
        blockly: {
            categories: {
                motion: "📍 Di chuyển",
                loops: "🔄 Vòng lặp",
                logic: "🧠 Điều kiện",
                sensors: "📡 Cảm biến",
                math: "➗ Toán học",
                effects: "🎵 Hiệu ứng",
                input: "⌨️ Input",
                variables: "📦 Biến",
            },
            blocks: {
                takeOff: {
                    message: "Cất cánh",
                    tooltip: "Kích hoạt drone cất cánh rời khỏi mặt đất",
                },
                up: {
                    message: "Bay lên %1 m",
                    tooltip: "Tăng độ cao drone theo mét",
                },
                down: {
                    message: "Đi xuống %1 m",
                    tooltip: "Giảm độ cao drone theo mét",
                },
                left: {
                    message: "Sang trái %1 m",
                    tooltip: "Di chuyển drone sang trái theo trục X",
                },
                right: {
                    message: "Sang phải %1 m",
                    tooltip: "Di chuyển drone sang phải theo trục X",
                },
                forward: {
                    message: "Tiến %1 m",
                    tooltip: "Di chuyển drone về phía trước",
                },
                backward: {
                    message: "Lùi %1 m",
                    tooltip: "Di chuyển drone về phía sau",
                },
                turnRight: {
                    message: "Xoay phải %1°",
                    tooltip: "Quay drone sang phải theo độ",
                },
                turnLeft: {
                    message: "Xoay trái %1°",
                    tooltip: "Quay drone sang trái theo độ",
                },
                land: {
                    message: "Hạ cánh",
                    tooltip: "Hạ drone xuống đất",
                },
                repeat: {
                    message: "Lặp %1 lần",
                    tooltip: "Lặp lại các lệnh bên trong N lần",
                },
                if: {
                    message: "Nếu %1",
                    tooltip: "Thực hiện nếu điều kiện đúng",
                },
                ifElse: {
                    message: "Nếu %1",
                    tooltip: "Thực hiện theo điều kiện",
                },
                isObstacleAhead: {
                    message: "có vật cản phía trước?",
                    tooltip: "Kiểm tra xem có vật cản phía trước drone",
                },
                amountValue: {
                    tooltip: "Giá trị số để nối ngang",
                },
                mathOperation: {
                    tooltip: "Phép toán giữa hai số",
                },
                playSound: {
                    message: "Phát âm thanh %1",
                    tooltip: "Phát âm thanh cho drone",
                },
                inputNumber: {
                    message: "Nhập số %1",
                    tooltip: "Nhập một số từ người dùng",
                },
            },
        },
    },
    en: {
        toolbar: {
            title: "SANDBOX DRONE",
            run: "Run",
            debug: "Debug",
            reset: "Reset",
            settings: "Settings",
            backToHome: "Home",
        },
        status: {
            ready: "Ready",
            running: "Running…",
            finished: "Finished",
            idle: "Idle",
        },
        blockly: {
            categories: {
                motion: "📍 Motion",
                loops: "🔄 Loops",
                logic: "🧠 Logic",
                sensors: "📡 Sensors",
                math: "➗ Math",
                effects: "🎵 Effects",
                input: "⌨️ Input",
                variables: "📦 Variables",
            },
            blocks: {
                takeOff: {
                    message: "Take off",
                    tooltip: "Activate drone takeoff from ground",
                },
                up: {
                    message: "Fly up %1 m",
                    tooltip: "Increase drone altitude in meters",
                },
                down: {
                    message: "Fly down %1 m",
                    tooltip: "Decrease drone altitude in meters",
                },
                left: {
                    message: "Move left %1 m",
                    tooltip: "Move drone left along X axis",
                },
                right: {
                    message: "Move right %1 m",
                    tooltip: "Move drone right along X axis",
                },
                forward: {
                    message: "Forward %1 m",
                    tooltip: "Move drone forward",
                },
                backward: {
                    message: "Backward %1 m",
                    tooltip: "Move drone backward",
                },
                turnRight: {
                    message: "Turn right %1°",
                    tooltip: "Turn drone right by degrees",
                },
                turnLeft: {
                    message: "Turn left %1°",
                    tooltip: "Turn drone left by degrees",
                },
                land: {
                    message: "Land",
                    tooltip: "Land drone on ground",
                },
                repeat: {
                    message: "Repeat %1 times",
                    tooltip: "Repeat inner commands N times",
                },
                if: {
                    message: "If %1",
                    tooltip: "Execute if condition is true",
                },
                ifElse: {
                    message: "If %1",
                    tooltip: "Execute based on condition",
                },
                isObstacleAhead: {
                    message: "has obstacle ahead?",
                    tooltip: "Check if there's an obstacle ahead of drone",
                },
                amountValue: {
                    tooltip: "Number value for inline connection",
                },
                mathOperation: {
                    tooltip: "Math operation between two numbers",
                },
                playSound: {
                    message: "Play sound %1",
                    tooltip: "Play sound for drone",
                },
                inputNumber: {
                    message: "Input number %1",
                    tooltip: "Input a number from user",
                },
            },
        },
    },
};

export function t() {
    return translations[LOCALE];
}
