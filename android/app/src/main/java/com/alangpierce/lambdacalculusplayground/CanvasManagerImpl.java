package com.alangpierce.lambdacalculusplayground;

import com.alangpierce.lambdacalculusplayground.definition.DefinitionManager;
import com.alangpierce.lambdacalculusplayground.definition.ExpressionTooBigException;
import com.alangpierce.lambdacalculusplayground.definition.UserDefinitionManager;
import com.alangpierce.lambdacalculusplayground.definitioncontroller.DefinitionController;
import com.alangpierce.lambdacalculusplayground.expressioncontroller.ExpressionController;
import com.alangpierce.lambdacalculusplayground.expressioncontroller.ExpressionControllerFactory.ExpressionControllerFactoryFactory;
import com.alangpierce.lambdacalculusplayground.expressioncontroller.TopLevelExpressionController;
import com.alangpierce.lambdacalculusplayground.geometry.CanvasPoint;
import com.alangpierce.lambdacalculusplayground.geometry.DrawableAreaPoint;
import com.alangpierce.lambdacalculusplayground.geometry.PointConverter;
import com.alangpierce.lambdacalculusplayground.geometry.ScreenPoint;
import com.alangpierce.lambdacalculusplayground.userexpression.UserExpression;
import com.google.common.collect.ImmutableList;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.annotation.Nullable;

public class CanvasManagerImpl implements CanvasManager {
    private final AppState appState;
    private final ExpressionControllerFactoryFactory controllerFactoryFactory;
    private final PointConverter pointConverter;
    private final DefinitionManager definitionManager;
    private final UserDefinitionManager userDefinitionManager;

    private final Set<TopLevelExpressionController> expressionControllers = new HashSet<>();
    private final Map<String, DefinitionController> definitionControllers = new HashMap<>();

    public CanvasManagerImpl(
            AppState appState,
            ExpressionControllerFactoryFactory controllerFactoryFactory,
            PointConverter pointConverter,
            DefinitionManager definitionManager,
            UserDefinitionManager userDefinitionManager) {
        this.appState = appState;
        this.controllerFactoryFactory = controllerFactoryFactory;
        this.pointConverter = pointConverter;
        this.definitionManager = definitionManager;
        this.userDefinitionManager = userDefinitionManager;
    }

    @Override
    public void renderInitialData() {
        for (Entry<Integer, ScreenExpression> entry : appState.expressionsById()) {
            int exprId = entry.getKey();
            ScreenExpression screenExpression = entry.getValue();
            renderTopLevelExpression(exprId, screenExpression, false /* placeAbovePalette */);
        }
        for (Entry<String, CanvasPoint> entry : appState.getDefinitionsOnScreen().entrySet()) {
            String defName = entry.getKey();
            CanvasPoint point = entry.getValue();
            UserExpression definition = appState.getAllDefinitions().get(defName);
            ScreenDefinition screenDefinition = ScreenDefinition.create(defName, definition, point);
            renderDefinition(screenDefinition);
        }
    }

    @Override
    public TopLevelExpressionController createNewExpression(
            UserExpression expression, ScreenPoint screenPos, boolean placeAbovePalette) {
        CanvasPoint canvasPos = pointConverter.toCanvasPoint(screenPos);
        ScreenExpression screenExpression = ScreenExpression.create(expression, canvasPos);
        int exprId = appState.addScreenExpression(screenExpression);
        return renderTopLevelExpression(exprId, screenExpression, placeAbovePalette);
    }

    @Override
    public TopLevelExpressionController sendExpressionToTopLevel(
            ExpressionController expression, ScreenPoint screenPos) {
        CanvasPoint canvasPos = pointConverter.toCanvasPoint(screenPos);
        ScreenExpression screenExpression = ScreenExpression.create(
                expression.getExpression(), canvasPos);
        int exprId = appState.addScreenExpression(screenExpression);
        TopLevelExpressionController controller = controllerFactoryFactory.create(this)
                .wrapInTopLevelController(
                        expression, screenExpression, false /* placeAbovePalette */);
        registerTopLevelExpression(exprId, controller, canvasPos);
        // In some cases (like when pulling a circular reference out of a definition, thus making
        // the definition valid), we can attach an expression to the root with a stale definition
        // state, so just recompute it.
        expression.invalidateDefinitions();
        return controller;
    }

    /**
     * Given a new expression, create a view for it and hook up all necessary callbacks.
     */
    private TopLevelExpressionController renderTopLevelExpression(
            int exprId, ScreenExpression screenExpression, boolean placeAbovePalette) {
        TopLevelExpressionController controller =
                controllerFactoryFactory.create(this).createTopLevelController(
                        screenExpression, placeAbovePalette);
        registerTopLevelExpression(exprId, controller, screenExpression.canvasPos());
        return controller;
    }

    private void registerTopLevelExpression(
            int exprId, TopLevelExpressionController controller, CanvasPoint canvasPos) {
        expressionControllers.add(controller);
        controller.setOnChangeCallback(newController -> {
            if (newController != null) {
                appState.modifyExpression(exprId, newController.getScreenExpression());
            } else {
                appState.deleteExpression(exprId);
                expressionControllers.remove(controller);
            }
        });
        controller.getView().attachToRoot(canvasPos);
    }

    @Override
    public boolean placeDefinition(String defName, DrawableAreaPoint drawableAreaPoint)
            throws ExpressionTooBigException {
        DefinitionController existingController = definitionControllers.get(defName);
        if (existingController != null) {
            ScreenPoint screenPoint = pointConverter.toScreenPoint(drawableAreaPoint);
            existingController.handlePositionChange(screenPoint);
            return true;
        } else {
            CanvasPoint canvasPoint = pointConverter.toCanvasPoint(drawableAreaPoint);
            @Nullable UserExpression existingDefinition =
                    userDefinitionManager.resolveDefinitionForCreation(defName);
            // If existingDefinition is a new number, we're effectively adding it as a new
            // definition, so make sure we add it to the palette by setting alreadyExisted to true.
            boolean alreadyExisted = appState.getAllDefinitions().containsKey(defName);
            appState.setDefinition(defName, existingDefinition);
            appState.addDefinitionOnScreen(defName, canvasPoint);

            // Either make a new blank definition or use the existing one.
            ScreenDefinition definition = ScreenDefinition.create(
                    defName, existingDefinition, canvasPoint);
            renderDefinition(definition);
            if (!alreadyExisted) {
                definitionManager.invalidateDefinitions();
            }
            // From the user's perspective, it makes sense to say "showing existing definition" any
            // time the definition is nonempty, including when showing the definition for a number.
            return existingDefinition != null;
        }
    }

    @Override
    public void deleteDefinitionIfExists(String defName) {
        DefinitionController existingController = definitionControllers.get(defName);
        if (existingController != null) {
            // This changes the app state to remove the definition from the screen.
            existingController.destroy();
        }
        appState.deleteDefinition(defName);
        definitionManager.invalidateDefinitions();
        invalidateDefinitions();
    }

    private DefinitionController renderDefinition(ScreenDefinition screenDefinition) {
        DefinitionController controller =
                controllerFactoryFactory.create(this).createDefinitionController(screenDefinition);
        definitionControllers.put(screenDefinition.defName(), controller);
        controller.setOnChangeCallback(newController -> {
            if (newController != null) {
                ScreenDefinition newScreenDefinition = newController.getScreenDefinition();
                appState.setDefinition(newScreenDefinition.defName(), newScreenDefinition.expr());
                appState.addDefinitionOnScreen(
                        newScreenDefinition.defName(), newScreenDefinition.canvasPos());
                definitionManager.invalidateDefinitions();
                invalidateDefinitions();
            } else {
                // Hide the definition (but don't actually delete it from the definition manager).
                appState.removeDefinitionFromScreen(screenDefinition.defName());
                definitionControllers.remove(screenDefinition.defName());
            }
        });
        return controller;
    }

    private void invalidateDefinitions() {
        for (TopLevelExpressionController controller : expressionControllers) {
            controller.invalidateDefinitions();
        }
        for (DefinitionController controller : definitionControllers.values()) {
            controller.invalidateDefinitions();
        }
    }

    @Override
    public void handleAutomaticNumbersChanged() {
        definitionManager.invalidateDefinitions();
        invalidateDefinitions();
    }
}
