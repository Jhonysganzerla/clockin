package io.clockin.common;

public final class ConvertUtils {

    private ConvertUtils() {}

    public static String msToTime(long ms) {
        long absMs = Math.abs(ms);
        long totalSecs = absMs / 1000;
        long secs = totalSecs % 60;
        long mins = (totalSecs / 60) % 60;
        long hrs = totalSecs / 3600;
        String sign = ms < 0 ? "-" : "";
        return String.format("%s%02d:%02d:%02d", sign, hrs, mins, secs);
    }
}
