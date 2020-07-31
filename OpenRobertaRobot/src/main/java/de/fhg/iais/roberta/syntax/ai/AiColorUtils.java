package de.fhg.iais.roberta.syntax.ai;

import java.util.Arrays;
import java.util.stream.Collectors;

public class AiColorUtils {
    private static class AiColorConstants {
        private static final String RED_CHANNEL = "#FF0000";
        private static final String GREEN_CHANNEL = "#00FF00";
        private static final String BLUE_CHANNEL = "#0000FF";
        private static final String YELLOW = "#f7d117";
        private static final String BLACK = "#000000";
        private static final String GREEN = "#00642e";
        private static final String BROWN = "#532115";
        private static final String GREY = "#585858";
        private static final String RED = "#b30006";
        private static final String WHITE = "#ffffff";
        private static final String BLUE = "#0057a6";
        private static final String NONE = "";
        private static final String ORANGE = "#F7D118";

    }

    public enum Colour {
        R( AiColorConstants.RED_CHANNEL ),
        G( AiColorConstants.GREEN_CHANNEL ),
        B( AiColorConstants.BLUE_CHANNEL ),
        YELLOW( AiColorConstants.YELLOW ),
        BLACK( AiColorConstants.BLACK ),
        GREEN( AiColorConstants.GREEN ),
        BROWN( AiColorConstants.BROWN ),
        GREY( AiColorConstants.GREY ),
        RED( AiColorConstants.RED ),
        WHITE( AiColorConstants.WHITE ),
        BLUE( AiColorConstants.BLUE ),
        NONE( AiColorConstants.NONE ),
        ORANGE( AiColorConstants.ORANGE );

        public String getColourString() {
            return colourString;
        }

        private final String colourString;

        private Colour(String colourString) {
            this.colourString = colourString;
        }

        public static Colour byColourString(String colourStr) {
            for ( Colour value : Colour.values() ) {
                if ( value.colourString.equalsIgnoreCase(colourStr) ) {
                    return value;
                }
            }
            throw new IllegalArgumentException(
                colourStr + " : No such colour in " + Arrays.stream(Colour.values()).map(c -> c.colourString).collect(Collectors.joining(",", " ", "")));
        }
    }


}
