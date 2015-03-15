package com.alangpierce.lambdacalculusplayground;

import android.app.Activity;

import com.alangpierce.lambdacalculusplayground.drag.DragObservableGenerator;
import com.alangpierce.lambdacalculusplayground.drag.DragObservableGeneratorImpl;
import com.alangpierce.lambdacalculusplayground.drag.TouchObservableManager;
import com.alangpierce.lambdacalculusplayground.drag.TouchObservableManagerImpl;
import com.alangpierce.lambdacalculusplayground.dragdrop.DragSourceRegistry;
import com.alangpierce.lambdacalculusplayground.dragdrop.DragSourceRegistryImpl;
import com.alangpierce.lambdacalculusplayground.dragdrop.DropTargetRegistry;
import com.alangpierce.lambdacalculusplayground.dragdrop.DropTargetRegistryImpl;
import com.alangpierce.lambdacalculusplayground.expressioncontroller.ExpressionControllerFactory.ExpressionControllerFactoryFactory;
import com.alangpierce.lambdacalculusplayground.expressioncontroller.ExpressionControllerFactoryImpl;
import com.alangpierce.lambdacalculusplayground.view.ExpressionViewRenderer;
import com.alangpierce.lambdacalculusplayground.view.ExpressionViewRendererImpl;

import javax.inject.Singleton;

import dagger.Module;
import dagger.Provides;

@Module
public class PlaygroundModule {
    private final Activity activity;

    public PlaygroundModule(Activity activity) {
        this.activity = activity;
    }

    @Provides Activity provideActivity() {
        return activity;
    }

    @Provides @Singleton
    DragObservableGenerator provideDragObservableGenerator(
            TouchObservableManager touchObservableManager) {
        return new DragObservableGeneratorImpl(touchObservableManager);
    }

    @Provides @Singleton
    TouchObservableManager provideTouchObservableManager() {
        return new TouchObservableManagerImpl();
    }

    @Provides @Singleton
    DropTargetRegistry provideDropTargetRegistry() {
        return new DropTargetRegistryImpl();
    }

    @Provides @Singleton
    DragSourceRegistry provideDragSourceRegistry(DragObservableGenerator dragObservableGenerator,
            DropTargetRegistry dropTargetRegistry) {
        return new DragSourceRegistryImpl(dragObservableGenerator, dropTargetRegistry);
    }

    @Provides
    ExpressionViewRenderer provideExpressionViewRenderer(Activity activity) {
        return new ExpressionViewRendererImpl(activity);
    }

    @Provides
    ExpressionControllerFactoryFactory provideExpressionControllerFactoryFactory(
            ExpressionViewRenderer viewRenderer, DragObservableGenerator dragObservableGenerator,
            DropTargetRegistry dropTargetRegistry, DragSourceRegistry dragSourceRegistry) {
        return ExpressionControllerFactoryImpl.createFactory(
                viewRenderer, dragObservableGenerator, dropTargetRegistry, dragSourceRegistry);
    }
}
