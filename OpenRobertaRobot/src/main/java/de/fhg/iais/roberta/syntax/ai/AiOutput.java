package de.fhg.iais.roberta.syntax.ai;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.factory.BlocklyDropdownFactory;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.action.Action;
import de.fhg.iais.roberta.syntax.action.motor.MotorGetPowerAction;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.visitor.IVisitor;

/**
 * TODO Doku
 */
public class AiOutput<V> extends AiNode<V> {
    private final Action<V> aiOutputAction;
    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind of the the object used in AST,
     * @param property
     * @param comment that the user added to the block
     */
    public AiOutput(BlockType kind, MotorGetPowerAction<V> aiOutputAction, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, property, comment);
        this.aiOutputAction = aiOutputAction;
    }

    /**
     * TODO Doku
     */
    public static <V> AiOutput<V> make(MotorGetPowerAction<V> externalActor, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new AiOutput<V>(BlockTypeContainer.getByName("AI_NN_OUTPUT_NODE"), externalActor, properties, comment);
    }

    @Override
    protected V acceptImpl(IVisitor<V> visitor) {
        return null; //TODO
    }

    @Override
    public Block astToBlock() {
        return null; //TODO
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + " [" + this.aiOutputAction + "]";
    }

    /**
     * TODO Doku
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        MotorGetPowerAction<V> externalMotor = createMotorAst(block, helper);
        return AiOutput.make(externalMotor, helper.extractBlockProperties(block), helper.extractComment(block));
    }

    private static <V> MotorGetPowerAction<V> createMotorAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Field> fields = helper.extractFields(block, (short) 1);
        String actorInfo = helper.extractField(fields, BlocklyConstants.OUTPUTNODE, "");
        BlocklyDropdownFactory factory = helper.getDropdownFactory();
        String[] actorInfoList = actorInfo.split("_");
        String outputType = actorInfoList[0];
        switch ( outputType.toLowerCase() ) {
            case "motorport":
                String actorPort = actorInfoList[1];
                return MotorGetPowerAction.make(factory.sanitizePort(actorPort), helper.extractBlockProperties(block), helper.extractComment(block));
            default:
                throw new RuntimeException("Output type " + outputType + " not supported!");
        }
    }

}
