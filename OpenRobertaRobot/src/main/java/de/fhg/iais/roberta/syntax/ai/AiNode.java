package de.fhg.iais.roberta.syntax.ai;

import de.fhg.iais.roberta.syntax.BlockType;
import de.fhg.iais.roberta.syntax.BlocklyBlockProperties;
import de.fhg.iais.roberta.syntax.BlocklyComment;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;
import org.json.JSONObject;

/**
    TODO Doku
 */
public abstract class AiNode<V> extends Expr<V> {
    protected final Integer threshold;
    public static final int DEFAULT_THRESHOLD = 0;
    private final JSONObject nodeData;

    public JSONObject getNodeData() {
        return nodeData;
    }

    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *  @param kind     of the the object used in AST,
     * @param property
     * @param comment  that the user added to the block
     * @param nodeData
     */
    public AiNode(BlockType kind, Integer threshold, BlocklyBlockProperties property, BlocklyComment comment, JSONObject nodeData) {
        super(kind, property, comment);
        this.threshold = threshold;
        this.nodeData = nodeData;
    }

    public Integer getThreshold() {
        return threshold;
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + " [" + "TODO" + "]";
    }

}


