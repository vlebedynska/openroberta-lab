package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.blockly.generated.Value;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.EmptyExpr;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import de.fhg.iais.roberta.syntax.lang.expr.ListCreate;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.transformer.ExprParam;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.util.dbc.Assert;
import de.fhg.iais.roberta.visitor.IVisitor;

import java.util.List;
import java.util.logging.Logger;

public class RlEnvironment<V> extends Stmt<V> {

    private final ListCreate<V> listRlObstacle;
    private final int startNode;
    private final int finishNode;
    public static final String ALPHABET = "abcdefghijklmnopqrstuvwxyz";

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
     *  @param kind       of the the statement object used in AST,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment    of the user for the specific block
     * @param listRlObstacle
     */
    private RlEnvironment(
        BlockType kind, BlocklyBlockProperties properties, BlocklyComment comment, ListCreate<V> listRlObstacle, Integer startNode, Integer finishNode) {
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
        Integer startNode,
        Integer finishNode
        ) {
        return new RlEnvironment<V>(BlockTypeContainer.getByName("AI_RL_ENVIRONMENT"), properties, comment, listRlObstacle, startNode, finishNode);
    }



    @Override protected V acceptImpl(IVisitor<V> visitor) {
        return null;
    }

    public String toString() {
        return this.getClass().getSimpleName() + " [" + " Startnode: " + startNode + " Finish-Node: " + finishNode + " Obstacles: " + listRlObstacle +" ]";
    }



    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Value> values = helper.extractValues(block, (short) 1);
        List<Field> fields = helper.extractFields(block, (short) 2);
        Phrase<V> obstaclesExpr = helper.extractValue(values, new ExprParam(BlocklyConstants.OBSTACLE, BlocklyType.STRING));
        final ListCreate<V> obstacles;

        if(obstaclesExpr instanceof EmptyExpr){
            obstacles = null;
        } else if(obstaclesExpr instanceof ListCreate){
            obstacles = (ListCreate<V>) obstaclesExpr;
        } else{
            throw new IllegalArgumentException("Bad type in field " + BlocklyConstants.OBSTACLE + ": " + obstaclesExpr.getClass());
        }

        int startNode = castCharacterStringToInt(helper.extractField(fields, BlocklyConstants.QLEARNING_START, null));
        int finishNode = castCharacterStringToInt(helper.extractField(fields, BlocklyConstants.QLEARNING_FINISH, null));

        return RlEnvironment.make(helper.extractBlockProperties(block), helper.extractComment(block), obstacles, startNode, finishNode);
    }



    private static Integer castCharacterStringToInt(String characterString) {
        Assert.isTrue(characterString != null && characterString.length() == 1, "Wrong char's length. Single char is expected, got: " + characterString);
        return ALPHABET.indexOf(characterString.toLowerCase());
    }

    //todo
    private static String castIntToCharacterAsString(int number) {
        Assert.isTrue(number >= 0 && number < ALPHABET.length(), "Number out of range. Expected 0 -  " + (ALPHABET.length()-1) + ", got: " + number  );
        return String.valueOf(ALPHABET.charAt(number));
    }



    @Override public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.QLEARNING_START, castIntToCharacterAsString(getStartNode()).toUpperCase());
        Ast2JaxbHelper.addField(jaxbDestination, BlocklyConstants.QLEARNING_FINISH, castIntToCharacterAsString(getFinishNode()).toUpperCase());
        Ast2JaxbHelper.addValue(jaxbDestination, BlocklyConstants.OBSTACLE, getListRlObstacle());
        return  jaxbDestination;
    }
}
