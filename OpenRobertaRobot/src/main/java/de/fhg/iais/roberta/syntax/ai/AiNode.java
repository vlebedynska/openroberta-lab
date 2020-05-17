package de.fhg.iais.roberta.syntax.ai;

import de.fhg.iais.roberta.syntax.BlockType;
import de.fhg.iais.roberta.syntax.BlocklyBlockProperties;
import de.fhg.iais.roberta.syntax.BlocklyComment;
import de.fhg.iais.roberta.syntax.lang.expr.Expr;

/**
    TODO Doku
 */
public abstract class AiNode<V> extends Expr<V> {
    protected final Integer threshold;
    /**
     * This constructor set the kind of the object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind     of the the object used in AST,
     * @param property
     * @param comment  that the user added to the block
     */
    public AiNode(BlockType kind, Integer threshold, BlocklyBlockProperties property, BlocklyComment comment) {
        super(kind, property, comment);
        this.threshold = threshold;
    }

    public Integer getThreshold() {
        return threshold;
    }

    @Override
    public String toString() {
        return this.getClass().getSimpleName() + " [" + "TODO" + "]";
    }

}


