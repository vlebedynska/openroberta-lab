package de.fhg.iais.roberta.syntax.ai;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.factory.BlocklyDropdownFactory;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.action.motor.MotorGetPowerAction;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.visitor.IVisitor;

import java.util.List;

/**
    TODO Doku
 */
public class AiOutput<V> extends AiNode<V> {
    private final MotorGetPowerAction<V> externalActor;
    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind     of the the object used in AST,
     * @param property
     * @param comment  that the user added to the block
     */
    public AiOutput(BlockType kind, MotorGetPowerAction<V> externalActor, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, property, comment);
        this.externalActor = externalActor;
    }

    /**
    TODO Doku
     */
    public static <V> AiOutput<V> make(Block block, MotorGetPowerAction<V> externalActor, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new AiOutput<V>(BlockTypeContainer.getByName("AI_ACTOR"), externalActor, properties, comment);
    }

    @Override
    protected V acceptImpl(IVisitor<V> visitor) {
        return null; //TODO
    }

    @Override public Block astToBlock() {
        return null; //TODO
    }

    @Override
    public String toString() {
        return super.toString();
    }
    /**
     TODO Doku
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Field> fields = helper.extractFields(block, (short) 1);
        String actorInfo = helper.extractField(fields, BlocklyConstants.ACTOR, "");
        MotorGetPowerAction<V> externalMotor = createMotorAst(actorInfo, block, helper);

  /*          List<Field> fields = helper.extractFields(block, (short) 2);

        String sensorInfo = helper.extractField(fields, BlocklyConstants.SENSOR, "");
        ExternalSensor<V> externalSensor = createSensorAst(sensorInfo, block, helper);

        String thresholdInfo = helper.extractField(fields, BlocklyConstants.THRESHOLD, "");
        int threshold = getThresholdValue(thresholdInfo);

        return AiInput.make(externalSensor, threshold, helper.extractBlockProperties(block), helper.extractComment(block));*/

        return AiOutput.make(block, externalMotor, helper.extractBlockProperties(block), helper.extractComment(block));
    }

    private static <V> MotorGetPowerAction<V> createMotorAst(String actorInfo, Block block, AbstractJaxb2Ast<V> helper) {
        BlocklyDropdownFactory factory = helper.getDropdownFactory();
        String[] actorInfoList = actorInfo.toLowerCase().split("_");
        String actorPort = actorInfoList[1];
        return null;//MotorGetPowerAction.make(factory.sanitizePort(actorPort), helper.extractBlockProperties(block), helper.extractComment(block));
    }


/*    BlocklyDropdownFactory factory = helper.getDropdownFactory();
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
}*/




/*
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        BlocklyDropdownFactory factory = helper.getDropdownFactory();
        List<Field> fields = helper.extractFields(block, (short) 1);
        String portName = helper.extractField(fields, BlocklyConstants.MOTORPORT);
        return MotorGetPowerAction.make(factory.sanitizePort(portName), helper.extractBlockProperties(block), helper.extractComment(block));
    }
*/

}


