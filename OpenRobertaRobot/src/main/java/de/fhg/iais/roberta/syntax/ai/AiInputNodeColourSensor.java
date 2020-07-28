package de.fhg.iais.roberta.syntax.ai;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.factory.BlocklyDropdownFactory;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.Assoc;
import de.fhg.iais.roberta.syntax.sensor.ExternalSensor;
import de.fhg.iais.roberta.syntax.sensor.SensorMetaDataBean;
import de.fhg.iais.roberta.syntax.sensor.generic.ColorSensor;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;
import org.json.JSONObject;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class AiInputNodeColourSensor<V> extends AiInputNode<V>{

    private static class TmpConstants {
        private static final String RED_CHANNEL = "#DC143C";
        private static final String GREEN_CHANNEL = "#00FF00";
        private static final String BLUE_CHANNEL = "#0057A6";
        private static final String YELLOW = "#f7d117";
        private static final String BLACK = "#000000";
        private static final String GREEN = "#00642e";
        private static final String BROWN = "#532115";
        private static final String GREY = "#585858";
        private static final String RED = "#b30006";
        private static final String WHITE = "#ffffff";
        private static final String BLUE = "#0057a6";
        private static final String NONE = "";

    }

    public enum Colour {
        R(TmpConstants.RED_CHANNEL), G(TmpConstants.GREEN_CHANNEL), B(TmpConstants.BLUE_CHANNEL), YELLOW(TmpConstants.YELLOW),
        BLACK(TmpConstants.BLACK), GREEN(TmpConstants.GREEN), BROWN(TmpConstants.BROWN), GREY(TmpConstants.GREY),
        RED(TmpConstants.RED), WHITE(TmpConstants.WHITE), BLUE(TmpConstants.BLUE), NONE(TmpConstants.NONE);

        private final String colourString;

        private Colour (String colourString) {
            this.colourString = colourString;
        }

        public static Colour byColourString(String colourStr) {
            for ( Colour value : Colour.values() ) {
                if ( value.colourString.equalsIgnoreCase(colourStr) ) {
                    return value;
                }
            }
            throw new IllegalArgumentException(colourStr + " : No such colour in " +
                Arrays.stream(Colour.values())
                    .map(c -> c.colourString)
                    .collect(Collectors.joining(",", " ","")));
        }
    }


    private final Colour colour;

    public Colour getColour() {
        return colour;
    }

    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     * @param kind     of the the object used in AST,
     * @param colour
     * @param property
     * @param comment  that the user added to the block
     * @param nodeData
     */
    private AiInputNodeColourSensor(
        BlockType kind,
        ExternalSensor<V> externalSensor,
        Integer threshold,
        Colour colour,
        BlocklyBlockProperties property,
        BlocklyComment comment,
        JSONObject nodeData) {
        super(kind, externalSensor, threshold, property, comment, nodeData);
        this.colour = colour;
    }

    public static <V> AiInputNodeColourSensor<V> make(
        ExternalSensor<V> externalSensor, Integer threshold, Colour colour, BlocklyBlockProperties properties, BlocklyComment comment, JSONObject nodeData) {
        return new AiInputNodeColourSensor<V>(BlockTypeContainer.getByName("AI_NN_INPUT_NODE_COLOURSENSOR_RGB_CHANNEL"), externalSensor, threshold, colour, properties, comment,
            nodeData);
    }

    protected V acceptImpl(IVisitor<V> visitor) {
        return ((IAiVisitor<V>) visitor).visitAiInputNodeColourSensor(this);
    }


    public String toString() {
        return this.getClass().getSimpleName() + " [" + this.externalSensor + ", " + "Threshold = " + this.threshold  + "," + "Colour = " + this.colour + "]";
    }


    @Override public int getPrecedence() {
        return 0;
    }

    @Override public Assoc getAssoc() {
        return null;
    }

    @Override public BlocklyType getVarType() {
        return null;
    }

    /**
     TODO Doku
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Field> fields = helper.extractFields(block, (short) 2);
        String portName = helper.extractField(fields, BlocklyConstants.SENSORPORT, "");
        String colourExtracted = helper.extractField(fields, BlocklyConstants.COLOUR, "");
        Colour colour = Colour.byColourString(colourExtracted.toUpperCase()); //throws exeption

        ExternalSensor<V> externalSensor = createSensorAst(portName, block, helper);
        Integer threshold = DEFAULT_THRESHOLD;


        JSONObject nodeData = new JSONObject();
        nodeData
            .put("port", portName)
            .put("mode", externalSensor.getMode())
            .put("slot", externalSensor.getSlot())
            .put("color", colour)
            .put("name", "Farbsensor");

        return AiInputNodeColourSensor.make(externalSensor, threshold, colour, helper.extractBlockProperties(block), helper.extractComment(block), nodeData);
    }

    private static <V> ExternalSensor<V> createSensorAst(String portName, Block block, AbstractJaxb2Ast<V> helper) {
        BlocklyDropdownFactory factory = helper.getDropdownFactory();
        String slotName = BlocklyConstants.NO_SLOT;
        String modeName = "";

        switch (block.getType()) {
            case "ai_nn_input_node_coloursensor_rgb_channel":
                modeName = "RGB";
                break;
            case "ai_nn_input_node_coloursensor_color":
                modeName = "COLOUR";
                break;
            case "ai_nn_input_node_coloursensor_light":
                modeName = "LIGHT";
                break;
        }

        boolean isPortInMutation = false;
        SensorMetaDataBean sensorMetaDataBean = new SensorMetaDataBean(factory.sanitizePort(portName), factory.getMode(modeName), factory.sanitizeSlot(slotName), isPortInMutation);
        return ColorSensor.make(sensorMetaDataBean, helper.extractBlockProperties(block), helper.extractComment((block)));
    }

    @Override public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.COLOUR, getColour().colourString);
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.SENSORPORT, getExternalSensor().getPort());
        return  jaxbDestination;
   }
}
