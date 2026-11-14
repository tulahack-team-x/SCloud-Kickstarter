package wtf.tulahack.kickstarter.shared.model;

import java.util.List;

public record PageSlice<T>(List<T> items, int offset, boolean hasMore) {
    public static <T> PageSlice<T> from(List<T> items, int offset, int limit) {
        if (offset < 0 || limit < 1 || limit > 100) {
            throw wtf.tulahack.kickstarter.shared.error.ApplicationException.invalid(
                    "limit: 1–100, offset: от 0");
        }
        int start = Math.min(offset, items.size());
        int end = (int) Math.min((long) start + limit, items.size());
        return new PageSlice<>(List.copyOf(items.subList(start, end)), offset, end < items.size());
    }
}
