package com.alangpierce.lambdacalculusplayground;

import com.alangpierce.lambdacalculusplayground.expressioncontroller.TopLevelExpressionController;

public interface TopLevelExpressionManager {
    /**
     * This should be called once when setting up the fragment.
     */
    void renderInitialExpressions();

    TopLevelExpressionController createNewExpression(ScreenExpression screenExpression);
}