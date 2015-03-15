package com.alangpierce.lambdacalculusplayground.view;

import android.view.View;
import android.widget.LinearLayout;

import com.alangpierce.lambdacalculusplayground.drag.DragObservableGenerator;
import com.alangpierce.lambdacalculusplayground.drag.PointerMotionEvent;
import com.google.common.collect.ImmutableList;

import javax.annotation.Nullable;

import rx.Observable;

public class FuncCallView implements ExpressionView {
    private final DragObservableGenerator dragObservableGenerator;

    private final LinearLayout view;

    public FuncCallView(
            DragObservableGenerator dragObservableGenerator, LinearLayout view) {
        this.dragObservableGenerator = dragObservableGenerator;
        this.view = view;
    }

    public static FuncCallView render(DragObservableGenerator dragObservableGenerator,
            ExpressionViewRenderer renderer, LinearLayout func, LinearLayout arg) {
        LinearLayout mainView = renderer.makeLinearLayoutWithChildren(ImmutableList.of(func, arg));
        return new FuncCallView(dragObservableGenerator, mainView);
    }

    public Observable<? extends Observable<PointerMotionEvent>> getWholeViewObservable() {
        return dragObservableGenerator.getDragObservable(view);
    }

    @Override
    public LinearLayout getNativeView() {
        return view;
    }
}
