package com.alangpierce.lambdacalculusplayground.view;

import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.util.List;

/**
 * Utilities for creating native Android views expressions.
 *
 * This is Activity-aware, so this needs to be a real class instead of just a bunch of utility
 * functions.
 */
public interface ExpressionViewRenderer {
    LinearLayout makeLinearLayoutWithChildren(List<View> children);
    TextView makeTextView(String text);
    LinearLayout styleLayout(final LinearLayout layout);
    LinearLayout makeMissingBodyView();
}