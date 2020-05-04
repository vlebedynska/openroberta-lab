package de.fhg.iais.roberta.syntax.ai;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.factory.BlocklyDropdownFactory;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.Assoc;
import de.fhg.iais.roberta.syntax.sensor.ExternalSensor;
import de.fhg.iais.roberta.syntax.sensor.SensorMetaDataBean;
import de.fhg.iais.roberta.syntax.sensor.generic.UltrasonicSensor;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

/**
    TODO Doku
 */
public class AiInput<V> extends AiNode<V> {


    private final ExternalSensor<V> externalSensor;
    private final String sensorInfo;
    private final int threshold;

    public String getSensorInfo() {
        return sensorInfo;
    }

    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind     of the the object used in AST,
     * @param property
     * @param comment  that the user added to the block
     */
    private AiInput(BlockType kind, ExternalSensor<V> externalSensor, int threshold, String sensorInfo, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, property, comment);
        this.externalSensor = externalSensor;
        this.threshold = threshold;
        this.sensorInfo = sensorInfo;
        setReadOnly();
    }

    /**
    TODO Doku
     */
    public static <V> AiInput<V> make(ExternalSensor<V> externalSensor, int threshold, String sensorInfo, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new AiInput<V>(BlockTypeContainer.getByName("AI_NN_INPUT_NODE"), externalSensor, threshold, sensorInfo, properties, comment);
    }

    @Override
    protected V acceptImpl(IVisitor<V> visitor) {
        return ((IAiVisitor<V>) visitor).visitAiInputNode(this);
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + " [" + this.externalSensor + ", " + "Threshold = " + this.threshold  + "]";
    }

    /**
     TODO Doku
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Field> fields = helper.extractFields(block, (short) 2);

        String sensorInfo = helper.extractField(fields, BlocklyConstants.INPUTNODE, "");
        ExternalSensor<V> externalSensor = createSensorAst(sensorInfo, block, helper);

        String thresholdInfo = helper.extractField(fields, BlocklyConstants.THRESHOLD, "");
        int threshold = getThresholdValue(thresholdInfo);

        return AiInput.make(externalSensor, threshold, sensorInfo, helper.extractBlockProperties(block), helper.extractComment(block));
    }



    private static <V> ExternalSensor<V> createSensorAst(String sensorInfo, Block block, AbstractJaxb2Ast<V> helper) {
        BlocklyDropdownFactory factory = helper.getDropdownFactory();
        String[] sensorInfoList = sensorInfo.toLowerCase().split("_");
        String sensorType = sensorInfoList[0];
        String portName = sensorInfoList[2];
        String modeName = BlocklyConstants.DISTANCE;
        String slotName = BlocklyConstants.NO_SLOT;
        boolean isPortInMutation = false;
        SensorMetaDataBean sensorMetaDataBean = new SensorMetaDataBean(factory.sanitizePort(portName), factory.getMode(modeName), factory.sanitizeSlot(slotName), isPortInMutation);
        switch ( sensorType ) {
            case "ultrasonic":
                return UltrasonicSensor.make(sensorMetaDataBean, helper.extractBlockProperties(block), helper.extractComment(block));
        } throw new RuntimeException("Kein Input-Sensor gefunden!");
    }

    @Override public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.INPUTNODE, getSensorInfo());
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.THRESHOLD, String.valueOf(getThreshold())); //TODO Schwelenwert kommt nun als String an?


        return  jaxbDestination;
    }


    private static int getThresholdValue(String thresholdInfo) {
        try {
            return Integer.parseInt(thresholdInfo);
        } catch ( NumberFormatException e ) {
            //TODO add log warn entry
            return 0;
        }
    }

    public ExternalSensor<V> getExternalSensor() {
        return externalSensor;
    }

    public int getThreshold() {
        return threshold;
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
}