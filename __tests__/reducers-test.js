/**
 * @flow
 */

jest.disableAutomock();

import * as Immutable from 'immutable'

import parseExpression from '../parseExpression'
import store from '../store'
import {newCanvasPoint, newExprPath, newScreenExpression} from '../types'
import * as t from '../types'

describe('reducers', () => {
    beforeEach(function () {
        jest.addMatchers({
            is: () => ({
                compare: (actual, expected) => {
                    return actual.toJSON() === expected.toJSON();
                    // return Immutable.is(actual, expected);
                }
            })
        })
    });

    it('handles new expressions', () => {
        store.dispatch(t.newReset());
        store.dispatch(t.newAddExpression(makeScreenExpr('L x[x]')));
        const state = store.getState();
        expect(state.nextExprId).toEqual(1);
        expect((state: any).screenExpressions.get(0).expr.varName).toEqual('x');
    });

    it('handles moving expressions', () => {
        store.dispatch(t.newReset());
        store.dispatch(t.newAddExpression(makeScreenExpr('L x[x]')));
        store.dispatch(t.newMoveExpression(0, newCanvasPoint(100, 100)));
        const screenExpr = store.getState().screenExpressions.get(0);
        expect((screenExpr: any).pos.canvasX).toEqual(100);
    });

    it('handles extract body', () => {
        store.dispatch(t.newReset());
        store.dispatch(t.newAddExpression(makeScreenExpr('L x[L y[L z[x]]]')));
        store.dispatch(t.newDecomposeExpression(
            newExprPath(0, ['body']), newCanvasPoint(25, 25)
        ));
        assertExpression(0, 'L x[L y[_]]', 50, 50);
        assertExpression(1, 'L z[x]', 25, 25);
    });

    it('handles extract arg', () => {
        store.dispatch(t.newReset());
        store.dispatch(t.newAddExpression(makeScreenExpr('L x[+(2)(x)]')));
        store.dispatch(t.newDecomposeExpression(
            newExprPath(0, ['body', 'func']), newCanvasPoint(25, 25)
        ));
        assertExpression(0, 'L x[+(x)]', 50, 50);
        assertExpression(1, '2', 25, 25);
    });

    it('evaluates expressions', () => {
        store.dispatch(t.newReset());
        store.dispatch(t.newAddExpression(makeScreenExpr('L x[L y[x]](y)')));
        store.dispatch(t.newEvaluateExpression(0, newCanvasPoint(25, 25)));
        // TODO: Switch to the right value when evaluation is implemented.
        assertExpression(1, 'L x[L y[x]](y)', 25, 25);
        // assertExpression(1, "L y'[y]", 25, 25);
    });

    const assertExpression = (exprId, exprString, canvasX, canvasY) => {
        expect(store.getState().screenExpressions.get(exprId).toJS()).toEqual(
            newScreenExpression(parseExpression(exprString),
                newCanvasPoint(canvasX, canvasY)).toJS());
    };

    const makeScreenExpr = (exprString) => {
        return newScreenExpression(
            parseExpression(exprString), newCanvasPoint(50, 50));
    };
});