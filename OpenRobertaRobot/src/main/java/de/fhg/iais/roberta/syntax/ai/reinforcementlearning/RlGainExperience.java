package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Value;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.Ast2JaxbHelper;
import de.fhg.iais.roberta.transformer.ExprParam;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;
import de.fhg.iais.roberta.visitor.ai.IAiVisitor;

import java.util.List;

public class RlGainExperience <V> extends Stmt<V> {

    private static final String AI_RL_Q_GAIN_EXPERIENCE = "AI_RL_Q_GAIN_EXPERIENCE";
    private final Phrase<V> qLearningEpisodes;

    private final Phrase<V> qLearningTime;

    public Phrase<V> getqLearningEpisodes() {
        return qLearningEpisodes;
    }

    public Phrase<V> getqLearningTime() {
        return qLearningTime;
    }

    /**
     * This constructor set the kind of the statement object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *  @param kind       of the the statement object used in AST,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment    of the user for the specific block
     * @param qLearningEpisodes
     * @param qLearningTime
     */
    private RlGainExperience(
        BlockType kind, BlocklyBlockProperties properties, BlocklyComment comment, Phrase<V> qLearningEpisodes, Phrase<V> qLearningTime) {
        super(kind, properties, comment);
        this.qLearningEpisodes = qLearningEpisodes;
        this.qLearningTime = qLearningTime;
    }


    public static <V> RlGainExperience<V> make(BlocklyBlockProperties properties, BlocklyComment comment, Phrase<V> qLearningEpisodes, Phrase<V> qLearningTime) {
        return new RlGainExperience<V>(BlockTypeContainer.getByName(AI_RL_Q_GAIN_EXPERIENCE), properties, comment, qLearningEpisodes, qLearningTime);
    }

    public String toString() {
        return this.getClass().getSimpleName() + "[]";
    }


    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Value> values = helper.extractValues(block, (short) 2);

        Phrase<V> qLearningEpisodes = helper.extractValue(values, new ExprParam(BlocklyConstants.QLEARNING_EPISODES, BlocklyType.NUMBER));
        Phrase<V> qLearningTime = helper.extractValue(values, new ExprParam(BlocklyConstants.QLEARNING_TIME, BlocklyType.NUMBER));

        return RlGainExperience.make(helper.extractBlockProperties(block), helper.extractComment(block), qLearningEpisodes, qLearningTime);
    }


    @Override protected V acceptImpl(IVisitor<V> visitor) {
        return ((IAiVisitor<V>) visitor).visitAiRlGainExperience(this);
    }

    @Override public Block astToBlock() {
        Block jaxbDestination = new Block();
        Ast2JaxbHelper.setBasicProperties(this, jaxbDestination);
        Ast2JaxbHelper.addValue(jaxbDestination, BlocklyConstants.QLEARNING_EPISODES, getqLearningEpisodes());
        Ast2JaxbHelper.addValue(jaxbDestination, BlocklyConstants.QLEARNING_TIME, getqLearningTime());
        return jaxbDestination;
    }
}
