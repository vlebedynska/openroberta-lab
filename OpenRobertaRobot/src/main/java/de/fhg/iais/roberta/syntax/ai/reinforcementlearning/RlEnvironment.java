package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import java.util.List;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.blockly.generated.Value;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.EmptyExpr;
import de.fhg.iais.roberta.syntax.lang.expr.ListCreate;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.transformer.ExprParam;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

public class RlEnvironment<V> extends Stmt<V> {

    private static final String AI_RL_ENVIRONMENT = "AI_RL_ENVIRONMENT";

    private final ListCreate<V> listRlObstacle;
    private final int startNode;
    private final int finishNode;

    public ListCreate<V> getListRlObstacle() {
        return listRlObstacle;
    }

    public int getStartNode() {
        return startNode;
    }

    public int getFinishNode() {
        return finishNode;
    }

    /**
     * This constructor set the kind of the statement object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     * 
     * @param kind of the the statement object used in AST,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment of the user for the specific block
     * @param listRlObstacle
     */
    private RlEnvironment(
        BlockType kind,
        BlocklyBlockProperties properties,
        BlocklyComment comment,
        ListCreate<V> listRlObstacle,
        int startNode,
        int finishNode) {
        super(kind, properties, comment);
        this.listRlObstacle = listRlObstacle;
        this.startNode = startNode;
        this.finishNode = finishNode;
        setReadOnly();
    }

    /**
     * TODO Doku
     */
    public static <V> RlEnvironment<V> make(
        BlocklyBlockProperties properties,
        BlocklyComment comment,
        ListCreate<V> listRlObstacle,
        int startNode,
        int finishNode) {
        return new RlEnvironment<V>(BlockTypeContainer.getByName(AI_RL_ENVIRONMENT), properties, comment, listRlObstacle, startNode, finishNode);
    }

    @Override
    protected V acceptImpl(IVisitor<V> visitor) {return ((IAiVisitor<V>) visitor).visitAiRlEnvironment(this);}

    public String toString() {
        return this.getClass().getSimpleName() + " [" + " Startnode: " + startNode + " Finish-Node: " + finishNode + " Obstacles: " + listRlObstacle + " ]";
    }

    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Value> values = helper.extractValues(block, (short) 1);
        List<Field> fields = helper.extractFields(block, (short) 2);
        Phrase<V> obstaclesExpr = helper.extractValue(values, new ExprParam(BlocklyConstants.OBSTACLE, BlocklyType.STRING));
        final ListCreate<V> obstacles;

        if ( obstaclesExpr instanceof EmptyExpr ) {
            obstacles = null;
        } else if ( obstaclesExpr instanceof ListCreate ) {
            obstacles = (ListCreate<V>) obstaclesExpr;
        } else {
            throw new IllegalArgumentException("Bad type in field " + BlocklyConstants.OBSTACLE + ": " + obstaclesExpr.getClass());
        }

        int startNode = RlUtils.castCharacterStringToInt(helper.extractField(fields, BlocklyConstants.QLEARNING_START));
        int finishNode = RlUtils.castCharacterStringToInt(helper.extractField(fields, BlocklyConstants.QLEARNING_FINISH));

        return RlEnvironment.make(helper.extractBlockProperties(block), helper.extractComment(block), obstacles, startNode, finishNode);
    }

    @Override
    public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.QLEARNING_START, RlUtils.castIntToCharacterAsString(getStartNode()).toUpperCase());
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.QLEARNING_FINISH, RlUtils.castIntToCharacterAsString(getFinishNode()).toUpperCase());
        Ast2JaxbHelper.addValue(jaxbDestination, BlocklyConstants.OBSTACLE, getListRlObstacle());
        return jaxbDestination;
    }
}
