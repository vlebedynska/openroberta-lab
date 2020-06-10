package de.fhg.iais.roberta.syntax.ai.reinforcementlearning;

import de.fhg.iais.roberta.blockly.generated.Block;
import de.fhg.iais.roberta.blockly.generated.Field;
import de.fhg.iais.roberta.blockly.generated.Value;
import de.fhg.iais.roberta.syntax.*;
import de.fhg.iais.roberta.syntax.lang.expr.ListCreate;
import de.fhg.iais.roberta.syntax.lang.stmt.Stmt;
import de.fhg.iais.roberta.transformer.AbstractJaxb2Ast;
import de.fhg.iais.roberta.transformer.ExprParam;
import de.fhg.iais.roberta.typecheck.BlocklyType;
import de.fhg.iais.roberta.visitor.IVisitor;

import java.util.List;

public class RlSetUpQLearningBehaviour<V> extends Stmt<V> {

    private final float alpha; //learning speed between 0 (slow) and 1 (fast)
    private final float gamma; // reward between 0 (immediately) and 1 later
    private final float nu; // startposition 0 (stay on path) and 1 (start random)
    private final float rho; //experience 0 (none) and 1 (very experienced)


    /**
     * This constructor set the kind of the statement object used in the AST (abstract syntax tree). All possible kinds can be found in {@link BlockType}.
     *  @param kind       of the the statement object used in AST,
     * @param properties of the block (see {@link BlocklyBlockProperties}),
     * @param comment    of the user for the specific block
     * @param alpha
     * @param gamma
     * @param nu
     * @param rho
     */
    private RlSetUpQLearningBehaviour(
        BlockType kind, BlocklyBlockProperties properties, BlocklyComment comment, float alpha, float gamma, float nu, float rho) {
        super(kind, properties, comment);
        this.alpha = alpha;
        this.gamma = gamma;
        this.nu = nu;
        this.rho = rho;
        setReadOnly();
    }

    public static <V> RlSetUpQLearningBehaviour<V> make (
        BlocklyBlockProperties properties,
        BlocklyComment comment,
        float alpha,
        float gamma,
        float nu,
        float rho) {
        return new RlSetUpQLearningBehaviour<V>(BlockTypeContainer.getByName("AI_RL_Q_LEARNER_CONFIG"), properties, comment, alpha, gamma, nu, rho);
    }

    public String toString() {
        return this.getClass().getSimpleName() + " [" + " alpha: " + alpha + " gamma: " + gamma + " nu: " + nu +  " rho: " + rho + " ]";
    }



    public static <V> Phrase<V> jaxbToAst(Block block, AbstractJaxb2Ast<V> helper) {
        List<Field> fields = helper.extractFields(block, (short) 4);

        float alpha = Float.parseFloat(helper.extractField(fields, BlocklyConstants.QLEARNING_ALPHA, null));
        float gamma = Float.parseFloat(helper.extractField(fields, BlocklyConstants.QLEARNING_GAMMA, null));
        float nu = Float.parseFloat(helper.extractField(fields, BlocklyConstants.QLEARNING_NU, null));
        float rho = Float.parseFloat(helper.extractField(fields, BlocklyConstants.QLEARNING_RHO, null));

        return RlSetUpQLearningBehaviour.make(helper.extractBlockProperties(block), helper.extractComment(block), alpha, gamma, nu, rho);
    }



    @Override protected V acceptImpl(IVisitor<V> visitor) {
        return null;
    }

    @Override public Block astToBlock() {
        return null;
    }
}
