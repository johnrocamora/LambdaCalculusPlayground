/**
 * @flow
 */

import * as Immutable from 'immutable';

import {emptyIdPath} from './ExprPaths';
import {evaluateUserExpr, canStepUserExpr} from './UserExpressionEvaluator';
import type {
    Action,
    CanvasExpression,
    CanvasPoint,
    DragData,
    State
} from './types'
import * as t from './types'
import {
    addExpression,
    decomposeExpression,
    modifyExpression,
    insertAsArg,
    insertAsBody,
    updateExprContainer,
} from './ExpressionState'
import {ptMinusPt, ptPlusDiff, rectPlusDiff} from './Geometry'
import {resolveDrop, resolveTouch} from './HitTester'
import {screenPtToCanvasPt} from './PointConversion'
import {getPositionOnScreen} from './ViewTracker';

const initialState: State = t.newState(
    new Immutable.Map(),
    0,
    new Immutable.Map(),
    new Immutable.Map(),
    new Immutable.Map(),
    new Immutable.Map(),
    new Immutable.Set(),
    new Immutable.Set());

// TODO: Consider adding a top-level try/catch.
const playgroundApp = (state: State = initialState, action: Action): State => {
    // Despite our action union, there are some internal redux actions that
    // start with @@, which we want to just ignore.
    if (action.type.startsWith('@@')) {
        return state;
    }

    const exprWithId = (exprId: number): CanvasExpression => {
        const result = state.canvasExpressions.get(exprId);
        if (!result) {
            throw new Error('Expected expression with ID ' + exprId);
        }
        return result;
    };

    return t.matchAction(action, {
        reset: () => initialState,
        addExpression: ({canvasExpr}) => addExpression(state, canvasExpr),
        placeDefinition: ({defName, screenPos}) => {
            return state
                .updateCanvasDefinitions(canvasDefs => canvasDefs.set(
                    defName, screenPtToCanvasPt(screenPos)))
                // Create an entry for the definition, which may be null.
                .updateDefinitions(defs =>
                    defs.set(defName, defs.get(defName)));
        },
        moveExpression: ({exprId, pos}) => {
            return state.updateCanvasExpressions((exprs) =>
                exprs.update(exprId, (canvasExpr) =>
                    canvasExpr.withPos(pos)));
        },
        decomposeExpressionAction: ({path: {container, pathSteps}, targetPos}) => {
            let extracted = null;
            state = updateExprContainer(state, container, expr => {
                const decomposed = decomposeExpression(expr, pathSteps);
                extracted = decomposed.extracted;
                return decomposed.original;
            });
            if (extracted == null) {
                throw new Error('Expected extracted to be set.');
            }
            state = addExpression(
                state, t.newCanvasExpression(extracted, targetPos));
            return state;
        },
        insertAsArg: ({argExprId, path: {container, pathSteps}}) => {
            state = updateExprContainer(state, container, expr => {
                const argCanvasExpr = exprWithId(argExprId);
                return insertAsArg(expr, argCanvasExpr.expr, pathSteps);
            });
            state = state.updateCanvasExpressions(exprs => exprs.remove(argExprId));
            return state;
        },
        insertAsBody: ({bodyExprId, path: {container, pathSteps}}) => {
            state = updateExprContainer(state, container, expr => {
                const bodyCanvasExpr = exprWithId(bodyExprId);
                return insertAsBody(expr, bodyCanvasExpr.expr, pathSteps);
            });
            state = state.updateCanvasExpressions(
                exprs => exprs.remove(bodyExprId));
            return state;
        },
        evaluateExpression: ({exprId}) => {
            const existingExpr = exprWithId(exprId);
            if (!canStepUserExpr(existingExpr.expr)) {
                return state;
            }
            const evaluatedExpr = evaluateUserExpr(existingExpr.expr);
            if (!evaluatedExpr) {
                return state;
            }
            // We don't have enough information to place the expression yet,
            // since we don't know how big it is. Instead, place it in a list to
            // be measured, and complete the operation when placePendingResult
            // is triggered.
            const pendingResultId = state.nextExprId;
            return state
                .updatePendingResults(pending =>
                    pending.set(pendingResultId,
                        t.newPendingResult(evaluatedExpr, exprId)))
                .withNextExprId(pendingResultId + 1);
        },
        placePendingResult: ({exprId, width}) => {
            const pendingResult = state.pendingResults.get(exprId);
            if (pendingResult == null) {
                return state;
            }
            const {expr, sourceExprId} = pendingResult;
            const resultPos = computeResultPos(sourceExprId, width);
            state = state.updatePendingResults(pending =>
                pending.delete(exprId));
            return addExpression(state, t.newCanvasExpression(expr, resultPos));
        },
        fingerDown: ({fingerId, screenPos}) => {
            const dragResult = resolveTouch(state, screenPos);
            state = t.matchDragResult(dragResult, {
                pickUpExpression: ({exprId, offset, screenRect}) => {
                    const expr = exprWithId(exprId).expr;
                    return state
                        .updateCanvasExpressions(exprs => exprs.remove(exprId))
                        .updateActiveDrags((drags) =>
                            drags.set(fingerId,
                                t.newDragData(expr, offset, screenRect)));
                },
                decomposeExpression: ({exprPath, offset, screenRect}) => {
                    let extracted;
                    state = updateExprContainer(state, exprPath.container, expr => {
                        const decomposed = decomposeExpression(expr, exprPath.pathSteps);
                        extracted = decomposed.extracted;
                        return decomposed.original;
                    });
                    return state
                        .updateActiveDrags(drags =>
                            drags.set(fingerId,
                                t.newDragData(extracted, offset, screenRect)));
                },
                createExpression: ({expr, offset, screenRect}) => {
                    return state.updateActiveDrags(drags =>
                        drags.set(fingerId,
                            t.newDragData(expr, offset, screenRect)));
                },
                startPan: () => {
                    // TODO
                    return state;
                },
            });
            return computeHighlights(state);
        },
        fingerMove: ({fingerId, screenPos}) => {
            const dragData: ?DragData = state.activeDrags.get(fingerId);
            if (!dragData) {
                return state;
            }
            const {grabOffset, screenRect} = dragData;
            const oldGrabPoint = ptPlusDiff(screenRect.topLeft, grabOffset);
            const shiftAmount = ptMinusPt(screenPos, oldGrabPoint);
            const newScreenRect = rectPlusDiff(screenRect, shiftAmount);
            state = state.updateActiveDrags((drags) =>
                drags.update(fingerId, (dragData) =>
                    dragData.withScreenRect(newScreenRect)));
            return computeHighlights(state);
        },
        fingerUp: ({fingerId, screenPos}) => {
            const dragData: ?DragData = state.activeDrags.get(fingerId);
            if (!dragData) {
                return state;
            }
            const dropResult = resolveDrop(state, dragData, screenPos);
            state = state.updateActiveDrags((drags) => drags.remove(fingerId));
            state = t.matchDropResult(dropResult, {
                addToTopLevelResult: ({expr, screenPos}) => {
                    const canvasPos = screenPtToCanvasPt(screenPos);
                    return addExpression(state,
                        t.newCanvasExpression(expr, canvasPos));
                },
                insertAsBodyResult: ({lambdaPath: {container, pathSteps}, expr}) =>
                    updateExprContainer(state, container, targetExpr =>
                        insertAsBody(targetExpr, expr, pathSteps)
                    ),
                insertAsArgResult: ({path: {container, pathSteps}, expr}) =>
                    updateExprContainer(state, container, targetExpr =>
                        insertAsArg(targetExpr, expr, pathSteps)
                    ),
                removeResult: () => {
                    // Do nothing; we've already removed the expression.
                    return state;
                },
            });
            return computeHighlights(state);
        },
    });
};

const computeResultPos = (sourceExprId: number, width: number):
        CanvasPoint => {
    const sourceExprKey = t.newExpressionKey(emptyIdPath(sourceExprId));
    const sourceRect = getPositionOnScreen(sourceExprKey);
    if (sourceRect == null) {
        return t.newCanvasPoint(100, 100);
    }
    const midPoint = (sourceRect.topLeft.screenX + sourceRect.bottomRight.screenX) / 2;
    return t.newCanvasPoint(
        midPoint - (width / 2),
        sourceRect.bottomRight.screenY + 15,
    )
};

const computeHighlights = (state: State): State => {
    const exprPaths = [];
    const emptyBodyPaths = [];
    for (let [_, dragData] of state.activeDrags) {
        t.matchDropResult(resolveDrop(state, dragData), {
            addToTopLevelResult: () => {},
            insertAsBodyResult: ({lambdaPath}) => {
                emptyBodyPaths.push(lambdaPath)
            },
            insertAsArgResult: ({path}) => {exprPaths.push(path)},
            removeResult: () => {},
        });
    }
    return state
        .withHighlightedExprs(new Immutable.Set(exprPaths))
        .withHighlightedEmptyBodies(new Immutable.Set(emptyBodyPaths));
};

export default playgroundApp;