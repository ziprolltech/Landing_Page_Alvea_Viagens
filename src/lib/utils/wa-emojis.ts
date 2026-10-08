// WhatsApp-safe emoji constants built with String.fromCodePoint() at runtime.
// This avoids source-file encoding issues and webpack bundler corruption of
// 4-byte UTF-8 sequences that would occur with emoji literals in source code.
// Import this wherever a WhatsApp message is composed — do NOT duplicate these.

export const EMOJI = {
  plane:     String.fromCodePoint(0x2708, 0xFE0F),
  clipboard: String.fromCodePoint(0x1F4CB),
  takeoff:   String.fromCodePoint(0x1F6EB),
  landing:   String.fromCodePoint(0x1F6EC),
  calendar:  String.fromCodePoint(0x1F4C5),
  people:    String.fromCodePoint(0x1F465),
  seat:      String.fromCodePoint(0x1F4BA),
  office:    String.fromCodePoint(0x1F3E2),
  numbers:   String.fromCodePoint(0x1F522),
  stopwatch: String.fromCodePoint(0x23F1, 0xFE0F),
  stop:      String.fromCodePoint(0x1F6D1),
  money:     String.fromCodePoint(0x1F4B0),
  info:      String.fromCodePoint(0x2139, 0xFE0F),
  speech:    String.fromCodePoint(0x1F4AC),
  smile:     String.fromCodePoint(0x1F60A),
  person:    String.fromCodePoint(0x1F464),
  phone:     String.fromCodePoint(0x1F4F1),
  email:     String.fromCodePoint(0x1F4E7),
  globe:     String.fromCodePoint(0x1F30E),
  pin:       String.fromCodePoint(0x1F4CD),
}
