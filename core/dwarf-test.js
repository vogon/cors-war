// per ICWS94 (http://corewar.co.uk/icws94.txt):
// 0387 3.5 Example Load File
// 0388 ;redcode
// 0389 ;name          Dwarf
// 0390 ;author        A. K. Dewdney
// 0391 ;version       94.1
// 0392 ;date          April 29, 1993
// 0393 ;strategy      Bombs every fourth instruction.
// 0394 ;assert        CORESIZE % 4 == 0
// 0395 ORG     1          ; Indicates execution begins with the second
// 0396                    ; instruction (ORG is not actually loaded, and is
// 0397                    ; therefore not counted as an instruction).
// 0398 DAT.F   #0, #0     ; Pointer to target instruction.
// 0399 ADD.AB  #4, $-1    ; Increments pointer by step.
// 0400 MOV.AB  #0, @-2    ; Bombs target instruction.
// 0401 JMP.A   $-2, #0    ; Loops back two instructions.

// exports.Mode = {
// 	Immediate = '#', Direct = '$', 
// 	AIndirect = '*', BIndirect = '@', 
// 	APredec = '{', BPredec = '<',
// 	APostinc = '}', BPostinc = '>'
// }

// function Insn(opcode, modifier, aMode, aField, bMode, bField) {
// 	return { opcode: opcode, modifier: modifier, aMode: aMode, aField: aField, 
// 		bMode: bMode, bField: bField };
// }

var warrior = require('./warrior'),
	Insn = warrior.Insn,
	Opcode = warrior.Opcode,
	M = warrior.Modifier,
	Mode = warrior.Mode;

module.exports = warrior.Warrior([
	Insn(Opcode.DAT, M.F, Mode.Immediate, 0, Mode.Immediate, 0),
	Insn(Opcode.ADD, M.AB, Mode.Immediate, 4, Mode.Direct, -1),
	Insn(Opcode.MOV, M.AB, Mode.Immediate, 0, Mode.BIndirect, -2),
	Insn(Opcode.JMP, M.A, Mode.Direct, -2, Mode.Immediate, 0)
]);