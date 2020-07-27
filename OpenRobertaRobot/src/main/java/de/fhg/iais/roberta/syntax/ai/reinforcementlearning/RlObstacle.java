package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.blockly.generated.Value;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.Assoc;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.transformer.ExprParam;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

import java.util.List;

public class RlObstacle<V> extends Expr<V> {

    private static final String AI_RL_OBSTACLE = "AI_RL_OBSTACLE";

    private final Phrase<V> startNode;
    private final Phrase<V> finishNode;

    private RlObstacle(BlockType kind, BlocklyBlockProperties properties, BlocklyComment comment, Phrase<V> startNode, Phrase<V> finishNode) {
        super(kind, properties, comment);
        this.startNode = startNode;
        this.finishNode = finishNode;
        setReadOnly();
    }

    public static <V> RlObstacle<V> make(BlocklyBlockProperties properties, BlocklyComment comment, Phrase<V> startNode, Phrase<V> finishNode) {
        return new RlObstacle<V>(BlockTypeContainer.getByName(AI_RL_OBSTACLE), properties, comment, startNode, finishNode);
    }


    public String toString() {
        return this.getClass().getSimpleName() + " [" + " Startnode: " + startNode + " Finish-Node: " + finishNode + " ]";
    }



    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Value> values = helper.extractValues(block, (short) 2);

        Phrase<V> startNode = helper.extractValue(values, new ExprParam(BlocklyConstants.QLEARNING_START, BlocklyType.NUMBER));
        Phrase<V> finishNode = helper.extractValue(values, new ExprParam(BlocklyConstants.QLEARNING_FINISH, BlocklyType.NUMBER));

        return RlObstacle.make(helper.extractBlockProperties(block), helper.extractComment(block), startNode, finishNode);
    }


    public Phrase<V> getStartNode() {
        return startNode;
    }

    public Phrase<V> getFinishNode() {
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
        Ast2JaxbHelper.addValue(jaxbDestination, BlocklyConstants.QLEARNING_START, getStartNode());
        Ast2JaxbHelper.addValue(jaxbDestination, BlocklyConstants.QLEARNING_FINISH, getFinishNode());
        return jaxbDestination;
    }
}
