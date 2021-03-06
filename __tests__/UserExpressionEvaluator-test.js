/**
 * @flow
 */

jest.disableAutomock();

import {parseExpr, formatExpr} from '../ExpressionStr';
import {IMap} from '../types-collections';
import {evaluateUserExpr, expandAllDefinitions} from '../UserExpressionEvaluator';
import type {Definitions, UserDefinitions} from '../UserExpressionEvaluator';

let userDefinitions: UserDefinitions = IMap.make();
let definitions: Definitions = IMap.make();
const define = (defName, exprString) => {
    userDefinitions = userDefinitions.set(defName, parseExpr(exprString));
};

describe('evaluateUserExpression', () => {
    beforeEach(() => {
        define('TRUE', 'L t[L f[t]]');
        define('FALSE', 'L t[L f[f]]');
        define('TRUE', 'L t[L f[t]]');
        define('FALSE', 'L t[L f[f]]');
        define('NOT', 'L b[L t[L f[b(f)(t)]]]');

        define('PAIR', 'L x[L y[L b[b(x)(y)]]]');
        define('LHS', 'L p[p(TRUE)]');
        define('RHS', 'L p[p(FALSE)]');

        define('0', 'L s[L z[z]]');
        define('1', 'L s[L z[s(z)]]');
        define('2', 'L s[L z[s(s(z))]]');
        define('3', 'L s[L z[s(s(s(z)))]]');
        define('4', 'L s[L z[s(s(s(s(z))))]]');
        define('5', 'L s[L z[s(s(s(s(s(z)))))]]');
        define('6', 'L s[L z[s(s(s(s(s(s(z))))))]]');
        define('+', 'L n[L m[L s[L z[n(s)(m(s)(z))]]]]');
        define('*', 'L n[L m[L s[L z[n(m(s))(z)]]]]');
        define('ISZERO', 'L n[n(L x[FALSE])(TRUE)]');
        define('PRED', `
            L n[L s[L z[
                LHS(
                    n
                        (L x[
                            PAIR
                                (RHS(x)(s(LHS(x)))(LHS(x)))
                                (TRUE)
                        ])
                        (PAIR(z)(FALSE))
                )
            ]]]`);

        define('Y', 'L f[L x[f(x(x))](L x[f(x(x))])]');

        define('FACTREC',
            'L f[L n[ISZERO(n)(1)(*(n)(f(PRED(n))))]]');
        define('FACT', 'Y(FACTREC)');

        definitions = expandAllDefinitions(userDefinitions, false);
    });

    it('can evaluate booleans', () => {
        assertResult('TRUE', 'TRUE');
        assertResult('FALSE', 'NOT(TRUE)');
    });

    it('can do math', () => {
        assertResult('3', '+(1)(2)');
        assertResult('6', '*(2)(3)');
        assertResult('FALSE', 'ISZERO(2)');
        assertResult('TRUE', 'ISZERO(0)');
    });

    it('handles pairs', () => {
        assertResult('2', 'LHS(PAIR(2)(3))');
        assertResult('3', 'RHS(PAIR(2)(3))');
    });

    it('can compute predecessor', () => {
        assertResult('0', 'PRED(0)');
        assertResult('0', 'PRED(1)');
        assertResult('1', 'PRED(2)');
        assertResult('2', 'PRED(3)');
        assertResult('3', 'PRED(4)');
    });

    it('can run factorial', () => {
        assertResult('1', 'FACTREC(L x[x])(0)');
        assertResult('1', 'FACTREC(L x[1])(1)');
        assertResult('2', 'FACTREC(L x[1])(2)');
        assertResult('2', 'FACT(2)');
        assertResult('6', 'FACT(3)');
    });

    it('avoids name collisions', () => {
        assertResult("L y'[y]", 'L x[L y[x]](y)');
        assertResult("L y'[y(y')]", 'L x[L y[x(y)]](y)');
    });

    it('fails gracefully on stack overflow', () => {
        assertError('L x[x(x)](L x[x(x)])');
    });

    it('fails gracefully on timeout', () => {
        assertError('256(256)(256)');
    });

    const assertResult = (expectedResultStr: string, exprStr: string) => {
        // Make sure result is in canonical form.
        expectedResultStr = formatExpr(parseExpr(expectedResultStr));
        expect(formatExpr(notNull(
                evaluateUserExpr(definitions, true, parseExpr(exprStr)))))
            .toEqual(expectedResultStr);
    };

    const assertError = (exprString: string) => {
        expect(evaluateUserExpr(definitions, true, parseExpr(exprString)))
            .toEqual(null);
    };

    const notNull = function<T>(t: ?T): T {
        if (!t) {
            throw new Error('Unexpected null.');
        }
        return t;
    };
});