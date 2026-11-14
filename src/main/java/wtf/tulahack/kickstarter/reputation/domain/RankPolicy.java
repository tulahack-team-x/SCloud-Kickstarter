package wtf.tulahack.kickstarter.reputation.domain;

import java.util.List;

public class RankPolicy {
    private static final List<Rank> RANKS =
            List.of(
                    new Rank("Наблюдатель", 0),
                    new Rank("Друг науки", 10000),
                    new Rank("Партнёр науки", 1000000),
                    new Rank("Меценат", 5000000),
                    new Rank("Хранитель открытий", 15000000));

    public Rank current(long amountKopecks) {
        Rank current = RANKS.get(0);
        for (Rank rank : RANKS) {
            if (amountKopecks < rank.thresholdKopecks()) {
                break;
            }
            current = rank;
        }
        return current;
    }

    public Rank next(long amountKopecks) {
        return RANKS.stream()
                .filter(rank -> rank.thresholdKopecks() > amountKopecks)
                .findFirst()
                .orElse(null);
    }

    public record Rank(String name, long thresholdKopecks) {}
}
