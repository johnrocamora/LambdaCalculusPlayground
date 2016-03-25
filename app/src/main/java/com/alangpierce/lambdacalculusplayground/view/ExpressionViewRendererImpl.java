package com.alangpierce.lambdacalculusplayground.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.ColorFilter;
import android.graphics.Paint;
import android.graphics.PixelFormat;
import android.graphics.drawable.Drawable;
import android.support.v4.content.ContextCompat;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.widget.ImageView;
import android.widget.ImageView.ScaleType;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.alangpierce.lambdacalculusplayground.R;
import com.google.common.collect.ImmutableMap;
import com.melnykov.fab.FloatingActionButton;

import java.io.BufferedReader;
import java.util.List;
import java.util.Map;

public class ExpressionViewRendererImpl implements ExpressionViewRenderer {
    private final Context context;

    public ExpressionViewRendererImpl(Context context) {
        this.context = context;
    }

    /**
     * An expression is *almost* just a horizontal LinearLayout, so we reuse that as much as we can.
     * However, with expressions, we always want them to take on their full size, so we ignore any
     * incoming MeasureSpecs and just use UNSPECIFIED (i.e. "be as big as you need to be"). If we
     * didn't do this, RelativeLayout would try to shrink us when we're part of the way off-screen,
     * which results in a weird visual bug.
     *
     * TODO: Consider passing around this class instead of LinearLayout everywhere. In general,
     * though, this class is a bit of a hacky bug fix rather than an intentional attempt at
     * introducing something like type safety here.
     */
    public static class ExpressionLayout extends LinearLayout {
        public ExpressionLayout(Context context) {
            super(context);
        }
        @Override
        protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
            super.onMeasure(MeasureSpec.UNSPECIFIED, MeasureSpec.UNSPECIFIED);
        }
    }

    @Override
    public LinearLayout makeLinearLayoutWithChildren(List<View> children) {
        LinearLayout result = new ExpressionLayout(context);
        for (View child : children) {
            result.addView(child);
        }
        return styleLayout(result);
    }

    @Override
    public TextView makeTextView(String text) {
        TextView textView = new TextView(context);
        textView.setText(text);
        textView.setTextSize(30);
        // For now, just use black to make the text consistent with the bracket images, which are
        // black.
        // TODO: Use some kind of dark gray color instead of black.
        textView.setTextColor(Color.BLACK);
        textView.setGravity(Gravity.CENTER_VERTICAL);
        textView.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, LayoutParams.MATCH_PARENT));
        textView.setPadding(20, 0, 20, 0);
        return textView;
    }

    Map<String, Integer> BRACKET_DRAWABLE_BY_STRING = ImmutableMap.of(
            "(", R.drawable.drawable_left_paren,
            ")", R.drawable.drawable_right_paren,
            "[", R.drawable.drawable_left_bracket,
            "]", R.drawable.drawable_right_bracket);

    @Override
    public View makeBracketView(String text) {
        ImageView imageView = new ImageView(context);
        int resId = BRACKET_DRAWABLE_BY_STRING.get(text);
        imageView.setImageDrawable(context.getResources().getDrawable(resId, null));
        // TODO: Don't use pixels here.
        imageView.setLayoutParams(new ViewGroup.LayoutParams(20, LayoutParams.MATCH_PARENT));
        imageView.setScaleType(ScaleType.FIT_XY);
        return imageView;
    }

    @Override
    public LinearLayout styleLayout(final LinearLayout layout) {
        layout.setBackgroundColor(getColor(R.color.expression_background));
        layout.setPadding(6, 3, 6, 3);
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        layoutParams.setMargins(6, 3, 6, 3);
        layout.setLayoutParams(layoutParams);
        layout.setVerticalGravity(Gravity.CENTER_VERTICAL);
        layout.setElevation(10);
        return layout;
    }

    @Override
    public LinearLayout makeMissingBodyView() {
        LinearLayout layout = new LinearLayout(context);
        layout.setBackgroundColor(getColor(R.color.empty_body));
        layout.setPadding(3, 3, 3, 3);
        LinearLayout.LayoutParams layoutParams = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT);
        layoutParams.setMargins(3, 3, 3, 3);
        layout.setLayoutParams(layoutParams);
        layout.setVerticalGravity(Gravity.CENTER_VERTICAL);
        layout.setElevation(10);
        layout.addView(makeTextView(" "));
        return layout;
    }

    public View makeExecuteButton() {
        FloatingActionButton button = new FloatingActionButton(context);
        button.setType(FloatingActionButton.TYPE_MINI);
        button.setImageResource(R.drawable.ic_av_play_arrow);
        button.setColorNormal(getColor(R.color.execute_normal));
        button.setColorRipple(getColor(R.color.execute_ripple));
        button.setColorPressed(getColor(R.color.execute_pressed));
        RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(80, 80);
        button.setLayoutParams(params);
        return button;
    }

    private int getColor(int resId) {
        return ContextCompat.getColor(context, resId);
    }
}
