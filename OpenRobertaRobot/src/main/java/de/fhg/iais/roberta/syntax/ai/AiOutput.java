package de.fhg.iais.roberta.syntax.ai;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.Assoc;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;
import org.json.JSONObject;

/**
 * TODO Doku
 */
public class AiOutput<V> extends AiNode<V> {
    private final JSONObject aiOutputNodeData;

    public JSONObject getAiOutputNodeData() {
        return aiOutputNodeData;
    }

    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind of the the object used in AST,
     * @param property
     * @param comment that the user added to the block
     */
    public AiOutput(BlockType kind, JSONObject aiOutputNodeData, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, property, comment);
        this.aiOutputNodeData = aiOutputNodeData;
        setReadOnly();
    }

    /**
     * TODO Doku
     */
    public static <V> AiOutput<V> make(JSONObject aiOutputAction, BlocklyBlockProperties properties, BlocklyComment comment) {
        return new AiOutput<V>(BlockTypeContainer.getByName("AI_NN_OUTPUT_NODE"), aiOutputAction, properties, comment);
    }

    @Override
    protected V acceptImpl(IVisitor<V> visitor) {
        return ((IAiVisitor<V>) visitor).visitAiOutputNode(this);
    }



    @Override
    public String toString() {
        return this.getClass().getSimpleName() + " [" + this.aiOutputNodeData + "]";
    }

    /**
     * TODO Doku
     */
    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        JSONObject aiOutputNodeData = createOutputNodeData(block, helper);
        return AiOutput.make(aiOutputNodeData, helper.extractBlockProperties(block), helper.extractComment(block));
    }

    private static <V> JSONObject createOutputNodeData(Block block, AbstractJaxb2Ast<V> helper) {
        List<Field> fields = helper.extractFields(block, (short) 1);
        String actorInfo = helper.extractField(fields, BlocklyConstants.OUTPUTNODE, "");
        String[] actorInfoList = actorInfo.split("_");
        String outputType = actorInfoList[0];
        switch ( outputType.toLowerCase() ) {
            case "motorport":
                String actorPort = actorInfoList[1];
                JSONObject outputNodeStream = new JSONObject();
                outputNodeStream.put("port", actorPort.toLowerCase());
                outputNodeStream.put("type", outputType.toLowerCase());
                return outputNodeStream;
            default:
                throw new RuntimeException("Output type " + outputType + " not supported!");
        }
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        String type = getAiOutputNodeData().getString("type");
        switch ( type.toLowerCase() ){
            case "motorport":
            String port = getAiOutputNodeData().getString("port");
            String actorInfo = (type + "_"+ port).toUpperCase();
            Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.OUTPUTNODE, actorInfo);
        }
        return  jaxbDestination;
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
