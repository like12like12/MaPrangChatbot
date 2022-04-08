const config = {
  //? ========================use control========================
  topic: {
    light: ["light/action", { turn_on: "on", turn_off: "off" }],
    computer: ["computer/action", { turn_on: "on", turn_off: "off" }],
    plug: ["plug/action", { turn_on: "on", turn_off: "off" }],
    air: ["air/action", {turn_on: "on", turn_off: "off", settemp:"settemp"}],
    purify: [["airpurifier/action"], {turn_on: "on", turn_off: "off", setmode:"setmode"}],
  },
  //? ==========================intent=========================
  device: {
    light: [["ไฟ", "หลอดไฟ"], ["light"]],
    computer: [["คอมพิวเตอร์", "คอม"], ["computer"]],
    plug: [["ปลั๊ก", "ปลั๊กไฟ"], ["plug"]],
    air: [
      ["แอร์", "เครื่องปรับอากาศ"],
      ["air", "airconditioner"],
    ],
    purify: [
      ["เครื่องฟอกอากาศ", "เครื่องฟอก", "ฟอก"],
      ["airpurify", "air purify", "purify"],
    ],
  },
  intent: {
    turn_off: [["ปิด"], ["off", "close", "turn off"]],
    turn_on: [["เปิด"], ["on", "open", "turn on"]],
    settemp: [
      ["ตั้งอุณหภูมิ", "อุณหภูมิ"],
      ["temp", "temperature"],
    ],
    setmode: [["ตั้งโหมด", "โหมด"], ["mode"]],
    state: [
      ["สถานะ", "state"],
      ["states", "status"],
    ],
    detailDevice: [["รายละเอียด"], ["detail"]],
    greeting: [
      ["สวัสดี", "ดีคับ", "หวัดดี"],
      ["hello", "hi"],
    ],
    help: [["ทำอะไรได้บ้าง", "ทำอะไรได้", "ทำไรได้", "ช่วยเหลือ"], ["help"]],
    command: [
      ["คำสั่งทั้งหมด", "คำสั่ง"],
      ["all command", "command"],
    ],
    thank: [
      ["ขอบคุณ", "ขอบคุณครับ", "ขอบคุณค่ะ"],
      ["thank", "thanks", "thank you", "thank you very much"],
    ],
  },
  //?=========================response========================
  responding: {
    greeting: ["สวัสดี", "Hello"],
    thank: ["ยินดีเสมอ", "My pleasure"],
    sorry: ["ขออภัย", "Apologize"],
    help: ["สามารถสั่งงานอุปกรณ์ได้ เช่น พิมพ์ว่า'เปิดไฟ'\n---'command' ดูคำสั่ง\n---'device' ดูอุปกรณ์ของคุณ", "You can sent messages to control device (ex. turn on light)\n---'command' all command\n---'device' your device"],
    command: ["คำสั่งทั้งหมด \n เปิดไฟ \n ปิดไฟ \n สลับไฟ \n ตั้งอุณหภูมิ \n สถานะ \n รายละเอียด", "all command \n turn on light \n turn off light \n toggle light \n set temperature \n state \n detail"],
    no_permission: ["ขออภัย คุณไม่มีสิทธิ์ใช้งานกรุณาติดต่อผู้ดูแลระบบ", "I apologized, You don't have the right, Kindly contact our admin."],
    unknown: ["ขออภัย ไม่เข้าใจคำสั่ง", "I apologized, I don't understand command."],
    declined: ["ขออภัย คำขอของคุณถูกปฏิเสธ", "I apologized, Your request is declined."],
  },

  lang: ["th", "en"],
  whitelist: ["1481143398571396", "1468764963196049", "1955860347820370"],
};
module.exports = config;