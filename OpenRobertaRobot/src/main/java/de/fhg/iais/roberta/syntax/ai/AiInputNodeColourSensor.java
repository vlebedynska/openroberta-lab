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
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

import java.util.List;

public class AiInputNodeColourSensor<V> extends AiInputNode<V>{

    public enum Colour {
        R, G, B
    }

    private final Colour colour;

    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *  @param kind     of the the object used in AST,
     * @param property
     * @param comment  that the user added to the block
     * @param colour
     */
    private AiInputNodeColourSensor(
        BlockType kind, ExternalSensor<V> externalSensor, Integer threshold, Colour colour, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, externalSensor, threshold, property, comment);
        this.colour = colour;
    }

    public static <V> AiInputNodeColourSensor<V> make(ExternalSensor<V> externalSensor, Integer threshold, Colour colour, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new AiInputNodeColourSensor<V>(BlockTypeContainer.getByName("AI_NN_INPUT_NODE_COLOURSENSOR_RGB_CHANNEL"), externalSensor, threshold, colour, properties, comment);
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
        Colour colour = Colour.R;
        //Colour colour = helper.extractField(fields, BlocklyConstants.COLOUR, "");
        ExternalSensor<V> externalSensor = createSensorAst(portName, block, helper);
        Integer threshold = 0;
        return AiInputNodeColourSensor.make(externalSensor, threshold, colour, helper.extractBlockProperties(block), helper.extractComment(block));
    }

    private static <V> ExternalSensor<V> createSensorAst(String portName, Block block, AbstractJaxb2Ast<V> helper) {
        BlocklyDropdownFactory factory = helper.getDropdownFactory();
        String slotName = BlocklyConstants.NO_SLOT;
        String modeName = "RGB";
        boolean isPortInMutation = false;
        SensorMetaDataBean sensorMetaDataBean = new SensorMetaDataBean(factory.sanitizePort(portName), factory.getMode(modeName), factory.sanitizeSlot(slotName), isPortInMutation);
        return ColorSensor.make(sensorMetaDataBean, helper.extractBlockProperties(block), helper.extractComment((block)));
    }

    @Override public Block astToBlock() {
        return null;
    }
}
