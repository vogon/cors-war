// per ICWS'94: http://corewar.co.uk/icws94.txt
// 0824 5.6 Example MARS Interpreter

// 0825 /************************************/
// 0826 /*                                  */
// 0827 /*            EMI94.c               */
// 0828 /*                                  */
// 0829 /* Execute MARS Instruction ala     */
// 0830 /* ICWS'94 Draft Standard.          */
// 0831 /*                                  */
// 0832 /* Last Update: November 8, 1995    */
// 0833 /*                                  */
// 0834 /************************************/

// 0835 /* This ANSI C function is the benchmark MARS instruction   */
// 0836 /* interpreter for the ICWS'94 Draft Standard.              */


// 0837 /* The design philosophy of this function is to mirror the  */
// 0838 /* standard as closely as possible, illuminate the meaning  */
// 0839 /* of the standard, and provide the definitive answers to   */
// 0840 /* questions of the "well, does the standard mean this or   */
// 0841 /* that?" variety.  Although other, different implemen-     */
// 0842 /* tations are definitely possible and encouraged; those    */
// 0843 /* implementations should produce the same results as this  */
// 0844 /* one does.                                                */


// 0845 /* The function returns the state of the system.  What the  */
// 0846 /* main program does with this information is not defined   */
// 0847 /* by the standard.                                         */

// 0848 enum SystemState {
// 0849    UNDEFINED,
// 0850    SUCCESS
// 0851 };


// 0944 /* The function is passed which warrior is currently        */
// 0945 /* executing, the address of the warrior's current task's   */
// 0946 /* current instruction, a pointer to the Core, the size of  */
// 0947 /* the Core, and the read and write limits.  It returns the */
// 0948 /* system's state after attempting instruction execution.   */

// 0949 enum SystemState EMI94(

// 0950 /* W indicates which warrior's code is executing.           */

// 0951    Warrior  W,

// 0952 /* PC is the address of this warrior's current task's       */
// 0953 /* current instruction.                                     */

// 0954    Address  PC,

// 0955 /* Core is just an array of Instructions.  Core has been    */
// 0956 /* initialized and the warriors have been loaded before     */
// 0957 /* calling this function.                                   */

// 0958    Instruction Core[],

// 0959 /* M is the size of Core.                                   */

// 0960    Address     M,

// 0961 /* ReadLimit is the limitation on read distances.           */

// 0962    Address     ReadLimit,

// 0963 /* WriteLimit is the limitation on write distances.         */

// 0964    Address     WriteLimit


// 0965 ) {


// 0966 /* This MARS stores the currently executing instruction in  */
// 0967 /* the instruction register IR.                             */

// 0968    Instruction IR;

// 0969 /* This MARS stores the instruction referenced by the       */
// 0970 /* A-operand in the instruction register IRA.               */

// 0971    Instruction IRA;

// 0972 /* This MARS stores the instruction referenced by the       */
// 0973 /* B-operand in the instruction Register IRB.               */

// 0974    Instruction IRB;

// 0975 /* All four of the following pointers are PC-relative       */
// 0976 /* (relative to the Program Counter).  Actual access of     */
// 0977 /* core must add-in the Program Counter (mod core size).    */

// 0978 /* The offset to the instruction referred to by the         */
// 0979 /* A-operand for reading is Read Pointer A (RPA).           */

// 0980    Address     RPA;

// 0981 /* The offset to the instruction referred to by the         */
// 0982 /* A-operand for writing is Write Pointer A (WPA).          */

// 0983    Address     WPA;

// 0984 /* The offset to the instruction referred to by the         */
// 0985 /* B-operand for reading is Read Pointer B (RPB).           */

// 0986    Address     RPB;

// 0987 /* The offset to the instruction referred to by the         */
// 0988 /* A-operand for writing is Write Pointer B (WPB).          */

// 0989    Address     WPB;

// 0990 /* Post-increment operands need to keep track of which      */
// 0991 /* instruction to increment.                                */

// 0992    Address     PIP;

// 0993 /* Before execution begins, the current instruction is      */
// 0994 /* copied into the Instruction Register.                    */

// 0995    IR = Core[PC];


// 0996 /* Next, the A-operand is completely evaluated.             */

// 0997 /* For instructions with an Immediate A-mode, the Pointer A */
// 0998 /* points to the source of the current instruction.         */

// 0999    if (IR.AMode == IMMEDIATE) {
// 1000       RPA = WPA = 0;
// 1001    } else {

// 1002 /* For instructions with a Direct A-mode, the Pointer A     */
// 1003 /* points to the instruction IR.ANumber away, relative to   */
// 1004 /* the Program Counter.                                     */
// 1005 /* Note that implementing Core as an array necessitates     */
// 1006 /* doing all Address arithmetic modulus the size of Core.   */

// 1007       RPA = Fold(IR.ANumber, ReadLimit, M);
// 1008       WPA = Fold(IR.ANumber, WriteLimit, M);

// 1009 /* For instructions with A-indirection in the A-operand     */
// 1010 /* (A-number Indirect, A-number Predecrement,               */
// 1011 /* and A-number Postincrement A-modes):                     */

// 1012       if (IR.AMode == A_INDIRECT
// 1013           || IR.AMode == A_DECREMENT
// 1014           || IR.AMode == A_INCREMENT) {

// 1015 /* For instructions with Predecrement A-mode, the A-Field   */
// 1016 /* of the instruction in Core currently pointed to by the   */
// 1017 /* Pointer A is decremented (M - 1 is added).               */

// 1018          if (IR.AMode == A_DECREMENT) {
// 1019             Core[((PC + WPA) % M)].ANumber =
// 1020                (Core[((PC + WPA) % M)].ANumber + M - 1) % M;
// 1021          };

// 1022 /* For instructions with Postincrement A-mode, the A-Field  */
// 1023 /* of the instruction in Core currently pointed to by the   */
// 1024 /* Pointer A will be incremented.                           */

// 1025          if (IR.AMode == A_INCREMENT) {
// 1026             PIP = (PC + WPA) % M;
// 1027          };

// 1028 /* For instructions with A-indirection in the A-operand,    */
// 1029 /* Pointer A ultimately points to the instruction           */
// 1030 /* Core[((PC + PCA) % M)].ANumber away, relative to the     */
// 1031 /* instruction pointed to by Pointer A.                     */

// 1032          RPA = Fold(
// 1033             (RPA + Core[((PC + RPA) % M)].ANumber), ReadLimit, M
// 1034          );
// 1035          WPA = Fold(
// 1036             (WPA + Core[((PC + WPA) % M)].ANumber), WriteLimit, M
// 1037          );

// 1038       };

// 1039 /* For instructions with B-indirection in the A-operand     */
// 1040 /* (B-number Indirect, B-number Predecrement,               */
// 1041 /* and B-number Postincrement A-modes):                     */

// 1042       if (IR.AMode == B_INDIRECT
// 1043           || IR.AMode == B_DECREMENT
// 1044           || IR.AMode == B_INCREMENT) {

// 1045 /* For instructions with Predecrement A-mode, the B-Field   */
// 1046 /* of the instruction in Core currently pointed to by the   */
// 1047 /* Pointer A is decremented (M - 1 is added).               */

// 1048          if (IR.AMode == DECREMENT) {
// 1049             Core[((PC + WPA) % M)].BNumber =
// 1050                (Core[((PC + WPA) % M)].BNumber + M - 1) % M;
// 1051          };

// 1052 /* For instructions with Postincrement A-mode, the B-Field  */
// 1053 /* of the instruction in Core currently pointed to by the   */
// 1054 /* Pointer A will be incremented.                           */

// 1055          if (IR.AMode == INCREMENT) {
// 1056             PIP = (PC + WPA) % M;
// 1057          };

// 1058 /* For instructions with B-indirection in the A-operand,    */
// 1059 /* Pointer A ultimately points to the instruction           */
// 1060 /* Core[((PC + PCA) % M)].BNumber away, relative to the     */
// 1061 /* instruction pointed to by Pointer A.                     */

// 1062          RPA = Fold(
// 1063             (RPA + Core[((PC + RPA) % M)].BNumber), ReadLimit, M
// 1064          );
// 1065          WPA = Fold(
// 1066             (WPA + Core[((PC + WPA) % M)].BNumber), WriteLimit, M
// 1067          );

// 1068       };
// 1069    };

// 1070 /* The Instruction Register A is a copy of the instruction  */
// 1071 /* pointed to by Pointer A.                                 */

// 1072    IRA = Core[((PC + RPA) % M)];

// 1073 /* If the A-mode was post-increment, now is the time to     */
// 1074 /* increment the instruction in core.                       */

// 1075    if (IR.AMode == A_INCREMENT) {
// 1076            Core[PIP].ANumber = (Core[PIP].ANumber + 1) % M;
// 1077            }
// 1078    else if (IR.AMode == B_INCREMENT) {
// 1079            Core[PIP].BNumber = (Core[PIP].BNumber + 1) % M;
// 1080            };

// 1081 /* The Pointer B and the Instruction Register B are         */
// 1082 /* evaluated in the same manner as their A counterparts.    */

// 1083    if (IR.BMode == IMMEDIATE) {
// 1084       RPB = WPB = 0;
// 1085    } else {
// 1086       RPB = Fold(IR.BNumber, ReadLimit, M);
// 1087       WPB = Fold(IR.BNumber, WriteLimit, M);
// 1088       if (IR.BMode == A_INDIRECT
// 1089           || IR.BMode == A_DECREMENT
// 1090           || IR.BMode == A_INCREMENT) {
// 1091          if (IR.BMode == A_DECREMENT) {
// 1092             Core[((PC + WPB) % M)].ANumber =
// 1093                (Core[((PC + WPB) % M)].ANumber + M - 1) % M
// 1094             ;
// 1095          } else if (IR.BMode == A_INCREMENT) {
// 1096             PIP = (PC + WPB) % M;
// 1097          };
// 1098          RPB = Fold(
// 1099             (RPB + Core[((PC + RPB) % M)].ANumber), ReadLimit, M
// 1100          );
// 1101          WPB = Fold(
// 1102             (WPB + Core[((PC + WPB) % M)].ANumber), WriteLimit, M
// 1103          );
// 1104       };
// 1105       if (IR.BMode == B_INDIRECT
// 1106           || IR.BMode == B_DECREMENT
// 1107           || IR.BMode == B_INCREMENT) {
// 1108          if (IR.BMode == B_DECREMENT) {
// 1109             Core[((PC + WPB) % M)].BNumber =
// 1110                (Core[((PC + WPB) % M)].BNumber + M - 1) % M
// 1111             ;
// 1112          } else if (IR.BMode == B_INCREMENT) {
// 1113             PIP = (PC + WPB) % M;
// 1114          };
// 1115          RPB = Fold(
// 1116             (RPB + Core[((PC + RPB) % M)].BNumber), ReadLimit, M
// 1117          );
// 1118          WPB = Fold(
// 1119             (WPB + Core[((PC + WPB) % M)].BNumber), WriteLimit, M
// 1120          );
// 1121       };
// 1122    };
// 1123    IRB = Core[((PC + RPB) % M)];

// 1124    if (IR.BMode == A_INCREMENT) {
// 1125            Core[PIP].ANumber = (Core[PIP].ANumber + 1) % M;
// 1126            }
// 1127    else if (IR.BMode == INCREMENT) {
// 1128            Core[PIP].BNumber = (Core[PIP].BNumber + 1) % M;
// 1129            };

// 1130 /* Execution of the instruction can now proceed.            */

// 1131    switch (IR.Opcode) {

// 1132 /* Instructions with a DAT opcode have no further function. */
// 1133 /* The current task's Program Counter is not updated and is */
// 1134 /* not returned to the task queue, effectively removing the */
// 1135 /* task.                                                    */

// 1136    case DAT: noqueue:
// 1137       break;


// 1138 /* MOV replaces the B-target with the A-value and queues    */
// 1139 /* the next instruction.                                    */

// 1140    case MOV:
// 1141       switch (IR.Modifier) {

// 1142 /* Replaces A-number with A-number.                         */

// 1143       case A:
// 1144          Core[((PC + WPB) % M)].ANumber = IRA.ANumber;
// 1145          break;

// 1146 /* Replaces B-number with B-number.                         */

// 1147       case B:
// 1148          Core[((PC + WPB) % M)].BNumber = IRA.BNumber;
// 1149          break;

// 1150 /* Replaces B-number with A-number.                         */

// 1151       case AB:
// 1152          Core[((PC + WPB) % M)].BNumber = IRA.ANumber;
// 1153          break;

// 1154 /* Replaces A-number with B-number.                         */

// 1155       case BA:
// 1156          Core[((PC + WPB) % M)].ANumber = IRA.BNumber;
// 1157          break;

// 1158 /* Replaces A-number with A-number and B-number with        */
// 1159 /* B-number.                                                */

// 1160       case F:
// 1161          Core[((PC + WPB) % M)].ANumber = IRA.ANumber;
// 1162          Core[((PC + WPB) % M)].BNumber = IRA.BNumber;
// 1163          break;

// 1164 /* Replaces B-number with A-number and A-number with        */
// 1165 /* B-number.                                                */

// 1166       case X:
// 1167          Core[((PC + WPB) % M)].BNumber = IRA.ANumber;
// 1168          Core[((PC + WPB) % M)].ANumber = IRA.BNumber;
// 1169          break;

// 1170 /* Copies entire instruction.                               */

// 1171       case I:
// 1172          Core[((PC + WPB) % M)] = IRA;
// 1173          break;

// 1174       default:
// 1175          return(UNDEFINED);
// 1176          break;
// 1177       };

// 1178 /* Queue up next instruction.                               */
// 1179       Queue(W, ((PC + 1) % M));
// 1180       break;

// 1181 /* Arithmetic instructions replace the B-target with the    */
// 1182 /* "op" of the A-value and B-value, and queue the next      */
// 1183 /* instruction.  "op" can be the sum, the difference, or    */
// 1184 /* the product.                                             */

// 1185 #define ARITH(op) \
// 1186       switch (IR.Modifier) { \
// 1187       case A: \
// 1188          Core[((PC + WPB) % M)].ANumber = \
// 1189             (IRB.ANumber op IRA.ANumber) % M \
// 1190          ; \
// 1191          break; \
// 1192       case B: \
// 1193          Core[((PC + WPB) % M)].BNumber = \
// 1194             (IRB.BNumber op IRA.BNumber) % M \
// 1195          ; \
// 1196          break; \
// 1197       case AB: \
// 1198          Core[((PC + WPB) % M)].BNumber = \
// 1199             (IRB.ANumber op IRA.BNumber) % M \
// 1200          ; \
// 1201          break; \
// 1202       case BA: \
// 1203          Core[((PC + WPB) % M)].ANumber = \
// 1204             (IRB.BNumber op IRA.ANumber) % M \
// 1205          ; \
// 1206          break; \
// 1207       case F: \
// 1208       case I: \
// 1209          Core[((PC + WPB) % M)].ANumber = \
// 1210             (IRB.ANumber op IRA.ANumber) % M \
// 1211          ; \
// 1212          Core[((PC + WPB) % M)].BNumber = \
// 1213             (IRB.BNumber op IRA.BNumber) % M \
// 1214          ; \
// 1215          break; \
// 1216       case X: \
// 1217          Core[((PC + WPB) % M)].BNumber = \
// 1218             (IRB.ANumber op IRA.BNumber) % M \
// 1219          ; \
// 1220          Core[((PC + WPB) % M)].ANumber = \
// 1221             (IRB.BNumber op IRA.ANumber) % M \
// 1222          ; \
// 1223          break; \
// 1224       default: \
// 1225          return(UNDEFINED); \
// 1226          break; \
// 1227       }; \
// 1228       Queue(W, ((PC + 1) % M)); \
// 1229       break;

// 1230    case ADD: ARITH(+)
// 1231    case SUB: ARITH(+ M -)
// 1232    case MUL: ARITH(*)

// 1233 /* DIV and MOD replace the B-target with the integral       */
// 1234 /* quotient (for DIV) or remainder (for MOD) of the B-value */
// 1235 /* by the A-value, and queues the next instruction.         */
// 1236 /* Process is removed from task queue if A-value is zero.   */

// 1237 #define ARITH_DIV(op) \
// 1238       switch (IR.Modifier) { \
// 1239       case A: \
// 1240          if (IRA.ANumber != 0) \
// 1241             Core[((PC + WPB) % M)].ANumber = IRB.ANumber op IRA.ANumber; \
// 1242          break; \
// 1243       case B: \
// 1244          if (IRA.BNumber != 0) \
// 1245             Core[((PC + WPB) % M)].BNumber = IRB.BNumber op IRA.BNumber; \
// 1246          else goto noqueue; \
// 1247          break; \
// 1248       case AB: \
// 1249          if (IRA.ANumber != 0) \
// 1250             Core[((PC + WPB) % M)].BNumber = IRB.BNumber op IRA.ANumber; \
// 1251          else goto noqueue; \
// 1252          break; \
// 1253       case BA: \
// 1254          if (IRA.BNumber != 0) \
// 1255             Core[((PC + WPB) % M)].ANumber = IRB.ANumber op IRA.BNumber; \
// 1256          else goto noqueue; \
// 1257          break; \
// 1258       case F: \
// 1259       case I: \
// 1260          if (IRA.ANumber != 0) \
// 1261             Core[((PC + WPB) % M)].ANumber = IRB.ANumber op IRA.ANumber; \
// 1262          if (IRA.BNumber != 0) \
// 1263             Core[((PC + WPB) % M)].BNumber = IRB.BNumber op IRA.BNumber; \
// 1264          if ((IRA.ANumber == 0) || (IRA.BNumber == 0)) \
// 1265             goto noqueue; \
// 1266          break; \
// 1267       case X: \
// 1268          if (IRA.ANumber != 0) \
// 1269             Core[((PC + WPB) % M)].BNumber = IRB.BNumber op IRA.ANumber; \
// 1270          if (IRA.BNumber != 0) \
// 1271             Core[((PC + WPB) % M)].ANumber = IRB.ANumber op IRA.BNumber; \
// 1272          if ((IRA.ANumber == 0) || (IRA.BNumber == 0)) \
// 1273             goto noqueue; \
// 1274          break; \
// 1275       default: \
// 1276          return(UNDEFINED); \
// 1277          break; \
// 1278       }; \
// 1279       Queue(W, ((PC + 1) % M)); \
// 1280       break;

// 1281    case DIV: ARITH_DIV(/)
// 1282    case MOD: ARITH_DIV(%)

// 1283 /* JMP queues the sum of the Program Counter and the        */
// 1284 /* A-pointer.                                               */

// 1285    case JMP:
// 1286       Queue(W, RPA);
// 1287       break;


// 1288 /* JMZ queues the sum of the Program Counter and Pointer A  */
// 1289 /* if the B-value is zero.  Otherwise, it queues the next   */
// 1290 /* instruction.                                             */

// 1291    case JMZ:
// 1292       switch (IR.Modifier) {
// 1293       case A:
// 1294       case BA:
// 1295          if (IRB.ANumber == 0) {
// 1296             Queue(W, RPA);
// 1297          } else {
// 1298             Queue(W, ((PC + 1) % M));
// 1299          };
// 1300          break;
// 1301       case B:
// 1302       case AB:
// 1303          if (IRB.BNumber == 0) {
// 1304             Queue(W, RPA);
// 1305          } else {
// 1306             Queue(W, ((PC + 1) % M));
// 1307          };
// 1308          break;
// 1309       case F:
// 1310       case X:
// 1311       case I:
// 1312          if ( (IRB.ANumber == 0) && (IRB.BNumber == 0) ) {
// 1313             Queue(W, RPA);
// 1314          } else {
// 1315             Queue(W, ((PC + 1) % M));
// 1316          };
// 1317          break;
// 1318       default:
// 1319          return(UNDEFINED);
// 1320          break;
// 1321       };
// 1322       break;


// 1323 /* JMN queues the sum of the Program Counter and Pointer A  */
// 1324 /* if the B-value is not zero.  Otherwise, it queues the    */
// 1325 /* next instruction.                                        */

// 1326    case JMN:
// 1327       switch (IR.Modifier) {
// 1328       case A:
// 1329       case BA:
// 1330          if (IRB.ANumber != 0) {
// 1331             Queue(W, RPA);
// 1332          } else {
// 1333             Queue(W, ((PC + 1) % M));
// 1334          };
// 1335          break;
// 1336       case B:
// 1337       case AB:
// 1338          if (IRB.BNumber != 0) {
// 1339             Queue(W, RPA);
// 1340          } else {
// 1341             Queue(W, ((PC + 1) % M));
// 1342          };
// 1343          break;
// 1344       case F:
// 1345       case X:
// 1346       case I:
// 1347          if ( (IRB.ANumber != 0) || (IRB.BNumber != 0) ) {
// 1348             Queue(W, RPA);
// 1349          } else {
// 1350             Queue(W, ((PC + 1) % M));
// 1351          };
// 1352          break;
// 1353       default:
// 1354          return(UNDEFINED);
// 1355          break;
// 1356       };
// 1357       break;


// 1358 /* DJN (Decrement Jump if Not zero) decrements the B-value  */
// 1359 /* and the B-target, then tests if the B-value is zero.  If */
// 1360 /* the result is not zero, the sum of the Program Counter   */
// 1361 /* and Pointer A is queued.  Otherwise, the next            */
// 1362 /* instruction is queued.                                   */

// 1363    case DJN:
// 1364       switch (IR.Modifier) {
// 1365       case A:
// 1366       case BA:
// 1367          Core[((PC + WPB) % M)].ANumber =
// 1368             (Core[((PC + WPB) % M)].ANumber + M - 1) % M
// 1369          ;
// 1370          IRB.ANumber -= 1;
// 1371          if (IRB.ANumber != 0) {
// 1372             Queue(W, RPA);
// 1373          } else {
// 1374             Queue(W, ((PC + 1) % M));
// 1375          };
// 1376          break;
// 1377       case B:
// 1378       case AB:
// 1379          Core[((PC + WPB) % M)].BNumber =
// 1380             (Core[((PC + WPB) % M)].BNumber + M - 1) % M
// 1381          ;
// 1382          IRB.BNumber -= 1;
// 1383          if (IRB.BNumber != 0) {
// 1384             Queue(W, RPA);
// 1385          } else {
// 1386             Queue(W, ((PC + 1) % M));
// 1387          };
// 1388          break;
// 1389       case F:
// 1390       case X:
// 1391       case I:
// 1392          Core[((PC + WPB) % M)].ANumber =
// 1393             (Core[((PC + WPB) % M)].ANumber + M - 1) % M
// 1394          ;
// 1395          IRB.ANumber -= 1;
// 1396          Core[((PC + WPB) % M)].BNumber =
// 1397             (Core[((PC + WPB) % M)].BNumber + M - 1) % M
// 1398          ;
// 1399          IRB.BNumber -= 1;
// 1400          if ( (IRB.ANumber != 0) || (IRB.BNumber != 0) ) {
// 1401             Queue(W, RPA);
// 1402          } else {
// 1403             Queue(W, ((PC + 1) % M));
// 1404          };
// 1405          break;
// 1406       default:
// 1407          return(UNDEFINED);
// 1408          break;
// 1409       };
// 1410       break;


// 1411 /* SEQ/CMP compares the A-value and the B-value. If there   */
// 1412 /* are no differences, then the instruction after the next  */
// 1413 /* instruction is queued.  Otherwise, the next instrution   */
// 1414 /* is queued.                                               */

// 1415    case CMP:
// 1416       switch (IR.Modifier) {
// 1417       case A:
// 1418          if (IRA.ANumber == IRB.ANumber) {
// 1419             Queue(W, ((PC + 2) % M));
// 1420          } else {
// 1421             Queue(W, ((PC + 1) % M));
// 1422          };
// 1423          break;
// 1424       case B:
// 1425          if (IRA.BNumber == IRB.BNumber) {
// 1426             Queue(W, ((PC + 2) % M));
// 1427          } else {
// 1428             Queue(W, ((PC + 1) % M));
// 1429          };
// 1430          break;
// 1431       case AB:
// 1432          if (IRA.ANumber == IRB.BNumber) {
// 1433             Queue(W, ((PC + 2) % M));
// 1434          } else {
// 1435             Queue(W, ((PC + 1) % M));
// 1436          };
// 1437          break;
// 1438       case BA:
// 1439          if (IRA.BNumber == IRB.ANumber) {
// 1440             Queue(W, ((PC + 2) % M));
// 1441          } else {
// 1442             Queue(W, ((PC + 1) % M));
// 1443          };
// 1444          break;
// 1445       case F:
// 1446          if ( (IRA.ANumber == IRB.ANumber) &&
// 1447               (IRA.BNumber == IRB.BNumber)
// 1448          ) {
// 1449             Queue(W, ((PC + 2) % M));
// 1450          } else {
// 1451             Queue(W, ((PC + 1) % M));
// 1452          };
// 1453          break;
// 1454       case X:
// 1455          if ( (IRA.ANumber == IRB.BNumber) &&
// 1456               (IRA.BNumber == IRB.ANumber)
// 1457          ) {
// 1458             Queue(W, ((PC + 2) % M));
// 1459          } else {
// 1460             Queue(W, ((PC + 1) % M));
// 1461          };
// 1462          break;
// 1463       case I:
// 1464          if ( (IRA.Opcode == IRB.Opcode) &&
// 1465               (IRA.Modifier == IRB.Modifier) &&
// 1466               (IRA.AMode == IRB.AMode) &&
// 1467               (IRA.ANumber == IRB.ANumber) &&
// 1468               (IRA.BMode == IRB.BMode) &&
// 1469               (IRA.BNumber == IRB.BNumber)
// 1470          ) {
// 1471             Queue(W, ((PC + 2) % M));
// 1472          } else {
// 1473             Queue(W, ((PC + 1) % M));
// 1474          };
// 1475          break;
// 1476       default:
// 1477          return(UNDEFINED);
// 1478          break;
// 1479       };
// 1480       break;


// 1481 /* SNE compares the A-value and the B-value. If there       */
// 1482 /* is a difference, then the instruction after the next     */
// 1483 /* instruction is queued.  Otherwise, the next instrution   */
// 1484 /* is queued.                                               */

// 1485    case SNE:
// 1486       switch (IR.Modifier) {
// 1487       case A:
// 1488          if (IRA.ANumber != IRB.ANumber) {
// 1489             Queue(W, ((PC + 2) % M));
// 1490          } else {
// 1491             Queue(W, ((PC + 1) % M));
// 1492          };
// 1493          break;
// 1494       case B:
// 1495          if (IRA.BNumber != IRB.BNumber) {
// 1496             Queue(W, ((PC + 2) % M));
// 1497          } else {
// 1498             Queue(W, ((PC + 1) % M));
// 1499          };
// 1500          break;
// 1501       case AB:
// 1502          if (IRA.ANumber != IRB.BNumber) {
// 1503             Queue(W, ((PC + 2) % M));
// 1504          } else {
// 1505             Queue(W, ((PC + 1) % M));
// 1506          };
// 1507          break;
// 1508       case BA:
// 1509          if (IRA.BNumber != IRB.ANumber) {
// 1510             Queue(W, ((PC + 2) % M));
// 1511          } else {
// 1512             Queue(W, ((PC + 1) % M));
// 1513          };
// 1514          break;
// 1515       case F:
// 1516          if ( (IRA.ANumber != IRB.ANumber) ||
// 1517               (IRA.BNumber != IRB.BNumber)
// 1518          ) {
// 1519             Queue(W, ((PC + 2) % M));
// 1520          } else {
// 1521             Queue(W, ((PC + 1) % M));
// 1522          };
// 1523          break;
// 1524       case X:
// 1525          if ( (IRA.ANumber != IRB.BNumber) ||
// 1526               (IRA.BNumber != IRB.ANumber)
// 1527          ) {
// 1528             Queue(W, ((PC + 2) % M));
// 1529          } else {
// 1530             Queue(W, ((PC + 1) % M));
// 1531          };
// 1532          break;
// 1533       case I:
// 1534          if ( (IRA.Opcode != IRB.Opcode) ||
// 1535               (IRA.Modifier != IRB.Modifier) ||
// 1536               (IRA.AMode != IRB.AMode) ||
// 1537               (IRA.ANumber != IRB.ANumber) ||
// 1538               (IRA.BMode != IRB.BMode) ||
// 1539               (IRA.BNumber != IRB.BNumber)
// 1540          ) {
// 1541             Queue(W, ((PC + 2) % M));
// 1542          } else {
// 1543             Queue(W, ((PC + 1) % M));
// 1544          };
// 1545          break;
// 1546       default:
// 1547          return(UNDEFINED);
// 1548          break;
// 1549       };
// 1550       break;


// 1551 /* SLT (Skip if Less Than) queues the instruction after the */
// 1552 /* next instruction if A-value is less than B-value.        */
// 1553 /* Otherwise, the next instruction is queued.  Note that no */
// 1554 /* value is less than zero because only positive values can */
// 1555 /* be represented in core.                                  */

// 1556    case SLT :
// 1557       switch (IR.Modifier) {
// 1558       case A:
// 1559          if (IRA.ANumber < IRB.ANumber) {
// 1560             Queue(W, ((PC + 2) % M));
// 1561          } else {
// 1562             Queue(W, ((PC + 1) % M));
// 1563          };
// 1564          break;
// 1565       case B:
// 1566          if (IRA.BNumber < IRB.BNumber) {
// 1567             Queue(W, ((PC + 2) % M));
// 1568          } else {
// 1569             Queue(W, ((PC + 1) % M));
// 1570          };
// 1571          break;
// 1572       case AB:
// 1573          if (IRA.ANumber < IRB.BNumber) {
// 1574             Queue(W, ((PC + 2) % M));
// 1575          } else {
// 1576             Queue(W, ((PC + 1) % M));
// 1577          };
// 1578          break;
// 1579       case BA:
// 1580          if (IRA.BNumber < IRB.ANumber) {
// 1581             Queue(W, ((PC + 2) % M));
// 1582          } else {
// 1583             Queue(W, ((PC + 1) % M));
// 1584          };
// 1585          break;
// 1586       case F:
// 1587       case I:
// 1588          if ( (IRA.ANumber < IRB.ANumber) &&
// 1589               (IRA.BNumber < IRB.BNumber)
// 1590          ) {
// 1591             Queue(W, ((PC + 2) % M));
// 1592          } else {
// 1593             Queue(W, ((PC + 1) % M));
// 1594          };
// 1595          break;
// 1596       case X:
// 1597          if ( (IRA.ANumber < IRB.BNumber) &&
// 1598               (IRA.BNumber < IRB.ANumber)
// 1599          ) {
// 1600             Queue(W, ((PC + 2) % M));
// 1601          } else {
// 1602             Queue(W, ((PC + 1) % M));
// 1603          };
// 1604          break;
// 1605       default:
// 1606          return(UNDEFINED);
// 1607          break;
// 1608       };
// 1609       break;


// 1610 /* SPL queues the next instruction and also queues the sum  */
// 1611 /* of the Program Counter and Pointer A.                    */

// 1612    case SPL:
// 1613       Queue(W, ((PC + 1) % M));
// 1614       Queue(W, RPA);
// 1615       break;


// 1616 /* NOP queues the next instruction.                         */

// 1617    case NOP:
// 1618       Queue(W, ((PC + 1) % M));
// 1619       break;


// 1620 /* Any other opcode is undefined.                           */

// 1621    default:
// 1622       return(UNDEFINED);
// 1623    };


// 1624 /* We are finished.                                         */

// 1625    return(SUCCESS);
// 1626 }

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

function foldPointer(pointer, limit, coreSize) {

}

// execute the given instruction on the given core at the given PC; return 
// the next PC
function evalInsn(core, pc, warrior, insn) {

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

  // private methods:

  // dequeue a task from the task queue
  function nextTask() {
    var head = this.taskQueue.shift();

    if (head == null) {
      // end-of-cycle sentinel; re-enqueue and return null
      this.taskQueue.push(null);
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
      this.taskQueue.push({ warrior: warrior, pc: pc });
      warrior.nTasks += 1;
      return true;
    }
  }

  // run one instruction as the given warrior at the given PC
  function runOneInsn(warrior, pc) {
    var nextPC = evalInsn(this.core, pc, warrior, this.core[pc].insn);

    if (nextPC != null) {
      enqueue(warrior, nextPC);
    }
  }

  // privileged methods:

  // load a new warrior into core
  this.load = function(warrior) {
    // TODO: select initial offset respecting min-separation
    var initialOffset = Math.floor(Math.random() * this.coreSize);
    var code = warrior.code;

    // copy code into core
    for (int i = 0; i < code.length; i++) {
      var offset = (initialOffset + i) % this.coreSize;
      this.core[offset] = { insn: code[i], owner: warrior };
    }

    // enqueue initial task
    enqueue(warrior, initialOffset);
  }

  // run tasks from the task queue until we hit the end-of-cycle sentinel
  this.step = function() {
    while (true) {
      var next = nextTask();

      if (next != null) {
        runOneInsn(next.warrior, next.pc);
      }
    }
  }
}