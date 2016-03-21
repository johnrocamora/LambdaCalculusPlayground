package com.alangpierce.lambdacalculusplayground.geometry;

import com.google.auto.value.AutoValue;

import java.io.Serializable;

/**
 * A point representing the difference between two points.
 */
@AutoValue
public abstract class PointDifference implements Serializable {
    public abstract int getX();
    public abstract int getY();

    public static PointDifference create(int x, int y) {
        return new AutoValue_PointDifference(x, y);
    }

    public PointDifference plus(PointDifference other) {
        return create(getX() + other.getX(), getY() + other.getY());
    }
}

