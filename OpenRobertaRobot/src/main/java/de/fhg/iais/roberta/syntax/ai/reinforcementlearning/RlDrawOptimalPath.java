package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

public class RlDrawOptimalPath <V> extends Stmt<V> {

    private static final String AI_RL_QLEARNING_DRAW_OPTIMAL_PATH = "AI_RL_QLEARNING_DRAW_OPTIMAL_PATH";

    /**
     * This constructor set the kind of the statement object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind       of the the statement object used in AST,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment    of the user for the specific block
     */
    public RlDrawOptimalPath(
        BlockType kind, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(kind, properties, comment);
    }


    public static <V> RlDrawOptimalPath<V> make(BlocklyBlockProperties properties, BlocklyComment comment) {
        return new RlDrawOptimalPath<>(BlockTypeContainer.getByName(AI_RL_QLEARNING_DRAW_OPTIMAL_PATH), properties, comment);
    }

    public String toString() {
        return this.getClass().getSimpleName() + "[]";
    }


    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        return RlDrawOptimalPath.make(helper.extractBlockProperties(block), helper.extractComment(block));
    }


    @Override protected V acceptImpl(IVisitor<V> visitor) {
        return ((IAiVisitor<V>) visitor).visitAiRlDrawOptimalPath(this);
    }

    @Override public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        return jaxbDestination;
    }

}
