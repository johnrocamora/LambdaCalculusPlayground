/**
 * Autogenerated; do not edit! Run "npm gen-types" to regenerate.
 *
 * @flow
 */
 
import * as Immutable from 'immutable'
 
class StateImpl extends Immutable.Record({
        screenExpressions: undefined, nextExprId: undefined}) {
    withScreenExpressions(screenExpressions) {
        return this.set('screenExpressions', screenExpressions)
    }
    withNextExprId(nextExprId) {
        return this.set('nextExprId', nextExprId)
    }
}

export type State = {
    screenExpressions: Immutable.Map<number, ScreenExpression>,
    nextExprId: number,
    withScreenExpressions: (screenExpressions: Immutable.Map<number, ScreenExpression>) => State,
    withNextExprId: (nextExprId: number) => State,
    toJS: () => any,
};

export const newState = (screenExpressions: Immutable.Map<number, ScreenExpression>, nextExprId: number): State => (new StateImpl({
    screenExpressions,
    nextExprId,
}));

export type Reset = {
    type: 'reset',
};

export const newReset = (): Reset => ({
    type: 'reset',
});

export type AddExpression = {
    type: 'addExpression',
    screenExpr: ScreenExpression,
};

export const newAddExpression = (screenExpr: ScreenExpression): AddExpression => ({
    type: 'addExpression',
    screenExpr,
});

export type MoveExpression = {
    type: 'moveExpression',
    exprId: number,
    pos: CanvasPoint,
};

export const newMoveExpression = (exprId: number, pos: CanvasPoint): MoveExpression => ({
    type: 'moveExpression',
    exprId,
    pos,
});

export type DecomposeExpression = {
    type: 'decomposeExpression',
    path: ExprPath,
    targetPos: CanvasPoint,
};

export const newDecomposeExpression = (path: ExprPath, targetPos: CanvasPoint): DecomposeExpression => ({
    type: 'decomposeExpression',
    path,
    targetPos,
});

export type EvaluateExpression = {
    type: 'evaluateExpression',
    exprId: number,
    targetPos: CanvasPoint,
};

export const newEvaluateExpression = (exprId: number, targetPos: CanvasPoint): EvaluateExpression => ({
    type: 'evaluateExpression',
    exprId,
    targetPos,
});

export type Action = Reset | AddExpression | MoveExpression | DecomposeExpression | EvaluateExpression;

export type ActionVisitor<T> = {
    reset: (reset: Reset) => T,
    addExpression: (addExpression: AddExpression) => T,
    moveExpression: (moveExpression: MoveExpression) => T,
    decomposeExpression: (decomposeExpression: DecomposeExpression) => T,
    evaluateExpression: (evaluateExpression: EvaluateExpression) => T,
}

export const matchAction = function<T>(action: Action, visitor: ActionVisitor<T>): T {
    switch (action.type) {
        case 'reset':
            return visitor.reset(action);
        case 'addExpression':
            return visitor.addExpression(action);
        case 'moveExpression':
            return visitor.moveExpression(action);
        case 'decomposeExpression':
            return visitor.decomposeExpression(action);
        case 'evaluateExpression':
            return visitor.evaluateExpression(action);
        default:
            throw new Error('Unexpected type: ' + action.type);
    }
};

class LambdaImpl extends Immutable.Record({
        type: undefined, varName: undefined, body: undefined}) {
    withVarName(varName) {
        return this.set('varName', varName)
    }
    withBody(body) {
        return this.set('body', body)
    }
}

export type Lambda = {
    type: 'lambda',
    varName: string,
    body: Expression,
    withVarName: (varName: string) => Lambda,
    withBody: (body: Expression) => Lambda,
    toJS: () => any,
};

export const newLambda = (varName: string, body: Expression): Lambda => (new LambdaImpl({
    type: 'lambda',
    varName,
    body,
}));

class FuncCallImpl extends Immutable.Record({
        type: undefined, func: undefined, arg: undefined}) {
    withFunc(func) {
        return this.set('func', func)
    }
    withArg(arg) {
        return this.set('arg', arg)
    }
}

export type FuncCall = {
    type: 'funcCall',
    func: Expression,
    arg: Expression,
    withFunc: (func: Expression) => FuncCall,
    withArg: (arg: Expression) => FuncCall,
    toJS: () => any,
};

export const newFuncCall = (func: Expression, arg: Expression): FuncCall => (new FuncCallImpl({
    type: 'funcCall',
    func,
    arg,
}));

class VariableImpl extends Immutable.Record({
        type: undefined, varName: undefined}) {
    withVarName(varName) {
        return this.set('varName', varName)
    }
}

export type Variable = {
    type: 'variable',
    varName: string,
    withVarName: (varName: string) => Variable,
    toJS: () => any,
};

export const newVariable = (varName: string): Variable => (new VariableImpl({
    type: 'variable',
    varName,
}));

export type Expression = Lambda | FuncCall | Variable;

export type ExpressionVisitor<T> = {
    lambda: (lambda: Lambda) => T,
    funcCall: (funcCall: FuncCall) => T,
    variable: (variable: Variable) => T,
}

export const matchExpression = function<T>(expression: Expression, visitor: ExpressionVisitor<T>): T {
    switch (expression.type) {
        case 'lambda':
            return visitor.lambda(expression);
        case 'funcCall':
            return visitor.funcCall(expression);
        case 'variable':
            return visitor.variable(expression);
        default:
            throw new Error('Unexpected type: ' + expression.type);
    }
};

export type Slot = {
    isValue: boolean,
    expr: EvalExpression,
    originalVarName: string
};

class EvalLambdaImpl extends Immutable.Record({
        type: undefined, varMarker: undefined, originalVarName: undefined, body: undefined}) {
    withVarMarker(varMarker) {
        return this.set('varMarker', varMarker)
    }
    withOriginalVarName(originalVarName) {
        return this.set('originalVarName', originalVarName)
    }
    withBody(body) {
        return this.set('body', body)
    }
}

export type EvalLambda = {
    type: 'evalLambda',
    varMarker: number,
    originalVarName: string,
    body: EvalExpression,
    withVarMarker: (varMarker: number) => EvalLambda,
    withOriginalVarName: (originalVarName: string) => EvalLambda,
    withBody: (body: EvalExpression) => EvalLambda,
    toJS: () => any,
};

export const newEvalLambda = (varMarker: number, originalVarName: string, body: EvalExpression): EvalLambda => (new EvalLambdaImpl({
    type: 'evalLambda',
    varMarker,
    originalVarName,
    body,
}));

class EvalFuncCallImpl extends Immutable.Record({
        type: undefined, func: undefined, arg: undefined}) {
    withFunc(func) {
        return this.set('func', func)
    }
    withArg(arg) {
        return this.set('arg', arg)
    }
}

export type EvalFuncCall = {
    type: 'evalFuncCall',
    func: EvalExpression,
    arg: EvalExpression,
    withFunc: (func: EvalExpression) => EvalFuncCall,
    withArg: (arg: EvalExpression) => EvalFuncCall,
    toJS: () => any,
};

export const newEvalFuncCall = (func: EvalExpression, arg: EvalExpression): EvalFuncCall => (new EvalFuncCallImpl({
    type: 'evalFuncCall',
    func,
    arg,
}));

class EvalBoundVariableImpl extends Immutable.Record({
        type: undefined, slot: undefined}) {
    withSlot(slot) {
        return this.set('slot', slot)
    }
}

export type EvalBoundVariable = {
    type: 'evalBoundVariable',
    slot: Slot,
    withSlot: (slot: Slot) => EvalBoundVariable,
    toJS: () => any,
};

export const newEvalBoundVariable = (slot: Slot): EvalBoundVariable => (new EvalBoundVariableImpl({
    type: 'evalBoundVariable',
    slot,
}));

class EvalUnboundVariableImpl extends Immutable.Record({
        type: undefined, varMarker: undefined, originalVarName: undefined}) {
    withVarMarker(varMarker) {
        return this.set('varMarker', varMarker)
    }
    withOriginalVarName(originalVarName) {
        return this.set('originalVarName', originalVarName)
    }
}

export type EvalUnboundVariable = {
    type: 'evalUnboundVariable',
    varMarker: number,
    originalVarName: string,
    withVarMarker: (varMarker: number) => EvalUnboundVariable,
    withOriginalVarName: (originalVarName: string) => EvalUnboundVariable,
    toJS: () => any,
};

export const newEvalUnboundVariable = (varMarker: number, originalVarName: string): EvalUnboundVariable => (new EvalUnboundVariableImpl({
    type: 'evalUnboundVariable',
    varMarker,
    originalVarName,
}));

class EvalFreeVariableImpl extends Immutable.Record({
        type: undefined, varName: undefined}) {
    withVarName(varName) {
        return this.set('varName', varName)
    }
}

export type EvalFreeVariable = {
    type: 'evalFreeVariable',
    varName: string,
    withVarName: (varName: string) => EvalFreeVariable,
    toJS: () => any,
};

export const newEvalFreeVariable = (varName: string): EvalFreeVariable => (new EvalFreeVariableImpl({
    type: 'evalFreeVariable',
    varName,
}));

export type EvalExpression = EvalLambda | EvalFuncCall | EvalBoundVariable | EvalUnboundVariable | EvalFreeVariable;

export type EvalExpressionVisitor<T> = {
    evalLambda: (evalLambda: EvalLambda) => T,
    evalFuncCall: (evalFuncCall: EvalFuncCall) => T,
    evalBoundVariable: (evalBoundVariable: EvalBoundVariable) => T,
    evalUnboundVariable: (evalUnboundVariable: EvalUnboundVariable) => T,
    evalFreeVariable: (evalFreeVariable: EvalFreeVariable) => T,
}

export const matchEvalExpression = function<T>(evalExpression: EvalExpression, visitor: EvalExpressionVisitor<T>): T {
    switch (evalExpression.type) {
        case 'evalLambda':
            return visitor.evalLambda(evalExpression);
        case 'evalFuncCall':
            return visitor.evalFuncCall(evalExpression);
        case 'evalBoundVariable':
            return visitor.evalBoundVariable(evalExpression);
        case 'evalUnboundVariable':
            return visitor.evalUnboundVariable(evalExpression);
        case 'evalFreeVariable':
            return visitor.evalFreeVariable(evalExpression);
        default:
            throw new Error('Unexpected type: ' + evalExpression.type);
    }
};

class UserLambdaImpl extends Immutable.Record({
        type: undefined, varName: undefined, body: undefined}) {
    withVarName(varName) {
        return this.set('varName', varName)
    }
    withBody(body) {
        return this.set('body', body)
    }
}

export type UserLambda = {
    type: 'userLambda',
    varName: string,
    body: ?UserExpression,
    withVarName: (varName: string) => UserLambda,
    withBody: (body: ?UserExpression) => UserLambda,
    toJS: () => any,
};

export const newUserLambda = (varName: string, body: ?UserExpression): UserLambda => (new UserLambdaImpl({
    type: 'userLambda',
    varName,
    body,
}));

class UserFuncCallImpl extends Immutable.Record({
        type: undefined, func: undefined, arg: undefined}) {
    withFunc(func) {
        return this.set('func', func)
    }
    withArg(arg) {
        return this.set('arg', arg)
    }
}

export type UserFuncCall = {
    type: 'userFuncCall',
    func: UserExpression,
    arg: UserExpression,
    withFunc: (func: UserExpression) => UserFuncCall,
    withArg: (arg: UserExpression) => UserFuncCall,
    toJS: () => any,
};

export const newUserFuncCall = (func: UserExpression, arg: UserExpression): UserFuncCall => (new UserFuncCallImpl({
    type: 'userFuncCall',
    func,
    arg,
}));

class UserVariableImpl extends Immutable.Record({
        type: undefined, varName: undefined}) {
    withVarName(varName) {
        return this.set('varName', varName)
    }
}

export type UserVariable = {
    type: 'userVariable',
    varName: string,
    withVarName: (varName: string) => UserVariable,
    toJS: () => any,
};

export const newUserVariable = (varName: string): UserVariable => (new UserVariableImpl({
    type: 'userVariable',
    varName,
}));

class UserReferenceImpl extends Immutable.Record({
        type: undefined, defName: undefined}) {
    withDefName(defName) {
        return this.set('defName', defName)
    }
}

export type UserReference = {
    type: 'userReference',
    defName: string,
    withDefName: (defName: string) => UserReference,
    toJS: () => any,
};

export const newUserReference = (defName: string): UserReference => (new UserReferenceImpl({
    type: 'userReference',
    defName,
}));

export type UserExpression = UserLambda | UserFuncCall | UserVariable | UserReference;

export type UserExpressionVisitor<T> = {
    userLambda: (userLambda: UserLambda) => T,
    userFuncCall: (userFuncCall: UserFuncCall) => T,
    userVariable: (userVariable: UserVariable) => T,
    userReference: (userReference: UserReference) => T,
}

export const matchUserExpression = function<T>(userExpression: UserExpression, visitor: UserExpressionVisitor<T>): T {
    switch (userExpression.type) {
        case 'userLambda':
            return visitor.userLambda(userExpression);
        case 'userFuncCall':
            return visitor.userFuncCall(userExpression);
        case 'userVariable':
            return visitor.userVariable(userExpression);
        case 'userReference':
            return visitor.userReference(userExpression);
        default:
            throw new Error('Unexpected type: ' + userExpression.type);
    }
};

class ScreenExpressionImpl extends Immutable.Record({
        expr: undefined, pos: undefined}) {
    withExpr(expr) {
        return this.set('expr', expr)
    }
    withPos(pos) {
        return this.set('pos', pos)
    }
}

export type ScreenExpression = {
    expr: UserExpression,
    pos: CanvasPoint,
    withExpr: (expr: UserExpression) => ScreenExpression,
    withPos: (pos: CanvasPoint) => ScreenExpression,
    toJS: () => any,
};

export const newScreenExpression = (expr: UserExpression, pos: CanvasPoint): ScreenExpression => (new ScreenExpressionImpl({
    expr,
    pos,
}));

class CanvasPointImpl extends Immutable.Record({
        canvasX: undefined, canvasY: undefined}) {
    withCanvasX(canvasX) {
        return this.set('canvasX', canvasX)
    }
    withCanvasY(canvasY) {
        return this.set('canvasY', canvasY)
    }
}

export type CanvasPoint = {
    canvasX: number,
    canvasY: number,
    withCanvasX: (canvasX: number) => CanvasPoint,
    withCanvasY: (canvasY: number) => CanvasPoint,
    toJS: () => any,
};

export const newCanvasPoint = (canvasX: number, canvasY: number): CanvasPoint => (new CanvasPointImpl({
    canvasX,
    canvasY,
}));

export type PathComponent = 'func' | 'arg' | 'body';

class ExprPathImpl extends Immutable.Record({
        exprId: undefined, pathSteps: undefined}) {
    withExprId(exprId) {
        return this.set('exprId', exprId)
    }
    withPathSteps(pathSteps) {
        return this.set('pathSteps', pathSteps)
    }
}

export type ExprPath = {
    exprId: number,
    pathSteps: Array<PathComponent>,
    withExprId: (exprId: number) => ExprPath,
    withPathSteps: (pathSteps: Array<PathComponent>) => ExprPath,
    toJS: () => any,
};

export const newExprPath = (exprId: number, pathSteps: Array<PathComponent>): ExprPath => (new ExprPathImpl({
    exprId,
    pathSteps,
}));

