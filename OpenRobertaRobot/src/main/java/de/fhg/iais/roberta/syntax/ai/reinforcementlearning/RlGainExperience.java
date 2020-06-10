package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.visitor.IVisitor;

import java.util.List;

public class RlGainExperience <V> extends Stmt<V> {

    private static final String AI_RL_Q_GAIN_EXPERIENCE = "AI_RL_Q_GAIN_EXPERIENCE";

    /**
     * This constructor set the kind of the statement object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *
     * @param kind       of the the statement object used in AST,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment    of the user for the specific block
     */
    private RlGainExperience(
        BlockType kind, BlocklyBlockProperties properties, BlocklyComment comment) {
        super(kind, properties, comment);
    }


    public static <V> RlGainExperience<V> make(BlocklyBlockProperties properties, BlocklyComment comment) {
        return new RlGainExperience<V>(BlockTypeContainer.getByName(AI_RL_Q_GAIN_EXPERIENCE), properties, comment);
    }

    public String toString() {
        return this.getClass().getSimpleName() + "[]";
    }


    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        return RlGainExperience.make(helper.extractBlockProperties(block), helper.extractComment(block));
    }



    //FIXME impl
    @Override protected V acceptImpl(IVisitor<V> visitor) {
        return null;
    }

    //FIXME impl
    @Override public Block astToBlock() {
        return null;
    }
}
