package com.alangpierce.lambdacalculusplayground.expressioncontroller;

import android.view.View.MeasureSpec;

import com.alangpierce.lambdacalculusplayground.ScreenExpression;
import com.alangpierce.lambdacalculusplayground.TopLevelExpressionManager;
import com.alangpierce.lambdacalculusplayground.drag.PointerMotionEvent;
import com.alangpierce.lambdacalculusplayground.dragdrop.DragSource;
import com.alangpierce.lambdacalculusplayground.geometry.DrawableAreaPoint;
import com.alangpierce.lambdacalculusplayground.geometry.PointConverter;
import com.alangpierce.lambdacalculusplayground.geometry.PointDifference;
import com.alangpierce.lambdacalculusplayground.geometry.ScreenPoint;
import com.alangpierce.lambdacalculusplayground.userexpression.UserExpression;
import com.alangpierce.lambdacalculusplayground.userexpression.UserExpressions;
import com.alangpierce.lambdacalculusplayground.userexpression.UserFuncCall;
import com.alangpierce.lambdacalculusplayground.userexpression.UserLambda;
import com.alangpierce.lambdacalculusplayground.userexpression.UserVariable;
import com.alangpierce.lambdacalculusplayground.view.TopLevelExpressionView;
import com.google.common.collect.ImmutableList;

import java.util.List;

import javax.annotation.Nullable;

import rx.Observable;
import rx.Subscription;
import rx.subjects.PublishSubject;
import rx.subjects.Subject;

public class TopLevelExpressionControllerImpl implements TopLevelExpressionController {
    private final TopLevelExpressionManager topLevelExpressionManager;
    private final TopLevelExpressionView view;
    private final PointConverter pointConverter;

    private ScreenExpression screenExpression;
    private ExpressionController expressionController;
    private OnTopLevelChangeCallback onChangeCallback;

    private final Subject<Observable<PointerMotionEvent>,Observable<PointerMotionEvent>>
            dragActionSubject = PublishSubject.create();
    private @Nullable Subscription dragActionSubscription;

    public TopLevelExpressionControllerImpl(
            TopLevelExpressionManager topLevelExpressionManager, TopLevelExpressionView view,
            PointConverter pointConverter, ScreenExpression screenExpression,
            ExpressionController expressionController) {
        this.topLevelExpressionManager = topLevelExpressionManager;
        this.view = view;
        this.pointConverter = pointConverter;
        this.screenExpression = screenExpression;
        this.expressionController = expressionController;
    }

    @Override
    public ScreenExpression getScreenExpression() {
        return screenExpression;
    }

    @Override
    public TopLevelExpressionView getView() {
        return view;
    }

    @Override
    public void setOnChangeCallback(OnTopLevelChangeCallback onChangeCallback) {
        this.onChangeCallback = onChangeCallback;
    }

    @Override
    public void handlePositionChange(ScreenPoint screenPos) {
        DrawableAreaPoint canvasPos = pointConverter.toDrawableAreaPoint(screenPos);
        screenExpression = ScreenExpression.create(screenExpression.getExpr(), canvasPos);
        onChangeCallback.onChange(this);
    }

    public void handleExprChange(ExpressionController newExpressionController) {
        UserExpression newExpression = newExpressionController.getExpression();
        screenExpression = ScreenExpression.create(newExpression, screenExpression.getCanvasPos());
        boolean isExecutable = UserExpressions.canStep(newExpression);
        view.handleExpressionChange(
                newExpressionController.getView(), screenExpression.getCanvasPos(), isExecutable);
        newExpressionController.setOnChangeCallback(this::handleExprChange);
        expressionController = newExpressionController;
        updateDragActionSubscription();
        onChangeCallback.onChange(this);
    }

    private void updateDragActionSubscription() {
        if (dragActionSubscription != null) {
            dragActionSubscription.unsubscribe();
            dragActionSubscription = null;
        }
        dragActionSubscription = view.getExpressionObservable().subscribe(dragActionSubject);
    }

    private void handleExecuteClick() {
        @Nullable UserExpression newExpr = UserExpressions.evaluate(screenExpression.getExpr());
        if (newExpr == null) {
            // For now, just ignore expressions that infinite loop.
            return;
        }
        TopLevelExpressionController newExpression = topLevelExpressionManager.createNewExpression(
                newExpr, view.getScreenPos().plus(PointDifference.create(100, 200)));

        ScreenPoint newScreenPos = computeExecuteResultScreenPos(newExpression);
        newExpression.getView().setScreenPos(newScreenPos);
        newExpression.handlePositionChange(newScreenPos);
    }

    private ScreenPoint computeExecuteResultScreenPos(TopLevelExpressionController newExpression) {
        ScreenPoint thisViewPos = view.getScreenPos();
        int thisViewWidth = view.getNativeView().getWidth();
        int thisViewHeight = view.getNativeView().getHeight();

        newExpression.getView().getNativeView().measure(
                MeasureSpec.UNSPECIFIED, MeasureSpec.UNSPECIFIED);
        int viewWidth = newExpression.getView().getNativeView().getMeasuredWidth();

        int dx = (thisViewWidth / 2) - (viewWidth / 2);
        int dy = thisViewHeight + 50;
        return thisViewPos.plus(PointDifference.create(dx, dy));
    }

    @Override
    public List<DragSource> getDragSources() {
        // TODO: Put this in a better place or re-purpose this function.
        view.setOnExecuteListener(this::handleExecuteClick);

        updateDragActionSubscription();
        return ImmutableList.of(new TopLevelExpressionDragSource());
    }

    @Override
    public ExpressionController decommission() {
        onChangeCallback.onChange(null);
        if (dragActionSubscription != null) {
            dragActionSubscription.unsubscribe();
        }
        view.decommission();
        return expressionController;
    }

    @Override
    public boolean isTrivialExpression() {
        return screenExpression.getExpr().visit(new UserExpression.UserExpressionVisitor<Boolean>() {
            @Override
            public Boolean visit(UserLambda lambda) {
                return lambda.body == null;
            }
            @Override
            public Boolean visit(UserFuncCall funcCall) {
                return false;
            }
            @Override
            public Boolean visit(UserVariable variable) {
                return true;
            }
        });
    }

    private class TopLevelExpressionDragSource implements DragSource {
        @Override
        public Observable<? extends Observable<PointerMotionEvent>> getDragObservable() {
            return dragActionSubject;
        }
        @Override
        public TopLevelExpressionController handleStartDrag() {
            return TopLevelExpressionControllerImpl.this;
        }
    }
}
