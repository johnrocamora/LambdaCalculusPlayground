package com.alangpierce.lambdacalculusplayground.definition;

import com.alangpierce.lambdacalculusplayground.AppState;
import com.alangpierce.lambdacalculusplayground.expression.Expression;
import com.alangpierce.lambdacalculusplayground.expression.FuncCall;
import com.alangpierce.lambdacalculusplayground.expression.Lambda;
import com.alangpierce.lambdacalculusplayground.expression.Variable;
import com.alangpierce.lambdacalculusplayground.userexpression.UserExpression;
import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimaps;
import com.google.common.collect.SetMultimap;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nullable;

public class DefinitionManagerImpl implements DefinitionManager {
    // The app state contains the source of truth for the user-specified definitions; we just
    // denormalize some of it in our state when necessary.
    private final AppState appState;

    private final Map<String, Expression> definitionMap =
            Collections.synchronizedMap(new HashMap<>());
    private final SetMultimap<Expression, String> namesByExpression =
            Multimaps.synchronizedSetMultimap(HashMultimap.create());

    public DefinitionManagerImpl(AppState appState) {
        this.appState = appState;
    }

    @Override
    public String tryResolveExpression(Expression expression) {
        Set<String> names = namesByExpression.get(expression);
        if (names.isEmpty()) {
            return null;
        } else {
            // TODO: Maybe do something smarter here.
            return names.iterator().next();
        }
    }

    /**
     * Given just the user definitions, figure out what expression, if any, should be used for each
     * definition. We run this whenever any definition changes, since that definition might
     * potentially be referenced by any other definition.
     *
     * Circular definitions case every definition in the cycle to be seen as invalid.
     */
    @Override
    public void invalidateDefinitions() {
        definitionMap.clear();
        namesByExpression.clear();

        // Note that we need to eagerly compute all definitions now instead of doing it lazily since
        // we might need to do reverse lookups.
        for (String defName : appState.getAllDefinitions().keySet()) {
            resolveDefinition(defName);
        }
    }

    /**
     * Compute the Expression for this definition, and populate the definitionMap and
     * namesByExpression tables appropriately. Return null if the expression is invalid.
     *
     * Note that this is mutually recursive with toExpression, with definitionMap used as a
     * mechanism for memoization and cycle detection.
     */
    private Expression resolveDefinition(String defName) {
        if (!appState.getAllDefinitions().containsKey(defName)) {
            return null;
        }

        // If there's already an entry, use it. Note that the entry might be null, indicating that
        // the definition is invalid.
        if (definitionMap.containsKey(defName)) {
            return definitionMap.get(defName);
        }

        // Mark this definition as invalid while we're computing it. That ensures that any circular
        // references are seen as invalid.
        definitionMap.put(defName, null);

        try {
            UserExpression userExpression = appState.getAllDefinitions().get(defName);
            Expression expression = toExpression(userExpression);
            definitionMap.put(defName, expression);
            namesByExpression.put(expression, defName);
            return expression;
        } catch (InvalidExpressionException e) {
            // Do nothing; the definition stays null.
            return null;
        }
    }

    /**
     * Given a UserExpression, convert to an Expression if possible.
     * <p>
     * throws InvalidExpressionException if there was a problem.
     */
    @Override
    public Expression toExpression(@Nullable UserExpression e) throws InvalidExpressionException {
        if (e == null) {
            throw new InvalidExpressionException();
        }
        return e.visit(
                lambda -> {
                    if (lambda.body() == null) {
                        throw new InvalidExpressionException();
                    }
                    return Lambda.create(lambda.varName(), toExpression(lambda.body()));
                },
                funcCall -> FuncCall.create(toExpression(funcCall.func()), toExpression(funcCall.arg())),
                variable -> Variable.create(variable.varName()),
                reference -> {
                    Expression expression = resolveDefinition(reference.defName());
                    if (expression == null) {
                        throw new InvalidExpressionException();
                    }
                    return expression;
                }
        );
    }

}
