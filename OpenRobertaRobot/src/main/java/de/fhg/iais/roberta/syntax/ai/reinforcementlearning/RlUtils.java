package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import de.fhg.iais.roberta.util.dbc.Assert;

public class RlUtils {
    public static final String ALPHABET = "abcdefghijklmnopqrstuvwxyz";

    static int castCharacterStringToInt(String characterString) {
        Assert.isTrue(characterString.length() == 1, "Wrong char's length. Single char is expected, got: " + characterString);
        return ALPHABET.indexOf(characterString.toLowerCase());
    }

    //todo
    static String castIntToCharacterAsString(int number) {
        Assert.isTrue(number >= 0 && number < ALPHABET.length(), "Number out of range. Expected 0 -  " + (ALPHABET.length() - 1) + ", got: " + number);
        return String.valueOf(ALPHABET.charAt(number));
    }
}
