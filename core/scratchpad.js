// various snippets I want to keep around
var warrior = require('./warrior');
var Opcode = warrior.Opcode, Modifier = warrior.Modifier, Mode = warrior.Mode;
var insn = warrior.Insn(Opcode.DAT, Modifier.F, Mode.Immediate, 0, Mode.Immediate, 0);

var mars = require('./mars');
var dwarf = require('./dwarf-test');

var m = mars(8192, insn, 64, 300, 8192, 8192);

function loadDwarf() {
  // load dwarf
  m.load(dwarf, 1);
}

// check loading
// var initialTask = m.taskQueue[1];
// m.core.slice(initialTask.pc, initialTask.pc + 5);

function run() {
  // run until we run out of tasks
  while (m.taskQueue.length > 1) {
    // console.log("stepping...");
    m.step();
    // console.log("task queue:");
    // console.log(m.taskQueue);
  }
}

loadDwarf();
run();
