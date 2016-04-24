/**
 * Autogenerated; do not edit! Run "npm gen-types" to regenerate.
 *
 * @flow
 */
 
 import * as Immutable from 'immutable'
 
export type State = {
    screenExpressions: Immutable.Map<number, ScreenExpression>,
    nextExprId: number,
};

export const newState = (screenExpressions: Immutable.Map<number, ScreenExpression>, nextExprId: number): State => ({
    screenExpressions,
    nextExprId,
});

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

export type ExtractBody = {
    type: 'extractBody',
    path: ExprPath,
    targetPos: CanvasPoint,
};

export const newExtractBody = (path: ExprPath, targetPos: CanvasPoint): ExtractBody => ({
    type: 'extractBody',
    path,
    targetPos,
});

export type Action = Reset | AddExpression | MoveExpression | ExtractBody;

export type ActionVisitor<T> = {
    reset: (reset: Reset) => T,
    addExpression: (addExpression: AddExpression) => T,
    moveExpression: (moveExpression: MoveExpression) => T,
    extractBody: (extractBody: ExtractBody) => T,
}

export const matchAction = function<T>(action: Action, visitor: ActionVisitor<T>): T {
    switch (action.type) {
        case 'reset':
            return visitor.reset(action);
        case 'addExpression':
            return visitor.addExpression(action);
        case 'moveExpression':
            return visitor.moveExpression(action);
        case 'extractBody':
            return visitor.extractBody(action);
        default:
            throw new Error('Unexpected type: ' + action.type);
    }
};

export type UserLambda = {
    type: 'userLambda',
    varName: string,
    body: ?UserExpression,
};

export const newUserLambda = (varName: string, body: ?UserExpression): UserLambda => ({
    type: 'userLambda',
    varName,
    body,
});

export type UserFuncCall = {
    type: 'userFuncCall',
    func: UserExpression,
    arg: UserExpression,
};

export const newUserFuncCall = (func: UserExpression, arg: UserExpression): UserFuncCall => ({
    type: 'userFuncCall',
    func,
    arg,
});

export type UserVariable = {
    type: 'userVariable',
    varName: string,
};

export const newUserVariable = (varName: string): UserVariable => ({
    type: 'userVariable',
    varName,
});

export type UserReference = {
    type: 'userReference',
    defName: string,
};

export const newUserReference = (defName: string): UserReference => ({
    type: 'userReference',
    defName,
});

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

export type ScreenExpression = {
    expr: UserExpression,
    pos: CanvasPoint,
};

export const newScreenExpression = (expr: UserExpression, pos: CanvasPoint): ScreenExpression => ({
    expr,
    pos,
});

export type CanvasPoint = {
    canvasX: number,
    canvasY: number,
};

export const newCanvasPoint = (canvasX: number, canvasY: number): CanvasPoint => ({
    canvasX,
    canvasY,
});

export type PathComponent = 'func' | 'arg' | 'body';

export type ExprPath = {
    exprId: number,
    pathSteps: Array<PathComponent>,
};

export const newExprPath = (exprId: number, pathSteps: Array<PathComponent>): ExprPath => ({
    exprId,
    pathSteps,
});

