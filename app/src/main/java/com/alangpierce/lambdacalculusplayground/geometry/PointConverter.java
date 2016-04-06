package com.alangpierce.lambdacalculusplayground.geometry;

public interface PointConverter {
    DrawableAreaPoint toDrawableAreaPoint(ScreenPoint screenPoint);
    DrawableAreaPoint toDrawableAreaPoint(CanvasPoint canvasPoint);
    CanvasPoint toCanvasPoint(ScreenPoint screenPoint);
    CanvasPoint toCanvasPoint(DrawableAreaPoint drawableAreaPoint);
    ScreenPoint toScreenPoint(DrawableAreaPoint drawableAreaPoint);
}
