package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.Assoc;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

import java.util.List;

public class RlObstacle<V> extends Expr<V> {

    private static final String AI_RL_OBSTACLE = "AI_RL_OBSTACLE";

    private final int startNode;
    private final int finishNode;

    private RlObstacle(BlockType kind, BlocklyBlockProperties properties, BlocklyComment comment, int startNode, int finishNode) {
        super(kind, properties, comment);
        this.startNode = startNode;
        this.finishNode = finishNode;
        setReadOnly();
    }

    public static <V> RlObstacle<V> make(BlocklyBlockProperties properties, BlocklyComment comment, int startNode, int finishNode) {
        return new RlObstacle<V>(BlockTypeContainer.getByName(AI_RL_OBSTACLE), properties, comment, startNode, finishNode);
    }


    public String toString() {
        return this.getClass().getSimpleName() + " [" + " Startnode: " + startNode + " Finish-Node: " + finishNode + " ]";
    }



    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Field> fields = helper.extractFields(block, (short) 2);

        int startNode = RlUtils.castCharacterStringToInt(helper.extractField(fields, BlocklyConstants.QLEARNING_START));
        int finishNode = RlUtils.castCharacterStringToInt(helper.extractField(fields, BlocklyConstants.QLEARNING_FINISH));

        return RlObstacle.make(helper.extractBlockProperties(block), helper.extractComment(block), startNode, finishNode);
    }


    public int getStartNode() {
        return startNode;
    }

    public int getFinishNode() {
        return finishNode;
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

    @Override protected V acceptImpl(IVisitor<V> visitor) {
        return ((IAiVisitor<V>) visitor).visitAiRlObstacle(this);
    }

    @Override public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.QLEARNING_START, RlUtils.castIntToCharacterAsString(getStartNode()).toUpperCase());
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.QLEARNING_FINISH, RlUtils.castIntToCharacterAsString(getFinishNode()).toUpperCase());
        return jaxbDestination;
    }
}
