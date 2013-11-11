function Insn(opcode, modifier, aMode, aField, bMode, bField) {
	return { opcode: opcode, modifier: modifier, aMode: aMode, aField: aField, 
		bMode: bMode, bField: bField };
}

exports.Insn = Insn;
exports.Opcode = {
	DAT: 'DAT', MOV: 'MOV', ADD: 'ADD', SUB: 'SUB', MUL: 'MUL', DIV: 'DIV',
	MOD: 'MOD', JMP: 'JMP', JMZ: 'JMZ', JMN: 'JMN', DJN: 'DJN', CMP: 'CMP', 
	SEQ: 'SEQ', SNE: 'SNE', SLT: 'SLT', SPL: 'SPL', NOP: 'NOP', ORG: 'ORG'
};
exports.Modifier = {
	A: '.A', B: '.B', AB: '.AB', BA: '.BA', F: '.F', X: '.X', I: '.I'
};
exports.Mode = {
	Immediate: '#', Direct: '$', 
	AIndirect: '*', BIndirect: '@', 
	APredec: '{', BPredec: '<',
	APostinc: '}', BPostinc: '>'
}

function Warrior(code) {
	if (!(this instanceof Warrior)) return new Warrior(code);

	this.code = code;
	this.nTasks = 0;
}

exports.Warrior = Warrior;