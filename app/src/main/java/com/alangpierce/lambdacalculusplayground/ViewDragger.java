package com.alangpierce.lambdacalculusplayground;

import android.content.ClipData;
import android.content.ClipDescription;
import android.support.v4.view.MotionEventCompat;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import javax.annotation.Nullable;

public class ViewDragger {
    private final OnStartDragListener startDragListener;

    private @Nullable OnDragListener currentDragListener;
    // An array of length 2 (x, y) with the screen coordinates of the last drag position.
    private int[] lastCoords;
    private int activePointerId = MotionEvent.INVALID_POINTER_ID;

    public ViewDragger(OnStartDragListener startDragListener) {
        this.startDragListener = startDragListener;
    }

    /**
     * Called to indicate that a drag operation has started.
     */
    public static interface OnStartDragListener {
        public @Nullable OnDragListener onStartDrag();
    }

    /**
     * Called on each drag tick with the change in touch position.
     *
     * TODO(alan): Think about rounding error here from the fact that we're only presenting ints but
     * the underlying stream is floats.
     */
    public static interface OnDragListener {
        public void onDrag(int dx, int dy);
    }

    public static void attachStartListenerToView(
            View dragHandle, OnStartDragListener startListener) {
//        dragHandle.setOnTouchListener(new ViewDragger(startListener));
    }

    public static void attachDragListenerToView(
            final View dragHandle, final ExpressionFragment fragment, final View draggedView, final OnDragListener dragListener) {
//        dragHandle.setOnTouchListener(new ViewDragger(new OnStartDragListener() {
//            @Override
//            public @Nullable OnDragListener onStartDrag() {
//                return dragListener;
//            }
//        }));

//        dragHandle.setOnLongClickListener(new View.OnLongClickListener() {
//            @Override
//            public boolean onLongClick(View v) {
//                System.out.printf("View %s received click %n", v);
//                ClipData clipData = new ClipData("foo", new String[]{ClipDescription.MIMETYPE_TEXT_PLAIN},
//                        new ClipData.Item("blah"));
//                dragHandle.startDrag(clipData, new View.DragShadowBuilder(dragHandle), null, 0);
//                return true;
//            }
//        });
        dragHandle.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public boolean onTouch(View v, MotionEvent event) {
                System.out.printf("Received MotionEvent %s", event);
                if (event.getAction() == MotionEvent.ACTION_DOWN) {
                    fragment.setVisible(false);
                    dragHandle.startDrag(null, new View.DragShadowBuilder(draggedView), fragment, 0);
                    return true;
                }
                return true;
            }
        });
    }

    /**
     * Get raw screen coordinates for an event. We need to use raw screen coordinates because the
     * drag handle (the origin point of our move operation) may or may not move as we drag.
     *
     * The API doesn't provide this, so we need to compute it more directly:
     * http://stackoverflow.com/questions/6517494/get-motionevent-getrawx-getrawy-of-other-pointers
     *
     * @return An array of length 2 with (x, y) screen coordinates.
     */
    private int[] getRawCoords(View v, MotionEvent event, int pointerIndex) {
        final int location[] = { 0, 0 };
        v.getLocationOnScreen(location);
        location[0] += event.getX(pointerIndex);
        location[1] += event.getY(pointerIndex);
        return location;
    }

//    @Override
//    public boolean onDrag(View v, DragEvent event) {
//        switch (event.getAction()) {
//            case DragEvent.ACTION_DRAG_STARTED: {
//
//            }
//        }
//    }

//    @Override
//    public boolean onTouch(View v, MotionEvent event) {
//        switch (event.getAction()) {
//            case MotionEvent.ACTION_DOWN: {
//                int pointerIndex = MotionEventCompat.getActionIndex(event);
//                lastCoords = getRawCoords(v, event, pointerIndex);
//                activePointerId = MotionEventCompat.getPointerId(event, pointerIndex);
//                currentDragListener = startDragListener.onStartDrag();
//                return true;
//            }
//            case MotionEvent.ACTION_MOVE: {
//                if (currentDragListener == null) {
//                    return true;
//                }
//                int pointerIndex =
//                        MotionEventCompat.findPointerIndex(event, activePointerId);
//                if (pointerIndex == -1) {
//                    return true;
//                }
//                int[] coords = getRawCoords(v, event, pointerIndex);
//                currentDragListener.onDrag(coords[0] - lastCoords[0], coords[1] - lastCoords[1]);
//                lastCoords = coords;
//                return true;
//            }
//            case MotionEvent.ACTION_UP: {
//                activePointerId = MotionEvent.INVALID_POINTER_ID;
//                currentDragListener = null;
//                return true;
//            }
//            default:
//                return true;
//        }
//    }
}
