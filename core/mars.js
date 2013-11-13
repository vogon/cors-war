module.exports = Mars;

// 0879 /* There is one support function used to limit the range of */
// 0880 /* reading from Core and writing to Core relative to the    */
// 0881 /* current instruction.  Behaviour is as expected (a small  */
// 0882 /* core within Core) only if the limits are factors of the  */
// 0883 /* size of Core.                                            */

// 0884 static Address Fold(
// 0885    Address  pointer,    /* The pointer to fold into the desired range.  */
// 0886    Address  limit,      /* The range limit.                             */
// 0887    Address  M           /* The size of Core.                            */
// 0888 ) {
// 0889    Address  result;

// 0890    result = pointer % limit;
// 0891    if ( result > (limit/2) ) {
// 0892       result += M - limit;
// 0893    };
// 0894    return(result);
// 0895 }

// directly converted from ICWS'94
function fold(pointer, limit, m) {
  var result = pointer % limit;
  if (result > (limit / 2)) {
    result += m - limit;
  }
  return result;
}

var warrior = require('./warrior'),
    Opcode = warrior.Opcode,
    Modifier = warrior.Modifier,
    Mode = warrior.Mode;

function evalInsn(w, pc, core, m, readLimit, writeLimit) {
  var ir;   // current insn
  var ira;  // insn at A-operand
  var irb;  // insn at B-operand
  // PC-relative pointers
  var rpa;  // read pointer A
  var wpa;  // write pointer A
  var rpb;  // read pointer B
  var wpb;  // write pointer B
  var pip;  // post-increment target

  var nextPCs = [];

  // console.log(core[pc]);
  ir = core[pc].insn;
  // console.log('@' + pc + ': ' + ir.opcode + ir.modifier +
  //   ' ' + ir.aMode + ir.aField + ', ' + ir.bMode + ir.bField);

  /* Next, the A-operand is completely evaluated.             */

  /* For instructions with an Immediate A-mode, the Pointer A */
  /* points to the source of the current instruction.         */
  if (ir.aMode == Mode.Immediate) {
    rpa = wpa = 0;
  } else {
    /* For instructions with a Direct A-mode, the Pointer A     */
    /* points to the instruction IR.ANumber away, relative to   */
    /* the Program Counter.                                     */
    /* Note that implementing Core as an array necessitates     */
    /* doing all Address arithmetic modulus the size of Core.   */
    rpa = fold(ir.aField, readLimit, m);
    wpa = fold(ir.aField, writeLimit, m);

    /* For instructions with A-indirection in the A-operand     */
    /* (A-number Indirect, A-number Predecrement,               */
    /* and A-number Postincrement A-modes):                     */
    if (ir.aMode == Mode.AIndirect
        || ir.aMode == Mode.APredec
        || ir.aMode == Mode.APostinc) {

      /* For instructions with Predecrement A-mode, the A-Field   */
      /* of the instruction in Core currently pointed to by the   */
      /* Pointer A is decremented (M - 1 is added).               */
      if (ir.aMode == Mode.APredec) {
        core[((pc + wpa) % m)].insn.aField =
           (core[((pc + wpa) % m)].insn.aField + m - 1) % m;
      }

      /* For instructions with Postincrement A-mode, the A-Field  */
      /* of the instruction in Core currently pointed to by the   */
      /* Pointer A will be incremented.                           */
      if (ir.aMode == Mode.APostinc) {
        pip = (pc + wpa) % m;
      }

      /* For instructions with A-indirection in the A-operand,    */
      /* Pointer A ultimately points to the instruction           */
      /* Core[((PC + PCA) % M)].ANumber away, relative to the     */
      /* instruction pointed to by Pointer A.                     */
      rpa = fold(
        (rpa + core[((pc + rpa) % m)].insn.aField), readLimit, m
      );
      wpa = fold(
        (wpa + core[((pc + wpa) % m)].insn.aField), writeLimit, m
      );
    }

    /* For instructions with B-indirection in the A-operand     */
    /* (B-number Indirect, B-number Predecrement,               */
    /* and B-number Postincrement A-modes):                     */
    if (ir.aMode == Mode.BIndirect
        || ir.aMode == Mode.BPredec
        || ir.aMode == Mode.BPostinc) {

      /* For instructions with Predecrement A-mode, the B-Field   */
      /* of the instruction in Core currently pointed to by the   */
      /* Pointer A is decremented (M - 1 is added).               */
      if (ir.aMode == Mode.BPredec) {
        core[((pc + wpa) % m)].insn.bField =
           (core[((pc + wpa) % m)].insn.bField + m - 1) % m;
      }

      /* For instructions with Postincrement A-mode, the B-Field  */
      /* of the instruction in Core currently pointed to by the   */
      /* Pointer A will be incremented.                           */
      if (ir.aMode == Mode.BPostinc) {
        pip = (pc + wpa) % m;
      }

      /* For instructions with B-indirection in the A-operand,    */
      /* Pointer A ultimately points to the instruction           */
      /* Core[((PC + PCA) % M)].BNumber away, relative to the     */
      /* instruction pointed to by Pointer A.                     */
      rpa = fold(
        (rpa + core[((pc + rpa) % m)].insn.bField), readLimit, m
      );
      wpa = fold(
        (wpa + core[((pc + wpa) % m)].insn.bField), writeLimit, m
      );
    }
  }

  /* The Instruction Register A is a copy of the instruction  */
  /* pointed to by Pointer A.                                 */
  ira = core[((pc + rpa) % m)].insn;

  /* If the A-mode was post-increment, now is the time to     */
  /* increment the instruction in core.                       */
  if (ir.aMode == Mode.APostinc) {
    core[pip].insn.aField = (core[pip].insn.aField + 1) % m;
  } else if (ir.aMode == Mode.BPostinc) {
    core[pip].insn.bField = (core[pip].insn.bField + 1) % m;
  }

  /* The Pointer B and the Instruction Register B are         */
  /* evaluated in the same manner as their A counterparts.    */
  if (ir.bMode == Mode.Immediate) {
    rpb = wpb = 0;
  } else {
    rpb = fold(ir.bField, readLimit, m);
    wpb = fold(ir.bField, writeLimit, m);

    if (ir.bMode == Mode.AIndirect
        || ir.bMode == Mode.APostinc
        || ir.bMode == Mode.APredec) {
      if (ir.bMode == Mode.APredec) {
        core[((pc + wpb) % m)].insn.aField =
          (core[((pc + wpb) % m)].insn.aField + m - 1) % m;
      } else if (ir.bMode == Mode.APostinc) {
        pip = (pc + wpb) % m;
      }

      rpb = fold(
        (rpb + core[((pc + rpb) % m)].insn.aField), readLimit, m
      );
      wpb = fold(
        (wpb + core[((pc + wpb) % m)].insn.aField), writeLimit, m
      );
    };
    
    if (ir.bMode == Mode.BIndirect
        || ir.bMode == Mode.BPredec
        || ir.bMode == Mode.BPostinc) {
      if (ir.bMode == Mode.BPredec) {
        core[((pc + wpb) % m)].insn.bField =
          (core[((pc + wpb) % m)].insn.bField + m - 1) % m;
      } else if (ir.bMode == Mode.BPostinc) {
        pip = (pc + wpb) % m;
      }

      rpb = fold(
        (rpb + core[((pc + rpb) % m)].insn.bField), readLimit, m
      );
      wpb = fold(
        (wpb + core[((pc + wpb) % m)].insn.bField), writeLimit, m
      );
    }
  }

  irb = core[((pc + rpb) % m)].insn;

  if (ir.bMode == Mode.APostinc) {
    core[pip].insn.aField = (core[pip].insn.aField + 1) % m;
  }
  else if (ir.bMode == Mode.BPostinc) {
    core[pip].insn.bField = (core[pip].insn.bField + 1) % m;
  }

  // replacement for ICWS's ARITH() macro
  // takes a two-operand lambda for op
  function arith(fn) {
    // console.log('arith: ir = ' + ir);
    // console.log('arith: ira = ' + ira.opcode + ira.modifier +
    //   ' ' + ira.aMode + ira.aField + ', ' + ira.bMode + ira.bField);
    // console.log('arith: irb = ' + irb.opcode + irb.modifier +
    //   ' ' + irb.aMode + irb.aField + ', ' + irb.bMode + irb.bField);

  // console.log('@' + pc + ': ' + ir.opcode + ir.modifier +
  //   ' ' + ir.aMode + ir.aField + ', ' + ir.bMode + ir.bField);


    switch (ir.modifier) {
      case Modifier.A: // A-number op A-number -> A-number
        core[((pc + wpb) % m)].insn.aField = fn(irb.aField, ira.aField) % m;
        break;
      case Modifier.B: // B-number op B-number -> B-number
        core[((pc + wpb) % m)].insn.bField = fn(irb.bField, ira.bField) % m;
        break;
      case Modifier.AB: // A-number op B-number -> B-number
        // console.log(ir.opcode + ir.modifier + ': writing ' +
        //   ira.aField + ' op ' + irb.bField + ' = ' +
        //   fn(ira.aField, irb.bField) + ' @' + ((pc + wpb) % m));
        core[((pc + wpb) % m)].insn.bField = fn(irb.bField, ira.aField) % m;
        break;
      case Modifier.BA: // B-number op A-number -> A-number
        core[((pc + wpb) % m)].insn.aField = fn(irb.aField, ira.bField) % m;
        break;
      case Modifier.F: 
      case Modifier.I: // .A + .B
        core[((pc + wpb) % m)].insn.aField = fn(irb.aField, ira.aField) % m;
        core[((pc + wpb) % m)].insn.bField = fn(irb.bField, ira.bField) % m;
        break;
      case Modifier.X: // .AB + .BA
        core[((pc + wpb) % m)].insn.bField = fn(irb.bField, ira.aField) % m;
        core[((pc + wpb) % m)].insn.aField = fn(irb.aField, ira.bField) % m;
        break;
      default:
        break;
    }
  }

  // replacement for ICWS's ARITH_DIV() macro
  // takes a two-operand lambda for op; returns true if execution 
  // continues
  function arithDiv(fn) {
    switch (ir.modifier) {
      case Modifier.A: // A-number op A-number -> A-number
        if (ira.aField != 0) {
          core[((pc + wpb) % m)].insn.aField = fn(irb.aField, ira.aField) % m;
          return true;
        } else {
          return false;
        }
      case Modifier.B: // B-number op B-number -> B-number
        if (ira.bField != 0) {
          core[((pc + wpb) % m)].insn.bField = fn(irb.bField, ira.bField) % m;
          return true;
        } else {
          return false;
        }
      case Modifier.AB: // A-number op B-number -> B-number
        if (ira.aField != 0) {
          core[((pc + wpb) % m)].insn.bField = fn(irb.bField, ira.aField) % m;
          return true;
        } else {
          return false;
        }
      case Modifier.BA: // B-number op A-number -> A-number
        if (ira.bField != 0) {
          core[((pc + wpb) % m)].insn.aField = fn(irb.aField, ira.bField) % m;
          return true;
        } else {
          return false;
        }
      case Modifier.F: 
      case Modifier.I: // .A + .B
        var result = true;

        if (ira.aField != 0) {
          core[((pc + wpb) % m)].insn.aField = fn(irb.aField, ira.aField) % m;
        } else {
          result = false;
        }

        if (ira.bField != 0) {
          core[((pc + wpb) % m)].insn.bField = fn(irb.bField, ira.bField) % m;
        } else {
          result = false;
        }

        return result;
      case Modifier.X: // .AB + .BA
        var result = true;

        if (ira.aField != 0) {
          core[((pc + wpb) % m)].insn.aField = fn(irb.bField, ira.aField) % m;
        } else {
          result = false;
        }

        if (ira.bField != 0) {
          core[((pc + wpb) % m)].insn.bField = fn(irb.aField, ira.bField) % m;
        } else {
          result = false;
        }
        
        return result;
      default:
        break;
    }
  }

  /* Execution of the instruction can now proceed.            */
  switch (ir.opcode) {
    /* Instructions with a DAT opcode have no further function. */
    /* The current task's Program Counter is not updated and is */
    /* not returned to the task queue, effectively removing the */
    /* task.                                                    */
    case Opcode.DAT:
      break;
    /* MOV replaces the B-target with the A-value and queues    */
    /* the next instruction.                                    */
    case Opcode.MOV:
      switch (ir.modifier) {
        case Modifier.A: // A-number -> A-number
          core[((pc + wpb) % m)].insn.aField = ira.aField;
          break;
        case Modifier.B: // B-number -> B-number
          core[((pc + wpb) % m)].insn.bField = ira.bField;
          break;
        case Modifier.AB: // A-number -> B-number
          // console.log("MOV.AB: writing " + ira.aField + " @" + ((pc + wpb) % m));
          core[((pc + wpb) % m)].insn.bField = ira.aField;
          break;
        case Modifier.BA: // B-number -> A-number
          core[((pc + wpb) % m)].insn.aField = ira.bField;
          break;
        case Modifier.F: // .A + .B
          core[((pc + wpb) % m)].insn.aField = ira.aField;
          core[((pc + wpb) % m)].insn.bField = ira.bField;
          break;
        case Modifier.X: // .AB + .BA
          core[((pc + wpb) % m)].insn.bField = ira.aField;
          core[((pc + wpb) % m)].insn.aField = ira.bField;
          break;
        case Modifier.I: // insn -> insn
          core[((pc + wpb) % m)].insn = ira;
          break;
        default:
          break;
      }

      // queue up next insn
      nextPCs.push((pc + 1) % m);
      break;
    case Opcode.ADD:
      arith(function(a, b) { return a + b; });
      nextPCs.push((pc + 1) % m);
      break;
    case Opcode.SUB:
      arith(function(a, b) { return a + m - b; });
      nextPCs.push((pc + 1) % m);
      break;
    case Opcode.MUL:
      arith(function(a, b) { return a * b; });
      nextPCs.push((pc + 1) % m);
      break;
    /* DIV and MOD replace the B-target with the integral       */
    /* quotient (for DIV) or remainder (for MOD) of the B-value */
    /* by the A-value, and queues the next instruction.         */
    /* Process is removed from task queue if A-value is zero.   */
    case Opcode.DIV:
      if (arithDiv(function(a, b) { return a / b; }))
      {
        nextPCs.push((pc + 1) % m);
      }
      break;
    case Opcode.MOD:
      if (arithDiv(function(a, b) { return a % b; }))
      {
        nextPCs.push((pc + 1) % m);
      }
      break;
    /* JMP queues the sum of the Program Counter and the        */
    /* A-pointer.                                               */
    case Opcode.JMP:
      nextPCs.push((pc + rpa) % m);
      break;
    /* JMZ queues the sum of the Program Counter and Pointer A  */
    /* if the B-value is zero.  Otherwise, it queues the next   */
    /* instruction.                                             */
    case Opcode.JMZ:
      switch (ir.modifier) {
        case Modifier.A:
        case Modifier.BA:
          if (irb.aField == 0) {
            nextPCs.push((pc + rpa) % m);
          } else {
            nextPCs.push((pc + 1) % m);
          }
          break;
        case Modifier.B:
        case Modifier.AB:
          if (irb.bField == 0) {
            nextPCs.push((pc + rpb) % m);
          } else {
            nextPCs.push((pc + 1) % m);
          }
          break;
        case Modifier.F:
        case Modifier.X:
        case Modifier.I:
          if ((irb.aField == 0) && (irb.bField == 0)) {
            nextPCs.push((pc + rpa) % m);
          } else {
            nextPCs.push((pc + 1) % m);
          }
          break;
        default:
          break;
      }
      break;
    /* JMN queues the sum of the Program Counter and Pointer A  */
    /* if the B-value is not zero.  Otherwise, it queues the    */
    /* next instruction.                                        */
    case Opcode.JMN:
      switch (ir.modifier) {
        case Modifier.A:
        case Modifier.BA:
          if (irb.aField != 0) {
            nextPCs.push((pc + rpa) % m);
          } else {
            nextPCs.push((pc + 1) % m);
          }
          break;
        case Modifier.B:
        case Modifier.AB:
          if (irb.bField != 0) {
            nextPCs.push((pc + rpb) % m);
          } else {
            nextPCs.push((pc + 1) % m);
          }
          break;
        case Modifier.F:
        case Modifier.X:
        case Modifier.I:
          if ((irb.aField != 0) || (irb.bField != 0)) {
            nextPCs.push((pc + rpa) % m);
          } else {
            nextPCs.push((pc + 1) % m);
          }
          break;
        default:
          break;
      }
      break;
    // TODO: DJN, CMP, SEQ, SNE, SLT, SPL, NOP
  }


    // /* DJN (Decrement Jump if Not zero) decrements the B-value  */
    // /* and the B-target, then tests if the B-value is zero.  If */
    // /* the result is not zero, the sum of the Program Counter   */
    // /* and Pointer A is queued.  Otherwise, the next            */
    // /* instruction is queued.                                   */

    //    case DJN:
    //       switch (IR.Modifier) {
    //       case A:
    //       case BA:
    //          Core[((PC + WPB) % M)].ANumber =
    //             (Core[((PC + WPB) % M)].ANumber + M - 1) % M
    //          ;
    //          IRB.ANumber -= 1;
    //          if (IRB.ANumber != 0) {
    //             Queue(W, RPA);
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case B:
    //       case AB:
    //          Core[((PC + WPB) % M)].BNumber =
    //             (Core[((PC + WPB) % M)].BNumber + M - 1) % M
    //          ;
    //          IRB.BNumber -= 1;
    //          if (IRB.BNumber != 0) {
    //             Queue(W, RPA);
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case F:
    //       case X:
    //       case I:
    //          Core[((PC + WPB) % M)].ANumber =
    //             (Core[((PC + WPB) % M)].ANumber + M - 1) % M
    //          ;
    //          IRB.ANumber -= 1;
    //          Core[((PC + WPB) % M)].BNumber =
    //             (Core[((PC + WPB) % M)].BNumber + M - 1) % M
    //          ;
    //          IRB.BNumber -= 1;
    //          if ( (IRB.ANumber != 0) || (IRB.BNumber != 0) ) {
    //             Queue(W, RPA);
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       default:
    //          return(UNDEFINED);
    //          break;
    //       };
    //       break;


    // /* SEQ/CMP compares the A-value and the B-value. If there   */
    // /* are no differences, then the instruction after the next  */
    // /* instruction is queued.  Otherwise, the next instrution   */
    // /* is queued.                                               */

    //    case CMP:
    //       switch (IR.Modifier) {
    //       case A:
    //          if (IRA.ANumber == IRB.ANumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case B:
    //          if (IRA.BNumber == IRB.BNumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case AB:
    //          if (IRA.ANumber == IRB.BNumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case BA:
    //          if (IRA.BNumber == IRB.ANumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case F:
    //          if ( (IRA.ANumber == IRB.ANumber) &&
    //               (IRA.BNumber == IRB.BNumber)
    //          ) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case X:
    //          if ( (IRA.ANumber == IRB.BNumber) &&
    //               (IRA.BNumber == IRB.ANumber)
    //          ) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case I:
    //          if ( (IRA.Opcode == IRB.Opcode) &&
    //               (IRA.Modifier == IRB.Modifier) &&
    //               (IRA.AMode == IRB.AMode) &&
    //               (IRA.ANumber == IRB.ANumber) &&
    //               (IRA.BMode == IRB.BMode) &&
    //               (IRA.BNumber == IRB.BNumber)
    //          ) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       default:
    //          return(UNDEFINED);
    //          break;
    //       };
    //       break;


    // /* SNE compares the A-value and the B-value. If there       */
    // /* is a difference, then the instruction after the next     */
    // /* instruction is queued.  Otherwise, the next instrution   */
    // /* is queued.                                               */

    //    case SNE:
    //       switch (IR.Modifier) {
    //       case A:
    //          if (IRA.ANumber != IRB.ANumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case B:
    //          if (IRA.BNumber != IRB.BNumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case AB:
    //          if (IRA.ANumber != IRB.BNumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case BA:
    //          if (IRA.BNumber != IRB.ANumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case F:
    //          if ( (IRA.ANumber != IRB.ANumber) ||
    //               (IRA.BNumber != IRB.BNumber)
    //          ) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case X:
    //          if ( (IRA.ANumber != IRB.BNumber) ||
    //               (IRA.BNumber != IRB.ANumber)
    //          ) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case I:
    //          if ( (IRA.Opcode != IRB.Opcode) ||
    //               (IRA.Modifier != IRB.Modifier) ||
    //               (IRA.AMode != IRB.AMode) ||
    //               (IRA.ANumber != IRB.ANumber) ||
    //               (IRA.BMode != IRB.BMode) ||
    //               (IRA.BNumber != IRB.BNumber)
    //          ) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       default:
    //          return(UNDEFINED);
    //          break;
    //       };
    //       break;


    // /* SLT (Skip if Less Than) queues the instruction after the */
    // /* next instruction if A-value is less than B-value.        */
    // /* Otherwise, the next instruction is queued.  Note that no */
    // /* value is less than zero because only positive values can */
    // /* be represented in core.                                  */

    //    case SLT :
    //       switch (IR.Modifier) {
    //       case A:
    //          if (IRA.ANumber < IRB.ANumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case B:
    //          if (IRA.BNumber < IRB.BNumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case AB:
    //          if (IRA.ANumber < IRB.BNumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case BA:
    //          if (IRA.BNumber < IRB.ANumber) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case F:
    //       case I:
    //          if ( (IRA.ANumber < IRB.ANumber) &&
    //               (IRA.BNumber < IRB.BNumber)
    //          ) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       case X:
    //          if ( (IRA.ANumber < IRB.BNumber) &&
    //               (IRA.BNumber < IRB.ANumber)
    //          ) {
    //             Queue(W, ((PC + 2) % M));
    //          } else {
    //             Queue(W, ((PC + 1) % M));
    //          };
    //          break;
    //       default:
    //          return(UNDEFINED);
    //          break;
    //       };
    //       break;


    // /* SPL queues the next instruction and also queues the sum  */
    // /* of the Program Counter and Pointer A.                    */

    //    case SPL:
    //       Queue(W, ((PC + 1) % M));
    //       Queue(W, RPA);
    //       break;


    // /* NOP queues the next instruction.                         */

    //    case NOP:
    //       Queue(W, ((PC + 1) % M));
    //       break;


    // /* Any other opcode is undefined.                           */

    //    default:
    //       return(UNDEFINED);
    //    };


    // /* We are finished.                                         */

    //    return(SUCCESS);
    // }

    return nextPCs;
}

function Mars(coreSize, initialInsn, maxTasks, minSeparation, readDistance,
    writeDistance) {
  if (!(this instanceof Mars)) 
    return new Mars(coreSize, initialInsn, maxTasks, minSeparation, 
      readDistance, writeDistance);

  this.core = new Array(coreSize);
  this.coreSize = coreSize;

  // flood-fill core with the initial insn
  for (var i = 0; i < coreSize; i++) {
    this.core[i] = { insn: initialInsn, owner: null };
  }

  this.taskQueue = [ null ];
  this.maxTasks = maxTasks;
  this.minSeparation = minSeparation;
  this.readDistance = readDistance;
  this.writeDistance = writeDistance;

  var that = this;

  // private methods:

  // dequeue a task from the task queue
  function nextTask() {
    var head = that.taskQueue.shift();

    if (head == null) {
      // end-of-cycle sentinel; re-enqueue and return null
      that.taskQueue.push(null);
      return null;
    } else {
      // actual task
      head.warrior.nTasks -= 1;
      return head;
    }
  }

  // enqueue a task on the task queue
  function enqueue(warrior, pc) {
    if (warrior.nTasks >= this.maxTasks) {
      // warrior already has too many tasks scheduled
      return false;
    } else {
      that.taskQueue.push({ warrior: warrior, pc: pc });
      warrior.nTasks += 1;
      return true;
    }
  }

  // run one instruction as the given warrior at the given PC
  function runOneInsn(warrior, pc) {
    // function evalInsn(w, pc, core, m, readLimit, writeLimit) {

    var nextPCs = evalInsn(warrior, pc, that.core, that.coreSize,
      that.readDistance, that.writeDistance);

    for (var i = 0; i < nextPCs.length; i++) {
      enqueue(warrior, nextPCs[i]);
    }
  }

  // privileged methods:

  // load a new warrior into core
  this.load = function(warrior, org) {
    // TODO: select initial offset respecting min-separation
    var initialOffset = Math.floor(Math.random() * this.coreSize);
    var code = warrior.code;

    // copy code into core
    for (var i = 0; i < code.length; i++) {
      var offset = (initialOffset + i) % this.coreSize;
      this.core[offset] = { insn: code[i], owner: warrior };
    }

    // enqueue initial task
    var orgOffset = (initialOffset + org) % this.coreSize;
    enqueue(warrior, orgOffset);
  }

  // run tasks from the task queue until we hit the end-of-cycle sentinel
  this.step = function() {
    while (true) {
      var next = nextTask();

      if (next != null) {
        runOneInsn(next.warrior, next.pc);
      } else {
        break;
      }
    }
  }
}