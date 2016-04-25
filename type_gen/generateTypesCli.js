#!/usr/local/bin/babel-node

import fs from 'fs'

import generateTypes from './generateTypes'

// To make the syntax much cleaner, we abuse the fact that key order is pretty
// much preserved in JS.
const types = {
    State: {
        type: 'struct',
        fields: {
            screenExpressions: 'Immutable.Map<number, ScreenExpression>',
            nextExprId: 'number',
        },
    },
    Action: {
        // Redux complains if the don't use plain objects for actions.
        type: 'objectUnion',
        cases: {
            /**
             * Clear the state. Useful for testing.
             */
            Reset: {},
            /**
             * Create a new expression at the given position.
             */
            AddExpression: {
                screenExpr: 'ScreenExpression',
            },
            /**
             * Move the existing expression on the canvas to a new point.
             */
            MoveExpression: {
                exprId: 'number',
                pos: 'CanvasPoint',
            },
            /**
             * Given an expression path, which must reference either a lambda
             * with a body or a function call, remove the body or the call
             * argument, and create a new expression from it at the given
             * coordinates.
             */
            DecomposeExpression: {
                path: 'ExprPath',
                targetPos: 'CanvasPoint',
            },
            /**
             * If the given expression can be evaluated, evaluate it and place
             * the result as a new expression in the given position.
             */
            EvaluateExpression: {
                exprId: 'number',
                targetPos: 'CanvasPoint',
            }
        },
    },
    Expression: {
        type: 'union',
        cases: {
            Lambda: {
                varName: 'string',
                body: 'Expression',
            },
            FuncCall: {
                func: 'Expression',
                arg: 'Expression',
            },
            Variable: {
                varName: 'string',
            }
        }
    },
    UserExpression: {
        type: 'union',
        cases: {
            UserLambda: {
                varName: 'string',
                body: '?UserExpression'
            },
            UserFuncCall: {
                func: 'UserExpression',
                arg: 'UserExpression',
            },
            UserVariable: {
                varName: 'string',
            },
            UserReference: {
                defName: 'string',
            },
        }
    },
    ScreenExpression: {
        type: 'struct',
        fields: {
            expr: 'UserExpression',
            pos: 'CanvasPoint',
        },
    },
    CanvasPoint: {
        type: 'struct',
        fields: {
            canvasX: 'number',
            canvasY: 'number',
        },
    },
    PathComponent: {
        type: 'literal',
        value: "'func' | 'arg' | 'body'",
    },
    ExprPath: {
        type: 'struct',
        fields: {
            exprId: 'number',
            pathSteps: 'Array<PathComponent>',
        }
    }
};

const main = () => {
    const typesFileStr = generateTypes(types);
    fs.writeFile('../types.js', typesFileStr, (err) => {
        if (err) {
            console.log('Error: ' + err);
        } else {
            console.log('Done!');
        }
    });
};

main();